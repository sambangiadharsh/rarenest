# Build & Deployment Guide

This document details how to bundle and deploy Rarenest applications in production environments.

## Production Builds

Both the public frontend and the admin panel are React single-page applications (SPAs) bundled via Vite. To compile production-ready, minified HTML/CSS/JS assets, run the build script in their respective directories.

### 1. Build Admin Panel
```bash
cd admin
npm run build
```
This generates a static build directory `admin/dist/`.

### 2. Build Frontend
```bash
cd frontend
npm run build
```
This generates a static build directory `frontend/dist/`.

These static assets can be served by any high-performance web server (such as Nginx, Apache, or cloud storage solutions like AWS S3 or Cloudflare Pages).

---

## Backend Deployment

For production deployments of the Express API, follow these guidelines:

### 1. Process Management with PM2
Use PM2 to run the Express API node process in cluster mode to handle process failures automatically and scale across CPU cores.

Create a `ecosystem.config.js` file in the root:
```javascript
module.exports = {
  apps: [{
    name: 'rarenest-api',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 8000
    }
  }]
};
```
Launch with:
```bash
pm2 start ecosystem.config.js --env production
```

### 2. Reverse Proxy Setup (Nginx)
Configure Nginx as a reverse proxy in front of Node.js. Nginx handles SSL termination, static uploads cache policies, and forwards API calls and WebSocket connections.

Example Nginx config section:
```nginx
server {
    listen 443 ssl;
    server_name api.rarenest.co;

    ssl_certificate /etc/letsencrypt/live/api.rarenest.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.rarenest.co/privkey.pem;

    # Backend API requests
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets directory
    location /uploads/ {
        alias /var/www/rarenest/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```
