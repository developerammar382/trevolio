<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_discount',
        'usage_limit',
        'used_count',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function isValid($orderTotal = 0)
    {
        // Check if active
        if (!$this->is_active) {
            return false;
        }

        // Check usage limit
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
            return false;
        }

        // Check date validity
        $now = now();
        if ($this->valid_from && $now->lt($this->valid_from)) {
            return false;
        }
        if ($this->valid_until && $now->gt($this->valid_until)) {
            return false;
        }

        // Check minimum order amount
        if ($this->min_order_amount && $orderTotal < $this->min_order_amount) {
            return false;
        }

        return true;
    }

    public function calculateDiscount($orderTotal)
    {
        if ($this->type === 'percentage') {
            $discount = ($orderTotal * $this->value) / 100;

            // Apply max discount if set
            if ($this->max_discount && $discount > $this->max_discount) {
                $discount = $this->max_discount;
            }

            return $discount;
        }

        // Fixed discount
        return min($this->value, $orderTotal); // Don't discount more than order total
    }
}
