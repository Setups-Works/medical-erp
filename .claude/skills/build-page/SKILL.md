---
name: build-page
description: Build a MENO page end to end (SQL if needed, backend, frontend, one PR). Use when the developer says "build / create / make the <X> page", names a route from docs/product/PAGES.md (e.g. /onboarding/team), or asks to start a page from MENO Hub → Pages.
---

# Build a page

Follow `docs/team/BUILD_A_PAGE.md` exactly. In short:

1. From `project-management/`: `npm run agent-task -- start-page "<page name or route>"`. If it says several pages match, pick by route or ask the developer. If `.env.local` / `HUB_AGENT_AS` is missing, stop and tell the developer.
2. Read every file under **READ BEFORE CODING** in the printed brief, the folder `AGENTS.md` of every folder you will touch, and the existing code under **WHAT EXISTS**.
3. `git switch develop && git pull && git switch -c feature/<BE#>-<page-name>`.
4. Build SQL (only if the data model changes) → backend (module rules, cross-tenant integration test, OpenAPI + `packages/api-client` regenerated) → frontend (`apps/web`, `packages/ui`, TanStack Query, Zod, real API). Use the backend-engineer / frontend-engineer sub-agents for their halves if helpful.
5. Tick Hub checklist items as they finish: `npm run agent-task -- check <n> <items>`.
6. `./mvnw verify` and `pnpm typecheck && pnpm test && pnpm check:design` must pass.
7. Commit (Conventional Commits), push, open **one PR into `develop`** with both task numbers. **No AI attribution.**
8. `npm run agent-task -- review <BE#> "…"` and `review <FE#> "…"`, then stop. Nitheesh reviews and merges.

Missing business / tax rule: `npm run agent-task -- comment <n> "@prakalya …"` and stop. Never invent rules.
