# AGENTS.md — read this first

You are working on **MENO**, a multi-tenant Pharmacy ERP (retail + wholesale) built by **Setups Works**. Seven people build it, each pairing with AI agents. This file is the contract that keeps everyone's code — human or AI — consistent. Folder-level `AGENTS.md` files add detail: **read the one in every folder you touch before you change anything in it.**

> **Source of truth:** GitHub Issues → _what to build and who owns it_ · `docs/` → _how to build it_ · the code → _what exists today_ · `docs/planning/CURRENT_STATE.md` → _what is done_. If they disagree, say so in your PR instead of guessing.

> **🚫 Git rule #1: never commit or push to `main` or `develop`.** Also: **no AI attribution** in commits or PRs: no `Co-Authored-By: Claude` / AI co-author lines, no "Generated with …" footers. The developer who opens the PR is the author. Always create a branch (`feature/<issue#>-name`, `bugfix/…`), push the branch, and open a Pull Request. Nobody merges their own PR.

> **Project status: FOUNDATION.** Folders and documentation only. No application code exists yet. Do not generate code until the issue you are working on says so and Sprint 0 is approved (`docs/planning/PHASES.md`).

## 1. What MENO is (one paragraph)

One platform with two editions — **Retail** (counter billing for medical shops) and **Wholesale** (distributors selling to retailers on credit) — sharing masters, batch-wise inventory, GST, accounting, reports and administration. Tenants (pharmacy businesses) have companies and branches. Counter billing must keep working **offline** on the desktop app and sync safely later. Money and stock must always be correct: **data integrity beats speed.** Pharmacy words you will meet are in `docs/product/GLOSSARY.md` — read it once.

## 2. Stack

| Layer | Choice | Where |
|---|---|---|
| Web | Next.js (App Router) as a **static SPA**, React, TypeScript strict, Tailwind v4, shadcn/ui (new-york), TanStack Query, React Hook Form + Zod | `apps/web` |
| Desktop | **Electron** shell that bundles the web build + local SQLite + sync engine (offline billing, printers, scanners) | `apps/desktop` |
| Mobile | **Deferred** (Phase 6: owner app + wholesale field sales, Expo) | `apps/mobile` |
| Backend | Java 21, Spring Boot 4, **modular monolith** with Spring Modulith, Spring Security, JPA/Hibernate, Flyway | `backend/meno-api` |
| Data | **PostgreSQL 17 (only product database)**, Redis, S3-compatible object storage (MinIO locally, Azure Blob in cloud) | — |
| Shared TS | `ui` (design system), `api-client` (generated from OpenAPI), `types`, `validation`, `billing-engine` (offline GST/pricing maths) | `packages/*` |
| Contracts | OpenAPI spec, golden test vectors for GST/pricing shared by Java and TS, sync protocol | `contracts/` |
| Infra | Docker + Docker Compose everywhere, Nginx, GitHub Actions, Azure VM (student plan), Prometheus/Grafana/Loki, Sentry | `infrastructure/` |

Tooling: **pnpm + Turborepo** for the TypeScript workspaces, **Maven** for the backend.

## 3. Where things go

```
apps/web          Next.js SPA: back office + retail POS + wholesale screens (talks only to meno-api)
apps/desktop      Electron: window, offline SQLite, sync engine, printing, barcode, auto-update
apps/mobile       Deferred — README only
backend/meno-api  Spring Boot modular monolith (one deployable)
packages/         Shared TypeScript packages
contracts/        API + calculation + sync contracts (language-neutral)
infrastructure/   Docker, Nginx, Azure, monitoring, backup
docs/             Everything a human or agent needs to understand the system
scripts/          Repo tooling (design check, codegen, db helpers)
.claude/agents/   Role sub-agents (backend, frontend, QA, DevOps, BA, reviewer)
```

Full tree with explanations: `docs/architecture/FOLDER_STRUCTURE.md`.

## 4. Architecture rules (non-negotiable)

