# apps/web — AGENTS.md

Next.js (App Router) built as a **static SPA** (`output: 'export'`). It is a client of `meno-api` only — **no API routes, no server actions, no server-side data fetching, no secrets** (ADR-0003). The same build runs inside the Electron desktop app.

Owners: Meyyarivu (foundation + transactional features), Prakalya (back-office features). Read `docs/design/DESIGN_LANGUAGE.md` before any UI work.

## Layout

```
src/
  app/
    (auth)/login, signup, forgot-password       Public routes
    (app)/layout.tsx                            App shell (sidebar, top bar, branch switcher)
    (app)/<area>/page.tsx                       Thin route → feature component
  components/
    layout/                                     Shell pieces (Sidebar, TopBar, Breadcrumb, SyncStatus)
    ui/                                         Re-exports/wrappers of @meno/ui only if app-specific
  features/<area>/
    components/                                 Screens and pieces for this area
    queries.ts                                  TanStack Query hooks (useItems, usePostInvoice…)
    schema.ts                                   Re-export/extend Zod schemas from @meno/validation
    shortcuts.ts                                Keyboard shortcuts (POS/grids)
    utils.ts                                    Pure logic (unit-tested)
  hooks/                                        Cross-feature hooks (useBranch, usePermission, useHotkeys)
  lib/
    api.ts                                      Configured @meno/api-client instance
    query/keys.ts                               Query key factory (append-only, sectioned by owner)
    datasource/                                 online (HTTP) vs local (Electron IPC) switch
    mocks/                                      MSW handlers for contract-first development
    format.ts                                   Re-exports formatMoney/formatDate from @meno/ui
  stores/                                       Small client state (Zustand): POS cart, UI prefs. NOT server data
  config/                                       Typed env (NEXT_PUBLIC_*), feature flags, nav.ts
  styles/                                       globals.css importing @meno/ui tokens
tests/unit/                                     Vitest
tests/e2e/                                      Playwright (Ashok)
```

## Navigation

The sidebar menu is defined in `docs/design/NAVIGATION.md` (Dashboard + 9 groups, routes, edition, feature IDs). `src/config/nav.ts` must match it; don't add menu items that aren't in that table.

## Feature ownership

| Feature folders | Owner |
|---|---|
| `auth catalog purchase inventory pos returns wholesale pricing gst compliance` + shell | Meyyarivu |
| `parties` | Prakalya |
| `company branches users settings admin dashboard reports accounting payments crm` | Nitheesh |

Source of truth: `docs/team/OWNERSHIP_MATRIX.md`.

## Page patterns (build once in P1, reuse everywhere)

| Pattern | For | Key parts |
|---|---|---|
| `ListPage` | Any master list | Title + count, search, filter pills, DataTable, pagination, primary "New" button |
| `FormPage` / `FormSheet` | Create/edit masters | RHF + Zod, sections, sticky save bar, dirty-state guard |
| `ReportPage` | Registers & reports | Filter bar (date range, branch, party), summary tiles, DataTable, export Excel/PDF |
| `DocumentGrid` | Purchase/sales/return entry | Header (party, dates), keyboard grid of lines, totals panel from `@meno/billing-engine`, post action |
| `PosScreen` | Retail counter | See DESIGN_LANGUAGE §9 |

## Rules

1. Data only via `@meno/api-client` + TanStack Query hooks in `queries.ts`. Mutations: optimistic only for harmless UI state; **never optimistic for posting documents**.
2. Every request carries `X-Branch-Id` (added in `lib/api.ts`). Posting mutations generate an `Idempotency-Key` once per user intent (store it in the form state so retries reuse it).
3. Money values stay strings from the API; any arithmetic via `@meno/billing-engine` (decimal.js). Never `Number(amount)` for maths.
4. Permissions: hide/disable UI with `usePermission('sales.invoice.create')`, but never rely on it for security.
5. Forms: RHF + Zod from `@meno/validation` (same schema names as backend DTOs).
6. Dates/times rendered client-side only; format with helpers.
7. No `useEffect` data fetching; no copying server data into `useState`.
8. Validation: every form uses a Zod schema from `@meno/validation` that mirrors the backend rules; show all field errors returned by the API (Problem Details `errors[]`) next to their fields. The UI check is for speed, the API is the authority.
9. **No hard-coded option lists or business values**: states, units, payment modes, schedules, tax rates, discount limits come from the API (cached). Gate UI with permissions, never role names.
10. Accessibility: real buttons/links, labels, focus states, `aria-*` from Radix components.

## Commands (from P1)

`pnpm --filter web dev` · `pnpm --filter web test` · `pnpm --filter web e2e` · `pnpm typecheck` · `pnpm check:design`

## Mistakes to avoid

(Add entries here when an agent or human gets something wrong twice.)
