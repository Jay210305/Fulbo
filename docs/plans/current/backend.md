# Current backend plan

The detailed working plan remains [BACKEND_PLAN.md](../../../BACKEND_PLAN.md) until it is migrated here. This document is the canonical entry point for backend planning going forward.

## Current implementation position

- Foundation, Prisma setup, and authentication-related source files are present.
- The original plan's progress section has not been reconciled with the source tree and should be updated before planning the next milestone.
- Next work should be scoped and verified module by module: users, fields, uploads/products/promotions, schedules, bookings, manager/reporting, then integration tests.

## Completion rule

A module may move to `docs/plans/completed/` only when its API contract, migration impact, authorization rules, and automated checks are documented.
