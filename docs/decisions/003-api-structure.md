# ADR 003: Versionless `/api` REST prefix with Swagger

## Decision

Expose REST endpoints under `/api` and publish interactive API documentation at `/api/docs`.

## Rationale

This gives frontend and backend contributors a stable local contract while the product is in its first API version.

## Consequences

Introduce explicit API versioning before any breaking public-contract change rather than changing existing endpoint semantics silently.
