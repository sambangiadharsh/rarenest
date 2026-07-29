# Feature Documentation

The Rarenest platform offers a comprehensive suite of features split across public interfaces and management dashboards. Below are the functional specifications for each key feature.

## 1. User Roles & Identity

The system accommodates three primary roles:
*   **Users**: Standard public visitors. They can register, browse properties, write reviews for builders, add listings to their wishlist, enquire about properties, and open support tickets.
*   **Builders**: Authenticated users who have submitted a Builder Application that was approved by an administrator. They can construct Builder Profiles, showcase multi-unit builder projects, and manage enquiries.
*   **Admins**: Administrators with complete system access. They log in via the dedicated admin app to verify property listings, approve builder applications, manage CMS content, configure hero banners, moderate reviews, and resolve user support inquiries.

## 2. Builder Verification Workflow

To list properties as a verified Builder:
1.  **Submission**: A user submits a Builder Application containing their company registration number, office address, RERA certificate, business verification documents, government IDs, and logo.
2.  **State Management**: The application is stored in `BuilderApplications` with state `Pending`.
3.  **Review**: Admins review the business documents in the Admin Panel and either:
    *   **Approve**: Updates the application to `Approved`. A record is created in `BuilderProfiles`, modifying the user's role capabilities.
    *   **Reject**: Sets the state to `Rejected`. No profile is made, and a reason must be stored in the verification logs.

## 3. Property Management

Properties can be listed under two categories: `Individual` (by standard users/sellers) or `BuilderProject` (linked to a Builder Profile).
*   **Property Status**: `Available`, `Sold`, or `Pending`.
*   **Verification Flow**: Listings created by standard users default to `PendingReview` verification status. Admins approve/reject them. If approved, the property's `is_verified` flag is set to true and it becomes visible on the public feed.
*   **Draft Properties**: Users can save progress on property forms. These are saved in `PropertyDrafts` before final submission.
*   **Category Features Mapping**: Properties are mapped to features (e.g. "Swimming Pool", "Gated Community") which are categorized under `PropertyFeatureCategories` (e.g. "Amenities", "Interior Details").

## 4. Real-time Customer Support & Property Chat

A unified real-time chat widget is integrated into the frontend client.
*   **Real-time Synchronization**: Powered by Socket.IO, messages are dispatched instantly to users.
*   **Rooms**: Chat channels are bound to specific `Conversation` entities mapping two or more participants.
*   **Property Context**: Users viewing a property can click "Chat with Owner" which sets up a chat channel referencing the specific property ID.
*   **Admin support console**: Allows administrators to view support channels, review active chats, and reply directly to customers.

## 5. Wishlists & Enquiries

*   **Wishlist**: Users can toggle properties onto their wishlist. This is stored in the `Wishlist` table and presented under the user's dashboard.
*   **Enquiries**: A user can fill out an enquiry form on a property page. This creates an entry in `Enquiries` containing the property context, from-user ID, and to-user ID. The seller/builder receives an instant notification.

## 6. Content Management System (CMS) & Faqs

*   **CMS pages**: Allows dynamic editing of static platform pages (such as "About Us", "Privacy Policy", "Terms of Service") using key-value page maps (`page_key`).
*   **FAQs**: Administrative interface to create, update, and sort frequently asked questions shown on the public site.
*   **Hero Banners**: Allows admins to upload new home banners, configure headings, change ordering, and toggle active status.
