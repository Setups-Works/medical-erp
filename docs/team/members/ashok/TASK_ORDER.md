# Ashok — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**255 tasks** · P0: 5 · P1: 13 · P2: 29 · P3: 39 · P4: 56 · P5: 65 · P6: 34 · P7: 14

## P0 · Foundation (5)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | ✅ Review `docs/testing/TEST_STRATEGY.md`; adapt to our tools | Groundwork | — |
| 2 | ✅ Test-case template, defect template, sprint test report template | Groundwork | — |
| 3 | ✅ 40 test vectors JSON with Prakalya (GST, MRP-inclusive, discounts, free qty, rounding) | Groundwork | — |
| 4 | ✅ Learn: Playwright, REST testing (Bruno/Postman), JUnit basics, SQL for verification | Groundwork | — |
| 5 | ✅ Learn the frontend stack (Next.js, TanStack Query, RHF + Zod, shadcn/ui); pair sessions with Meyyarivu | Groundwork | — |

## P1 · Platform core (13)

| Step | Task | Type | With |
|---|---|---|---|
| 6 | Playwright setup in `apps/web/tests/e2e`, CI job with Jeeva | Groundwork | — |
| 7 | Auth, roles, tenant isolation test cases; API collection v1 | Groundwork | — |
| 8 | Test vector runner contract (JSON schema) for Java + TS | Groundwork | — |
| 9 | Review the 20 draft vectors in `contracts/test-vectors/` with Prakalya: recompute by hand, mark confirmed or fix; the P0 "40 vectors" item was ticked but no files existed until 24-11-2026 | Groundwork | — |
| 10 | Test vectors for CALCULATIONS.md §7–§22 with Prakalya: combined distributor bill with returns and charges, loose sale, bill-discount allocation, landed cost and suggested PTR, margin/mark-up, weighted-average valuation, returns, payment allocation, credit check, ageing and interest, reorder, expiry buckets (`contracts/test-vectors/`) | Groundwork | — |
| 11 | First screen on Meyyarivu's patterns: report filter bar + ReportPage skeleton (web `reports/`) | Groundwork | — |
| 12 | SEC-14 Secure SDLC gates: threat-model review per epic, SAST (CodeQL / Semgrep), DAST (ZAP), secret scanning, IaC scanning, security sign-off for auth / money / sync / file PRs, abuse-case tests from THREAT_MODEL.md §5 | Feature | Jeeva |
| 13 | Defect workflow live (labels, severity S1–S4, triage every morning) | Readiness | — |
| 14 | Critical scenario #9: User of tenant A gets 404 for every tenant B resource | Critical scenario | — |
| 15 | QA: Platform & administration · P1 (4 features) | QA | — |
| 16 | QA: Authentication & onboarding · P1 (2 features) | QA | — |
| 17 | QA: Navigation & command search · P1 (1 feature) | QA | — |
| 18 | QA: Security · P1 (2 features) | QA | — |

## P2 · Masters (29)

