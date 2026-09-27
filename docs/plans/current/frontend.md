# Current frontend plan

The UI is substantially implemented, but it needs to evolve from prototype flows to
verified client behavior.

1. Define an API client and error/loading conventions.
2. Connect screens only to completed backend endpoints.
3. Add frontend test tooling and cover high-risk booking, authentication, and manager flows.
4. Validate responsive and accessibility behavior before PWA/deployment work.
5. Enable PWA and fix known client issues (below).

## PWA setup (Part J) — DONE (2026-09-26)

1. Install `vite-plugin-pwa`. ✅ v1.3.0 (also installed the missing `socket.io-client`
   and `@react-oauth/google`).
2. Add `public/manifest.json`: name "Fulbo", theme `#047857`, display `standalone`,
   orientation portrait, icons 192/512/maskable. ✅
3. Configure `vite.config.ts` with `VitePWA({ registerType: 'autoUpdate', ... })`. ✅
   (`manifest: false` — the static `public/manifest.json` is the single manifest source;
   the plugin only generates the service worker.)
4. Add `theme-color` and `apple-touch-icon` to `index.html`. ✅ (+ manifest link,
   apple-mobile-web-app-capable)
5. Generate icons from the Fulbo logo (`frontend/src/assets/de50d61e...png`). ✅
   via ffmpeg (962x1024 JPEG → center-crop square → 192/512; maskable = 436 content
   padded to 512 on `#047857`).
6. Add `VITE_API_BASE_URL` env and replace hardcoded `localhost:4000` / `localhost:3000`. ✅
   `src/services/api.ts` exports `API_BASE_URL` (env with dev fallback); `upload.api.ts`
   imports it; 10 legacy screens + `UserContext` + `usePaymentMethods` now use it
   (incl. the `:3000` in `FieldMapScreen`).

Offline strategy: app shell (CacheFirst), API (NetworkFirst), images (CacheFirst). ✅
verified in `dist/sw.js` (`api-cache` NetworkFirst, `images-cache` CacheFirst) and
served via `vite preview` (manifest/sw/registerSW/icons all 200).

## Known frontend bugs to fix (Part J) — DONE (2026-09-26)

1. Missing deps: `socket.io-client`, `@react-oauth/google` ✅ installed.
2. Hardcoded API base URL across files ✅ fixed (see PWA item 6). Remaining by
   design: `SOCKET_URL` in the two chat screens (chat is Phase 2 deferred).
3. Duplicate source trees `src/` vs `src/app/` (active one is `src/app/`) —
   documented, no code action this phase. The legacy `src/` tree still holds the
   service layer (`src/services/`) which both trees will share.

Open follow-ups (tracked under integration/Part K work):

- Authentication is wired: `src/services/auth.api.ts` + a session-backed
  `UserContext` (token in localStorage, restore on mount, `App.tsx` gates the
  app on the real session, controlled Login/Register with async submit +
  error). Remaining auth items: Google/Facebook OAuth (client IDs +
  `@react-oauth/google` flow), the phone-verification modal, and
  promote-to-manager in the owner-registration flow.
- The live `src/app` screens are still mock-driven (`mockFields`, mock
  teams/friends). Remaining wiring: fields (home/search/detail), the booking
  flow (checkout → create booking + 409 handling), and the manager screens
  (stats, field/product/schedule management). Frontend test tooling is set up
  (`npm test`, vitest + jsdom); add component tests as screens get wired.
- Chat `SOCKET_URL` needs `VITE_SOCKET_URL` when chat lands (Phase 2).

See [frontend architecture](../architecture/frontend.md) for the current shape and
[the backend plan](backend.md) for the Part J checkpoint.
