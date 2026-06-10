<div align="center">

# ✦ Trevolio Frontend Client

**A high-performance, animated e-commerce user interface built on Next.js 14 (App Router), React 18, and Tailwind CSS.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-ea580c?style=flat-square&logo=framer&logoColor=white)](https://motion.dev)
[![Stripe](https://img.shields.io/badge/Stripe-SDK-008CFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)

<br />

**[← Back to Root README](../README.md) • [→ Backend Guide](../backend/README.md) • [→ Database Setup Guide](../BACKEND_SETUP.md)**

<br />

---

</div>

## 🌐 Overview

The **Trevolio Storefront Client** provides a modern, fast, and visual retail experience. Built using Next.js 14 App Router, it features client-side state management (for shopping cart, authentication, and chat), smooth scroll and micro-animations via Framer Motion, fully integrated credit card processing through Stripe, and a real-time admin support chat widget utilizing WebSockets.

---

## 🎨 Tech Stack & Packages

- **Framework:** Next.js 14.x (App Router, Server & Client Components)
- **State Management:** React Context API (`AuthContext`, `CartContext`, `ChatContext`)
- **Animations:** Framer Motion v12 (hover effects, page transitions, sliding drawer sheets)
- **Real-time Engine:** Laravel Echo Client + Pusher JS Client
- **Charts:** Recharts (Admin analytics charts)
- **UI Components & Icons:** Radix UI primitives, React Icons, React Hot Toast notifications
- **Network Client:** Axios (configured with intercepts for Laravel Sanctum authentication)

---

## 📂 Directory Map

The directory structure is organized around Next.js App Router **Route Groups** to segment access permissions cleanly:

```
frontend/src/
├── app/
│   ├── (public)/                 # Pages accessible without logging in
│   │   ├── blog/                 # E-commerce news & articles catalog
│   │   ├── cart/                 # Shopping cart manager & checkout initiator
│   │   ├── categories/           # Category grids & subcategory menus
│   │   ├── checkout/             # Stripe payment gateway wizard
│   │   ├── products/             # Product list, filters, & single page views
│   │   └── page.tsx              # Home Page (hero, featured banners, stats)
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/                # Customer & Admin login form
│   │   └── register/             # New user registration form
│   ├── (dashboard)/              # Protected customer panels
│   │   └── dashboard/            # Dashboard home, address book, orders, wishlist
│   ├── admin/                    # Admin Dashboard (protected by admin middleware)
│   │   ├── banners/              # Storefront banner slide reordering
│   │   ├── categories/           # Category CRUD panel
│   │   ├── chat/                 # Admin Live Chat desk
│   │   ├── products/             # Inventory listing & management
│   │   ├── reviews/              # Product rating moderation panel
│   │   └── settings/             # System config editor & logo uploads
│   ├── globals.css               # Global styling, design system & Tailwind layer imports
│   └── layout.tsx                # Master page skeleton & context providers
├── components/                   # Reusable components (Navbar, Footer, CartDrawer)
├── context/                      # Global context states (Auth, Cart, Chat providers)
├── hooks/                        # Custom React hooks (useAuth, useLocalStorage)
├── lib/                          # Third-party adapters (axios, websockets client configuration)
└── types/                        # TypeScript typings
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root of the `frontend/` directory:

```env
# URL point to the Laravel Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Stripe Publishable Key (for credit card checkout)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RCI...yourKey

# WebSockets Reverb configuration (corresponds to backend settings)
NEXT_PUBLIC_REVERB_APP_KEY=54beebf3104f217582d2dfb39545fd28
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

---

## 🚀 Execution & Command Reference

Ensure you install dependencies before running scripts:
```bash
npm install
```

| NPM Command | Description |
| :--- | :--- |
| `npm run dev` | Start the development server at `http://localhost:3000` |
| `npm run build` | Compile the application into a production-optimized build |
| `npm run start` | Launch the pre-compiled production build locally |
| `npm run lint` | Analyze files for code quality issues and static errors |

---

## 💬 WebSockets & Live Chat Integration

The chat bubble UI runs globally. When a customer initiates a chat:
1. It registers an anonymous session or uses their logged-in token.
2. It initializes `Laravel Echo` using `pusher-js` targeting the Reverb port (`8080`).
3. Message events are broadcast and received dynamically, maintaining instantaneous response times between client and admin chat interfaces.

---

<div align="center">

**[← Back to Root README](../README.md)**

</div>
