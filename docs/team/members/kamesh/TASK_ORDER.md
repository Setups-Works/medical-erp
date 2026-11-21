# Kamesh — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**187 tasks** · P0: 3 · P1: 4 · P2: 19 · P3: 38 · P4: 45 · P5: 50 · P6: 24 · P7: 4

## P0 · Foundation (3)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | ✅ Learn: Spring Boot 4 basics, Spring Data JPA, Flyway, Testcontainers, Spring Modulith (links in `docs/team/ONBOARDING.md`) | Groundwork | — |
| 2 | ✅ ER diagram v1 for catalog, party, purchase, inventory, sales (`docs/database/DATA_MODEL.md`) | Groundwork | — |
| 3 | ✅ Walk through module template with Nitheesh | Groundwork | — |

## P1 · Platform core (4)

| Step | Task | Type | With |
|---|---|---|---|
| 4 | Help Nitheesh with `identity` and audit; write the permission seed migration for your modules | Groundwork | — |
| 5 | Validation layer for your modules: Bean Validation DTOs + domain invariants + DB constraints (VALIDATION_AND_BUSINESS_RULES.md) | Groundwork | — |
| 6 | Cross-tenant tests for every endpoint you add | Groundwork | — |
| 7 | Cross-tenant test base class in place and used by every endpoint test | Readiness | Nitheesh |

## P2 · Masters (19)

| Step | Task | Type | With |
|---|---|---|---|
| 8 | `catalog`: items, generic/salt, brands, manufacturers, HSN, units + conversion, barcodes, categories | Groundwork | — |
| 9 | `party`: suppliers, customers, retailers, doctors, opening balances, customer groups | Groundwork | — |
| 10 | Item search endpoint (trigram index, < 150 ms) | Groundwork | — |
| 11 | CAT-01 Item master: name, brand, generic name, manufacturer, marketed by, composition (salts + strength), dosage form, pack (e.g. 1×10 strip), units (pack/loose) | Feature | Ashok |
| 12 | CAT-02 HSN code + GST rate, cess, tax-inclusive flag | Feature | Ashok |
| 13 | CAT-03 Schedule classification (H, H1, X, G, OTC, Narcotic/NDPS) and prescription-required flag | Feature | Ashok |
| 14 | CAT-04 Barcodes (multiple per item, EAN/GS1, internal barcode generation) | Feature | Ashok |
| 15 | CAT-14 Non-pharma items (FMCG, surgical, cosmetics) with their own GST | Feature | Ashok |
| 16 | CAT-15 Generic / salt master: salt name, strength, unit; normalised so the same composition is never stored twice | Feature | Ashok |
| 17 | CAT-16 Brand and manufacturer masters (marketer vs manufacturer, contact, GSTIN) | Feature | Ashok |
| 18 | CAT-17 Unit master + multi-level unit conversion (box → strip → tablet) used by purchase, stock and POS | Feature | Ashok |
| 19 | CAT-20 Storage instructions and medicine detail page (complete profile: stock by branch, batches, substitutes, history) | Feature | Ashok |
| 20 | PTY-01 Supplier master: GSTIN (validated format + state), drug licence nos., contact, bank, credit days | Feature | Ashok |
| 21 | PTY-02 Customer master (retail): name, phone, address, age/gender (optional), allergies note | Feature | Ashok |
| 22 | PTY-03 Retailer master (wholesale): GSTIN, DL nos. + expiry, credit limit, credit days, price list, route, salesman | Feature | Ashok |
| 23 | DOC-04 Masters for transporters, terms & conditions, narrations, modes of payment, salesman/agent | Feature | Meyyarivu |
| 24 | GST-09 GST configuration: registrations per company, rate master, reverse-charge and composition settings (data, never hard-coded) | Feature | Meyyarivu |
| 25 | CAT-06 Categories, therapeutic class, storage condition (cold-chain 2–8 °C, below 25 °C) | Feature | Ashok |
| 26 | Synthetic seed data for staging (items, parties, batches) that never uses real customer data | Readiness | — |

