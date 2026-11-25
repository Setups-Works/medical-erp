# Meyyarivu — Frontend Lead

## Your job in one line

Own the frontend foundation and the high-speed transactional screens — POS, purchase entry, inventory, wholesale — all in one consistent "paper and ink" look, fast and keyboard-first.

## You own (CODEOWNER)

Full split: [OWNERSHIP_MATRIX.md](../../OWNERSHIP_MATRIX.md). You build **most of MENO's transactional screens**: every feature with prefix AUT, NAV, NTF, SEC, PUR, INV, IJX, MKT, POS, WHS, DOC, DSK, MOB.

- `packages/ui/` (tokens, shadcn components), `packages/validation/` (Zod schemas)
- `docs/design/` (token changes need Nitheesh)
- Web foundation: `apps/web/src/{app/layout, components, lib, hooks, stores, config, styles}`, routing, TanStack Query setup, MSW mocks, the sidebar from `docs/design/NAVIGATION.md`, and the **page patterns** (ListPage, FormPage, ReportPage, DocumentGrid)
- Web features: `auth/`, `purchase/`, `inventory/`, `pos/`, `wholesale/` (`pricing/` and `gst/` moved to Gokul on 25-11-2026)
- Desktop renderer UI (sync status, sync issues, device setup). Main process: Nitheesh; packaging: Jeeva.
- **UI reviewer** for Nitheesh's, Ashok's and Gokul's screens, and **buddy for Gokul** (new frontend engineer) for the first month

Four of you take all the frontend. Nitheesh builds `company, branches, users, settings, admin, accounting, payments, platform`. Ashok builds `catalog, parties, returns, compliance`. Gokul builds `pricing, gst, dashboard, reports, crm, delivery, channels`. Build the shared patterns early (P1) so everyone can move fast.

## Handoffs

| You receive | From | You give | To |
|---|---|---|---|
| Stories + wireframe notes | Prakalya | Screens on staging | Ashok (tests), Prakalya (UAT) |
| OpenAPI contract PR (merged before you start) | Kamesh | Shared components + page patterns | Prakalya |
| Generated `api-client`, billing-engine | Nitheesh | `data-testid`s on key elements | Ashok |
| Nitheesh's admin screens and Gokul's dashboard, reports, analytics and channels screens on staging | Nitheesh, Gokul | QA results and defects ("QA: …" tasks) | Nitheesh |

> **You also do QA** for ADM (Nitheesh's screens) and DSH, RPT, ANX, OMN (Gokul's screens), since they can't test their own work. Follow Ashok's test-case template; Ashok reviews your test cases.

## Working before the backend is ready

Once the contract PR is merged, generate the client and build against **MSW mocks** (`apps/web/src/lib/mocks/`). Switch the mocks off when the endpoint reaches staging. Never invent fields that aren't in the contract.

## Your AI agent

`.claude/agents/frontend-engineer.md`. Give it the story, the reference screen in `docs/design/DESIGN_LANGUAGE.md`, and the generated types. Run `pnpm check:design` after every change.

## Screen recipe

1. Route `apps/web/src/app/(app)/<area>/page.tsx`: thin, client component.
2. Query hooks in `features/<area>/queries.ts` (keys in `lib/query/keys.ts`).
3. Form: React Hook Form + Zod schema from `packages/validation`.
4. Components from `packages/ui` only. Tokens only. lucide icons only.
5. Keyboard shortcuts for POS/grids in `features/<area>/shortcuts.ts`.
6. Unit tests for pure logic; `data-testid` for E2E.
7. Check Light/Dark at 1280 px and 375 px.

## Definition of done

`pnpm typecheck && pnpm test && pnpm check:design` green · no `any` · keyboard-operable · matches reference screens · reviewed by Nitheesh.

Phase tasks: [PHASE_PLAN.md](PHASE_PLAN.md)
