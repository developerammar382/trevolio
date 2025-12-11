# Backend & Database Setup Guide

## Current Configuration

Your backend is configured to use **SQLite** database, which is perfect for development. The database file already exists at `database/database.sqlite`.

---

## Quick Start (Database Already Set Up)

Since your database is already created and migrated, you can start the backend immediately:

```bash
cd backend
php artisan serve
```

The backend will run on **http://localhost:8000**

---

## Complete Setup Steps (If Starting Fresh)

### 1. Install Dependencies

```bash
cd backend
composer install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Create SQLite Database File

```bash
touch database/database.sqlite
```

### 5. Run Migrations

```bash
php artisan migrate
```

This creates all database tables:
- users
- categories
- products
- orders
- order_items
- reviews
- coupons
- blogs
- carts
- wishlists
- settings

### 6. Seed Database (Optional)

```bash
php artisan db:seed
```

This adds sample data:
- Categories (Electronics, Clothing, Home & Garden, etc.)
- Products (20+ sample products)

### 7. Start Backend Server

```bash
php artisan serve
```

Backend runs on: **http://localhost:8000**

---

## Using MySQL Instead of SQLite

If you prefer MySQL, update your `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce
DB_USERNAME=root
DB_PASSWORD=your_password
```

Then create the database:

```bash
mysql -u root -p
CREATE DATABASE ecommerce;
exit;
```

Run migrations:

```bash
php artisan migrate
php artisan db:seed
```

---

## Verify Backend is Running

### Test API Endpoints

```bash
# Get products
curl http://localhost:8000/api/products

# Get categories
curl http://localhost:8000/api/categories
```

### Check Database

```bash
# View database tables
php artisan db:show

# Check if data exists
php artisan tinker
>>> \App\Models\Product::count()
>>> \App\Models\Category::count()
```

---

## Common Commands

```bash
# Clear cache
php artisan cache:clear
php artisan config:clear

# Run tests
php artisan test

# View routes
php artisan route:list

# Fresh migration (WARNING: deletes all data)
php artisan migrate:fresh --seed
```

---

## Frontend Connection

Make sure your frontend `.env` file has:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Then start frontend:

```bash
cd frontend
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## Troubleshooting

### Database Connection Error

If you see "database not found":
```bash
touch database/database.sqlite
php artisan migrate
```

### Permission Issues

```bash
chmod -R 775 storage bootstrap/cache
```

### Port Already in Use

```bash
# Use different port
php artisan serve --port=8001
```

### Clear Everything and Start Fresh

```bash
php artisan migrate:fresh --seed
php artisan cache:clear
php artisan config:clear
```
