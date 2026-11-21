# MENO — complete feature catalogue

> The full product scope for a medical retail + wholesale ERP. Each feature has an ID (used in issues and commits), the edition it applies to, the phase it is planned for, and a priority.
>
> **Edition:** R = Retail · W = Wholesale · B = Both · **Phase:** see [PHASES.md](../planning/PHASES.md) (P0–P7) · **Priority:** M = Must (MVP) · S = Should · C = Could (later)
>
> Prakalya owns this file. Every feature becomes an epic in GitHub with user stories in `docs/business-requirements/user-stories/`. ⚠ = rule needs domain/legal confirmation before build.

---

## 1. Platform & administration (`tenancy`, `identity`, `auth`, `subscription`, `audit`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PLT-01 | Tenant sign-up, onboarding wizard (business type, GSTIN, drug licence nos., first branch, financial year) | B | P1 | M |
| PLT-02 | Multiple companies per tenant (separate GSTIN, edition per company) | B | P2 | M |
| PLT-03 | Multiple branches / warehouses, branch-specific settings, address, licence numbers | B | P2 | M |
| PLT-04 | Financial year management, year-end closing and carry-forward of balances and stock | B | P5 | M |
| PLT-05 | Document number series per branch / type / FY / device (INV, PUR, SR, PR, CN, DN, RCPT…) | B | P2 | M |
| PLT-06 | Users, invitations, branch access, deactivate | B | P1 | M |
| PLT-07 | Roles & configurable permissions (`module.resource.action`); default roles: Super Admin, Business Owner, Branch Manager, Pharmacist, Billing Operator, Inventory Manager, Accountant, Wholesale Manager, Sales Representative, Auditor, Delivery (see ROLES_AND_DASHBOARDS.md) | B | P1 | M |
| PLT-08 | Login with email/phone + password, refresh-token rotation, logout all devices | B | P1 | M |
| PLT-09 | Two-factor authentication (TOTP) for admins | B | P5 | S |
| PLT-10 | Counter PIN login on desktop (fast user switch at the counter) | B | P5 | S |
| PLT-11 | Session & device management (register/revoke counter PCs) | B | P5 | M |
| PLT-12 | Audit log viewer (who changed what, before/after, filter by user/document) | B | P2 | M |
| PLT-13 | Tenant settings: rounding, negative stock allowed, MRP-inclusive billing, discount limits per role, expiry block days, print formats | B | P2 | M |
| PLT-14 | Subscription plans, edition gating, usage limits (users, branches, invoices/month), trial | B | P6 | S |
| PLT-15 | Platform super-admin console (tenants, plans, health, support impersonation with consent) | B | P6 | S |
| PLT-16 | Data import on onboarding (items, opening stock, customers, suppliers, outstanding) from Excel/CSV and common pharmacy software exports | B | P3 | M |
| PLT-17 | Data export (full tenant export for portability) | B | P6 | S |
| PLT-18 | Multi-language UI (English first; Tamil, Hindi later) | B | P7 | C |
| PLT-19 | Approval workflows (discount above limit, credit limit override, stock adjustment, purchase above value) | B | P5 | S |

## 2. Catalogue / medicine master (`catalog`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| CAT-01 | Item master: name, brand, generic name, manufacturer, marketed by, composition (salts + strength), dosage form, pack (e.g. 1×10 strip), units (pack/loose) | B | P2 | M |
| CAT-02 | HSN code + GST rate, cess, tax-inclusive flag | B | P2 | M |
| CAT-03 | Schedule classification (H, H1, X, G, OTC, Narcotic/NDPS) and prescription-required flag | B | P2 | M |
| CAT-04 | Barcodes (multiple per item, EAN/GS1, internal barcode generation) | B | P2 | M |
| CAT-05 | Loose / strip sale: sell by tablet with conversion factor, loose MRP | R | P4 | M |
| CAT-06 | Categories, therapeutic class, storage condition (cold-chain 2–8 °C, below 25 °C) | B | P2 | S |
| CAT-07 | Rack / shelf / bin location per branch | B | P3 | S |
| CAT-08 | Min / max / reorder level per branch | B | P3 | M |
| CAT-09 | Generic substitutes (same composition + strength) shown at POS when out of stock | B | P4 | S |
| CAT-10 | Global medicine database seed (common Indian brands) to speed up item creation ⚠ licensing of data source | B | P3 | S |
| CAT-11 | Item merge (duplicate cleanup) with history preserved | B | P3 | S |
| CAT-12 | Banned / recalled drug list with blocking at sale and purchase ⚠ CDSCO list maintenance | B | P4 | S |
| CAT-13 | Item images | B | P6 | C |
| CAT-14 | Non-pharma items (FMCG, surgical, cosmetics) with their own GST | B | P2 | M |

