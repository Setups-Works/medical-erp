# Calculations: pricing, schemes, discounts, GST, rounding

> Money bugs are the most expensive bugs in an ERP. Every rule here must be backed by a case in `contracts/test-vectors/`. **Rules marked ⚠ VERIFY must be confirmed by Prakalya with a practising pharmacist / CA before implementation.**

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

## 6. Shared implementations

| Where | Implementation |
|---|---|
| Server (truth) | `modules/taxation` `GstCalculator`, `modules/pricing` `PricingEngine` (Java, BigDecimal) |
| Offline desktop + live preview in UI | `packages/billing-engine` (TS, decimal.js) |
| Contract | `contracts/test-vectors/{gst,pricing,schemes}/*.json` — `{ name, input, expected }` |

Test vector shape (documentation only; finalised in Sprint 1):

```json
{
  "name": "retail MRP inclusive 12% intra-state with 10% discount",
  "input": { "mode": "MRP_INCLUSIVE", "lines": [{ "rate": "112.00", "qty": "2", "discountPct": "10", "gstRate": "12" }], "intraState": true },
  "expected": { "taxable": "180.0000", "cgst": "10.80", "sgst": "10.80", "total": "201.60", "roundOff": "0.40", "grandTotal": "202.00" }
}
```
