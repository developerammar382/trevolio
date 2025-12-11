<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class AdminAlert extends Notification
{
    use Queueable;

    public $type;
    public $title;
    public $message;
    public $data;

    /**
     * Create a new notification instance.
     */
    public function __construct($type, $title, $message, $data = [])
    {
        $this->type = $type;
        $this->title = $title;
        $this->message = $message;
        $this->data = $data;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return array_merge($this->data, [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type, // Store type in data as well for easier access
        ]);
    }

    /**
     * Get the database type of the notification.
     */
    public function databaseType(object $notifiable): string
    {
        return $this->type; // Use our custom type string instead of class name
    }
}
