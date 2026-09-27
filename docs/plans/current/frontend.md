# Current frontend plan

The UI is substantially implemented, but it needs to evolve from prototype flows to
verified client behavior.

1. Define an API client and error/loading conventions.
2. Connect screens only to completed backend endpoints.
3. Add frontend test tooling and cover high-risk booking, authentication, and manager flows.
4. Validate responsive and accessibility behavior before PWA/deployment work.
5. Enable PWA and fix known client issues (below).

## PWA setup (Part J)

1. Install `vite-plugin-pwa`.
2. Add `public/manifest.json`: name "Fulbo", theme `#047857`, display `standalone`,
   orientation portrait, icons 192/512/maskable.
3. Configure `vite.config.ts` with `VitePWA({ registerType: 'autoUpdate', ... })`.
4. Add `theme-color` and `apple-touch-icon` to `index.html`.
5. Generate icons from the Fulbo logo (`frontend/src/assets/de50d61e...png`).
6. Add `VITE_API_BASE_URL` env and replace hardcoded `localhost:4000` / `localhost:3000`.

Offline strategy: app shell (CacheFirst), API (NetworkFirst), images (CacheFirst).

## Known frontend bugs to fix (Part J)

1. Missing deps: `socket.io-client`, `@react-oauth/google` (imported but not in `package.json`).
2. Hardcoded API base URL across files (also `:3000` in `FieldMapScreen`).
3. Duplicate source trees `src/` vs `src/app/` (active one is `src/app/`).

See [frontend architecture](../architecture/frontend.md) for the current shape and
[the backend plan](backend.md) for the Part J checkpoint.
