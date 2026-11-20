# ADR-0003: Next.js as a static SPA; Spring Boot is the only backend

- Status: Accepted · Date: 2026-11-21

## Context
Next.js can be a full-stack framework (server components, API routes). Having business logic in two backends (Node and Java) would split rules and security. The desktop app must load the UI offline from local files.

## Decision
Build `apps/web` with `output: 'export'`: client components, App Router for routing/layouts, no API routes, no server actions, no server-side data access. Nginx serves the static files and proxies `/api` to Spring Boot. The same build is bundled into Electron.

## Consequences
+ One source of business truth. + Desktop bundling is trivial. + Cheap hosting (static files).
− No SSR/SEO (not needed for an authenticated ERP; a marketing site can be separate). − Dynamic routes need client-side params (`/items?id=` or catch-all with client fetch).
