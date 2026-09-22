# Fulbo Backend — Development Plan

> Mobile-first football/soccer field (cancha) booking platform for Peru.
> This document is the single source of truth for the backend build.

---

## 1. Overview

The frontend (React + Vite + TypeScript) is already complete and written against a
presumed REST API at `http://localhost:4000/api` plus Socket.IO for chat. **No backend
exists yet.** This plan defines the backend, the business logic, and PWA enablement.

**Goal:** make the app functional end-to-end (book a field, manage it as an owner).

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PWA Frontend (React + Vite)             │
│  Installable · Offline caching · Push-ready                 │
│  Port 5173 · VITE_API_BASE_URL=http://localhost:4000/api    │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST + JWT Bearer
┌──────────────────────────▼──────────────────────────────────┐
│                 NestJS Backend (TypeScript)                 │
│  Port 4000 · Modular · Swagger at /api/docs                 │
│  Auth · Users · Fields · Bookings · Products · Promotions   │
│  Schedule · Reviews · Manager · Upload                      │
└──────┬───────────────┬──────────────┬───────────────────────┘
       │               │              │
       ▼               ▼              ▼
┌──────────┐    ┌───────────┐  ┌───────────┐
│PostgreSQL│    │  Twilio   │  │ Cloudinary│
│ (Prisma) │    │  (SMS)    │  │ (Images)  │
│Port 5432 │    │           │  │           │
└──────────┘    └───────────┘  └───────────┘
```

---

## 3. Tech Stack & Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | NestJS 12 (installed) | TypeScript-native, modular DI, guards/pipes, Swagger auto-gen |
| Database | PostgreSQL 16 | Relational domain (bookings, conflicts, permissions), ACID for reservations |
| ORM | Prisma 7 (installed 7.10.0) | Type-safe schema, migrations. **Note: Prisma 7 breaking changes** |
| Auth | JWT + Passport | Email/password, Google OAuth, Facebook, phone OTP |
| SMS/OTP | Twilio Verify | Built-in OTP service, rate limits, expiry |
| Payments | Mercado Pago | Peru-local (S/, Yape, Plin QR). **Phase 2** |
| Images | Cloudinary | Frontend already calls `/upload` endpoints |
| Validation | class-validator + class-transformer | NestJS native DTO validation |
| Testing | Vitest + Supertest | Scaffold uses Vitest (not Jest) |
| Local dev | Docker Compose | Postgres + backend, one command |

### Prisma 7 breaking changes (important)
- `datasource.url` no longer lives in `schema.prisma` → moved to `prisma.config.ts`
- Generator is `prisma-client` (not `prisma-client-js`) with a **required** `output` path
- `PrismaClient` is instantiated with a **driver adapter** (`@prisma/adapter-pg` → `PrismaPg`)
- Generated client lives at `src/generated/prisma/client.ts`
- `dotenv` loads env in `prisma.config.ts`

---

## 4. Project Structure

```
backend/
├── prisma.config.ts            # Prisma 7 CLI config (datasource url, migrations)
├── prisma/
│   ├── schema.prisma           # Full schema (Part B)
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── main.ts                 # Bootstrap: Swagger, CORS, validation, port 4000
│   ├── app.module.ts           # ConfigModule (global) + PrismaModule
│   ├── generated/prisma/       # GENERATED client (gitignored)
│   ├── prisma/
│   │   ├── prisma.module.ts    # @Global provider
│   │   └── prisma.service.ts   # PrismaClient + PrismaPg adapter
│   ├── common/
│   │   ├── decorators/         # @Roles, @CurrentUser, @Public
│   │   ├── enums/              # Role enum
│   │   ├── filters/            # AllExceptionsFilter
│   │   └── guards/             # JwtAuthGuard, RolesGuard
│   ├── auth/                   # login, register, social, send-otp, verify-otp
│   ├── users/                  # profile, phone, promote-to-manager
│   ├── fields/                 # public + manager CRUD + availability
│   ├── bookings/               # create, cancel, history, conflict check
│   ├── products/               # FulVaso CRUD
│   ├── promotions/             # CRUD + deactivate
│   ├── schedule/               # blocks + conflict detection
│   ├── reviews/                # create, list, can-review
│   ├── manager/                # stats, profile, payment-settings, bookings
│   └── upload/                 # Cloudinary single/multi/delete
├── test/
│   ├── unit/
│   └── e2e/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── .env
```

---

## 5. Database Schema (Prisma)

```prisma
enum Role { PLAYER MANAGER }

