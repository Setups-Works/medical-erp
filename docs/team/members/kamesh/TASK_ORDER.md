# Kamesh — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**261 tasks** · P0: 3 · P1: 7 · P2: 26 · P3: 48 · P4: 60 · P5: 78 · P6: 34 · P7: 5

## P0 · Foundation (3)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | ✅ Learn: Spring Boot 4 basics, Spring Data JPA, Flyway, Testcontainers, Spring Modulith (links in `docs/team/ONBOARDING.md`) | Groundwork | — |
| 2 | ✅ ER diagram v1 for catalog, party, purchase, inventory, sales (`docs/database/DATA_MODEL.md`) | Groundwork | — |
| 3 | ✅ Walk through module template with Nitheesh | Groundwork | — |

## P1 · Platform core (7)

| Step | Task | Type | With |
|---|---|---|---|
| 4 | Help Nitheesh with `identity` and audit; write the permission seed migration for your modules | Groundwork | — |
| 5 | Validation layer for your modules: Bean Validation DTOs + domain invariants + DB constraints (VALIDATION_AND_BUSINESS_RULES.md) | Groundwork | — |
| 6 | Cross-tenant tests for every endpoint you add | Groundwork | — |
| 7 | Backend skeleton: Maven project, Spring Modulith, `ArchitectureTest`, `common/error` (Problem Details), `common/web` (page envelope), `common/money`, `common/validation` | Groundwork | — |
| 8 | `security/`: JWT issue/verify, refresh rotation, cookie handling, `PermissionChecker` | Groundwork | — |
| 9 | `tenancy/`: `TenantContextFilter`, Hibernate filter, RLS `SET LOCAL` interceptor, `CrossTenantAccessTest` base | Groundwork | — |
| 10 | Cross-tenant test base class in place and used by every endpoint test | Readiness | Nitheesh |

## P2 · Masters (26)

| Step | Task | Type | With |
|---|---|---|---|
| 11 | `catalog`: items, generic/salt, brands, manufacturers, HSN, units + conversion, barcodes, categories | Groundwork | — |
| 12 | `party`: suppliers, customers, retailers, doctors, opening balances, customer groups | Groundwork | — |
| 13 | Item search endpoint (trigram index, < 150 ms) | Groundwork | — |
| 14 | PLT-22 Reference data: PIN code directory (state, district, city) and IFSC directory (bank, branch), loaded from public sources with scheduled refresh (verify) licence check | Feature | Jeeva |
| 15 | CAT-01 Item master: name, brand, generic name, manufacturer, marketed by, composition (salts + strength), dosage form, pack (e.g. 1×10 strip), units (pack/loose) | Feature | Ashok |
| 16 | CAT-02 HSN code + GST rate, cess, tax-inclusive flag | Feature | Ashok |
| 17 | CAT-03 Schedule classification (H, H1, X, G, OTC, Narcotic/NDPS) and prescription-required flag | Feature | Ashok |
| 18 | CAT-04 Barcodes (multiple per item, EAN/GS1, internal barcode generation) | Feature | Ashok |
| 19 | CAT-14 Non-pharma items (FMCG, surgical, cosmetics) with their own GST | Feature | Ashok |
| 20 | CAT-15 Generic / salt master: salt name, strength, unit; normalised so the same composition is never stored twice | Feature | Ashok |
| 21 | CAT-16 Brand and manufacturer masters (marketer vs manufacturer, contact, GSTIN) | Feature | Ashok |
| 22 | CAT-17 Unit master + multi-level unit conversion (box → strip → tablet) used by purchase, stock and POS | Feature | Ashok |
| 23 | CAT-20 Storage instructions and medicine detail page (complete profile: stock by branch, batches, substitutes, history) | Feature | Ashok |
| 24 | CAT-25 Product identity and control fields: product code, print name, department, 2-level category and therapeutic class trees, nature of product (finished goods, consumable, service, asset), shelf life, warranty (devices), barcode / batch / active toggles (pharma items always batch-enabled), remarks | Feature | Ashok |
| 25 | PTY-01 Supplier master: GSTIN (validated format + state), drug licence nos., contact, bank, credit days | Feature | Ashok |
| 26 | PTY-02 Customer master (retail): name, phone, address, age/gender (optional), allergies note | Feature | Ashok |
| 27 | PTY-03 Retailer master (wholesale): GSTIN, DL nos. + expiry, credit limit, credit days, price list, route, salesman | Feature | Ashok |
| 28 | PTY-16 Party identity fields: print name, party code (auto from series), party type (supplier: manufacturer, distributor, stockist, C&F; customer: retail, retailer, hospital, clinic, institution, doctor) and party group, all options from the API | Feature | Ashok |
| 29 | PTY-17 Multiple contacts per party: type (primary, accounts, orders, sales rep), person, designation, email, mobile, office no.; exactly one primary | Feature | Ashok |
| 30 | PTY-18 Multiple addresses per party (billing, shipping, godown) with PIN code auto-fill of state, district and city; billing state must match the GSTIN state | Feature | Ashok |
| 31 | PTY-19 Party licences as rows: drug licence form + number + valid from/to + scan upload, FSSAI licence, NDPS licence; expiry reminders 30/15/7 days (verify) | Feature | Ashok |
| 32 | PTY-24 Party GST fields: registration type (regular, composition, unregistered, SEZ, overseas) and default rate mode on their bills (exclusive / inclusive of GST); composition and unregistered suppliers give no input tax credit | Feature | Ashok |
| 33 | DOC-04 Masters for transporters, terms & conditions, narrations, modes of payment, salesman/agent | Feature | Meyyarivu |
| 34 | GST-09 GST configuration: registrations per company, rate master, reverse-charge and composition settings (data, never hard-coded) | Feature | Gokul |
| 35 | CAT-06 Categories, therapeutic class, storage condition (cold-chain 2–8 °C, below 25 °C) | Feature | Ashok |
| 36 | Synthetic seed data for staging (items, parties, batches) that never uses real customer data | Readiness | — |

