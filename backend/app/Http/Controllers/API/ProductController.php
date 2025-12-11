<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::where('is_active', true);

        // Filter by category (support both ID and slug)
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('category_slug')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category_slug);
            });
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sorting
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'popular':
                    // Assuming we have a way to track popularity, e.g., order count or views
                    // For now, just random or featured
                    $query->orderBy('is_featured', 'desc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->input('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::where('id', $id)
            ->orWhere('slug', $id)
            ->where('is_active', true)
            ->with(['category', 'reviews.user'])
            ->firstOrFail();

        return response()->json(['data' => $product]);
    }

    public function search(Request $request)
    {
        $request->validate(['q' => 'required|string|min:2']);
        $query = $request->input('q');

        $products = Product::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->paginate(12);

        return response()->json($products);
    }

    public function featured()
    {
        $products = Product::where('is_active', true)
            ->where('is_featured', true)
            ->take(8)
            ->get();

        return response()->json($products);
    }

    public function recommendations($slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $recommendations = Product::where('is_active', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get();

        return response()->json($recommendations);
    }

    public function filterMetadata()
    {
        $minPrice = Product::where('is_active', true)->min('price') ?? 0;
        $maxPrice = Product::where('is_active', true)->max('price') ?? 10000;

        return response()->json([
            'min_price' => (float) $minPrice,
            'max_price' => (float) $maxPrice,
        ]);
    }
}
