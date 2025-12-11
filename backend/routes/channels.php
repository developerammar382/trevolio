<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\ChatConversation;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Customer can only access their own conversation, admin can access any
Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = ChatConversation::find($conversationId);
    return $conversation && (
        $conversation->user_id === $user->id ||
        $conversation->admin_id === $user->id ||
        $user->role === 'admin'
    );
});

// Only admins can access admin chat channel
Broadcast::channel('admin.chat', function ($user) {
    return $user->role === 'admin';
});

// Customer can only access their own notifications
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Only admins can access admin notifications
Broadcast::channel('admin.notifications', function ($user) {
    return $user->role === 'admin';
});
