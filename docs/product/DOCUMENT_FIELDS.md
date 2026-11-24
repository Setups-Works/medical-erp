# Document fields, validation and posting logic

> One page per transaction document: header fields, line fields, the checks that run before save, the maths used (by section of [CALCULATIONS.md](../architecture/CALCULATIONS.md)), and exactly what **posting** writes. Masters (supplier, customer, product): [MASTER_FIELDS.md](MASTER_FIELDS.md). Validation patterns: [VALIDATION_AND_BUSINESS_RULES.md](../architecture/VALIDATION_AND_BUSINESS_RULES.md). Posting ledgers: [CHART_OF_ACCOUNTS.md](../architecture/CHART_OF_ACCOUNTS.md). Tables: [DATA_MODEL.md](../database/DATA_MODEL.md).
>
> Owners: Kamesh (purchase, inventory, sales backend), Nitheesh (payment, accounting), Meyyarivu (POS screens), Ashok (purchase/inventory screens, QA), Prakalya (FRS + acceptance criteria). ⚠ = confirm before build.

## 0. Rules for every document

| Rule | Detail |
|---|---|
| Lifecycle | `DRAFT → POSTED → (REVERSED)`. Drafts are editable and write nothing to stock or books. Posted documents are **immutable** (rule 6). |
| One transaction | Posting writes the document, `inventory_movement` rows, the voucher, the audit entry and outbox events in **one** DB transaction, or nothing. |
| Idempotency | Every create/post accepts `Idempotency-Key`; offline documents carry a client UUIDv7. A replay returns the original. |
| Snapshot | Party name, GSTIN, address, state, licence nos.; item name, HSN, GST rate, batch, MRP; doctor details are copied onto the document. |
| Number | From `number_series` at post time (CALCULATIONS §20); drafts have no number. |
| Date | Inside an open financial year and not in a locked period (CMP/PLT period lock); not later than today + tolerance setting. |
| Permissions | Checked per action (`sales.invoice.post`, `sales.invoice.cancel`, `sales.discount.override`, …), never by role name. |
| Option lists | Payment modes, reasons, states, units, schedules, series come from the API. |
| Totals | Computed by the shared engine (Java truth, `packages/billing-engine` preview); the client never sends totals that the server trusts. |

## 1. Purchase invoice (`/purchase/new`, PUR-02, PUR-07)

**Header**

| Field | Req. | Validation / logic |
|---|---|---|
| Supplier | Y | Active; drug licence valid on the bill date (else block ⚠); GSTIN status not cancelled (warn) |
| Supplier invoice no. + date | Y | Unique per supplier + FY (PUR-05); date ≤ today, ≥ FY start |
| Receive into (branch, warehouse) | Y | User has access to the branch |
| Against PO / GRN | | Lines pulled from PO; quantities matched (PUR-14) |
| Rate mode | Y | Default from the supplier (exclusive / inclusive) |
| Place of supply | auto | From our branch state vs supplier state → CGST+SGST or IGST |
| Freight / other charges | | Allocated to lines (CALCULATIONS §9) |
| Supplier bill total (typed) | Y | Must equal the computed total within ±₹1 round-off, otherwise the user must fix lines — catches typing errors |
| Attachment | | Scan/PDF of the supplier bill (PUR-10) |

**Lines**

| Field | Req. | Validation / logic |
|---|---|---|
| Item | Y | Active; not banned (CAT-12); item mapping remembered per supplier for imports (PUR-04) |
| Batch no. | Y (pharma) | 1–30 chars; same item + batch + expiry + MRP = existing batch, else a new batch |
| Mfg date / expiry (MM/YYYY) | Y expiry | Expiry > mfg; expired → block; within near-expiry days → warn (CALCULATIONS §18) |
| Billed qty / free qty | Y | Billed > 0 (packs or loose per unit setting); free ≥ 0 |
| MRP | Y | > 0; > NPPA ceiling → warn ⚠ (§19); differs from last batch MRP → highlight |
| Rate (PTR) | Y | > 0 and ≤ MRP ex-GST; deviation from last rate / rate contract → warn (PUR-09, PTY-14) |
| Scheme %, trade discount %, cash discount % | | 0–100; order per setting (§2, §5) |
| HSN, GST % | auto | From item master + `hsn_tax` for the bill date; supplier bill showing a different rate → warn, never silently change |
| Computed | — | Taxable, GST split, line total, landed cost (§2, §9) |

