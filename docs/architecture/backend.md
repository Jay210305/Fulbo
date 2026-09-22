# Backend architecture

`backend/` is a NestJS TypeScript API. `src/main.ts` configures the `/api` prefix, validation, CORS, global exception handling, and Swagger at `/api/docs`.

`AppModule` currently loads configuration, Prisma, and authentication. Shared guards and decorators implement JWT authentication and role-based access. The Prisma client uses PostgreSQL through the Prisma 7 adapter configuration.

Implemented foundation:

- application bootstrap, Swagger, CORS, validation, and error filtering;
- Prisma module and schema/migration foundation;
- authentication module, JWT strategy, and OTP-related DTOs/services.

Domain modules such as fields, bookings, products, promotions, schedules, and manager reporting remain planned work. Track that work in [the current backend plan](../plans/current/backend.md).
