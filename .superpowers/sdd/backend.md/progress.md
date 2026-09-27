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
