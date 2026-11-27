# Build a page (page-wise development)

MENO is built **one page at a time, end to end, by one developer with their AI agent**: SQL (if needed), backend and frontend together, one branch, one PR. Nitheesh reviews and merges. The page list is [`docs/product/PAGES.md`](../product/PAGES.md), tracked on MENO Hub → **Pages**.

This playbook is the same for every agent (Claude Code, Antigravity, Codex, Cursor…). The developer only has to say:

> **"Build the Team page"** · "create /onboarding/team" · "make the medicine list page"

and the agent does the rest below. Before anything else, the agent must also follow the root [`AGENTS.md`](../../AGENTS.md).

## One-time setup (each developer)

`project-management/.env.local` (never committed) with `MONGODB_URI` and `HUB_AGENT_AS=<your hub first name>`. See [AGENT_TASK_WORKFLOW.md](AGENT_TASK_WORKFLOW.md). If it is missing, the agent stops and asks; it never invents values.

## The flow

```
"build the X page"
  └─ 1. start-page  → Hub: BE #n + FE #m created for you, both In progress, brief printed
  └─ 2. read        → every doc the brief lists
  └─ 3. branch      → feature/<BE#>-<page> from develop
  └─ 4. build       → SQL (if needed) → backend → frontend
  └─ 5. verify      → ./mvnw verify · pnpm typecheck && pnpm test && pnpm check:design
  └─ 6. PR          → one PR into develop, both task numbers
  └─ 7. review      → both Hub tasks → In review, @nitheesh notified
  └─ 8. stop        → Nitheesh reviews, merges, moves tasks to Done, ticks BE / FE ready
```

### 1. Take the page

From `project-management/`:

```bash
npm run agent-task -- start-page "Team"
```

Accepts the page name or route (`/onboarding/team`). If several pages match, it lists them; use the route. It:

- creates the page's **Backend** and **Frontend** cards if they don't exist (both assigned to you, on the phase board), or reuses the ones already linked on Hub → Pages;
- moves both to **In progress** and comments on them;
- prints the **brief**: what the page does, its features from `FEATURES.md`, the docs to read, what code exists already (web screen or placeholder, backend controller and module), the branch name and the steps.

`npm run agent-task -- page "Team"` prints the same brief without changing anything. In the Hub, **Start page** on a page row does the same as `start-page` without the brief.

A card assigned to someone else stops the command: talk to them or Nitheesh first.

### 2. Read before coding

Read every file in the brief's **READ BEFORE CODING** list, in order: root and folder `AGENTS.md` files, the module `AGENTS.md`, validation rules, API guidelines, data model, design language, and the product docs that mention this page (for example `ONBOARDING.md`, `MASTER_FIELDS.md`). Also read the existing code the brief points to and match its style.

If a business, pharmacy or tax rule the page needs is not in `docs/`, **comment on the task, mention `@prakalya`, and stop**. Never invent rules.

### 3. Branch

```bash
git switch develop && git pull && git switch -c feature/<BE#>-<page-name>
```

Never commit to `main` or `develop`.

### 4. Build: SQL → backend → frontend

| Layer | Must have |
|---|---|
| **SQL** (only if the data model changes) | New Flyway file `V<yyyyMMddHHmm>__<what>.sql`: `tenant_id`, RLS, audit columns, `version`, constraints for every invariant. Update `docs/database/DATA_MODEL.md`. Never edit an applied migration. |
| **Backend** (`backend/meno-api`) | Every endpoint the page calls, in the right module (`api` package for cross-module use). Request DTO records with Bean Validation, service rules, Problem Details errors, audit, idempotency for money/stock. Integration tests (Testcontainers) **including a cross-tenant test**. Regenerate OpenAPI (`contracts/openapi/meno-api.yaml`) and `packages/api-client`. If the page needs no backend work, say so on the BE task and tick its items. |
| **Frontend** (`apps/web`) | The screen from `packages/ui` per `DESIGN_LANGUAGE.md`, wired to the real endpoints through `packages/api-client` and TanStack Query hooks in `features/<name>/queries.ts`. Zod schemas from `packages/validation`. Keyboard operable, 1280 px and 375 px, Light and Dark. MSW mocks only for local dev. Replace any placeholder screen. |

Tick checklist items on the cards as they are really finished:

```bash
npm run agent-task -- check <BE#> 1 2
npm run agent-task -- check <FE#> 1
```

### 5. Verify

```bash
cd backend/meno-api && ./mvnw verify
```

```bash
pnpm typecheck && pnpm test && pnpm check:design
```

Fix failures. Never skip or disable tests.

### 6. One PR

Push the branch and open **one PR into `develop`** with the template: what and why, both Hub task numbers (`BE #n · FE #m`), screenshots light + dark, test evidence, migration notes. **No AI attribution** (no co-author lines, no "Generated with" footers).

### 7. Send to review

```bash
npm run agent-task -- review <BE#> "what changed · PR link · how verified · open points"
```

```bash
npm run agent-task -- review <FE#> "what changed · PR link · how verified · open points"
```

### 8. Stop

Don't start the next page until the developer says so. **Nitheesh reviews and merges** (nobody merges their own PR), moves both tasks to Done and ticks **BE ready / FE ready** on the Pages row. Ashok (QA) ticks **QA passed**; the page is ticked **Completed** when accepted. If the PR comes back, read the comments (`npm run agent-task -- show <n>`), fix on the same branch, and `review` again.
