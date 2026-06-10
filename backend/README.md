<div align="center">

# ✦ Trevolio Backend API & Socket Server

**A robust REST API, background task processor, and WebSocket server — built on Laravel 12, Sanctum, and Laravel Reverb.**

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![Sanctum](https://img.shields.io/badge/Sanctum-Auth-e0f2fe?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com/docs/12.x/sanctum)
[![Laravel Reverb](https://img.shields.io/badge/Reverb-WebSockets-f43f5e?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com/docs/12.x/reverb)
[![Stripe](https://img.shields.io/badge/Stripe-Integration-008CFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-777BB4?style=flat-square&logo=php&logoColor=white)](https://php.net)

<br />

**[← Back to Root README](../README.md) • [→ Frontend Guide](../frontend/README.md) • [→ Database Setup Guide](../BACKEND_SETUP.md)**

<br />

---

</div>

## ⚙️ Core Architecture

The backend of **Trevolio** provides a high-security, fast-response API layer and WebSocket server. Architected with Laravel 12, it utilizes Sanctum for session and token tokenization, Laravel Reverb for lightweight real-time communication, database queues for offline payment and notification updates, and Stripe elements for financial transactions.

---

## 🛠️ Key Components & Capabilities

### 🔐 Authentication & Session Security (Sanctum)
- Secure session-based cookie cookies for web and state-based authorization tokens for API routes.
- Separated user and admin controller scopes.

### 💬 Real-Time WebSockets (Laravel Reverb)
- Built-in WebSocket server without external third-party dependencies (like Pusher or Soketi).
- Synchronizes client-to-admin message feeds, user typing states, and notifications instantly.

### 💳 Payments & Invoicing (Stripe & Dompdf)
- Validates purchases, computes coupon codes, handles Stripe webhooks, and processes refund logic.
- Dynamically compiles purchases into beautiful PDF invoices using `barryvdh/laravel-dompdf`.

### 🔄 Asynchronous Operations (Queues)
- Offloads intensive computations (like generating invoices or emailing receipts) to database queue tables.

---

## 📂 Command Helper Scripts

The project includes specialized Unix shell scripts in the `backend/` directory to manage services:

| Script | Purpose |
| :--- | :--- |
| `start-reverb.sh` | Boots the Laravel Reverb WebSocket server daemon on port `8080` |
| `start-queue.sh` | Starts a background queue listener to execute database jobs |
| `stop-queue.sh` | Safely terminates all active background queue listener processes |
| `fix-env.sh` | Validates and fixes environment variable formats |

---

## ⚙️ Environment Configuration

Create a `.env` file in the `backend/` directory. Be sure to configure the Stripe credentials and Reverb host matching your frontend settings:

```env
APP_NAME="Trevolio E-Commerce"
APP_ENV=local
APP_KEY=base64:...generateThisKey
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database selection (Supports sqlite or mysql)
DB_CONNECTION=sqlite

# Stripe Billing Configuration
STRIPE_KEY=pk_test_51RCI...
STRIPE_SECRET=sk_test_51RCI...
STRIPE_WEBHOOK_SECRET=whsec_...

# Laravel Reverb Socket Settings
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=a3c2a5ed6fc0f227
REVERB_APP_KEY=54beebf3104f217582d2dfb39545fd28
REVERB_APP_SECRET=f77436dd30bac7441d7442eb2fc50bd0
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

---

## 🚀 Getting Started

Ensure PHP 8.2+ and Composer are installed.

1. Install Composer dependencies:
   ```bash
   composer install
   ```

2. Initialize your database (Defaults to SQLite):
   ```bash
   touch database/database.sqlite
   php artisan migrate --seed
   ```

3. Run the primary Dev ecosystem (starts HTTP server, Queue listener, Vite asset compiler, and CLI log streamer concurrently):
   ```bash
   composer dev
   ```

4. Start the WebSockets server (to enable real-time chat & notifications):
   ```bash
   php artisan reverb:start --host=0.0.0.0 --port=8080
   ```

---

## 📡 Running WebSockets & Queue Workers

For full retail storefront functionality, both the WebSockets server (acting as your local Pusher server) and the asynchronous Queue Worker must be running.

### Option A: Using Helper Scripts (Run as Background Daemons)
You can start these tasks as background services using the pre-configured scripts:
```bash
# Start WebSockets (Laravel Reverb)
./start-reverb.sh

# Start the background Queue Worker
./start-queue.sh

# Stop the background Queue Worker when done
./stop-queue.sh
```

### Option B: Running Manually (Foreground Processes)
Open new terminal tabs to run the processes directly and view live trace logs:
```bash
# Terminal Tab 1: Laravel Reverb (WebSocket / Pusher protocol server)
php artisan reverb:start --host=0.0.0.0 --port=8080

# Terminal Tab 2: Queue Worker (processes email queues, stripe confirmations, etc.)
php artisan queue:work --tries=3 --timeout=60
```

---

## 🧪 Testing API & Code Quality

Run tests using phpunit:
```bash
composer test
```

Tail active logs in real-time in your terminal:
```bash
php artisan pail
```

---

<div align="center">

**[← Back to Root README](../README.md)**

</div>