1. **One backend.** Spring Boot `meno-api` is the only place business rules and data live. Next.js has **no API routes, no server actions, no database access** — it is a client of `/api/v1`.
2. **Module boundaries.** A backend module may use another module **only through its `api` package** (facade interfaces, DTOs, domain events). Never import another module's `domain`, `repository` or `service` classes. `ArchitectureTest` (Spring Modulith) fails the build if you do.
3. **Tenant isolation.** Every tenant-owned row has `tenant_id`; branch-owned rows also have `branch_id`. Tenant comes from the authenticated token, **never** from a request body or header the client controls. PostgreSQL Row-Level Security is the safety net. Every new endpoint gets a cross-tenant access test.
4. **Stock is a ledger.** Stock changes only by inserting `inventory_movement` rows inside the same transaction as the business document (purchase, sale, return, transfer, adjustment). `stock_balance` is a derived cache, reconciled nightly. Never `UPDATE stock SET qty = …`.
5. **Money is exact.** `BigDecimal` in Java, `numeric(18,4)` in SQL (amounts shown at 2 dp), `decimal.js` in TS. **Never `double`/`float`/JS `number` for money or tax.** Rounding rules: `docs/architecture/CALCULATIONS.md`.
6. **Posted documents are immutable.** A posted invoice, purchase or voucher is never edited or deleted — it is reversed with a credit/debit note or reversal entry. Snapshot prices, taxes and party details onto the document.
7. **Idempotency.** Every create/post endpoint for money or stock accepts an `Idempotency-Key`; offline-created documents carry a client-generated UUID. Replays return the original result, never a duplicate.
8. **Same maths everywhere.** GST/pricing/scheme maths lives in Java (`taxation`, `pricing`) and is mirrored in `packages/billing-engine` for offline use. Both must pass every case in `contracts/test-vectors/`. Change the vectors first, then both implementations.
9. **API first.** Changing an endpoint = update the OpenAPI spec (generated by springdoc, committed to `contracts/openapi/meno-api.yaml`), regenerate `packages/api-client`. The frontend never hand-writes request types.
10. **Every write is audited.** Who, when, tenant, branch, before/after for master data and all posted documents (`audit` module).
11. **Secrets never in git.** Only `*.example` env files are committed.
12. **Validate everything, in four layers.** UI (Zod) → API (Bean Validation) → domain rules → PostgreSQL constraints. The UI is never the only check. Rules and field patterns: `docs/architecture/VALIDATION_AND_BUSINESS_RULES.md` (**read it before writing any code**).
13. **Never hard-code business values.** Tax rates, thresholds, discount limits, number formats, states, units, schedules, payment modes and option lists come from configuration tables / tenant settings (effective-dated) or the API. Check **permissions**, never role names (ADR-0014).
14. **PostgreSQL is the only product database** (ADR-0013). Every invariant that can be a constraint (NOT NULL, CHECK, UNIQUE, FK, RLS) is one.
15. **Statutory honesty.** GST features prepare, validate and export; never claim direct filing. Compliance workflows ship only after the rule is confirmed in `docs/compliance/COMPLIANCE.md`.
16. **Don't add dependencies lightly.** Justify new libraries in the PR; anything touching security, money or sync needs the tech lead.

## 5. Code conventions

**Java**
- Package per module: `com.setupsworks.meno.modules.<module>.{api,web,service,domain,repository,mapper}`. Template: `backend/meno-api/AGENTS.md`.
- Controllers are thin (validate → call service → map). Services own transactions (`@Transactional` on the service method). Entities never leave the module — map to DTOs (MapStruct).
- Request DTOs are Java `record`s with Bean Validation. Errors are RFC 9457 Problem Details via `common/error`.
- Constructor injection only. No field `@Autowired`. No Lombok `@Data` on entities.

**TypeScript**
- `strict`, no `any` (use `unknown` and narrow). Validate forms with Zod schemas from `packages/validation`.
- Server data only through TanStack Query hooks in `features/<name>/queries.ts`. No `useEffect` fetching, no `useState` copies of server data.
- Components `PascalCase.tsx`, everything else `camelCase.ts`. One component per file.

**Everyone**
- Comments explain _why_, not _what_. Small functions. Match the surrounding style.
- Never log secrets, passwords, tokens or patient/prescription details.
- User-facing errors are friendly ("Couldn’t save the invoice."); details go to logs/Sentry.

## 6. UI rules

**Read `docs/design/DESIGN_LANGUAGE.md` before building any screen.** "Paper and ink": near-monochrome, hairline borders, almost no shadow, Geist font, tokens only (no raw hex, no `bg-white`, no `gray-*`), works in Light / Dark, shadcn components from `packages/ui`, lucide icons only. POS screens must be **fully keyboard-operable** (F-keys, barcode-first). Every screen works at 1280 px (counter PCs) and 375 px.

## 7. Database rules

- New schema = a new Flyway file `backend/meno-api/src/main/resources/db/migration/V<yyyyMMddHHmm>__<what>.sql`. **Never edit an applied migration.**
- Every tenant table: `tenant_id uuid not null`, RLS policy, index starting with `tenant_id`, `created_at/created_by/updated_at/updated_by`, `version` (optimistic lock).
- Primary keys are UUIDv7 (time-ordered; safe to generate offline). Human document numbers (INV/24-25/000123) are separate, per branch + financial year.
- Update `docs/database/DATA_MODEL.md` in the same PR.

