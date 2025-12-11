<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Events\ConversationUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    // Get or create conversation for authenticated user
    public function getConversation(Request $request)
    {
        $user = $request->user();

        $conversation = ChatConversation::forUser($user->id)
            ->whereIn('status', ['open', 'waiting'])
            ->with([
                'messages' => function ($query) {
                    $query->with('sender:id,name')->orderBy('created_at', 'asc');
                },
                'admin:id,name'
            ])
            ->first();

        if (!$conversation) {
            $conversation = ChatConversation::create([
                'user_id' => $user->id,
                'status' => 'waiting',
                'last_message_at' => now(),
            ]);
            $conversation->load(['messages', 'admin']);
        }

        return response()->json([
            'conversation' => $conversation,
            'unread_count' => $conversation->unread_count_for_user,
        ]);
    }

    // Send a message
    public function sendMessage(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:chat_conversations,id',
            'message' => 'nullable|string|max:1000',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm,mov|max:51200', // max 50MB
        ]);

        $user = $request->user();
        $conversation = ChatConversation::findOrFail($request->conversation_id);

        // Verify user owns this conversation
        if ($conversation->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $mediaUrl = null;
        $mediaType = null;

        // Handle file upload
        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $extension = $file->getClientOriginalExtension();

            // Determine media type
            $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $videoExtensions = ['mp4', 'webm', 'mov'];

            if (in_array(strtolower($extension), $imageExtensions)) {
                $mediaType = 'image';
            } elseif (in_array(strtolower($extension), $videoExtensions)) {
                $mediaType = 'video';
            }

            // Store file
            $path = $file->store('chat-media', 'public');
            $mediaUrl = \Storage::url($path);
        }

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'sender_type' => 'customer',
            'message' => $request->message ?? '',
            'media_url' => $mediaUrl,
            'media_type' => $mediaType,
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => now(),
            'user_typing' => false,
        ]);

        $message->load('sender:id,name');

        // Broadcast the message
        broadcast(new MessageSent($message, $conversation->id));

        // Broadcast conversation update to admin
        broadcast(new ConversationUpdated($conversation->fresh()));

        return response()->json([
            'message' => $message,
        ], 201);
    }

    // Update typing status
    public function updateTyping(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:chat_conversations,id',
            'typing' => 'required|boolean',
        ]);

        $user = $request->user();
        $conversation = ChatConversation::findOrFail($request->conversation_id);

        if ($conversation->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation->update([
            'user_typing' => $request->typing,
        ]);

        // Broadcast typing status
        broadcast(new UserTyping(
            $conversation->id,
            'customer',
            $request->typing
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    // Mark messages as read
    public function markAsRead(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:chat_conversations,id',
        ]);

        $user = $request->user();
        $conversation = ChatConversation::findOrFail($request->conversation_id);

        if ($conversation->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        ChatMessage::where('conversation_id', $conversation->id)
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $conversation->update([
            'user_last_seen_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    // Get unread count
    public function getUnreadCount(Request $request)
    {
        $user = $request->user();

        $conversation = ChatConversation::forUser($user->id)
            ->whereIn('status', ['open', 'waiting'])
            ->first();

        $unreadCount = 0;
        if ($conversation) {
            $unreadCount = $conversation->unread_count_for_user;
        }

        return response()->json([
            'unread_count' => $unreadCount,
        ]);
    }
}
