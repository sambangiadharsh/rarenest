# RareNest Admin Dashboard

Separate React admin app. Shares the Express API in `backend/` with the public `frontend/` site.

## Stack

- React 19 + Vite 8
- Tailwind CSS 4 + shadcn/ui
- React Router 7
- Redux Toolkit + TanStack Query (auth; same pattern as `frontend/`)

## First-time setup (admin user)

From `backend/` (MS SQL must be running; configure `backend/.env`):

```bash
cd backend
npm run seed:admin
```

This creates or updates the default admin account:

| Field | Value |
|-------|-------|
| Email | `admin@rarenest.co` |
| Password | `password@123` |
| Role | `Admin` |

## Development

```bash
# Terminal 1 — API s 
cd backend
npm run dev

# Terminal 2 — public site (optional)
cd frontend
npm run dev

# Terminal 3 — admin app Manage domsin
cd admin
npm install
npm run dev
```

Open **http://localhost:8002** — unauthenticated visits redirect to `/login`.

Optional `backend/.env`: `ADMIN_URL=http://localhost:8002` (CORS; defaults to 8002).

Copy `admin/.env.example` to `admin/.env` and set `VITE_API_URL` for production builds.

## Auth behavior

- Login: `POST /api/auth/login` to backend (`http://localhost:8000/api` in dev; `VITE_API_URL` in prod) with `credentials: include` for httpOnly cookie
- Only users with role **Admin** can access the dashboard
- Session: Redux + `localStorage` key `admin_user` (separate origin from public site on 8001)
- Logout: clears cookie via `/api/auth/logout` and local state

## Sidebar sections

| Section | Route |
|---------|-------|
| Dashboard | `/` |
| Property | `/properties` |
| Enquiries | `/enquiries` |
| Reviews | `/reviews` |
| Careers | `/careers` |
| Content Management | collapsible group |
| → About Us | `/content/about-us` |  
| → Contact Info | `/content/contact-info` |
| → Terms and Conditions | `/content/terms` |
| → Privacy Policy | `/content/privacy` |
| → FAQs | `/content/faqs` |

## Phase 2 (remaining)

1. Wire Property and Reviews pages to existing API endpoints
2. Add `/api/enquiries`, `/api/careers`, `/api/cms/:slug` + database tables
3. Remove embedded admin from `frontend/src/pages/Dashboard.jsx` when ready
