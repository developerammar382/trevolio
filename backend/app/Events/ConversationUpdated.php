<?php

namespace App\Events;

use App\Models\ChatConversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ChatConversation $conversation
    ) {
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('admin.chat');
    }

    public function broadcastWith(): array
    {
        return [
            'conversation' => $this->conversation->load(['user:id,name,email', 'admin:id,name']),
        ];
    }
}