## 3. Parties — suppliers, customers, retailers, doctors (`party`, `compliance`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PTY-01 | Supplier master: GSTIN (validated format + state), drug licence nos., contact, bank, credit days | B | P2 | M |
| PTY-02 | Customer master (retail): name, phone, address, age/gender (optional), allergies note | R | P2 | M |
| PTY-03 | Retailer master (wholesale): GSTIN, DL nos. + expiry, credit limit, credit days, price list, route, salesman | W | P2 | M |
| PTY-04 | Drug licence expiry tracking & block sale to retailers with expired licence | W | P5 | S |
| PTY-05 | Doctor master (name, registration no., clinic) for prescriptions and doctor-wise reports | R | P4 | S |
| PTY-06 | Party ledger, outstanding, ageing | B | P5 | M |
| PTY-07 | Credit limit & credit days enforcement with override approval | B | P5 | M |
| PTY-08 | Customer loyalty points / membership discount | R | P6 | C |
| PTY-09 | Patient refill reminders (chronic medicines) via WhatsApp/SMS | R | P6 | S |
| PTY-10 | Party opening balances | B | P3 | M |

## 4. Pricing, schemes & discounts (`pricing`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PRC-01 | Batch-wise MRP, PTR, PTS, purchase rate, selling rate | B | P3 | M |
| PRC-02 | Price lists / rate levels (A/B/C retailers, institutions, hospitals) | W | P5 | M |
| PRC-03 | Margin-based selling price rules (e.g. PTR = MRP − 20 %) | W | P5 | S |
| PRC-04 | Free-quantity schemes (10+1, 20+3) on purchase and sale | B | P3 | M |
| PRC-05 | Scheme discount %, trade discount, cash discount ⚠ order of application | B | P3 | M |
| PRC-06 | Item/category/party-wise discount rules, max discount per role | B | P4 | M |
| PRC-07 | Bill-level discount and round-off | B | P4 | M |
| PRC-08 | Never sell above MRP (hard rule) | B | P4 | M |
| PRC-09 | Price change history | B | P3 | S |

## 5. Purchase (`purchase`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PUR-01 | Purchase order (manual or from reorder suggestions), email/WhatsApp PO to supplier | B | P3 | M |
| PUR-02 | Purchase invoice entry: supplier inv no/date, lines with batch, expiry, MRP, PTR, qty, free qty, discounts, GST | B | P3 | M |
| PUR-03 | Goods receipt (GRN) with short/excess/damaged quantities | B | P3 | S |
| PUR-04 | Distributor CSV / Excel purchase import with item mapping memory (supplier item code → our item) | B | P3 | M |
| PUR-05 | Duplicate supplier invoice detection | B | P3 | M |
| PUR-06 | Landed cost (freight, other charges) allocation | B | P5 | S |
| PUR-07 | Purchase posting → batches, stock movements, supplier ledger | B | P3 | M |
| PUR-08 | Purchase cancellation via reversal (no edit after post) | B | P3 | M |
| PUR-09 | Rate difference / price change alerts vs last purchase | B | P5 | S |
| PUR-10 | Scan supplier invoice (image/PDF) attach to purchase; OCR later | B | P6 | C |
| PUR-11 | Reorder suggestions (min/max, sales velocity, lead time) | B | P5 | M |

## 6. Inventory (`inventory`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| INV-01 | Batch-wise stock (batch no, mfg date, expiry, MRP, cost) per branch | B | P3 | M |
| INV-02 | Movement ledger for every change (purchase, sale, returns, transfer, adjustment, count) | B | P3 | M |
| INV-03 | FEFO batch suggestion (first expiry first out) at sale | B | P4 | M |
| INV-04 | Expiry block: cannot sell expired; warn within N days (setting) | B | P4 | M |
| INV-05 | Near-expiry dashboard (30/60/90 days) with actions: return to supplier, discount, transfer | B | P3 | M |
| INV-06 | Low stock / out of stock alerts | B | P3 | M |
| INV-07 | Stock adjustment with reason codes (damage, theft, sample, correction) and approval | B | P3 | M |
| INV-08 | Branch-to-branch stock transfer (dispatch → in transit → receive) with GST delivery challan / inter-state invoice ⚠ | B | P5 | M |
| INV-09 | Physical stock count / cycle count with variance posting | B | P5 | S |
| INV-10 | Stock valuation (FIFO / weighted average, incl. free goods) | B | P3 | M |
| INV-11 | Opening stock import | B | P3 | M |
| INV-12 | Nightly reconciliation of balances vs ledger, alerts on drift | B | P3 | M |
| INV-13 | Dead / slow-moving stock report | B | P5 | S |
| INV-14 | Cold-chain items flag and storage reports | B | P6 | C |
| INV-15 | Barcode label printing for loose/repacked items | B | P5 | S |