**On post:** new `batch` rows (if needed) · `inventory_movement` IN (billed + free, base units, `unit_cost` = landed cost) · weighted-average cost update (§11) · voucher: Dr Purchase, Dr Input CGST/SGST/IGST (only if ITC claimable), Dr/Cr Round Off, Cr Supplier · due date = bill date + credit days (reminders PTY-21) · MSME due-date tracking (PTY-23) · audit.
**Corrections:** purchase return / debit note (§5), never edit.

## 2. Retail POS bill (`/pos`, POS-01 … POS-26)

**Header**

| Field | Req. | Validation / logic |
|---|---|---|
| Customer | Y (walk-in default) | Quick-add by phone (POS-05); add or edit a customer from POS without leaving the bill (POS-31: F3 → + New customer or Alt+N; mobile 10 digits 6–9 and unique per tenant, name 1–100, age 0–120, PIN 6 digits, consent ⚠); saves to the customer master; credit only for a registered customer |
| Walk-in details | C | Only when the customer is walk-in (POS-30). Name 1–100 chars, mobile 10 digits starting 6–9, age 0–120, gender, address; all optional, except **patient name when any line is Schedule H1 / X** (R-18). Stored as `sales_invoice.walkin` snapshot, never as a `customer` row. A mobile matching a saved customer → offer to link the bill to that customer. "Save as customer" (needs name + mobile) creates a Retail (person) customer and links the bill. Consent to store the mobile recorded with time ⚠ (DPDP). Printed in "Billed to" |
| Doctor + prescription no. + Rx image | C | Required when any line is Schedule H/H1/X (POS-06); H1 also needs the patient name for the register; prescriber name and address are required, patient address optional (CMP-01, RESEARCHED_ANSWERS R-18) |
| Pharmacist on duty | Y | Logged-in registered pharmacist or selected (CMP-04) ⚠ |
| Counter / shift / device | auto | Open shift required (POS-14) |
| Bill discount | | Allocated to lines (§8) |
| Payments | Y | Σ modes = grand total; cash change (§13); UPI/card reference optional |

**Lines**

| Field | Req. | Validation / logic |
|---|---|---|
| Item (search / barcode) | Y | Has saleable stock; banned → block; allergy match with patient profile → warning that needs acknowledgement (CMP-13). Shown with pack, manufacturer, HSN and schedule badge (POS-28) |
| Batch | Y | FEFO default (INV-03); expired → block; override needs permission + reason (INV-18) |
| Qty (pack or loose) | Y | ≤ available (on hand − reserved); negative stock policy from settings |
| Rate | auto | Batch MRP (or loose MRP §7); editable down only, never above MRP |
| Discount % | | ≤ effective cap (§8) else manager PIN (POS-21) |
| Computed | — | MRP-inclusive back-calculation (§2), margin check (§10) |
| Columns shown (POS-28) | — | Item · pack · mfr · HSN, batch · exp, qty, MRP, disc %, disc ₹, taxable, GST ₹ (with %), amount; optional columns hide on narrow screens |

**On save (F10):** `sales_invoice` POSTED · `inventory_movement` OUT per batch with `unit_cost` · voucher: Dr Cash / Card-UPI Clearing / Customer, Cr Sales, Cr Output GST, Cr/Dr Round Off · H1 / X register rows (CMP-01/02) · loyalty points (PTY-08) · receipt print + WhatsApp share · audit.
**Offline:** same rules evaluated locally by `billing-engine`; number from the device series; server re-validates on sync and raises a conflict instead of silently changing a bill (OFFLINE_SYNC.md).
**Cancel:** same-day cancel within the setting window with permission + reason creates a full reversal (number kept, marked cancelled); after that only a sales return (§4).