## P3 · Purchase & inventory (38)

| Step | Task | Type | With |
|---|---|---|---|
| 27 | `taxation` GstCalculator & `pricing` engine passing test vectors (pair with Nitheesh) | Groundwork | — |
| 28 | `inventory`: batch, movement ledger, stock_balance, adjustments, nightly reconciliation job | Groundwork | — |
| 29 | `purchase`: PO, GRN, verification, invoice entry, posting, reversal, duplicate detection, import pipeline | Groundwork | — |
| 30 | CAT-08 Min / max / reorder level per branch | Feature | Ashok |
| 31 | PTY-10 Party opening balances | Feature | Ashok |
| 32 | PRC-01 Batch-wise MRP, PTR, PTS, purchase rate, selling rate | Feature | Meyyarivu |
| 33 | PRC-04 Free-quantity schemes (10+1, 20+3) on purchase and sale | Feature | Meyyarivu |
| 34 | PRC-05 Scheme discount %, trade discount, cash discount (verify) order of application | Feature | Meyyarivu |
| 35 | PUR-01 Purchase order (manual or from reorder suggestions), email/WhatsApp PO to supplier | Feature | Meyyarivu |
| 36 | PUR-02 Purchase invoice entry: supplier inv no/date, lines with batch, expiry, MRP, PTR, qty, free qty, discounts, GST | Feature | Meyyarivu |
| 37 | PUR-04 Distributor CSV / Excel purchase import with item mapping memory (supplier item code → our item) | Feature | Meyyarivu |
| 38 | PUR-05 Duplicate supplier invoice detection | Feature | Meyyarivu |
| 39 | PUR-07 Purchase posting → batches, stock movements, supplier ledger | Feature | Meyyarivu |
| 40 | PUR-08 Purchase cancellation via reversal (no edit after post) | Feature | Meyyarivu |
| 41 | PUR-13 PO tracking: pending, partially received, closed; pending purchases list | Feature | Meyyarivu |
| 42 | INV-01 Batch-wise stock (batch no, mfg date, expiry, MRP, cost) per branch | Feature | Meyyarivu |
| 43 | INV-02 Movement ledger for every change (purchase, sale, returns, transfer, adjustment, count) | Feature | Meyyarivu |
| 44 | INV-05 Near-expiry dashboard (30/60/90 days) with actions: return to supplier, discount, transfer | Feature | Meyyarivu |
| 45 | INV-06 Low stock / out of stock alerts | Feature | Meyyarivu |
| 46 | INV-07 Stock adjustment with reason codes (damage, theft, sample, correction) and approval | Feature | Meyyarivu |
| 47 | INV-10 Stock valuation (FIFO / weighted average, incl. free goods) | Feature | Meyyarivu |
| 48 | INV-11 Opening stock import | Feature | Meyyarivu |
| 49 | INV-12 Nightly reconciliation of balances vs ledger, alerts on drift | Feature | Meyyarivu |
| 50 | MKT-01 Short book / shortage list: items marked at the counter when out of stock or low; one click turns it into a PO per supplier | Feature | Meyyarivu |
| 51 | DOC-02 Full purchase cycle: Purchase order → Purchase challan (goods without bill) → Purchase bill → Return → Debit note | Feature | Meyyarivu |
| 52 | GST-01 Intra/inter-state determination, CGST/SGST/IGST, cess | Feature | Meyyarivu |
| 53 | GST-11 Invoice GST validation before posting (GSTIN format/state, place of supply, HSN, rate, totals) | Feature | Meyyarivu |
| 54 | CAT-07 Rack / shelf / bin location per branch | Feature | Ashok |
| 55 | CAT-10 Global medicine database seed (common Indian brands) to speed up item creation (verify) licensing of data source | Feature | Ashok |
| 56 | CAT-11 Item merge (duplicate cleanup) with history preserved | Feature | Ashok |
| 57 | CAT-18 Medicine export (Excel/CSV) with the same columns as import | Feature | Ashok |
| 58 | CAT-19 Medicine history: price changes, purchases, sales, adjustments for one item | Feature | Ashok |
| 59 | PTY-11 Supplier price list: agreed / last rates per supplier and item, shown during purchase | Feature | Ashok |
| 60 | PRC-09 Price change history | Feature | Meyyarivu |
| 61 | PUR-03 Goods receipt (GRN) with short/excess/damaged quantities | Feature | Meyyarivu |
| 62 | PUR-12 Purchase dashboard: open POs, pending GRNs, payables due, price changes | Feature | Meyyarivu |
| 63 | PUR-14 Purchase verification: match supplier bill against PO and GRN (qty, batch, rate) before posting | Feature | Meyyarivu |
| 64 | Nightly stock reconciliation job with alert on drift | Readiness | — |

