# Rarenest

Monorepo with three independent apps. Each has its own `package.json`, `package-lock.json`, and `.env` (where needed).

| Folder | Purpose | Dev command |
|--------|---------|-------------|
| `backend/` | Express API (port 5000) | `cd backend && npm run dev` |
| `frontend/` | Public site (port 5173) | `cd frontend && npm run dev` |
| `admin/` | Admin dashboard (port 5174) | `cd admin && npm run dev` |

Shared database schema: [`schema.sql`](schema.sql)

## Quick start

```bash
# API — copy/configure backend/.env first
cd backend
npm install
npm run seed:admin   # optional
npm run dev

# Public site (separate terminal)
cd frontend
npm install
npm run dev

# Admin (separate terminal)
cd admin
npm install
npm run dev
```

Admins sign in only at the admin app (`http://localhost:5174`). The public site redirects admin logins there automatically. Optional: set `VITE_ADMIN_URL` in `frontend/.env` for production admin URL.
