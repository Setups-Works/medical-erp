# @meno/billing-engine — AGENTS.md

Owner: Nitheesh. TypeScript twin of the Java `taxation` + `pricing` engines (ADR-0011). Used for live totals in the UI and for offline billing in the desktop app.

Rules: decimal.js only, never JS numbers for money; inputs/outputs are strings; pure functions, no I/O; 4-dp intermediates, HALF_UP, 2-dp tax per line, rupee round-off per `docs/architecture/CALCULATIONS.md`. The test suite loads every file in `contracts/test-vectors/**` — a change here without matching vectors is rejected. Coverage ≥ 95 %.

**Status (24-11-2026): built.** Modules: `decimal` (Dec, round, fixed), `invoice` (calcLine, calcInvoice), `pricing` (loose sale, bill-discount allocation, landed cost, suggested PTR, margin, weighted average), `accounting` (payment allocation, change, credit check, interest, TDS), `inventory` (reorder, expiry status), `combined` (distributor combined bill). Tenant conventions (split rounding, tie-break, charges GST) are parameters. Run `pnpm --filter @meno/billing-engine test` — 72 vectors pass. Java twin: `docs/architecture/BACKEND_IMPLEMENTATION.md` §4.