## P3 · Purchase & inventory (48)

| Step | Task | Type | With |
|---|---|---|---|
| 37 | `taxation` GstCalculator & `pricing` engine passing test vectors (pair with Nitheesh): Java twin of every `@meno/billing-engine` function listed in `docs/architecture/BACKEND_IMPLEMENTATION.md` §4; `TestVectorsTest` loads all 72 vectors | Groundwork | — |
| 38 | `inventory`: batch, movement ledger, stock_balance, adjustments, nightly reconciliation job | Groundwork | — |
| 39 | `purchase`: PO, GRN, verification, invoice entry, posting, reversal, duplicate detection, import pipeline | Groundwork | — |
| 40 | AUT-10 Data step: start fresh, Excel templates or migrate from current software; dry run, review and approve before commit; masters → opening stock by batch → outstanding → ledger openings | Feature | Meyyarivu |
| 41 | CAT-08 Min / max / reorder level per branch | Feature | Ashok |
| 42 | CAT-28 Discontinued items: flag with date and reason; blocks new purchase, PO and sale; returns allowed per setting; shown in search with a badge; replacement item suggested | Feature | Ashok |
| 43 | PTY-10 Party opening balances | Feature | Ashok |
| 44 | PTY-20 Multiple bank accounts per party with IFSC validation and auto-fill, UPI ID, masked and encrypted account no.; bank-detail changes need approval (maker-checker) and are audited | Feature | Ashok |
| 45 | PRC-01 Batch-wise MRP, PTR, PTS, purchase rate, selling rate | Feature | Gokul |
| 46 | PRC-04 Free-quantity schemes (10+1, 20+3) on purchase and sale | Feature | Gokul |
| 47 | PRC-05 Scheme discount %, trade discount, cash discount (verify) order of application | Feature | Gokul |
| 48 | PRC-12 Product price defaults: discount received %, discount allowed %, maximum discount % per item (lower of item and role cap wins) | Feature | Gokul |
| 49 | PUR-01 Purchase order (manual or from reorder suggestions), email/WhatsApp PO to supplier | Feature | Meyyarivu |
| 50 | PUR-02 Purchase invoice entry: supplier inv no/date, lines with batch, expiry, MRP, PTR, qty, free qty, discounts, GST | Feature | Meyyarivu |
| 51 | PUR-04 Distributor CSV / Excel purchase import with item mapping memory (supplier item code → our item) | Feature | Meyyarivu |
| 52 | PUR-05 Duplicate supplier invoice detection | Feature | Meyyarivu |
| 53 | PUR-07 Purchase posting → batches, stock movements, supplier ledger | Feature | Meyyarivu |
| 54 | PUR-08 Purchase cancellation via reversal (no edit after post) | Feature | Meyyarivu |
| 55 | PUR-13 PO tracking: pending, partially received, closed; pending purchases list | Feature | Meyyarivu |
| 56 | INV-01 Batch-wise stock (batch no, mfg date, expiry, MRP, cost) per branch | Feature | Meyyarivu |
| 57 | INV-02 Movement ledger for every change (purchase, sale, returns, transfer, adjustment, count) | Feature | Meyyarivu |
| 58 | INV-05 Near-expiry dashboard (30/60/90 days) with actions: return to supplier, discount, transfer | Feature | Meyyarivu |
| 59 | INV-06 Low stock / out of stock alerts | Feature | Meyyarivu |
| 60 | INV-07 Stock adjustment with reason codes (damage, theft, sample, correction) and approval | Feature | Meyyarivu |
| 61 | INV-10 Stock valuation (FIFO / weighted average, incl. free goods) | Feature | Meyyarivu |
| 62 | INV-11 Opening stock import | Feature | Meyyarivu |
| 63 | INV-12 Nightly reconciliation of balances vs ledger, alerts on drift | Feature | Meyyarivu |
| 64 | MKT-01 Short book / shortage list: items marked at the counter when out of stock or low; one click turns it into a PO per supplier | Feature | Meyyarivu |
| 65 | DOC-02 Full purchase cycle: Purchase order → Purchase challan (goods without bill) → Purchase bill → Return → Debit note | Feature | Meyyarivu |
| 66 | GST-01 Intra/inter-state determination, CGST/SGST/IGST, cess | Feature | Gokul |
| 67 | GST-11 Invoice GST validation before posting (GSTIN format/state, place of supply, HSN, rate, totals) | Feature | Gokul |
| 68 | GST-15 GST rate change roll-over: effective-dated bulk HSN rate change, drafts and open orders re-priced on the change date, MRP relabel prompts for old stock, before/after report (verify) confirm rates with CA | Feature | Gokul |
| 69 | CAT-07 Rack / shelf / bin location per branch | Feature | Ashok |
| 70 | CAT-10 Global medicine database seed (common Indian brands) to speed up item creation (verify) licensing of data source | Feature | Ashok |
| 71 | CAT-11 Item merge (duplicate cleanup) with history preserved | Feature | Ashok |
| 72 | CAT-18 Medicine export (Excel/CSV) with the same columns as import | Feature | Ashok |
| 73 | CAT-19 Medicine history: price changes, purchases, sales, adjustments for one item | Feature | Ashok |
| 74 | CAT-23 Pre-fill the medicine create form from Indian medicine data: search by brand, salt or barcode and fill name, brand, salts + strengths, manufacturer, dosage form, pack and loose units; each pre-filled field marked and editable; save blocked until HSN, GST, schedule and pack are confirmed by the user (verify) | Feature | Ashok |
| 75 | CAT-27 Product stock defaults: lead time, default in/out warehouse, ranked preferred vendors (used by PO and reorder) | Feature | Ashok |
| 76 | CAT-29 Create missing masters on the fly when adding or importing a product (brand, manufacturer, category, unit): shown as "will be created", reviewed in one list, audited | Feature | Ashok |
| 77 | PTY-11 Supplier price list: agreed / last rates per supplier and item, shown during purchase | Feature | Ashok |
| 78 | PTY-15 GSTIN fetch on supplier and customer forms: verify a GSTIN and fill legal/trade name, state, address and GST status (Active / Cancelled / Suspended); cancelled GSTIN warns at purchase and sale; spec [GSTIN_FETCH.md](GSTIN_FETCH.md), provider adapter INT-17 (verify) GSP provider and cost | Feature | Ashok |
| 79 | PTY-27 Party default discounts (discount %, cash discount %, special discount %) copied to purchase and sale documents | Feature | Ashok |
| 80 | PRC-09 Price change history | Feature | Gokul |
| 81 | PUR-03 Goods receipt (GRN) with short/excess/damaged quantities | Feature | Meyyarivu |
| 82 | PUR-12 Purchase dashboard: open POs, pending GRNs, payables due, price changes | Feature | Meyyarivu |
| 83 | PUR-14 Purchase verification: match supplier bill against PO and GRN (qty, batch, rate) before posting | Feature | Meyyarivu |
| 84 | Nightly stock reconciliation job with alert on drift | Readiness | — |

