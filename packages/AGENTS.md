# packages — AGENTS.md

Shared TypeScript packages (pnpm workspaces, scope `@meno/*`). Used by `apps/web`, `apps/desktop` and later `apps/mobile`. **No package may import from an app.** Packages are framework-light so they also work in Electron main and React Native.

| Package | Owner | Purpose | May depend on |
|---|---|---|---|
| `ui` | Meyyarivu | Design tokens (CSS), shadcn/ui components (new-york), DataTable, formatters (`formatMoney`, `formatDate`), Icon | `types` |
| `api-client` | Nitheesh | **Generated** typed client from `contracts/openapi/meno-api.yaml` + small fetch wrapper (auth, branch header, idempotency, Problem Details parsing) | `types` |
| `types` | Nitheesh | Shared hand-written types: Money string brand, Id, Page, desktop preload API (`desktop.ts`), enums mirrored from backend | — |
| `validation` | Meyyarivu | Zod schemas mirroring backend request DTOs (GSTIN, DL, phone, item, party, document lines) | `types` |
| `billing-engine` | Nitheesh | GST, pricing, scheme, discount, rounding maths with decimal.js; must pass `contracts/test-vectors` | `types` |
| `config` | Jeeva | Shared ESLint, TS (`tsconfig.base.json`), Prettier configs | — |

Rules: semver-free (workspace protocol); every package has `src/index.ts` as the only entry; tests next to `src` in `tests/`; no side effects on import.
