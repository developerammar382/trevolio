<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderStatusUpdated as OrderStatusUpdatedMail;
use App\Mail\OrderShipped;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('user', 'items.product')->select('orders.*')->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('id', 'like', "%{$search}%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        $orders = $query->paginate(10);
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with('user', 'items.product', 'statusHistory.changedBy')->findOrFail($id);
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;
        $order->update(['status' => $request->status]);

        // Log status change
        $order->statusHistory()->create([
            'status' => $request->status,
            'changed_by' => auth()->id(),
            'notes' => $request->notes,
        ]);

        // Auto-update payment status for COD delivered orders
        if ($request->status === 'delivered' && $order->payment_method === 'cod' && $order->payment_status !== 'paid') {
            $order->update(['payment_status' => 'paid']);
        }

        // Send email notification to customer
        try {
            if ($order->user) {
                // Send specific email for shipped status
                if ($request->status === 'shipped') {
                    Mail::to($order->user->email)->queue(new OrderShipped($order));
                } else {
                    Mail::to($order->user->email)->queue(new OrderStatusUpdatedMail($order, $oldStatus));
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send order status email: ' . $e->getMessage());
        }

        // Notify user via notification system
        if ($order->user) {
            $order->user->notify(new OrderStatusUpdated($order));

            // Broadcast to user's private channel (ensure user is loaded)
            broadcast(new \App\Events\OrderStatusUpdated($order->load('user')));
        }

        return response()->json($order->load('statusHistory'));
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['payment_status' => $request->payment_status]);

        return response()->json($order);
    }

    public function requestRefund(Request $request, $id)
    {
        $request->validate([
            'refund_reason' => 'required|string|max:500',
            'refund_amount' => 'nullable|numeric|min:0',
        ]);

        $order = Order::findOrFail($id);

        // Check if order is eligible for refund
        if (!in_array($order->payment_status, ['paid'])) {
            return response()->json(['message' => 'Order is not eligible for refund'], 400);
        }

        if ($order->refund_status) {
            return response()->json(['message' => 'Refund already requested'], 400);
        }

        $order->update([
            'refund_status' => 'requested',
            'refund_reason' => $request->refund_reason,
            'refund_amount' => $request->refund_amount ?? $order->total,
            'refund_requested_at' => now(),
        ]);

        return response()->json([
            'message' => 'Refund requested successfully',
            'data' => $order
        ]);
    }

    public function processRefund(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'notes' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);

        if ($order->refund_status !== 'requested') {
            return response()->json(['message' => 'No pending refund request'], 400);
        }

        if ($request->action === 'approve') {
            $order->update([
                'refund_status' => 'approved',
                'payment_status' => 'refunded',
            ]);

            // Log status change
            $order->statusHistory()->create([
                'status' => 'refunded',
                'changed_by' => auth()->id(),
                'notes' => $request->notes ?? 'Refund approved',
            ]);

            $message = 'Refund approved successfully';
        } else {
            $order->update([
                'refund_status' => 'rejected',
            ]);

            $message = 'Refund rejected';
        }

        return response()->json([
            'message' => $message,
            'data' => $order
        ]);
    }
}
