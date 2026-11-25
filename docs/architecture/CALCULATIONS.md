# Calculations: pricing, schemes, discounts, GST, rounding

> Money bugs are the most expensive bugs in an ERP. Every rule here must be backed by a case in `contracts/test-vectors/`. Field-level use of these formulas per document: [DOCUMENT_FIELDS.md](../product/DOCUMENT_FIELDS.md). **Rules marked ⚠ VERIFY must be confirmed by Prakalya with a practising pharmacist / CA before implementation.**

## 1. Price terms (see GLOSSARY)

- **MRP** — maximum retail price printed on the pack, **inclusive of GST**. Retail can sell at or below MRP, never above.
- **PTR** — price to retailer (what wholesaler charges retailer), usually **exclusive of GST**.
- **PTS** — price to stockist (what manufacturer/C&F charges wholesaler), exclusive of GST.
- **Rate** — the selling rate actually used on a line.

## 2. Line calculation order (sales and purchase)

```
gross          = rate × billed_qty
scheme         = free_qty (qty only; value 0 on invoice) OR scheme discount %
trade_disc     = gross × td%                      (line-level)
taxable        = gross − trade_disc − scheme_value_disc
cash_disc      = taxable × cd%                    (⚠ VERIFY: before or after tax per tenant setting)
gst            = taxable_after_cd × gst_rate      split CGST+SGST (intra-state) or IGST (inter-state)
line_total     = taxable_after_cd + gst
```

**Retail MRP-inclusive billing:** when the rate is MRP (tax-inclusive), back-calculate: `taxable = mrp_total / (1 + gst_rate)`; GST = `mrp_total − taxable`. Discounts on MRP apply before back-calculation.

## 3. Rounding

- Store all intermediate values at **4 decimals**, `RoundingMode.HALF_UP`.
- Tax per line rounded to **2 decimals**; CGST and SGST each = half of line GST rounded to 2 dp, with the odd paisa assigned to CGST ⚠ VERIFY.
- Invoice grand total rounded to the nearest rupee (**round-off** line, ±0.50), tenant-configurable.
- Never sum rounded displays to compute totals; sum the stored 4-dp values then round once.

## 4. Place of supply

Intra-state if supplier state = place of supply (customer state; for walk-in retail = branch state) → CGST + SGST. Otherwise IGST.

## 5. Schemes (wholesale/purchase)

| Type | Example | Effect |
|---|---|---|
| Free quantity | 10 + 1 | billed_qty 10, free_qty 1; stock +11; cost per unit = value / 11 for valuation |
| Scheme discount % | 5 % on 50+ | applied before trade discount ⚠ VERIFY order |
| Half scheme | 10 + ½ (pack-based) | free qty in loose units |

Stock valuation uses **effective landed cost** (including free goods) — required for profit reports.

## 6a. Configuration inputs (never hard-coded)

Every number below that is not arithmetic comes from configuration (ADR-0014), read **for the document date**:

| Input | Source | Example |
|---|---|---|
| GST and cess rate | `hsn_tax` (effective-dated) | 3004 → 5 % (illustrative) |
| Rounding mode of the grand total | tenant setting `billing.round_to` | nearest ₹1 |
| Cash discount before/after tax | tenant setting `billing.cash_discount_on` | ⚠ VERIFY |
| Scheme-before-trade-discount order | tenant setting `pricing.discount_order` | ⚠ VERIFY |
| Role discount cap, item max discount | `role_setting`, `item.max_discount_pct` | 10 %, 8 % |
| Near-expiry window | branch setting `inventory.near_expiry_days` | 90 |
| Valuation method | company setting `inventory.valuation` | weighted average |
| MSME payment limit, TDS/TCS sections, interest basis | `tds_section`, `statutory_setting`, party | ⚠ CA |
| NPPA ceiling prices | `ceiling_price` (effective-dated) | ⚠ source |

## 7. Loose (unit) sale

