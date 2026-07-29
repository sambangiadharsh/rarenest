# API Documentation

The Rarenest backend exposes a RESTful HTTP API. All endpoints are prefixed with `/api`. JSON is standard for request and response payloads.

---

## Authentication Endpoints (`/api/auth`)

### 1. Register User
*   **Method**: `POST`
*   **Path**: `/api/auth/register`
*   **Auth Required**: No
*   **Request Body**:
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
      "user": {
        "id": "8f8c85ad-89b0-466d-8fe5-21d99901509a",
        "email": "user@example.com",
        "role": "User"
      }
    }
    ```

### 2. Login User
*   **Method**: `POST`
*   **Path**: `/api/auth/login`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "Password123"
    }
    ```
*   **Response (200 OK)**:
    *   *Sets HTTP-Only cookie `token`*
    ```json
    {
      "status": "success",
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "8f8c85ad-89b0-466d-8fe5-21d99901509a",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "User"
      }
    }
    ```

---

## Property Endpoints (`/api/properties`)

### 1. Retrieve Properties list
*   **Method**: `GET`
*   **Path**: `/api/properties`
*   **Auth Required**: No
*   **Query Parameters**:
    *   `city` (string) - Filter by location city.
    *   `type` (string) - Filter by PropertyType ID.
    *   `minPrice` / `maxPrice` (numbers).
    *   `beds` / `baths` (numbers).
    *   `page` / `limit` (numbers).
*   **Response (200 OK)**:
    ```json
    {
      "properties": [
        {
          "id": "a90dfb2f-7634-4b53-a78b-3e5f726bdf3b",
          "title": "Modern Nest Studio",
          "asking_price": 450000.00,
          "beds": 2,
          "baths": 2,
          "size_sqft": 1200.00,
          "location_city": "Austin",
          "is_verified": true
        }
      ],
      "total": 1,
      "page": 1
    }
    ```

### 2. Create Property
*   **Method**: `POST`
*   **Path**: `/api/properties`
*   **Auth Required**: Yes (User / Builder / Admin)
*   **Request Body (JSON or Form-Data for uploads)**:
    ```json
    {
      "title": "New Green Hill Villa",
      "asking_price": 850000.00,
      "beds": 4,
      "baths": 3.5,
      "size_sqft": 3200,
      "location_city": "Dallas",
      "location_state": "Texas",
      "property_story": "A beautiful green villa...",
      "listing_type": "Individual"
    }
    ```

---

## Builder Applications (`/api/builders/applications`)

### 1. Submit Application
*   **Method**: `POST`
*   **Path**: `/api/builders/applications`
*   **Auth Required**: Yes (User)
*   **Content-Type**: `multipart/form-data`
*   **Form Fields**:
    *   `company_name`: string
    *   `company_registration_number`: string
    *   `business_email`: string
    *   `business_phone`: string
    *   `office_address`: string
    *   `declaration_accepted`: boolean
*   **File Uploads** (keys):
    *   `business_registration_certificate` (document)
    *   `applicant_government_id` (document)

---

## Conversations & Chat (`/api/conversations`)

### 1. Get User Conversations
*   **Method**: `GET`
*   **Path**: `/api/conversations`
*   **Auth Required**: Yes
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "e0b96db8-490b-419b-a6be-3bbcd920272b",
        "last_message": "Is the property still available?",
        "updated_at": "2026-07-29T11:15:00Z",
        "participants": [
          { "id": "user-guid-1", "first_name": "Alice" },
          { "id": "user-guid-2", "first_name": "Bob" }
        ]
      }
    ]
    ```
