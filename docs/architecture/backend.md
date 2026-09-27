# Backend architecture

`backend/` is a NestJS 12 TypeScript API. `src/main.ts` configures the `/api`
prefix, validation, CORS, global exception handling, and Swagger at `/api/docs`
(port 4000). `AppModule` loads configuration, Prisma, and authentication. Shared
guards and decorators implement JWT authentication and role-based access.

## Tech stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | NestJS 12 | TypeScript-native, modular DI, guards/pipes, Swagger auto-gen |
| Database | PostgreSQL 16 | Relational domain (bookings, conflicts, permissions), ACID for reservations |
| ORM | Prisma 7 | Type-safe schema and migrations; see [Prisma 7 setup](#prisma-7-setup) |
| Auth | JWT + Passport | Email/password, Google OAuth, Facebook, phone OTP |
| SMS/OTP | Twilio Verify | Built-in OTP service, rate limits, expiry (Phase 1 integration) |
| Payments | Mercado Pago | Peru-local (S/, Yape, Plin QR). **Phase 2** |
| Images | Cloudinary | Frontend already calls `/upload` endpoints (Phase 1 integration) |
| Validation | class-validator + class-transformer | NestJS native DTO validation |
| Testing | Vitest + Supertest | Scaffold uses Vitest (not Jest) |
| Local dev | Docker Compose | Postgres + backend, one command |

## Prisma 7 setup

Prisma 7 changed the client configuration; these are durable constraints, not
temporary:

- `datasource.url` no longer lives in `schema.prisma` — it is configured in `prisma.config.ts`.
- The generator is `prisma-client` (not `prisma-client-js`) with a **required** `output` path.
- `PrismaClient` is instantiated with a driver adapter (`@prisma/adapter-pg` → `PrismaPg`).
- The generated client lives at `src/generated/prisma/client.ts` (gitignored).
- `dotenv` loads env in `prisma.config.ts`.

See [ADR 004](../decisions/004-prisma-7.md) and
[ADR 005](../decisions/005-external-services.md).

## Project structure

```text
backend/
├── prisma.config.ts            # Prisma 7 CLI config (datasource url, migrations)
├── prisma/
│   ├── schema.prisma           # Full schema
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── main.ts                 # Bootstrap: Swagger, CORS, validation, port 4000
│   ├── app.module.ts           # ConfigModule (global) + PrismaModule
│   ├── generated/prisma/       # GENERATED client (gitignored)
│   ├── prisma/
│   │   ├── prisma.module.ts    # @Global provider
│   │   └── prisma.service.ts   # PrismaClient + PrismaPg adapter
│   ├── common/
│   │   ├── decorators/         # @Roles, @CurrentUser, @Public
│   │   ├── enums/              # Role enum
│   │   ├── filters/            # AllExceptionsFilter
│   │   └── guards/             # JwtAuthGuard, RolesGuard
│   ├── auth/                   # login, register, social, send-otp, verify-otp
│   ├── users/                  # profile, phone, promote-to-manager
│   ├── fields/                 # public + manager CRUD + availability
│   ├── bookings/               # create, cancel, history, conflict check
│   ├── products/               # FulVaso CRUD
│   ├── promotions/             # CRUD + deactivate
│   ├── schedule/               # blocks + conflict detection
│   ├── reviews/                # create, list, can-review
│   ├── manager/                # stats, profile, payment-settings, bookings
│   └── upload/                 # Cloudinary single/multi/delete
├── test/
│   ├── unit/
│   └── e2e/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── .env
```

## Implemented foundation

- application bootstrap, Swagger, CORS, validation, and error filtering;
- Prisma module and schema/migration foundation;
- authentication module, JWT strategy, and OTP-related DTOs/services;
- common guards, decorators, and the `Role` enum.

Domain modules such as fields, bookings, products, promotions, schedules, and
manager reporting remain planned work. Track that work in
[the current backend plan](../plans/current/backend.md).