## 7. Retail POS (`sales` — Retail edition)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| POS-01 | Keyboard-first billing screen (F-keys, no mouse needed), barcode-first | R | P4 | M |
| POS-02 | Fast search by name / generic / composition / barcode, fuzzy, < 150 ms | R | P4 | M |
| POS-03 | Batch picker with FEFO default, expiry and stock shown | R | P4 | M |
| POS-04 | Loose quantity sale (tablets from strip) | R | P4 | M |
| POS-05 | Customer + doctor selection, quick add customer by phone | R | P4 | M |
| POS-06 | Prescription capture for Schedule H/H1/X (doctor, Rx no., image upload/scan) — blocks sale until captured | R | P4 | M |
| POS-07 | Multiple payment modes in one bill (cash, UPI, card, credit, wallet), change calculation | R | P4 | M |
| POS-08 | UPI QR on screen / on bill (static VPA QR with amount) | R | P5 | S |
| POS-09 | Hold / recall bills, multiple open bills | R | P4 | M |
| POS-10 | Thermal (2"/3") and A4/A5 invoice printing, configurable templates | R | P4 | M |
| POS-11 | WhatsApp / SMS invoice share (PDF link) | R | P4 | S |
| POS-12 | Sales return / exchange from POS against invoice | R | P4 | M |
| POS-13 | Cash drawer open, customer display (pole) | R | P5 | C |
| POS-14 | Shift open/close, cash denomination count, day-end report per counter | R | P5 | M |
| POS-15 | Offline billing on desktop with sync (see OFFLINE_SYNC.md) | R | P5 | M |
| POS-16 | Substitute suggestion when item out of stock | R | P4 | S |
| POS-17 | Repeat last bill for a customer (chronic refill) | R | P5 | S |
| POS-18 | Home delivery orders with delivery status | R | P6 | C |
| POS-19 | Estimate / quotation convertible to bill | B | P5 | S |

## 8. Wholesale sales (`sales` — Wholesale edition)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| WHS-01 | Sales order entry (phone/WhatsApp orders) with price list, schemes, credit check | W | P5 | M |
| WHS-02 | Order → pick list → invoice (partial fulfilment, backorders) | W | P5 | M |
| WHS-03 | Bulk GST tax invoice (A4), with DL nos. of both parties printed | W | P5 | M |
| WHS-04 | Credit sales with due dates, credit limit enforcement | W | P5 | M |
| WHS-05 | Delivery challan, dispatch, delivery tracking (packed, dispatched, delivered) | W | P5 | S |
| WHS-06 | E-invoice (IRN + QR) generation via IRP/GSP ⚠ turnover threshold | W | P5 | M |
| WHS-07 | E-way bill generation for consignments above threshold ⚠ | W | P5 | S |
| WHS-08 | Retailer-wise / item-wise scheme overrides | W | P5 | S |
| WHS-09 | Salesman assignment and commission report | W | P5 | S |
| WHS-10 | Retailer self-ordering portal (web) | W | P7 | C |

## 9. Returns, credit & debit notes (`returns`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| RET-01 | Sales return against invoice (batch-aware), stock back only if saleable | B | P4 | M |
| RET-02 | Credit note (refund, adjust against outstanding, or future bills) | B | P4 | M |
| RET-03 | Purchase return to supplier with debit note | B | P4 | M |
| RET-04 | Expiry return / breakage claim to supplier (batch list, claim tracking until credit note received) | B | P4 | M |
| RET-05 | Wholesale: accept expiry/breakage returns from retailers per policy | W | P5 | M |
| RET-06 | Return reasons & approval limits | B | P4 | S |

## 10. Compliance (`compliance`) ⚠ all rules need legal/pharmacist review

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| CMP-01 | Schedule H1 register (auto from sales: patient, doctor, item, qty, date) — printable/exportable | R | P4 | M |
| CMP-02 | Schedule X / narcotic register with stricter controls (duplicate Rx retention) | R | P6 | S |
| CMP-03 | Prescription storage (image), linked to invoice, retention policy | R | P4 | M |
| CMP-04 | Pharmacist on duty recorded on each bill (registration no.) | R | P4 | S |
| CMP-05 | Drug licence numbers printed on invoices; licence expiry alerts for own branches | B | P4 | M |
| CMP-06 | Banned/recalled drug block (see CAT-12) | B | P4 | S |
| CMP-07 | Data privacy: patient data minimisation, consent, deletion requests (DPDP Act) | B | P5 | M |

