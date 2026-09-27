---
laya_validation: failed
laya_model: english
laya_checked_at: 2026-09-26T20:35:00Z
---
<!--
Not Laya-validated. After subdividing Parts G and H (per the earlier flag),
12 of 14 tasks pass every check; plan-level deterministic (0.78) and safe (0.77)
pass with confidence. Two residual ambiguity flags are treated as noise and
ruled non-blocking (user directed execution to proceed):
- task 1 (Part B) = 1.68 — describes already-implemented, verified work;
- task 7 (Part G2) = 1.56 — one endpoint, one unit; both carry ~0.02
  confidence (near-chance, below the 0.6 floor). See docs/guides/laya.md
  "Tuning" for why `passed` is unreachable pre-fine-tuning.
-->



# Current backend plan

> Migrated from the former root `BACKEND_PLAN.md`, which has been removed. This is
> the canonical entry point for backend planning and the source of truth for the
> backend build.

## Goal

The React + Vite frontend is already written against a presumed REST API at
`http://localhost:4000/api` plus Socket.IO for chat. Make the app functional
end-to-end (book a field, manage it as an owner) by building the NestJS backend
and enabling the PWA.

The backend is mobile-first for football/soccer field (cancha) booking in Peru.

For the implemented system shape see [backend architecture](../../architecture/backend.md),
[database architecture](../../architecture/database.md), and
[system architecture](../../architecture/system.md). External-service decisions are
recorded in [decisions/](../../decisions/).

## Phase 1 scope

Auth, users, fields, bookings, products (FulVaso), promotions, schedule, reviews,
manager (stats/profile/payment settings), and upload. Real-time chat, social
graph, teams, search events, advertising, staff, payments, and push are Phase 2.

## Implementation plan (stop-and-go, 11 parts)

| Part | Scope | Checkpoint |
|------|-------|-----------|
| **A** ✅ | Scaffold + Docker + config + common infra | `npm run build` + lint pass |
| **B** | Prisma schema + migrations + seed | `prisma studio` shows tables |
| **C** | Auth module (login, register, social, OTP, JWT) | Swagger auth endpoints work |
| **D** | Users module (profile, phone, promote) | fetch profile, promote |
| **E** | Fields module (public + manager CRUD + availability) | list/create/edit fields |
| **F** | Upload + Products + Promotions | upload + product/promo CRUD |
| **G1** | Schedule: list + get blocks (manager, own fields) | manager lists own blocks only |
| **G2** | Schedule: create block + overlap detection | 409 + `conflicts[]` on overlap |
| **G3** | Schedule: delete block (ownership) | delete own block; 403 on others' |
| **H1** | Bookings: create (conflict check, price calc, FulVaso items, phone gate) | verified player books; 409 on overlap |
| **H2** | Bookings: reads (user history, `:id`, field bookings) | player sees own; manager sees own field |
| **H3** | Bookings: cancel (ownership) | player cancels own booking |
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

## API contract (frontend contract — source of truth)

Base: `/api` (global prefix). The frontend reads `errorData.message` on errors.

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

## Business logic rules

### Booking conflict detection

On `POST /bookings`:

1. Query existing bookings for `fieldId` where `status IN (PENDING, CONFIRMED)` AND time ranges overlap: `existing.startTime < new.endTime AND existing.endTime > new.startTime`.
2. Query schedule blocks with overlapping ranges.
3. Any conflict → `409` with conflict details.
4. No conflict → calculate price → create booking + booking products.

### Price calculation

```text
total = basePricePerHour * durationHours
      + weekendSurcharge (Sat/Sun)
      + nightSurcharge (19:00–23:00)
      + Σ(product.price × qty)   // FulVaso items
      + serviceFee               // if FulVaso items present
```

### Phone verification gate (server-enforced)

- `POST /bookings` → reject if `phoneVerified === false`.
- `POST /users/promote-to-manager` → reject if unverified.
- Phase 2: team creation and search-event publishing also gated.

### Privacy: phone number access

- Player sees own phone via `GET /users/profile`.
- Manager sees customer phone ONLY for bookings on their fields.
- Never exposed in public listings, reviews, or search results.

### Ownership guards

- Manager CRUD fields only where `field.ownerId === req.user.id`.
- Manager views bookings only for own fields.
- Player views/cancels only own bookings.
- Review requires a completed booking at that field.

### Stats aggregation

```text
totalRevenue    = SUM(totalPrice) WHERE status=CONFIRMED AND paymentStatus=SUCCEEDED
totalBookings   = COUNT WHERE fieldId IN (manager's fields)
uniqueCustomers = COUNT(DISTINCT playerId)
chartData       = GROUP BY DATE(createdAt), SUM(totalPrice), last N days
```

## Current progress

### Done

- [x] **Part A** — scaffold + Docker + config + common infra (guards, decorators, `Role`, `AllExceptionsFilter`, Swagger, CORS, validation, `/api` prefix, port 4000). Verified: `npm run build` + `npm run lint` pass.
- [x] **Part B** — Prisma schema, initial migration `20260828162515_init`, `seed.ts`. Verified 2026-09-26: `prisma validate` passes, migrations applied, all 11 tables present in PostgreSQL.
- [x] **Part C** — auth module (login, register, social, send-otp, verify-otp; JWT strategy; Twilio service). Verified 2026-09-26: API boots, DB connects, all five auth routes mapped, Swagger at `/api/docs` returns 200, DTO validation active.
- [x] **Part D** — users module (`GET /users/profile`, `PUT /users/phone`, `POST /users/promote-to-manager`). TDD: 5 unit tests (`tests/users.service.spec.ts`). Runtime checkpoint verified: profile returns the snake_case contract shape; promote 403s on unverified phone, then bumps role to `manager` and upserts a `BusinessProfile` once verified.
- [x] **Part E** — fields module: public `GET /fields`, `GET /fields/:id` (rating/reviews), `GET /fields/:id/availability`; manager CRUD `/manager/fields` with ownership 403s. TDD: 15 unit tests (`tests/fields.service.spec.ts`). Runtime checkpoint verified against the seeded data (list/detail/availability positive+negative, create/edit/delete, player→manager route 403).
- [x] **Part F** — upload + products + promotions. Migration `20260927020842_add_two_for_one_discount_type` (enum extension). TDD: 20 unit tests (`tests/{products,promotions,upload}.service.spec.ts`); suite 47/47. Runtime checkpoint: product + promotion CRUD verified via HTTP (including a `two_for_one` promotion); upload returns a clean 503 while Cloudinary creds are unset (ADR 005 — real upload verification deferred until credentials are configured).

Known schema deviations from section "Database schema" (implemented in Part B, accepted): `Field.type` is a `String` (`5v5|7v7|11v11`) instead of a `FieldType` enum; `DiscountType` lacks `TWO_FOR_ONE` (needed by Part F promotions — add with a migration then); `ScheduleBlock.reason` is a `ScheduleBlockReason` enum instead of `String`.

### Pending

- [ ] Part G → Part K (see table above)

## Completion rule

A module may move to `docs/plans/completed/` only when its API contract, migration
impact, authorization rules, and automated checks are documented.
