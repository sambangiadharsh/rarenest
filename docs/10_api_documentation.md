# API Reference Documentation

The Rarenest backend service exposes a RESTful HTTP API. All endpoints are prefixed with `/api`. Payloads are formatted as JSON, and authenticated routes verify JWT tokens from HTTP cookies or Bearer Authorization headers.

---

## 1. Authentication Endpoints (`/api/auth`)

### Register User
*   **Method**: `POST`
*   **Path**: `/api/auth/register`
*   **Payload**:
    ```json
    {
      "email": "user@example.com",
      "password": "Password123",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "status": "success",
      "message": "User registered successfully",
      "user": { "id": "8f8c85ad-89b0-466d-8fe5-21d99901509a", "email": "user@example.com", "role": "User" }
    }
    ```

### Login User
*   **Method**: `POST`
*   **Path**: `/api/auth/login`
*   **Payload**:
    ```json
    { "email": "user@example.com", "password": "Password123" }
    ```
*   **Response (200 OK)**:
    *   *Sets HTTP-Only Cookie `token`*
    ```json
    {
      "status": "success",
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": { "id": "8f8c85ad-89b0-466d-8fe5-21d99901509a", "email": "user@example.com", "role": "User" }
    }
    ```

### Logout User
*   **Method**: `GET`
*   **Path**: `/api/auth/logout`
*   *Clears the HTTP-Only token cookie.*

### Change Password
*   **Method**: `PUT`
*   **Path**: `/api/auth/changepassword`
*   **Auth Required**: Yes
*   **Payload**:
    ```json
    {
      "currentPassword": "OldPassword123",
      "newPassword": "NewPassword123"
    }
    ```

---

## 2. Properties Endpoints (`/api/properties`)

### Get All Properties
*   **Method**: `GET`
*   **Path**: `/api/properties`
*   **Query Parameters**:
    *   `city` (string) - Filter by city location.
    *   `type` (string) - Filter by PropertyType ID.
    *   `minPrice` / `maxPrice` (number) - Price boundaries.
    *   `beds` / `baths` (number) - Room counts.
    *   `page` / `limit` (number) - Pagination parameters.

### Get Single Property
*   **Method**: `GET`
*   **Path**: `/api/properties/:id`
*   **Response (200 OK)**: Detailed property entity.

### Create Property
*   **Method**: `POST`
*   **Path**: `/api/properties`
*   **Auth Required**: Yes
*   **Payload**:
    ```json
    {
      "title": "Modern Nest Studio",
      "property_type_id": "type-guid",
      "asking_price": 320000.00,
      "beds": 2,
      "baths": 1,
      "size_sqft": 950,
      "location_city": "Austin",
      "location_state": "Texas",
      "property_story": "A cozy studio flat...",
      "listing_type": "Individual"
    }
    ```

### Verify Property (Admin Only)
*   **Method**: `PUT`
*   **Path**: `/api/properties/:id/verify`
*   **Auth Required**: Yes (Admin only)
*   **Payload**:
    ```json
    {
      "status": "Approved", // or "Rejected"
      "reason": "Verified RERA documentation."
    }
    ```

### Toggle Featured (Admin Only)
*   **Method**: `PATCH`
*   **Path**: `/api/properties/:id/featured`
*   **Auth Required**: Yes (Admin only)

### Get Verification History
*   **Method**: `GET`
*   **Path**: `/api/properties/:id/verification-history`
*   **Auth Required**: Yes

### Resubmit Property
*   **Method**: `POST`
*   **Path**: `/api/properties/:id/resubmit`
*   **Auth Required**: Yes

---

## 3. Property Drafts Endpoints (`/api/property-drafts`)

### Get Draft
*   **Method**: `GET`
*   **Path**: `/api/property-drafts`
*   **Auth Required**: Yes

### Upsert Draft
*   **Method**: `POST`
*   **Path**: `/api/property-drafts`
*   **Auth Required**: Yes
*   **Payload**: Property field parameters matching `Properties` schema draft data.

### Delete Draft
*   **Method**: `DELETE`
*   **Path**: `/api/property-drafts/:id`
*   **Auth Required**: Yes

### Upload Draft Media
*   **Method**: `POST`
*   **Path**: `/api/property-drafts/:id/media`
*   **Auth Required**: Yes
*   **Content-Type**: `multipart/form-data`
*   **File Key**: `files` (array of images/videos)

### Set Draft Thumbnail
*   **Method**: `PATCH`
*   **Path**: `/api/property-drafts/:id/media/:mediaId/thumbnail`
*   **Auth Required**: Yes

### Delete Draft Media
*   **Method**: `DELETE`
*   **Path**: `/api/property-drafts/:id/media/:mediaId`
*   **Auth Required**: Yes

### Publish Draft (Submit Listing)
*   **Method**: `POST`
*   **Path**: `/api/property-drafts/:id/publish`
*   **Auth Required**: Yes

---

## 4. Builder Applications & Profiles (`/api/builders`)

### Submit Builder Application
*   **Method**: `POST`
*   **Path**: `/api/builders/applications`
*   **Auth Required**: Yes
*   **Content-Type**: `multipart/form-data`
*   **Form fields**: `company_name`, `company_registration_number`, `business_email`, `business_phone`, `office_address`, `city`, `state`
*   **Files**: `business_registration_certificate`, `applicant_government_id`

### Review Application (Admin Only)
*   **Method**: `PUT`
*   **Path**: `/api/builders/applications/:id`
*   **Auth Required**: Yes (Admin only)
*   **Payload**:
    ```json
    { "status": "Approved" } // or "Rejected"
    ```

---

## 5. Support Tickets & Support Management (`/api/support`)

### Create support ticket
*   **Method**: `POST`
*   **Path**: `/api/support/tickets`
*   **Auth Required**: Yes
*   **Payload**:
    ```json
    {
      "category": "General",
      "subject": "Unable to upload registration document",
      "description": "The file upload errors out..."
    }
    ```

### Get My Tickets
*   **Method**: `GET`
*   **Path**: `/api/support/tickets`
*   **Auth Required**: Yes

### Get Ticket Messages
*   **Method**: `GET`
*   **Path**: `/api/support/tickets/:id/messages`
*   **Auth Required**: Yes

### Send Ticket Message
*   **Method**: `POST`
*   **Path**: `/api/support/tickets/:id/messages`
*   **Auth Required**: Yes
*   **Payload**: `{ "message": "My response text..." }`

### Assign Support Ticket (Admin Only)
*   **Method**: `PATCH`
*   **Path**: `/api/admin/support/tickets/:id/assign`
*   **Auth Required**: Yes (Admin only)
*   **Payload**: `{ "assigned_to": "admin-user-guid" }`

### Update Ticket Status (Admin Only)
*   **Method**: `PATCH`
*   **Path**: `/api/admin/support/tickets/:id/status`
*   **Auth Required**: Yes (Admin only)
*   **Payload**: `{ "status": "Resolved" }`

---

## 6. Conversations & Notifications

### Get Conversations
*   **Method**: `GET`
*   **Path**: `/api/conversations`
*   **Auth Required**: Yes

### Get Notifications
*   **Method**: `GET`
*   **Path**: `/api/notifications`
*   **Auth Required**: Yes

### Mark Notification Read
*   **Method**: `PATCH`
*   **Path**: `/api/notifications/:id/read`
*   **Auth Required**: Yes
