<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function webhook(Request $request)
    {
        $payload = @file_get_contents('php://input');
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sig_header,
                $endpoint_secret
            );
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->handlePaymentSucceeded($paymentIntent);
                break;
            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                $this->handlePaymentFailed($paymentIntent);
                break;
            default:
                Log::info('Received unknown event type ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }

    protected function handlePaymentSucceeded($paymentIntent)
    {
        Log::info('Payment succeeded for Intent: ' . $paymentIntent->id);

        $order = Order::where('transaction_id', $paymentIntent->id)->first();

        if ($order) {
            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing', // Move to processing once paid
            ]);
            Log::info("Order #{$order->id} marked as paid.");
        } else {
            Log::error("Order not found for PaymentIntent: " . $paymentIntent->id);
        }
    }

    protected function handlePaymentFailed($paymentIntent)
    {
        Log::info('Payment failed for Intent: ' . $paymentIntent->id);

        $order = Order::where('transaction_id', $paymentIntent->id)->first();

        if ($order) {
            $order->update([
                'payment_status' => 'failed',
            ]);
            Log::info("Order #{$order->id} marked as payment failed.");
        }
    }
}