## 11. Payments & accounting (`payment`, `accounting`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| ACC-01 | Customer receipts with allocation to invoices (FIFO or manual), on-account | B | P5 | M |
| ACC-02 | Supplier payments with allocation, cheque details, PDC tracking | B | P5 | M |
| ACC-03 | Chart of accounts with default ledgers (sales, purchase, GST input/output, cash, bank, round-off) | B | P5 | M |
| ACC-04 | Auto-posting of vouchers from documents (event-driven, double-entry) | B | P5 | M |
| ACC-05 | Expenses entry (rent, salary, electricity) | B | P5 | M |
| ACC-06 | Cash book, bank book, day book, ledger statements | B | P5 | M |
| ACC-07 | Bank reconciliation (statement import) | B | P6 | S |
| ACC-08 | Trial balance, P&L, balance sheet | B | P6 | S |
| ACC-09 | Outstanding & ageing (receivable/payable), payment reminders | B | P5 | M |
| ACC-10 | Tally export (XML vouchers + masters) | B | P6 | S |
| ACC-11 | Payment gateway / UPI collect links for wholesale dues | W | P7 | C |

## 12. GST & tax (`taxation`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| GST-01 | Intra/inter-state determination, CGST/SGST/IGST, cess | B | P3 | M |
| GST-02 | HSN summary on invoices and reports | B | P4 | M |
| GST-03 | GSTR-1 data export (B2B, B2C large/small, CDNR, HSN summary) in portal JSON/Excel format | B | P6 | M |
| GST-04 | GSTR-3B summary | B | P6 | M |
| GST-05 | GSTR-2B reconciliation with purchases (import 2B JSON) | B | P6 | S |
| GST-06 | E-invoice and e-way bill (see WHS-06/07) | W | P5 | M |
| GST-07 | Composition-scheme dealer support (bill of supply) ⚠ | R | P6 | S |
| GST-08 | TCS/TDS fields where applicable ⚠ | B | P7 | C |

## 13. Reports & analytics (`reporting`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| RPT-01 | Owner dashboard: today's sales, collections, purchases, margin, low stock, near expiry, outstanding | B | P4 | M |
| RPT-02 | Sales register (day/month, bill-wise, item-wise, customer-wise, doctor-wise, user-wise, branch-wise) | B | P4 | M |
| RPT-03 | Purchase register (supplier-wise, item-wise) | B | P3 | M |
| RPT-04 | Stock reports: current stock, batch-wise, valuation, movement history of an item | B | P3 | M |
| RPT-05 | Expiry report, expired stock, near-expiry by supplier (for returns) | B | P3 | M |
| RPT-06 | Profit reports (bill-wise, item-wise, category-wise) on landed cost | B | P5 | M |
| RPT-07 | Outstanding & ageing reports | B | P5 | M |
| RPT-08 | GST reports (see §12) | B | P6 | M |
| RPT-09 | Schedule H1 / narcotic registers | R | P4 | M |
| RPT-10 | Branch comparison | B | P6 | S |
| RPT-11 | Export every report to Excel/PDF, schedule by email | B | P5 | S |
| RPT-12 | Sales forecasting & smart reorder (ML) | B | P7 | C |

## 14. Notifications & sharing (`notification`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| NTF-01 | In-app notification centre | B | P4 | M |
| NTF-02 | Email (invoices, reports, alerts) | B | P4 | M |
| NTF-03 | WhatsApp Business API: invoice share, payment reminders, refill reminders ⚠ template approval & cost | B | P5 | S |
| NTF-04 | SMS (DLT-registered templates) ⚠ | B | P5 | S |
| NTF-05 | Alert rules: low stock, near expiry, credit overdue, licence expiry, device not synced | B | P4 | M |

## 15. Desktop app (`apps/desktop`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| DSK-01 | Windows installer (and macOS), auto-update with staged rollout | B | P4 | M |
| DSK-02 | Offline SQLite store, sync engine, status bar indicator | B | P5 | M |
| DSK-03 | Thermal/A4 printing without browser dialog, printer profiles per counter | B | P4 | M |
| DSK-04 | USB/HID barcode scanner support, weighing scale (later) | B | P4 | M |
| DSK-05 | Device registration & revoke, local data encryption | B | P5 | M |
| DSK-06 | Local backup export of offline data (emergency) | B | P5 | S |

