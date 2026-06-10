<div align="center">

# ✦ Trevolio E-Commerce

**A modern, premium, full-featured e-commerce ecosystem — built with Next.js 14, Laravel 12, Stripe, and Laravel Reverb.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Laravel Reverb](https://img.shields.io/badge/Reverb-WebSockets-f43f5e?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com/docs/12.x/reverb)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-white?style=flat-square)](LICENSE)

<br />

**[→ Frontend Directory](./frontend) • [→ Backend Directory](./backend) • [→ Backend Setup Guide](./BACKEND_SETUP.md)**

<br />

*Experience seamless, real-time shopping and comprehensive administration in one premium platform.*

<br />

---

</div>

## Overview

**Trevolio** is an enterprise-grade, full-stack e-commerce solution engineered for speed, real-time interaction, and robust management. It features a stunning, animated user interface built on Next.js 14 and Framer Motion, paired with a high-performance REST API powered by Laravel 12. 

Equipped with secure Stripe credit card processing, real-time customer-to-admin support chat (via Laravel Reverb WebSockets), custom PDF invoice generation, automatic coupon validation, and multi-tier analytics, Trevolio represents a complete software solution for modern online retail.

<br />

## Architecture & Features

### 🛍️ Client & Public Storefront (Next.js 14)

| Feature | Capabilities |
| :--- | :--- |
| **Dynamic Catalog** | Live filtering (by price, category), elastic searching, popular search terms, bestsellers, and intelligent product recommendation carousels. |
| **Interactive Shop** | Interactive cart drawer, multi-step checkout wizard with saved shipping addresses, and a visual wishlist tracker. |
| **Real-time Live Chat** | Floating chat bubble connected to admin agents using WebSockets (Laravel Echo + Reverb) with typing indicators. |
| **Customer Dashboard** | Manage active/past orders, edit shipping addresses, toggle default address, track order fulfillment, and edit account profiles. |
| **Product Reviews** | Post detailed star reviews on purchased products, rate reviews as helpful/unhelpful, and view aggregated ratings. |

### 🛠️ Admin Control Center (Laravel 12 Dashboard)

| Feature | Capabilities |
| :--- | :--- |
| **Analytics Suite** | Recharts-powered interactive analytics visualizing sales, user registrations, top categories, and seasonal revenue patterns. |
| **Store Management** | Full CRUD capabilities for Products (featured toggle, inventory management), Categories (with nested subcategories), and Banners (with dynamic slide reordering). |
| **Live Chat Center** | Centralized chat console to assign, resolve, and reply to client inquiries in real-time. |
| **System Settings** | Live settings dashboard with customizable storefront configurations, branding options, and instant logo uploads. |
| **Order Processing** | Track order fulfillment, update payment/shipping statuses, trigger manual/automatic refunds, and view live order stats. |
| **Notification Engine** | Real-time system monitoring for low stock alerts, pending orders, and user registrations with instant actions. |

<br />

## Tech Stack

```
Frontend Architecture       Next.js 14 (App Router) + TypeScript + React 18
Styling & Animations        Tailwind CSS v4 + PostCSS + Framer Motion
State & Utilities           Context API + Axios + Tailwind Merge + clsx
Real-time Socket Connection  Laravel Echo + Pusher JS client
Charts & UI Components      Recharts 2 + Radix UI + React Icons + React Hot Toast
Payments                    Stripe SDK & elements

Backend Framework           Laravel 12.x + Sanctum API Authentication
WebSockets Server           Laravel Reverb (Native high-performance WebSockets)
Asynchronous Tasks          Database Queue Worker / Queue Listener
Database Options            SQLite (Default Dev) / MySQL 8 (Production Ready)
Document Processing         Dompdf (Automated PDF Invoice Generation)
Testing & Quality           PHPUnit + Laravel Pail (Real-time CLI Log Streamer)
```

<br />

## Project Structure

```
e-commerce/
├── backend/                       # Laravel 12 API & Socket Server
│   ├── app/                       # Core PHP codebase (Models, Controllers, Events)
│   ├── bootstrap/                 # Application bootstrapping configs
│   ├── config/                    # Global app configuration files
│   ├── database/                  # SQLite/MySQL Migrations, Seeders & Factories
│   ├── public/                    # Laravel public entry & storage links
│   ├── resources/                 # Laravel views & language files
│   ├── routes/                    # API (`api.php`) & Console Webhook definitions
│   ├── tests/                     # Backend PHPUnit test suite
│   ├── artisan                    # Laravel CLI helper script
│   └── composer.json              # Backend PHP dependencies & scripts
├── frontend/                      # Next.js 14 App Client
│   ├── public/                    # Static assets, logos, and favicons
│   └── src/
│       ├── app/                   # App Router pages & route groups
│       │   ├── (admin)/           # Admin Panel sub-routes
│       │   ├── (auth)/            # Login, Registration pages
│       │   ├── (dashboard)/       # User profile, orders, addresses
│       │   └── (public)/          # Shop front, product catalog, cart, blog
│       ├── components/            # Reusable UI primitives, headers, footers
│       ├── context/               # Global state (Cart, Auth, Chat contexts)
│       ├── hooks/                 # Custom React hooks
│       ├── lib/                   # Helper utilities (axios, socket helpers)
│       └── types/                 # Shared TypeScript interfaces
├── BACKEND_SETUP.md               # Detailed database setup & troubleshooting guide
└── README.md                      # Master root setup & ecosystem guide
```

<br />

## Quick Start Guide

### Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v18+) & **npm**
- **PHP** (v8.2+) & **Composer**
- **SQLite3** or **MySQL**

---

### Step 1: Run the Backend API & Socket Server

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   composer install
   ```

2. Setup environment configurations:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. Initialize your database. By default, Trevolio uses **SQLite** for rapid dev setup:
   ```bash
   touch database/database.sqlite
   php artisan migrate --seed
   ```
   *(For MySQL setup, refer to the [Backend Setup Guide](./BACKEND_SETUP.md))*

4. Launch the concurrently running development servers (this script automatically boots the HTTP server, WebSockets listener, background queue worker, and log streamer):
   ```bash
   composer dev
   ```
   Your backend will be running at `http://localhost:8000`.

---

### Step 2: Run the Frontend Client

1. Open a new terminal window, navigate to the frontend directory, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Setup environment configurations:
   ```bash
   cp .env.example .env.local
   ```
   *(Ensure `NEXT_PUBLIC_API_URL` points to `http://127.0.0.1:8000/api`)*

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Your frontend client will be active at `http://localhost:3000`.

<br />

## Default Credentials

### Admin Dashboard Access
To login as an administrator, navigate to `/admin` or `/login` on the frontend:
- **Email:** `admin@example.com` *(or admin account generated via database seeders)*
- **Password:** `password`

### Test Customer Access
- **Email:** `user@example.com`
- **Password:** `password`

<br />

## Verification & Testing

### Backend Unit Tests
Run the PHPUnit suite to verify API endpoints and controller functionality:
```bash
cd backend
composer test
```

### Checking Active Services
- **Backend API status:** `curl http://localhost:8000/api/products`
- **Laravel Reverb WebSockets:** Ensure your browser console registers successful subscription to private channels on chat dashboard.

<br />

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add some cool feature"`
4. Push to branch: `git push origin feature/your-feature-name`
5. Submit a Pull Request

<br />

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with 💻 and ☕ by Ammar Shahid

</div>