## 3. Wholesale tax invoice (`/sales/invoices/new`, WHS-01 … WHS-14)

As §2, plus:

| Field | Req. | Validation / logic |
|---|---|---|
| Order no. + date | | From the sales order (WHS-01) or typed (WHS-16) |
| L.R. no. + date, vehicle no., cases, weight | C | Cases a whole number; vehicle needed for the e-way bill (WHS-16) |
| Due date | auto | Bill date + party credit days; printed in bold |
| Line section | Y | Sale · Sales return · Breakage / expiry return · Replacement (WHS-15); return lines need a reason and go to saleable (after inspection) or dump stock |
| Line columns | — | Product, packing, manufacturer, HSN, batch, expiry, qty, free, MRP, rate (PTR), disc %, GST %, amount |
| Freight, insurance, packing, other | | Amounts ≥ 0; GST per `billing.charges_gst` ⚠ (DOC-06); posted to Freight & Insurance Recovered |
| Retailer | Y | Drug licence valid (PTY-04, block on expiry ⚠); GSTIN status; credit check (§14) |
| Price list | auto | From party/group (PRC-02); rate = PTR from price list or batch |
| Scheme / free qty | | Per scheme master and overrides (WHS-08) |
| Salesman, route | | From party (commission WHS-09) |
| Transport / vehicle / LR no. | C | Needed for e-way bill when the value is above the threshold ⚠ (WHS-07) |
| E-invoice IRN + QR | C | Generated after post when the company is in scope ⚠ (WHS-06); cancellation within the IRP window only |
| Both parties' DL nos. | auto | Printed (WHS-03, CMP-05) |

**On post:** as §2 but Dr the retailer ledger (credit sale) · each return section posts its own **credit note** (number from the CN series, linked to the invoice) · stock: sale and replacement OUT, sales return IN to saleable after inspection, breakage / expiry IN to the dump location · voucher (CALCULATIONS §22) · due date · e-invoice / e-way jobs queued in the outbox.

## 3a. Printed invoice layout (DOC-07, PRC-14)

