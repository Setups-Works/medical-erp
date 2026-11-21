# Ashok — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**186 tasks** · P0: 5 · P1: 9 · P2: 21 · P3: 29 · P4: 45 · P5: 42 · P6: 24 · P7: 11

## P0 · Foundation (5)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | Review `docs/testing/TEST_STRATEGY.md`; adapt to our tools | Groundwork | — |
| 2 | Test-case template, defect template, sprint test report template | Groundwork | — |
| 3 | 40 test vectors JSON with Prakalya (GST, MRP-inclusive, discounts, free qty, rounding) | Groundwork | — |
| 4 | Learn: Playwright, REST testing (Bruno/Postman), JUnit basics, SQL for verification | Groundwork | — |
| 5 | Learn the frontend stack (Next.js, TanStack Query, RHF + Zod, shadcn/ui); pair sessions with Meyyarivu | Groundwork | — |

## P1 · Platform core (9)

| Step | Task | Type | With |
|---|---|---|---|
| 6 | Playwright setup in `apps/web/tests/e2e`, CI job with Jeeva | Groundwork | — |
| 7 | Auth, roles, tenant isolation test cases; API collection v1 | Groundwork | — |
| 8 | Test vector runner contract (JSON schema) for Java + TS | Groundwork | — |
| 9 | First screen on Meyyarivu's patterns: report filter bar + ReportPage skeleton (web `reports/`) | Groundwork | — |
| 10 | Defect workflow live (labels, severity S1–S4, triage every morning) | Readiness | — |
| 11 | Critical scenario #9: User of tenant A gets 404 for every tenant B resource | Critical scenario | — |
| 12 | QA: Platform & administration · P1 (4 features) | QA | — |
| 13 | QA: Authentication & onboarding · P1 (1 feature) | QA | — |
| 14 | QA: Navigation & command search · P1 (1 feature) | QA | — |

## P2 · Masters (21)

