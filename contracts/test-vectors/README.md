# Test vectors

Format and approval rules: [../AGENTS.md](../AGENTS.md). Formulas: [docs/architecture/CALCULATIONS.md](../../docs/architecture/CALCULATIONS.md).

| File | Cases | Covers |
|---|---|---|
| `gst/gst-core.json` | 10 | MRP-inclusive retail at 0 / 5 / 18 %, intra vs inter-state, discount before back-calculation, odd paisa split ⚠, mixed rates, round-off up and down |
| `pricing/exclusive.json` | 6 | PTR (GST-exclusive) lines, trade discount, multi-line, large quantity, half-up at the third decimal, 100 % discount |
| `schemes/free-and-scheme.json` | 4 | Free quantity, scheme % then trade discount ⚠, half scheme in loose units, inter-state scheme |
| `pricing/loose-sale.json` | 4 | §7 loose tablets from a strip |
| `pricing/bill-discount.json` | 4 | §8 bill discount split by largest remainder |
| `pricing/margin.json` | 8 | §10 margin and mark-up, §11 weighted average |
| `schemes/landed-cost.json` | 7 | §9 freight allocation, landed cost, suggested PTR |
| `accounting/payments.json` | 8 | §13 FIFO allocation, change due, §14 credit check |
| `accounting/interest-tds.json` | 10 | §15 simple and compound interest, §16 TDS above threshold |
| `inventory/reorder-expiry.json` | 8 | §17 reorder point and quantity, §18 expiry status |
| `documents/combined-bill.json` | 3 | §22 combined distributor bill with returns, replacement and charges |

**72 cases, all `"draft"`, all passing** in `packages/billing-engine` (`pnpm --filter @meno/billing-engine test`). The first 20 come from `scripts/vectors/generate-draft-vectors.ts` (Hub teaching engine); the other 52 from `scripts/vectors/generate_extended_vectors.py`, an independent Python implementation — so the TypeScript engine was checked against numbers it did not produce. Before any engine treats them as the contract:

1. Prakalya recomputes each case by hand (or in a spreadsheet) and records it in `source`.
2. Cases that touch a ⚠ rule (odd-paisa split, scheme order, cash discount) wait for the CA's answer in `docs/compliance/RULES_TO_CONFIRM.md`.
3. Nitheesh approves, and `status` becomes `"confirmed"`. Engines may skip `draft` cases in CI but must report them.

Still missing: returns re-pricing (§12, uses §2 with the original line), ageing buckets (§15), ceiling-price check (§19), cess, FIFO valuation (§11 alternative). Add when the related rules are confirmed.
