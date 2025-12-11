<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with('parent')->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        $categories = $query->paginate(10);

        $categories->getCollection()->transform(function ($cat) {
            $cat->icon_url = $cat->icon_path ? request()->root() . '/storage/' . $cat->icon_path : null;
            return $cat;
        });

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'status' => 'boolean',
            'order' => 'integer',
            'icon_type' => 'in:image,icon',
            'icon_name' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['icon_type'] = $request->input('icon_type', 'image');
        $validated['icon_name'] = $request->input('icon_name');

        \Illuminate\Support\Facades\Log::info('Category Store Request Data:', $request->all());
        \Illuminate\Support\Facades\Log::info('Category Store Files:', $request->allFiles());

        // Handle icon upload if present
        if ($request->hasFile('icon')) {
            \Illuminate\Support\Facades\Log::info('Icon file received: ' . $request->file('icon')->getClientOriginalName());
            $iconPath = $request->file('icon')->store('category-icons', 'public');
            $validated['icon_path'] = $iconPath;
            $validated['image'] = $iconPath; // Save to legacy image column as well
            $validated['icon_type'] = 'image'; // Force type to image if file uploaded
        } else {
            \Illuminate\Support\Facades\Log::info('No icon file received in request');
        }

        $category = Category::create($validated);

        // Append full URL for icon
        $category->icon_url = $category->icon_path ? url('storage/' . $category->icon_path) : null;

        return response()->json(['data' => $category], 201);
    }

    public function show($id)
    {
        $category = Category::with(['parent', 'children'])->findOrFail($id);
        $category->icon_url = $category->icon_path ? request()->root() . '/storage/' . $category->icon_path : null;
        return response()->json(['data' => $category]);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'status' => 'boolean',
            'order' => 'integer',
            'icon_type' => 'required|in:image,icon',
            'icon_name' => 'nullable|string',
            'remove_image' => 'boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle image removal
        if ($request->boolean('remove_image')) {
            if ($category->icon_path && Storage::disk('public')->exists($category->icon_path)) {
                Storage::disk('public')->delete($category->icon_path);
            }
            $validated['icon_path'] = null;
        }

        \Illuminate\Support\Facades\Log::info('Category Update Request Data:', $request->all());
        \Illuminate\Support\Facades\Log::info('Category Update Files:', $request->allFiles());

        // Handle icon upload if present
        if ($request->hasFile('icon')) {
            // Delete old icon if exists
            if ($category->icon_path && Storage::disk('public')->exists($category->icon_path)) {
                Storage::disk('public')->delete($category->icon_path);
            }
            $iconPath = $request->file('icon')->store('category-icons', 'public');
            $validated['icon_path'] = $iconPath;
            $validated['image'] = $iconPath; // Save to legacy image column as well
            $validated['icon_type'] = 'image';
        } else {
            \Illuminate\Support\Facades\Log::info('No icon file received in update request');
        }

        $category->update($validated);

        // Append full URL for icon
        $category->icon_url = $category->icon_path ? url('storage/' . $category->icon_path) : null;

        return response()->json(['data' => $category]);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Check if category has products
        if ($category->products()->count() > 0) {
            return response()->json(['message' => 'Cannot delete category with products'], 400);
        }

        // Delete icon file if exists
        if ($category->icon_path && Storage::disk('public')->exists($category->icon_path)) {
            Storage::disk('public')->delete($category->icon_path);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
