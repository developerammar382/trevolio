<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'comment',
        'status',
        'helpful_votes',
        'images',
        'is_verified_purchase',
        'helpful_count',
        'not_helpful_count',
    ];

    protected $casts = [
        'images' => 'array',
        'is_verified_purchase' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
