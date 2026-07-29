# Folder Structure

This project uses a monorepo design layout containing three separate workspace sub-directories: `backend`, `frontend`, and `admin`. Below is a comprehensive folder layout description for each environment.

## Root Directory

```text
rarenest/
├── admin/                 # Admin Dashboard (React Client)
├── backend/               # Express.js REST API & WebSocket Server
├── frontend/              # Public Client (React App)
├── scripts/               # Shared helper/automation scripts
├── schema.sql             # Global DB Initial Database Schema
└── README.md              # Monorepo startup instructions
```

## Backend Structure (`backend/`)

The backend codebase is divided into directories that reflect the Repository-Service-Controller model:

```text
backend/
├── data/                  # Temp or local data stores / SQLite files if configured
├── uploads/               # Uploaded images, videos, and certificates (publicly served)
├── src/
│   ├── app.js             # Express application startup configuration
│   ├── server.js          # HTTP server initializer & Socket.IO bootstrapper
│   ├── config/            # Database pool configurations and application constants
│   ├── controllers/       # HTTP Request-Response routers
│   ├── middlewares/       # JWT auth, role validation, file upload, error handling
│   ├── models/            # Schema declarations or helper SQL type mapping
│   ├── repositories/      # Database Direct SQL Query layers
│   ├── routes/            # Route declarations mapping endpoint paths to controllers
│   ├── services/          # Core domain business logic orchestrators
│   ├── socket/            # Socket.IO connection event configurations
│   └── utils/             # Logger, helper wrappers, date formatters, email dispatchers
├── package.json
└── package-lock.json
```

## Frontend & Admin Structures (`frontend/` & `admin/`)

Both client applications are React apps structured around features:

```text
frontend/ & admin/
├── public/                # Static public assets (Favicons, images, models)
├── src/
│   ├── app/               # Core routing, store integration, main app components
│   ├── assets/            # Fonts, global stylesheets, common SVG elements
│   ├── components/        # Standard atomic UI elements (buttons, inputs, tables)
│   ├── features/          # Encapsulated module features:
│   │   ├── auth/          # Login, Registration, Token management pages
│   │   ├── properties/    # Listing, detail cards, search screens
│   │   ├── builders/      # Builder profiles, applications, reviews
│   │   ├── messaging/     # Real-time chat widgets and views
│   │   └── support/       # Enquiries and customer ticket forms
│   ├── shared/            # Shared layouts, configurations, helpers:
│   │   ├── components/    # Reusable Layout wrapper, Header, Footer
│   │   ├── config/        # API configurations, environment values
│   │   ├── hooks/         # Shared React custom hooks (auth state, notifications)
│   │   └── lib/           # Helper utility libraries (axios interceptors)
│   ├── index.css          # Global styles + Tailwind CSS directives
│   └── main.jsx           # React app mount target entrypoint
├── vite.config.js         # Vite bundling configuration
├── tailwind.config.js     # Tailwind design system configuration
└── package.json
```
