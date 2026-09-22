# Fulbo contributor guide

## Repository boundaries

- `frontend/` is the React 18 + Vite client. Its `@` import alias resolves to `frontend/src/app`.
- `backend/` is the NestJS + Prisma API. It serves routes below `/api`; Swagger is available at `/api/docs` when the API is running.
- `docs/` holds durable architecture notes, plans, ADRs, and operational guides. Do not add new planning documents at the repository root.
- `graphify-out/` is generated knowledge-graph output. Regenerate it when needed; do not edit it by hand.

## Development commands

Run commands from the relevant component directory.

```text
frontend: npm run dev | npm run build
backend:  npm run start:dev | npm run build | npm run lint
backend:  npm test | npm run test:e2e | npm run test:cov
```

Use each component's `.env.example` as the starting point for local configuration. Never commit `.env` files, generated Prisma client output, build output, or dependency directories.

## Implementation rules

- Keep UI changes inside `frontend/`; call backend endpoints through the existing frontend service layer instead of scattering HTTP calls across screens.
- Keep API modules, DTOs, guards, and persistence logic in `backend/src/`. Validate inputs with NestJS DTOs and enforce JWT, role, and ownership checks server-side.
- Treat the Prisma schema and migrations as a single change: review migration impact, regenerate the client, and test affected business rules.
- Do not assume an installed dependency means its feature is production-ready. In particular, uploads, realtime chat, payments, and several domain modules remain integration work.

## Tests and verification

- The backend's active scripts and legacy tests use `backend/test/` (singular). New tests may use `backend/tests/`, but update Vitest/lint configuration in the same change before relying on that location.
- Frontend test tooling is not configured yet. Add a runner and an npm script before adding a frontend test suite.
- Before handing off a change, run the relevant build and available tests. Prioritize coverage for authorization, phone verification, field availability, and booking conflicts.

## Documentation

Update `docs/architecture/` for material design changes, `docs/plans/current/` for active work, and add a dated record under `docs/plans/completed/` only after its acceptance checks pass.
