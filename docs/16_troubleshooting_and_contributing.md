# Troubleshooting & Contributing Guide

A guide for solving common issues and making contributions to Rarenest.

## 1. Troubleshooting Common Issues

### 1. Database Connection Failures
*   **Error**: `Database Connection Failed! Bad Config`
*   **Fix**: Check that your `backend/.env` credentials (`DB_USER`, `DB_PASSWORD`, `DB_SERVER`) match your MS SQL Server instance. If using a local SQL Express instance, configure the `DB_PORT` correctly (often 1433 or a dynamic port) and ensure TCP/IP protocol is enabled in the SQL Server Configuration Manager.

### 2. CORS Block Errors
*   **Error**: `Origin http://localhost:8001 not allowed by CORS`
*   **Fix**: Ensure `CLIENT_URL` (in `backend/.env`) includes your frontend client's address, or check the CORS allowed origins list in `backend/src/app.js`.

### 3. WebSockets Connection Refused
*   **Error**: Socket client fails to establish a websocket channel.
*   **Fix**: Ensure the browser has a valid `token` cookie set, or supply the JWT token explicitly in the socket connection handshake config. Verify `VITE_CHAT_BACKEND_URL` is set to the correct socket address.

---

## 2. Developer Contributing Guide

We welcome contributions! Please follow this workflow to maintain codebase health.

### Step 1: Branch Creation
Create a descriptive feature branch from the latest `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b bugfix/your-bugfix-name
```

### Step 2: Make Changes & Test
*   Follow the project's [Coding Standards](05_coding_standards.md).
*   Test changes locally across the relevant frontend or backend services.
*   Ensure that the SQL commands align with the shared `schema.sql` if modifying the database structure.

### Step 3: Commit Guidelines
Write clear, imperative commit messages:
```bash
git commit -m "feat: add support ticket attachment support"
```
Prefix messages with:
*   `feat:` for new features
*   `fix:` for bug fixes
*   `docs:` for documentation updates
*   `refactor:` for code restructurings
*   `style:` for formatting adjustments

### Step 4: Submit a Pull Request
*   Push your branch: `git push origin feature/your-feature-name`
*   Open a Pull Request (PR) on GitHub.
*   Clearly document your changes in the PR description, including how they were verified.
