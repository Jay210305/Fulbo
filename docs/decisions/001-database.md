# ADR 001: PostgreSQL with Prisma

## Decision

Use PostgreSQL as the transactional datastore and Prisma 7 as the TypeScript ORM.

## Rationale

Bookings, schedules, ownership, and payment states require relational constraints and transactional conflict handling. Prisma provides typed access and migration management.

## Consequences

Schema changes need migrations and a generated client refresh. Local development requires a PostgreSQL instance, normally through Docker Compose.
