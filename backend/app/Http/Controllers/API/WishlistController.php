<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function index()
    {
        $wishlist = Auth::user()->wishlist()->with('product')->get();
        return response()->json($wishlist);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = Auth::user();
        $productId = $request->product_id;

        $exists = $user->wishlist()->where('product_id', $productId)->first();

        if ($exists) {
            $exists->delete();
            return response()->json(['message' => 'Removed from wishlist', 'added' => false]);
        } else {
            $user->wishlist()->create(['product_id' => $productId]);
            return response()->json(['message' => 'Added to wishlist', 'added' => true]);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = Auth::user();
        $productId = $request->product_id;

        $exists = $user->wishlist()->where('product_id', $productId)->first();

        if (!$exists) {
            $wishlist = $user->wishlist()->create(['product_id' => $productId]);
            return response()->json(['message' => 'Added to wishlist', 'added' => true, 'data' => $wishlist]);
        }

        return response()->json(['message' => 'Already in wishlist', 'added' => true, 'data' => $exists]);
    }

    public function destroy($id)
    {
        $wishlistItem = Auth::user()->wishlist()->findOrFail($id);
        $wishlistItem->delete();
        return response()->json(['message' => 'Removed from wishlist']);
    }

    public function check($productId)
    {
        $exists = Auth::user()->wishlist()->where('product_id', $productId)->exists();
        return response()->json(['in_wishlist' => $exists]);
    }
}
