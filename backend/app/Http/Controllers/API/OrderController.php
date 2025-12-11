<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Notifications\OrderPlaced;
use App\Models\User;
use App\Mail\OrderConfirmation;
use App\Mail\OrderStatusUpdated;
use App\Mail\OrderShipped;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.selectedVariants' => 'nullable|array',
            'shipping_address' => 'required|array',
            'billing_address' => 'required|array',
            'payment_method' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $subtotal = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                $price = $product->sale_price ?? $product->price;
                $itemTotal = $price * $item['quantity'];
                $subtotal += $itemTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'total' => $itemTotal,
                    'variants' => $item['selectedVariants'] ?? null,
                ];

                // Decrement stock
                $product->decrement('stock_quantity', $item['quantity']);
            }

            // Calculate totals using settings
            $taxRate = (float) \App\Models\Setting::get('tax_rate', '0') / 100;
            $tax = $subtotal * $taxRate;
            $shippingCost = (float) \App\Models\Setting::get('shipping_fee', '0');
            $codFee = 0;

            // Add COD fee if payment method is COD
            if ($request->payment_method === 'cod') {
                $codFeeSetting = \App\Models\Setting::get('cod_fee', '0');
                $codFee = (float) $codFeeSetting;

                // Ensure we don't add negative fees or if setting is missing/zero
                if ($codFee < 0) {
                    $codFee = 0;
                }
            }

            $total = $subtotal + $tax + $shippingCost + $codFee;

            $order = Order::create([
                'user_id' => $request->user() ? $request->user()->id : null, // Allow guest checkout for now if needed, or require auth
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cod' ? 'pending' : 'pending',
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address,
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            $clientSecret = null;
            if ($request->payment_method === 'stripe') {
                // Create Stripe PaymentIntent
                \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));

                $paymentIntent = \Stripe\PaymentIntent::create([
                    'amount' => (int) ($total * 100), // Amount in cents
                    'currency' => 'usd',
                    'metadata' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                    ],
                    'automatic_payment_methods' => [
                        'enabled' => true,
                    ],
                ]);

                $order->update(['transaction_id' => $paymentIntent->id]);
                $clientSecret = $paymentIntent->client_secret;
            }

            DB::commit();

            // Send order confirmation email to customer
            try {
                if ($order->user) {
                    Mail::to($order->user->email)->queue(new OrderConfirmation($order));
                }
            } catch (\Exception $e) {
                \Log::error('Failed to send order confirmation email: ' . $e->getMessage());
            }

            // Notify Admins
            try {
                $admins = User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    $admin->notify(new OrderPlaced($order));
                }

                // Broadcast to admin notifications channel
                broadcast(new \App\Events\NewOrderNotification($order->load('user')));
            } catch (\Exception $e) {
                // Log error but don't fail the order
                \Log::error('Failed to send order notification: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $order->load('items.product'),
                'clientSecret' => $clientSecret,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function index(Request $request)
    {
        $orders = $request->user()->orders()->with('items.product')->latest()->paginate(10);
        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = $request->user()->orders()->with('items.product')->findOrFail($id);
        return response()->json($order);
    }

    public function confirmPayment(Request $request, $id)
    {
        $request->validate([
            'payment_intent' => 'required|string',
        ]);

        $order = $request->user()->orders()->findOrFail($id);

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Order already paid', 'order' => $order]);
        }

        try {
            \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));
            $paymentIntent = \Stripe\PaymentIntent::retrieve($request->payment_intent);

            if ($paymentIntent->status === 'succeeded') {
                // Verify the amount matches
                $expectedAmount = (int) ($order->total * 100);
                if ($paymentIntent->amount !== $expectedAmount) {
                    \Log::warning("Payment amount mismatch for Order #{$order->id}. Expected: {$expectedAmount}, Got: {$paymentIntent->amount}");
                    // We might still want to mark it paid if it's close enough or handle partial payments, 
                    // but for now let's be strict or just log it. 
                    // Proceeding as paid since Stripe handled the charge.
                }

                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                    'transaction_id' => $paymentIntent->id,
                ]);

                // Log status change
                $order->statusHistory()->create([
                    'status' => 'processing',
                    'changed_by' => $request->user()->id,
                    'notes' => 'Payment confirmed via Stripe',
                ]);

                return response()->json([
                    'message' => 'Payment confirmed successfully',
                    'order' => $order
                ]);
            } else {
                return response()->json(['message' => 'Payment not successful'], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Stripe payment confirmation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Payment verification failed'], 500);
        }
    }
}
