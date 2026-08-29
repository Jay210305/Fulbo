import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Fallback to '' so `prisma generate` works without a live DB (Docker build / CI).
    // `prisma migrate` / `db push` still require DATABASE_URL to be set.
    url: process.env.DATABASE_URL ?? '',
  },
});
