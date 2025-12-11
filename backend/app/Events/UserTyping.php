<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $conversationId,
        public string $userType, // 'customer' or 'admin'
        public bool $isTyping
    ) {
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('chat.' . $this->conversationId);
    }

    public function broadcastWith(): array
    {
        return [
            'userType' => $this->userType,
            'isTyping' => $this->isTyping,
        ];
    }
}
