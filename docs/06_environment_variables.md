# Environment Variables

Rarenest uses environment files to manage runtime configuration settings across its three subsystems.

## Backend Configuration (`backend/.env`)

These environment variables configure Express, the MS SQL database connection pool, authentication credentials, and email settings.

| Key | Description | Example / Default Value |
| :--- | :--- | :--- |
| `PORT` | Local network port the Express application listens on | `8000` |
| `NODE_ENV` | Current runtime context mode | `development` (or `production`) |
| `DB_USER` | Connection username for MS SQL server | `rarenestuser` |
| `DB_PASSWORD` | Password for DB_USER | `1M|%x2F6s8eLs3|A` |
| `DB_SERVER` | Target database network address or host IP | `103.185.75.93` |
| `DB_NAME` | Database catalog name | `rarenest` |
| `DB_PORT` | MSSQL connection port | `1433` |
| `JWT_SECRET` | Cryptographic secret for signing JWTs | `rarenest.co@hesa` |
| `JWT_EXPIRE` | Expiry duration of user session token | `24h` |
| `CHAT_SECRET` | Secret key for custom chat client validation | `956f3208eeec9942d...` |
| `SMTP_HOST` | Host address of SMTP outgoing mail server | `mail.hesaathi.com` |
| `SMTP_PORT` | Output port for secure SMTP | `587` |
| `SMTP_EMAIL` | Sender address for system emails | `support@hesaathi.com` |
| `SMTP_PASSWORD`| Authentication password for email server | `*Password*` |
| `FROM_EMAIL` | Display sender email address | `support@hesaathi.com` |
| `FROM_NAME` | Name shown as sender of emails | `Rarenest` |
| `CLIENT_URL` | Domain where frontend client is running | `https://rarenest.co` |
| `MANAGE_URL` | Domain where admin dashboard is running | `https://manage.rarenest.co` |
| `GOOGLE_CLIENT_ID`| Client Identifier for OAuth2 logins | `666637722878...apps.googleusercontent.com` |

## Frontend Configuration (`frontend/.env`)

These variables configure the public-facing React app built with Vite.

| Key | Description | Example / Default Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint of the backend API service | `https://api.rarenest.co` |
| `MODE` | Build mode profile | `development` |
| `VITE_ADMIN_URL` | Redirect destination URL for admin logins | `https://manage.rarenest.co` |
| `VITE_GOOGLE_CLIENT_ID` | OAuth2 Google Client ID | `666637722878...` |
| `VITE_CHAT_BACKEND_URL` | Port or URL of support websocket server | `http://localhost:3000` |
| `VITE_WORKSPACE_SLUG` | Workspace key for messaging widgets | `rarenest` |

## Admin Dashboard Configuration (`admin/.env`)

These variables configure the React administration panel.

| Key | Description | Example / Default Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint of the backend API service | `https://api.rarenest.co` |
| `MODE` | Build mode profile | `development` |
| `VITE_GOOGLE_CLIENT_ID` | OAuth2 Google Client ID | `666637722878...` |
