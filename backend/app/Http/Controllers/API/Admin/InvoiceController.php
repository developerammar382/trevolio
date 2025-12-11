<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function generate($orderId)
    {
        try {
            $order = Order::with(['user', 'items.product'])->findOrFail($orderId);

            $pdf = Pdf::loadView('invoices.order', compact('order'));

            return $pdf->download('invoice-' . ($order->order_number ?? $order->id) . '.pdf');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Order not found'], 404);
        }
    }

    public function view($orderId)
    {
        try {
            $order = Order::with(['user', 'items.product'])->findOrFail($orderId);

            $pdf = Pdf::loadView('invoices.order', compact('order'));

            return $pdf->stream('invoice-' . ($order->order_number ?? $order->id) . '.pdf');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Order not found'], 404);
        }
    }
}
