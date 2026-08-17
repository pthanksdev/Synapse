# ⚡ Synapse Enterprise Platform

> **Synapse** is an ultra-fast, real-time messaging and collaborative enterprise communications platform built with a **Hybrid Dual-Database Engine (PostgreSQL + MongoDB)**, **React 19**, **Vite 8**, **Node.js**, **Express**, **Socket.IO**, and **ImageKit CDN**.

---

## 📋 Table of Contents
1. [🌟 Key Features](#-key-features)
2. [🛠️ Architecture & Dual-Database Engine](#-architecture--dual-database-engine)
3. [📊 Database Schemas & Models](#-database-schemas--models)
   - [🐘 PostgreSQL Schema (Prisma ORM)](#-postgresql-schema-prisma-orm)
   - [🍃 MongoDB Schema (Mongoose ODM)](#-mongodb-schema-mongoose-odm)
4. [🔌 Socket.IO Real-Time Events](#-socketio-real-time-events)
5. [🌐 REST API Reference](#-rest-api-reference)
6. [🎨 100% Database-Driven Customization](#-100-database-driven-customization)
7. [☁️ Cloud Media Pipeline (ImageKit CDN)](#-cloud-media-pipeline-imagekit-cdn)
8. [🛡️ Master Control Center (Admin Dashboard)](#-master-control-center-admin-dashboard)
9. [📦 Environment Variables](#-environment-variables)
10. [🔑 How to Obtain & Create Each Environment Variable](#-how-to-obtain--create-each-environment-variable)
11. [🚦 Installation & Local Development](#-installation--local-development)
12. [🐳 Production & Docker Deployment](#-production--docker-deployment)
13. [🔒 Security & Privacy Practices](#-security--privacy-practices)
14. [🛠️ Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🌟 Key Features

### 🚀 Real-time Messaging & Communications
- **Socket.IO WebSockets**: Instant direct 1-on-1 and multi-user group chat delivery with sub-10ms server dispatch.
- **Live Presence & Typing Indicators**: Dynamic online status badges and active user typing feedback.
- **Message Reactions & Starred Messages**: Emoji reactions, message bookmarking/starring, and threaded replies.
- **Ephemeral View-Once Messages**: Self-destructing images and videos that disappear permanently after opening.
- **End-to-End Passphrase Encryption**: Optional 3-word passphrase security locking sensitive chat payloads.
- **WebRTC Voice & Video Calling**: Real-time peer-to-peer audio and video calls inside the browser.
- **24-Hour Ephemeral Stories**: Expiring media stories accessible by contacts for 24 hours.

### 🔀 Hybrid Dual-Database Storage Architecture
- **PostgreSQL (Prisma ORM)**: Serves as the primary relational engine for high-integrity user models, auth refresh tokens, relational group memberships, message reaction tables, and pinned chats.
- **MongoDB (Mongoose ODM)**: Serves as the dynamic document database powering live custom wallpapers, theme color presets, rich message document archives, telemetry analytics, and non-relational user settings.
- **MongoSync Async Pipeline**: Secondary non-blocking sync engine ensuring transactional reliability across PostgreSQL and MongoDB storage nodes.

### 🎨 100% Database-Driven Themes & Wallpapers
- **Zero Static Assets**: All background wallpapers and color theme presets are served dynamically from MongoDB.
- **Live Admin Customization Studio**: Create new primary/secondary color schemes and wallpaper categories in real time.
- **Instant Client Propagation**: UI updates sync immediately across active user sessions without requiring app rebuilds.

### ☁️ Cloud Media Engine (ImageKit CDN)
- **100% CDN Media Hosting**: User avatars, chat attachments, group icons, stories, and wallpapers stream directly from ImageKit CDN.
- **Decoupled Architecture**: Only high-speed CDN URLs (`https://ik.imagekit.io/...`) are stored in the database.

---

## 🛠️ Architecture & Dual-Database Engine

```
+-------------------------------------------------------------------------+
|                              Vite SPA Client                            |
|             React 19 | Tailwind CSS | Zustand | Lucide Icons             |
+------------------------------------+------------------------------------+
                                     |
                          HTTP REST / WebSockets
                                     |
+------------------------------------v------------------------------------+
|                         Node.js / Express Server                        |
|        Socket.IO Gateway | JWT Auth Guard | ImageKit Node SDK           |
+------------------+-----------------+-------------------+----------------+
                   |                 |                   |
         +---------v-------+  +------v-------+  +--------v-------+
         |   PostgreSQL    |  | MongoDB      |  | ImageKit CDN   |
         |  Prisma Engine  |  | Dynamic Docs |  | Media Assets   |
         | Users & Tokens  |  | Themes & Wall|  | Photos & Video |
         +-----------------+  +--------------+  +----------------+
```

---

## 📊 Database Schemas & Models

### 🐘 PostgreSQL Schema (Prisma ORM)

```prisma
// Users Table
model User {
  id                  String               @id @default(uuid())
  email               String               @unique
  fullName            String
  passwordHash        String
  profilePic          String?              @default("")
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt

  refreshTokens       RefreshToken[]
  sentMessages        Message[]            @relation("SentMessages")
  receivedMessages    Message[]            @relation("ReceivedMessages")
  groupMemberships    GroupMember[]
  reactions           Reaction[]
  pinnedChats         PinnedChat[]
}

// Relational Groups & Memberships
model Group {
  id          String        @id @default(uuid())
  name        String
  avatarUrl   String?       @default("")
  description String?       @default("")
  members     GroupMember[]
  messages    Message[]
}

// Relational Message Engine
model Message {
  id           String        @id @default(uuid())
  senderId     String
  receiverId   String?
  groupId      String?
  text         String?
  imageUrl     String?
  videoUrl     String?
  status       MessageStatus @default(SENT)
  replyToId    String?
  reactions    Reaction[]
}
```

### 🍃 MongoDB Schema (Mongoose ODM)

#### `Wallpaper` Document
```javascript
{
  wallpaperId: { type: String, required: true, unique: true },
  category: { type: String, default: "custom" },
  label: { type: String, required: true },
  url: { type: String, required: true }, // ImageKit CDN URL
  isActive: { type: Boolean, default: true }
}
```

#### `Theme` Document
```javascript
{
  themeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  primaryColor: { type: String, required: true }, // Hex e.g. #3b82f6
  secondaryColor: { type: String, required: true }, // Hex e.g. #1e293b
  isDark: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}
```

---

## 🔌 Socket.IO Real-Time Events

| Event Name | Direction | Payload | Description |
| :--- | :---: | :--- | :--- |
| `getOnlineUsers` | Server ➔ Client | `[userIds]` | Broadcasts list of currently online user IDs. |
| `newMessage` | Server ➔ Client | `MessageObject` | Emits newly created direct message to recipient socket. |
| `newGroupMessage` | Server ➔ Client | `MessageObject` | Broadcasts message to all members in a group room. |
| `typing` | Client ➔ Server | `{ senderId, receiverId }` | Triggers active typing indicator on recipient UI. |
| `stopTyping` | Client ➔ Server | `{ senderId, receiverId }` | Removes active typing indicator. |
| `callUser` | Client ➔ Server | `{ userToCall, offer, signalData }` | Initiates WebRTC voice/video call session. |
| `answerCall` | Client ➔ Server | `{ to, signal }` | Accepts incoming WebRTC call session. |

---

## 🌐 REST API Reference

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate credentials & issue JWT tokens.
- `POST /api/auth/logout`: Revoke cookies & terminate active session.
- `POST /api/auth/refresh`: Issue new access token using HttpOnly refresh cookie.
- `PUT /api/auth/profile`: Update user profile details and upload new avatar to ImageKit.

### Wallpapers & Themes (`/api/wallpapers` & `/api/themes`)
- `GET /api/wallpapers`: Fetch all active wallpapers from MongoDB.
- `POST /api/wallpapers` *(Admin)*: Upload image to ImageKit CDN & save new wallpaper to MongoDB.
- `DELETE /api/wallpapers/:id` *(Admin)*: Remove wallpaper from database.
- `GET /api/themes`: Fetch all color theme presets from MongoDB.
- `POST /api/themes` *(Admin)*: Add custom color palette to MongoDB.
- `DELETE /api/themes/:id` *(Admin)*: Delete color theme preset.

### Messages & Conversations (`/api/messages`)
- `GET /api/messages/:id`: Fetch message history with a specific user (supports pagination).
- `POST /api/messages/send/:id`: Send direct message (supports image/video uploads to ImageKit).
- `POST /api/messages/react/:id`: Add or update emoji reaction on a message.
- `POST /api/messages/star/:id`: Bookmark/star a message.

### Master Control Center (`/api/admin`)
- `GET /api/admin/telemetry`: Get real-time CPU, RAM, Socket, and DB health metrics.
- `GET /api/admin/users`: Audit all registered users.
- `POST /api/admin/users/:id/suspend`: Toggle user account suspension.
- `DELETE /api/admin/messages/:id`: Administrative deletion of violating messages.

---

## 🎨 100% Database-Driven Customization

Unlike conventional chat applications that hardcode static wallpaper assets and CSS themes into the frontend bundle, **Synapse stores all visual configuration in MongoDB**:

1. **Zero Bundle Bloat**: High-resolution wallpaper files are stored on ImageKit CDN, eliminating local public assets.
2. **Instant Asset Deployment**: Administrators can introduce seasonal themes or new wallpapers via the Admin Dashboard without rebuilding or redeploying code.
3. **Fallback Resiliency**: Automatic sorting and dynamic fallback categories ensure the UI remains functional regardless of network latency.

---

## ☁️ Cloud Media Pipeline (ImageKit CDN)

Every media file uploaded within Synapse is processed through ImageKit:
```
[ User Upload ] ──> [ Multer Memory Buffer ] ──> [ ImageKit SDK Upload ]
                                                          │
                                                          ▼
[ Database Document ] <── [ Returns CDN URL ] <── [ ImageKit Global Edge ]
```

- **Chat Attachments**: Images, videos, and documents sent in direct/group messages.
- **Avatars**: User profile photos and group chat covers.
- **Stories**: 24-hour expiring media stories.
- **Wallpapers**: High-definition chat backgrounds.

---

## 🛡️ Master Control Center (Admin Dashboard)

The **Synapse Admin Control Center** accessible at `/admin` provides enterprise administrative control:

- **System Telemetry**: Real-time Node.js process uptime, CPU load, memory allocation, PostgreSQL & MongoDB database connectivity status.
- **User Auditing**: Search user directory, assign administrative roles, or suspend abusive accounts.
- **Message Moderation**: Inspect message activity logs and perform administrative soft/hard message deletions.
- **Asset Studio**: Create color theme palettes (primary/secondary hex) and upload custom wallpapers directly to ImageKit CDN and MongoDB.

---

## 📦 Environment Variables

### Backend Configuration (`backend/.env`)

```env
# Server Setup
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Relational Database (PostgreSQL / Prisma)
DATABASE_URL=postgresql://postgres:password@localhost:5432/synapse?schema=public

# Document Database (MongoDB / Mongoose)
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/synapse?retryWrites=true&w=majority

# JWT Authentication Secrets
JWT_ACCESS_SECRET=synapse_access_secret_key_2026
JWT_REFRESH_SECRET=synapse_refresh_secret_key_2026

# ImageKit CDN Storage
IMAGEKIT_PRIVATE_KEY=private_your_imagekit_private_key_here
```

### Frontend Configuration (`frontend/.env`)

```env
# Optional API Endpoint Override
VITE_API_URL=http://localhost:3000
```

---

## 🔑 How to Obtain & Create Each Environment Variable

### 1. `DATABASE_URL` (PostgreSQL Connection URI)
- **Local PostgreSQL**:
  ```bash
  postgresql://postgres:your_password@localhost:5432/synapse?schema=public
  ```
- **Cloud Hosted (Neon.tech / Supabase / Render)**:
  1. Sign up for a free cloud PostgreSQL provider like [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
  2. Create a new database project named `synapse`.
  3. Copy the pooled PostgreSQL Connection String (`postgres://...`).
  4. Paste into `DATABASE_URL` in `backend/.env`.

---

### 2. `MONGO_URI` (MongoDB Atlas Connection URI)
1. Sign up or log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 Cluster.
3. Under **Database Access**, create a database user (e.g. `synapse_user` with a strong password).
4. Under **Network Access**, click **Add IP Address** ➔ Select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** ➔ Choose **Drivers (Node.js)**.
6. Copy the connection string:
   ```bash
   mongodb+srv://<username>:<password>@cluster.mongodb.net/synapse?retryWrites=true&w=majority
   ```
7. Replace `<username>` and `<password>` with your database user credentials and paste into `MONGO_URI`.

---

### 3. `IMAGEKIT_PRIVATE_KEY` (ImageKit CDN Storage Key)
1. Register a free account at [ImageKit.io](https://imagekit.io).
2. Once logged in, navigate to **Developer Options** in the sidebar.
3. Locate **API Keys**.
4. Copy your **Private Key** (starts with `private_...`).
5. Paste into `IMAGEKIT_PRIVATE_KEY` in `backend/.env`.

---

### 4. `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`
Generate secure random 64-character hex secrets using Node.js crypto in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run this command twice to generate two distinct keys:
- Paste the first generated key into `JWT_ACCESS_SECRET`.
- Paste the second generated key into `JWT_REFRESH_SECRET`.

---

### 5. `PORT`, `FRONTEND_URL` & `NODE_ENV`
- `PORT`: Set to `3000` for local development or leave default for cloud deployment hosts (like Render/Railway).
- `FRONTEND_URL`: Set to `http://localhost:5173` for local Vite development, or your production domain (e.g. `https://synapse-app.vercel.app`).
- `NODE_ENV`: Set to `development` locally or `production` on live servers.

---

### 6. `VITE_API_URL` (Frontend Environment Variable)
- For local development where Vite runs on port `5173` and Express runs on port `3000`:
  Create `frontend/.env` and add:
  ```env
  VITE_API_URL=http://localhost:3000
  ```
- If deploying as a unified single-container app (Docker/Render where Express serves static frontend build files), leave `VITE_API_URL` blank.

---

## 🚦 Installation & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/imessage-master.git
cd imessage-master
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Setup Databases (PostgreSQL + MongoDB)
```bash
# Push Prisma Schema to PostgreSQL
cd backend
npx prisma db push
```

### 4. Configure Environment Variables
Copy `.env.example` in `backend/` to `.env` and fill in your PostgreSQL, MongoDB, and ImageKit credentials:
```bash
cp backend/.env.example backend/.env
```

### 5. Run Development Servers
```bash
# Terminal 1: Backend API & Socket Server
cd backend
npm run dev

# Terminal 2: Frontend Vite Server
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🐳 Production & Docker Deployment

Synapse includes a multi-stage Docker build packaging both Vite SPA assets and the Express API into a lightweight container:

```bash
# Build production Docker image
docker build -t synapse-app .

# Execute container
docker run -d \
  --name synapse_container \
  -p 3001:3001 \
  --env-file backend/.env \
  synapse-app
```

---

## 🔒 Security & Privacy Practices

1. **Dual Token JWT Architecture**: Short-lived access tokens delivered via headers; long-lived refresh tokens stored in HttpOnly, SameSite cookies.
2. **Password Security**: Passwords salted and hashed with `bcryptjs`.
3. **Encrypted Payloads**: 3-word passphrase message locking protects private messages at rest.
4. **Role Guards**: Express middleware (`protectRoute`, `requireAdmin`) enforces strict endpoint access.

---

## 🛠️ Troubleshooting & FAQ

#### Q: PostgreSQL connection error (`P1001`).
- Ensure `DATABASE_URL` is set correctly in `backend/.env` and your PostgreSQL database instance is active.
- Run `npx prisma db push` inside `backend/` to synchronize database schemas.

#### Q: Wallpapers or themes are not loading.
- Ensure `MONGO_URI` is correctly set in `backend/.env` and your MongoDB database connection is active.

#### Q: Image uploads fail with a 500 error.
- Check that `IMAGEKIT_PRIVATE_KEY` is present in `backend/.env`.

---

## 📄 License
This project is released under the **MIT License**.
# Synapse