| Step | Task | Type | With |
|---|---|---|---|
| 15 | Medicine master screens: list, add/edit, details, generic/salt, brand, manufacturer, units + conversion, barcodes (web `catalog/`) | Groundwork | — |
| 16 | Suppliers, customers, doctors: list, add/edit, details (web `parties/`) | Groundwork | — |
| 17 | Masters test cases + E2E for item/party CRUD (screens you didn't build: Prakalya runs QA on yours) | Groundwork | — |
| 18 | Validation test suite from VALIDATION_AND_BUSINESS_RULES.md (every rule: valid, invalid, boundary), audit log checks | Groundwork | — |
| 19 | CAT-01 Item master: name, brand, generic name, manufacturer, marketed by, composition (salts + strength), dosage form, pack (e.g. 1×10 strip), units (pack/loose) | Feature | Kamesh |
| 20 | CAT-02 HSN code + GST rate, cess, tax-inclusive flag | Feature | Kamesh |
| 21 | CAT-03 Schedule classification (H, H1, X, G, OTC, Narcotic/NDPS) and prescription-required flag | Feature | Kamesh |
| 22 | CAT-04 Barcodes (multiple per item, EAN/GS1, internal barcode generation) | Feature | Kamesh |
| 23 | CAT-14 Non-pharma items (FMCG, surgical, cosmetics) with their own GST | Feature | Kamesh |
| 24 | CAT-15 Generic / salt master: salt name, strength, unit; normalised so the same composition is never stored twice | Feature | Kamesh |
| 25 | CAT-16 Brand and manufacturer masters (marketer vs manufacturer, contact, GSTIN) | Feature | Kamesh |
| 26 | CAT-17 Unit master + multi-level unit conversion (box → strip → tablet) used by purchase, stock and POS | Feature | Kamesh |
| 27 | CAT-20 Storage instructions and medicine detail page (complete profile: stock by branch, batches, substitutes, history) | Feature | Kamesh |
| 28 | PTY-01 Supplier master: GSTIN (validated format + state), drug licence nos., contact, bank, credit days | Feature | Kamesh |
| 29 | PTY-02 Customer master (retail): name, phone, address, age/gender (optional), allergies note | Feature | Kamesh |
| 30 | PTY-03 Retailer master (wholesale): GSTIN, DL nos. + expiry, credit limit, credit days, price list, route, salesman | Feature | Kamesh |
| 31 | CAT-06 Categories, therapeutic class, storage condition (cold-chain 2–8 °C, below 25 °C) | Feature | Kamesh |
| 32 | QA: Platform & administration · P2 (5 features) | QA | — |
| 33 | QA: Authentication & onboarding · P2 (2 features) | QA | — |
| 34 | QA: Sales & purchase document cycle · P2 (1 feature) | QA | — |
| 35 | QA: GST & statutory · P2 (1 feature) | QA | — |

## P3 · Purchase & inventory (29)

| Step | Task | Type | With |
|---|---|---|---|
| 36 | Critical scenarios 1, 2, 3, 5 automated (backend scenario tests) | Groundwork | — |
| 37 | Stock reconciliation verification queries | Groundwork | — |
| 38 | CSV import negative tests (bad rows, duplicates, unknown items) | Groundwork | — |
| 39 | Medicine export, medicine history and supplier price list screens | Groundwork | — |
| 40 | Reports centre screens: stock, batch, expiry, purchase reports with export (web `reports/`) | Groundwork | — |
| 41 | CAT-08 Min / max / reorder level per branch | Feature | Kamesh |
| 42 | PTY-10 Party opening balances | Feature | Kamesh |
| 43 | RPT-03 Purchase register (supplier-wise, item-wise) | Feature | Nitheesh |
| 44 | RPT-04 Stock reports: current stock, batch-wise, valuation, movement history of an item | Feature | Nitheesh |
| 45 | RPT-05 Expiry report, expired stock, near-expiry by supplier (for returns) | Feature | Nitheesh |
| 46 | RPT-16 Report framework standard: every report has date range, filters, server pagination, export and permission control | Feature | Nitheesh |
| 47 | CAT-07 Rack / shelf / bin location per branch | Feature | Kamesh |
| 48 | CAT-10 Global medicine database seed (common Indian brands) to speed up item creation (verify) licensing of data source | Feature | Kamesh |
| 49 | CAT-11 Item merge (duplicate cleanup) with history preserved | Feature | Kamesh |
| 50 | CAT-18 Medicine export (Excel/CSV) with the same columns as import | Feature | Kamesh |
| 51 | CAT-19 Medicine history: price changes, purchases, sales, adjustments for one item | Feature | Kamesh |
| 52 | PTY-11 Supplier price list: agreed / last rates per supplier and item, shown during purchase | Feature | Kamesh |
| 53 | Calculation parity CI job: Java and TypeScript must pass every test vector | Readiness | Nitheesh |
| 54 | Critical scenario #1: Purchase invoice (incl. free qty, discounts) creates correct batch stock and landed cost | Critical scenario | — |
| 55 | Critical scenario #5: Purchase return updates stock and supplier balance | Critical scenario | — |
| 56 | Critical scenario #7: GST correct: intra/inter-state, MRP-inclusive, rounding — all vectors pass | Critical scenario | — |
| 57 | QA: Platform & administration · P3 (1 feature) | QA | — |
| 58 | QA: Pricing, schemes, discounts · P3 (4 features) | QA | — |
| 59 | QA: Purchase · P3 (10 features) | QA | — |
| 60 | QA: Inventory · P3 (8 features) | QA | — |
| 61 | QA: Pharmacy operations (short book, ordering, warehouses) · P3 (1 feature) | QA | — |
| 62 | QA: Sales & purchase document cycle · P3 (1 feature) | QA | — |
| 63 | QA: GST & statutory · P3 (2 features) | QA | — |
| 64 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P3 (1 feature) | QA | — |

## P4 · Retail POS & returns (45)

| Step | Task | Type | With |
|---|---|---|---|
| 65 | Scenario 6 (concurrent billing, no oversell) — parallel API test | Groundwork | — |
| 66 | Scenario 11 (duplicate requests → one invoice) | Groundwork | — |
| 67 | POS E2E: keyboard-only billing, H1 capture, returns, printing | Groundwork | — |
| 68 | Performance baseline (k6): item search, invoice post | Groundwork | — |
| 69 | Returns screens: sales/purchase return, inspection, credit/debit notes (web `returns/`) | Groundwork | — |
| 70 | Compliance screens: Schedule H/H1/X registers, prescription register, narcotic stock (web `compliance/`) | Groundwork | — |
| 71 | CAT-05 Loose / strip sale: sell by tablet with conversion factor, loose MRP | Feature | Kamesh |
| 72 | RET-01 Sales return against invoice (batch-aware), stock back only if saleable | Feature | Kamesh |
| 73 | RET-02 Credit note (refund, adjust against outstanding, or future bills) | Feature | Kamesh |
| 74 | RET-03 Purchase return to supplier with debit note | Feature | Kamesh |
| 75 | RET-04 Expiry return / breakage claim to supplier (batch list, claim tracking until credit note received) | Feature | Kamesh |
| 76 | RET-08 Return inspection: decide saleable / damaged / expired per line before stock re-entry | Feature | Kamesh |
| 77 | CMP-01 Schedule H1 register (auto from sales: patient, doctor, item, qty, date) — printable/exportable | Feature | Kamesh |
| 78 | CMP-03 Prescription storage (image), linked to invoice, retention policy | Feature | Kamesh |
| 79 | CMP-05 Drug licence numbers printed on invoices; licence expiry alerts for own branches | Feature | Kamesh |
| 80 | CMP-09 Restricted-medicine alerts at billing: schedule warnings and required steps | Feature | Kamesh |
| 81 | RPT-01 Owner dashboard: today's sales, collections, purchases, margin, low stock, near expiry, outstanding | Feature | Nitheesh |
| 82 | RPT-02 Sales register (day/month, bill-wise, item-wise, customer-wise, doctor-wise, user-wise, branch-wise) | Feature | Nitheesh |
| 83 | RPT-09 Schedule H1 / narcotic registers | Feature | Nitheesh |
| 84 | RPT-13 Reports centre: catalogue, favourites, saved filters, recent | Feature | Nitheesh |
| 85 | RPT-14 Batch-wise sales and traceability: who received batch X (recalls) | Feature | Nitheesh |
| 86 | ANX-06 POS register (counter/shift-wise), sales & sales-return registers, compliance register | Feature | Nitheesh |
| 87 | CAT-09 Generic substitutes (same composition + strength) shown at POS when out of stock | Feature | Kamesh |
| 88 | CAT-12 Banned / recalled drug list with blocking at sale and purchase (verify) CDSCO list maintenance | Feature | Kamesh |
| 89 | PTY-05 Doctor master (name, registration no., clinic) for prescriptions and doctor-wise reports | Feature | Kamesh |
| 90 | RET-06 Return reasons & approval limits | Feature | Kamesh |
| 91 | CMP-04 Pharmacist on duty recorded on each bill (registration no.) | Feature | Kamesh |
| 92 | CMP-06 Banned/recalled drug block (see CAT-12) | Feature | Kamesh |
| 93 | RPT-15 Discount report by user, item, reason | Feature | Nitheesh |
| 94 | Performance baseline with k6: item search p95 < 150 ms, invoice post p95 < 500 ms | Readiness | — |
| 95 | Critical scenario #2: Sales invoice reduces the right batch (FEFO) | Critical scenario | — |
| 96 | Critical scenario #3: Expired batch cannot be sold (online and offline) | Critical scenario | — |
| 97 | Critical scenario #4: Sales return restores stock only if saleable; credit note correct | Critical scenario | — |
| 98 | Critical scenario #6: 20 concurrent bills on the last 10 units → no oversell | Critical scenario | — |
| 99 | Critical scenario #11: Same `Idempotency-Key` twice → one invoice, same response | Critical scenario | — |
| 100 | Critical scenario #13: H1 sale without Rx is blocked; register entry created with Rx | Critical scenario | — |
| 101 | Critical scenario #14: Posted invoice cannot be edited; reversal creates opposite movements and vouchers | Critical scenario | — |
| 102 | QA: Navigation & command search · P4 (1 feature) | QA | — |
| 103 | QA: Pricing, schemes, discounts · P4 (3 features) | QA | — |
| 104 | QA: Inventory · P4 (3 features) | QA | — |
| 105 | QA: Pharmacy operations (short book, ordering, warehouses) · P4 (3 features) | QA | — |
| 106 | QA: Retail POS & invoices · P4 (15 features) | QA | — |
| 107 | QA: GST & statutory · P4 (1 feature) | QA | — |
| 108 | QA: Notifications · P4 (3 features) | QA | — |
| 109 | QA: Desktop app & offline · P4 (3 features) | QA | — |

## P5 · Wholesale, finance, offline (42)

| Step | Task | Type | With |
|---|---|---|---|
| 110 | Scenario 12 offline sync: 3-day offline, conflicts, duplicates | Groundwork | — |
| 111 | Credit limit, outstanding, ageing, ledger balance tests | Groundwork | — |
| 112 | Security: OWASP ZAP baseline, cross-tenant fuzzing, permission matrix tests | Groundwork | — |
| 113 | Full regression suite in CI; restore drill verification with Jeeva | Groundwork | — |
| 114 | Customer groups and account statements screens (web `parties/`) | Groundwork | — |
| 115 | Outstanding, ageing, GST and wholesale reports; analytics screens (web `reports/`) | Groundwork | — |
| 116 | PTY-06 Party ledger, outstanding, ageing | Feature | Kamesh |
| 117 | PTY-07 Credit limit & credit days enforcement with override approval | Feature | Kamesh |
| 118 | PTY-13 Customer and supplier account statements (date range, PDF, email/WhatsApp) | Feature | Kamesh |
| 119 | RET-05 Wholesale: accept expiry/breakage returns from retailers per policy | Feature | Kamesh |
| 120 | CMP-07 Data privacy: patient data minimisation, consent, deletion requests (DPDP Act) | Feature | Kamesh |
| 121 | RPT-06 Profit reports (bill-wise, item-wise, category-wise) on landed cost | Feature | Nitheesh |
| 122 | RPT-07 Outstanding & ageing reports | Feature | Nitheesh |
| 123 | PTY-04 Drug licence expiry tracking & block sale to retailers with expired licence | Feature | Kamesh |
| 124 | PTY-12 Customer groups (individual, retailer, hospital, institution) with default price list, discount and credit terms | Feature | Kamesh |
| 125 | RET-07 Replacement management: replace returned goods instead of credit note | Feature | Kamesh |
| 126 | CMP-08 Patient prescription history (consent-based, minimum data) | Feature | Kamesh |
| 127 | RPT-11 Export every report to Excel/PDF, schedule by email | Feature | Nitheesh |
| 128 | ANX-01 Bill-wise profit and rate / quantity difference analysis (purchase vs sale price drift) | Feature | Nitheesh |
| 129 | ANX-02 ABC ranking of items by value/volume; stock-flow card (opening → in → out → closing) | Feature | Nitheesh |
| 130 | ANX-07 Sales vs payment and sales vs purchase trend charts | Feature | Nitheesh |
| 131 | OWASP ZAP scan + permission matrix tests + cross-tenant fuzzing: no High/Critical findings open | Readiness | — |
| 132 | 3-day offline billing test on the desktop app: 500 bills, reconnect, zero duplicates | Readiness | — |
| 133 | Critical scenario #8: Customer outstanding = invoices − receipts − credit notes | Critical scenario | — |
| 134 | Critical scenario #10: Branch transfer: out = in, in-transit visible, reconciles | Critical scenario | — |
| 135 | Critical scenario #12: Desktop offline 3 days, 500 bills, reconnect → all synced once, conflicts flagged | Critical scenario | — |
| 136 | Critical scenario #15: Vouchers always balance; trial balance totals equal | Critical scenario | — |
| 137 | QA: Platform & administration · P5 (5 features) | QA | — |
| 138 | QA: Pricing, schemes, discounts · P5 (4 features) | QA | — |
| 139 | QA: Purchase · P5 (4 features) | QA | — |
| 140 | QA: Inventory · P5 (6 features) | QA | — |
| 141 | QA: Inventory journals · P5 (2 features) | QA | — |
| 142 | QA: Pharmacy operations (short book, ordering, warehouses) · P5 (2 features) | QA | — |
| 143 | QA: Retail POS & invoices · P5 (6 features) | QA | — |
| 144 | QA: Wholesale · P5 (10 features) | QA | — |
| 145 | QA: Sales & purchase document cycle · P5 (2 features) | QA | — |
| 146 | QA: GST & statutory · P5 (1 feature) | QA | — |
| 147 | QA: Payments & accounting · P5 (7 features) | QA | — |
| 148 | QA: Full books & finance · P5 (9 features) | QA | — |
| 149 | QA: Notifications · P5 (2 features) | QA | — |
| 150 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P5 (2 features) | QA | — |
| 151 | QA: Desktop app & offline · P5 (3 features) | QA | — |

## P6 · Pilot & GST returns (24)

| Step | Task | Type | With |
|---|---|---|---|
| 152 | GSTR export validation, pilot defect triage, release reports | Groundwork | — |
| 153 | RPT-08 GST reports (see §12) | Feature | Nitheesh |
| 154 | PTY-09 Patient refill reminders (chronic medicines) via WhatsApp/SMS | Feature | Kamesh |
| 155 | CMP-02 Schedule X / narcotic register with stricter controls (duplicate Rx retention) | Feature | Kamesh |
| 156 | CMP-10 Controlled stock register: restricted items inward/outward with running balance (verify) | Feature | Kamesh |
| 157 | CMP-11 Regulatory audit: compliance activity log and inspection pack export (verify) | Feature | Kamesh |
| 158 | RPT-10 Branch comparison | Feature | Nitheesh |
| 159 | ANX-03 Customer, product and vendor performance reports (top, declining, dormant) | Feature | Nitheesh |
| 160 | CAT-13 Item images | Feature | Kamesh |
| 161 | PTY-08 Customer loyalty points / membership discount | Feature | Kamesh |
| 162 | ANX-05 Smart insights card on dashboard (plain-language highlights: "Sales of X down 30 % vs last month") | Feature | Nitheesh |
| 163 | Weekly pilot regression run and release report | Readiness | — |
| 164 | QA: Platform & administration · P6 (3 features) | QA | — |
| 165 | QA: Purchase · P6 (1 feature) | QA | — |
| 166 | QA: Inventory · P6 (1 feature) | QA | — |
| 167 | QA: Inventory journals · P6 (1 feature) | QA | — |
| 168 | QA: Pharmacy operations (short book, ordering, warehouses) · P6 (3 features) | QA | — |
| 169 | QA: Retail POS & invoices · P6 (1 feature) | QA | — |
| 170 | QA: Wholesale · P6 (3 features) | QA | — |
| 171 | QA: Sales & purchase document cycle · P6 (1 feature) | QA | — |
| 172 | QA: GST & statutory · P6 (5 features) | QA | — |
| 173 | QA: Payments & accounting · P6 (3 features) | QA | — |
| 174 | QA: Full books & finance · P6 (7 features) | QA | — |
| 175 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P6 (1 feature) | QA | — |

## P7 · Growth (11)

| Step | Task | Type | With |
|---|---|---|---|
| 176 | Mobile test strategy | Groundwork | — |
| 177 | RPT-12 Sales forecasting & smart reorder (ML) | Feature | Nitheesh |
| 178 | ANX-04 Customer & product intelligence: purchase frequency, refill prediction, churn risk | Feature | Nitheesh |
| 179 | QA: Platform & administration · P7 (1 feature) | QA | — |
| 180 | QA: Pharmacy operations (short book, ordering, warehouses) · P7 (1 feature) | QA | — |
| 181 | QA: Wholesale · P7 (1 feature) | QA | — |
| 182 | QA: GST & statutory · P7 (1 feature) | QA | — |
| 183 | QA: Payments & accounting · P7 (1 feature) | QA | — |
| 184 | QA: Full books & finance · P7 (1 feature) | QA | — |
| 185 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P7 (2 features) | QA | — |
| 186 | QA: Mobile (P7) · P7 (5 features) | QA | — |
