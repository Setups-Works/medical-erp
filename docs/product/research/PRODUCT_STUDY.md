# Product study: two existing products (P0)

> Owner: Nitheesh · Shared with: Prakalya (BRD input) · Hub task: "Study 2 existing pharmacy products"
> Status: **desk study**. Every pain point below is a hypothesis until a pharmacy confirms it in the Sprint 0 visits (day 1–2). Prakalya records the visit notes in `docs/workflows/` and marks each row below Confirmed / Not seen.
> We never name these products in our docs, UI or marketing. They are called **Product A** and **Product B**.

## The two products

| | Product A | Product B |
|---|---|---|
| What it is | Long-established Windows desktop ERP for Indian pharmacy retail and distribution | Cloud/mobile billing and accounting app for small Indian businesses (all trades) |
| Who uses it | Medical shops, chemist chains, pharma distributors and stockists | Small shops, traders, service businesses; some pharmacies use it for GST billing |
| Strength | Very deep pharmacy features, keyboard speed, distributor workflows | Simple, modern, mobile-first, easy GST invoices and payment links |
| Weakness | Old UI, local install and backups, multi-branch needs add-ons/sync, steep learning curve | Not pharmacy-aware: weak batch/expiry, no Schedule H1 register, no schemes or free quantity |

MENO aims for Product A's depth with Product B's ease, in one product, online-first with offline billing.

## Flows we studied

### 1. Retail counter sale (Product A)
1. Billing screen opens on F-key; cursor in item search.
2. Type 3–4 letters or scan; list shows stock, MRP and batches.
3. Pick batch (nearest expiry first), quantity in strips or loose tablets.
4. Customer and doctor optional; for Schedule H1 items the register asks for patient and doctor.
5. Payment: cash/UPI/card/credit; print on thermal printer.

**What MENO keeps:** keyboard-only flow, F-keys, scan-first, FEFO batch default, loose sale (POS-01..04, INV-03, CAT-05).
**What MENO improves:** prescription capture blocks the sale until filled (POS-06, CMP-01); split payments and UPI QR (POS-07, POS-08); WhatsApp bill share (POS-11); salt/manufacturer search side by side (MKT-02, POS-22).

### 2. Purchase entry from a distributor bill (Product A)
1. Open purchase, pick supplier, type supplier invoice number and date.
2. Enter each line: item, batch, expiry, MRP, PTR, qty, free qty, scheme and discounts, GST.
3. Save: stock and supplier ledger update.

**Pain points (to confirm):** typing 40–80 lines per bill by hand; mapping supplier item names to our items again every time; wrong MRP/expiry typed and sold later; no duplicate-bill check.
**What MENO does:** CSV/Excel import with mapping memory (PUR-04), duplicate supplier invoice detection (PUR-05), rate-change alerts (PUR-09), verification against PO and GRN before posting (PUR-14), and later a photo/PDF of the bill (PUR-10, MKT-09). Posted purchases are reversed, never edited (PUR-08).

### 3. Expiry and returns (Product A)
1. Near-expiry list by month.
2. Make a return to supplier (expiry/breakage), print debit note.
3. Track the credit note from the supplier, often in a separate notebook.

**Pain points (to confirm):** claims lost or forgotten; damaged stock mixed with saleable stock.
**What MENO does:** 30/60/90-day dashboard with actions (INV-05), claim tracking until the credit note arrives (RET-04), separate dump/damaged bucket (MKT-04), inspection before returned stock re-enters (RET-08).

### 4. Wholesale order to cash (Product A)
1. Retailer orders by phone/WhatsApp; salesman enters order.
2. Pick, invoice with DL numbers, dispatch.
3. Collect against outstanding; ageing reports.

**Pain points (to confirm):** credit limits not enforced at order time; scheme mistakes per retailer; e-invoice and e-way bill done in a separate portal.
**What MENO does:** credit check on order (WHS-01, WHS-04), retailer-wise scheme overrides (WHS-08), e-invoice/e-way bill preparation through a GSP (WHS-06/07, only after the rule is confirmed in COMPLIANCE.md), retailer-to-distributor online ordering (MKT-03).

### 5. GST invoice and payment collection (Product B)
1. Create invoice on phone or web in seconds, GST computed.
2. Share PDF and payment link on WhatsApp.
3. Dashboard of who owes what.

**What MENO takes from it:** speed to first invoice, clean simple screens, share-and-collect (POS-11, ACC-11), owner dashboard on the web and later on mobile (DSH, P7 mobile).
**What it lacks for pharmacy (our edge):** batch + expiry, MRP rules (never above MRP, PRC-08), schemes and free quantity (PRC-04/05), Schedule H/H1/X registers (CMP-01/02), drug licence on invoices (CMP-05).

## Pain points to confirm in Sprint 0 visits

| # | Pain point (hypothesis) | Product | MENO answer | Confirmed? |
|---|---|---|---|---|
| 1 | Purchase bills typed line by line | A | PUR-04, MKT-09 | |
| 2 | Data only on one PC; backups manual; multi-branch is hard | A | Cloud + offline desktop sync (DSK-02, POS-15), MKT-10 | |
| 3 | Steep learning curve; staff need training | A | Paper-and-ink UI, role dashboards, command search (NAV) | |
| 4 | Expired stock sold by mistake | A | Expiry block (INV-04) | |
| 5 | Expiry/breakage claims lost | A | RET-04 claim tracking | |
| 6 | H1 register kept on paper | A/B | CMP-01 from sales automatically | |
| 7 | No batch/expiry or schemes | B | INV-01, PRC-04/05 | |
| 8 | GST returns prepared outside the software | A/B | GST-03/04/05 exports (we prepare, never file) | |
| 9 | Owner can't see shop numbers from phone | A | DSH dashboards, P7 owner app | |
| 10 | Credit to customers tracked in a notebook | A/B | ACC-09 outstanding + reminders | |

## Decisions for us

1. **Speed is the first feature.** POS must stay keyboard-only and search under 150 ms (POS-01/02); Product A users will compare us on this before anything else.
2. **Purchase import is the biggest time saver.** Keep PUR-04 in P3 as a Must; collect 3 distributor CSV samples (production readiness task).
3. **Pharmacy rules are our moat** against general billing apps: batch, expiry, MRP, schedules, schemes.
4. **No direct GST filing claims** (AGENTS.md rule 15): we prepare and export.
5. **Migration matters:** customers will come from Product A; opening stock/item import (INV-11) and a data-migration template (Prakalya, P5) stay in scope.

## Next steps

- [ ] Prakalya: take the "Confirmed?" column into the two pharmacy visits; update this file.
- [ ] Prakalya: turn confirmed pain points into BRD "problems to solve" for P1–P3.
- [ ] Nitheesh: if a visit shows a pain point with no feature ID, add it to FEATURES.md through Prakalya.