## P4 · Retail POS & returns (45)

| Step | Task | Type | With |
|---|---|---|---|
| 65 | `sales`: retail invoice posting, FEFO with authorised override, `SELECT … FOR UPDATE` batch locking, idempotency | Groundwork | — |
| 66 | Held bills, discount approval, invoice list/reprint | Groundwork | — |
| 67 | `returns`: sales return with inspection, purchase return, expiry/breakage claims, credit/debit notes | Groundwork | — |
| 68 | `compliance`: prescriptions, Schedule H1 register, restricted-medicine guard | Groundwork | — |
| 69 | CAT-05 Loose / strip sale: sell by tablet with conversion factor, loose MRP | Feature | Ashok |
| 70 | PRC-06 Item/category/party-wise discount rules, max discount per role | Feature | Meyyarivu |
| 71 | PRC-07 Bill-level discount and round-off | Feature | Meyyarivu |
| 72 | PRC-08 Never sell above MRP (hard rule) | Feature | Meyyarivu |
| 73 | INV-03 FEFO batch suggestion (first expiry first out) at sale | Feature | Meyyarivu |
| 74 | INV-04 Expiry block: cannot sell expired; warn within N days (setting) | Feature | Meyyarivu |
| 75 | INV-18 FEFO override with an authorised reason (recorded in the movement and audit log) | Feature | Meyyarivu |
| 76 | MKT-02 Salt-wise / composition-wise search with all brands and stock shown side by side | Feature | Meyyarivu |
| 77 | MKT-05 Party-wise last rate and last discount shown while billing and purchasing | Feature | Meyyarivu |
| 78 | POS-01 Keyboard-first billing screen (F-keys, no mouse needed), barcode-first | Feature | Meyyarivu |
| 79 | POS-02 Fast search by name / generic / composition / barcode, fuzzy, < 150 ms | Feature | Meyyarivu |
| 80 | POS-03 Batch picker with FEFO default, expiry and stock shown | Feature | Meyyarivu |
| 81 | POS-04 Loose quantity sale (tablets from strip) | Feature | Meyyarivu |
| 82 | POS-05 Customer + doctor selection, quick add customer by phone | Feature | Meyyarivu |
| 83 | POS-06 Prescription capture for Schedule H/H1/X (doctor, Rx no., image upload/scan) — blocks sale until captured | Feature | Meyyarivu |
| 84 | POS-07 Multiple payment modes in one bill (cash, UPI, card, credit, wallet), change calculation | Feature | Meyyarivu |
| 85 | POS-09 Hold / recall bills, multiple open bills | Feature | Meyyarivu |
| 86 | POS-10 Thermal (2"/3") and A4/A5 invoice printing, configurable templates | Feature | Meyyarivu |
| 87 | POS-12 Sales return / exchange from POS against invoice | Feature | Meyyarivu |
| 88 | POS-20 Invoice list and details: search, filter, reprint, share, cancel through credit note | Feature | Meyyarivu |
| 89 | POS-21 Discount approval at the counter: manager PIN override above the role limit, logged | Feature | Meyyarivu |
| 90 | POS-22 Search by manufacturer and by salt in POS search (in addition to name/barcode) | Feature | Meyyarivu |
| 91 | RET-01 Sales return against invoice (batch-aware), stock back only if saleable | Feature | Ashok |
| 92 | RET-02 Credit note (refund, adjust against outstanding, or future bills) | Feature | Ashok |
| 93 | RET-03 Purchase return to supplier with debit note | Feature | Ashok |
| 94 | RET-04 Expiry return / breakage claim to supplier (batch list, claim tracking until credit note received) | Feature | Ashok |
| 95 | RET-08 Return inspection: decide saleable / damaged / expired per line before stock re-entry | Feature | Ashok |
| 96 | CMP-01 Schedule H1 register (auto from sales: patient, doctor, item, qty, date) — printable/exportable | Feature | Ashok |
| 97 | CMP-03 Prescription storage (image), linked to invoice, retention policy | Feature | Ashok |
| 98 | CMP-05 Drug licence numbers printed on invoices; licence expiry alerts for own branches | Feature | Ashok |
| 99 | CMP-09 Restricted-medicine alerts at billing: schedule warnings and required steps | Feature | Ashok |
| 100 | GST-02 HSN summary on invoices and reports | Feature | Meyyarivu |
| 101 | CAT-09 Generic substitutes (same composition + strength) shown at POS when out of stock | Feature | Ashok |
| 102 | CAT-12 Banned / recalled drug list with blocking at sale and purchase (verify) CDSCO list maintenance | Feature | Ashok |
| 103 | PTY-05 Doctor master (name, registration no., clinic) for prescriptions and doctor-wise reports | Feature | Ashok |
| 104 | MKT-04 Dump / broken / damaged stock bucket, kept separate from saleable stock, feeding expiry and breakage claims | Feature | Meyyarivu |
| 105 | POS-11 WhatsApp / SMS invoice share (PDF link) | Feature | Meyyarivu |
| 106 | POS-16 Substitute suggestion when item out of stock | Feature | Meyyarivu |
| 107 | RET-06 Return reasons & approval limits | Feature | Ashok |
| 108 | CMP-04 Pharmacist on duty recorded on each bill (registration no.) | Feature | Ashok |
| 109 | CMP-06 Banned/recalled drug block (see CAT-12) | Feature | Ashok |

