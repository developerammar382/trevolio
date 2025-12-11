<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product; // Added for the products relationship

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'status',
        'order',
        'parent_id',
        'icon_path',
        'icon_type',
        'icon_name',
    ];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
