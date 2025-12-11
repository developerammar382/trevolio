<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
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

        .order-details {
            margin: 30px 0;
        }

        .order-number {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .items-table th {
            background-color: #f8fafc;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
        }

        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }

        .total-row {
            font-weight: 600;
            font-size: 18px;
            background-color: #f8fafc;
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
            <h1>✅ Order Confirmed!</h1>
            <p>Thank you for your order, {{ $order->user->name }}!</p>
        </div>

        <div class="order-details">
            <div class="order-number">
                <strong>Order Number:</strong> #{{ $order->id }}<br>
                <strong>Order Date:</strong> {{ $order->created_at->format('F d, Y') }}<br>
                <strong>Payment Method:</strong> {{ ucfirst($order->payment_method) }}
                </p>
            </div>

            <h2>Order Items</h2>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                        <tr>
                            <td>{{ $item->product_name }}</td>
                            <td>{{ $item->quantity }}</td>
                            <td>${{ number_format($item->price, 2) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="2">Total</td>
                        <td>${{ number_format($order->total_amount, 2) }}</td>
                    </tr>
                </tbody>
            </table>

            <h2>Shipping Address</h2>
            <p>
                {{ $order->shipping_address['name'] ?? $order->user->name }}<br>
                {{ $order->shipping_address['address'] }}<br>
                {{ $order->shipping_address['city'] }}, {{ $order->shipping_address['state'] }}
                {{ $order->shipping_address['zip'] }}<br>
                {{ $order->shipping_address['country'] ?? 'USA' }}
            </p>

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