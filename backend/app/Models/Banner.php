<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subtitle',
        'image_url',
        'button_text',
        'button_link',
        'bg_color',
        'position',
        'show_gradient',
        'gradient_type',
        'gradient_start_color',
        'gradient_end_color',
        'gradient_direction',
        'order_index',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_gradient' => 'boolean',
        'position' => 'array', // Cast JSON to array
        'order_index' => 'integer',
    ];

    /**
     * Scope to get only active banners
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by order_index
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index', 'asc');
    }
}