## P5 · Wholesale, finance, offline (50)

| Step | Task | Type | With |
|---|---|---|---|
| 110 | Wholesale orders → pick → invoice, price lists, schemes, credit control, reservations | Groundwork | — |
| 111 | e-invoice / e-way bill via the GSP adapter (`integrations/gst`) | Groundwork | — |
| 112 | Stock transfers, stock count, stock aging | Groundwork | — |
| 113 | Server-side validation used by `sync` push (with Nitheesh) | Groundwork | — |
| 114 | PTY-06 Party ledger, outstanding, ageing | Feature | Ashok |
| 115 | PTY-07 Credit limit & credit days enforcement with override approval | Feature | Ashok |
| 116 | PTY-13 Customer and supplier account statements (date range, PDF, email/WhatsApp) | Feature | Ashok |
| 117 | PRC-02 Price lists / rate levels (A/B/C retailers, institutions, hospitals) | Feature | Meyyarivu |
| 118 | PUR-11 Reorder suggestions (min/max, sales velocity, lead time) | Feature | Meyyarivu |
| 119 | INV-08 Branch-to-branch stock transfer (dispatch → in transit → receive) with GST delivery challan / inter-state invoice (verify) | Feature | Meyyarivu |
| 120 | POS-14 Shift open/close, cash denomination count, day-end report per counter | Feature | Meyyarivu |
| 121 | POS-15 Offline billing on desktop with sync (see OFFLINE_SYNC.md) | Feature | Meyyarivu |
| 122 | RET-05 Wholesale: accept expiry/breakage returns from retailers per policy | Feature | Ashok |
| 123 | WHS-01 Sales order entry (phone/WhatsApp orders) with price list, schemes, credit check | Feature | Meyyarivu |
| 124 | WHS-02 Order → pick list → invoice (partial fulfilment, backorders) | Feature | Meyyarivu |
| 125 | WHS-03 Bulk GST tax invoice (A4), with DL nos. of both parties printed | Feature | Meyyarivu |
| 126 | WHS-04 Credit sales with due dates, credit limit enforcement | Feature | Meyyarivu |
| 127 | WHS-06 E-invoice (IRN + QR) generation via IRP/GSP (verify) turnover threshold | Feature | Meyyarivu |
| 128 | DOC-01 Full sales cycle: Quotation → Sales order → Delivery challan → Invoice → Return → Credit note (convert any step to the next, partial conversion supported) | Feature | Meyyarivu |
| 129 | CMP-07 Data privacy: patient data minimisation, consent, deletion requests (DPDP Act) | Feature | Ashok |
| 130 | GST-06 E-invoice and e-way bill (see WHS-06/07) | Feature | Meyyarivu |
| 131 | PTY-04 Drug licence expiry tracking & block sale to retailers with expired licence | Feature | Ashok |
| 132 | PTY-12 Customer groups (individual, retailer, hospital, institution) with default price list, discount and credit terms | Feature | Ashok |
| 133 | PRC-03 Margin-based selling price rules (e.g. PTR = MRP − 20 %) | Feature | Meyyarivu |
| 134 | PRC-10 Value-based schemes (spend ₹X, get Y % or free goods) | Feature | Meyyarivu |
| 135 | PRC-11 Company-wise (manufacturer-wise) discount rules for wholesale | Feature | Meyyarivu |
| 136 | PUR-06 Landed cost (freight, other charges) allocation | Feature | Meyyarivu |
| 137 | PUR-09 Rate difference / price change alerts vs last purchase | Feature | Meyyarivu |
| 138 | PUR-15 Supplier price comparison for an item across suppliers and time | Feature | Meyyarivu |
| 139 | INV-09 Physical stock count / cycle count with variance posting | Feature | Meyyarivu |
| 140 | INV-13 Dead / slow-moving stock report | Feature | Meyyarivu |
| 141 | INV-15 Barcode label printing for loose/repacked items | Feature | Meyyarivu |
| 142 | INV-16 Stock aging: by inward date and by expiry bucket | Feature | Meyyarivu |
| 143 | INV-17 Stock reservation for confirmed orders and held bills (available = on hand − reserved) | Feature | Meyyarivu |
| 144 | IJX-01 Stock inward / outward vouchers (non-purchase receipts and issues, e.g. samples, free goods from company) | Feature | Meyyarivu |
| 145 | MKT-06 Multi-warehouse within a branch (godown, cold room, display) with location-level stock | Feature | Meyyarivu |
| 146 | MKT-08 Customisable keyboard shortcuts per user (`/me/shortcuts`): change any key from KEYBOARD_SHORTCUTS.md, conflict check, reset to default, synced to desktop | Feature | Meyyarivu |
| 147 | POS-08 UPI QR on screen / on bill (static VPA QR with amount) | Feature | Meyyarivu |
| 148 | POS-17 Repeat last bill for a customer (chronic refill) | Feature | Meyyarivu |
| 149 | POS-19 Estimate / quotation convertible to bill | Feature | Meyyarivu |
| 150 | RET-07 Replacement management: replace returned goods instead of credit note | Feature | Ashok |
| 151 | WHS-05 Delivery challan, dispatch, delivery tracking (packed, dispatched, delivered) | Feature | Meyyarivu |
| 152 | WHS-07 E-way bill generation for consignments above threshold (verify) | Feature | Meyyarivu |
| 153 | WHS-08 Retailer-wise / item-wise scheme overrides | Feature | Meyyarivu |
| 154 | WHS-09 Salesman assignment and commission report | Feature | Meyyarivu |
| 155 | WHS-13 Retailer claims: short supply, damage, rate difference; resolved by credit note | Feature | Meyyarivu |
| 156 | DOC-05 Document print designer (choose fields, logo, terms, copies) | Feature | Meyyarivu |
| 157 | CMP-08 Patient prescription history (consent-based, minimum data) | Feature | Ashok |
| 158 | IJX-03 Batch category master (e.g. "cold chain", "high value") for reporting | Feature | Meyyarivu |
| 159 | POS-13 Cash drawer open, customer display (pole) | Feature | Meyyarivu |

