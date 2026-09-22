# Current integration plan

Integration proceeds from stable contracts, not by wiring placeholder UI directly to unfinished services.

1. Publish and review the REST/OpenAPI contract.
2. Configure the frontend API base URL per environment.
3. Integrate authentication and token refresh/error handling.
4. Integrate fields and availability, then booking conflict handling.
5. Add end-to-end tests against a disposable PostgreSQL database.
