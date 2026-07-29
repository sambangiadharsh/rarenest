# Error Handling & Security Practices

A description of error management patterns and security protocols implemented across Rarenest.

## 1. Error Handling

### Backend Error Handler Middleware
The backend application has a centralized global error middleware (`backend/src/middlewares/errorMiddleware.js`). All exceptions occurring within routes should be passed to this middleware using `next(error)`.

*   **Structure**:
    ```javascript
    const errorMiddleware = (err, req, res, next) => {
        let statusCode = err.statusCode || 500;
        let message = err.message || 'Internal Server Error';

        // Capture SQL Server constraints or type errors
        if (err.name === 'RequestError' || err.name === 'PreconditionError') {
            statusCode = 400;
        }

        console.error(`[Error] ${req.method} ${req.url} - Code: ${statusCode} - Msg: ${message}`, err.stack);

        res.status(statusCode).json({
            status: 'error',
            message: message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    };
    ```

### Frontend & Admin Error Handling
The frontend clients do not use class-based React `ErrorBoundary` component wraps; instead, rendering and API errors are handled at the component and hook levels:
*   **Query State Handling**: Components utilizing TanStack Query check local state properties (`isLoading`, `isError`, `error`) to display fallback views or error alerts inline (e.g. `if (isError) return <ErrorView />`).
*   **Toast Notifications**: Operation actions (like form submissions) catch promise errors and display toast alert cards using a toast helper framework (e.g., `toast.error(err.message)`).
*   **API Interceptor Redirects**: Global errors like unauthorized access (HTTP 401) are caught by the Axios network layer (`apiClient.js` interceptor), which triggers automatic redirects to the login screen.
*   **Wildcard Routing**: Unmatched routing endpoints are captured using React Router DOM wildcard routes `{ path: '*', element: <NotFoundPage /> }` in [routes.jsx](file:///c:/Users/LENOVO/Downloads/rarenest/frontend/src/app/routes.jsx#L144).

---

## 2. Security Practices

### SQL Injection Protection
All database repository methods use parameterized inputs through the MS SQL pool parameters. Direct string interpolation is prohibited in database calls.

*   **Secure Pattern**:
    ```javascript
    const request = new sql.Request(pool);
    request.input('userId', sql.UniqueIdentifier, userId);
    const result = await request.query('SELECT * FROM Users WHERE id = @userId');
    ```

### CORS Configuration
The backend strictly regulates resource sharing using the `cors` package. The allowed origins are retrieved from environment files (`CLIENT_URL` and `MANAGE_URL`).

### HTTPS and Secure Cookies
Authentication tokens are delivered inside cookies marked with `HttpOnly` and `Secure` attributes, preventing scripting access and sniffing during transit.

### Secure HTTP Headers (Helmet.js)
The Express server uses `helmet` to set secure default headers:
*   `X-Content-Type-Options`: `nosniff`
*   `X-Frame-Options`: `SAMEORIGIN` (prevents clickjacking)
*   `Content-Security-Policy`: Tailored to allow resource loading from verified locations.
*   Cross-origin policies configured to allow frontends on different subdomains to load upload attachments.