| Block | Contents |
|---|---|
| Title | Company name, address, phone, email, "TAX INVOICE" (or "BILL OF SUPPLY" for composition ⚠), linked credit note numbers when returns are on the bill |
| Statutory strip | Our drug licence nos., GSTIN + state code, place of supply |
| Bill to | M/s name, address, phone, GSTIN, DL nos. |
| Document box | Invoice no., date, order no. + date, L.R. no. + date, cases, transport + vehicle, salesman, **due date** |
| Lines | S. no., product, packing, mfr., HSN, batch, exp., qty, free, M.R.P., rate, disc %, GST %, amount; italic section headings "LESS: SALES RETURN", "LESS: BRK/EXP RETURN", "ADD: REPLACEMENT"; page breaks carry forward totals |
| Tax summary | Per GST rate: taxable, CGST + SGST or IGST (returns netted), charges' tax on its own row |
| Totals | Sub total, item discount, bill discount, less returns, taxable value, CGST / SGST / IGST / cess, freight, insurance, other charges, round off, **grand total** |
| Words | Grand total in Indian words ("Rupees … Only") |
| Terms | From the terms & conditions master (return policy, interest on overdue at the party's rate, jurisdiction) |
| Footer | Declaration ("particulars true and correct"), E.&O.E., Checked by, "For <company>" + authorised signatory; bank details / UPI QR; e-invoice IRN + QR when applicable; "Duplicate copy" on reprints (POS-27) |
| Retail thermal variant | Same data, narrower: item, batch · exp, qty, MRP, disc, amount; GST summary; doctor / Rx for Schedule H; pharmacist name; invoice QR (POS-25) |

## 4. Sales return / credit note (`/sales/returns/new`, RET-01, RET-02, RET-06, RET-08)

| Field | Req. | Validation / logic |
|---|---|---|
| Original invoice | Y | Posted, same customer; return window from settings; "without bill" returns only if the setting allows ⚠ (RET-09) |
| Lines | Y | From the original lines; qty ≤ sold − returned; batch fixed |
| Reason | Y | From the reason master; approval above the limit (RET-06) |
| Inspection result per line | Y | Saleable / damaged / expired (RET-08) → saleable back to stock, others to the dump bucket (MKT-04) |
| Settlement | Y | Cash refund, adjust against outstanding, or credit for future bills (RET-02) |

**Maths:** CALCULATIONS §12. **On post:** `inventory_movement` IN (saleable) or IN to dump location · voucher: Dr Sales Return, Dr Output GST (reversal), Cr Customer / Cash · loyalty reversal · audit.

## 5. Purchase return / debit note (`/purchase/returns/new`, RET-03, RET-04)

| Field | Req. | Validation / logic |
|---|---|---|
| Supplier | Y | |
| Against purchase invoice | C | Required for non-expiry returns; expiry/breakage claims may group batches (RET-04) |
| Lines: batch, qty, rate basis | Y | qty ≤ available in that batch; claim basis per distributor ⚠ |
| Reason | Y | Expiry, breakage, short-dated, wrong item, rate difference |

**On post:** `inventory_movement` OUT · voucher: Dr Supplier, Cr Purchase Return, Cr Input GST (reversal) · claim tracking until the supplier's credit note arrives (RET-04).

## 6. Receipt (customer payment) and payment (to supplier) (ACC-01, ACC-02)

| Field | Req. | Validation / logic |
|---|---|---|
| Party | Y | |
| Mode | Y | From payment modes; cheque needs no., date, bank; PDC (date in future) goes to Cheques in Hand (ACC-02) |
| Amount | Y | > 0 |
| Allocation | | FIFO by default or picked invoices; remainder on account (§13) |
| TDS / TCS | C | When the party has a section (§16) ⚠ |
| Bank / cash ledger | Y | User's allowed cash/bank ledgers |

**On post:** voucher (Dr Cash/Bank, Cr Customer for receipts; reverse for payments) · `payment_allocation` rows · reminders stop for paid invoices.
**Cheque bounce** (ACC-14): reverses the receipt, re-opens the allocations, optional bank-charge debit note, and flags the party.

## 7. Stock transfer (`/inventory/transfers`, INV-08)

Header: from branch/warehouse, to branch/warehouse, reason. Lines: item, batch, qty ≤ available. **Dispatch** posts OUT at source into an in-transit location; **Receive** posts IN at destination (short/excess recorded). Inter-branch with different GSTINs is a taxable supply → delivery challan or tax invoice ⚠ VERIFY.

## 8. Stock adjustment (`/inventory/adjustments`, INV-07, INV-09)

Lines: item, batch, qty (+/−), reason code (damage, theft, sample, expiry write-off, count variance), remark. Approval above a value limit (PLT-19). **On post:** `inventory_movement` ± at `unit_cost` · voucher to Stock Adjustment / Expiry Loss per posting rules. Destruction of expired stock records witness and method ⚠ (CMP-14).

## 9. Doctor master (`/masters/doctors`, PTY-05)

Name, qualification, registration no. + state council (required for H1 ⚠), specialisation, clinic/hospital, phone, address (PIN auto-fill), active. Unique: registration no. + council.

## 10. Batch (created by purchase, viewed at `/inventory/batches`)

Item, batch no., mfg date, expiry, MRP, PTR, landed cost, supplier of first receipt, quantities per location, status (active / blocked / recalled). Editable only through: MRP revision with relabel note (INV-19), block/unblock with reason (recall), expiry correction by an authorised user with audit (wrong entry at GRN).
