# Frontend architecture

`frontend/` is a React 18 application built with Vite, TypeScript, Tailwind, and component primitives from Radix UI. The Vite alias `@` resolves to `frontend/src/app`.

The client contains player and manager-facing flows, including field discovery, booking and checkout UI, profile/auth screens, manager administration, FulVaso products, and promotions. It currently has no configured frontend test command.

The application is a client implementation; API integration must follow the backend contract as endpoints are completed.
