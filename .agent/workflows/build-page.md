---
description: Build a MENO page end to end (SQL if needed, backend, frontend, one PR) when asked to "build / create / make the <X> page"
---

Follow `docs/team/BUILD_A_PAGE.md` step by step (it is the same playbook for every AI agent):

1. In `project-management/` run `npm run agent-task -- start-page "<page name or route>"` and keep the printed brief.
2. Read every doc listed under READ BEFORE CODING, the root `AGENTS.md`, and the `AGENTS.md` of every folder you touch.
3. Branch `feature/<BE#>-<page-name>` from `develop`.
4. Build SQL (if needed) → backend → frontend, wired to the real API.
5. Run `./mvnw verify` and `pnpm typecheck && pnpm test && pnpm check:design`.
6. One PR into `develop` with both Hub task numbers, no AI attribution.
7. `npm run agent-task -- review <BE#> "…"` and `review <FE#> "…"`, then stop. Nitheesh reviews and merges.
