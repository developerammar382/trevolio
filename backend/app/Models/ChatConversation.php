<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatConversation extends Model
{
    protected $fillable = [
        'user_id',
        'admin_id',
        'status',
        'last_message_at',
        'user_last_seen_at',
        'admin_last_seen_at',
        'user_typing',
        'admin_typing',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'user_last_seen_at' => 'datetime',
        'admin_last_seen_at' => 'datetime',
        'user_typing' => 'boolean',
        'admin_typing' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id');
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function getUnreadCountForUserAttribute()
    {
        return $this->messages()
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->count();
    }

    public function getUnreadCountForAdminAttribute()
    {
        return $this->messages()
            ->where('sender_type', 'customer')
            ->where('is_read', false)
            ->count();
    }
}