## 8. Workflow (humans and agents)

1. Take a **GitHub Issue**. Read it fully: business rule, acceptance criteria, test notes. No issue → ask, don't invent scope.
2. Branch from `develop`: `feature/<issue#>-short-name`, `bugfix/…`, `hotfix/…` (from `main`).
3. Read the `AGENTS.md` of every folder you'll touch. For size M/L, write a short plan in the issue first.
4. Small commits with Conventional Commits (`feat(inventory): …`).
5. Tests: business rules need unit tests; endpoints need integration tests (Testcontainers) **including a cross-tenant test**; money/stock flows need a scenario from `docs/testing/TEST_STRATEGY.md`.
6. Run locally: `./mvnw verify` (backend), `pnpm typecheck && pnpm test && pnpm check:design` (frontend).
7. Update docs you made stale: folder `AGENTS.md`, `docs/planning/CURRENT_STATE.md`, `DATA_MODEL.md`, ADR if you made an architectural decision.
8. Open a PR with the template, link `Closes #n`. CODEOWNERS review + green CI + (for releases) QA sign-off.

Full process: `docs/team/WORKFLOW.md`. How to work with AI agents: `docs/team/AI_WORKFLOW.md`.

## 9. Agents: what you must never do

- Never commit to `main` or `develop` directly, force-push shared branches, or merge your own PR.
- Never edit an applied migration, a posted-document rule, or `contracts/test-vectors` without the issue explicitly saying so.
- Never disable a failing test, lower coverage gates, or add `@Disabled`/`.skip` to get green.
- Never touch production data or Azure resources. Infra changes go through PRs to `infrastructure/`.
- Never invent pharmacy or tax rules. If a rule isn't in `docs/` or the issue, stop and ask the BA (Prakalya) via the issue.
- Never put real customer, patient or prescription data in fixtures, tests, prompts or screenshots.

## 10. Map of the docs

| Need | Read |
|---|---|
| What we're building, features by phase | `docs/product/VISION.md`, `docs/product/FEATURES.md` |
| Pharmacy terms (PTR, scheme, Schedule H1…) | `docs/product/GLOSSARY.md` |
| **How a pharmacy works, end to end (start here if new)** | `docs/product/HOW_A_PHARMACY_WORKS.md` |
| **Learning guide (HTML, simple English, calculators, searchable glossary / features / screens)** | `docs/guide/meno-learning-guide.html` (generated by `scripts/docs/build_learning_guide.py`) |
| **Developer guide (HTML: concepts in code, every field with why, request / response JSON, errors, FE + BE work, all pages with API)** | `docs/guide/meno-developer-guide.html` (generated by `scripts/docs/build_developer_guide.py`; also Hub → Learn → Developer guide) |
| System design + diagrams | `docs/architecture/ARCHITECTURE.md` |
| Backend module catalogue + dependencies | `docs/architecture/MODULES.md` |
| **Backend implementation guide (pipeline, engine twin, modules, error codes)** | `docs/architecture/BACKEND_IMPLEMENTATION.md` |
| Researched legal / tax answers, sign-off sheets | `docs/compliance/RESEARCHED_ANSWERS.md`, `docs/compliance/signoff/` |
| Offline + sync | `docs/architecture/OFFLINE_SYNC.md` |
| Multi-tenancy | `docs/architecture/MULTI_TENANCY.md` |
| GST / pricing / rounding maths | `docs/architecture/CALCULATIONS.md` |
| **Validation rules, no hard-coding** | `docs/architecture/VALIDATION_AND_BUSINESS_RULES.md` |
| Every page, its route, phase and owners | `docs/product/PAGES.md` |
| Roles and their dashboards | `docs/product/ROLES_AND_DASHBOARDS.md` |
| Who owns which module / screen | `docs/team/OWNERSHIP_MATRIX.md` |
| App sidebar | `docs/design/NAVIGATION.md` |
| Tables and conventions | `docs/database/DATA_MODEL.md` |
| REST conventions | `docs/api/API_GUIDELINES.md` |
| Security | `docs/security/SECURITY.md` |
| Tests | `docs/testing/TEST_STRATEGY.md` |
| Deploy to Azure | `docs/deployment/AZURE_DEPLOYMENT.md` |
| Team, ownership, process | `docs/team/*` |
| Phases, sprints, what's done | `docs/planning/*` |
| Why we decided X | `docs/decisions/` (ADRs) |
| Legal / pharmacy compliance | `docs/compliance/COMPLIANCE.md` |
