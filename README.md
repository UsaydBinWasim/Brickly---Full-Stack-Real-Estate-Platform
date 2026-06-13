# Brickly — Real Estate Listing Platform

Brickly is a full-stack real estate listing SaaS application that lets users browse, list, and manage properties with an admin approval workflow. Built with a modern stack: **Express 5** + **Mongoose 9** on the backend and **Next.js 16** + **React 19** + **Tailwind CSS 4** on the frontend.

---

## Table of Contents

- [Featuress](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone & Install](#1-clone--install)
  - [2. Environment Variables](#2-environment-variables)
  - [3. Start MongoDB](#3-start-mongodb)
  - [4. Run the Application](#4-run-the-application)
- [API Reference](#api-reference)
  - [Auth](#auth-endpoints)
  - [Properties](#property-endpoints)
  - [Favorites](#favorite-endpoints)
  - [Admin](#admin-endpoints)
- [Database Models](#database-models)
- [Frontend Pages](#frontend-pages)
- [Authentication & Authorization](#authentication--authorization)
- [Test Credentials](#test-credentials)

---

## Features

- **Property Listings** — Browse approved real estate listings with filtering by location, price range, number of bedrooms, and type (rent/sale). Paginated results.
- **User Dashboard** — Authenticated users can create new property listings, view their submissions, and delete their own properties.
- **Admin Panel** — Admins can review all submitted properties and approve or reject them. Supports status-based filtering.
- **Favorites** — Logged-in users can save properties to their favorites list.
- **Role-Based Access** — Two roles (`user` and `admin`) with protected routes and middleware-enforced authorization.
- **JWT Authentication** — Secure token-based auth with bcrypt password hashing (12 salt rounds) and 7-day token expiry.
- **Approval Workflow** — New listings start with `pending` status and only appear publicly after admin approval.
- **Responsive UI** — Tailwind CSS 4 powered responsive design with a consistent dark-themed interface.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Runtime** | Node.js | 18+ |
| **Backend Framework** | Express | 5.x |
| **ODM** | Mongoose | 9.x |
| **Database** | MongoDB | 6+ |
| **Auth** | JSON Web Tokens (jsonwebtoken) | 9.x |
| **Password Hashing** | bcryptjs | 3.x |
| **Security** | Helmet | 8.x |
| **CORS** | cors | 2.x |
| **Logging** | Morgan | 1.x |
| **Frontend Framework** | Next.js | 16.x |
| **UI Library** | React | 19.x |
| **Language** | TypeScript | 5.x |
| **CSS** | Tailwind CSS | 4.x |
| **Dev Tools** | Nodemon, ESLint, PostCSS | — |

---

## Architecture

Brickly follows a **layered MVC + Services** architecture on the backend and a **file-based routing** architecture on the frontend.

```
Client (Next.js)  ──HTTP──▶  Express API  ──Mongoose──▶  MongoDB
                              │
                    Routes → Controllers → Services → Models
```

### Backend Layers

| Layer | Responsibility |
|---|---|
| **Routes** | Define HTTP endpoints and attach middleware |
| **Controllers** | Handle request/response, delegate to services |
| **Services** | Business logic, database queries, validations |
| **Models** | Mongoose schemas, hooks, instance methods |
| **Middleware** | Auth (JWT verify, role check), error handling |

### Frontend Layers

| Layer | Responsibility |
|---|---|
| **Pages** (`app/`) | Route-mapped React components with data fetching |
| **Components** | Reusable UI elements (Navbar, PropertyCard, etc.) |
| **Lib** (`lib/api.ts`) | Shared API fetch helper with auth token injection |
| **Types** | TypeScript interfaces for API responses |

---

## Folder Structure

```
Brickly/
├── .env                          # Backend environment variables
├── package.json                  # Backend dependencies & scripts
├── src/
│   ├── server.js                 # Entry point — connects DB, starts server
│   ├── app.js                    # Express app — middleware, routes, error handler
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── user.model.js         # User schema (email, password, role)
│   │   ├── property.model.js     # Property schema (title, price, location, status…)
│   │   └── favorite.model.js     # Favorite schema (user + property refs)
│   ├── routes/
│   │   ├── auth.routes.js        # POST /register, /login
│   │   ├── property.routes.js    # CRUD + /my for user's listings
│   │   ├── favorite.routes.js    # Add/remove/list favorites
│   │   └── admin.routes.js       # Approve/reject properties
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── property.controller.js
│   │   ├── favorite.controller.js
│   │   └── admin.controller.js
│   ├── services/
│   │   ├── auth.service.js       # Register & login logic, JWT signing
│   │   ├── property.service.js   # CRUD, filtering, pagination
│   │   ├── favorite.service.js   # Favorite management
│   │   └── admin.service.js      # Property approval workflow
│   └── middleware/
│       ├── auth.middleware.js     # protect (JWT) & authorize (role)
│       └── error.middleware.js    # Global error handler
│
├── client/                       # Next.js frontend
│   ├── .env.local                # Frontend environment variables
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   └── src/
│       ├── lib/
│       │   └── api.ts            # apiFetch helper, auth utilities
│       ├── types/
│       │   └── index.ts          # Property, User, PaginatedResponse interfaces
│       ├── components/
│       │   ├── Navbar.tsx         # Auth-aware navigation bar
│       │   ├── PropertyCard.tsx   # Property listing card
│       │   ├── PropertyForm.tsx   # Create/edit property form
│       │   ├── FilterSidebar.tsx  # Search filters (location, price, type…)
│       │   ├── DashboardSidebar.tsx
│       │   └── AdminTable.tsx     # Admin properties table
│       └── app/
│           ├── layout.tsx         # Root layout with Navbar
│           ├── page.tsx           # Home — featured properties
│           ├── globals.css        # Global styles
│           ├── login/page.tsx     # Login form
│           ├── register/page.tsx  # Registration form
│           ├── properties/
│           │   ├── page.tsx       # Browse listings with filters & pagination
│           │   └── [id]/page.tsx  # Property detail + save to favorites
│           ├── dashboard/page.tsx # User dashboard — manage own listings
│           └── admin/page.tsx     # Admin panel — approve/reject
```

---

## Prerequisites

- **Node.js** 18 or higher
- **MongoDB** 6 or higher (running locally or a remote URI)
- **npm** 9+

---

## Getting Started

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/brickly.git
cd brickly

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment Variables

**Backend** — create `.env` in the project root:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/brickly
JWT_SECRET=change_this_to_a_strong_random_secret
JWT_EXPIRES_IN=7d
```

**Frontend** — create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

Make sure MongoDB is running on `localhost:27017` (or update `MONGO_URI` accordingly):

```bash
# Windows (if installed as a service)
net start MongoDB

# macOS / Linux
mongod --dbname brickly
```

### 4. Run the Application

Open two terminals:

**Terminal 1 — Backend** (from project root):

```bash
npm run dev
```

The API server starts on `http://localhost:5000`. You should see:

```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

**Terminal 2 — Frontend** (from `client/`):

```bash
cd client
npm run dev
```

The frontend starts on `http://localhost:3000` with Turbopack.

---

## API Reference

Base URL: `http://localhost:5000/api`

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns API status |

**Response:**

```json
{ "success": true, "message": "Brickly API is running" }
```

---

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create a new user account |
| `POST` | `/api/auth/login` | — | Login and receive a JWT |

#### Register

```json
// Request body
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response (201)
{
  "success": true,
  "data": {
    "user": { "_id": "...", "email": "user@example.com", "role": "user" },
    "token": "eyJhbGciOi..."
  }
}
```

#### Login

```json
// Request body
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response (200)
{
  "success": true,
  "data": {
    "user": { "_id": "...", "email": "user@example.com", "role": "user" },
    "token": "eyJhbGciOi..."
  }
}
```

---

### Property Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/properties` | — | List approved properties (with filters & pagination) |
| `GET` | `/api/properties/my` | Bearer | Get current user's listings (all statuses) |
| `GET` | `/api/properties/:id` | — | Get a single property by ID |
| `POST` | `/api/properties` | Bearer | Create a new property (status = `pending`) |
| `PUT` | `/api/properties/:id` | Bearer | Update a property (owner or admin only) |
| `DELETE` | `/api/properties/:id` | Bearer | Delete a property (owner or admin only) |

#### Query Parameters for `GET /api/properties`

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |
| `location` | string | Case-insensitive location filter (regex match) |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `bedrooms` | number | Exact bedroom count |
| `type` | string | `"rent"` or `"sale"` |

#### Response Format (Paginated)

```json
{
  "success": true,
  "data": {
    "results": [ /* array of Property objects */ ],
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### Favorite Endpoints

All favorite routes require authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/favorites` | Bearer | List user's favorite properties |
| `POST` | `/api/favorites/:propertyId` | Bearer | Add a property to favorites |
| `DELETE` | `/api/favorites/:propertyId` | Bearer | Remove a property from favorites |

---

### Admin Endpoints

All admin routes require authentication **and** the `admin` role.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/properties` | Bearer + Admin | List all properties (optional `status` filter) |
| `PATCH` | `/api/admin/properties/:id/approve` | Bearer + Admin | Approve a pending property |
| `PATCH` | `/api/admin/properties/:id/reject` | Bearer + Admin | Reject a property |

---

## Database Models

### User

| Field | Type | Details |
|---|---|---|
| `email` | String | Required, unique, lowercase, trimmed, validated with regex |
| `password` | String | Required, min 6 chars, excluded from queries (`select: false`), auto-hashed on save |
| `role` | String | `"user"` (default) or `"admin"` |
| `createdAt` | Date | Auto-set on creation |

**Hooks:** Pre-save hook hashes the password with bcrypt (12 salt rounds) whenever the password field is modified.

**Methods:**
- `comparePassword(candidate)` — compares a plaintext password against the stored hash
- `toJSON()` — strips the `password` field from serialized output

---

### Property

| Field | Type | Details |
|---|---|---|
| `title` | String | Required, trimmed |
| `description` | String | Required, trimmed |
| `price` | Number | Required, min 0 |
| `location` | String | Required, trimmed |
| `bedrooms` | Number | Optional, min 0 |
| `bathrooms` | Number | Optional, min 0 |
| `area` | Number | Optional, min 0 (sq ft) |
| `type` | String | `"rent"` or `"sale"` |
| `status` | String | `"pending"` (default), `"approved"`, or `"rejected"` |
| `user` | ObjectId | Reference to the `User` who created it |
| `createdAt` | Date | Auto-set on creation |

**Indexes:** `{ status, price }`, `{ user }`, `{ location }`

---

### Favorite

| Field | Type | Details |
|---|---|---|
| `user` | ObjectId | Reference to `User` |
| `property` | ObjectId | Reference to `Property` |
| `createdAt` | Date | Auto-set on creation |

**Indexes:** `{ user, property }` — compound unique index to prevent duplicate favorites.

---

## Frontend Pages

| Route | Page | Auth Required | Description |
|---|---|---|---|
| `/` | Home | No | Hero section with featured approved properties |
| `/login` | Login | No | Email/password login form. Redirects admin → `/admin`, user → `/dashboard` |
| `/register` | Register | No | New user registration form |
| `/properties` | Browse | No | All approved listings with sidebar filters and pagination |
| `/properties/:id` | Detail | No (save requires auth) | Full property details with "Save to Favorites" button |
| `/dashboard` | Dashboard | Yes (user) | View, create, and delete own property listings |
| `/admin` | Admin Panel | Yes (admin) | Review all properties, approve/reject with status filter tabs |

### Auth Guards

- **Dashboard** — Checks `localStorage` for a valid token. Redirects to `/login` if not found.
- **Admin** — Checks for valid token **and** `role === "admin"`. Redirects to `/login` if either check fails.

### Key Components

| Component | Purpose |
|---|---|
| `Navbar` | Auth-aware navigation — shows different links based on login state and role. Uses `useSyncExternalStore` to read auth state from `localStorage` without hydration issues. |
| `PropertyCard` | Displays a property summary card with image placeholder, price, location, and bed/bath/area stats |
| `PropertyForm` | Form for creating new property listings (title, description, price, location, bedrooms, bathrooms, area, type) |
| `FilterSidebar` | Search filters panel — location text input, min/max price, bedroom count, rent/sale type selector |
| `AdminTable` | Tabular view of properties for admin review with approve/reject action buttons |
| `DashboardSidebar` | Navigation sidebar for the user dashboard |

---

## Authentication & Authorization

### Flow

1. **Register/Login** — User submits credentials. Server validates, hashes password (register) or compares hash (login), and returns a JWT.
2. **Token Storage** — Frontend stores the JWT and user object in `localStorage`.
3. **Authenticated Requests** — The `apiFetch` helper in `lib/api.ts` automatically attaches `Authorization: Bearer <token>` to every outgoing request.
4. **Server Verification** — The `protect` middleware extracts and verifies the JWT, then attaches `{ userId, role }` to `req.user`.
5. **Role Authorization** — The `authorize("admin")` middleware checks `req.user.role` against allowed roles. Returns 403 if unauthorized.

### JWT Payload

```json
{
  "userId": "665a1b2c3d4e5f6a7b8c9d0e",
  "role": "user",
  "iat": 1717200000,
  "exp": 1717804800
}
```

### Error Responses

| Status | Condition |
|---|---|
| 400 | Validation error (missing/invalid fields) |
| 401 | Missing token, invalid token, expired token, wrong password |
| 403 | Insufficient role (e.g., user accessing admin routes) |
| 404 | Resource not found |
| 409 | Duplicate (email already registered, already in favorites) |
| 500 | Internal server error |

---

## Test Credentials

After seeding the database, you can log in with:

| Role | Email | Password |
|---|---|---|
| **User** | `test@brickly.com` | `Test123!` |
| **Admin** | `admin@brickly.com` | `Admin123!` |

Both users can access `/login`. After login:
- The **user** is redirected to `/dashboard` where they can manage their listings.
- The **admin** is redirected to `/admin` where they can approve or reject submitted properties.

---

## License

MIT
