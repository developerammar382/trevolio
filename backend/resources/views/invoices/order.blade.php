<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
        }

        .info-section {
            margin-bottom: 20px;
        }

        .info-section h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table th {
            background-color: #f5f5f5;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid #ddd;
        }

        table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
        }

        .text-right {
            text-align: right;
        }

        .totals {
            margin-top: 20px;
            float: right;
            width: 300px;
        }

        .totals table {
            margin: 0;
        }

        .totals table td {
            border: none;
            padding: 5px 10px;
        }

        .totals .grand-total {
            font-size: 16px;
            font-weight: bold;
            background-color: #f5f5f5;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>INVOICE</h1>
        <p>Invoice #{{ $order->order_number }}</p>
        <p>Date: {{ $order->created_at->format('F d, Y') }}</p>
    </div>

    <div class="info-section">
        <h3>Bill To:</h3>
        <p>
            <strong>{{ $order->user->name }}</strong><br>
            {{ $order->user->email }}<br>
            @if($order->billing_address)
                {{ $order->billing_address['address_line1'] ?? '' }}<br>
                @if(isset($order->billing_address['address_line2']))
                    {{ $order->billing_address['address_line2'] }}<br>
                @endif
                {{ $order->billing_address['city'] ?? '' }}, {{ $order->billing_address['state'] ?? '' }}
                {{ $order->billing_address['zip'] ?? '' }}<br>
                {{ $order->billing_address['country'] ?? '' }}
            @endif
        </p>
    </div>

    @if($order->shipping_address && $order->shipping_address != $order->billing_address)
        <div class="info-section">
            <h3>Ship To:</h3>
            <p>
                {{ $order->shipping_address['address_line1'] ?? '' }}<br>
                @if(isset($order->shipping_address['address_line2']))
                    {{ $order->shipping_address['address_line2'] }}<br>
                @endif
                {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }}
                {{ $order->shipping_address['zip'] ?? '' }}<br>
                {{ $order->shipping_address['country'] ?? '' }}
            </p>
        </div>
    @endif

    <div class="info-section">
        <h3>Order Details:</h3>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                    <tr>
                        <td>{{ $item->product->name }}</td>
                        <td class="text-right">{{ $item->quantity }}</td>
                        <td class="text-right">Rs. {{ number_format($item->price, 2) }}</td>
                        <td class="text-right">Rs. {{ number_format($item->quantity * $item->price, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">Rs. {{ number_format($order->subtotal, 2) }}</td>
            </tr>
            @if($order->tax > 0)
                <tr>
                    <td>Tax:</td>
                    <td class="text-right">Rs. {{ number_format($order->tax, 2) }}</td>
                </tr>
            @endif
            @if($order->shipping_cost > 0)
                <tr>
                    <td>Shipping:</td>
                    <td class="text-right">Rs. {{ number_format($order->shipping_cost, 2) }}</td>
                </tr>
            @endif
            @if($order->discount > 0)
                <tr>
                    <td>Discount:</td>
                    <td class="text-right">-Rs. {{ number_format($order->discount, 2) }}</td>
                </tr>
            @endif
            <tr class="grand-total">
                <td><strong>Total:</strong></td>
                <td class="text-right"><strong>Rs. {{ number_format($order->total, 2) }}</strong></td>
            </tr>
        </table>
    </div>

    <div style="clear: both;"></div>

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>Payment Method: {{ ucfirst($order->payment_method) }} | Status: {{ ucfirst($order->payment_status) }}</p>
    </div>
</body>

</html>