## P4 · Retail POS & returns (60)

| Step | Task | Type | With |
|---|---|---|---|
| 85 | `sales`: retail invoice posting, FEFO with authorised override, `SELECT … FOR UPDATE` batch locking, idempotency | Groundwork | — |
| 86 | Held bills, discount approval, invoice list/reprint | Groundwork | — |
| 87 | `returns`: sales return with inspection, purchase return, expiry/breakage claims, credit/debit notes | Groundwork | — |
| 88 | `compliance`: prescriptions, Schedule H1 register, restricted-medicine guard | Groundwork | — |
| 89 | CAT-05 Loose / strip sale: sell by tablet with conversion factor, loose MRP | Feature | Ashok |
| 90 | PTY-32 Doctor master fields: qualification, registration no. + state council (unique together), specialisation, clinic, address with PIN auto-fill | Feature | Ashok |
| 91 | PRC-06 Item/category/party-wise discount rules, max discount per role | Feature | Gokul |
| 92 | PRC-07 Bill-level discount and round-off | Feature | Gokul |
| 93 | PRC-08 Never sell above MRP (hard rule) | Feature | Gokul |
| 94 | PRC-14 Totals breakdown on every invoice: sub total, item discount, bill discount, returns, taxable value, CGST / SGST / IGST / cess, charges, round off, grand total, each shown separately and never merged | Feature | Gokul |
| 95 | INV-03 FEFO batch suggestion (first expiry first out) at sale | Feature | Meyyarivu |
| 96 | INV-04 Expiry block: cannot sell expired; warn within N days (setting) | Feature | Meyyarivu |
| 97 | INV-18 FEFO override with an authorised reason (recorded in the movement and audit log) | Feature | Meyyarivu |
| 98 | INV-20 Batch block / recall: block a batch across branches with a reason; traceability list of who bought it (RPT-14) and supplier return | Feature | Meyyarivu |
| 99 | MKT-02 Salt-wise / composition-wise search with all brands and stock shown side by side | Feature | Meyyarivu |
| 100 | MKT-05 Party-wise last rate and last discount shown while billing and purchasing | Feature | Meyyarivu |
| 101 | POS-01 Keyboard-first billing screen (F-keys, no mouse needed), barcode-first | Feature | Meyyarivu |
| 102 | POS-02 Fast search by name / generic / composition / barcode, fuzzy, < 150 ms | Feature | Meyyarivu |
| 103 | POS-03 Batch picker with FEFO default, expiry and stock shown | Feature | Meyyarivu |
| 104 | POS-04 Loose quantity sale (tablets from strip) | Feature | Meyyarivu |
| 105 | POS-05 Customer + doctor selection, quick add customer by phone | Feature | Meyyarivu |
| 106 | POS-06 Prescription capture for Schedule H/H1/X (doctor, Rx no., image upload/scan) — blocks sale until captured | Feature | Meyyarivu |
| 107 | POS-07 Multiple payment modes in one bill (cash, UPI, card, credit, wallet), change calculation | Feature | Meyyarivu |
| 108 | POS-09 Hold / recall bills, multiple open bills | Feature | Meyyarivu |
| 109 | POS-10 Thermal (2"/3") and A4/A5 invoice printing, configurable templates | Feature | Meyyarivu |
| 110 | POS-12 Sales return / exchange from POS against invoice | Feature | Meyyarivu |
| 111 | POS-20 Invoice list and details: search, filter, reprint, share, cancel through credit note | Feature | Meyyarivu |
| 112 | POS-21 Discount approval at the counter: manager PIN override above the role limit, logged | Feature | Meyyarivu |
| 113 | POS-22 Search by manufacturer and by salt in POS search (in addition to name/barcode) | Feature | Meyyarivu |
| 114 | POS-27 Reprint marking: reprints show "Duplicate copy" with reprint count, user and time audited | Feature | Meyyarivu |
| 115 | POS-28 POS line columns: item with pack, manufacturer, HSN and schedule badge; batch · expiry; qty; MRP; disc % and ₹; taxable; GST % and ₹; amount; column set configurable per counter (narrow screens hide optional columns) | Feature | Meyyarivu |
| 116 | POS-30 Walk-in customer details: optional name, mobile, age, gender and address on a walk-in bill, stored as a snapshot on the bill (no customer record); patient name required when the bill has a Schedule H1 / X line; a mobile that matches a saved customer offers to link the bill; "Save as customer" creates a Retail (person) customer; walk-in mobiles with repeat visits listed for conversion (CRM-10); printed on the bill; searchable by mobile for returns and reprints; DPDP notice and consent before storing the mobile (verify) | Feature | Meyyarivu |
| 117 | POS-31 Add and edit a customer from POS: F3 picker shows "+ New customer" (Alt+N), and a typed unknown mobile offers "Add as new customer"; dialog with mobile, name, age, gender, address + PIN, regular doctor, allergies; saves a Retail (person) customer into the same customer master and selects it on the bill; "Edit customer" on the selected customer; duplicate mobile offers the existing customer instead; walk-in details already typed are carried into the dialog; consent recorded (verify); old bills keep their snapshot | Feature | Meyyarivu |
| 118 | RET-01 Sales return against invoice (batch-aware), stock back only if saleable | Feature | Ashok |
| 119 | RET-02 Credit note (refund, adjust against outstanding, or future bills) | Feature | Ashok |
| 120 | RET-03 Purchase return to supplier with debit note | Feature | Ashok |
| 121 | RET-04 Expiry return / breakage claim to supplier (batch list, claim tracking until credit note received) | Feature | Ashok |
| 122 | RET-08 Return inspection: decide saleable / damaged / expired per line before stock re-entry | Feature | Ashok |
| 123 | DOC-07 Invoice print content standard: both parties' DL nos., GSTINs and state codes, invoice / order / L.R. / due date, line columns (S. no., product, packing, manufacturer, HSN, batch, expiry, qty, free, MRP, rate, disc %, GST %, amount), section headings, tax summary by rate, sub total, item discount, returns, taxable, tax heads, charges, round off, grand total, amount in words, terms from the terms master, declaration, E.&O.E., checked by, authorised signatory, bank / UPI QR, page x of y with carried-forward totals | Feature | Meyyarivu |
| 124 | DOC-08 Print formats: laser A4 / A5, dot-matrix on pre-printed stationery (fixed positions, carry-forward per page), thermal 2" / 3"; template chosen per document type, counter and party | Feature | Meyyarivu |
| 125 | CMP-01 Schedule H1 register (auto from sales: patient, doctor, item, qty, date) — printable/exportable | Feature | Ashok |
| 126 | CMP-03 Prescription storage (image), linked to invoice, retention policy | Feature | Ashok |
| 127 | CMP-05 Drug licence numbers printed on invoices; licence expiry alerts for own branches | Feature | Ashok |
| 128 | CMP-09 Restricted-medicine alerts at billing: schedule warnings and required steps | Feature | Ashok |
| 129 | GST-02 HSN summary on invoices and reports | Feature | Gokul |
| 130 | CAT-09 Generic substitutes (same composition + strength) shown at POS when out of stock | Feature | Ashok |
| 131 | CAT-12 Banned / recalled drug list with blocking at sale and purchase (verify) CDSCO list maintenance | Feature | Ashok |
| 132 | CAT-22 Barcode lookup for unknown items: when a scanned barcode is not in the tenant catalogue, look up own barcodes (CAT-04) → Indian medicine data (CAT-10 / INT-11); a hit pre-fills a draft item, a miss opens quick-create with the barcode filled. Never blocks billing | Feature | Ashok |
| 133 | PTY-05 Doctor master (name, registration no., clinic) for prescriptions and doctor-wise reports | Feature | Ashok |
| 134 | PTY-30 Retail patient profile on the customer: age or date of birth, gender, allergies, chronic conditions, regular doctor, ABHA no.; permission-gated, never logged, consent recorded (verify) | Feature | Ashok |
| 135 | PUR-19 Merge purchase orders: receive several open POs of one supplier into one purchase invoice or challan; pending-PO-lines report per supplier and item | Feature | Meyyarivu |
| 136 | INV-19 Batch MRP revision (price change notified by the manufacturer): new MRP from a date, relabel note, old stock rule, full audit | Feature | Meyyarivu |
| 137 | MKT-04 Dump / broken / damaged stock bucket, kept separate from saleable stock, feeding expiry and breakage claims | Feature | Meyyarivu |
| 138 | POS-11 WhatsApp / SMS invoice share (PDF link) | Feature | Meyyarivu |
| 139 | POS-16 Substitute suggestion when item out of stock | Feature | Meyyarivu |
| 140 | RET-06 Return reasons & approval limits | Feature | Ashok |
| 141 | CMP-04 Pharmacist on duty recorded on each bill (registration no.) | Feature | Ashok |
| 142 | CMP-06 Banned/recalled drug block (see CAT-12) | Feature | Ashok |
| 143 | CMP-12 NPPA / DPCO ceiling price check: ceiling price table (effective-dated); warn at purchase when batch MRP exceeds the ceiling, block sale once confirmed (verify) source and update process | Feature | Ashok |
| 144 | RET-09 Counter return without the original bill, only when the store policy setting allows it, at the lower of last selling price and MRP, with approval (verify) | Feature | Ashok |

