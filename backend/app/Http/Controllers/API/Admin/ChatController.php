<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Events\ConversationUpdated;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    // Get all conversations
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');

        $query = ChatConversation::with(['user:id,name,email', 'admin:id,name'])
            ->withCount([
                'messages as unread_count' => function ($q) {
                    $q->where('sender_type', 'customer')->where('is_read', false);
                }
            ])
            ->orderBy('last_message_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $conversations = $query->get();

        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    // Get specific conversation with messages
    public function show($id)
    {
        $conversation = ChatConversation::with([
            'user:id,name,email',
            'admin:id,name',
            'messages' => function ($query) {
                $query->with('sender:id,name')->orderBy('created_at', 'asc');
            }
        ])->findOrFail($id);

        return response()->json([
            'conversation' => $conversation,
        ]);
    }

    // Send message as admin
    public function sendMessage(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:chat_conversations,id',
            'message' => 'nullable|string|max:1000',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm,mov|max:51200', // max 50MB
        ]);

        $admin = $request->user();
        $conversation = ChatConversation::findOrFail($request->conversation_id);

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
            'sender_id' => $admin->id,
            'sender_type' => 'admin',
            'message' => $request->message ?? '',
            'media_url' => $mediaUrl,
            'media_type' => $mediaType,
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => now(),
            'admin_typing' => false,
            'status' => 'open', // Auto-assign when admin sends first message
            'admin_id' => $admin->id,
        ]);

        $message->load('sender:id,name');

        // Broadcast the message
        broadcast(new MessageSent($message, $conversation->id));

        // Broadcast conversation update to admin list
        broadcast(new ConversationUpdated($conversation->fresh()));

        return response()->json([
            'message' => $message,
        ], 201);
    }

    // Assign conversation to admin
    public function assign(Request $request, $id)
    {
        $admin = $request->user();
        $conversation = ChatConversation::findOrFail($id);

        $conversation->update([
            'admin_id' => $admin->id,
            'status' => 'open',
        ]);

        // Broadcast conversation update
        broadcast(new ConversationUpdated($conversation->fresh()));

        return response()->json([
            'conversation' => $conversation->load(['user:id,name,email', 'admin:id,name']),
        ]);
    }

    // Close conversation
    public function close($id)
    {
        $conversation = ChatConversation::findOrFail($id);

        $conversation->update([
            'status' => 'closed',
        ]);

        // Broadcast conversation update
        broadcast(new ConversationUpdated($conversation->fresh()));

        return response()->json([
            'conversation' => $conversation,
        ]);
    }

    // Update typing status
    public function updateTyping(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:chat_conversations,id',
            'typing' => 'required|boolean',
        ]);

        $conversation = ChatConversation::findOrFail($request->conversation_id);

        $conversation->update([
            'admin_typing' => $request->typing,
        ]);

        // Broadcast typing status
        broadcast(new UserTyping(
            $conversation->id,
            'admin',
            $request->typing
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    // Mark messages as read
    public function markAsRead(Request $request, $id)
    {
        $conversation = ChatConversation::findOrFail($id);

        ChatMessage::where('conversation_id', $conversation->id)
            ->where('sender_type', 'customer')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $conversation->update([
            'admin_last_seen_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    // Get chat statistics
    public function stats()
    {
        $stats = [
            'waiting' => ChatConversation::where('status', 'waiting')->count(),
            'open' => ChatConversation::where('status', 'open')->count(),
            'closed' => ChatConversation::where('status', 'closed')->count(),
            'total_unread' => ChatMessage::where('sender_type', 'customer')
                ->where('is_read', false)
                ->count(),
        ];

        return response()->json($stats);
    }
}
