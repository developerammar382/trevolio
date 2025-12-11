<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Category;
use App\Models\Review;
use App\Models\OrderItem;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'sale_price',
        'sku',
        'stock_quantity',
        'is_featured',
        'is_active',
        'images',
        'variants',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'images' => 'array',
        'variants' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if (empty($this->images)) {
            return null;
        }

        $images = $this->images;
        // If for some reason it's still a string (e.g. raw query), decode it
        if (is_string($images)) {
            $images = json_decode($images, true);
        }

        $imagePath = is_array($images) ? ($images[0] ?? null) : null;

        if (!$imagePath) {
            return null;
        }

        if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
            return $imagePath;
        }

        return url($imagePath);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