## 16. Mobile & field sales (`apps/mobile`, `fieldsales`) — deferred

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| MOB-01 | Owner app: dashboard, approvals, alerts | B | P7 | S |
| MOB-02 | Salesman app: routes/beats, retailer visit, take order offline, schemes, credit status | W | P7 | S |
| MOB-03 | Collection app: record payments against invoices, receipt share | W | P7 | S |
| MOB-04 | Delivery app: delivery proof (photo/signature), returns pickup | W | P7 | C |
| MOB-05 | Camera barcode scan for stock count | B | P7 | C |

## 17. Integrations

| ID | Feature | Ph. | Pri. |
|---|---|---|---|
| INT-01 | GST IRP / GSP for e-invoice & e-way bill ⚠ provider choice | P5 | M |
| INT-02 | WhatsApp Business provider, SMS provider | P5 | S |
| INT-03 | Tally export | P6 | S |
| INT-04 | Distributor file formats (CSV templates per major distributor) | P3 | M |
| INT-05 | Public API + webhooks for partners | P7 | C |
| INT-06 | Online pharmacy / e-commerce order intake | P7 | C |

## 18. Non-functional features (everyone)

Backups with tested restore · monitoring and alerts · audit trail · rate limiting · RBAC everywhere · accessibility (keyboard, contrast) · Light/Dark themes · printable layouts · < 2 s page loads on a 4 GB counter PC · data export for the tenant · documented SLAs.

## 19. Market-parity features (from competitor and accounting-product research)

Features that established Indian pharmacy ERPs and GST accounting products offer and that customers will expect when they switch to MENO.

### 19.1 Pharmacy operations

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| MKT-01 | **Short book / shortage list**: items marked at the counter when out of stock or low; one click turns it into a PO per supplier | B | P3 | M |
| MKT-02 | Salt-wise / composition-wise search with all brands and stock shown side by side | B | P4 | M |
| MKT-03 | **Retailer → distributor online ordering** (ERP-to-ERP): a retailer on MENO sends a PO that arrives as a sales order at a distributor on MENO, with live stock, rates and schemes; item codes, HSN and GST mapped automatically | B | P6 | S |
| MKT-04 | Dump / broken / damaged stock bucket, kept separate from saleable stock, feeding expiry and breakage claims | B | P4 | S |
| MKT-05 | Party-wise last rate and last discount shown while billing and purchasing | B | P4 | M |
| MKT-06 | Multi-warehouse within a branch (godown, cold room, display) with location-level stock | B | P5 | S |
| MKT-07 | Expiry-based promotions (auto-suggested discount on near-expiry batches) | R | P6 | C |
| MKT-08 | Customisable keyboard shortcuts per user (`/me/shortcuts`): change any key from KEYBOARD_SHORTCUTS.md, conflict check, reset to default, synced to desktop | B | P5 | S |
| MKT-09 | AI-assisted item onboarding: create items and a draft purchase from a photo or PDF of a supplier bill | B | P7 | C |
| MKT-10 | Consolidated multi-branch dashboard for chains | B | P6 | S |

### 19.2 Sales & purchase document cycle

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| DOC-01 | Full sales cycle: Quotation → Sales order → **Delivery challan** → Invoice → Return → Credit note (convert any step to the next, partial conversion supported) | W | P5 | M |
| DOC-02 | Full purchase cycle: Purchase order → **Purchase challan** (goods without bill) → Purchase bill → Return → Debit note | B | P3 | M |
| DOC-03 | Commission vouchers for salesmen / agents (sales and purchase side) | W | P6 | S |
| DOC-04 | Masters for transporters, terms & conditions, narrations, modes of payment, salesman/agent | B | P2 | M |
| DOC-05 | Document print designer (choose fields, logo, terms, copies) | B | P5 | S |

### 19.3 Accounting (full books)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| ACX-01 | Journal, contra (cash↔bank), receipt and payment vouchers with narration templates | B | P5 | M |
| ACX-02 | Income & expense vouchers and an income/expense register | B | P5 | M |
| ACX-03 | Ledger groups (chart of accounts tree), opening balances, set-up ledgers wizard | B | P5 | M |
| ACX-04 | Fixed assets: asset master, purchase voucher, **depreciation schedule** (SLM/WDV) ⚠ rates | B | P6 | S |
| ACX-05 | Loans and liabilities: loan voucher, EMI schedule, interest booking | B | P6 | C |
| ACX-06 | TDS / TCS section and rate masters, deduction on payments/receipts ⚠ | B | P6 | S |
| ACX-07 | Final accounts: **trial balance, trading & P&L, balance sheet**, group register, ledger report | B | P6 | M |
| ACX-08 | Bank dashboard: balances, unreconciled entries, cheque status | B | P6 | S |
| ACX-09 | GST dashboard: output vs input tax, liability, filing status by period | B | P6 | M |
| ACX-10 | Income-tax overview for the owner (turnover, profit, advance-tax reminders) ⚠ | B | P7 | C |
| ACX-11 | Onboarding wizard for books: chart of accounts, bank accounts, GST registration, FY | B | P5 | M |

