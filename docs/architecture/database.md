# Database architecture

The backend uses PostgreSQL with Prisma 7. The schema is in `backend/prisma/schema.prisma`; Prisma configuration is in `backend/prisma.config.ts`.

The current schema models users and manager business profiles, fields and photos, bookings, schedules, products, promotions, reviews, and payment settings. It uses enums for roles, field state, booking/payment state, product category, discounts, and schedule-block reasons.

Database changes require a reviewed Prisma migration, generated client refresh, and tests for the affected business rule—especially booking-conflict and ownership logic.
