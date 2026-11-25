# Gokul — Frontend Engineer

## Your job in one line

Build the screens people **read and decide from**: pricing and schemes, GST, role dashboards, the reports centre and analytics, CRM and engagement, delivery and online channels. All on Meyyarivu's page patterns, in the same "paper and ink" look, with numbers that are always exact.

Joined: 25-11-2026 (P0 Foundation). Nitheesh is your manager; **Meyyarivu is your frontend buddy** for the first month (pairing, UI review, first PRs).

## You own (CODEOWNER)

**Frontend** (prefixes PRC, GST, DSH, RPT, ANX, CRM, ENG, DLV, OMN in [OWNERSHIP_MATRIX.md](../../OWNERSHIP_MATRIX.md))

| Web feature folder | What | Backend owner | QA |
|---|---|---|---|
| `apps/web/src/features/pricing/` | Price lists, schemes (free qty, slab), discounts, margin rules, approvals (PRC) | Kamesh | Ashok |
| `apps/web/src/features/gst/` | GST settings, HSN summary, GSTR-1 / 3B preparation and export, e-invoice and e-way bill screens (GST) | Kamesh | Ashok |
| `apps/web/src/features/dashboard/` | Role-based landing, retail / wholesale / inventory / finance / branch dashboards, widget library (DSH) | Nitheesh | Meyyarivu |
| `apps/web/src/features/reports/` | Reports centre and analytics on the `ReportPage` pattern, filters, export (RPT, ANX) | Nitheesh | Meyyarivu |
| `apps/web/src/features/crm/` | Customer history, follow-ups, refill reminders, campaigns (CRM, ENG) | Nitheesh | Prakalya |
| `apps/web/src/features/delivery/` | Home delivery orders, riders, tracking (DLV, later phases) | Nitheesh | Ashok |
| `apps/web/src/features/channels/` | Store page, customer app, marketplace orders (OMN, later phases) | Nitheesh | Meyyarivu |

You **don't** own `packages/ui`, the app shell, `lib/`, `hooks/` or design tokens: those are Meyyarivu's. Need a shared component? Open a Hub task for her (see [CONFLICT_FREE_COLLABORATION.md](../../CONFLICT_FREE_COLLABORATION.md)). **You don't QA your own screens:** Ashok tests PRC, GST, DLV; Meyyarivu tests DSH, RPT, ANX, OMN; Prakalya tests CRM, ENG.

## Why these areas need care

- **Pricing and GST are money.** Display amounts with `formatMoney` and do any client-side maths with `decimal.js` / `@meno/billing-engine`. Never JS `number` for money or tax. Rules: [CALCULATIONS.md](../../../architecture/CALCULATIONS.md).
- **GST is statutory.** Screens prepare, validate and export; they never say "filed". Only build a rule that is confirmed in [COMPLIANCE.md](../../../compliance/COMPLIANCE.md).
- **Dashboards and reports must match the books.** Every figure comes from the API; you never recompute totals in the browser. Filters, rates, periods and option lists come from the API or settings, never hard-coded.
- **Tenant and branch scope** come from the session. Never send `tenantId` from the UI.

## Handoffs

| You receive | From | You give | To |
|---|---|---|---|
| Stories + acceptance criteria | Prakalya | Screens on staging | QA owner of the prefix (above), Prakalya (UAT) |
| OpenAPI contract PR for pricing, GST (merged before you start) | Kamesh | `data-testid`s on key elements | Ashok |
| Report, dashboard, CRM, delivery, channels API contracts | Nitheesh | Questions on missing fields (in the issue, never invented) | Kamesh / Nitheesh |
| `packages/ui` components, page patterns (ListPage, FormPage, ReportPage, DocumentGrid), UI review | Meyyarivu | Requests for new shared components (Hub task) | Meyyarivu |
| Generated `api-client`, `billing-engine` | Nitheesh | PRs for review | Meyyarivu (UI), Nitheesh (approval) |

## Working before the backend is ready

Once the contract PR is merged, generate the client and build against **MSW mocks** (`apps/web/src/lib/mocks/`). Switch the mocks off when the endpoint reaches staging. Never invent fields that aren't in the contract.

## Your AI agent

`.claude/agents/frontend-engineer.md`. Give it the Hub task, the story, the reference screen in `docs/design/DESIGN_LANGUAGE.md` and the generated types. Run `pnpm check:design` after every change. You review every line it writes: you are the author of the PR.

## Screen recipe

1. Route `apps/web/src/app/(app)/<area>/page.tsx`: thin, client component.
2. Query hooks in `features/<area>/queries.ts` (keys in `lib/query/keys.ts`, your own section).
3. Form: React Hook Form + Zod schema from `packages/validation`.
4. Components from `packages/ui` only. Tokens only. lucide icons only.
5. Reports: `ReportPage` pattern (filter bar, server pagination, export through the API).
6. Unit tests for pure logic; `data-testid` for E2E.
7. Check Light/Dark at 1280 px and 375 px; keyboard-operable.

## First week

1. Day 1–3: [ONBOARDING.md](../../ONBOARDING.md) (read, set up, first PR).
2. Read [AGENTS.md](../../../../AGENTS.md), [apps/web/AGENTS.md](../../../../apps/web/AGENTS.md), [DESIGN_LANGUAGE.md](../../../design/DESIGN_LANGUAGE.md), [VALIDATION_AND_BUSINESS_RULES.md](../../../architecture/VALIDATION_AND_BUSINESS_RULES.md), [GLOSSARY.md](../../../product/GLOSSARY.md) and [HOW_A_PHARMACY_WORKS.md](../../../product/HOW_A_PHARMACY_WORKS.md).
3. MENO Hub → Learn: learning guide and developer guide; sign in with the email you were invited with and change your password.
4. Work your tasks in **Step** order: MENO Hub → My tasks, or [TASK_ORDER.md](TASK_ORDER.md).

## Definition of done

`pnpm typecheck && pnpm test && pnpm check:design` green · no `any` · no JS `number` for money · keyboard-operable · matches reference screens · UI review by Meyyarivu · approved by Nitheesh.

Phase tasks: [PHASE_PLAN.md](PHASE_PLAN.md)