### 19.4 Inventory journals

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| IJX-01 | Stock inward / outward vouchers (non-purchase receipts and issues, e.g. samples, free goods from company) | B | P5 | S |
| IJX-02 | Stock journal (convert/repack: e.g. bulk into loose packs) | B | P6 | C |
| IJX-03 | Batch category master (e.g. "cold chain", "high value") for reporting | B | P5 | C |

### 19.5 Analytics & intelligence

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| ANX-01 | Bill-wise profit and **rate / quantity difference analysis** (purchase vs sale price drift) | B | P5 | S |
| ANX-02 | **ABC ranking** of items by value/volume; stock-flow card (opening → in → out → closing) | B | P5 | S |
| ANX-03 | Customer, product and vendor performance reports (top, declining, dormant) | B | P6 | S |
| ANX-04 | Customer & product intelligence: purchase frequency, refill prediction, churn risk | B | P7 | C |
| ANX-05 | Smart insights card on dashboard (plain-language highlights: "Sales of X down 30 % vs last month") | B | P6 | C |
| ANX-06 | POS register (counter/shift-wise), sales & sales-return registers, compliance register | B | P4 | M |
| ANX-07 | Sales vs payment and sales vs purchase trend charts | B | P5 | S |

### 19.6 Engagement

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| ENG-01 | WhatsApp connection settings, **broadcast campaigns** (offers, refill reminders) with delivery reports ⚠ opt-in | B | P6 | S |
| ENG-02 | Customer feedback after purchase (link in WhatsApp invoice) | R | P7 | C |

## 20. Navigation, CRM and administration gaps

Added after checking the full capability list and the app sidebar ([NAVIGATION.md](../design/NAVIGATION.md), [COVERAGE.md](COVERAGE.md)).

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| NAV-01 | **App sidebar navigation**: Dashboard + 10 groups (Sales, Purchase, Inventory, Masters, Wholesale, Finance, CRM & Engagement, Reports, GST & Compliance, Administration) exactly as in NAVIGATION.md; hides items by edition and permission; collapsible rail; remembers open groups | B | P1 | M |
| NAV-02 | Global command search (`Ctrl K`): jump to any menu item, item, party or document number | B | P4 | S |
| NAV-03 | **Desktop menu bar** (File, Edit, View, Go, New, Window, Help) built from the same nav config as the sidebar, edition- and permission-aware, accelerators from KEYBOARD_SHORTCUTS.md | B | P4 | M |
| NAV-04 | **Global keyboard shortcuts**: one shortcut registry, global keys, `G` go-to and `N` create sequences, list keys, form keys (`Ctrl+S`, `Ctrl+Enter`, `Ctrl+P`), shortcut sheet `Ctrl+/`, shortcuts in tooltips and command search (KEYBOARD_SHORTCUTS.md) | B | P2 | M |
| NAV-05 | **Transaction-screen keyboard map**: purchase entry, sales invoice, transfers and journals use the POS meanings (`F2` item, `F3` party, `F5` batch, `F10` save & post, `Ctrl+Del` remove line); full grid navigation without a mouse | B | P3 | M |
| CRM-01 | **Customer history** (customer 360): all bills, returns, prescriptions, doctors, outstanding, refill pattern on one page | B | P5 | S |
| CRM-02 | **Complaints**: log customer/retailer complaints (wrong item, short supply, damaged, billing error) with status, owner, due date, resolution and link to the bill/return | B | P6 | S |
| ADM-01 | **Integrations** settings page: GST e-invoice provider, WhatsApp, SMS, email, Tally export, payment links: connect, test, see status and last error | B | P5 | S |

## 21. Page-catalogue additions (full ERP page set)

Added after mapping every page in [PAGES.md](PAGES.md) to a feature. Each page in PAGES.md lists the feature IDs behind it; this section holds the ones that were missing. Role-based screens: [ROLES_AND_DASHBOARDS.md](ROLES_AND_DASHBOARDS.md). Validation rules for all of them: [VALIDATION_AND_BUSINESS_RULES.md](../architecture/VALIDATION_AND_BUSINESS_RULES.md).