## P6 · Pilot & GST returns (24)

| Step | Task | Type | With |
|---|---|---|---|
| 160 | GSTR-1/3B preparation, ITC register, GST reconciliation exports | Groundwork | — |
| 161 | Performance fixes from pilot; bug SLA | Groundwork | — |
| 162 | GST-03 GSTR-1 data export (B2B, B2C large/small, CDNR, HSN summary) in portal JSON/Excel format | Feature | Meyyarivu |
| 163 | GST-04 GSTR-3B summary | Feature | Meyyarivu |
| 164 | GST-10 Input tax credit register from purchases | Feature | Meyyarivu |
| 165 | PTY-09 Patient refill reminders (chronic medicines) via WhatsApp/SMS | Feature | Ashok |
| 166 | MKT-03 Retailer → distributor online ordering (ERP-to-ERP): a retailer on MENO sends a PO that arrives as a sales order at a distributor on MENO, with live stock, rates and schemes; item codes, HSN and GST mapped automatically | Feature | Meyyarivu |
| 167 | MKT-10 Consolidated multi-branch dashboard for chains | Feature | Meyyarivu |
| 168 | WHS-11 Routes and beats (web): retailers per route, visit days | Feature | Meyyarivu |
| 169 | WHS-12 Delivery planning: schedule dispatches by route/vehicle, pick lists per trip | Feature | Meyyarivu |
| 170 | WHS-14 Scheme claims: reconcile schemes given to retailers with manufacturer claims | Feature | Meyyarivu |
| 171 | DOC-03 Commission vouchers for salesmen / agents (sales and purchase side) | Feature | Meyyarivu |
| 172 | CMP-02 Schedule X / narcotic register with stricter controls (duplicate Rx retention) | Feature | Ashok |
| 173 | CMP-10 Controlled stock register: restricted items inward/outward with running balance (verify) | Feature | Ashok |
| 174 | CMP-11 Regulatory audit: compliance activity log and inspection pack export (verify) | Feature | Ashok |
| 175 | GST-05 GSTR-2B reconciliation with purchases (import 2B JSON) | Feature | Meyyarivu |
| 176 | GST-07 Composition-scheme dealer support (bill of supply) (verify) | Feature | Meyyarivu |
| 177 | CAT-13 Item images | Feature | Ashok |
| 178 | PTY-08 Customer loyalty points / membership discount | Feature | Ashok |
| 179 | PUR-10 Scan supplier invoice (image/PDF) attach to purchase; OCR later | Feature | Meyyarivu |
| 180 | INV-14 Cold-chain items flag and storage reports | Feature | Meyyarivu |
| 181 | IJX-02 Stock journal (convert/repack: e.g. bulk into loose packs) | Feature | Meyyarivu |
| 182 | MKT-07 Expiry-based promotions (auto-suggested discount on near-expiry batches) | Feature | Meyyarivu |
| 183 | POS-18 Home delivery orders with delivery status | Feature | Meyyarivu |

## P7 · Growth (4)

| Step | Task | Type | With |
|---|---|---|---|
| 184 | Retailer → distributor ordering API between tenants | Groundwork | — |
| 185 | MKT-09 AI-assisted item onboarding: create items and a draft purchase from a photo or PDF of a supplier bill | Feature | Meyyarivu |
| 186 | WHS-10 Retailer self-ordering portal (web) | Feature | Meyyarivu |
| 187 | GST-08 TCS/TDS fields where applicable (verify) | Feature | Meyyarivu |
