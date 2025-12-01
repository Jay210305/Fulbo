# MongoDB Schema Documentation

**Database:** fulbo_app  
**Generated:** 2025-11-30  
**MongoDB Version:** Latest  
**Purpose:** Real-time chat functionality for booking groups

## Overview

MongoDB is used in the Fulbo application specifically for the **chat system**. It stores chat rooms and messages for players who have booked the same field at the same time, enabling real-time communication.

---

## Collections

### 1. ChatRoom

Represents a chat room/group for players participating in the same booking or match.

#### Schema Definition

```typescript
interface IChatRoom {
  _id: ObjectId;          // MongoDB auto-generated ID
  roomId: string;         // Unique room identifier (typically booking ID)
  name?: string;          // Optional room name (e.g., "Pichanga Jueves")
  members: string[];      // List of participant emails
  createdAt: Date;        // Room creation timestamp
}
```

#### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Yes | Auto | MongoDB document ID |
| `roomId` | String | Yes | - | Unique identifier for the room (usually linked to booking_id) |
| `name` | String | No | - | Human-readable room name |
| `members` | String[] | No | [] | Array of member emails |
| `createdAt` | Date | No | Date.now | Timestamp when room was created |

#### Indexes

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| Primary | `_id` | Default | Document lookup |
| Unique | `roomId` | Unique | Fast room lookup, ensure uniqueness |

#### Example Document

```json
{
  "_id": "674abc123def456789012345",
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Pichanga Sábado 5pm",
  "members": [
    "juan@email.com",
    "pedro@email.com",
    "carlos@email.com"
  ],
  "createdAt": "2025-11-30T15:30:00.000Z"
}
```

---

### 2. Message

Stores individual chat messages sent within a room.

#### Schema Definition

```typescript
interface IMessage {
  _id: ObjectId;          // MongoDB auto-generated ID
  senderId: string;       // ID of the user who sent the message
  roomId: string;         // Room where the message was sent
  content: string;        // Message text content
  timestamp: Date;        // When the message was sent
}
```

#### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Yes | Auto | MongoDB document ID |
| `senderId` | String | Yes | - | User ID of message sender |
| `roomId` | String | Yes | - | Room ID where message was posted |
| `content` | String | Yes | - | Text content of the message |
| `timestamp` | Date | No | Date.now | When message was created |

#### Indexes

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| Primary | `_id` | Default | Document lookup |
| Secondary | `roomId` | B-tree | Fast message retrieval by room |

#### Example Document

```json
{
  "_id": "674abc789def012345678901",
  "senderId": "user-uuid-here",
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "¿A qué hora nos vemos en la cancha?",
  "timestamp": "2025-11-30T16:45:23.456Z"
}
```

---

## Schema Relationships

```
ChatRoom (1) ─────────── (N) Message
    │                         │
    ├─ roomId (unique)        ├─ roomId (indexed)
    ├─ members[]              ├─ senderId
    └─ name                   └─ content
```

### Relationship Details

- **ChatRoom ↔ Message**: One-to-many. A chat room can have many messages. Messages reference their room via `roomId`.
- **ChatRoom.members ↔ PostgreSQL users**: The `members` array contains email addresses that correspond to `users.email` in PostgreSQL.
- **ChatRoom.roomId ↔ PostgreSQL bookings**: The `roomId` typically corresponds to a `booking_id` from the PostgreSQL database.

---

## Usage Patterns

### Creating a Chat Room

```javascript
const chatRoom = new ChatRoom({
  roomId: booking.booking_id,
  name: `Partido ${field.name} - ${date}`,
  members: [player1.email, player2.email]
});
await chatRoom.save();
```

### Sending a Message

```javascript
const message = new Message({
  senderId: user.user_id,
  roomId: chatRoom.roomId,
  content: "¡Llegué a la cancha!"
});
await message.save();
```

### Retrieving Room Messages

```javascript
const messages = await Message.find({ roomId })
  .sort({ timestamp: 1 })
  .limit(100);
```

### Adding a Member to a Room

```javascript
await ChatRoom.updateOne(
  { roomId },
  { $addToSet: { members: newMemberEmail } }
);
```

---

## Connection Configuration

```javascript
// Environment variable
MONGO_URI=mongodb://fulbo_admin:fulbo_password_secure@localhost:27017/fulbo_app?authSource=admin

// Connection options
{
  useNewUrlParser: true,
  useUnifiedTopology: true
}
```

---

## Best Practices

1. **Indexing**: The `roomId` field is indexed on the Message collection for efficient querying.
2. **TTL (Optional)**: Consider adding a TTL index on messages if you want automatic cleanup:
   ```javascript
   MessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
   ```
3. **Pagination**: Always paginate message queries to avoid loading entire chat histories.
4. **Real-time**: Use Socket.IO with MongoDB change streams for real-time message delivery.

---

## Mongoose Models Location

- `backend/src/models/ChatRoom.ts`
- `backend/src/models/Message.ts`

---

## Docker Configuration

```yaml
mongo_db:
  image: mongo:latest
  container_name: fulbo_mongo
  restart: always
  environment:
    MONGO_INITDB_ROOT_USERNAME: fulbo_admin
    MONGO_INITDB_ROOT_PASSWORD: fulbo_password_secure
  ports:
    - "27017:27017"
  volumes:
    - ./database/volumes/mongo_data:/data/db
```
