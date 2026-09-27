# Development guide

## Prerequisites

Install a supported Node.js version, Docker Desktop for PostgreSQL, and project
dependencies separately in `frontend/` and `backend/`.

## Local workflow

1. Copy each component's `.env.example` to a local `.env` where applicable.
2. Start PostgreSQL with `cd backend; docker compose up -d postgres`.
3. Run the API with `cd backend; npm run start:dev`.
4. Run the UI with `cd frontend; npm run dev`.
5. Open API documentation at `http://localhost:4000/api/docs`.

Do not commit `.env`, build output, generated Prisma client, or dependency
directories.

## Backend environment variables

Use `backend/.env.example` as the starting point:

```text
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

`DATABASE_URL` and `PORT` are read through `prisma.config.ts` / configuration;
Twilio and Cloudinary back [ADR 005](../decisions/005-external-services.md);
`MERCADO_PAGO_ACCESS_TOKEN` is reserved for Phase 2
([ADR 006](../decisions/006-payments-deferred.md)).

## Frontend environment variables

Add `VITE_API_BASE_URL` (for example `http://localhost:4000/api`) and remove the
hardcoded API hosts; see [the current frontend plan](../plans/current/frontend.md).

## Branching and commits

Implementation work happens on feature branches, never directly on `main`:

1. Create `feat/<scope>` from `main` before starting (for example
   `feat/backend-phase1`).
2. Commit after each verified plan part, not in one bulk commit: the commit
   message names the part (for example `Part D: users module`), and only lands
   after that part's checkpoint passes (build, lint, tests where present).
3. Documentation-only changes may share the branch; commit them before the
   first implementation commit so code commits stay reviewable.

This matches the repository's existing per-part history. Merge to `main` only
after the plan's acceptance checks pass (see `docs/plans/current/`).

## Docker

`backend/docker-compose.yml` runs PostgreSQL; `backend/Dockerfile` builds the API.
The standard loop is `docker compose up -d postgres` followed by
`npm run start:dev` on the host.
