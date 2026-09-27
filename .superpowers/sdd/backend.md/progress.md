# SDD ledger — plan: docs/plans/current/backend.md

Branch: feat/backend-phase1 (from main @ 1a2a73d). Plan file is also the spec
(migrated from BACKEND_PLAN.md; no separate spec document exists).

Pre-flight:
- Part F promotions consumes `DiscountType` which lacks TWO_FOR_ONE in the
  Part B schema — ruled: extend enum with a migration at Part F start.
- Part H bookings consumes Part E fields + Part F products + Part G2 overlap
  logic — order D→E→F→G→H→I→J→K holds; no other shared interfaces.
- Parts B & C pre-complete: verified this session (see below).

Ruling (Laya gate): residual ambiguity flags task 1 (Part B) 1.68 and
task 7 (G2) 1.56 carry ~0.02 confidence (near-chance); ruled noise,
execution proceeds per user direction. Plan still NOT Laya-validated.

Parts B & C: complete (pre-existing, verified 2026-09-26: npm run build ✅,
npm run lint ✅, prisma validate ✅, migrate status up to date ✅, psql \dt
shows all 11 tables ✅, node dist/main.js boots, DB connects, /api/docs-json
200, five auth routes mapped, DTO validation 400 on empty body ✅)

Part D: complete. TDD: tests/users.service.spec.ts written first, failed on
missing module, then GREEN (5/5; suite = 1 file). npm run build ✅, lint ✅.
Runtime checkpoint: register → GET /api/users/profile 200 snake_case;
POST /api/users/promote-to-manager → 403 unverified; after psql sets
phoneVerified=true → 200, role=manager, BusinessProfile row created.

Part D rulings:
- PUT /users/phone accepts { phone } only and resets phoneVerified=false.
  The guideline doc (frontend/src/guidelines/Phone-Security-Implementation.md)
  suggested a client-sent `verified` flag — rejected: verification must be
  server-enforced via /auth/verify-otp only.
- POST /users/promote-to-manager upserts BusinessProfile (businessName, ruc);
  Part I's GET /manager/profile returns it.
- Unverified promote → 403 ForbiddenException.
- Runtime-checkpoint gotcha (Windows): Get-Content can return an array with a
  trailing empty line — sanitize before interpolating into request bodies.

Part E: complete. TDD: tests/fields.service.spec.ts written first (RED on
missing module), then GREEN (15 tests; suite 20/20). build ✅ lint ✅.
Runtime checkpoint: public GET /fields (3 fields, stats), GET /fields/:id
(rating/reviewCount/photos/amenities), GET availability (positive overlap
window → 1 slot, non-overlap → 0; seeded booking is 2026-08-31T01:00Z);
manager list (3 own) / create (defaults type 7v7, amenities {}) / edit (price
55) / delete; player on /manager/fields → 403.

Part E rulings:
- Contract source: services/api.ts + services/manager.api.ts (the live app
  entry src/main.tsx renders src/app/App.tsx, whose screens are mock-driven;
  the legacy fetch screens in src/components/fulbo/ are unreachable, so their
  snake_case reads (field_id, base_price_per_hour, field_photos, image_url,
  popularTags) are NOT served. Part J wires the service layer.)
- Public list/detail include only ACTIVE promotions; manager views include
  all promotions.
- Field detail returns rating + reviewCount + raw reviews rows (plan wording
  "photos, amenities, rating, reviews"); popularTags/full review listing is
  Part I's /reviews/:fieldId.
- GET /fields?lat=&lng= accepted but ignored — no coordinates in schema
  (Phase 2; FieldMapScreen is legacy/broken to be fixed in Part J).
- DELETE /manager/fields/:id is a hard delete (schema has no soft-delete
  column; Part B accepted cascade deletes). Frontend comment "soft delete"
  not honored.
- CreateFieldDto.type optional, defaults '7v7' in service (frontend
  CreateFieldDto sends no type; schema requires it).

Part F: complete. Migration 20260927020842_add_two_for_one_discount_type
applied (ALTER TYPE ... ADD VALUE 'two_for_one'); client regenerated; seed
compatible (uses percentage only). TDD: products.service.spec.ts (8),
promotions.service.spec.ts (8), upload.service.spec.ts (4) — RED first,
suite 47/47. build ✅ lint ✅. Runtime checkpoint: products CRUD
(create→get(fieldName)→update(imageUrl→image)→toggle→delete) and promotions
CRUD (create two_for_one → get → update → deactivate → delete) verified via
HTTP as manager; upload POST/DELETE without Cloudinary creds → clean 503.

Part F rulings:
- Product create/update accept `imageUrl` (frontend DTO) and store into the
  `image` column; responses return both `image` and `imageUrl`.
- Product/promotion DELETE are hard deletes (no soft-delete column; Part B
  accepted cascades — deleting a product removes its BookingProduct rows).
- Upload without Cloudinary creds → 503 ServiceUnavailable with a clear
  message (ADR 005 stands; real upload verified once creds are configured).
- `?folder=` defaults to 'fulbo'; public id parsed from url after
  '/upload/v<version>/'; DELETE /upload expects { url }.
- tsconfig "types" now includes "multer" (Express.Multer global namespace
  comes from @types/multer; was restricted to vitest/globals+node).

