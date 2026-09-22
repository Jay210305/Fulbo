# System architecture

Fulbo is a two-application repository:

```text
React + Vite frontend (5173) -- REST/JWT --> NestJS API (4000) --> PostgreSQL
                                      |
                              Swagger: /api/docs
```

The frontend is the user-facing booking and manager experience. The backend exposes the `/api` REST namespace, applies global validation and authentication guards, and owns persistence through Prisma. Socket.IO, media upload, SMS verification, and payments are planned integrations; not every installed dependency represents a completed feature.

See [backend.md](backend.md), [frontend.md](frontend.md), and [database.md](database.md) for component detail.
