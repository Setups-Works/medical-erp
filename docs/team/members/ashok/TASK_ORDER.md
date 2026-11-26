# Ashok — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**224 tasks** · P0: 5 · P1: 13 · P2: 29 · P3: 34 · P4: 49 · P5: 51 · P6: 28 · P7: 15

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
| 11 | First screen on Meyyarivu's patterns: medicine list on ListPage with MSW mocks (web `catalog/`); the reports skeleton moved to Gokul | Groundwork | — |
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

## P3 · Purchase & inventory (34)

| Step | Task | Type | With |
|---|---|---|---|
| 48 | Critical scenarios 1, 2, 3, 5 automated (backend scenario tests) | Groundwork | — |
| 49 | Stock reconciliation verification queries | Groundwork | — |
| 50 | CSV import negative tests (bad rows, duplicates, unknown items) | Groundwork | — |
| 51 | Medicine export, medicine history and supplier price list screens | Groundwork | — |
| 52 | CAT-08 Min / max / reorder level per branch | Feature | Kamesh |
| 53 | CAT-28 Discontinued items: flag with date and reason; blocks new purchase, PO and sale; returns allowed per setting; shown in search with a badge; replacement item suggested | Feature | Kamesh |
| 54 | PTY-10 Party opening balances | Feature | Kamesh |
| 55 | PTY-20 Multiple bank accounts per party with IFSC validation and auto-fill, UPI ID, masked and encrypted account no.; bank-detail changes need approval (maker-checker) and are audited | Feature | Kamesh |
| 56 | CAT-07 Rack / shelf / bin location per branch | Feature | Kamesh |
| 57 | CAT-10 Global medicine database seed (common Indian brands) to speed up item creation (verify) licensing of data source | Feature | Kamesh |
| 58 | CAT-11 Item merge (duplicate cleanup) with history preserved | Feature | Kamesh |
| 59 | CAT-18 Medicine export (Excel/CSV) with the same columns as import | Feature | Kamesh |
| 60 | CAT-19 Medicine history: price changes, purchases, sales, adjustments for one item | Feature | Kamesh |
| 61 | CAT-23 Pre-fill the medicine create form from Indian medicine data: search by brand, salt or barcode and fill name, brand, salts + strengths, manufacturer, dosage form, pack and loose units; each pre-filled field marked and editable; save blocked until HSN, GST, schedule and pack are confirmed by the user (verify) | Feature | Kamesh |
| 62 | CAT-27 Product stock defaults: lead time, default in/out warehouse, ranked preferred vendors (used by PO and reorder) | Feature | Kamesh |
| 63 | CAT-29 Create missing masters on the fly when adding or importing a product (brand, manufacturer, category, unit): shown as "will be created", reviewed in one list, audited | Feature | Kamesh |
| 64 | PTY-11 Supplier price list: agreed / last rates per supplier and item, shown during purchase | Feature | Kamesh |
| 65 | PTY-15 GSTIN fetch on supplier and customer forms: verify a GSTIN and fill legal/trade name, state, address and GST status (Active / Cancelled / Suspended); cancelled GSTIN warns at purchase and sale; spec [GSTIN_FETCH.md](GSTIN_FETCH.md), provider adapter INT-17 (verify) GSP provider and cost | Feature | Kamesh |
| 66 | PTY-27 Party default discounts (discount %, cash discount %, special discount %) copied to purchase and sale documents | Feature | Kamesh |
| 67 | Calculation parity CI job: Java and TypeScript must pass every test vector | Readiness | Nitheesh |
| 68 | Critical scenario #1: Purchase invoice (incl. free qty, discounts) creates correct batch stock and landed cost | Critical scenario | — |
| 69 | Critical scenario #5: Purchase return updates stock and supplier balance | Critical scenario | — |
| 70 | Critical scenario #7: GST correct: intra/inter-state, MRP-inclusive, rounding — all vectors pass | Critical scenario | — |
| 71 | QA: Platform & administration · P3 (4 features) | QA | — |
| 72 | QA: Authentication & onboarding · P3 (2 features) | QA | — |
| 73 | QA: Navigation & command search · P3 (1 feature) | QA | — |
| 74 | QA: Pricing, schemes, discounts · P3 (5 features) | QA | — |
| 75 | QA: Purchase · P3 (10 features) | QA | — |
| 76 | QA: Inventory · P3 (8 features) | QA | — |
| 77 | QA: Pharmacy operations (short book, ordering, warehouses) · P3 (1 feature) | QA | — |
| 78 | QA: Sales & purchase document cycle · P3 (1 feature) | QA | — |
| 79 | QA: GST & statutory · P3 (3 features) | QA | — |
| 80 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P3 (4 features) | QA | — |
| 81 | QA: Security · P3 (1 feature) | QA | — |

