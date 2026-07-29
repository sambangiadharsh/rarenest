# Installation & Development Setup

This guide details setting up a local Rarenest development environment.

## Prerequisites

Before starting, install the following tools:
*   **Node.js**: Version 18.x or later (LTS recommended)
*   **npm**: Version 9.x or later
*   **MS SQL Server**: Local instance or access to a cloud-based MS SQL Server instance (SQL Server 2019+ recommended).
*   **Git**

---

## Step 1: Clone the Repository

```bash
git clone <repository-url> rarenest
cd rarenest
```

---

## Step 2: Database Initialization

1.  Open your MS SQL Server Management Studio (SSMS) or SQL tool.
2.  Create a database named `rarenest`.
3.  Open the [`schema.sql`](file:///c:/Users/LENOVO/Downloads/rarenest/schema.sql) file located in the root of the project.
4.  Run the contents of `schema.sql` against your newly created database to build tables, constraints, foreign keys, and indexes.

---

## Step 3: Backend Configuration & Start

1.  Navigate to the `backend/` folder:
    ```bash
    cd backend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Copy `.env` (or configure a new one) following the variables defined in [Environment Variables](06_environment_variables.md):
    ```bash
    cp .env.example .env
    ```
4.  Run database seeds (creates initial Admin credentials):
    ```bash
    npm run seed:admin
    ```
5.  Start the development API server:
    ```bash
    npm run dev
    ```
    The server will startup on port `8000`. You should see `Server running in development mode on port 8000` and `Connected to MS SQL`.

---

## Step 4: Frontend Development Setup

1.  Open a new terminal window at the project root.
2.  Navigate to the `frontend/` folder:
    ```bash
    cd frontend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Configure `.env` using your local backend URL:
    ```bash
    # Ensure VITE_API_URL points to the backend
    VITE_API_URL=http://localhost:8000
    ```
5.  Start the dev server:
    ```bash
    npm run dev
    ```
    The public client will boot on port `8001`. Open `http://localhost:8001` in your browser.

---

## Step 5: Admin Panel Development Setup

1.  Open a new terminal window at the project root.
2.  Navigate to the `admin/` folder:
    ```bash
    cd admin
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Configure `.env`:
    ```bash
    VITE_API_URL=http://localhost:8000
    ```
5.  Start the dev server:
    ```bash
    npm run dev
    ```
    The admin application will boot on port `8002`. Open `http://localhost:8002` in your browser.
