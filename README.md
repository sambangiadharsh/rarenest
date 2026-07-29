# Rarenest

Monorepo with three independent apps. Each has its own `package.json`, `package-lock.json`, and `.env` (where needed).

| Folder | Purpose | Dev command |
|--------|---------|-------------|
| `backend/` | Express API (port 8000) | `cd backend && npm run dev` |
| `frontend/` | Public site (port 8001) | `cd frontend && npm run dev` |
| `admin/` | Admin dashboard (port 8002) | `cd admin && npm run dev` |

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

Admins sign in only at the admin app (`http://localhost:8002`). The public site redirects admin logins there automatically. Optional: set `VITE_ADMIN_URL` in `frontend/.env` for production admin URL.
