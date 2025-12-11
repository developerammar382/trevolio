<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::whereNull('parent_id')
            ->with('children')
            ->where('status', true)
            ->orderBy('order')
            ->get();

        return response()->json($categories);
    }

    public function show($id)
    {
        $category = Category::where('id', $id)
            ->orWhere('slug', $id)
            ->where('status', true)
            ->with(['children'])
            ->firstOrFail();

        return response()->json(['data' => $category]);
    }

    public function products($id)
    {
        $category = Category::where('id', $id)
            ->orWhere('slug', $id)
            ->where('status', true)
            ->firstOrFail();

        $products = $category->products()
            ->where('is_active', true)
            ->with(['category'])
            ->get();

        return response()->json(['data' => $products]);
    }

    public function subcategories($slug)
    {
        $category = Category::where('slug', $slug)
            ->where('status', true)
            ->firstOrFail();

        $subcategories = $category->children()
            ->where('status', true)
            ->orderBy('order')
            ->get();

        return response()->json($subcategories);
    }
}
