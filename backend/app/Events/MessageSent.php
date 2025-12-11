<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ChatMessage $message,
        public int $conversationId
    ) {
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('chat.' . $this->conversationId);
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->message->load('sender:id,name'),
        ];
    }
}