```
units_per_pack = item conversion (e.g. 15 tablets per strip)
loose_mrp      = round4(batch_mrp / units_per_pack)        -- shown rounded to 2 dp
line_amount    = loose_mrp × loose_qty − discount
stock_out      = loose_qty / units_per_pack  packs (stored as base units: tablets)
```
Stock is stored in the **base unit** (tablet / ml / piece); packs are a display. A partly cut strip stays in stock as loose units of the same batch. Loose MRP rounding ⚠ VERIFY (some shops round up to the next 10 paise).

## 8. Discount caps and bill-level discount

- Effective cap for a line = `min(role cap, item max discount %, party/group max)`; above it → approval (PLT-19, POS-21).
- **Bill discount** (₹ or %) is **allocated to lines in proportion to line amount before tax** (largest-remainder method on the last paisa) so each line's taxable value and GST stay correct. Never post a bill discount as one line without allocation.
- MRP rule: after every discount, `rate_per_unit ≤ batch_mrp` (hard rule, PRC-08).

## 9. Purchase cost, landed cost and suggested rates

```
line_taxable   = rate × billed_qty − scheme − trade_disc            (§2)
freight_share  = bill_freight × line_taxable / Σ line_taxable       (PUR-06; largest remainder)
landed_value   = line_taxable + freight_share + non_claimable_tax    (GST is excluded when ITC is claimable)
landed_cost    = landed_value / (billed_qty + free_qty)             -- per base unit, 4 dp
suggested_ptr  = round2( mrp / (1 + gst%) × (1 − discount_received%) )   ⚠ trade convention; the supplier bill wins
```
Composition or unregistered supplier → their GST is **not** claimable, so it is part of `landed_value`.

## 10. Margin and mark-up

```
sale_ex_gst = line_taxable (sale)
cost        = landed_cost × qty_sold (from the batch sold)
margin_%    = (sale_ex_gst − cost) / sale_ex_gst × 100
markup_%    = (sale_ex_gst − cost) / cost × 100
```
Billing warns when `markup_% < item.min_markup_pct` and blocks when `sale_ex_gst < cost` unless the user has `sales.below_cost` permission ⚠ policy (PRC-13). Profit reports use the same formula (RPT-06).

## 11. Stock valuation

- Default **weighted average per item per branch**, recomputed on each inward: `new_avg = (old_qty × old_avg + in_qty × landed_cost) / (old_qty + in_qty)`. Alternative **FIFO by batch** (company setting). Free goods enter at zero value, which lowers the average (that is the point of §5).
- Outward movements carry the cost at the time (stored on `inventory_movement.unit_cost`); closing stock value = Σ(qty × unit cost) from the ledger, never typed (CHART_OF_ACCOUNTS `CLOSING_STOCK`).

## 12. Returns, credit and debit notes

- A return line copies **rate, discount, GST rate and batch** from the original invoice line (snapshot), and qty ≤ (sold − already returned).
- Amounts are recomputed with §2/§3 for the returned qty; the credit note's GST reverses output tax for the same rate and place of supply.
- Rate-difference (financial) credit/debit notes have **no stock**; GST on them follows the original invoice's rate ⚠ VERIFY.
- Expiry returns to supplier are valued at the supplier's agreed claim basis (PTR or a %) ⚠ VERIFY per distributor.

## 13. Payments, allocation and change

```
change_due     = Σ tendered − bill_total            (cash only; never negative)
allocation     = oldest open invoice first (FIFO) unless the user picks invoices; remainder = on-account advance
outstanding    = Σ debits − Σ credits on the party ledger (not stored, derived)
```
Split payment: Σ modes = bill total exactly; card/UPI amounts post to `CARD_UPI_CLEARING`.

## 14. Credit limit check (at save)

`exposure = outstanding + unposted held/ordered value + this bill`; block or ask approval when `exposure > credit_limit` (PTY-07), and when any invoice is older than `credit_days` if the setting `credit.block_on_overdue` is on.

## 15. Ageing and interest on overdue

- Due date = invoice date + credit days. Buckets from settings (default 0–30, 31–60, 61–90, > 90).
- Interest (PTY-29): `simple = overdue_amount × rate% × days_overdue / basis_days` (365 or 360); `compound monthly = P × ((1 + r/12)^(months) − 1)`; rounded to 2 dp. Posting an interest debit note is optional ⚠ CA.