### 21.1 Authentication & onboarding

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| AUT-01 | Forgot / reset password (single-use emailed token, 30 min expiry, all sessions revoked on reset); sign in with email **or** username | B | P1 | M |
| AUT-02 | Initial configuration wizard: tax settings, invoice number series, currency (INR), units, rounding, negative-stock policy (writes tenant settings, nothing hard-coded) | B | P2 | M |
| AUT-03 | Onboarding checklist: setup steps with progress (company, licence, GST, branch, users, items, opening stock, printer) until the business is ready to bill | B | P2 | S |

### 21.2 Dashboards (role-based)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| DSH-01 | Role-based landing: each role opens its own dashboard and menu (see ROLES_AND_DASHBOARDS.md); dashboards are configuration, not code branches | B | P4 | M |
| DSH-02 | Retail dashboard: counter sales, bills today, collections by mode, returns, top items | R | P4 | M |
| DSH-03 | Wholesale dashboard: orders by status, dispatch, receivables, credit-limit breaches, salesman performance | W | P5 | M |
| DSH-04 | Inventory dashboard: stock value, low stock, near-expiry, expired, dead stock, pending GRNs | B | P3 | M |
| DSH-05 | Financial dashboard: cash, bank, receivables, payables, expenses, GST liability | B | P5 | M |
| DSH-06 | Branch dashboard: branch-to-branch comparison of sales, margin, stock, expiry | B | P6 | S |
| DSH-07 | Activity timeline: recent user activity (from audit log) filtered by branch/user/module | B | P4 | S |
| DSH-08 | Dashboard widget library: today's sales, purchases, gross margin, net sales, invoices, cash collection, credit sales, receivables, payables, low stock, near-expiry, expired, fast-moving, slow-moving, branch performance; each widget permission-aware | B | P4 | M |
| DSH-09 | Super-admin platform analytics: tenants, plans, usage, health, revenue | B | P6 | S |

### 21.3 Masters

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| CAT-15 | Generic / salt master: salt name, strength, unit; normalised so the same composition is never stored twice | B | P2 | M |
| CAT-16 | Brand and manufacturer masters (marketer vs manufacturer, contact, GSTIN) | B | P2 | M |
| CAT-17 | Unit master + multi-level unit conversion (box → strip → tablet) used by purchase, stock and POS | B | P2 | M |
| CAT-18 | Medicine export (Excel/CSV) with the same columns as import | B | P3 | S |
| CAT-19 | Medicine history: price changes, purchases, sales, adjustments for one item | B | P3 | S |
| CAT-20 | Storage instructions and medicine detail page (complete profile: stock by branch, batches, substitutes, history) | B | P2 | M |
| PTY-11 | Supplier price list: agreed / last rates per supplier and item, shown during purchase | B | P3 | S |
| PTY-12 | Customer groups (individual, retailer, hospital, institution) with default price list, discount and credit terms | B | P5 | S |
| PTY-13 | Customer and supplier account statements (date range, PDF, email/WhatsApp) | B | P5 | M |

### 21.4 Purchase, inventory and returns

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PUR-12 | Purchase dashboard: open POs, pending GRNs, payables due, price changes | B | P3 | S |
| PUR-13 | PO tracking: pending, partially received, closed; pending purchases list | B | P3 | M |
| PUR-14 | Purchase verification: match supplier bill against PO and GRN (qty, batch, rate) before posting | B | P3 | S |
| PUR-15 | Supplier price comparison for an item across suppliers and time | B | P5 | S |
| INV-16 | Stock aging: by inward date and by expiry bucket | B | P5 | S |
| INV-17 | Stock reservation for confirmed orders and held bills (available = on hand − reserved) | B | P5 | S |
| INV-18 | FEFO override with an authorised reason (recorded in the movement and audit log) | B | P4 | M |
| RET-07 | Replacement management: replace returned goods instead of credit note | B | P5 | S |
| RET-08 | Return inspection: decide saleable / damaged / expired per line before stock re-entry | B | P4 | M |

### 21.5 Sales, POS and wholesale

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| POS-20 | Invoice list and details: search, filter, reprint, share, cancel through credit note | B | P4 | M |
| POS-21 | Discount approval at the counter: manager PIN override above the role limit, logged | R | P4 | M |
| POS-22 | Search by manufacturer and by salt in POS search (in addition to name/barcode) | R | P4 | M |
| WHS-11 | Routes and beats (web): retailers per route, visit days | W | P6 | S |
| WHS-12 | Delivery planning: schedule dispatches by route/vehicle, pick lists per trip | W | P6 | S |
| WHS-13 | Retailer claims: short supply, damage, rate difference; resolved by credit note | W | P5 | S |
| WHS-14 | Scheme claims: reconcile schemes given to retailers with manufacturer claims | W | P6 | S |
| PRC-10 | Value-based schemes (spend ₹X, get Y % or free goods) | B | P5 | S |
| PRC-11 | Company-wise (manufacturer-wise) discount rules for wholesale | W | P5 | S |

