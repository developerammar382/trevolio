<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

use App\Models\Order;

class OrderPlaced extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database']; // Temporarily disabled 'mail' until SMTP is properly configured
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Order Placed')
            ->line('A new order has been placed.')
            ->line('Order Number: ' . $this->order->order_number)
            ->line('Total Amount: $' . $this->order->total)
            ->action('View Order', url('/admin/orders/' . $this->order->id))
            ->line('Please check the admin panel for more details.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'amount' => $this->order->total,
            'message' => 'New order placed: ' . $this->order->order_number,
        ];
    }
}
