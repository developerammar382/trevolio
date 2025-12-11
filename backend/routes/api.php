<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\WishlistController;
use App\Http\Controllers\API\BlogController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\CouponController;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\BannerController;
use App\Http\Controllers\API\AddressController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\SearchController;
use App\Http\Controllers\API\ChatController;
use App\Http\Controllers\API\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Payment Webhook
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/filter-metadata', [ProductController::class, 'filterMetadata']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/{slug}/recommendations', [ProductController::class, 'recommendations']);

Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
Route::get('/search/popular', [SearchController::class, 'popular']);
Route::get('/search/bestsellers', [SearchController::class, 'bestsellers']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/categories/{id}/products', [CategoryController::class, 'products']);
Route::get('/categories/{slug}/subcategories', [CategoryController::class, 'subcategories']);

Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{slug}', [BlogController::class, 'show']);

Route::get('/banners', [BannerController::class, 'index']);

Route::post('/coupons/validate', [CouponController::class, 'validate']);
Route::get('/settings', [SettingController::class, 'getAllSettings']);
Route::get('/settings/public', [SettingController::class, 'getPublicSettings']);

// Reviews

Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);
Route::post('/reviews/{id}/helpful', [ReviewController::class, 'markHelpful']);
Route::post('/reviews/{id}/not-helpful', [ReviewController::class, 'markNotHelpful']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // Broadcasting Authentication
    Route::post('/broadcasting/auth', function (Request $request) {
        return \Illuminate\Support\Facades\Broadcast::auth($request);
    });

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // User Profile
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // Addresses
    Route::apiResource('addresses', AddressController::class);
    Route::put('/addresses/{address}/default', [AddressController::class, 'setDefault']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::get('/wishlist/check/{productId}', [WishlistController::class, 'check']);

    // Orders
    Route::post('/orders/{id}/confirm-payment', [OrderController::class, 'confirmPayment']);
    Route::apiResource('orders', OrderController::class)->only(['index', 'show', 'store']);

    // Wishlist
    Route::apiResource('wishlist', WishlistController::class)->only(['index', 'store', 'destroy']);

    // Chat
    Route::get('/chat/conversation', [ChatController::class, 'getConversation']);
    Route::post('/chat/messages', [ChatController::class, 'sendMessage']);
    Route::post('/chat/typing', [ChatController::class, 'updateTyping']);
    Route::post('/chat/mark-read', [ChatController::class, 'markAsRead']);
    Route::get('/chat/unread-count', [ChatController::class, 'getUnreadCount']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/search', [Admin\SearchController::class, 'index']);
        Route::get('/dashboard/stats', [Admin\DashboardController::class, 'stats']);

        Route::apiResource('products', Admin\ProductController::class);
        Route::post('/categories/{id}', [Admin\CategoryController::class, 'update']); // Explicit POST for file upload support
        Route::apiResource('categories', Admin\CategoryController::class);
        Route::apiResource('banners', Admin\BannerController::class);
        Route::post('/banners/reorder', [Admin\BannerController::class, 'reorder']);

        // Settings
        Route::get('/settings', [Admin\SettingController::class, 'index']);
        Route::post('/settings', [Admin\SettingController::class, 'update']);
        Route::put('/settings/{key}', [Admin\SettingController::class, 'updateSingle']);
        Route::post('/settings/logo', [Admin\SettingController::class, 'uploadLogo']);
        Route::post('/settings/footer-logo', [Admin\SettingController::class, 'uploadFooterLogo']);

        Route::apiResource('orders', Admin\OrderController::class)->only(['index', 'show']);
        Route::apiResource('users', Admin\UserController::class)->only(['index', 'show', 'destroy']);
        Route::match(['put', 'patch'], '/orders/{id}/status', [Admin\OrderController::class, 'updateStatus']);
        Route::match(['put', 'patch'], '/orders/{id}/payment-status', [Admin\OrderController::class, 'updatePaymentStatus']);
        Route::post('/orders/{id}/refund', [Admin\OrderController::class, 'requestRefund']);
        Route::post('/orders/{id}/process-refund', [Admin\OrderController::class, 'processRefund']);

        // Notifications
        Route::get('/notifications', [Admin\NotificationController::class, 'index']);
        Route::get('/notifications/stats', [Admin\NotificationController::class, 'getStats']);
        Route::get('/notifications/recent', [Admin\NotificationController::class, 'getRecent']);
        Route::post('/notifications/{id}/read', [Admin\NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [Admin\NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [Admin\NotificationController::class, 'destroy']);
        Route::post('/notifications/check-low-stock', [Admin\NotificationController::class, 'checkLowStock']);
        Route::post('/notifications/check-pending-orders', [Admin\NotificationController::class, 'checkPendingOrders']);
        Route::post('/notifications/check-all', [Admin\NotificationController::class, 'checkAll']);

        // Invoices
        Route::get('/orders/{id}/invoice', [Admin\InvoiceController::class, 'generate']);
        Route::get('/orders/{id}/invoice/view', [Admin\InvoiceController::class, 'view']);

        // Coupons
        Route::apiResource('coupons', Admin\CouponController::class);
        Route::post('/coupons/{id}/toggle-active', [Admin\CouponController::class, 'toggleActive']);

        // Reviews
        Route::get('/reviews', [Admin\ReviewController::class, 'index']);
        Route::patch('/reviews/{id}/status', [Admin\ReviewController::class, 'updateStatus']);
        Route::delete('/reviews/{id}', [Admin\ReviewController::class, 'destroy']);

        // Popular Searches
        Route::get('/popular-searches', [Admin\PopularSearchController::class, 'index']);
        Route::post('/popular-searches', [Admin\PopularSearchController::class, 'store']);
        Route::delete('/popular-searches/{id}', [Admin\PopularSearchController::class, 'destroy']);

        // Chat
        Route::get('/chat/conversations', [Admin\ChatController::class, 'index']);
        Route::get('/chat/conversations/{id}', [Admin\ChatController::class, 'show']);
        Route::post('/chat/messages', [Admin\ChatController::class, 'sendMessage']);
        Route::post('/chat/conversations/{id}/assign', [Admin\ChatController::class, 'assign']);
        Route::post('/chat/conversations/{id}/close', [Admin\ChatController::class, 'close']);
        Route::post('/chat/typing', [Admin\ChatController::class, 'updateTyping']);
        Route::post('/chat/conversations/{id}/mark-read', [Admin\ChatController::class, 'markAsRead']);
        Route::get('/chat/stats', [Admin\ChatController::class, 'stats']);
    });
});
