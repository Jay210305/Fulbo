# Frontend architecture

`frontend/` is a React 18 application built with Vite, TypeScript, Tailwind, and
component primitives from Radix UI. The Vite alias `@` resolves to
`frontend/src/app`.

The client contains player and manager-facing flows, including field discovery,
booking and checkout UI, profile/auth screens, manager administration, FulVaso
products, and promotions. It is written against the REST API at
`VITE_API_BASE_URL` (default `http://localhost:4000/api`) plus Socket.IO for chat.
It currently has no configured frontend test command.

Planned PWA enablement (manifest, service worker, offline caching, installability)
is tracked in [the current frontend plan](../plans/current/frontend.md).

## Known issues

1. Missing dependencies: `socket.io-client`, `@react-oauth/google` are imported but
   absent from `package.json`.
2. Hardcoded API base URLs across files (also `:3000` in `FieldMapScreen`).
3. Duplicate source trees `src/` vs `src/app/` (the active one is `src/app/`).

## Integration constraint

The application is a client implementation; API integration must follow the backend
contract as endpoints are completed. Do not wire placeholder UI directly to
unfinished services.
