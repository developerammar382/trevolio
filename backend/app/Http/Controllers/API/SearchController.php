<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PopularSearch;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function suggestions(Request $request)
    {
        $request->validate(['q' => 'required|string|min:1']);
        $query = $request->input('q');

        $products = Product::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhere('sku', 'like', "%{$query}%");
            })
            ->take(5)
            ->get(['id', 'name', 'price', 'sale_price', 'slug', 'images', 'category_id']);

        return response()->json($products);
    }

    public function popular()
    {
        $searches = PopularSearch::where('is_active', true)
            ->orderBy('count', 'desc')
            ->take(10)
            ->get();

        return response()->json($searches);
    }

    public function bestsellers()
    {
        // Get top selling products based on order items count
        $products = Product::where('is_active', true)
            ->withCount('orderItems')
            ->orderBy('order_items_count', 'desc')
            ->take(8)
            ->get();

        // If no sales yet, fallback to featured or latest
        if ($products->isEmpty() || $products->first()->order_items_count == 0) {
            $products = Product::where('is_active', true)
                ->where('is_featured', true)
                ->take(8)
                ->get();
        }

        return response()->json($products);
    }
}
