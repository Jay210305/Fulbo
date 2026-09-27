# ADR 004: Prisma 7 client configuration

## Decision

Adopt Prisma 7 with its new client model: datasource URL in `prisma.config.ts`,
the `prisma-client` generator with a required `output`, and `PrismaClient`
instantiated with the `@prisma/adapter-pg` `PrismaPg` driver adapter.

## Rationale

The project targets Prisma 7 (installed 7.10.0). Its breaking changes remove the
generator/datasource configuration used by earlier versions, so following the new
model is required to generate and run the client.

## Consequences

- `datasource.url` no longer lives in `schema.prisma`; it lives in `prisma.config.ts`.
- The generated client is written to `src/generated/prisma/client.ts` and is gitignored.
- `dotenv` must be loaded in `prisma.config.ts`.
- `PrismaService` depends on the `PrismaPg` adapter rather than a default client.
