# Sprint 0 architecture review (day 13 of Sprint 0, see SPRINT_0.md)

> Owner: Nitheesh · Everyone attends · 90 minutes · Hub tasks: "Run architecture review meeting; approve Sprint 1 backlog" and "Hold the architecture review meeting and accept or change each ADR"
> Goal: leave the room with every ADR **Accepted** or with a named change, and a Sprint 1 backlog everyone agrees to.

## Pre-read (everyone, before the meeting)

| Who | Read |
|---|---|
| All | `AGENTS.md`, `docs/architecture/ARCHITECTURE.md`, `docs/decisions/` (14 ADRs), your `docs/team/members/<you>/TASK_ORDER.md` |
| Kamesh | `MODULES.md`, `MULTI_TENANCY.md`, `docs/database/DATA_MODEL.md` (your ER v1), `backend/meno-api/AGENTS.md` |
| Meyyarivu | `DESIGN_LANGUAGE.md`, `NAVIGATION.md`, `POS_KEYBOARD.md`, `apps/web/AGENTS.md`, your wireframes |
| Ashok | `TEST_STRATEGY.md`, `contracts/test-vectors/` draft, ADR-0009 (status codes you will assert) |
| Jeeva | ADR-0005, `docs/deployment/AZURE_DEPLOYMENT.md`, CI design doc |
| Prakalya | BRD P1–P3 draft, `VALIDATION_AND_BUSINESS_RULES.md`, ADR-0014 |

Bring questions as comments on the Hub P0 board discussion **before** day 13, so the meeting is decisions, not discovery.

## Agenda

| Time | Topic | Lead |
|---|---|---|
| 0–10 | System in one picture (ARCHITECTURE.md §1–3): one backend, static SPA, offline desktop | Nitheesh |
| 10–40 | ADR walk-through: accept or change (table below) | Nitheesh |
| 40–55 | ER diagram v1: tenancy columns, ledger, immutable documents | Kamesh |
| 55–65 | Wireframes: app shell, POS, purchase grid | Meyyarivu |
| 65–75 | Test plan P1 + CI gates | Ashok, Jeeva |
| 75–90 | Sprint 1 backlog: approve, owners, risks | Nitheesh |

## ADR decision sheet

Fill the last two columns in the meeting, then update each ADR's Status and the index in `docs/decisions/README.md`.

| ADR | Decision | Question to settle in the room | Outcome | Notes |
|---|---|---|---|---|
| 0001 | Monorepo, pnpm + Turborepo, Maven | ADR says repo `meno`; the GitHub repo is `Setups-Works/medical-erp`. Keep the name and update ADR-0001, or rename? (Recommendation: keep `medical-erp`, update the ADR; `meno-api` folder names stay.) | | |
| 0002 | Modular monolith, Spring Modulith | Is everyone clear that only `api` packages are public? | | |
| 0003 | Next.js static SPA, no API routes | Any page that needs SSR? (Expected: none.) | | |
| 0004 | Electron + SQLite/SQLCipher offline billing | Native module build (better-sqlite3) owned by Jeeva? | | |
| 0005 | Azure VM + Docker Compose + managed PostgreSQL | Budget alerts set at $25/$50/$75? | | |
| 0006 | Shared schema + RLS | Cross-tenant test base class owner (Nitheesh, P1) | | |
| 0007 | Inventory ledger + immutable documents | Kamesh's ER v1 follows it? | | |
| 0008 | Mobile deferred to P7 | — | | |
| 0009 | Plain resources + Problem Details | Accepted on 2026-11-21. Walk through the error shape, `code` registry and status table so everyone can use it | Accepted | |
| 0010 | UUIDv7 keys | Library choice for Java and TS | | |
| 0011 | Shared calculation vectors | First 40 vectors ready (Ashok + Prakalya)? | | |
| 0012 | Paper-and-ink design language | Design check script in CI from P1 | | |
| 0013 | PostgreSQL only product DB | — | | |
| 0014 | Configuration over hard-coding | Which settings are needed in P1 (number series, tax config tables)? | | |

## Sprint 1 backlog to approve (P1, first half)

Approve each row: owner agrees, acceptance criteria exist in the Hub task, dependencies clear.

| Deliverable | Owner | Depends on | Approved |
|---|---|---|---|
| Spring Boot skeleton, Modulith test, `common/error` (ADR-0009), OpenAPI export, Flyway, Testcontainers base | Nitheesh | ADR-0009 (accepted) | |
| `security/`: JWT, refresh rotation, cookie, `PermissionChecker` | Nitheesh | skeleton | |
| `tenancy/` + RLS + cross-tenant test base | Nitheesh (+ Kamesh) | skeleton | |
| Docker Compose (postgres, redis, minio, mailpit), Dockerfiles, CI pipeline | Jeeva | repo + branch protection | |
| Next.js static scaffold, `packages/ui` tokens + first shadcn components | Meyyarivu | wireframes reviewed | |
| Playwright + API collection setup, P1 test cases | Ashok | CI pipeline | |
| P1 user stories with acceptance criteria; permission matrix | Prakalya | BRD reviewed | |

## After the meeting (Nitheesh)

- [ ] Each ADR: Status updated (Accepted / changed), date and deciders; index updated
- [ ] Decisions and action items posted in the Hub P0 board discussion
- [ ] Sprint 1 tasks moved from Backlog to To do on the P1 board
- [ ] `docs/planning/CURRENT_STATE.md` updated
- [ ] One PR into `develop` with all ADR status changes