## P5 · Wholesale, finance, offline (78)

| Step | Task | Type | With |
|---|---|---|---|
| 145 | Wholesale orders → pick → invoice, price lists, schemes, credit control, reservations | Groundwork | — |
| 146 | e-invoice / e-way bill via the GSP adapter (`integrations/gst`) | Groundwork | — |
| 147 | Stock transfers, stock count, stock aging | Groundwork | — |
| 148 | Server-side validation used by `sync` push (with Nitheesh) | Groundwork | — |
| 149 | PLT-26 Migration importers for exports of popular software (Marg, Tally, Busy, Vyapar, GoFrugal): items, parties, opening stock by batch, outstanding bills, ledgers with opening balances; dry run with error report | Feature | Ashok, Jeeva |
| 150 | PLT-29 Head-office control for chains: items, HSN / GST, prices, offers, users and settings managed centrally and pushed to outlets; which fields an outlet may override is a setting; push log per outlet | Feature | Nitheesh |
| 151 | PTY-06 Party ledger, outstanding, ageing | Feature | Ashok |
| 152 | PTY-07 Credit limit & credit days enforcement with override approval | Feature | Ashok |
| 153 | PTY-13 Customer and supplier account statements (date range, PDF, email/WhatsApp) | Feature | Ashok |
| 154 | PTY-34 Credit rules beyond amount: limit by value, number of open bills and oldest bill age; over-limit approval from the owner's phone; average payment days shown at billing | Feature | Ashok |
| 155 | PRC-02 Price lists / rate levels (A/B/C retailers, institutions, hospitals) | Feature | Gokul |
| 156 | PRC-15 Offer engine: bill value, item, item group, category, manufacturer, combo, buy-X-get-Y, accumulated purchase, time-bound (hours / days), customer segment and near-expiry batch offers; priority and stacking rules; usage report | Feature | Gokul |
| 157 | PUR-11 Reorder suggestions (min/max, sales velocity, lead time) | Feature | Meyyarivu |
| 158 | PUR-20 Chain indents: outlets raise indents (manual or from min / max); head office consolidates them into supplier POs or fulfils from the warehouse by stock transfer; indent status per outlet | Feature | Meyyarivu |
| 159 | INV-08 Branch-to-branch stock transfer (dispatch → in transit → receive) with GST delivery challan / inter-state invoice (verify) | Feature | Meyyarivu |
| 160 | POS-14 Shift open/close, cash denomination count, day-end report per counter | Feature | Meyyarivu |
| 161 | POS-15 Offline billing on desktop with sync (see OFFLINE_SYNC.md) | Feature | Meyyarivu |
| 162 | RET-05 Wholesale: accept expiry/breakage returns from retailers per policy | Feature | Ashok |
| 163 | WHS-01 Sales order entry (phone/WhatsApp orders) with price list, schemes, credit check | Feature | Meyyarivu |
| 164 | WHS-02 Order → pick list → invoice (partial fulfilment, backorders) | Feature | Meyyarivu |
| 165 | WHS-03 Bulk GST tax invoice (A4), with DL nos. of both parties printed | Feature | Meyyarivu |
| 166 | WHS-04 Credit sales with due dates, credit limit enforcement | Feature | Meyyarivu |
| 167 | WHS-06 E-invoice (IRN + QR) generation via IRP/GSP (verify) turnover threshold | Feature | Meyyarivu |
| 168 | WHS-15 Combined distributor bill: one printed document with sections Sales, Less sales return, Less breakage / expiry return, Add replacement; each return section is a credit note with its own number linked to the invoice, replacement lines are invoice lines (RET-07), the settlement is netted (verify) CA | Feature | Meyyarivu |
| 169 | WHS-16 Dispatch details on invoices: order no. + date, L.R. no. + date, transporter, vehicle no., number of cases, weight; printed and passed to the e-way bill | Feature | Meyyarivu |
| 170 | WHS-17 Stock & sales statement (secondary sales) per manufacturer / company: opening, purchase, purchase return, sales, sales return, free, closing by item for a month; Excel / PDF / email to the company or C&F | Feature | Meyyarivu |
| 171 | WHS-19 Dispatch checking (item checker): scan every item and batch against the invoice before dispatch on web or phone, mismatch alerts, several checkers in parallel, checker name on the packing slip; same scan for GRN check-in with rack allocation | Feature | Meyyarivu |
| 172 | DOC-01 Full sales cycle: Quotation → Sales order → Delivery challan → Invoice → Return → Credit note (convert any step to the next, partial conversion supported) | Feature | Meyyarivu |
| 173 | DOC-06 Additional charges on sales and purchase invoices (freight, insurance, packing, other): amount, GST treatment from the setting `billing.charges_gst` (verify), posted to its own ledger; on purchase, allocated into landed cost (PUR-06) | Feature | Meyyarivu |
| 174 | CMP-07 Data privacy: patient data minimisation, consent, deletion requests (DPDP Act) | Feature | Ashok |
| 175 | GST-06 E-invoice and e-way bill (see WHS-06/07) | Feature | Gokul |
| 176 | PTY-04 Drug licence expiry tracking & block sale to retailers with expired licence | Feature | Ashok |
| 177 | PTY-12 Customer groups (individual, retailer, hospital, institution) with default price list, discount and credit terms | Feature | Ashok |
| 178 | PTY-14 Distributor rate contracts (terms of trade): agreed rate, scheme, discount and credit days per supplier + item, valid from / to; purchase entry flags deviations (extends PTY-11) | Feature | Ashok |
| 179 | PTY-21 Per-party payment reminders: schedule (N days before due, on due date, custom) and channels (email, WhatsApp, SMS); supplier reminders are for us, customer reminders go to the customer | Feature | Ashok |
| 180 | PTY-26 Transporter master and party defaults (transporter, mode, vehicle type) used by GRN, delivery and e-way bill | Feature | Ashok |
| 181 | PTY-31 Party merge (duplicate cleanup) with ledgers, documents and history preserved | Feature | Ashok |
| 182 | PTY-33 Party self-registration link: send a link; the retailer or customer fills GSTIN, licences, address and contacts; staff review and approve before the party is active | Feature | Ashok |
| 183 | PRC-03 Margin-based selling price rules (e.g. PTR = MRP − 20 %) | Feature | Gokul |
| 184 | PRC-10 Value-based schemes (spend ₹X, get Y % or free goods) | Feature | Gokul |
| 185 | PRC-11 Company-wise (manufacturer-wise) discount rules for wholesale | Feature | Gokul |
| 186 | PRC-13 Minimum / maximum mark-up % per item (warn below cost + min mark-up, block below cost (verify) policy) and product commission % | Feature | Gokul |
| 187 | PUR-06 Landed cost (freight, other charges) allocation | Feature | Meyyarivu |
| 188 | PUR-09 Rate difference / price change alerts vs last purchase | Feature | Meyyarivu |
| 189 | PUR-15 Supplier price comparison for an item across suppliers and time | Feature | Meyyarivu |
| 190 | PUR-21 Purchase inbox: a dedicated email address or connected mailbox receives distributor CSV / PDF bills, auto-creates draft purchases with item mapping, flags rate changes | Feature | Ashok, Jeeva |
| 191 | INV-09 Physical stock count / cycle count with variance posting | Feature | Meyyarivu |
| 192 | INV-13 Dead / slow-moving stock report | Feature | Meyyarivu |
| 193 | INV-15 Barcode label printing for loose/repacked items | Feature | Meyyarivu |
| 194 | INV-16 Stock aging: by inward date and by expiry bucket | Feature | Meyyarivu |
| 195 | INV-17 Stock reservation for confirmed orders and held bills (available = on hand − reserved) | Feature | Meyyarivu |
| 196 | INV-21 Dosage labels: print a medicine label with patient name, dose, frequency, timing and instructions from the bill line (verify) pharmacist review of wording | Feature | Meyyarivu |
| 197 | INV-22 Stock reallocation: suggests moving non-moving or short-expiry stock to branches with demand or to the warehouse; one click creates the transfer | Feature | Meyyarivu |
| 198 | IJX-01 Stock inward / outward vouchers (non-purchase receipts and issues, e.g. samples, free goods from company) | Feature | Meyyarivu |
| 199 | MKT-06 Multi-warehouse within a branch (godown, cold room, display) with location-level stock | Feature | Meyyarivu |
| 200 | MKT-08 Customisable keyboard shortcuts per user (`/me/shortcuts`): change any key from KEYBOARD_SHORTCUTS.md, conflict check, reset to default, synced to desktop | Feature | Meyyarivu |
| 201 | POS-08 UPI QR on screen / on bill (static VPA QR with amount) | Feature | Meyyarivu |
| 202 | POS-17 Repeat last bill for a customer (chronic refill) | Feature | Meyyarivu |
| 203 | POS-19 Estimate / quotation convertible to bill | Feature | Meyyarivu |
| 204 | POS-23 One-click generic conversion: switch every branded line on a bill to an in-stock generic with the same salts + strength (CAT-15); show patient saving and margin per line; pharmacist confirms each swap; extends CAT-09 / POS-16 (verify) substitution rules | Feature | Meyyarivu |
| 205 | POS-24 Counter recommendations: among same-composition alternatives, rank by near-expiry batch and margin (configurable weights, never above MRP) | Feature | Meyyarivu |
| 206 | POS-25 Invoice verification QR: unique QR on every printed invoice opening a read-only verification page (number, date, total, store); no patient data | Feature | Meyyarivu |
| 207 | POS-26 Service billing: non-stock service items (BP / sugar check, injection charge, consultation fee, delivery charge) with own SAC and GST, no stock movement (verify) SAC / GST rates | Feature | Meyyarivu |
| 208 | POS-29 Multi-firm billing: one counter billing under different firms (companies / GSTINs) of the same tenant; firm picked per bill or by item rule; separate series, books and stock (extends PLT-02) | Feature | Meyyarivu |
| 209 | RET-07 Replacement management: replace returned goods instead of credit note | Feature | Ashok |
| 210 | WHS-05 Delivery challan, dispatch, delivery tracking (packed, dispatched, delivered) | Feature | Meyyarivu |
| 211 | WHS-07 E-way bill generation for consignments above threshold (verify) | Feature | Meyyarivu |
| 212 | WHS-08 Retailer-wise / item-wise scheme overrides | Feature | Meyyarivu |
| 213 | WHS-09 Salesman assignment and commission report | Feature | Meyyarivu |
| 214 | WHS-13 Retailer claims: short supply, damage, rate difference; resolved by credit note | Feature | Meyyarivu |
| 215 | WHS-20 Packing slip, parcel and dispatch register: packing slip per case, parcel register, L.R. update after dispatch, delivery acknowledgement (POD) report | Feature | Meyyarivu |
| 216 | WHS-21 Collection tagging: assign outstanding bills to salesmen or collectors, print a collection sheet, record collections against it, assigned-vs-collected report | Feature | Meyyarivu |
| 217 | DOC-05 Document print designer (choose fields, logo, terms, copies) | Feature | Meyyarivu |
| 218 | CMP-08 Patient prescription history (consent-based, minimum data) | Feature | Ashok |
| 219 | CMP-14 Expired / damaged stock destruction record: batches, quantities, date, method, witnesses, linked to the write-off adjustment (verify) | Feature | Ashok |
| 220 | CAT-26 Bundles / kits: one sellable line made of component items, stock taken from components | Feature | Ashok |
| 221 | IJX-03 Batch category master (e.g. "cold chain", "high value") for reporting | Feature | Meyyarivu |
| 222 | POS-13 Cash drawer open, customer display (pole) | Feature | Meyyarivu |

