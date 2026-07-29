# Rarenest Project Overview

Welcome to the **Rarenest** codebase documentation. Rarenest is a production-grade, full-stack real estate and property management application tailored for property listing, builder profiles, builder verification, real-time messaging, and interactive customer support ticketing.

## Business Objectives

Rarenest aims to provide a reliable, secure, and modern marketplace platform connecting individual sellers, builders, and potential buyers/enquirers:
- **For Buyers**: To search, browse, wishlist, and enquire about available properties, and to verify the credentials of builders.
- **For Builders**: To apply for builder verification, showcase approved builder profiles, list multi-unit projects, and receive enquiries.
- **For Sellers/Individuals**: To list properties directly onto the marketplace.
- **For Admins**: To moderate builder profiles, verify listed properties, manage static CMS pages, resolve support tickets, and view platform performance metrics.

## Component Applications

Rarenest is designed as a monorepo consisting of three independent applications sharing a centralized database:

1. **Backend Service (`backend/`)**:
   - An Express.js application acting as the central REST API provider and WebSocket server.
   - Built on a **Repository-Service-Controller** architecture.
   - Communicates with MS SQL Server for transactional data storage and exposes standard API routes.
   - Hosts the Socket.IO server to support real-time chat, customer support, and system notifications.

2. **Public Frontend Client (`frontend/`)**:
   - A modern React application powered by Vite and styled with Tailwind CSS.
   - Handles the public-facing interface for searching properties, reading CMS content, managing user profiles, adding properties to wishlists, raising enquiries, and initiating real-time chat conversations.

3. **Admin Dashboard (`admin/`)**:
   - A dedicated administrative interface built on React, Vite, and Tailwind CSS.
   - Allows administrators to review builder verification applications, moderate reviews, handle support tickets, control CMS articles/FAQs, and inspect system dashboards.
