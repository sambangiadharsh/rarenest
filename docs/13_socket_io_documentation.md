# Socket.IO Event Documentation

Rarenest uses Socket.IO for real-time customer support chat, property chat threads, and notification delivery.

## 1. Connection & Authentication Handshake

Before establishing a connection, the Socket.IO client must supply a valid authentication token.

*   **Extraction Method**: The socket server extracts the JWT token in `backend/src/socket/auth.js` in the following sequence:
    1.  Check `socket.handshake.auth.token`.
    2.  Check HTTP cookie header `token` inside `socket.handshake.headers.cookie`.
    3.  Check `socket.handshake.headers.authorization` (`Bearer <token>`).
*   **Validation**: If no token is detected or if verification fails, the connection is rejected with a `Not authorized` error callback.

## 2. Dynamic Room Joining

Upon connection:
*   The client is automatically subscribed to a private room: `user:${userId}`.
*   Notifications are sent directly to this room.

---

## 3. WebSocket Event Registry

### Sent by Client to Server

#### `conversation:join`
Client requests to join a chat conversation channel.
*   **Payload**:
    ```json
    { "conversationId": "e0b96db8-490b-419b-a6be-3bbcd920272b" }
    ```
*   **Behavior**: Validates that the user is a registered participant in the conversation. If so, joins the room `conv:${conversationId}` and emits `conversation:joined`.

#### `conversation:leave`
Leaves a conversation channel.
*   **Payload**:
    ```json
    { "conversationId": "e0b96db8-490b-419b-a6be-3bbcd920272b" }
    ```
*   **Behavior**: Unsubscribes the socket channel from `conv:${conversationId}`.

#### `message:send`
Dispatches a message to a conversation.
*   **Payload**:
    ```json
    {
      "conversationId": "e0b96db8-490b-419b-a6be-3bbcd920272b",
      "message": "Is this property still available?",
      "messageType": "TEXT" // Optional (TEXT, IMAGE, FILE)
    }
    ```
*   **Behavior**: Saves message to the database, emits `message:sent` to the sender, and broadcasts the new message payload to all clients in room `conv:${conversationId}`.

#### `message:read`
Marks messages as read in a conversation.
*   **Payload**:
    ```json
    {
      "conversationId": "e0b96db8-490b-419b-a6be-3bbcd920272b",
      "messageId": "9f9a85ad-89b0-466d-8fe5-21d99901509c"
    }
    ```
*   **Behavior**: Updates the read timestamp and emits `message:read` to other participants.

---

### Sent by Server to Client

#### `conversation:joined`
*   **Payload**: `{ "conversationId": "..." }`

#### `conversation:left`
*   **Payload**: `{ "conversationId": "..." }`

#### `message:sent`
*   **Payload**: `{ "id": "generated-message-guid" }`

#### `message:read`
*   **Payload**:
    ```json
    {
      "conversationId": "...",
      "userId": "...",
      "messageId": "..."
    }
    ```

#### `notification:new`
Pushed to the room `user:${userId}`.
*   **Payload**:
    ```json
    {
      "id": "notification-guid",
      "title": "New Enquiry Received",
      "message": "Someone sent an enquiry regarding Modern Nest Studio",
      "type": "ENQUIRY",
      "created_at": "2026-07-29T11:15:00Z"
    }
    ```
