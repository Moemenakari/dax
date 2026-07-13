# DAX - Men's Clothing Store

## Tech Stack

- Frontend: Next.js 15, TypeScript, TailwindCSS, Redux Toolkit
- Backend: Node.js, Express, TypeScript, MySQL2
- Admin: Next.js 15, TypeScript, TailwindCSS
- Database: MySQL

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/dax.git
cd dax
npm install
```

### 2. Setup Backend

```bash
cd packages/backend
cp .env.example .env
# Edit .env with your values (DB credentials, JWT secret, Cloudinary, SMTP)
```

### 3. Setup Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

### 4. Setup Admin

```bash
cd packages/admin
cp .env.local.example .env.local
```

### 5. Database

Import `packages/backend/schema.sql` into MySQL using phpMyAdmin or:

```bash
mysql -u root -p dax_db < packages/backend/schema.sql
```

Then run `packages/backend/migrations_update.sql` for any additional columns.

### 6. Run all services

```bash
# From root — run each in a separate terminal
npm run dev --workspace=packages/backend   # API on :5000
npm run dev --workspace=frontend           # Store on :3000
npm run dev --workspace=packages/admin     # Admin on :3002
```

## Default Admin Account

- **Phone:** `71234567`
- **Password:** `admin123`

> ⚠️ Change these credentials immediately after first login in production.

## URLs

- Customer Store: <http://localhost:3000>
- Admin Dashboard: <http://localhost:3002>
- Backend API: <http://localhost:5000>

## Docker (Production)

```bash
cp packages/backend/.env.example packages/backend/.env
# Fill in production values in packages/backend/.env
docker compose up --build
```

## Environment Variables

See `.env.example` files in each package for required variables.

Required for full functionality:

- **DB_\*** — MySQL connection
- **JWT_SECRET** — random secret string (min 32 chars)
- **CLOUDINARY_\*** — image uploads (optional, falls back to local storage)
- **SMTP_\*** — email notifications (optional, orders still work without it)
