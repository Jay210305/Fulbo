# ADR 002: JWT authentication with role guards

## Decision

Use JWT bearer authentication in NestJS with global authentication and role guards; explicitly mark public routes.

## Rationale

The API serves player and manager roles and needs consistent authorization at module boundaries.

## Consequences

New public endpoints require deliberate annotation. Role and ownership checks must be covered by endpoint tests.
