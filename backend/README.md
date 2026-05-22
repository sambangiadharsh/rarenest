# Rarenest API

Express API for Rarenest. All backend code lives in this folder.

## Structure

```
backend/
  server.js
  src/
    config/db.js          # MSSQL connection pool
    repositories/         # Data access (SQL only)
    services/             # Business logic
    controllers/
    routes/
    middlewares/
    models/               # Joi validation
    utils/
  scripts/
```

## Setup

1. Create `backend/.env` with DB and JWT settings.
2. Install dependencies:

```bash
npm install
```

3. Apply schema migrations (includes `PropertyTypes` and other incremental updates):

```bash
node scripts/update-schema.js
```

4. Seed admin (optional):

```bash
npm run seed:admin
```

## Run

```bash
npm run dev
```

API listens on port `5000` by default (`GET /health`).