## P4 · Retail POS & returns (49)

| Step | Task | Type | With |
|---|---|---|---|
| 82 | Scenario 6 (concurrent billing, no oversell) — parallel API test | Groundwork | — |
| 83 | Scenario 11 (duplicate requests → one invoice) | Groundwork | — |
| 84 | POS E2E: keyboard-only billing, H1 capture, returns, printing | Groundwork | — |
| 85 | Performance baseline (k6): item search, invoice post | Groundwork | — |
| 86 | Returns screens: sales/purchase return, inspection, credit/debit notes (web `returns/`) | Groundwork | — |
| 87 | Compliance screens: Schedule H/H1/X registers, prescription register, narcotic stock (web `compliance/`) | Groundwork | — |
| 88 | PLT-43 Performance budgets in CI: POS keystroke ≤ 50 ms, item search p95 ≤ 150 ms, bill save p95 ≤ 500 ms, page load ≤ 2 s on a 4 GB PC; failing budget fails the build | Feature | Nitheesh, Jeeva |
| 89 | CAT-05 Loose / strip sale: sell by tablet with conversion factor, loose MRP | Feature | Kamesh |
| 90 | PTY-32 Doctor master fields: qualification, registration no. + state council (unique together), specialisation, clinic, address with PIN auto-fill | Feature | Kamesh |
| 91 | RET-01 Sales return against invoice (batch-aware), stock back only if saleable | Feature | Kamesh |
| 92 | RET-02 Credit note (refund, adjust against outstanding, or future bills) | Feature | Kamesh |
| 93 | RET-03 Purchase return to supplier with debit note | Feature | Kamesh |
| 94 | RET-04 Expiry return / breakage claim to supplier (batch list, claim tracking until credit note received) | Feature | Kamesh |
| 95 | RET-08 Return inspection: decide saleable / damaged / expired per line before stock re-entry | Feature | Kamesh |
| 96 | CMP-01 Schedule H1 register (auto from sales: patient, doctor, item, qty, date) — printable/exportable | Feature | Kamesh |
| 97 | CMP-03 Prescription storage (image), linked to invoice, retention policy | Feature | Kamesh |
| 98 | CMP-05 Drug licence numbers printed on invoices; licence expiry alerts for own branches | Feature | Kamesh |
| 99 | CMP-09 Restricted-medicine alerts at billing: schedule warnings and required steps | Feature | Kamesh |
| 100 | CAT-09 Generic substitutes (same composition + strength) shown at POS when out of stock | Feature | Kamesh |
| 101 | CAT-12 Banned / recalled drug list with blocking at sale and purchase (verify) CDSCO list maintenance | Feature | Kamesh |
| 102 | CAT-22 Barcode lookup for unknown items: when a scanned barcode is not in the tenant catalogue, look up own barcodes (CAT-04) → Indian medicine data (CAT-10 / INT-11); a hit pre-fills a draft item, a miss opens quick-create with the barcode filled. Never blocks billing | Feature | Kamesh |
| 103 | PTY-05 Doctor master (name, registration no., clinic) for prescriptions and doctor-wise reports | Feature | Kamesh |
| 104 | PTY-30 Retail patient profile on the customer: age or date of birth, gender, allergies, chronic conditions, regular doctor, ABHA no.; permission-gated, never logged, consent recorded (verify) | Feature | Kamesh |
| 105 | RET-06 Return reasons & approval limits | Feature | Kamesh |
| 106 | CMP-04 Pharmacist on duty recorded on each bill (registration no.) | Feature | Kamesh |
| 107 | CMP-06 Banned/recalled drug block (see CAT-12) | Feature | Kamesh |
| 108 | CMP-12 NPPA / DPCO ceiling price check: ceiling price table (effective-dated); warn at purchase when batch MRP exceeds the ceiling, block sale once confirmed (verify) source and update process | Feature | Kamesh |
| 109 | RET-09 Counter return without the original bill, only when the store policy setting allows it, at the lower of last selling price and MRP, with approval (verify) | Feature | Kamesh |
| 110 | Performance baseline with k6: item search p95 < 150 ms, invoice post p95 < 500 ms | Readiness | — |
| 111 | Critical scenario #2: Sales invoice reduces the right batch (FEFO) | Critical scenario | — |
| 112 | Critical scenario #3: Expired batch cannot be sold (online and offline) | Critical scenario | — |
| 113 | Critical scenario #4: Sales return restores stock only if saleable; credit note correct | Critical scenario | — |
| 114 | Critical scenario #6: 20 concurrent bills on the last 10 units → no oversell | Critical scenario | — |
| 115 | Critical scenario #11: Same `Idempotency-Key` twice → one invoice, same response | Critical scenario | — |
| 116 | Critical scenario #13: H1 sale without Rx is blocked; register entry created with Rx | Critical scenario | — |
| 117 | Critical scenario #14: Posted invoice cannot be edited; reversal creates opposite movements and vouchers | Critical scenario | — |
| 118 | QA: Platform & administration · P4 (2 features) | QA | — |
| 119 | QA: Authentication & onboarding · P4 (2 features) | QA | — |
| 120 | QA: Navigation & command search · P4 (2 features) | QA | — |
| 121 | QA: Pricing, schemes, discounts · P4 (4 features) | QA | — |
| 122 | QA: Purchase · P4 (1 feature) | QA | — |
| 123 | QA: Inventory · P4 (5 features) | QA | — |
| 124 | QA: Pharmacy operations (short book, ordering, warehouses) · P4 (3 features) | QA | — |
| 125 | QA: Retail POS & invoices · P4 (19 features) | QA | — |
| 126 | QA: Sales & purchase document cycle · P4 (2 features) | QA | — |
| 127 | QA: GST & statutory · P4 (1 feature) | QA | — |
| 128 | QA: Notifications · P4 (3 features) | QA | — |
| 129 | QA: Desktop app & offline · P4 (3 features) | QA | — |
| 130 | QA: Security · P4 (3 features) | QA | — |

