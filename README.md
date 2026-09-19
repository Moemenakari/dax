# A Programming Challenge — Learning, Building & Exploring

> **Personal Note & Project Context:**  
> This project was built as a personal programming challenge for learning, experimentation, and self-improvement. The primary goal was to experience building a real, complete Full-Stack web application from scratch—tackling everything from database schema design and Express REST API architecture to modern Next.js user interfaces, administrative controls, and cloud deployment.  
>  
> This `README.md` serves as a comprehensive **Technical Memory & Documentation**. It records architectural decisions, database schemas, API routes, environment configurations, and deployment procedures so I can return to this repository anytime in the future and instantly understand how every piece was constructed and connected.

---

## Live Deployments & Cloud Infrastructure

| Component | Platform / Host | Live URL / Endpoint | Technology | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Customer Storefront** | **Vercel** | [dax-clothes-store.vercel.app](https://dax-clothes-store.vercel.app) | Next.js 15, React 19, Tailwind CSS | High-conversion customer e-commerce store |
| **Admin Dashboard** | **Vercel** | [dax-admin.vercel.app](https://dax-admin.vercel.app) | Next.js 15, Redux Toolkit | Inventory, orders, pricing & sale management |
| **Backend REST API** | **Render** | [dax-backend.onrender.com](https://dax-backend.onrender.com) | Express, Node.js, TypeScript | Core business logic, auth, upload & database bridge |
| **Database** | **TiDB Cloud** | AWS `eu-central-1` (Port 4000) | MySQL 8.0 Compatible Serverless | Relational database with SSL connection pooling |
| **Media & Asset CDN** | **Supabase Storage** | [supabase.co](https://vhpovvxpqlmvqsrwqdzp.supabase.co) | Supabase Object Storage (`products` bucket) | Permanent, geo-unrestricted image hosting |

---

## Engineering Spotlight — Smart Solutions & Architecture

> **Engineering Highlights:**  
> Built by a smart, top-tier student engineer who designed, debugged, and delivered a complete production-ready multi-cloud architecture from scratch. When confronted with real-world edge cases (regional service geoblocking, ephemeral disk container wipes, cross-domain cookie policies, CI/CD branch syncs), every challenge was solved logically with clean, permanent engineering.

### Key Problems Solved:

1. **Cloudinary Regional Geo-blocking $\rightarrow$ Supabase Storage Migration:**  
   *Problem:* Cloudinary blocked service in Lebanon, causing upload failures (HTTP 500/503).  
   *Solution:* Re-architected upload pipeline to Supabase Storage with `@supabase/supabase-js`, creating a public `products` bucket with privileged service-role backend access. Product photos are now permanently persisted without risk of deletion or regional restrictions.
2. **Render Ephemeral Filesystem Image Wipe:**  
   *Problem:* Local disk files on Render containers vanish on every restart or redeploy.  
   *Solution:* Decoupled media from the container disk entirely. All uploaded images stream directly to Supabase Storage, saving permanent public CDN URLs into TiDB Cloud.
3. **Product "Sale" Placement & Single Source of Truth:**  
   *Problem:* Inconsistent sale filtering, missing server-side price validation, and broken home/shop sync.  
   *Solution:* Standardized on `isSale = true` as the sole source of truth across the entire app. Added strict server-side validation (`salePrice < price`, required sale price when flagged, auto-clearing sale price when unflagged), randomized sort support (`?sort=random`), and automatic query parameter filtering on the Shop catalog (`/shop?sale=true`).
4. **Render Git CI/CD Branch Synchronization:**  
   *Problem:* Render was tracking `main`, but commits were pushed to `master`, causing Render to run outdated code.  
   *Solution:* Audited remote branch tracking and pushed atomic commits directly to `origin/main`, triggering automated continuous deployment.
5. **Cross-Origin Security & Cross-Domain Cookies (Vercel $\leftrightarrow$ Render):**  
   *Problem:* Modern browsers blocked cross-domain session cookies between Vercel (`*.vercel.app`) and Render (`*.onrender.com`).  
   *Solution:* Configured Express CORS with dynamic origin matching and HTTPS cookie flags (`sameSite: 'none'`, `secure: true`, `httpOnly: true`) alongside Authorization Bearer header fallback.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Frontend Documentation](#4-frontend-documentation)
5. [Admin Panel Documentation](#5-admin-panel-documentation)
6. [Backend API Documentation](#6-backend-api-documentation)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Database Architecture](#8-database-architecture)
9. [Image & File Storage System](#9-image--file-storage-system)
10. [Authentication & Security](#10-authentication--security)
11. [Environment Variables](#11-environment-variables)
12. [Local Development Guide](#12-local-development-guide)
13. [Build & Production Commands](#13-build--production-commands)
14. [Cloud Deployment Strategy](#14-cloud-deployment-strategy)
15. [Git & Repository Workflow](#15-git--repository-workflow)
16. [Data Flow Diagrams](#16-data-flow-diagrams)
17. [Core Business Logic](#17-core-business-logic)
18. [Key Codebase Files](#18-key-codebase-files)
19. [How Everything Connects](#19-how-everything-connects)
20. [Common Pitfalls & Technical Solutions](#20-common-pitfalls--technical-solutions)
21. [Lessons Learned](#21-lessons-learned)
22. [Project Philosophy](#22-project-philosophy)
23. [Future Improvement Opportunities](#23-future-improvement-opportunities)
24. [Final Technical Summary](#24-final-technical-summary)

---

## 1. Project Overview

**DAX** is a full-stack e-commerce web platform designed for men's apparel and lifestyle fashion. It provides a modern customer shopping experience, an administrative dashboard for inventory and order management, an Express.js REST API server, and a cloud-hosted MySQL-compatible database.

### Key Functional Capabilities:
- **Customer Storefront:** Browse products by category, view sale items, filter products, inspect high-resolution image galleries, select sizes, add items to a persistent cart, apply discount coupons, and complete checkout.
- **Admin Management Dashboard:** Secure dashboard for store managers to add/edit products, track customer orders, update order status (Pending, Confirmed, Shipped, Delivered, Cancelled), manage delivery areas and shipping rates, customize homepage content, manage coupons, and view analytics.
- **RESTful API Backend:** Express server handling authentication, product filtering, order processing, Cloudinary image upload streaming, email notifications via Nodemailer, and database transactions.
- **Cloud Database Integration:** Serverless TiDB Cloud (MySQL-compatible) database with SSL encrypted connection pools.

### System Architecture Diagram:

```text
  [ Customer / Browser ]               [ Admin / Browser ]
           │                                    │
           ▼                                    ▼
┌──────────────────────┐             ┌──────────────────────┐
│  Next.js Frontend    │             │  Next.js Admin Panel │
│  (Deployed on Vercel)│             │  (Deployed on Vercel)│
└──────────┬───────────┘             └──────────┬───────────┘
           │                                    │
           │           HTTPS / REST API         │
           └──────────────────┬─────────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │    Express Backend API   │
                 │   (Deployed on Render)   │
                 └────────────┬─────────────┘
                              │
                    mysql2 Pool + SSL
                              │
                              ▼
                 ┌──────────────────────────┐
                 │   TiDB Cloud Database    │
                 │    (MySQL Compatible)    │
                 └──────────────────────────┘
```

---

## 2. Tech Stack

### Frontend (Customer Storefront)
- **Framework:** Next.js 15.1.9 (App Router)
- **Language:** TypeScript 5
- **UI & Styling:** Tailwind CSS v4, Material UI (`@mui/material`, `@mui/icons-material`), React Icons
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) for Cart and Toast notifications
- **Data Fetching & HTTP:** Axios, SWR
- **Validation:** Zod
- **Utilities:** `js-cookie`

### Admin Panel (Management Dashboard)
- **Framework:** Next.js 15.1.9 (App Router)
- **Language:** TypeScript 5
- **UI & Styling:** Tailwind CSS v4, React Icons
- **State Management:** Redux Toolkit
- **Data Fetching:** Axios, SWR
- **Validation:** Zod

### Backend (REST API Server)
- **Runtime:** Node.js
- **Framework:** Express 4 / Express 5
- **Language:** TypeScript 5 (`ts-node`, `nodemon` for development)
- **Database Driver:** `mysql2` (Promise-based connection pool with SSL)
- **Authentication:** `jsonwebtoken` (JWT), `bcryptjs` for password hashing
- **File & Media Handling:** Multer (memory storage), Cloudinary Node SDK (uploader streams)
- **Communication:** Nodemailer (SMTP transport for order confirmations and password resets)
- **Middleware & Utilities:** `cors`, `cookie-parser`, `dotenv`, `zod`

### Database & Cloud Hosting
- **Database Engine:** TiDB Cloud Serverless (MySQL 8.0 compatible) / Local MySQL
- **Frontend Hosting:** Vercel
- **Admin Panel Hosting:** Vercel
- **Backend API Hosting:** Render
- **Version Control:** Git & GitHub (`Moemenakari/dax`)

---

## 3. Project Structure

The project is structured as an **npm workspace monorepo**, managing shared dependencies and isolated packages:

```text
dax/
├── package.json                   # Monorepo root workspace configuration
├── package-lock.json              # Unified lockfile
├── tsconfig.json                  # Root TypeScript configuration
├── .env.example                   # Shared environment variable templates
├── .gitignore                     # Git exclusion rules
├── Dockerfile                     # Docker configuration
├── compose.yaml                   # Docker Compose configuration
├── verify-system.js               # Database connection & health verification script
├── frontend/                      # Customer Storefront (Next.js 15)
│   ├── app/                       # App Router pages and components
│   │   ├── account/               # Customer account profile
│   │   ├── cart/                  # Shopping cart page
│   │   ├── checkout/              # Order checkout & delivery calculation
│   │   ├── components/            # Reusable UI components (Header, Footer, ProductCard, etc.)
│   │   ├── lib/                   # API client configuration (api.ts)
│   │   ├── login/                 # Login & Registration page
│   │   ├── orders/                # Customer order history & details
│   │   ├── reset-password/        # Token-based password reset
│   │   ├── shop/                  # Product catalogue & detail pages
│   │   ├── store/                 # Redux Toolkit store slices (cart, toast, auth)
│   │   ├── wishlist/              # Saved wishlist items
│   │   ├── globals.css            # Tailwind & global styles
│   │   ├── layout.tsx             # Root layout with Redux & UI providers
│   │   └── page.tsx               # Homepage (Hero, Sale Deals, Products Carousel)
│   ├── public/                    # Static assets (images, icons)
│   ├── next.config.ts             # Next.js image optimization settings
│   ├── package.json               # Frontend dependencies
│   └── vercel.json                # Vercel deployment override script
├── packages/
│   ├── admin/                     # Store Admin Panel (Next.js 15)
│   │   ├── app/                   # Admin App Router pages
│   │   │   ├── coupons/           # Coupon management
│   │   │   ├── delivery/          # Shipping rate management
│   │   │   ├── homepage/          # Dynamic homepage content editor
│   │   │   ├── lib/               # Admin API client (api.ts)
│   │   │   ├── login/             # Admin authentication page
│   │   │   ├── orders/            # Order processing & status updates
│   │   │   ├── payments/          # Payment methods reference
│   │   │   ├── products/          # Product CRUD & image/size editor
│   │   │   ├── sales/             # Revenue analytics
│   │   │   ├── settings/          # Store global settings
│   │   │   ├── todo/              # Admin task manager
│   │   │   ├── users/             # Registered user list
│   │   │   ├── layout.tsx         # Admin sidebar & header layout
│   │   │   └── page.tsx           # Admin summary dashboard
│   │   ├── package.json           # Admin dependencies
│   │   └── vercel.json            # Vercel build configuration
│   └── backend/                   # Express REST API Server
│       ├── src/
│       │   ├── middleware/        # Auth verification & error handlers
│       │   ├── routes/            # Express route modules (auth, products, orders, etc.)
│       │   ├── utils/             # Database pool connection & email helpers
│       │   └── server.ts          # Express application entry point
│       ├── schema.sql             # Primary MySQL schema definition
│       ├── migrations_update.sql  # Schema migration scripts
│       ├── migrate_local_images.js# Script for migrating local uploads to Cloudinary/CDN
│       ├── create-admin.ts        # CLI script to seed an admin account
│       ├── init_tidb.js           # CLI script to initialize cloud database schema
│       └── package.json           # Backend dependencies
└── README.md                      # Complete project documentation
```

---

## 4. Frontend Documentation

The customer storefront is built using Next.js 15 (App Router) with TypeScript to ensure strict type safety across product schemas, cart payloads, and API responses.

### Architecture Highlights:
- **State Management:** Redux Toolkit manages the client-side shopping cart state (`cartSlice.ts`), with localStorage persistence handled via `CartHydration.tsx`. Toast notifications are managed globally via `toastSlice.ts`.
- **API Communication:** Centralized Axios instance (`frontend/app/lib/api.ts`) with request interceptors that attach `Authorization: Bearer <token>` from `localStorage` whenever available.
- **Styling System:** Tailwind CSS v4 complemented by Material UI icons (`@mui/icons-material`) and custom CSS keyframe animations.
- **Image Optimization:** Configured with `unoptimized: true` in `next.config.ts` to support high-resolution external images from Cloudinary and Unsplash CDNs.

### Storefront Pages Reference:

| Page Name | File Path | Route | Purpose | Authentication |
| :--- | :--- | :--- | :--- | :--- |
| **Home Page** | `frontend/app/page.tsx` | `/` | Hero section, Hot Deals sale grid, All Products carousel slider, categories, testimonials, FAQ, delivery info | Public |
| **Shop Catalogue** | `frontend/app/shop/page.tsx` | `/shop` | Filterable product catalogue (by category, sale status, search query, price sorting) | Public |
| **Product Details** | `frontend/app/shop/[id]/page.tsx` | `/shop/:id` | Detailed product view with image gallery, size selector, stock check, related products | Public |
| **Shopping Cart** | `frontend/app/cart/page.tsx` | `/cart` | Review added items, update quantities, select size, enter promo codes, view subtotal | Public |
| **Checkout** | `frontend/app/checkout/page.tsx` | `/checkout` | Enter customer contact, shipping address, select delivery zone, place order via COD/WhatsApp | Public |
| **Login / Signup** | `frontend/app/login/page.tsx` | `/login` | Customer phone & password login, user registration, and password recovery triggers | Public |
| **Account Profile** | `frontend/app/account/page.tsx` | `/account` | View personal profile info and quick links to order history | Required |
| **Order History** | `frontend/app/orders/page.tsx` | `/orders` | List of customer's previous orders with live status badges | Required |
| **Order Details** | `frontend/app/orders/[id]/page.tsx` | `/orders/:id` | Complete order breakdown including items, shipping fee, and delivery details | Required |
| **Wishlist** | `frontend/app/wishlist/page.tsx` | `/wishlist` | Saved favorite products with quick "Move to Cart" action | Required |
| **Reset Password** | `frontend/app/reset-password/[token]/page.tsx` | `/reset-password/:token` | Password reset interface validated via token link | Public |

---

## 5. Admin Panel Documentation

The Admin Panel is an independent Next.js 15 application housed in `packages/admin`. It communicates directly with the Express backend to manage the store.

### Key Capabilities & Security:
- **Authentication:** Restricts access to user accounts containing `role === 'ADMIN'`.
- **Session Persistence:** Stores authentication tokens in `localStorage` and sends cross-site credentials for API authorization.
- **Protected Layout:** The root admin layout (`packages/admin/app/layout.tsx`) checks authentication via `/api/auth/me`. If the user is unauthenticated or lacks the `ADMIN` role, they are redirected to `/login`.

### Admin Pages Reference:

| Page Name | File Path | Route | Capabilities & Purpose |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `packages/admin/app/page.tsx` | `/` | Overview of store revenue, order counts, pending deliveries, and quick shortcuts |
| **Admin Login** | `packages/admin/app/login/page.tsx` | `/login` | Secure login interface for store managers |
| **Products List** | `packages/admin/app/products/page.tsx` | `/products` | Table of products with search, category filtering, active status toggle, and "Add Product" button |
| **Edit / Add Product**| `packages/admin/app/products/[id]/page.tsx` | `/products/:id` | Manage product title, description, price, sale price, category, sizes/stock, and image uploads |
| **Orders List** | `packages/admin/app/orders/page.tsx` | `/orders` | Order management table with filtering by status (Pending, Confirmed, Shipped, Delivered, Cancelled) |
| **Order Details** | `packages/admin/app/orders/[id]/page.tsx` | `/orders/:id` | Inspect customer details, ordered items, shipping address, and update status dropdown |
| **Coupons** | `packages/admin/app/coupons/page.tsx` | `/coupons` | Create, activate/deactivate, and delete discount promo codes |
| **Delivery Areas** | `packages/admin/app/delivery/page.tsx` | `/delivery` | Set delivery zone rates (e.g., Tripoli, Beirut) and estimated delivery times |
| **Homepage Content**| `packages/admin/app/homepage/page.tsx` | `/homepage` | Dynamically edit hero title, subtitle, banner announcements, and promotional images |
| **Users List** | `packages/admin/app/users/page.tsx` | `/users` | Inspect registered customer profiles and total order counts |
| **Store Settings** | `packages/admin/app/settings/page.tsx` | `/settings` | Configure global store name, contact phone number, address, and currency symbol |
| **Payments** | `packages/admin/app/payments/page.tsx` | `/payments` | Reference panel for supported payment options (COD, Wish Money) |
| **Sales Analytics** | `packages/admin/app/sales/page.tsx` | `/sales` | Financial summaries and sales reports |
| **Task Manager** | `packages/admin/app/todo/page.tsx` | `/todo` | Internal administrative task list and notes |

---

## 6. Backend API Documentation

The backend service is built with Express.js and TypeScript, serving as the central coordinator between database transactions, cloud storage, authentication, and frontend requests.

### Key Architectural Configurations (`packages/backend/src/server.ts`):
- **Proxy Trust:** Enabled `app.set('trust proxy', 1)` to handle secure HTTPS cookies behind Render's reverse proxy.
- **CORS Configuration:** Dynamic origin matcher allowing requests from `http://localhost:*`, configured `CLIENT_URL`/`ADMIN_URL` env variables, and wildcard matching for `*.vercel.app` domains.
- **Middlewares:** `cookie-parser`, `express.json()`, `express.static()` serving local `/uploads` during development.
- **Error Middleware:** Global error catcher (`middleware/errorHandler.ts`) returning standardized JSON errors.

---

## 7. API Endpoints Reference

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer account | No |
| `POST` | `/api/auth/login` | Authenticate customer or admin via phone & password | No |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile | Yes |
| `POST` | `/api/auth/forgot-password` | Generate and email password reset token link | No |
| `POST` | `/api/auth/reset-password` | Reset password using valid token | No |

### Products Endpoints (`/api/products`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Query products with filters (`category`, `sale`, `trendy`, `featured`, `search`, `limit`) | No |
| `GET` | `/api/products/:id` | Fetch single product with gallery images, sizes, and related products | No |
| `POST` | `/api/products` | Create new product with images and sizes | Admin |
| `PUT` | `/api/products/:id` | Update existing product details, images, and sizes | Admin |
| `DELETE`| `/api/products/:id` | Soft delete product (`isActive = false`) | Admin |
| `POST` | `/api/products/:id/images` | Attach image URL to a product | Admin |

### Image Upload Endpoint (`/api/upload`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | Upload image file (Cloudinary stream in production, local fallback in dev) | Admin |

### Orders Endpoints (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders` | Fetch customer's order history | Yes |
| `GET` | `/api/orders/:id` | Fetch detailed single order breakdown | Yes |
| `POST` | `/api/orders` | Place new order (supports both guest and logged-in customers) | No |
| `PUT` | `/api/orders/:id/status` | Update order status (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`) | Admin |

### Admin & Dashboard Endpoints (`/api/admin` & `/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | List all users with order metrics | Admin |
| `GET` | `/api/admin/orders` | List all system orders | Admin |
| `GET` | `/api/dashboard/stats` | Fetch aggregate store revenue and order statistics | Admin |

### Utility & Configuration Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/delivery/areas` | List active shipping zones and delivery rates | No |
| `POST/PUT/DELETE` | `/api/delivery/areas` | Manage shipping zones | Admin |
| `GET` | `/api/coupons` | List all promotional coupons | Admin |
| `POST` | `/api/coupons/validate` | Validate coupon code against cart total | Optional |
| `GET/PUT` | `/api/homepage` | Fetch or update dynamic homepage content | Admin (PUT) |
| `GET/PUT` | `/api/settings` | Fetch or update store settings | Admin (PUT) |
| `GET/POST` | `/api/reviews` | Fetch or submit customer reviews | Public / Auth |
| `GET/POST/DELETE` | `/api/faq` | Manage Frequently Asked Questions | Admin (POST/DELETE)|
| `GET/POST/DELETE` | `/api/wishlist` | Fetch, add, or remove items from customer wishlist | Yes |

---

## 8. Database Architecture

The database is built on a **MySQL 8.0 / TiDB Cloud Serverless** structure. Connection pooling is managed in `packages/backend/src/utils/db.ts` with SSL encryption enabled automatically when `NODE_ENV === 'production'` or host contains `tidbcloud.com`.

### Entity Relationship & Tables Summary:

| Table Name | Purpose | Key Columns | Relationships |
| :--- | :--- | :--- | :--- |
| `users` | Customer & admin user accounts | `id`, `phone` (unique), `password`, `role` (`CUSTOMER`/`ADMIN`), `contactEmail` | Parent to `orders`, `wishlist` |
| `products` | Inventory item catalogue | `id`, `title`, `price`, `salePrice`, `category`, `isSale`, `isActive` | Parent to `product_images`, `product_sizes` |
| `product_images` | Product gallery image URLs | `id`, `productId`, `url`, `isPrimary`, `sortOrder` | Foreign Key to `products(id)` |
| `product_sizes` | Inventory sizes & stock counts | `id`, `productId`, `size`, `stock` | Foreign Key to `products(id)` |
| `orders` | Customer purchases | `id`, `userId`, `totalAmount`, `shippingFee`, `status`, `deliveryAddress` | Foreign Key to `users(id)`, Parent to `order_items` |
| `order_items` | Individual items inside an order | `id`, `orderId`, `productId`, `size`, `quantity`, `price` | Foreign Keys to `orders(id)`, `products(id)` |
| `wishlist` | Saved favorite customer products | `id`, `userId`, `productId` | Foreign Keys to `users(id)`, `products(id)` |
| `coupons` | Discount promo codes | `id`, `code`, `discountType`, `discountValue`, `minOrderAmount`, `isActive` | Referenced during checkout |
| `delivery_areas` | Shipping fees by region | `id`, `areaName`, `price`, `estimatedTime`, `isActive` | Referenced during checkout |
| `homepage_content`| Dynamic homepage layout text & images | `id`, `hero_title`, `banner_title`, `sale_percentage`, `nav_announcement` | Single record settings table |
| `reviews` | Customer product reviews | `id`, `customerName`, `rating`, `comment` | Displayed on storefront |
| `faqs` | Frequently asked questions | `id`, `question`, `answer` | Displayed on storefront |
| `password_reset_tokens`| Recovery tokens for password resets | `id`, `userId`, `token`, `expiresAt` | Foreign Key to `users(id)` |
| `settings` | Store global parameters | `id`, `storeName`, `storePhone`, `currency` | Single record settings table |

---

## 9. Image & File Storage System

Image management in DAX uses a permanent cloud storage approach designed for ephemeral container platforms like Render:

1. **Production Mode (Supabase Storage):**  
   Uploaded product images stream directly to a public Supabase Storage bucket (`products`) via `@supabase/supabase-js`. The backend authenticates with the privileged service-role / API key, bypassing client-side RLS and guaranteeing high availability. Permanent public CDN URLs (`https://<project-id>.supabase.co/storage/v1/object/public/products/...`) are saved to the database.
2. **Permanent Data Guarantee:**  
   Unlike local storage on ephemeral container hosts (Render), images stored in Supabase are safely retained permanently and will never disappear during server redeploys or restarts.
3. **Robust HTTP Error Codes:**  
   The upload endpoint (`/api/upload`) delivers precise status codes:
   - `400`: Missing file or disallowed file type (only JPEG, PNG, WebP, GIF, AVIF allowed).
   - `413`: File size exceeds maximum limit (5 MB).
   - `502`: Upstream storage provider error (with detailed error logs on the server).
   - `503`: Storage service credentials missing on server.
4. **Development Mode (Local Disk Fallback):**  
   In offline local development if Supabase credentials are not supplied, files fallback safely to `packages/backend/public/uploads/` and are served statically.

---

## 10. Authentication & Security

- **Password Security:** Customer and admin passwords are hashed using `bcryptjs` with 12 salt rounds before database insertion.
- **JWT Token Generation:** Upon successful login via `/api/auth/login`, a signed JSON Web Token (valid for 30 days) is generated using `JWT_SECRET`.
- **Dual Authentication Resolution:** The `protect` middleware checks for tokens in two places:
  1. `req.cookies.token` (HTTP cookie)
  2. `Authorization: Bearer <token>` (HTTP header)
- **Cookie Policy:** Cookies are configured with `httpOnly: true`, `secure: true` (in production), and `sameSite: 'none'` to enable cross-domain cookie transmission between Vercel (`*.vercel.app`) and Render (`*.onrender.com`).
- **Credential Protection:** Secrets are loaded dynamically via environment variables.

---

## 11. Environment Variables

| Variable Name | Used By | Purpose | Required? | Secret? |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Frontend & Admin | Base URL of backend Express API | Yes | No |
| `DB_HOST` | Backend | MySQL / TiDB database host | Yes | Yes |
| `DB_USER` | Backend | Database username | Yes | Yes |
| `DB_PASSWORD` | Backend | Database password | Yes | Yes |
| `DB_NAME` | Backend | Database schema name | Yes | No |
| `DB_PORT` | Backend | Database port (e.g., `4000` for TiDB, `3306` for MySQL) | Yes | No |
| `JWT_SECRET` | Backend | Secret key used to sign and verify JWT tokens | Yes | Yes |
| `NODE_ENV` | Backend | Environment flag (`development` or `production`) | Yes | No |
| `CLOUDINARY_CLOUD_NAME`| Backend | Cloudinary cloud account name | Production | No |
| `CLOUDINARY_API_KEY` | Backend | Cloudinary API key | Production | Yes |
| `CLOUDINARY_API_SECRET` | Backend | Cloudinary API secret | Production | Yes |
| `SMTP_HOST` | Backend | Email server SMTP host | Optional | No |
| `SMTP_PORT` | Backend | Email server SMTP port | Optional | No |
| `SMTP_USER` | Backend | Email account username | Optional | Yes |
| `SMTP_PASS` | Backend | Email account app password | Optional | Yes |
| `CLIENT_URL` | Backend | URL of the frontend (for CORS matching) | Yes | No |
| `ADMIN_URL` | Backend | URL of the admin panel (for CORS matching) | Yes | No |

---

## 12. Local Development Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)
- Running local MySQL instance OR TiDB Cloud database connection credentials

### Step-by-Step Installation:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Moemenakari/dax.git
   cd dax
   ```

2. **Install Monorepo Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env` in the workspace root or inside `packages/backend/`:
     ```bash
     cp .env.example packages/backend/.env
     ```
   - Update database credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) and set a `JWT_SECRET`.

4. **Initialize Database Schema:**
   - Run the initial SQL schema script on your local MySQL database:
     ```bash
     mysql -u root -p dax_db < packages/backend/schema.sql
     ```
   - Or initialize TiDB Cloud directly using the node script:
     ```bash
     node packages/backend/init_tidb.js
     ```

5. **Start Development Services:**
   You can start all three applications simultaneously using the root workspace script:
   ```bash
   npm run dev
   ```

   Or start individual packages in separate terminal windows:
   ```bash
   # Terminal 1 — Express Backend API (Port 5000)
   npm run dev:backend

   # Terminal 2 — Next.js Customer Frontend (Port 3000)
   npm run dev:frontend

   # Terminal 3 — Next.js Admin Panel (Port 3002)
   npm run dev:admin
   ```

6. **Default Admin Account Credentials:**
   - **Phone Number:** `<stored in database seed: 71234567>`
   - **Password:** `<stored in database seed: admin123>`

---

## 13. Build & Production Commands

| Command | Workspace | Description |
| :--- | :--- | :--- |
| `npm run build` | Root | Runs production build across all npm workspaces |
| `npm run build --workspace=packages/backend` | Backend | Compiles TypeScript source to output directory `dist/` (`tsc`) |
| `npm run start --workspace=packages/backend` | Backend | Starts compiled production server (`node dist/server.js`) |
| `npm run build --workspace=frontend` | Frontend | Builds production Next.js frontend app (`next build`) |
| `npm run build --workspace=packages/admin` | Admin | Builds production Next.js admin app (`next build`) |

---

## 14. Cloud Deployment Strategy

The application architecture is optimized for free/tier-1 cloud hosting across three providers:

```text
┌─────────────────────────────────────────────────────────────┐
│                       GitHub Repository                     │
│                  (https://github.com/Moemenakari/dax)       │
└──────────────┬──────────────────┬──────────────────┬────────┘
               │                  │                  │
         Git Webhook        Git Webhook        SSL Database
               │                  │                 Connection
               ▼                  ▼                  │
        ┌──────────────┐   ┌──────────────┐          │
        │ Vercel Project│   │ Vercel Project│          │
        │ (dax-frontend)   │ (dax-admin)  │          │
        └──────┬───────┘   └──────┬───────┘          │
               │                  │                  │
               └──────────┬───────┘                  │
                          │ HTTPS REST API           │
                          ▼                          │
               ┌─────────────────────┐               │
               │ Render Web Service  │               │
               │    (dax-backend)    │               │
               └──────────┬──────────┘               │
                          │                          │
                          └──────────────────────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │   TiDB Cloud Database   │
                        │    (Serverless Cluster) │
                        └─────────────────────────┘
```

### 1. Frontend & Admin Deployment (Vercel)
- **Customer Storefront:** Deployed as root directory `frontend/`.
- **Admin Dashboard:** Deployed as root directory `packages/admin/`.
- **Build Override:** Both packages include a specialized `vercel.json` file configuring `installCommand` to handle platform-specific Linux binaries (`lightningcss-linux-x64-gnu` and `@tailwindcss/oxide-linux-x64-gnu`) required during Next.js Vercel builds.

### 2. Backend API Deployment (Render)
- **Web Service:** Deployed from `packages/backend/`.
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start` (executes `node dist/server.js`)
- **Environment Settings:** Set `NODE_ENV=production`, `CLIENT_URL`, `ADMIN_URL`, `JWT_SECRET`, Cloudinary credentials, and DB parameters.

### 3. Database Hosting (TiDB Cloud)
- **Cluster:** TiDB Cloud Serverless (AWS eu-central-1 region).
- **SSL Security:** Automatic TLS encryption over port 4000.

---

## 15. Git & Repository Workflow

- **Repository URL:** `https://github.com/Moemenakari/dax`
- **Primary Branch:** `main`
- **Ignored Artifacts (`.gitignore`):**
  - `node_modules/`
  - `.env`, `.env.local`, `.env.production`
  - `.next/`, `dist/`, `build/`
  - Local upload files (`public/uploads/*`)
  - Operating system metadata (`.DS_Store`, `Thumbs.db`)

### Standard Git Workflow Example:
```bash
git status
git add .
git commit -m "feat: enhance product search and update database queries"
git push origin main
```

---

## 16. Data Flow Diagrams

### Customer Checkout Data Flow

```text
[ Customer ]
     │ Fills shipping details & clicks "Place Order"
     ▼
[ Next.js Checkout Page ]
     │ Sends POST /api/orders { customerName, phone, address, items, totalAmount }
     ▼
[ Express Backend (orders.ts) ]
     │ 1. Validates payload via Zod & checks stock
     │ 2. Opens MySQL transaction
     │ 3. Inserts row into `orders` table
     │ 4. Inserts items into `order_items` table
     │ 5. Sends confirmation email via Nodemailer (if SMTP configured)
     ▼
[ TiDB Cloud Database ] ──(Commit Transaction)──► [ Returns Order ID ]
     │
     ▼
[ Next.js Checkout Page ] ──(Clears Redux Cart)──► Shows Success & Order Summary
```

---

## 17. Core Business Logic

1. **Dynamic Pricing & Discount Calculation:**  
   Products evaluate both `price` and optional `salePrice`. Discount percentages are computed dynamically:
   $$\text{Discount \%} = \left\lfloor \frac{\text{price} - \text{salePrice}}{\text{price}} \times 100 \right\rfloor$$
2. **Order Status Lifecycle:**  
   Orders transition through five explicit states managed by administrators:  
   `Pending` $\rightarrow$ `Confirmed` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered` (or `Cancelled`).
3. **Cart Hydration & Persistence:**  
   The Redux Toolkit store synchronizes state with browser `localStorage`. Upon app boot, `CartHydration.tsx` reads stored cart items and populates the store to prevent cart data loss on page refreshes.
4. **Soft Deletion:**  
   When products are deleted in the admin dashboard, the system sets `isActive = false` rather than executing a hard SQL `DELETE`, preserving historical order references in `order_items`.

---

## 18. Key Codebase Files

- **`packages/backend/src/server.ts`**: Main API server file; configures Express middlewares, CORS, cookies, trust proxy, and route handlers.
- **`packages/backend/src/utils/db.ts`**: Database connection pool manager; handles TiDB Cloud SSL auto-detection.
- **`packages/backend/src/middleware/auth.ts`**: Security middleware verifying JWT tokens from cookies or Authorization headers.
- **`packages/backend/src/routes/products.ts`**: Product API endpoints handling catalogue queries, SQL filters, and CRUD operations.
- **`frontend/app/page.tsx`**: Main customer homepage rendering hero banners, sale grid, and horizontal product carousel slider.
- **`frontend/app/components/ProductCard.tsx`**: Reusable product component managing image display, price rendering, and quick "Add to Cart" triggers.
- **`frontend/app/lib/api.ts`**: Centralized Axios HTTP client for the storefront with token interceptors.
- **`packages/admin/app/page.tsx`**: Admin dashboard entry point displaying store analytics and management quick links.
- **`packages/backend/schema.sql`**: Authoritative database schema definition.

---

## 19. How Everything Connects

To understand the architecture after months away from the code:

1. **The Core Engine:** The backend is an Express Node server (`packages/backend`). It doesn't render HTML; it exposes a JSON API over `/api/*`.
2. **The Database:** All state (products, orders, users, settings) lives in TiDB Cloud. The backend connects using a pooled `mysql2` connection.
3. **The Customer Front:** The `frontend/` app is a Next.js App Router project that fetches JSON from the Express API using Axios/SWR and renders pages on Vercel.
4. **The Admin Dashboard:** The `packages/admin/` app is a separate Next.js project deployed on Vercel. It consumes the same Express API but requires an `ADMIN` role JWT token.
5. **Security:** Logged-in users receive a JWT token. The token is attached to requests via Bearer headers or cookies, which the backend middleware validates against the DB.

---

## 20. Common Pitfalls & Technical Solutions

1. **CORS Errors Between Vercel & Render:**  
   *Problem:* Browsers blocked requests from `https://dax-clothes-store.vercel.app` to `https://dax-backend.onrender.com`.  
   *Solution:* Added wildcard origin checking for `*.vercel.app` in `packages/backend/src/server.ts` and set `credentials: true`.
2. **Vercel Build Failures (`lightningcss` & `@tailwindcss/oxide`):**  
   *Problem:* Native binaries compiled on Windows were missing in Vercel's Linux build containers.  
   *Solution:* Added explicit `installCommand` overrides in `frontend/vercel.json` and `packages/admin/vercel.json` to fetch Linux native binaries during build.
3. **MySQL Prepared Statement `LIMIT ?` Parameter Error:**  
   *Problem:* Passing prepared parameters to SQL `LIMIT ?` clauses threw `ER_WRONG_ARGUMENTS: Incorrect arguments to LIMIT`.  
   *Solution:* Sanitized limit query parameters to safe positive integers (`Math.max(1, parseInt(limit))`) and injected them directly into the SQL string in `products.ts`.
4. **Render Ephemeral Filesystem Image Loss:**  
   *Problem:* Uploaded product images stored in local `/public/uploads` vanished whenever Render restarted.  
   *Solution:* Integrated Cloudinary stream uploads for production and ran `migrate_local_images.js` to convert local paths in the database to permanent CDN URLs.

---

## 21. Lessons Learned

Through building this project, I gained practical hands-on experience in:
- Constructing full-stack monorepo web applications using npm workspaces.
- Managing relational data models, foreign keys, and connection pools with `mysql2` and TiDB Cloud.
- Implementing dual-layer authentication using JWT tokens, HTTP-only cookies, and Bearer headers.
- Debugging cross-origin resource sharing (CORS) and proxy headers across multi-cloud deployments.
- Configuring Next.js 15 App Router, Redux Toolkit, and Tailwind CSS v4.
- Resolving platform-specific native binary dependencies during automated CI/CD builds on Vercel.

---

## 22. Project Philosophy

> **Learning Over Perfection:**  
> This project was constructed as an exploratory learning endeavor. Code patterns reflect real-world experimentation, iterative debugging, and incremental feature development. The focus was to understand how modern Full-Stack components fit together in practice.

---

## 23. Future Improvement Opportunities

- **Automated Testing:** Integrate unit and integration test suites using Jest and React Testing Library.
- **Payment Gateway Integration:** Connect live payment APIs (such as Stripe or PayPal) alongside existing Cash on Delivery options.
- **Server-Side Rendering Optimization:** Transition additional data-fetching components to Next.js Server Components for improved initial HTML rendering speed.
- **Role-Based Access Control (RBAC):** Expand user roles to include granular permissions (e.g., Support Staff, Inventory Manager).

---

## 24. Final Technical Summary

```text
Customer Interface                  Store Manager Interface
  (Next.js 15 App Router)             (Next.js 15 Admin App)
             │                                   │
             └─────────────────┬─────────────────┘
                               │
                       HTTP / REST API
                               │
                               ▼
                   ┌───────────────────────┐
                   │ Node.js / Express API │
                   │  (JWT + Auth Shield)  │
                   └───────────┬───────────┘
                               │
                       mysql2 Pool + SSL
                               │
                               ▼
                   ┌───────────────────────┐
                   │  TiDB Cloud Database  │
                   │   (14 Relational      │
                   │    MySQL Tables)      │
                   └───────────────────────┘
```

**DAX Store Repository** — *Built with passion, curiosity, and code.*
