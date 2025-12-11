<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Shipped</title>
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
            color: #059669;
            margin: 0;
            font-size: 24px;
        }

        .tracking-box {
            background-color: #f0fdf4;
            border: 2px solid #059669;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }

        .tracking-number {
            font-size: 24px;
            font-weight: 700;
            color: #059669;
            letter-spacing: 2px;
        }

        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #059669;
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
            <h1>🚚 Your Order Has Shipped!</h1>
        </div>

        <div style="margin: 30px 0;">
            <p>Hello {{ $order->user->name }},</p>
            <p>Great news! Your order <strong>#{{ $order->id }}</strong> has been shipped and is on its way to you.</p>

            @if($trackingNumber)
                <div class="tracking-box">
                    <p style="margin: 0 0 10px 0; font-weight: 600;">Tracking Number:</p>
                    <div class="tracking-number">{{ $trackingNumber }}</div>
                </div>
            @endif

            <p><strong>Shipping Address:</strong></p>
            <p>
                {{ $order->shipping_address['name'] ?? $order->user->name }}<br>
                {{ $order->shipping_address['address'] }}<br>
                {{ $order->shipping_address['city'] }}, {{ $order->shipping_address['state'] }}
                {{ $order->shipping_address['zip'] }}<br>
                {{ $order->shipping_address['country'] ?? 'USA' }}
            </p>

            <p>Your package should arrive within 3-5 business days. You can track your shipment using the tracking
                number above.</p>

            <div style="text-align: center;">
                <a href="{{ config('app.frontend_url') }}/dashboard/orders/{{ $order->id }}" class="button">
                    View Order Details
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