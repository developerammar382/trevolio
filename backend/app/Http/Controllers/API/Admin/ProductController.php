<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%");
        }

        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status === 'active' ? 1 : 0;
            $query->where('is_active', $status);
        }

        $products = $query->paginate(10);
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'stock_quantity' => 'required|integer|min:0',
            'sku' => 'required|string|unique:products,sku',
            'images' => 'nullable|array',
            'images.*' => 'image|max:2048', // Validate each image
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'variants' => 'nullable|array',
            'variants.*.name' => 'required|string',
            'variants.*.type' => 'nullable|string|in:color,size,other',
            'variants.*.options' => 'required|array',
        ]);

        $data = $request->except('images');
        $data['slug'] = Str::slug($request->name);

        // Handle Multiple Image Uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $data['images'] = $imagePaths;

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'string|max:255',
            'price' => 'numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'category_id' => 'exists:categories,id',
            'stock_quantity' => 'integer|min:0',
            'sku' => 'string|unique:products,sku,' . $id,
            'images' => 'nullable|array',
            'images.*' => 'image|max:2048',
            'existing_images' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'variants' => 'nullable|array',
            'variants.*.name' => 'required|string',
            'variants.*.type' => 'nullable|string|in:color,size,other',
            'variants.*.options' => 'required|array',
        ]);

        $data = $request->except(['images', 'existing_images']);
        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name);
        }

        // Handle Images
        $currentImages = $request->input('existing_images', []);

        // Ensure currentImages is an array (it might come as null if empty)
        if (!is_array($currentImages)) {
            $currentImages = [];
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $currentImages[] = '/storage/' . $path;
            }
        }

        $data['images'] = $currentImages;

        $product->update($data);

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
