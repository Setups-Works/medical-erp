# Pilot scope

> **Generated** by `scripts/docs/build_pilot_scope.py` from FEATURES.md. Change the rules or the DEFER / FORCE_A lists in that script, never this file. MENO Hub labels these tasks `pilot-a` and `pilot-b`.

Everything else (267 features: Should, Could, P6–P7) is **after the pilot**. Enterprise items (§31) are planned but not needed by a pilot shop.

## Pilot A — one retail pharmacy, offline counter

Goal: a single Tamil Nadu medical shop bills every sale in MENO for 30 days, online and offline, with correct GST, stock and Schedule H1 records, and closes the month without the old software.

**147 features.** Exit criteria: the 15 critical scenarios in TEST_STRATEGY.md pass; all test vectors pass in Java and the offline engine; the CA has confirmed the GST and rounding rules used; the pharmacist has confirmed the Schedule H/H1 workflow; one restore drill done.

| ID | Feature | Ed. | Phase | Area |
|---|---|---|---|---|
| PLT-01 | Tenant sign-up, onboarding wizard (business type, GSTIN, drug licence nos., first branch, financial year) | B | P1 | 1. Platform & administration |
| PLT-02 | Multiple companies per tenant (separate GSTIN, edition per company) | B | P2 | 1. Platform & administration |
| PLT-03 | Multiple branches / warehouses, branch-specific settings, address, licence numbers | B | P2 | 1. Platform & administration |
| PLT-05 | Document number series per branch / type / FY / device (INV, PUR, SR, PR, CN, DN, RCPT…) | B | P2 | 1. Platform & administration |
| PLT-06 | Users, invitations, branch access, deactivate | B | P1 | 1. Platform & administration |
| PLT-07 | Roles & configurable permissions (`module.resource.action`); default roles | B | P1 | 1. Platform & administration |
| PLT-08 | Login with email/phone + password, refresh-token rotation, logout all devices | B | P1 | 1. Platform & administration |
| PLT-12 | Audit log viewer (who changed what, before/after, filter by user/document) | B | P2 | 1. Platform & administration |
| PLT-13 | Tenant settings | B | P2 | 1. Platform & administration |
| PLT-16 | Data import on onboarding (items, opening stock, customers, suppliers, outstanding) from Excel/CSV and common  | B | P3 | 1. Platform & administration |
| CAT-01 | Item master | B | P2 | 2. Catalogue / medicine master |
| CAT-02 | HSN code + GST rate, cess, tax-inclusive flag | B | P2 | 2. Catalogue / medicine master |
| CAT-03 | Schedule classification (H, H1, X, G, OTC, Narcotic/NDPS) and prescription-required flag | B | P2 | 2. Catalogue / medicine master |
| CAT-04 | Barcodes (multiple per item, EAN/GS1, internal barcode generation) | B | P2 | 2. Catalogue / medicine master |
| CAT-05 | Loose / strip sale: sell by tablet with conversion factor, loose MRP | R | P4 | 2. Catalogue / medicine master |
| CAT-08 | Min / max / reorder level per branch | B | P3 | 2. Catalogue / medicine master |
| CAT-14 | Non-pharma items (FMCG, surgical, cosmetics) with their own GST | B | P2 | 2. Catalogue / medicine master |
| PTY-01 | Supplier master | B | P2 | 3. Parties — suppliers, customers, retai |
| PTY-02 | Customer master (retail): name, phone, address, age/gender (optional), allergies note | R | P2 | 3. Parties — suppliers, customers, retai |
| PTY-10 | Party opening balances | B | P3 | 3. Parties — suppliers, customers, retai |
| PRC-01 | Batch-wise MRP, PTR, PTS, purchase rate, selling rate | B | P3 | 4. Pricing, schemes & discounts |
| PRC-04 | Free-quantity schemes (10+1, 20+3) on purchase and sale | B | P3 | 4. Pricing, schemes & discounts |
| PRC-05 | Scheme discount %, trade discount, cash discount ⚠ order of application | B | P3 | 4. Pricing, schemes & discounts |
| PRC-06 | Item/category/party-wise discount rules, max discount per role | B | P4 | 4. Pricing, schemes & discounts |
| PRC-07 | Bill-level discount and round-off | B | P4 | 4. Pricing, schemes & discounts |
| PRC-08 | Never sell above MRP (hard rule) | B | P4 | 4. Pricing, schemes & discounts |
| PUR-01 | Purchase order (manual or from reorder suggestions), email/WhatsApp PO to supplier | B | P3 | 5. Purchase |
| PUR-02 | Purchase invoice entry | B | P3 | 5. Purchase |
| PUR-04 | Distributor CSV / Excel purchase import with item mapping memory (supplier item code → our item) | B | P3 | 5. Purchase |
| PUR-05 | Duplicate supplier invoice detection | B | P3 | 5. Purchase |
| PUR-07 | Purchase posting → batches, stock movements, supplier ledger | B | P3 | 5. Purchase |
| PUR-08 | Purchase cancellation via reversal (no edit after post) | B | P3 | 5. Purchase |
| INV-01 | Batch-wise stock (batch no, mfg date, expiry, MRP, cost) per branch | B | P3 | 6. Inventory |
| INV-02 | Movement ledger for every change (purchase, sale, returns, transfer, adjustment, count) | B | P3 | 6. Inventory |
| INV-03 | FEFO batch suggestion (first expiry first out) at sale | B | P4 | 6. Inventory |
| INV-04 | Expiry block: cannot sell expired; warn within N days (setting) | B | P4 | 6. Inventory |
| INV-05 | Near-expiry dashboard (30/60/90 days) with actions: return to supplier, discount, transfer | B | P3 | 6. Inventory |
| INV-06 | Low stock / out of stock alerts | B | P3 | 6. Inventory |
| INV-07 | Stock adjustment with reason codes (damage, theft, sample, correction) and approval | B | P3 | 6. Inventory |
| INV-10 | Stock valuation (FIFO / weighted average, incl. free goods) | B | P3 | 6. Inventory |
| INV-11 | Opening stock import | B | P3 | 6. Inventory |
| INV-12 | Nightly reconciliation of balances vs ledger, alerts on drift | B | P3 | 6. Inventory |
| POS-01 | Keyboard-first billing screen (F-keys, no mouse needed), barcode-first | R | P4 | 7. Retail POS (`sales` — Retail edition) |
| POS-02 | Fast search by name / generic / composition / barcode, fuzzy, < 150 ms | R | P4 | 7. Retail POS (`sales` — Retail edition) |
| POS-03 | Batch picker with FEFO default, expiry and stock shown | R | P4 | 7. Retail POS (`sales` — Retail edition) |
| POS-04 | Loose quantity sale (tablets from strip) | R | P4 | 7. Retail POS (`sales` — Retail edition) |
| POS-05 | Customer + doctor selection, quick add customer by phone | R | P4 | 7. Retail POS (`sales` — Retail edition) |
| POS-06 | Prescription capture for Schedule H/H1/X (doctor, Rx no., image upload/scan) — blocks sale until captured | R | P4 | 7. Retail POS (`sales` — Retail edition) |
| POS-07 | Multiple payment modes in one bill (cash, UPI, card, credit, wallet), change calculation | R | P4 | 7. Retail POS (`sales` — Retail edition) |
| POS-09 | Hold / recall bills, multiple open bills | R | P4 | 7. Retail POS (`sales` — Retail edition) |
| POS-10 | Thermal (2"/3") and A4/A5 invoice printing, configurable templates | R | P4 | 7. Retail POS (`sales` — Retail edition) |
| POS-12 | Sales return / exchange from POS against invoice | R | P4 | 7. Retail POS (`sales` — Retail edition) |
| RET-01 | Sales return against invoice (batch-aware), stock back only if saleable | B | P4 | 9. Returns, credit & debit notes |
| RET-02 | Credit note (refund, adjust against outstanding, or future bills) | B | P4 | 9. Returns, credit & debit notes |
| RET-03 | Purchase return to supplier with debit note | B | P4 | 9. Returns, credit & debit notes |
| RET-04 | Expiry return / breakage claim to supplier (batch list, claim tracking until credit note received) | B | P4 | 9. Returns, credit & debit notes |
| CMP-01 | Schedule H1 register (auto from sales | R | P4 | 10. Compliance  ⚠ all rules need legal/p |
| CMP-03 | Prescription storage (image), linked to invoice, retention policy | R | P4 | 10. Compliance  ⚠ all rules need legal/p |
| CMP-05 | Drug licence numbers printed on invoices; licence expiry alerts for own branches | B | P4 | 10. Compliance  ⚠ all rules need legal/p |
| GST-01 | Intra/inter-state determination, CGST/SGST/IGST, cess | B | P3 | 12. GST & tax |
| GST-02 | HSN summary on invoices and reports | B | P4 | 12. GST & tax |
| RPT-01 | Owner dashboard | B | P4 | 13. Reports & analytics |
| RPT-02 | Sales register (day/month, bill-wise, item-wise, customer-wise, doctor-wise, user-wise, branch-wise) | B | P4 | 13. Reports & analytics |
| RPT-03 | Purchase register (supplier-wise, item-wise) | B | P3 | 13. Reports & analytics |
| RPT-04 | Stock reports: current stock, batch-wise, valuation, movement history of an item | B | P3 | 13. Reports & analytics |
| RPT-05 | Expiry report, expired stock, near-expiry by supplier (for returns) | B | P3 | 13. Reports & analytics |
| RPT-09 | Schedule H1 / narcotic registers | R | P4 | 13. Reports & analytics |
| NTF-01 | In-app notification centre | B | P4 | 14. Notifications & sharing |
| NTF-02 | Email (invoices, reports, alerts) | B | P4 | 14. Notifications & sharing |
| NTF-05 | Alert rules: low stock, near expiry, credit overdue, licence expiry, device not synced | B | P4 | 14. Notifications & sharing |
| DSK-01 | Windows installer (and macOS), auto-update with staged rollout | B | P4 | 15. Desktop app |
| DSK-03 | Thermal/A4 printing without browser dialog, printer profiles per counter | B | P4 | 15. Desktop app |
| DSK-04 | USB/HID barcode scanner support, weighing scale (later) | B | P4 | 15. Desktop app |
| INT-04 | Distributor file formats (CSV templates per major distributor) | B | P3 | 17. Integrations |
| MKT-01 | Short book / shortage list | B | P3 | 19.1 Pharmacy operations |
| MKT-02 | Salt-wise / composition-wise search with all brands and stock shown side by side | B | P4 | 19.1 Pharmacy operations |
| MKT-05 | Party-wise last rate and last discount shown while billing and purchasing | B | P4 | 19.1 Pharmacy operations |
| DOC-02 | Full purchase cycle | B | P3 | 19.2 Sales & purchase document cycle |
| DOC-04 | Masters for transporters, terms & conditions, narrations, modes of payment, salesman/agent | B | P2 | 19.2 Sales & purchase document cycle |
| ANX-06 | POS register (counter/shift-wise), sales & sales-return registers, compliance register | B | P4 | 19.5 Analytics & intelligence |
| NAV-01 | App sidebar navigation | B | P1 | 20. Navigation, CRM and administration g |
| NAV-03 | Desktop menu bar (File, Edit, View, Go, New, Window, Help) built from the same nav config as the sidebar, edit | B | P4 | 20. Navigation, CRM and administration g |
| NAV-04 | Global keyboard shortcuts | B | P2 | 20. Navigation, CRM and administration g |
| NAV-05 | Transaction-screen keyboard map | B | P3 | 20. Navigation, CRM and administration g |
| AUT-01 | Forgot / reset password (single-use emailed token, 30 min expiry, all sessions revoked on reset); sign in with | B | P1 | 21.1 Authentication & onboarding |
| AUT-02 | Initial configuration wizard | B | P2 | 21.1 Authentication & onboarding |
| DSH-01 | Role-based landing | B | P4 | 21.2 Dashboards (role-based) |
| DSH-02 | Retail dashboard: counter sales, bills today, collections by mode, returns, top items | R | P4 | 21.2 Dashboards (role-based) |
| DSH-04 | Inventory dashboard | B | P3 | 21.2 Dashboards (role-based) |
| DSH-08 | Dashboard widget library | B | P4 | 21.2 Dashboards (role-based) |
| CAT-15 | Generic / salt master | B | P2 | 21.3 Masters |
| CAT-16 | Brand and manufacturer masters (marketer vs manufacturer, contact, GSTIN) | B | P2 | 21.3 Masters |
| CAT-17 | Unit master + multi-level unit conversion (box → strip → tablet) used by purchase, stock and POS | B | P2 | 21.3 Masters |
| CAT-20 | Storage instructions and medicine detail page (complete profile | B | P2 | 21.3 Masters |
| PUR-13 | PO tracking: pending, partially received, closed; pending purchases list | B | P3 | 21.4 Purchase, inventory and returns |
| INV-18 | FEFO override with an authorised reason (recorded in the movement and audit log) | B | P4 | 21.4 Purchase, inventory and returns |
| RET-08 | Return inspection: decide saleable / damaged / expired per line before stock re-entry | B | P4 | 21.4 Purchase, inventory and returns |
| POS-20 | Invoice list and details: search, filter, reprint, share, cancel through credit note | B | P4 | 21.5 Sales, POS and wholesale |
| POS-21 | Discount approval at the counter: manager PIN override above the role limit, logged | R | P4 | 21.5 Sales, POS and wholesale |
| POS-22 | Search by manufacturer and by salt in POS search (in addition to name/barcode) | R | P4 | 21.5 Sales, POS and wholesale |
| GST-09 | GST configuration | B | P2 | 21.6 Finance and GST |
| GST-11 | Invoice GST validation before posting (GSTIN format/state, place of supply, HSN, rate, totals) | B | P3 | 21.6 Finance and GST |
| CMP-09 | Restricted-medicine alerts at billing: schedule warnings and required steps | R | P4 | 21.7 Compliance and CRM |
| RPT-13 | Reports centre: catalogue, favourites, saved filters, recent | B | P4 | 21.8 Reports and administration |
| RPT-14 | Batch-wise sales and traceability: who received batch X (recalls) | B | P4 | 21.8 Reports and administration |
| RPT-16 | Report framework standard | B | P3 | 21.8 Reports and administration |
| ADM-02 | Payment settings: payment modes, UPI VPA, card terminals, bank accounts | B | P4 | 21.8 Reports and administration |
| ADM-03 | Printer and print-template settings (per branch / counter, web and desktop) | B | P4 | 21.8 Reports and administration |
| ADM-06 | Import centre: all imports as jobs with status, error rows download, re-run | B | P3 | 21.8 Reports and administration |
| LIC-03 | Activate a license key (business owner) in onboarding (`/onboarding/license`) or Settings → License | B | P5 | 23. Licensing: license keys, plans and e |
| PTY-16 | Party identity fields | B | P2 | 24. Master field completeness (supplier, |
| PTY-17 | Multiple contacts per party | B | P2 | 24. Master field completeness (supplier, |
| PTY-18 | Multiple addresses per party (billing, shipping, godown) with PIN code auto-fill of state, district and city;  | B | P2 | 24. Master field completeness (supplier, |
| PTY-19 | Party licences as rows | B | P2 | 24. Master field completeness (supplier, |
| PTY-20 | Multiple bank accounts per party with IFSC validation and auto-fill, UPI ID, masked and encrypted account no.; | B | P3 | 24. Master field completeness (supplier, |
| PTY-24 | Party GST fields | B | P2 | 24. Master field completeness (supplier, |
| CAT-25 | Product identity and control fields | B | P2 | 24. Master field completeness (supplier, |
| PRC-12 | Product price defaults | B | P3 | 24. Master field completeness (supplier, |
| PLT-22 | Reference data | B | P2 | 24. Master field completeness (supplier, |
| PLT-24 | Attachments on any document or master (supplier bill, Rx, licence scan, delivery proof) | B | P3 | 25. Transaction logic and pharmacy contr |
| INV-20 | Batch block / recall | B | P4 | 25. Transaction logic and pharmacy contr |
| POS-27 | Reprint marking: reprints show "Duplicate copy" with reprint count, user and time audited | B | P4 | 25. Transaction logic and pharmacy contr |
| PTY-32 | Doctor master fields | R | P4 | 25. Transaction logic and pharmacy contr |
| DOC-07 | Invoice print content standard | B | P4 | 26. Invoice completeness (distributor bi |
| POS-28 | POS line columns | R | P4 | 26. Invoice completeness (distributor bi |
| PRC-14 | Totals breakdown on every invoice | B | P4 | 26. Invoice completeness (distributor bi |
| CAT-28 | Discontinued items | B | P3 | 27. Competitor-parity additions (Marg ER |
| DOC-08 | Print formats | B | P4 | 27. Competitor-parity additions (Marg ER |
| GST-15 | GST rate change roll-over | B | P3 | 27. Competitor-parity additions (Marg ER |
| AUT-04 | Sign-up and verification | B | P1 | 28. Onboarding and account setup (24-11- |
| AUT-05 | Business profile step | B | P2 | 28. Onboarding and account setup (24-11- |
| AUT-06 | GSTIN-first company step | B | P2 | 28. Onboarding and account setup (24-11- |
| AUT-07 | Licences and pharmacist step | B | P2 | 28. Onboarding and account setup (24-11- |
| AUT-08 | Invoice look set-up with live preview | B | P2 | 28. Onboarding and account setup (24-11- |
| AUT-10 | Data step | B | P3 | 28. Onboarding and account setup (24-11- |
| AUT-13 | Go-live | B | P3 | 28. Onboarding and account setup (24-11- |
| AUT-15 | Resume and progress | B | P2 | 28. Onboarding and account setup (24-11- |
| PLT-32 | Excel import templates done properly | B | P3 | 30. Ideas from the Ekagraha ERP codebase |
| PLT-39 | Feature flags and release channels | B | P4 | 31. Enterprise readiness (24-11-2026) |
| PLT-43 | Performance budgets in CI | B | P4 | 31. Enterprise readiness (24-11-2026) |
| SEC-01 | Tamper-evident records | B | P4 | 32. Security (`security`, 24-11-2026) |
| SEC-04 | Secrets management | B | P1 | 32. Security (`security`, 24-11-2026) |
| SEC-10 | API and edge protection | B | P4 | 32. Security (`security`, 24-11-2026) |
| SEC-14 | Secure SDLC gates | B | P1 | 32. Security (`security`, 24-11-2026) |
| SEC-17 | Patient-data vault | R | P4 | 32. Security (`security`, 24-11-2026) |
| POS-30 | Walk-in customer details | R | P4 | 33. Walk-in and counter customers (24-11 |
| POS-31 | Add and edit a customer from POS | R | P4 | 33. Walk-in and counter customers (24-11 |

## Pilot B — wholesale and finance

Goal: one distributor runs orders, credit billing, e-invoice, collections and books in MENO; the retail pilot keeps running.

**75 features.**

| ID | Feature | Ed. | Phase | Area |
|---|---|---|---|---|
| PLT-04 | Financial year management, year-end closing and carry-forward of balances and stock | B | P5 | 1. Platform & administration |
| PLT-11 | Session & device management (register/revoke counter PCs) | B | P5 | 1. Platform & administration |
| PTY-03 | Retailer master (wholesale) | W | P2 | 3. Parties — suppliers, customers, retai |
| PTY-06 | Party ledger, outstanding, ageing | B | P5 | 3. Parties — suppliers, customers, retai |
| PTY-07 | Credit limit & credit days enforcement with override approval | B | P5 | 3. Parties — suppliers, customers, retai |
| PRC-02 | Price lists / rate levels (A/B/C retailers, institutions, hospitals) | W | P5 | 4. Pricing, schemes & discounts |
| PUR-11 | Reorder suggestions (min/max, sales velocity, lead time) | B | P5 | 5. Purchase |
| INV-08 | Branch-to-branch stock transfer (dispatch → in transit → receive) with GST delivery challan / inter-state invo | B | P5 | 6. Inventory |
| POS-14 | Shift open/close, cash denomination count, day-end report per counter | R | P5 | 7. Retail POS (`sales` — Retail edition) |
| POS-15 | Offline billing on desktop with sync (see OFFLINE_SYNC.md) | R | P5 | 7. Retail POS (`sales` — Retail edition) |
| WHS-01 | Sales order entry (phone/WhatsApp orders) with price list, schemes, credit check | W | P5 | 8. Wholesale sales (`sales` — Wholesale  |
| WHS-02 | Order → pick list → invoice (partial fulfilment, backorders) | W | P5 | 8. Wholesale sales (`sales` — Wholesale  |
| WHS-03 | Bulk GST tax invoice (A4), with DL nos. of both parties printed | W | P5 | 8. Wholesale sales (`sales` — Wholesale  |
| WHS-04 | Credit sales with due dates, credit limit enforcement | W | P5 | 8. Wholesale sales (`sales` — Wholesale  |
| WHS-06 | E-invoice (IRN + QR) generation via IRP/GSP ⚠ turnover threshold | W | P5 | 8. Wholesale sales (`sales` — Wholesale  |
| RET-05 | Wholesale: accept expiry/breakage returns from retailers per policy | W | P5 | 9. Returns, credit & debit notes |
| CMP-07 | Data privacy: patient data minimisation, consent, deletion requests (DPDP Act) | B | P5 | 10. Compliance  ⚠ all rules need legal/p |
| ACC-01 | Customer receipts with allocation to invoices (FIFO or manual), on-account | B | P5 | 11. Payments & accounting |
| ACC-02 | Supplier payments with allocation, cheque details, PDC tracking | B | P5 | 11. Payments & accounting |
| ACC-03 | Chart of accounts with default ledgers (sales, purchase, GST input/output, cash, bank, round-off) | B | P5 | 11. Payments & accounting |
| ACC-04 | Auto-posting of vouchers from documents (event-driven, double-entry) | B | P5 | 11. Payments & accounting |
| ACC-05 | Expenses entry (rent, salary, electricity) | B | P5 | 11. Payments & accounting |
| ACC-06 | Cash book, bank book, day book, ledger statements | B | P5 | 11. Payments & accounting |
| ACC-09 | Outstanding & ageing (receivable/payable), payment reminders | B | P5 | 11. Payments & accounting |
| GST-06 | E-invoice and e-way bill (see WHS-06/07) | W | P5 | 12. GST & tax |
| RPT-06 | Profit reports (bill-wise, item-wise, category-wise) on landed cost | B | P5 | 13. Reports & analytics |
| RPT-07 | Outstanding & ageing reports | B | P5 | 13. Reports & analytics |
| DSK-02 | Offline SQLite store, sync engine, status bar indicator | B | P5 | 15. Desktop app |
| DSK-05 | Device registration & revoke, local data encryption | B | P5 | 15. Desktop app |
| INT-01 | GST IRP / GSP for e-invoice & e-way bill ⚠ provider choice | B | P5 | 17. Integrations |
| DOC-01 | Full sales cycle | W | P5 | 19.2 Sales & purchase document cycle |
| ACX-01 | Journal, contra (cash↔bank), receipt and payment vouchers with narration templates | B | P5 | 19.3 Accounting (full books) |
| ACX-02 | Income & expense vouchers and an income/expense register | B | P5 | 19.3 Accounting (full books) |
| ACX-03 | Ledger groups (chart of accounts tree), opening balances, set-up ledgers wizard | B | P5 | 19.3 Accounting (full books) |
| ACX-11 | Onboarding wizard for books: chart of accounts, bank accounts, GST registration, FY | B | P5 | 19.3 Accounting (full books) |
| DSH-03 | Wholesale dashboard | W | P5 | 21.2 Dashboards (role-based) |
| DSH-05 | Financial dashboard: cash, bank, receivables, payables, expenses, GST liability | B | P5 | 21.2 Dashboards (role-based) |
| PTY-13 | Customer and supplier account statements (date range, PDF, email/WhatsApp) | B | P5 | 21.3 Masters |
| ACX-13 | Finance dashboard and general ledger page (drill down from any balance to vouchers to documents) | B | P5 | 21.6 Finance and GST |
| ACX-14 | Ledger group master | B | P5 | 21.6 Finance and GST |
| ACX-15 | Default chart of accounts seeded on company set-up (CHART_OF_ACCOUNTS.md | B | P5 | 21.6 Finance and GST |
| ACX-16 | Party ledgers created automatically | B | P5 | 21.6 Finance and GST |
| ACX-17 | Posting rules | B | P5 | 21.6 Finance and GST |
| ADM-05 | Login history and active sessions (with sign-out of other sessions) | B | P5 | 21.8 Reports and administration |
| LIC-01 | Plan catalogue (super admin) | B | P5 | 23. Licensing: license keys, plans and e |
| LIC-02 | Issue a license key (super admin) | B | P5 | 23. Licensing: license keys, plans and e |
| LIC-04 | Signed license certificate | B | P5 | 23. Licensing: license keys, plans and e |
| LIC-05 | Entitlement enforcement | B | P5 | 23. Licensing: license keys, plans and e |
| LIC-06 | Expiry lifecycle | B | P5 | 23. Licensing: license keys, plans and e |
| LIC-07 | Desktop offline license | R | P5 | 23. Licensing: license keys, plans and e |
| LIC-08 | Super-admin license console (`/platform/licenses`) | B | P5 | 23. Licensing: license keys, plans and e |
| PLT-23 | Period lock | B | P5 | 25. Transaction logic and pharmacy contr |
| ACC-14 | Cheque bounce | B | P5 | 25. Transaction logic and pharmacy contr |
| WHS-15 | Combined distributor bill | W | P5 | 26. Invoice completeness (distributor bi |
| WHS-16 | Dispatch details on invoices | W | P5 | 26. Invoice completeness (distributor bi |
| DOC-06 | Additional charges on sales and purchase invoices (freight, insurance, packing, other) | B | P5 | 26. Invoice completeness (distributor bi |
| PLT-26 | Migration importers for exports of popular software (Marg, Tally, Busy, Vyapar, GoFrugal) | B | P5 | 27. Competitor-parity additions (Marg ER |
| WHS-17 | Stock & sales statement (secondary sales) per manufacturer / company | W | P5 | 27. Competitor-parity additions (Marg ER |
| WHS-19 | Dispatch checking (item checker) | W | P5 | 27. Competitor-parity additions (Marg ER |
| RPT-17 | Outstanding by area, route, salesman and as-on-date / age-wise for receivables and payables, shareable as PDF  | B | P5 | 27. Competitor-parity additions (Marg ER |
| RPT-18 | Exception (bill audit) report | B | P5 | 27. Competitor-parity additions (Marg ER |
| PLT-29 | Head-office control for chains | B | P5 | 29. Five-product parity: Marg, Vyapar, e |
| PUR-20 | Chain indents | B | P5 | 29. Five-product parity: Marg, Vyapar, e |
| PTY-34 | Credit rules beyond amount | B | P5 | 29. Five-product parity: Marg, Vyapar, e |
| PRC-15 | Offer engine | B | P5 | 29. Five-product parity: Marg, Vyapar, e |
| PLT-35 | Tenant security policies | B | P5 | 31. Enterprise readiness (24-11-2026) |
| PLT-36 | Field-level encryption and masking for PAN, bank accounts and patient health data; masked in lists and exports | B | P5 | 31. Enterprise readiness (24-11-2026) |
| PLT-37 | Data residency and exit | B | P5 | 31. Enterprise readiness (24-11-2026) |
| ADM-19 | Maker-checker for sensitive settings | B | P5 | 31. Enterprise readiness (24-11-2026) |
| SEC-02 | Device-signed offline bills | R | P5 | 32. Security (`security`, 24-11-2026) |
| SEC-05 | Insider-fraud detection | B | P5 | 32. Security (`security`, 24-11-2026) |
| SEC-06 | Privileged access management | B | P5 | 32. Security (`security`, 24-11-2026) |
| SEC-07 | Security monitoring | B | P5 | 32. Security (`security`, 24-11-2026) |
| SEC-09 | Desktop hardening | R | P5 | 32. Security (`security`, 24-11-2026) |
| SEC-15 | Ransomware-resistant backups | B | P5 | 32. Security (`security`, 24-11-2026) |

## Pulled into Pilot A

| ID | Why |
|---|---|
| LIC-03 | the shop must be able to activate its license |