## 16. TDS on purchase of goods (example of a configured section)

`tds = round(taxable_value_above_threshold × section_rate%, 2)`; threshold, rate and turnover condition read from `tds_section` for the date; aggregation per party per financial year ⚠ CA must confirm before ACX-06 ships. Sections are stored with the **act version** (Income Tax Act 1961 vs 2025, which applies from 01-04-2026 with new numbering) — RESEARCHED_ANSWERS R-11.

## 17. Reorder and stock levels

```
avg_daily_sale = units sold in last N days / N           (N from settings, default 30)
reorder_point  = avg_daily_sale × lead_time_days + safety_stock
suggested_qty  = max(0, max_qty − (on_hand + on_order − reserved))
available      = on_hand − reserved                       (INV-17)
```

## 18. Expiry buckets and near-expiry pricing

`days_left = expiry_last_day_of_month − today`. A batch is **expired** when `days_left < 0` (sale blocked), **near expiry** when `days_left ≤ near_expiry_days`. Expiry is stored as the **last day of the expiry month** (MM/YYYY printed on the strip).

## 19. NPPA ceiling price check (DPCO) ⚠

For a scheduled formulation with a ceiling price for the date: `mrp_ex_gst ≤ ceiling_price` per unit (+ GST as allowed). Purchase entry warns when a batch MRP exceeds the ceiling; sale above the ceiling is blocked once the rule is confirmed ⚠ (FEATURES CMP-12).

## 20. Document numbering

`<prefix>/<FY yy-yy>/<zero-padded seq>` from `number_series` per branch + document type + FY (+ device for offline). Max 16 characters for GST invoices ⚠ VERIFY. Gaps are allowed only for cancelled documents, which keep their number.

Every section above gets test vectors under `contracts/test-vectors/<section>/` before implementation (rule 8).

## 21. Shared implementations

| Where | Implementation |
|---|---|
| Server (truth) | `modules/taxation` `GstCalculator`, `modules/pricing` `PricingEngine` (Java, BigDecimal) |
| Offline desktop + live preview in UI | `packages/billing-engine` (TS, decimal.js) |
| Contract | `contracts/test-vectors/{gst,pricing,schemes}/*.json` — `{ name, input, expected }` |

Test vector shape (documentation only; finalised in Sprint 1):

```json
{
  "name": "retail MRP inclusive 12% intra-state with 10% discount",
  "input": { "mode": "MRP_INCLUSIVE", "lines": [{ "rate": "112.00", "qty": "2", "discountPct": "10", "gstRate": "12" }]  // illustrative rate only: the 12 % slab was reportedly removed from 22-09-2025 ⚠; real rates come from hsn_tax, "intraState": true },
  "expected": { "taxable": "180.0000", "cgst": "10.80", "sgst": "10.80", "total": "201.60", "roundOff": "0.40", "grandTotal": "202.00" }
}
```

## 22. Combined distributor bill and charges (WHS-15, DOC-06)

```
for each line: calc as §2 (EXCLUSIVE), sign = +1 for Sale and Replacement, −1 for Sales return and Breakage/expiry return
sub_total      = Σ gross (sale + replacement)
item_discount  = Σ trade discount (sale + replacement)
returns        = Σ taxable (return sections)                     -- each return section is its own credit note
charges        = freight + insurance + other
charges_gst    = round2(charges × rate)                           rate from setting billing.charges_gst ⚠
tax_head_net   = Σ sign × line tax head  + charges tax head       (CGST/SGST/IGST per §4)
total          = Σ taxable(sale+repl) − returns + charges + Σ tax_head_net
grand_total    = round(total) per §3; round_off = grand_total − total
```
Voucher (one view, separate documents underneath): Dr Party = grand total · Dr Sales Return = returns · Cr Sales = taxable (sale + repl.) · Cr / Dr Output GST heads = net · Cr Freight & Insurance Recovered = charges · Round Off by sign. Party ledger shows the invoice (incl. charges), each credit note and the round off separately; balance = grand total.
