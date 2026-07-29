# Performance & Future Improvements

This document lists performance optimizations implemented in Rarenest and outlines proposed improvements.

## 1. Current Performance Optimizations

### Database Indexing Strategy
To optimize search and feed responses, verify that the following indexes exist in your database environment:
*   **Users Table**: Unique index on `email`.
*   **Properties Table**: Non-clustered index on `location_city`, `status`, and `asking_price` to speed up marketplace searches.
*   **PropertyFeatureMappings Table**: Unique clustered index on composite key `(PropertyId, FeatureId)` to speed up features lookups.

### API Pagination
Endpoints that fetch large collections (e.g. `/api/properties`) enforce server-side pagination with default limits:
*   Prevents database overhead from loading thousands of records.
*   Speeds up JSON payload serialization and client-side page rendering.

### Frontend Optimization
*   **Vite Bundle Chunking**: Code splitting splits vendors and heavy routes into separate bundle files, reducing the initial bundle size.
*   **Lazy Loading Images**: Property cards render images with lazy-loading attributes.

---

## 2. Future Improvements & Roadmap

1.  **Distributed Caching (Redis)**:
    *   Introduce Redis cache layers for static lookup tables (such as property types, FAQ lists, and CMS configurations) to bypass SQL queries for static pages.
2.  **Full-Text Search Engine**:
    *   Integrate a search engine (like Elasticsearch or Azure Cognitive Search) for advanced full-text search capability over property descriptions and builder biographies.
3.  **Third-Party Media Storage**:
    *   Migrate from disk-based uploads (`backend/uploads/`) to Amazon S3 or Google Cloud Storage to enable containerized, stateless backend deployments (e.g., in Kubernetes or ECS).
4.  **CDN Integration**:
    *   Configure a CDN (e.g., Cloudflare or AWS CloudFront) to cache static uploads and frontend bundles globally.