| Step | Task | Type | With |
|---|---|---|---|
| 19 | Medicine master screens: list, add/edit, details, generic/salt, brand, manufacturer, units + conversion, barcodes (web `catalog/`) | Groundwork | — |
| 20 | Suppliers, customers, doctors: list, add/edit, details (web `parties/`) | Groundwork | — |
| 21 | Masters test cases + E2E for item/party CRUD (screens you didn't build: Prakalya runs QA on yours) | Groundwork | — |
| 22 | Validation test suite from VALIDATION_AND_BUSINESS_RULES.md (every rule: valid, invalid, boundary), audit log checks | Groundwork | — |
| 23 | Master form test cases from MASTER_FIELDS.md: every tab, conditional fields (retailer vs person, MSME, TDS, bank on/off), PIN/IFSC/GSTIN auto-fill, red-dot tab errors | Groundwork | — |
| 24 | CAT-01 Item master: name, brand, generic name, manufacturer, marketed by, composition (salts + strength), dosage form, pack (e.g. 1×10 strip), units (pack/loose) | Feature | Kamesh |
| 25 | CAT-02 HSN code + GST rate, cess, tax-inclusive flag | Feature | Kamesh |
| 26 | CAT-03 Schedule classification (H, H1, X, G, OTC, Narcotic/NDPS) and prescription-required flag | Feature | Kamesh |
| 27 | CAT-04 Barcodes (multiple per item, EAN/GS1, internal barcode generation) | Feature | Kamesh |
| 28 | CAT-14 Non-pharma items (FMCG, surgical, cosmetics) with their own GST | Feature | Kamesh |
| 29 | CAT-15 Generic / salt master: salt name, strength, unit; normalised so the same composition is never stored twice | Feature | Kamesh |
| 30 | CAT-16 Brand and manufacturer masters (marketer vs manufacturer, contact, GSTIN) | Feature | Kamesh |
| 31 | CAT-17 Unit master + multi-level unit conversion (box → strip → tablet) used by purchase, stock and POS | Feature | Kamesh |
| 32 | CAT-20 Storage instructions and medicine detail page (complete profile: stock by branch, batches, substitutes, history) | Feature | Kamesh |
| 33 | CAT-25 Product identity and control fields: product code, print name, department, 2-level category and therapeutic class trees, nature of product (finished goods, consumable, service, asset), shelf life, warranty (devices), barcode / batch / active toggles (pharma items always batch-enabled), remarks | Feature | Kamesh |
| 34 | PTY-01 Supplier master: GSTIN (validated format + state), drug licence nos., contact, bank, credit days | Feature | Kamesh |
| 35 | PTY-02 Customer master (retail): name, phone, address, age/gender (optional), allergies note | Feature | Kamesh |
| 36 | PTY-03 Retailer master (wholesale): GSTIN, DL nos. + expiry, credit limit, credit days, price list, route, salesman | Feature | Kamesh |
| 37 | PTY-16 Party identity fields: print name, party code (auto from series), party type (supplier: manufacturer, distributor, stockist, C&F; customer: retail, retailer, hospital, clinic, institution, doctor) and party group, all options from the API | Feature | Kamesh |
| 38 | PTY-17 Multiple contacts per party: type (primary, accounts, orders, sales rep), person, designation, email, mobile, office no.; exactly one primary | Feature | Kamesh |
| 39 | PTY-18 Multiple addresses per party (billing, shipping, godown) with PIN code auto-fill of state, district and city; billing state must match the GSTIN state | Feature | Kamesh |
| 40 | PTY-19 Party licences as rows: drug licence form + number + valid from/to + scan upload, FSSAI licence, NDPS licence; expiry reminders 30/15/7 days (verify) | Feature | Kamesh |
| 41 | PTY-24 Party GST fields: registration type (regular, composition, unregistered, SEZ, overseas) and default rate mode on their bills (exclusive / inclusive of GST); composition and unregistered suppliers give no input tax credit | Feature | Kamesh |
| 42 | CAT-06 Categories, therapeutic class, storage condition (cold-chain 2–8 °C, below 25 °C) | Feature | Kamesh |
| 43 | QA: Platform & administration · P2 (6 features) | QA | — |
| 44 | QA: Authentication & onboarding · P2 (8 features) | QA | — |
| 45 | QA: Navigation & command search · P2 (1 feature) | QA | — |
| 46 | QA: Sales & purchase document cycle · P2 (1 feature) | QA | — |
| 47 | QA: GST & statutory · P2 (1 feature) | QA | — |

## P3 · Purchase & inventory (39)

| Step | Task | Type | With |
|---|---|---|---|
| 48 | Critical scenarios 1, 2, 3, 5 automated (backend scenario tests) | Groundwork | — |
| 49 | Stock reconciliation verification queries | Groundwork | — |
| 50 | CSV import negative tests (bad rows, duplicates, unknown items) | Groundwork | — |
| 51 | Medicine export, medicine history and supplier price list screens | Groundwork | — |
| 52 | Reports centre screens: stock, batch, expiry, purchase reports with export (web `reports/`) | Groundwork | — |
| 53 | CAT-08 Min / max / reorder level per branch | Feature | Kamesh |
| 54 | CAT-28 Discontinued items: flag with date and reason; blocks new purchase, PO and sale; returns allowed per setting; shown in search with a badge; replacement item suggested | Feature | Kamesh |
| 55 | PTY-10 Party opening balances | Feature | Kamesh |
| 56 | PTY-20 Multiple bank accounts per party with IFSC validation and auto-fill, UPI ID, masked and encrypted account no.; bank-detail changes need approval (maker-checker) and are audited | Feature | Kamesh |
| 57 | RPT-03 Purchase register (supplier-wise, item-wise) | Feature | Nitheesh |
| 58 | RPT-04 Stock reports: current stock, batch-wise, valuation, movement history of an item | Feature | Nitheesh |
| 59 | RPT-05 Expiry report, expired stock, near-expiry by supplier (for returns) | Feature | Nitheesh |
| 60 | RPT-16 Report framework standard: every report has date range, filters, server pagination, export and permission control | Feature | Nitheesh |
| 61 | CAT-07 Rack / shelf / bin location per branch | Feature | Kamesh |
| 62 | CAT-10 Global medicine database seed (common Indian brands) to speed up item creation (verify) licensing of data source | Feature | Kamesh |
| 63 | CAT-11 Item merge (duplicate cleanup) with history preserved | Feature | Kamesh |
| 64 | CAT-18 Medicine export (Excel/CSV) with the same columns as import | Feature | Kamesh |
| 65 | CAT-19 Medicine history: price changes, purchases, sales, adjustments for one item | Feature | Kamesh |
| 66 | CAT-23 Pre-fill the medicine create form from Indian medicine data: search by brand, salt or barcode and fill name, brand, salts + strengths, manufacturer, dosage form, pack and loose units; each pre-filled field marked and editable; save blocked until HSN, GST, schedule and pack are confirmed by the user (verify) | Feature | Kamesh |
| 67 | CAT-27 Product stock defaults: lead time, default in/out warehouse, ranked preferred vendors (used by PO and reorder) | Feature | Kamesh |
| 68 | CAT-29 Create missing masters on the fly when adding or importing a product (brand, manufacturer, category, unit): shown as "will be created", reviewed in one list, audited | Feature | Kamesh |
| 69 | PTY-11 Supplier price list: agreed / last rates per supplier and item, shown during purchase | Feature | Kamesh |
| 70 | PTY-15 GSTIN fetch on supplier and customer forms: verify a GSTIN and fill legal/trade name, state, address and GST status (Active / Cancelled / Suspended); cancelled GSTIN warns at purchase and sale (verify) GSP provider and cost | Feature | Kamesh |
| 71 | PTY-27 Party default discounts (discount %, cash discount %, special discount %) copied to purchase and sale documents | Feature | Kamesh |
| 72 | Calculation parity CI job: Java and TypeScript must pass every test vector | Readiness | Nitheesh |
| 73 | Critical scenario #1: Purchase invoice (incl. free qty, discounts) creates correct batch stock and landed cost | Critical scenario | — |
| 74 | Critical scenario #5: Purchase return updates stock and supplier balance | Critical scenario | — |
| 75 | Critical scenario #7: GST correct: intra/inter-state, MRP-inclusive, rounding — all vectors pass | Critical scenario | — |
| 76 | QA: Platform & administration · P3 (4 features) | QA | — |
| 77 | QA: Authentication & onboarding · P3 (2 features) | QA | — |
| 78 | QA: Navigation & command search · P3 (1 feature) | QA | — |
| 79 | QA: Pricing, schemes, discounts · P3 (5 features) | QA | — |
| 80 | QA: Purchase · P3 (10 features) | QA | — |
| 81 | QA: Inventory · P3 (8 features) | QA | — |
| 82 | QA: Pharmacy operations (short book, ordering, warehouses) · P3 (1 feature) | QA | — |
| 83 | QA: Sales & purchase document cycle · P3 (1 feature) | QA | — |
| 84 | QA: GST & statutory · P3 (3 features) | QA | — |
| 85 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P3 (3 features) | QA | — |
| 86 | QA: Security · P3 (1 feature) | QA | — |

## P4 · Retail POS & returns (56)

| Step | Task | Type | With |
|---|---|---|---|
| 87 | Scenario 6 (concurrent billing, no oversell) — parallel API test | Groundwork | — |
| 88 | Scenario 11 (duplicate requests → one invoice) | Groundwork | — |
| 89 | POS E2E: keyboard-only billing, H1 capture, returns, printing | Groundwork | — |
| 90 | Performance baseline (k6): item search, invoice post | Groundwork | — |
| 91 | Returns screens: sales/purchase return, inspection, credit/debit notes (web `returns/`) | Groundwork | — |
| 92 | Compliance screens: Schedule H/H1/X registers, prescription register, narcotic stock (web `compliance/`) | Groundwork | — |
| 93 | PLT-43 Performance budgets in CI: POS keystroke ≤ 50 ms, item search p95 ≤ 150 ms, bill save p95 ≤ 500 ms, page load ≤ 2 s on a 4 GB PC; failing budget fails the build | Feature | Nitheesh, Jeeva |
| 94 | CAT-05 Loose / strip sale: sell by tablet with conversion factor, loose MRP | Feature | Kamesh |
| 95 | PTY-32 Doctor master fields: qualification, registration no. + state council (unique together), specialisation, clinic, address with PIN auto-fill | Feature | Kamesh |
| 96 | RET-01 Sales return against invoice (batch-aware), stock back only if saleable | Feature | Kamesh |
| 97 | RET-02 Credit note (refund, adjust against outstanding, or future bills) | Feature | Kamesh |
| 98 | RET-03 Purchase return to supplier with debit note | Feature | Kamesh |
| 99 | RET-04 Expiry return / breakage claim to supplier (batch list, claim tracking until credit note received) | Feature | Kamesh |
| 100 | RET-08 Return inspection: decide saleable / damaged / expired per line before stock re-entry | Feature | Kamesh |
| 101 | CMP-01 Schedule H1 register (auto from sales: patient, doctor, item, qty, date) — printable/exportable | Feature | Kamesh |
| 102 | CMP-03 Prescription storage (image), linked to invoice, retention policy | Feature | Kamesh |
| 103 | CMP-05 Drug licence numbers printed on invoices; licence expiry alerts for own branches | Feature | Kamesh |
| 104 | CMP-09 Restricted-medicine alerts at billing: schedule warnings and required steps | Feature | Kamesh |
| 105 | RPT-01 Owner dashboard: today's sales, collections, purchases, margin, low stock, near expiry, outstanding | Feature | Nitheesh |
| 106 | RPT-02 Sales register (day/month, bill-wise, item-wise, customer-wise, doctor-wise, user-wise, branch-wise) | Feature | Nitheesh |
| 107 | RPT-09 Schedule H1 / narcotic registers | Feature | Nitheesh |
| 108 | RPT-13 Reports centre: catalogue, favourites, saved filters, recent | Feature | Nitheesh |
| 109 | RPT-14 Batch-wise sales and traceability: who received batch X (recalls) | Feature | Nitheesh |
| 110 | ANX-06 POS register (counter/shift-wise), sales & sales-return registers, compliance register | Feature | Nitheesh |
| 111 | CAT-09 Generic substitutes (same composition + strength) shown at POS when out of stock | Feature | Kamesh |
| 112 | CAT-12 Banned / recalled drug list with blocking at sale and purchase (verify) CDSCO list maintenance | Feature | Kamesh |
| 113 | CAT-22 Barcode lookup for unknown items: when a scanned barcode is not in the tenant catalogue, look up own barcodes (CAT-04) → Indian medicine data (CAT-10 / INT-11); a hit pre-fills a draft item, a miss opens quick-create with the barcode filled. Never blocks billing | Feature | Kamesh |
| 114 | PTY-05 Doctor master (name, registration no., clinic) for prescriptions and doctor-wise reports | Feature | Kamesh |
| 115 | PTY-30 Retail patient profile on the customer: age or date of birth, gender, allergies, chronic conditions, regular doctor, ABHA no.; permission-gated, never logged, consent recorded (verify) | Feature | Kamesh |
| 116 | RET-06 Return reasons & approval limits | Feature | Kamesh |
| 117 | CMP-04 Pharmacist on duty recorded on each bill (registration no.) | Feature | Kamesh |
| 118 | CMP-06 Banned/recalled drug block (see CAT-12) | Feature | Kamesh |
| 119 | CMP-12 NPPA / DPCO ceiling price check: ceiling price table (effective-dated); warn at purchase when batch MRP exceeds the ceiling, block sale once confirmed (verify) source and update process | Feature | Kamesh |
| 120 | RPT-15 Discount report by user, item, reason | Feature | Nitheesh |
| 121 | RET-09 Counter return without the original bill, only when the store policy setting allows it, at the lower of last selling price and MRP, with approval (verify) | Feature | Kamesh |
| 122 | Performance baseline with k6: item search p95 < 150 ms, invoice post p95 < 500 ms | Readiness | — |
| 123 | Critical scenario #2: Sales invoice reduces the right batch (FEFO) | Critical scenario | — |
| 124 | Critical scenario #3: Expired batch cannot be sold (online and offline) | Critical scenario | — |
| 125 | Critical scenario #4: Sales return restores stock only if saleable; credit note correct | Critical scenario | — |
| 126 | Critical scenario #6: 20 concurrent bills on the last 10 units → no oversell | Critical scenario | — |
| 127 | Critical scenario #11: Same `Idempotency-Key` twice → one invoice, same response | Critical scenario | — |
| 128 | Critical scenario #13: H1 sale without Rx is blocked; register entry created with Rx | Critical scenario | — |
| 129 | Critical scenario #14: Posted invoice cannot be edited; reversal creates opposite movements and vouchers | Critical scenario | — |
| 130 | QA: Platform & administration · P4 (2 features) | QA | — |
| 131 | QA: Authentication & onboarding · P4 (2 features) | QA | — |
| 132 | QA: Navigation & command search · P4 (2 features) | QA | — |
| 133 | QA: Pricing, schemes, discounts · P4 (4 features) | QA | — |
| 134 | QA: Purchase · P4 (1 feature) | QA | — |
| 135 | QA: Inventory · P4 (5 features) | QA | — |
| 136 | QA: Pharmacy operations (short book, ordering, warehouses) · P4 (3 features) | QA | — |
| 137 | QA: Retail POS & invoices · P4 (17 features) | QA | — |
| 138 | QA: Sales & purchase document cycle · P4 (2 features) | QA | — |
| 139 | QA: GST & statutory · P4 (1 feature) | QA | — |
| 140 | QA: Notifications · P4 (3 features) | QA | — |
| 141 | QA: Desktop app & offline · P4 (3 features) | QA | — |
| 142 | QA: Security · P4 (3 features) | QA | — |

## P5 · Wholesale, finance, offline (65)

| Step | Task | Type | With |
|---|---|---|---|
| 143 | Scenario 12 offline sync: 3-day offline, conflicts, duplicates | Groundwork | — |
| 144 | Credit limit, outstanding, ageing, ledger balance tests | Groundwork | — |
| 145 | Security: OWASP ZAP baseline, cross-tenant fuzzing, permission matrix tests | Groundwork | — |
| 146 | Full regression suite in CI; restore drill verification with Jeeva | Groundwork | — |
| 147 | Customer groups and account statements screens (web `parties/`) | Groundwork | — |
| 148 | Outstanding, ageing, GST and wholesale reports; analytics screens (web `reports/`) | Groundwork | — |
| 149 | PLT-26 Migration importers for exports of popular software (Marg, Tally, Busy, Vyapar, GoFrugal): items, parties, opening stock by batch, outstanding bills, ledgers with opening balances; dry run with error report | Feature | Kamesh, Jeeva |
| 150 | PTY-06 Party ledger, outstanding, ageing | Feature | Kamesh |
| 151 | PTY-07 Credit limit & credit days enforcement with override approval | Feature | Kamesh |
| 152 | PTY-13 Customer and supplier account statements (date range, PDF, email/WhatsApp) | Feature | Kamesh |
| 153 | PTY-34 Credit rules beyond amount: limit by value, number of open bills and oldest bill age; over-limit approval from the owner's phone; average payment days shown at billing | Feature | Kamesh |
| 154 | RET-05 Wholesale: accept expiry/breakage returns from retailers per policy | Feature | Kamesh |
| 155 | CMP-07 Data privacy: patient data minimisation, consent, deletion requests (DPDP Act) | Feature | Kamesh |
| 156 | RPT-06 Profit reports (bill-wise, item-wise, category-wise) on landed cost | Feature | Nitheesh |
| 157 | RPT-07 Outstanding & ageing reports | Feature | Nitheesh |
| 158 | RPT-17 Outstanding by area, route, salesman and as-on-date / age-wise for receivables and payables, shareable as PDF / WhatsApp | Feature | Nitheesh |
| 159 | RPT-18 Exception (bill audit) report: edited drafts, cancelled, back-dated, reprinted, below-cost, above-cap discount, FEFO overrides, negative-stock attempts, by user and day | Feature | Nitheesh |
| 160 | PTY-04 Drug licence expiry tracking & block sale to retailers with expired licence | Feature | Kamesh |
| 161 | PTY-12 Customer groups (individual, retailer, hospital, institution) with default price list, discount and credit terms | Feature | Kamesh |
| 162 | PTY-14 Distributor rate contracts (terms of trade): agreed rate, scheme, discount and credit days per supplier + item, valid from / to; purchase entry flags deviations (extends PTY-11) | Feature | Kamesh |
| 163 | PTY-21 Per-party payment reminders: schedule (N days before due, on due date, custom) and channels (email, WhatsApp, SMS); supplier reminders are for us, customer reminders go to the customer | Feature | Kamesh |
| 164 | PTY-22 Party income-tax fields: PAN (matches GSTIN), related-party flag, TDS/TCS applicable + section from `tds_section`; related-party transactions report (verify) | Feature | Nitheesh |
| 165 | PTY-23 MSME (Udyam) details for suppliers: category (micro / small / medium / not applicable), Udyam no., certificate; MSME payables due-date tracking and overdue report (verify) CA to confirm payment limit and tax effect | Feature | Nitheesh |
| 166 | PTY-26 Transporter master and party defaults (transporter, mode, vehicle type) used by GRN, delivery and e-way bill | Feature | Kamesh |
| 167 | PTY-31 Party merge (duplicate cleanup) with ledgers, documents and history preserved | Feature | Kamesh |
| 168 | PTY-33 Party self-registration link: send a link; the retailer or customer fills GSTIN, licences, address and contacts; staff review and approve before the party is active | Feature | Kamesh |
| 169 | PUR-21 Purchase inbox: a dedicated email address or connected mailbox receives distributor CSV / PDF bills, auto-creates draft purchases with item mapping, flags rate changes | Feature | Kamesh, Jeeva |
| 170 | RET-07 Replacement management: replace returned goods instead of credit note | Feature | Kamesh |
| 171 | CMP-08 Patient prescription history (consent-based, minimum data) | Feature | Kamesh |
| 172 | CMP-14 Expired / damaged stock destruction record: batches, quantities, date, method, witnesses, linked to the write-off adjustment (verify) | Feature | Kamesh |
| 173 | RPT-11 Export every report to Excel/PDF, schedule by email | Feature | Nitheesh |
| 174 | RPT-19 Customer payment behaviour: average payment days, delay trend, bills paid after due date per customer and area | Feature | Nitheesh |
| 175 | RPT-20 Manufacturer-wise reports: sales, stock, expiry and returns by manufacturer / company | Feature | Nitheesh |
| 176 | RPT-22 Group register: net sales quantity and amount, profit and growth % vs the previous period by product group, category, brand or manufacturer | Feature | Nitheesh |
| 177 | ANX-01 Bill-wise profit and rate / quantity difference analysis (purchase vs sale price drift) | Feature | Nitheesh |
| 178 | ANX-02 ABC ranking of items by value/volume; stock-flow card (opening → in → out → closing) | Feature | Nitheesh |
| 179 | ANX-07 Sales vs payment and sales vs purchase trend charts | Feature | Nitheesh |
| 180 | ANX-08 Staff performance: sales, bills, average bill value, discounts given, returns, cancellations by user, salesman, counter and outlet | Feature | Nitheesh |
| 181 | ANX-10 Risk flags: customers approaching their credit limit and declining customers; dead and declining stock; each with drill-down to bills and items (extends ANX-04) | Feature | Nitheesh |
| 182 | CAT-26 Bundles / kits: one sellable line made of component items, stock taken from components | Feature | Kamesh |
| 183 | PTY-25 One party in both roles (customer and supplier) with a single ledger and netted outstanding (verify) CA | Feature | Nitheesh |
| 184 | OWASP ZAP scan + permission matrix tests + cross-tenant fuzzing: no High/Critical findings open | Readiness | — |
| 185 | 3-day offline billing test on the desktop app: 500 bills, reconnect, zero duplicates | Readiness | — |
| 186 | Critical scenario #8: Customer outstanding = invoices − receipts − credit notes | Critical scenario | — |
| 187 | Critical scenario #10: Branch transfer: out = in, in-transit visible, reconciles | Critical scenario | — |
| 188 | Critical scenario #12: Desktop offline 3 days, 500 bills, reconnect → all synced once, conflicts flagged | Critical scenario | — |
| 189 | Critical scenario #15: Vouchers always balance; trial balance totals equal | Critical scenario | — |
| 190 | QA: Platform & administration · P5 (18 features) | QA | — |
| 191 | QA: Licensing: plans, license keys, entitlements · P5 (9 features) | QA | — |
| 192 | QA: Authentication & onboarding · P5 (1 feature) | QA | — |
| 193 | QA: Pricing, schemes, discounts · P5 (6 features) | QA | — |
| 194 | QA: Purchase · P5 (6 features) | QA | — |
| 195 | QA: Inventory · P5 (8 features) | QA | — |
| 196 | QA: Inventory journals · P5 (2 features) | QA | — |
| 197 | QA: Pharmacy operations (short book, ordering, warehouses) · P5 (2 features) | QA | — |
| 198 | QA: Retail POS & invoices · P5 (11 features) | QA | — |
| 199 | QA: Wholesale · P5 (16 features) | QA | — |
| 200 | QA: Sales & purchase document cycle · P5 (3 features) | QA | — |
| 201 | QA: GST & statutory · P5 (1 feature) | QA | — |
| 202 | QA: Payments & accounting · P5 (10 features) | QA | — |
| 203 | QA: Full books & finance · P5 (9 features) | QA | — |
| 204 | QA: Notifications · P5 (4 features) | QA | — |
| 205 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P5 (2 features) | QA | — |
| 206 | QA: Desktop app & offline · P5 (3 features) | QA | — |
| 207 | QA: Security · P5 (10 features) | QA | — |

## P6 · Pilot & GST returns (34)

| Step | Task | Type | With |
|---|---|---|---|
| 208 | GSTR export validation, pilot defect triage, release reports | Groundwork | — |
| 209 | PLT-44 Security assurance: OWASP ASVS L2 checklist per release, dependency and container scanning, annual VAPT by a CERT-In empanelled auditor, CERT-In 6-hour incident reporting and 180-day log retention (verify), ISO 27001 readiness | Feature | Jeeva, Nitheesh |
| 210 | RPT-08 GST reports (see §12) | Feature | Nitheesh |
| 211 | PTY-09 Patient refill reminders (chronic medicines) via WhatsApp/SMS | Feature | Kamesh |
| 212 | PTY-28 Agent master and party agent/salesman with commission %; commission report | Feature | Kamesh |
| 213 | CMP-02 Schedule X / narcotic register with stricter controls (duplicate Rx retention) | Feature | Kamesh |
| 214 | CMP-10 Controlled stock register: restricted items inward/outward with running balance (verify) | Feature | Kamesh |
| 215 | CMP-11 Regulatory audit: compliance activity log and inspection pack export (verify) | Feature | Kamesh |
| 216 | CMP-13 Patient safety warnings at POS: allergy match with the patient profile, duplicate-therapy and interaction alerts from the drug reference; pharmacist acknowledges and it is logged (verify) pharmacist review | Feature | Kamesh |
| 217 | RPT-10 Branch comparison | Feature | Nitheesh |
| 218 | RPT-21 Commission and TDS register: salesman / agent commission vouchers with sales amount, commission %, commission, TDS section, TDS % and TDS amount by period (verify) CA (TDS on commission) | Feature | Nitheesh |
| 219 | ANX-03 Customer, product and vendor performance reports (top, declining, dormant) | Feature | Nitheesh |
| 220 | ANX-09 Customer retention: new vs repeat, lapsed customers, refill adherence by month and branch | Feature | Nitheesh |
| 221 | CAT-13 Item images | Feature | Kamesh |
| 222 | CAT-21 Drug reference panel on the medicine detail page and POS item info (`F1`): indications, dosage, boxed warning, warnings, contraindications, interactions, pregnancy, storage, looked up by salt with an Indian (INN) → US name map held in a configuration table (paracetamol → acetaminophen); shows the FDA disclaimer, attribution and "US label, the Indian label may differ" (verify) pharmacist review | Feature | Kamesh |
| 223 | PTY-08 Customer loyalty points / membership discount | Feature | Kamesh |
| 224 | PTY-29 Interest on overdue: % and basis (simple 365 / 360 days, compound monthly) per party; interest calculation report and optional interest debit note (verify) | Feature | Nitheesh |
| 225 | ANX-05 Smart insights card on dashboard (plain-language highlights: "Sales of X down 30 % vs last month") | Feature | Nitheesh |
| 226 | Weekly pilot regression run and release report | Readiness | — |
| 227 | QA: Platform & administration · P6 (7 features) | QA | — |
| 228 | QA: Licensing: plans, license keys, entitlements · P6 (2 features) | QA | — |
| 229 | QA: Purchase · P6 (3 features) | QA | — |
| 230 | QA: Inventory · P6 (1 feature) | QA | — |
| 231 | QA: Inventory journals · P6 (1 feature) | QA | — |
| 232 | QA: Pharmacy operations (short book, ordering, warehouses) · P6 (3 features) | QA | — |
| 233 | QA: Retail POS & invoices · P6 (1 feature) | QA | — |
| 234 | QA: Wholesale · P6 (5 features) | QA | — |
| 235 | QA: Sales & purchase document cycle · P6 (1 feature) | QA | — |
| 236 | QA: GST & statutory · P6 (8 features) | QA | — |
| 237 | QA: Payments & accounting · P6 (5 features) | QA | — |
| 238 | QA: Full books & finance · P6 (8 features) | QA | — |
| 239 | QA: Home delivery & fleet · P6 (1 feature) | QA | — |
| 240 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P6 (4 features) | QA | — |
| 241 | QA: Security · P6 (2 features) | QA | — |

## P7 · Growth (14)

| Step | Task | Type | With |
|---|---|---|---|
| 242 | Mobile test strategy | Groundwork | — |
| 243 | RPT-12 Sales forecasting & smart reorder (ML) | Feature | Nitheesh |
| 244 | ANX-04 Customer & product intelligence: purchase frequency, refill prediction, churn risk | Feature | Nitheesh |
| 245 | QA: Platform & administration · P7 (3 features) | QA | — |
| 246 | QA: Purchase · P7 (1 feature) | QA | — |
| 247 | QA: Pharmacy operations (short book, ordering, warehouses) · P7 (1 feature) | QA | — |
| 248 | QA: Wholesale · P7 (1 feature) | QA | — |
| 249 | QA: GST & statutory · P7 (1 feature) | QA | — |
| 250 | QA: Payments & accounting · P7 (1 feature) | QA | — |
| 251 | QA: Full books & finance · P7 (1 feature) | QA | — |
| 252 | QA: Notifications · P7 (1 feature) | QA | — |
| 253 | QA: Home delivery & fleet · P7 (2 features) | QA | — |
| 254 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P7 (7 features) | QA | — |
| 255 | QA: Mobile (P7) · P7 (6 features) | QA | — |