## P5 · Wholesale, finance, offline (51)

| Step | Task | Type | With |
|---|---|---|---|
| 131 | Scenario 12 offline sync: 3-day offline, conflicts, duplicates | Groundwork | — |
| 132 | Credit limit, outstanding, ageing, ledger balance tests | Groundwork | — |
| 133 | Security: OWASP ZAP baseline, cross-tenant fuzzing, permission matrix tests | Groundwork | — |
| 134 | Full regression suite in CI; restore drill verification with Jeeva | Groundwork | — |
| 135 | Customer groups and account statements screens (web `parties/`) | Groundwork | — |
| 136 | PLT-26 Migration importers for exports of popular software (Marg, Tally, Busy, Vyapar, GoFrugal): items, parties, opening stock by batch, outstanding bills, ledgers with opening balances; dry run with error report | Feature | Kamesh, Jeeva |
| 137 | PTY-06 Party ledger, outstanding, ageing | Feature | Kamesh |
| 138 | PTY-07 Credit limit & credit days enforcement with override approval | Feature | Kamesh |
| 139 | PTY-13 Customer and supplier account statements (date range, PDF, email/WhatsApp) | Feature | Kamesh |
| 140 | PTY-34 Credit rules beyond amount: limit by value, number of open bills and oldest bill age; over-limit approval from the owner's phone; average payment days shown at billing | Feature | Kamesh |
| 141 | RET-05 Wholesale: accept expiry/breakage returns from retailers per policy | Feature | Kamesh |
| 142 | CMP-07 Data privacy: patient data minimisation, consent, deletion requests (DPDP Act) | Feature | Kamesh |
| 143 | PTY-04 Drug licence expiry tracking & block sale to retailers with expired licence | Feature | Kamesh |
| 144 | PTY-12 Customer groups (individual, retailer, hospital, institution) with default price list, discount and credit terms | Feature | Kamesh |
| 145 | PTY-14 Distributor rate contracts (terms of trade): agreed rate, scheme, discount and credit days per supplier + item, valid from / to; purchase entry flags deviations (extends PTY-11) | Feature | Kamesh |
| 146 | PTY-21 Per-party payment reminders: schedule (N days before due, on due date, custom) and channels (email, WhatsApp, SMS); supplier reminders are for us, customer reminders go to the customer | Feature | Kamesh |
| 147 | PTY-22 Party income-tax fields: PAN (matches GSTIN), related-party flag, TDS/TCS applicable + section from `tds_section`; related-party transactions report (verify) | Feature | Nitheesh |
| 148 | PTY-23 MSME (Udyam) details for suppliers: category (micro / small / medium / not applicable), Udyam no., certificate; MSME payables due-date tracking and overdue report (verify) CA to confirm payment limit and tax effect | Feature | Nitheesh |
| 149 | PTY-26 Transporter master and party defaults (transporter, mode, vehicle type) used by GRN, delivery and e-way bill | Feature | Kamesh |
| 150 | PTY-31 Party merge (duplicate cleanup) with ledgers, documents and history preserved | Feature | Kamesh |
| 151 | PTY-33 Party self-registration link: send a link; the retailer or customer fills GSTIN, licences, address and contacts; staff review and approve before the party is active | Feature | Kamesh |
| 152 | PUR-21 Purchase inbox: a dedicated email address or connected mailbox receives distributor CSV / PDF bills, auto-creates draft purchases with item mapping, flags rate changes | Feature | Kamesh, Jeeva |
| 153 | RET-07 Replacement management: replace returned goods instead of credit note | Feature | Kamesh |
| 154 | CMP-08 Patient prescription history (consent-based, minimum data) | Feature | Kamesh |
| 155 | CMP-14 Expired / damaged stock destruction record: batches, quantities, date, method, witnesses, linked to the write-off adjustment (verify) | Feature | Kamesh |
| 156 | CAT-26 Bundles / kits: one sellable line made of component items, stock taken from components | Feature | Kamesh |
| 157 | PTY-25 One party in both roles (customer and supplier) with a single ledger and netted outstanding (verify) CA | Feature | Nitheesh |
| 158 | OWASP ZAP scan + permission matrix tests + cross-tenant fuzzing: no High/Critical findings open | Readiness | — |
| 159 | 3-day offline billing test on the desktop app: 500 bills, reconnect, zero duplicates | Readiness | — |
| 160 | Critical scenario #8: Customer outstanding = invoices − receipts − credit notes | Critical scenario | — |
| 161 | Critical scenario #10: Branch transfer: out = in, in-transit visible, reconciles | Critical scenario | — |
| 162 | Critical scenario #12: Desktop offline 3 days, 500 bills, reconnect → all synced once, conflicts flagged | Critical scenario | — |
| 163 | Critical scenario #15: Vouchers always balance; trial balance totals equal | Critical scenario | — |
| 164 | QA: Platform & administration · P5 (18 features) | QA | — |
| 165 | QA: Licensing: plans, license keys, entitlements · P5 (9 features) | QA | — |
| 166 | QA: Authentication & onboarding · P5 (1 feature) | QA | — |
| 167 | QA: Pricing, schemes, discounts · P5 (6 features) | QA | — |
| 168 | QA: Purchase · P5 (6 features) | QA | — |
| 169 | QA: Inventory · P5 (8 features) | QA | — |
| 170 | QA: Inventory journals · P5 (2 features) | QA | — |
| 171 | QA: Pharmacy operations (short book, ordering, warehouses) · P5 (2 features) | QA | — |
| 172 | QA: Retail POS & invoices · P5 (11 features) | QA | — |
| 173 | QA: Wholesale · P5 (16 features) | QA | — |
| 174 | QA: Sales & purchase document cycle · P5 (3 features) | QA | — |
| 175 | QA: GST & statutory · P5 (1 feature) | QA | — |
| 176 | QA: Payments & accounting · P5 (10 features) | QA | — |
| 177 | QA: Full books & finance · P5 (9 features) | QA | — |
| 178 | QA: Notifications · P5 (4 features) | QA | — |
| 179 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P5 (2 features) | QA | — |
| 180 | QA: Desktop app & offline · P5 (3 features) | QA | — |
| 181 | QA: Security · P5 (10 features) | QA | — |