## P6 · Pilot & GST returns (34)

| Step | Task | Type | With |
|---|---|---|---|
| 223 | GSTR-1/3B preparation, ITC register, GST reconciliation exports | Groundwork | — |
| 224 | Performance fixes from pilot; bug SLA | Groundwork | — |
| 225 | GST-03 GSTR-1 data export (B2B, B2C large/small, CDNR, HSN summary) in portal JSON/Excel format | Feature | Gokul |
| 226 | GST-04 GSTR-3B summary | Feature | Gokul |
| 227 | GST-10 Input tax credit register from purchases | Feature | Gokul |
| 228 | PTY-09 Patient refill reminders (chronic medicines) via WhatsApp/SMS | Feature | Ashok |
| 229 | PTY-28 Agent master and party agent/salesman with commission %; commission report | Feature | Ashok |
| 230 | PUR-16 PDF / scanned purchase bill import: read lines from a distributor PDF or photo into a draft purchase that is reviewed before posting (brings MKT-09 forward for purchases) | Feature | Meyyarivu |
| 231 | PUR-17 Optimal stock levels: min / max per item and branch computed from sales velocity, lead time and expiry risk; request fulfilment rate (short-book hits vs misses) | Feature | Meyyarivu |
| 232 | MKT-03 Retailer → distributor online ordering (ERP-to-ERP): a retailer on MENO sends a PO that arrives as a sales order at a distributor on MENO, with live stock, rates and schemes; item codes, HSN and GST mapped automatically | Feature | Meyyarivu |
| 233 | MKT-10 Consolidated multi-branch dashboard for chains | Feature | Meyyarivu |
| 234 | WHS-11 Routes and beats (web): retailers per route, visit days | Feature | Meyyarivu |
| 235 | WHS-12 Delivery planning: schedule dispatches by route/vehicle, pick lists per trip | Feature | Meyyarivu |
| 236 | WHS-14 Scheme claims: reconcile schemes given to retailers with manufacturer claims | Feature | Meyyarivu |
| 237 | WHS-18 Sub-stockist accounting: sub-stockist party type, stock sent on sub-stockist terms, their secondary sales and claims, settlement | Feature | Meyyarivu |
| 238 | WHS-22 Sales targets and incentives: targets by salesman, area, company or product for a period; achievement tracking; incentive slabs; leaderboard | Feature | Meyyarivu |
| 239 | DOC-03 Commission vouchers for salesmen / agents (sales and purchase side) | Feature | Meyyarivu |
| 240 | CMP-02 Schedule X / narcotic register with stricter controls (duplicate Rx retention) | Feature | Ashok |
| 241 | CMP-10 Controlled stock register: restricted items inward/outward with running balance (verify) | Feature | Ashok |
| 242 | CMP-11 Regulatory audit: compliance activity log and inspection pack export (verify) | Feature | Ashok |
| 243 | CMP-13 Patient safety warnings at POS: allergy match with the patient profile, duplicate-therapy and interaction alerts from the drug reference; pharmacist acknowledges and it is logged (verify) pharmacist review | Feature | Ashok |
| 244 | GST-05 GSTR-2B reconciliation with purchases (import 2B JSON) | Feature | Gokul |
| 245 | GST-07 Composition-scheme dealer support (bill of supply) (verify) | Feature | Gokul |
| 246 | GST-12 Reverse charge (RCM) on applicable inward supplies (e.g. some services) with self-invoice and liability posting (verify) | Feature | Gokul |
| 247 | GST-13 GSTR-9 annual summary data from posted documents (verify) | Feature | Gokul |
| 248 | GST-14 Invoice Management System (IMS) workflow on inward invoices (accept / reject / pending) feeding GSTR-2B matching (verify) current GSTN process | Feature | Gokul |
| 249 | CAT-13 Item images | Feature | Ashok |
| 250 | CAT-21 Drug reference panel on the medicine detail page and POS item info (`F1`): indications, dosage, boxed warning, warnings, contraindications, interactions, pregnancy, storage, looked up by salt with an Indian (INN) → US name map held in a configuration table (paracetamol → acetaminophen); shows the FDA disclaimer, attribution and "US label, the Indian label may differ" (verify) pharmacist review | Feature | Ashok |
| 251 | PTY-08 Customer loyalty points / membership discount | Feature | Ashok |
| 252 | PUR-10 Scan supplier invoice (image/PDF) attach to purchase; OCR later | Feature | Meyyarivu |
| 253 | INV-14 Cold-chain items flag and storage reports | Feature | Meyyarivu |
| 254 | IJX-02 Stock journal (convert/repack: e.g. bulk into loose packs) | Feature | Meyyarivu |
| 255 | MKT-07 Expiry-based promotions (auto-suggested discount on near-expiry batches) | Feature | Meyyarivu |
| 256 | POS-18 Home delivery orders with delivery status | Feature | Meyyarivu |

## P7 · Growth (5)

| Step | Task | Type | With |
|---|---|---|---|
| 257 | Retailer → distributor ordering API between tenants | Groundwork | — |
| 258 | PUR-18 Distributor marketplace: compare rates, schemes and stock across connected distributors and place POs from one screen (extends MKT-03 beyond MENO-to-MENO) (verify) partner agreements | Feature | Meyyarivu |
| 259 | MKT-09 AI-assisted item onboarding: create items and a draft purchase from a photo or PDF of a supplier bill | Feature | Meyyarivu |
| 260 | WHS-10 Retailer self-ordering portal (web) | Feature | Meyyarivu |
| 261 | GST-08 TCS/TDS fields where applicable (verify) | Feature | Gokul |
