<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json([
                'products' => [],
                'orders' => [],
                'users' => [],
                'categories' => []
            ]);
        }

        $products = Product::where('name', 'like', "%{$query}%")
            ->orWhere('sku', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'sku', 'price', 'image_url']); // Select specific fields

        $orders = Order::where('id', 'like', "%{$query}%")
            ->orWhereHas('user', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->with('user:id,name,email')
            ->limit(5)
            ->get();

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'email', 'role']);

        $categories = Category::where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'slug']);

        return response()->json([
            'products' => $products,
            'orders' => $orders,
            'users' => $users,
            'categories' => $categories
        ]);
    }
}
