# Development guide

## Prerequisites

Install a supported Node.js version, Docker Desktop for PostgreSQL, and project dependencies separately in `frontend/` and `backend/`.

## Local workflow

1. Copy each component's `.env.example` to a local `.env` where applicable.
2. Start PostgreSQL with `cd backend; docker compose up -d postgres`.
3. Run the API with `cd backend; npm run start:dev`.
4. Run the UI with `cd frontend; npm run dev`.
5. Open API documentation at `http://localhost:4000/api/docs`.

Do not commit `.env`, build output, generated Prisma client, or dependency directories.
