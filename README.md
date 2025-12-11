# Trevolio E-Commerce Platform

A full-stack e-commerce platform built with Next.js and Laravel.

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend
- Laravel 10
- MySQL
- Stripe Integration

## Setup Instructions

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