## P6 · Pilot & GST returns (28)

| Step | Task | Type | With |
|---|---|---|---|
| 182 | GSTR export validation, pilot defect triage, release reports | Groundwork | — |
| 183 | PLT-44 Security assurance: OWASP ASVS L2 checklist per release, dependency and container scanning, annual VAPT by a CERT-In empanelled auditor, CERT-In 6-hour incident reporting and 180-day log retention (verify), ISO 27001 readiness | Feature | Jeeva, Nitheesh |
| 184 | PTY-09 Patient refill reminders (chronic medicines) via WhatsApp/SMS | Feature | Kamesh |
| 185 | PTY-28 Agent master and party agent/salesman with commission %; commission report | Feature | Kamesh |
| 186 | CMP-02 Schedule X / narcotic register with stricter controls (duplicate Rx retention) | Feature | Kamesh |
| 187 | CMP-10 Controlled stock register: restricted items inward/outward with running balance (verify) | Feature | Kamesh |
| 188 | CMP-11 Regulatory audit: compliance activity log and inspection pack export (verify) | Feature | Kamesh |
| 189 | CMP-13 Patient safety warnings at POS: allergy match with the patient profile, duplicate-therapy and interaction alerts from the drug reference; pharmacist acknowledges and it is logged (verify) pharmacist review | Feature | Kamesh |
| 190 | CAT-13 Item images | Feature | Kamesh |
| 191 | CAT-21 Drug reference panel on the medicine detail page and POS item info (`F1`): indications, dosage, boxed warning, warnings, contraindications, interactions, pregnancy, storage, looked up by salt with an Indian (INN) → US name map held in a configuration table (paracetamol → acetaminophen); shows the FDA disclaimer, attribution and "US label, the Indian label may differ" (verify) pharmacist review | Feature | Kamesh |
| 192 | PTY-08 Customer loyalty points / membership discount | Feature | Kamesh |
| 193 | PTY-29 Interest on overdue: % and basis (simple 365 / 360 days, compound monthly) per party; interest calculation report and optional interest debit note (verify) | Feature | Nitheesh |
| 194 | Weekly pilot regression run and release report | Readiness | — |
| 195 | QA: Platform & administration · P6 (7 features) | QA | — |
| 196 | QA: Licensing: plans, license keys, entitlements · P6 (2 features) | QA | — |
| 197 | QA: Purchase · P6 (3 features) | QA | — |
| 198 | QA: Inventory · P6 (1 feature) | QA | — |
| 199 | QA: Inventory journals · P6 (1 feature) | QA | — |
| 200 | QA: Pharmacy operations (short book, ordering, warehouses) · P6 (3 features) | QA | — |
| 201 | QA: Retail POS & invoices · P6 (1 feature) | QA | — |
| 202 | QA: Wholesale · P6 (5 features) | QA | — |
| 203 | QA: Sales & purchase document cycle · P6 (1 feature) | QA | — |
| 204 | QA: GST & statutory · P6 (8 features) | QA | — |
| 205 | QA: Payments & accounting · P6 (5 features) | QA | — |
| 206 | QA: Full books & finance · P6 (8 features) | QA | — |
| 207 | QA: Home delivery & fleet · P6 (1 feature) | QA | — |
| 208 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P6 (4 features) | QA | — |
| 209 | QA: Security · P6 (2 features) | QA | — |

