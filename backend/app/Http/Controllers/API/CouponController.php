<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'order_total' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid coupon code'
            ], 404);
        }

        if (!$coupon->isValid($request->order_total)) {
            $message = 'Coupon is not valid';

            if (!$coupon->is_active) {
                $message = 'This coupon is no longer active';
            } elseif ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
                $message = 'This coupon has reached its usage limit';
            } elseif ($coupon->valid_until && now()->gt($coupon->valid_until)) {
                $message = 'This coupon has expired';
            } elseif ($coupon->min_order_amount && $request->order_total < $coupon->min_order_amount) {
                $message = 'Minimum order amount of Rs. ' . number_format((float) $coupon->min_order_amount, 2) . ' required';
            }

            return response()->json([
                'valid' => false,
                'message' => $message
            ], 400);
        }

        $discount = $coupon->calculateDiscount($request->order_total);

        return response()->json([
            'valid' => true,
            'message' => 'Coupon applied successfully',
            'data' => [
                'coupon_id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'discount' => $discount,
            ]
        ]);
    }
}
