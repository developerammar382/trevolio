<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Updated</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }

        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }

        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin: 10px 0;
        }

        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }

        .status-processing {
            background-color: #dbeafe;
            color: #1e40af;
        }

        .status-shipped {
            background-color: #d1fae5;
            color: #065f46;
        }

        .status-delivered {
            background-color: #d1fae5;
            color: #065f46;
        }

        .status-cancelled {
            background-color: #fee2e2;
            color: #991b1b;
        }

        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>📦 Order Status Updated</h1>
        </div>

        <div style="margin: 30px 0; text-align: center;">
            <p>Hello {{ $order->user->name }},</p>
            <p>Your order <strong>#{{ $order->id }}</strong> status has been updated.</p>

            <div style="margin: 20px 0;">
                <span class="status-badge status-{{ $order->order_status }}">
                    {{ ucfirst(str_replace('_', ' ', $order->order_status)) }}
                </span>
            </div>

            @if($order->order_status === 'processing')
                <p>We're preparing your order for shipment. You'll receive another email when it ships.</p>
            @elseif($order->order_status === 'shipped')
                <p>Great news! Your order has been shipped and is on its way to you.</p>
            @elseif($order->order_status === 'delivered')
                <p>Your order has been delivered! We hope you enjoy your purchase.</p>
            @elseif($order->order_status === 'cancelled')
                <p>Your order has been cancelled. If you didn't request this, please contact us immediately.</p>
            @endif

            <div style="text-align: center;">
                <a href="{{ config('app.frontend_url') }}/dashboard/orders/{{ $order->id }}" class="button">
                    Track Your Order
                </a>
            </div>
        </div>

        <div class="footer">
            <p>If you have any questions, please contact us at {{ config('mail.from.address') }}</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>

</html>