## P7 · Growth (15)

| Step | Task | Type | With |
|---|---|---|---|
| 210 | Mobile test strategy | Groundwork | — |
| 211 | AI assistant security test pack: cross-tenant through questions and crafted tool arguments, prompt injection (question, item name, document), write requests refused, redaction on the outbound payload, pool leak; automate critical scenario #16 | Groundwork | — |
| 212 | Critical scenario #16: AI assistant: a user of tenant A, through questions, crafted tool arguments or injected text, never gets tenant B's data, never triggers a write, and no patient data reaches the LLM provider (P7, AI_ASSISTANT.md §11) | Critical scenario | — |
| 213 | QA: Platform & administration · P7 (2 features) | QA | — |
| 214 | QA: Purchase · P7 (1 feature) | QA | — |
| 215 | QA: Pharmacy operations (short book, ordering, warehouses) · P7 (1 feature) | QA | — |
| 216 | QA: Wholesale · P7 (1 feature) | QA | — |
| 217 | QA: GST & statutory · P7 (1 feature) | QA | — |
| 218 | QA: Payments & accounting · P7 (1 feature) | QA | — |
| 219 | QA: Full books & finance · P7 (1 feature) | QA | — |
| 220 | QA: Notifications · P7 (1 feature) | QA | — |
| 221 | QA: Home delivery & fleet · P7 (2 features) | QA | — |
| 222 | QA: Integrations (GSP, WhatsApp, SMS, Tally) · P7 (7 features) | QA | — |
| 223 | QA: Mobile (P7) · P7 (6 features) | QA | — |
| 224 | QA: AI assistant (shared LLM, read-only tools; AI_ASSISTANT.md) · P7 (12 features) | QA | — |
