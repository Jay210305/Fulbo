# Testing guide

## Backend

Run `npm test` for unit tests and `npm run test:e2e` for end-to-end tests from
`backend/`. Use `npm run test:cov` for coverage. Current scripts discover the legacy
`backend/test/` location.

## Frontend

Frontend automated tests are not configured yet. Add a runner and scripts before
introducing production test suites; place new tests under `frontend/tests/`.

## Strategy

| Type | Scope | Tool | Coverage |
|------|-------|------|----------|
| Unit | Services (price calc, conflict detection, phone gate) | Vitest | Key services |
| e2e | API endpoints (auth, bookings, fields, ownership) | Vitest + Supertest | All Phase 1 endpoints |

## Minimum checks

Run the relevant build and tests before merging. Backend changes involving bookings,
permissions, or phone verification require focused automated coverage. Prioritize
authorization, phone verification, field availability, and booking conflicts.
