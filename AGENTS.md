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

## Plan validation gate (Laya)

Laya is an optional, local decision model exposed through the `fulbo-laya` MCP
server. It is a **quality gate for plans, not a plan generator**, and it is not a
hard dependency. See `docs/guides/laya.md` for setup.

When you create an implementation plan, apply this workflow:

1. Write the plan so a normal coding agent can understand it without Laya. Laya never replaces the plan text.
2. Validate the plan with Laya before treating it as ready. Call the `fulbo-laya` `validate_plan` tool with the plan text and, when you have it, the explicit task list.
3. Ensure every task is an essential, atomic unit of work: one outcome, named files/components, and acceptance criteria that another model can implement without inferring missing requirements. `validate_plan` checks each task for atomicity, specificity, self-containedness, and ambiguity.
4. If Laya reports `status: failed`, revise or subdivide the flagged tasks and call `validate_plan` again. Repeat until the status is not `failed`.
5. Treat `status: passed` as validated. `status: inconclusive` (Laya answered below the confidence floor) or `status: unavailable` is **not** validation.
6. Write the plan to `docs/plans/current/` only once it is either `passed` or explicitly recorded as skipped/inconclusive, and record the outcome in the plan header, for example:
   ```yaml
   laya_validation: passed   # or "skipped (unavailable)" / "inconclusive"
   laya_model: typed-decisions
   laya_checked_at: 2026-09-22T12:00:00Z
   ```

If the `fulbo-laya` tool is not available or returns `status: unavailable`:

- Do not block development; skip the gate and continue.
- Explicitly warn the user/agent that Laya was unavailable and the plan was **not** Laya-validated.
- Never present an unvalidated plan as Laya-validated. Record `laya_validation: skipped (unavailable)` with the reason before writing the plan.

## Tests and verification

- The backend's active scripts and legacy tests use `backend/test/` (singular). New tests may use `backend/tests/`, but update Vitest/lint configuration in the same change before relying on that location.
- Frontend test tooling is not configured yet. Add a runner and an npm script before adding a frontend test suite.
- Before handing off a change, run the relevant build and available tests. Prioritize coverage for authorization, phone verification, field availability, and booking conflicts.

## Documentation

Update `docs/architecture/` for material design changes, `docs/plans/current/` for active work, and add a dated record under `docs/plans/completed/` only after its acceptance checks pass. Active plans in `docs/plans/current/` must include the Laya validation header described above.

For current library, framework, and protocol behavior, use the native `websearch` and `webfetch` tools rather than relying on memory; no extra internet plugin is required.
