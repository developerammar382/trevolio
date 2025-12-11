<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
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
            font-size: 28px;
        }

        .welcome-icon {
            font-size: 60px;
            margin: 20px 0;
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

        .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 30px 0;
        }

        .feature {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
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
            <div class="welcome-icon">👋</div>
            <h1>Welcome to {{ config('app.name') }}!</h1>
        </div>

        <div style="margin: 30px 0;">
            <p>Hello {{ $user->name }},</p>
            <p>Thank you for joining {{ config('app.name') }}! We're excited to have you as part of our community.</p>

            <div class="features">
                <div class="feature">
                    <div style="font-size: 30px; margin-bottom: 10px;">🛍️</div>
                    <strong>Shop Premium Products</strong>
                    <p style="font-size: 14px; color: #64748b;">Discover our curated collection</p>
                </div>
                <div class="feature">
                    <div style="font-size: 30px; margin-bottom: 10px;">🚚</div>
                    <strong>Fast Shipping</strong>
                    <p style="font-size: 14px; color: #64748b;">Free on orders over $100</p>
                </div>
                <div class="feature">
                    <div style="font-size: 30px; margin-bottom: 10px;">💰</div>
                    <strong>Exclusive Deals</strong>
                    <p style="font-size: 14px; color: #64748b;">Special offers for members</p>
                </div>
                <div class="feature">
                    <div style="font-size: 30px; margin-bottom: 10px;">🔒</div>
                    <strong>Secure Checkout</strong>
                    <p style="font-size: 14px; color: #64748b;">Safe and protected payments</p>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{ config('app.frontend_url') }}/products" class="button">
                    Start Shopping
                </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
                <strong>Need help getting started?</strong><br>
                Visit your <a href="{{ config('app.frontend_url') }}/dashboard">dashboard</a> to manage your account,
                track orders, and more.
            </p>
        </div>

        <div class="footer">
            <p>If you have any questions, we're here to help at {{ config('mail.from.address') }}</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>

</html>