<div align="center">

# ✦ Backend & Database Setup Guide

**The ultimate handbook for configuring, running, and testing the Trevolio E-Commerce API & Database.**

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![Stripe](https://img.shields.io/badge/Stripe-API-008CFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)

<br />

**[← Back to Root README](./README.md) • [→ Frontend Guide](./frontend/README.md) • [→ Backend Guide](./backend/README.md)**

<br />

---

</div>

## 🔌 System Status

Currently, the backend is configured to use **SQLite** as its default development database, allowing you to run the project locally without installing or configuring a full MySQL/PostgreSQL server. The pre-built database file resides at: `backend/database/database.sqlite`.

---

## ⚡ Quick Start (Database Pre-Seeded)

If your database file is already created and migrated, you can start the backend services immediately:

```bash
cd backend
php artisan serve
```

The backend API will run on **http://localhost:8000** and will be ready to process incoming requests from the frontend client.

---

## 🏗️ Step-by-Step Setup Guide

Follow these steps if you are configuring the application on a fresh machine or if you want to rebuild the database from scratch.

### 1. Install Composer Dependencies
Navigate to the backend directory and install all required PHP packages:
```bash
cd backend
composer install
```

### 2. Configure Environment Settings
Create a copy of the `.env.example` file and name it `.env`:
```bash
cp .env.example .env
```

### 3. Generate Cryptographic Application Key
Set the `APP_KEY` environment variable, which Laravel uses for encrypting user sessions and cookies:
```bash
php artisan key:generate
```

### 4. Setup Database File (For SQLite)
If using the default SQLite connection, create an empty file for your database:
```bash
# macOS / Linux
touch database/database.sqlite

# Windows (PowerShell)
New-Item -ItemType File -Path database/database.sqlite
```

### 5. Run Database Migrations
Create the core schema and tables inside the database:
```bash
php artisan migrate
```

This command builds the following schema:
- `users` — Store accounts & billing profiles
- `categories` & `subcategories` — Product classifications
- `products` & `banners` — Inventory catalog & storefront assets
- `orders` & `order_items` — Cart checkouts, shipping & payments
- `reviews` — User ratings & feedback
- `coupons` — Promotional discounts
- `wishlists` & `carts` — User-personalized lists
- `settings` — Global configuration parameters

### 6. Populate Sample Seed Data
Generate default administrator credentials, dummy products, categories, reviews, and test users:
```bash
php artisan db:seed
```

### 7. Fire Up the Server Ecosystem
You can boot all background processes (HTTP API server, Queue Workers, Vite asset compiler, and CLI log streamer) simultaneously:
```bash
composer dev
```

### 8. Start WebSockets & Queue Workers
For real-time functionality (chat & stripe webhooks):
- **WebSockets (Laravel Reverb)**:
  ```bash
  php artisan reverb:start --host=0.0.0.0 --port=8080
  ```
  *(Or run the helper script `./start-reverb.sh`)*
- **Queue Workers**:
  ```bash
  php artisan queue:work --tries=3 --timeout=60
  ```
  *(Or run the background daemon `./start-queue.sh`)*

---

## 🛢️ Using MySQL / MariaDB (Optional)

To switch from SQLite to MySQL for production or robust testing, update your `backend/.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=trevolio_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
```

Create the schema manually in your local MySQL instance:
```sql
CREATE DATABASE trevolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run the migrations and seeders:
```bash
php artisan migrate:fresh --seed
```

---

## 🔍 Verification & Diagnostics

### Test API Endpoints
Run these curl commands to ensure your Laravel server is responding correctly:

```bash
# Fetch all products catalog
curl -X GET http://localhost:8000/api/products

# Fetch categories list
curl -X GET http://localhost:8000/api/categories
```

### Query Database via Laravel Tinker
Tinker is an interactive CLI for executing PHP code directly in your application container:
```bash
php artisan tinker
```
```php
// Check total database seed counts
\App\Models\Product::count();
\App\Models\User::count();
```

---

## 🛠️ Common Utility Commands

| Command | What it does |
| :--- | :--- |
| `php artisan cache:clear` | Clear system, config, and view cache |
| `php artisan config:clear` | Purge cached config files (use after modifying `.env`) |
| `php artisan test` | Run the complete backend test suite |
| `php artisan route:list` | Print a table of all registered API routes |
| `php artisan migrate:fresh --seed` | **WARNING:** Drops all tables and seeds fresh database |

---

## 🚨 Troubleshooting

### "Database file not found" (SQLite)
If you see connection failures, verify that `database/database.sqlite` exists and has read/write permissions:
```bash
touch database/database.sqlite
php artisan migrate
```

### "Access Denied / Permission Denied"
If storing temporary files or uploading images fails, reset directory permissions:
```bash
chmod -R 775 storage bootstrap/cache
```

### Port 8000 Already in Use
To run the Laravel server on a separate port:
```bash
php artisan serve --port=8001
```

---

<div align="center">

**[← Back to Root README](./README.md)**

</div>