Part G (G1+G2+G3): complete. TDD: tests/schedule.service.spec.ts (11 tests)
RED first; suite 58/58. build ✅ lint ✅. Runtime checkpoint (after inserting a
future confirmed booking via psql — note Booking.updatedAt is NOT NULL, set
now()): overlap block → 409 { statusCode, error, message, conflicts[{
bookingId, startTime, endTime, customerName, customerEmail }], path,
timestamp }; free block → created (fieldName serialized); list all (date
filters) + list by field + get by id + delete all verified.

Part G rulings:
- Block-create overlap checks BOOKINGS only (pending/confirmed); block-vs-block
  overlap is not checked (BookingConflict shape is bookings-only; manager's
  own calendar).
- 409 body: ConflictException({ statusCode, error: 'Conflict', message,
  conflicts }) — the AllExceptionsFilter preserves extra fields and adds
  path/timestamp.
- Runtime-checkpoint gotcha (Windows): Invoke-RestMethod error bodies need
  curl.exe; the PS5.1 StreamReader trick returns empty bodies.

Part H (H1+H2+H3): complete. TDD: tests/bookings.service.spec.ts (18 tests)
RED first (mock needed [] defaults: vi.fn() returns undefined and .length
crashes); suite 76/76. build ✅ lint ✅. Runtime checkpoint: unverified player
POST /bookings → 403; verified booking Sat 20:00-22:00 + Gatorade×2 →
total_price 232 EXACTLY (base 160 + weekend 40 + night 20 + products 10 +
fee 2; client-sent totalPrice=999 ignored via declared-but-ignored DTO
field, forbidNonWhitelisted would 400 otherwise); overlapping POST → 409
{ type, startTime, endTime } no PII; GET /bookings/user + /:id (snake_case
w/ nested fields); other player → 403; GET /bookings/field/:fieldId as
manager shows users.phone_number (privacy rule honored: manager own-field
only); PATCH cancel → cancelled; re-cancel → 409.

Part H rulings:
- POST /bookings 409 conflicts are player-safe: { type: 'booking'|'block',
  startTime, endTime } — NO customer name/email (would leak other players'
  PII; the BookingConflict type with customer info is manager-facing only,
  used by Part G schedule).
- Price: base×hours + weekend/night surcharges per hour at 30-min segment
  granularity (local server time), + products (validated active own-field
  products, else 400) + FULVASO_SERVICE_FEE (env, default 2; ponytail ceiling
  until Phase 2 payments), rounded to 2 decimals. Unknown/inactive/foreign
  products → 400.
- GET /bookings/:id + PATCH cancel allow booking owner OR field owner.
- Cancel of a cancelled booking → 409 (not idempotent).
- Client totalPrice declared @IsOptional in DTO but always recomputed.
- Runtime-checkpoint gotcha (PS): "$fid?from" parses as variable "$fid?from"
  (empty) — use ${fid} in URLs with query strings.

Part I (I1+I2): complete. TDD: tests/reviews.service.spec.ts (8 tests) +
tests/manager.service.spec.ts (11 tests) RED first; suite 95/95.
build ✅ lint ✅. Runtime checkpoint (values matched psql ground truth):
stats revenue 210 / total 4 / confirmed 3 / cancelled 1 / pending 0 /
unique 1 / avg 52.5; chart 7 zero-filled points, today Sat ingresos 130
(= psql SUM created today, LOCAL date grouping); manager bookings list
with camelCase customer {id,name,email,phone}; profile + payment-settings
GET/PUT round-trips (seeded values preserved); reviews: public GET (no
auth), can-review true via past confirmed booking (psql-inserted
00000000-...-077, past start/end), POST → Review saved + snake_case
review, popularTags [Buen Césped, Puntualidad], after-POST can-review
false with existingReview, no-booking POST → 403.

Part I rulings:
- Review eligibility = booking at that field with status='confirmed' AND
  endTime <= now (the match must have happened). POST /reviews/:fieldId
  upserts on (fieldId, playerId) @@unique → one review per player per
  field. canReview = eligible && !existingReview.
- popularTags = top 5 tags by frequency (count desc, name asc tiebreak).
- Stats period (today|week|month|all) filters by createdAt (today = local
  midnight, week = 7d, month = 30d); revenue eligibility = confirmed +
  paymentStatus succeeded; averageBookingValue = revenue/totalBookings.
- Chart: revenue (confirmed+succeeded) grouped by LOCAL date key
  YYYY-MM-DD, last N days zero-filled, { day: short weekday, date, ingresos }.
- GET /manager/profile returns { profile: row|null }; PUT upserts, returns
  { message, profile }. Profile-create branch is cast (promote guarantees
  the row; ponytail note in code).
- GET /manager/payment-settings returns the row or shape-defaults
  (all disabled, cashEnabled true) without persisting; PUT upserts.
- Manager bookings filters: status exact; fieldId ANDed with own-field
  `in` set (ownership never bypassable); startDate/endDate = overlap
  semantics (endTime > from, startTime < to).
- DI gotcha: inject PrismaService (not PrismaClient) as the ctor param
  type — Nest resolves by design-time token; typing PrismaClient crashes
  boot (ManagerService init failure caught in runtime checkpoint).
