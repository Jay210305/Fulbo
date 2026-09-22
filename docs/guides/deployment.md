# Deployment guide

Deployment is not yet finalized. Treat this as a checklist, not a production runbook.

1. Provide production environment variables through the deployment platform.
2. Run reviewed Prisma migrations against the target PostgreSQL database.
3. Build and deploy the NestJS API and configure CORS for the frontend origin.
4. Build and deploy the Vite frontend with the production API base URL.
5. Validate authentication, availability, and booking flows against the deployed API.

Document the chosen hosting, secrets management, backups, observability, and rollback procedure before production release.
