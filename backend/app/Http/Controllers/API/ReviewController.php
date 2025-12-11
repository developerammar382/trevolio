<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Order;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // 5MB max per image
        ]);

        // Check if user has purchased this product
        $hasPurchased = Order::where('user_id', Auth::id())
            ->whereHas('items', function ($query) use ($request) {
                $query->where('product_id', $request->product_id);
            })
            ->where('status', 'delivered')
            ->exists();

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('reviews', 'public');
                $imagePaths[] = $path;
            }
        }

        $review = Review::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'images' => $imagePaths,
            'is_verified_purchase' => $hasPurchased,
            'status' => 'pending', // Require admin approval
        ]);

        $review->load('user:id,name');

        return response()->json(['message' => 'Review submitted successfully', 'data' => $review]);
    }

    public function index($productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->where('status', 'approved')
            ->with('user:id,name')
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }

    public function markHelpful(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $review->increment('helpful_count');

        return response()->json(['message' => 'Thank you for your feedback', 'helpful_count' => $review->helpful_count]);
    }

    public function markNotHelpful(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $review->increment('not_helpful_count');

        return response()->json(['message' => 'Thank you for your feedback', 'not_helpful_count' => $review->not_helpful_count]);
    }
}
