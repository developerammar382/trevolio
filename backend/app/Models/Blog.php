<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User; // Added this line for the User relationship

class Blog extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'content',
        'image',
        'is_published',
        'published_at',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
