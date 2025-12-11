<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the admin
     */
    public function index(Request $request)
    {
        $query = $request->user()->notifications()->orderBy('created_at', 'desc');

        // Filter by type (stored in data['type'] or the type column)
        if ($request->has('type') && $request->type !== 'all') {
            // We'll assume our custom types are stored in the 'type' column or data
            // For now, let's filter by the 'type' column which usually holds the class name
            // But since we are manually creating them, we can use our custom types
            $query->where('type', $request->type);
        }

        // Filter by read status
        if ($request->has('is_read')) {
            if ($request->boolean('is_read')) {
                $query->whereNotNull('read_at');
            } else {
                $query->whereNull('read_at');
            }
        }

        $notifications = $query->paginate($request->get('per_page', 20));

        // Transform to match frontend expectation
        $notifications->getCollection()->transform(function ($notification) {
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? '',
                'data' => $notification->data,
                'is_read' => $notification->read_at !== null,
                'created_at' => $notification->created_at,
            ];
        });

        return response()->json($notifications);
    }

    /**
     * Get notification statistics
     */
    public function getStats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total' => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'by_type' => [
                'low_stock' => $user->unreadNotifications()->where('type', 'low_stock')->count(),
                'pending_delivery' => $user->unreadNotifications()->where('type', 'pending_delivery')->count(),
                'new_order' => $user->unreadNotifications()->where('type', 'new_order')->count(),
            ],
        ];

        return response()->json($stats);
    }

    /**
     * Get recent unread notifications
     */
    public function getRecent(Request $request)
    {
        $query = $request->user()->unreadNotifications();

        if ($request->has('group')) {
            if ($request->group === 'orders') {
                $query->where('type', 'App\Notifications\OrderPlaced');
            } elseif ($request->group === 'alerts') {
                $query->whereIn('type', ['low_stock', 'pending_delivery']);
            }
        }

        $notifications = $query->limit(10)
            ->get()
            ->map(function ($notification) {
                // Handle different notification structures
                if ($notification->type === 'App\Notifications\OrderPlaced') {
                    return [
                        'id' => $notification->id,
                        'type' => 'new_order', // Normalize type for frontend
                        'title' => 'New Order',
                        'message' => $notification->data['message'] ?? 'New order placed',
                        'data' => $notification->data,
                        'is_read' => false,
                        'created_at' => $notification->created_at,
                    ];
                }

                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->data['title'] ?? 'Notification',
                    'message' => $notification->data['message'] ?? '',
                    'data' => $notification->data,
                    'is_read' => false,
                    'created_at' => $notification->created_at,
                ];
            });

        return response()->json($notifications);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'All notifications marked as read'
        ]);
    }

    /**
     * Delete notification
     */
    public function destroy(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully'
        ]);
    }

    /**
     * Check for low stock products and create notifications
     */
    public function checkLowStock()
    {
        $lowStockProducts = Product::whereRaw('stock_quantity <= stock_threshold')
            ->get();

        $created = 0;
        $admins = User::where('role', 'admin')->get();

        foreach ($lowStockProducts as $product) {
            foreach ($admins as $admin) {
                // Check if notification already exists for this product
                $exists = $admin->unreadNotifications()
                    ->where('type', 'low_stock')
                    ->where('data->product_id', $product->id)
                    ->exists();

                if (!$exists) {
                    $admin->notify(new \App\Notifications\AdminAlert(
                        'low_stock',
                        'Low Stock Alert',
                        "{$product->name} is running low (only {$product->stock_quantity} left)",
                        [
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'current_stock' => $product->stock_quantity,
                            'threshold' => $product->stock_threshold,
                        ]
                    ));
                    $created++;
                }
            }
        }

        return response()->json([
            'message' => "Checked low stock products",
            'low_stock_count' => $lowStockProducts->count(),
            'notifications_created' => $created
        ]);
    }

    /**
     * Check for orders pending delivery and create notifications
     */
    public function checkPendingOrders()
    {
        // Get orders in 'processing' status for more than 24 hours
        $pendingOrders = Order::where('status', 'processing')
            ->where('created_at', '<', Carbon::now()->subHours(24))
            ->get();

        $created = 0;
        $admins = User::where('role', 'admin')->get();

        foreach ($pendingOrders as $order) {
            foreach ($admins as $admin) {
                // Check if notification already exists for this order
                $exists = $admin->unreadNotifications()
                    ->where('type', 'pending_delivery')
                    ->where('data->order_id', $order->id)
                    ->exists();

                if (!$exists) {
                    $hoursPending = Carbon::parse($order->created_at)->diffInHours(Carbon::now());

                    $admin->notify(new \App\Notifications\AdminAlert(
                        'pending_delivery',
                        'Order Pending Delivery',
                        "Order #{$order->order_number} has been processing for {$hoursPending} hours",
                        [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'hours_pending' => $hoursPending,
                            'customer_name' => $order->user->name ?? $order->email,
                        ]
                    ));
                    $created++;
                }
            }
        }

        return response()->json([
            'message' => "Checked pending orders",
            'pending_orders_count' => $pendingOrders->count(),
            'notifications_created' => $created
        ]);
    }

    /**
     * Run all notification checks
     */
    public function checkAll()
    {
        $lowStockResult = $this->checkLowStock();
        $pendingOrdersResult = $this->checkPendingOrders();

        return response()->json([
            'message' => 'All checks completed',
            'low_stock' => $lowStockResult->getData(),
            'pending_orders' => $pendingOrdersResult->getData(),
        ]);
    }
}
