# System architecture

Fulbo is a two-application repository: a mobile-first football/soccer field
(cancha) booking platform for Peru.

```text
┌─────────────────────────────────────────────────────────────┐
│                     PWA Frontend (React + Vite)             │
│  Installable · Offline caching · Push-ready                 │
│  Port 5173 · VITE_API_BASE_URL=http://localhost:4000/api    │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST + JWT Bearer
┌──────────────────────────▼──────────────────────────────────┐
│                 NestJS Backend (TypeScript)                 │
│  Port 4000 · Modular · Swagger at /api/docs                 │
│  Auth · Users · Fields · Bookings · Products · Promotions   │
│  Schedule · Reviews · Manager · Upload                      │
└──────┬───────────────┬──────────────┬───────────────────────┘
       │               │              │
       ▼               ▼              ▼
┌──────────┐    ┌───────────┐  ┌───────────┐
│PostgreSQL│    │  Twilio   │  │ Cloudinary│
│ (Prisma) │    │  (SMS)    │  │ (Images)  │
│Port 5432 │    │           │  │           │
└──────────┘    └───────────┘  └───────────┘
```

The frontend is the user-facing booking and manager experience. The backend exposes
the `/api` REST namespace, applies global validation and authentication guards, and
owns persistence through Prisma.

## Integration boundaries

- **PostgreSQL (Prisma 7)** — the transactional datastore. See
  [database.md](database.md).
- **Twilio Verify** — phone OTP delivery for the verification gate. Planned Phase 1
  integration; see [ADR 005](../decisions/005-external-services.md).
- **Cloudinary** — image upload for fields, products, promotions, and avatars.
  Planned Phase 1 integration; see [ADR 005](../decisions/005-external-services.md).
- **Mercado Pago** — Peru-local payments (S/, Yape, Plin QR). Deferred to Phase 2;
  see [ADR 006](../decisions/006-payments-deferred.md).
- **Socket.IO** — real-time chat. Deferred to Phase 2.

Not every installed dependency represents a completed feature. Realtime chat,
payments, uploads, SMS verification, social graph, teams, search events,
advertising, staff management, and push notifications remain integration work.

## Component detail

See [backend.md](backend.md), [frontend.md](frontend.md), and
[database.md](database.md). Active work lives in
[plans/current/](../plans/current/).
