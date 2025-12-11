<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
    /**
     * Get all banners (including inactive)
     */
    public function index()
    {
        $banners = Banner::ordered()->get();
        return response()->json($banners);
    }

    /**
     * Store a new banner
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string',
            'image' => 'nullable|image|max:2048', // Allow image file
            'image_url' => 'nullable|string|max:500', // Allow direct URL if needed, but prioritize image
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:500',
            'bg_color' => 'nullable|string|max:50',
            'position' => 'nullable|json',
            'show_gradient' => 'boolean',
            'gradient_type' => 'nullable|in:preset,custom',
            'gradient_start_color' => 'nullable|string|max:20',
            'gradient_end_color' => 'nullable|string|max:20',
            'gradient_direction' => 'nullable|string|max:20',
            'order_index' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except('image');

        // Handle position - decode JSON if it's a string
        if (isset($data['position']) && is_string($data['position'])) {
            $data['position'] = json_decode($data['position'], true);
        }

        // Handle Image Upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $data['image_url'] = url('storage/' . $path);
        }

        $banner = Banner::create($data);

        return response()->json([
            'message' => 'Banner created successfully',
            'banner' => $banner
        ], 201);
    }

    /**
     * Update an existing banner
     */
    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'subtitle' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|string|max:500',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:500',
            'bg_color' => 'nullable|string|max:50',
            'position' => 'nullable|json',
            'show_gradient' => 'boolean',
            'gradient_type' => 'nullable|in:preset,custom',
            'gradient_start_color' => 'nullable|string|max:20',
            'gradient_end_color' => 'nullable|string|max:20',
            'gradient_direction' => 'nullable|string|max:20',
            'order_index' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except('image');

        // Handle position - decode JSON if it's a string
        if (isset($data['position']) && is_string($data['position'])) {
            $data['position'] = json_decode($data['position'], true);
        }

        // Handle Image Upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $data['image_url'] = url('storage/' . $path);
        }

        $banner->update($data);

        return response()->json([
            'message' => 'Banner updated successfully',
            'banner' => $banner
        ]);
    }

    /**
     * Delete a banner
     */
    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return response()->json([
            'message' => 'Banner deleted successfully'
        ]);
    }

    /**
     * Reorder banners
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'banners' => 'required|array',
            'banners.*.id' => 'required|exists:banners,id',
            'banners.*.order_index' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->banners as $bannerData) {
            Banner::where('id', $bannerData['id'])
                ->update(['order_index' => $bannerData['order_index']]);
        }

        return response()->json([
            'message' => 'Banners reordered successfully'
        ]);
    }
}
