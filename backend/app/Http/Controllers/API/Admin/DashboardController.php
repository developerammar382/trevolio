<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $totalUsers = User::count();
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');

        $recentOrders = Order::with('user')->latest()->take(5)->get();

        $lowStockProducts = Product::where('stock_quantity', '<', 10)->take(5)->get();

        // Sales Chart Data (Last 30 Days)
        $salesChart = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top Products
        $topProducts = Order::with('items.product') // Eager load items and products
            ->get()
            ->pluck('items')
            ->flatten()
            ->groupBy('product_id')
            ->map(function ($items) {
                $product = $items->first()->product;
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sales_count' => $items->sum('quantity'),
                    'revenue' => $items->sum('price') * $items->sum('quantity'),
                    'image_url' => $product->image_url
                ];
            })
            ->sortByDesc('sales_count')
            ->take(5)
            ->values();

        // Top Customers
        $topCustomers = Order::with('user')
            ->where('payment_status', 'paid')
            ->selectRaw('user_id, SUM(total) as total_spent, COUNT(id) as orders_count')
            ->groupBy('user_id')
            ->orderByDesc('total_spent')
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                    'total_spent' => $order->total_spent,
                    'orders_count' => $order->orders_count
                ];
            });

        return response()->json([
            'total_orders' => $totalOrders,
            'total_products' => $totalProducts,
            'total_users' => $totalUsers,
            'total_revenue' => $totalRevenue,
            'recent_orders' => $recentOrders,
            'low_stock_products' => $lowStockProducts,
            'sales_chart' => $salesChart,
            'top_products' => $topProducts,
            'top_customers' => $topCustomers
        ]);
    }
}