model User {
  id             String   @id @default(uuid())
  email          String   @unique
  password       String?          // null for social-only accounts
  firstName      String
  lastName       String
  phoneNumber    String?
  phoneVerified  Boolean  @default(false)
  role           Role     @default(PLAYER)
  avatar         String?
  documentType   String?          // DNI / CE / Pasaporte
  documentNumber String?
  city           String?
  district       String?
  position       String?
  bio            String?
  gameLevel      Int      @default(1)  // 1-5 stars
  fields           Field[]
  bookings         Booking[]
  reviews          Review[]
  businessProfile  BusinessProfile?
  paymentSettings  PaymentSettings?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model BusinessProfile {
  id           String   @id @default(uuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  businessName String
  ruc          String              // 11 digits, Peru
  address      String?
  phone        String?
  email        String?
  settings     Json?               // notification + integration toggles
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum FieldType { FIVE_V_FIVE SEVEN_V_SEVEN ELEVEN_V_ELEVEN }
enum FieldStatus { ACTIVE MAINTENANCE }

model Field {
  id               String      @id @default(uuid())
  ownerId          String
  owner            User        @relation(fields: [ownerId], references: [id])
  name             String
  address          String
  description      String?
  type             FieldType
  surface          String?     // synthetic, grass, cement
  capacity         Int?
  basePricePerHour Float
  weekendSurcharge Float?
  nightSurcharge   Float?
  status           FieldStatus @default(ACTIVE)
  amenities        Json        // { lighting: true, parking: false, ... }
  hasFullVaso      Boolean     @default(false)
  fullVasoPromo    String?
  photos         FieldPhoto[]
  products       Product[]
  promotions     Promotion[]
  bookings       Booking[]
  scheduleBlocks ScheduleBlock[]
  reviews        Review[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model FieldPhoto {
  id        String   @id @default(uuid())
  fieldId   String
  field     Field    @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  url       String
  isCover   Boolean  @default(false)
  createdAt DateTime @default(now())
}

enum ProductCategory { BEBIDA SNACK EQUIPO PROMOCION }

model Product {          // FulVaso item
  id          String          @id @default(uuid())
  fieldId     String
  field       Field           @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  name        String
  description String?
  price       Float
  image       String?
  category    ProductCategory
  isActive    Boolean         @default(true)
  bookingItems BookingProduct[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

enum DiscountType { PERCENTAGE FIXED_AMOUNT TWO_FOR_ONE }

model Promotion {
  id            String       @id @default(uuid())
  fieldId       String?
  field         Field?       @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  title         String
  description   String?
  discountType  DiscountType
  discountValue Float
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean      @default(true)
  image         String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

enum BookingStatus { PENDING CONFIRMED CANCELLED }
enum PaymentStatus { PENDING SUCCEEDED FAILED }

model Booking {
  id            String        @id @default(uuid())
  playerId      String
  player        User          @relation(fields: [playerId], references: [id])
  fieldId       String
  field         Field         @relation(fields: [fieldId], references: [id])
  startTime     DateTime
  endTime       DateTime
  totalPrice    Float
  status        BookingStatus @default(PENDING)
  paymentMethod String?       // visa, yape, plin, cash, transfer
  paymentStatus PaymentStatus @default(PENDING)
  matchName     String?
  bookingProducts BookingProduct[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  @@index([fieldId, startTime, endTime])   // conflict detection
}

model BookingProduct {
  id          String  @id @default(uuid())
  bookingId   String
  booking     Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  productId   String
  product     Product @relation(fields: [productId], references: [id])
  quantity    Int
  priceAtTime Float   // snapshot of product price at booking time
}

model ScheduleBlock {
  id        String   @id @default(uuid())
  fieldId   String
  field     Field    @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  startTime DateTime
  endTime   DateTime
  reason    String   // maintenance, personal, event
  note      String?
  createdBy String
  createdAt DateTime @default(now())
  @@index([fieldId, startTime, endTime])
}

model Review {
  id        String   @id @default(uuid())
  fieldId   String
  field     Field    @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  playerId  String?
  player    User?    @relation(fields: [playerId], references: [id])
  rating    Int      // 1-5
  comment   String?
  tags      String[] // predefined Spanish tags
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@unique([fieldId, playerId])   // one review per player per field
}

model PaymentSettings {
  id                  String  @id @default(uuid())
  userId              String  @unique
  user                User    @relation(fields: [userId], references: [id])
  yapeEnabled         Boolean @default(false)
  yapePhone           String?
  plinEnabled         Boolean @default(false)
  plinPhone           String?
  bankTransferEnabled Boolean @default(false)
  bankName            String?
  bankAccountNumber   String?
  bankAccountHolder   String?
  bankCci             String?
  cashEnabled         Boolean @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

---

## 6. API Endpoints (frontend contract — source of truth)

Base: `/api` (global prefix). Frontend reads `errorData.message` on errors.

> **Response shape rule:** return RAW data (no `{ data }` wrapper). The frontend's
> `request()` returns `response.json()` directly. Error responses are
> `{ statusCode, message, error, path, timestamp }`, preserving extra fields like
> `conflicts` on 409.

### Auth
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/auth/login` | No | `{ email, password }` | `{ token, user }` |
| POST | `/auth/register` | No | `{ email, password, firstName, lastName, phoneNumber?, documentType?, documentNumber?, city?, district? }` | `{ token?, user }` |
| POST | `/auth/social` | No | `{ email, firstName, lastName, provider, providerId, photoUrl? }` | `{ token, user }` |
| POST | `/auth/send-otp` | Yes | `{ phone, countryCode }` | `{ success, message, expiresIn }` |
| POST | `/auth/verify-otp` | Yes | `{ phone, code }` | `{ success, verified, token? }` |

### Users
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/users/profile` | JWT | `{ first_name, last_name, email, phone_number, role }` |
| PUT | `/users/phone` | JWT | `{ success, user }` |
| POST | `/users/promote-to-manager` | JWT | `{ success, user }` |

### Fields (public)
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/fields` | No | `Field[]` (optional `?lat=&lng=`) |
| GET | `/fields/:id` | No | `Field` (photos, amenities, rating, reviews) |
| GET | `/fields/:id/availability` | No | `{ fieldId, fieldName, startDate, endDate, unavailableSlots[] }` |

### Fields (manager)
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/manager/fields` | MANAGER | `Field[]` |
| POST | `/manager/fields` | MANAGER | `Field` |
| GET/PUT/DELETE | `/manager/fields/:id` | MANAGER | `Field` / `void` |

### Products (FulVaso, manager)
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/manager/fields/:fieldId/products` | MANAGER | `Product[]` |
| POST | `/manager/fields/:fieldId/products` | MANAGER | `{ message, product }` |
| GET | `/manager/products/:id` | MANAGER | `ProductWithField` |
| PUT | `/manager/products/:id` | MANAGER | `{ message, product }` |
| DELETE | `/manager/products/:id` | MANAGER | `{ message }` |
| PATCH | `/manager/products/:id/toggle-active` | MANAGER | `{ message, product: { id, isActive } }` |

### Promotions (manager)
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/manager/fields/:fieldId/promotions` | MANAGER | `Promotion[]` |
| POST | `/manager/fields/:fieldId/promotions` | MANAGER | `{ message, promotion }` |
| GET | `/manager/promotions/:id` | MANAGER | `Promotion` |
| PUT | `/manager/promotions/:id` | MANAGER | `{ message, promotion }` |
| DELETE | `/manager/promotions/:id` | MANAGER | `{ message }` |
| PATCH | `/manager/promotions/:id/deactivate` | MANAGER | `{ message, promotion: { id, isActive } }` |

### Schedule (manager)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/manager/schedule/blocks` | MANAGER | `?startDate=&endDate=` |
| GET | `/manager/fields/:fieldId/schedule/blocks` | MANAGER | — |
| GET | `/manager/schedule/blocks/:id` | MANAGER | — |
| POST | `/manager/schedule/block` | MANAGER | **409 + `{ message, conflicts[] }`** |
| DELETE | `/manager/schedule/block/:id` | MANAGER | — |

### Bookings
| Method | Path | Auth | Response |
|--------|------|------|----------|
| POST | `/bookings` | JWT | `PlayerBooking` (snake_case) |
| GET | `/bookings/user` | JWT | `PlayerBooking[]` |
| GET | `/bookings/field/:fieldId` | MANAGER | `FieldBooking[]` (`?from=&to=`) |
| GET | `/bookings/:id` | JWT | `PlayerBooking` |
| PATCH | `/bookings/:id/cancel` | JWT | `{ message, booking: PlayerBooking }` |

### Manager (stats, profile, payment, bookings)
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/manager/bookings` | MANAGER | `ManagerBooking[]` (`?startDate=&endDate=&fieldId=&status=`) |
| GET | `/manager/stats` | MANAGER | `ManagerStats` (`?period=today\|week\|month\|all`) |
| GET | `/manager/stats/chart` | MANAGER | `[{ day, date, ingresos }]` (`?days=7`) |
| GET | `/manager/profile` | MANAGER | `{ profile: BusinessProfile \| null }` |
| PUT | `/manager/profile` | MANAGER | `BusinessProfile` |
| GET | `/manager/payment-settings` | MANAGER | `PaymentSettings` |
| PUT | `/manager/payment-settings` | MANAGER | `PaymentSettings` |

### Reviews
| Method | Path | Auth | Response |
|--------|------|------|----------|
| POST | `/reviews/:fieldId` | JWT | `Review` (upsert, one per player) |
| GET | `/reviews/:fieldId` | No | `{ reviews, averageRating, totalCount, popularTags }` |
| GET | `/reviews/:fieldId/can-review` | JWT | `{ canReview }` |

### Upload
| Method | Path | Auth | Response |
|--------|------|------|----------|
| POST | `/upload?folder=` | JWT | `{ url }` (multipart `image`) |
| POST | `/upload/multi?folder=` | JWT | `{ urls }` (max 5, `images`) |
| DELETE | `/upload` | JWT | `void` (body `{ url }`) |

---

## 7. Business Logic Rules

### 7.1 Booking conflict detection
On `POST /bookings`:
1. Query existing bookings for `fieldId` where `status IN (PENDING, CONFIRMED)` AND time ranges overlap: `existing.startTime < new.endTime AND existing.endTime > new.startTime`
2. Query schedule blocks with overlapping ranges
3. Any conflict → `409` with conflict details
4. No conflict → calculate price → create booking + booking products

### 7.2 Price calculation
```
total = basePricePerHour * durationHours
      + weekendSurcharge (Sat/Sun)
      + nightSurcharge (19:00–23:00)
      + Σ(product.price × qty)   // FulVaso items
      + serviceFee               // if FulVaso items present
```

### 7.3 Phone verification gate (server-enforced)
- `POST /bookings` → reject if `phoneVerified === false`
- `POST /users/promote-to-manager` → reject if unverified
- Phase 2: team creation, search-event publishing also gated

### 7.4 Privacy: phone number access
- Player sees own phone via `GET /users/profile`
- Manager sees customer phone ONLY for bookings on their fields
- Never exposed in public listings, reviews, or search results

### 7.5 Ownership guards
- Manager CRUD fields only where `field.ownerId === req.user.id`
- Manager views bookings only for own fields
- Player views/cancels only own bookings
- Review requires a completed booking at that field

### 7.6 Stats aggregation
```
totalRevenue   = SUM(totalPrice) WHERE status=CONFIRMED AND paymentStatus=SUCCEEDED
totalBookings  = COUNT WHERE fieldId IN (manager's fields)
uniqueCustomers = COUNT(DISTINCT playerId)
chartData      = GROUP BY DATE(createdAt), SUM(totalPrice), last N days
```

---

## 8. PWA Setup (Part J)

Frontend changes:
1. Install `vite-plugin-pwa`
2. `public/manifest.json`: name "Fulbo", theme `#047857`, display `standalone`, orientation portrait, icons 192/512/maskable
3. `vite.config.ts` → `VitePWA({ registerType: 'autoUpdate', ... })`
4. `index.html` → `theme-color`, `apple-touch-icon`
5. Generate icons from the Fulbo logo (`frontend/src/assets/de50d61e...png`)
6. Add `VITE_API_BASE_URL` env; replace hardcoded `localhost:4000` / `localhost:3000`

Offline strategy: app shell (CacheFirst), API (NetworkFirst), images (CacheFirst).

### Known frontend bugs to fix (Part J)
1. Missing deps: `socket.io-client`, `@react-oauth/google` (imported but not in package.json)
2. Hardcoded API base URL across files (also `:3000` in FieldMapScreen)
3. Duplicate source trees `src/` vs `src/app/` (active one is `src/app/`)

---

## 9. Environment Variables (`.env`)

```
DATABASE_URL=postgresql://fulbo:fulbo_dev@localhost:5432/fulbo_dev?schema=public
PORT=4000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=...
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=...
FACEBOOK_APP_ID=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MERCADO_PAGO_ACCESS_TOKEN=...
```

---

## 10. Implementation Plan (stop-and-go, 11 parts)

| Part | Scope | Checkpoint |
|------|-------|-----------|
| **A** ✅ | Scaffold + Docker + config + common infra | `npm run build` + lint pass |
| **B** | Prisma schema + migrations + seed | `prisma studio` shows tables |
| **C** | Auth module (login, register, social, OTP, JWT) | Swagger auth endpoints work |
| **D** | Users module (profile, phone, promote) | fetch profile, promote |
| **E** | Fields module (public + manager CRUD + availability) | list/create/edit fields |
| **F** | Upload + Products + Promotions | upload + product/promo CRUD |
| **G** | Schedule module (blocks + conflict detection) | 409 on overlap |
| **H** | Bookings module (core flow) | register→verify→book→manager sees |
| **I** | Manager stats + Reviews | dashboard data + reviews |
| **J** | Frontend PWA + fixes | installable, API wired |
| **K** | Tests + integration | vitest unit + e2e pass |

### Deferred to Phase 2 (NOT in this plan)
- Chat (Socket.IO real-time)
- Friends + friend requests
- Teams + lineups + team chat
- Search events (rival/players publish + join)
- Advertising campaigns (visibility boost)
- Staff management (roles/permissions)
- Mercado Pago payment processing
- Push notifications
- Player profile stats (real data)

---

## 11. Testing Strategy

| Type | Scope | Tool | Coverage |
|------|-------|------|----------|
| Unit | Services (price calc, conflict detection, phone gate) | Vitest | Key services |
| e2e | API endpoints (auth, bookings, fields, ownership) | Vitest + Supertest | All Phase 1 endpoints |

---

## 12. Current Progress

### Done (Part A)
- [x] NestJS 12 scaffold, deps installed (incl. `@prisma/adapter-pg`, `dotenv`, `tsx`)
- [x] Prisma 7 setup: `prisma.config.ts`, `schema.prisma` (generator fixed), generated client
- [x] `prisma.service.ts` (PrismaPg adapter), `prisma.module.ts`
- [x] Common infra: guards (`JwtAuthGuard`, `RolesGuard`), decorators (`@Roles`, `@CurrentUser`, `@Public`), `Role` enum, `AllExceptionsFilter`
- [x] `main.ts`: Swagger, CORS, validation pipe, global filter, `/api` prefix, port 4000
- [x] Docker: `docker-compose.yml`, `Dockerfile`, `.dockerignore`
- [x] `.env` / `.env.example` / `.gitignore`
- [x] Verified: `npm run build` ✅, `npm run lint` ✅, `prisma validate` ✅, `prisma generate` ✅

### Pending
- [ ] Part B → Part K (see table above)
- [ ] Start Docker Desktop, `docker compose up -d postgres`, boot API