### 21.6 Finance and GST

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| ACX-12 | Cash-flow statement | B | P6 | S |
| ACX-13 | Finance dashboard and general ledger page (drill down from any balance to vouchers to documents) | B | P5 | M |
| ACX-14 | Ledger group master: chart-of-accounts tree (Asset / Liability / Equity / Income / Expense → sub-groups such as Current Assets → Sundry Debtors); user sub-groups; system groups locked | B | P5 | M |
| ACX-15 | Default chart of accounts seeded on company set-up (CHART_OF_ACCOUNTS.md: 24 groups, 43 ledgers for cash, bank, sales, purchase, returns, GST input/output, round-off, discounts, expiry loss, expenses); system ledgers renamable, never deletable ⚠ confirm with CA | B | P5 | M |
| ACX-16 | Party ledgers created automatically: every supplier under Sundry Creditors, every customer under Sundry Debtors, linked to the party master | B | P5 | M |
| ACX-17 | Posting rules: each document event (sale, purchase, returns, receipt, payment, write-off, expense) mapped to system ledgers by code, effective-dated; posting is refused if a ledger is missing | B | P5 | M |
| GST-09 | GST configuration: registrations per company, rate master, reverse-charge and composition settings (data, never hard-coded) | B | P2 | M |
| GST-10 | Input tax credit register from purchases | B | P6 | M |
| GST-11 | Invoice GST validation before posting (GSTIN format/state, place of supply, HSN, rate, totals) | B | P3 | M |

### 21.7 Compliance and CRM

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| CMP-08 | Patient prescription history (consent-based, minimum data) | R | P5 | S |
| CMP-09 | Restricted-medicine alerts at billing: schedule warnings and required steps | R | P4 | M |
| CMP-10 | Controlled stock register: restricted items inward/outward with running balance ⚠ | R | P6 | S |
| CMP-11 | Regulatory audit: compliance activity log and inspection pack export ⚠ | B | P6 | S |
| CRM-03 | CRM dashboard: active customers, refills due, complaints, loyalty | R | P6 | C |
| CRM-04 | Loyalty transactions: points earned / redeemed ledger | R | P6 | C |
| CRM-05 | Offers and coupons | R | P7 | C |
| CRM-06 | Follow-up reminders for staff (call customer, collect payment) | B | P6 | C |
| CRM-07 | Support tickets for customer issues beyond complaints | B | P7 | C |

### 21.8 Reports and administration

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| RPT-13 | Reports centre: catalogue, favourites, saved filters, recent | B | P4 | M |
| RPT-14 | Batch-wise sales and traceability: who received batch X (recalls) | B | P4 | M |
| RPT-15 | Discount report by user, item, reason | B | P4 | S |
| RPT-16 | Report framework standard: every report has date range, filters, server pagination, export and permission control | B | P3 | M |
| ADM-02 | Payment settings: payment modes, UPI VPA, card terminals, bank accounts | B | P4 | M |
| ADM-03 | Printer and print-template settings (per branch / counter, web and desktop) | B | P4 | M |
| ADM-04 | Notification settings per user, role and channel | B | P4 | S |
| ADM-05 | Login history and active sessions (with sign-out of other sessions) | B | P5 | M |
| ADM-06 | Import centre: all imports as jobs with status, error rows download, re-run | B | P3 | M |
| ADM-07 | Export centre: job-based exports (reports, masters, full tenant export) | B | P5 | S |
| ADM-08 | Backup status and tenant data download | B | P6 | S |
| ADM-09 | Data retention policies per record type ⚠ | B | P6 | S |
| ADM-10 | Platform billing: MENO's invoices to the tenant, payment history | B | P6 | S |
| ADM-11 | Help centre and support tickets to the MENO team | B | P6 | S |
| ADM-12 | API keys and webhooks management (with INT-05) | B | P7 | C |

---

### MVP definition (Pilot release, end of P5)

Platform admin, masters, purchase (+ CSV import), batch inventory with expiry, retail POS (online + offline desktop), returns incl. expiry returns, Schedule H1 register, payments & outstanding, wholesale orders/invoices with credit and e-invoice, core reports, notifications by email + WhatsApp share link, Azure deployment with backups and monitoring.
