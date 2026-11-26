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

Backups with tested restore · monitoring and alerts · audit trail · rate limiting · RBAC everywhere · accessibility (keyboard, contrast) · Light/Dark themes · printable layouts · < 2 s page loads on a 4 GB counter PC · data export for the tenant · documented SLAs. Measurable targets, tiers and controls: [ENTERPRISE_READINESS.md](../architecture/ENTERPRISE_READINESS.md) and §31.

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
| AUT-01 | Forgot / reset password (single-use emailed token, 30 min expiry, all sessions revoked on reset); sign in with email **or** mobile | B | P1 | M |
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

## 22. Competitor-gap additions (eVitalRx feature list, 2026-11-22)

Added after comparing a published competitor feature list with this catalogue: these are the features it covered only partly or not at all. Phases and priorities are proposals for Prakalya to confirm; most are P6–P7 so the MVP (below) does not grow. Items marked ⚠ touch regulated areas and need the rule confirmed in `docs/compliance/COMPLIANCE.md` before build.

### 22.1 Billing & POS

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| POS-23 | **One-click generic conversion**: switch every branded line on a bill to an in-stock generic with the same salts + strength (CAT-15); show patient saving and margin per line; pharmacist confirms each swap; extends CAT-09 / POS-16 ⚠ substitution rules | R | P5 | S |
| POS-24 | Counter recommendations: among same-composition alternatives, rank by near-expiry batch and margin (configurable weights, never above MRP) | R | P5 | S |
| POS-25 | Invoice verification QR: unique QR on every printed invoice opening a read-only verification page (number, date, total, store); no patient data | B | P5 | S |
| POS-26 | Service billing: non-stock service items (BP / sugar check, injection charge, consultation fee, delivery charge) with own SAC and GST, no stock movement ⚠ SAC / GST rates | R | P5 | S |

### 22.2 Inventory & purchasing

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PUR-16 | PDF / scanned purchase bill import: read lines from a distributor PDF or photo into a draft purchase that is reviewed before posting (brings MKT-09 forward for purchases) | B | P6 | S |
| PUR-17 | Optimal stock levels: min / max per item and branch computed from sales velocity, lead time and expiry risk; request fulfilment rate (short-book hits vs misses) | B | P6 | S |
| PUR-18 | Distributor marketplace: compare rates, schemes and stock across connected distributors and place POs from one screen (extends MKT-03 beyond MENO-to-MENO) ⚠ partner agreements | R | P7 | C |
| PTY-14 | **Distributor rate contracts** (terms of trade): agreed rate, scheme, discount and credit days per supplier + item, valid from / to; purchase entry flags deviations (extends PTY-11) | B | P5 | S |

### 22.3 Customer engagement, delivery & online channels (`crm`, `delivery`, `channels`)

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| NTF-06 | Pill / dose-time reminders to patients from the prescription schedule, opt-in only ⚠ consent, DPDP Act | R | P7 | C |
| CRM-08 | Paid membership plans: fee, validity, benefits (discount %, free delivery), renewal reminders | R | P6 | C |
| CRM-09 | Gift vouchers (issue, redeem, balance, expiry) and time-boxed flash-sale prices ⚠ voucher accounting / GST | R | P7 | C |
| DLV-01 | Home-delivery orders with rider assignment, status, cash-on-delivery collection and rider settlement (extends POS-18) | R | P6 | S |
| DLV-02 | Live order tracking link for the customer (rider location from the delivery app, MOB-04) | R | P7 | C |
| DLV-03 | Fleet management: riders, vehicles, shifts, delivery zones and charges, rider performance | B | P7 | C |
| OMN-01 | Store web page per branch: address, hours, contact, order via WhatsApp | R | P7 | C |
| OMN-02 | White-label customer app: order with prescription upload, reorder, track ⚠ online sale of medicines rules | R | P7 | C |
| OMN-03 | Marketplace channels: ONDC, Amazon, Flipkart order intake with stock sync (extends INT-06) ⚠ online sale of medicines rules | R | P7 | C |
| OMN-04 | WhatsApp ordering: customer sends an order or prescription on WhatsApp, it lands as a draft bill at the counter | R | P6 | S |

### 22.4 Payments

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| ACC-12 | Payment gateway integration: dynamic UPI QR, card and wallet with automatic confirmation on the bill (webhook, idempotent) ⚠ provider choice | B | P6 | S |
| ACC-13 | Auto payment reconciliation: match gateway / UPI settlements and bank credits to bills and receipts; unmatched items go to a review queue | B | P6 | S |

### 22.5 Platform, AI & healthcare integrations

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PLT-20 | Network (IP) allowlist per branch: restrict sign-in for chosen roles to the shop's network; denied attempts logged | B | P5 | S |
| INT-07 | ABHA / ABDM integration: link a customer's ABHA, receive e-prescriptions ⚠ ABDM certification | R | P7 | C |
| INT-08 | EMR integration: receive prescriptions from clinic software | R | P7 | C |
| INT-09 | Hospital software (HMIS) integration: hospital pharmacy billing against patient / IP number, ward indents | B | P7 | C |
| ADM-13 | Staff training: in-app lessons and quizzes per role, completion certificates | B | P7 | C |

### 22.6 Product data: Indian medicine database first, openFDA as drug reference

**MENO is for Indian pharmacies only.** Product create and barcode lookup therefore rely on an **Indian medicine data source** (Indian brands, salts, strengths, strip packs, manufacturers, `890…` EAN-13 barcodes), chosen and licensed under CAT-10. The source is not decided yet: candidates are the DrugDB API (drugdb.in, free trial for evaluation, paid plan for production, no bulk storing), the Kaggle "A–Z Medicine Dataset of India" (2.5 lakh rows, Nov 2022 snapshot, CC BY-SA 4.0), GS1 India's product data service (barcode-based), other licensed Indian drug databases, and government lists (NPPA ceiling prices, CDSCO approvals) for cross-checking ⚠ coverage, cost and licence to be compared.

openFDA (`https://api.fda.gov/drug/label.json` and `drug/ndc.json`) is the US FDA's free, public-domain (CC0) drug data. It has US names (acetaminophen, not paracetamol), US products and US barcodes, so it rarely matches an Indian pack. MENO uses it **only as salt-level drug reference** (uses, dosage, warnings, interactions are the same molecule everywhere), never for product create, barcode lookup, HSN, GST, schedule, MRP or pack. Teaching lesson: MENO Hub → Learn → "Drug reference data: openFDA".

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| INT-11 | **Indian medicine data adapter** in `integrations`: server-side client for the source chosen under CAT-10 (lookup by EAN-13 barcode, brand and salt), key in secrets, shared cache, records source + source id + fetched date on anything it fills ⚠ provider and licence | B | P3 | S |
| INT-12 | **DrugDB API adapter** (first provider behind INT-11, if the P2 decision picks DrugDB): server-side client for `GET https://drugdb.in/v1/search?q=` and `GET /v1/products/{product_id}`, `X-Api-Key` from secrets (paid plan for production; the trial and keyless visitor access are for evaluation only), one reused HTTP client, 5 s timeout, product details cached 1 h with ETag / `If-None-Match`, search never cached, 429 (`Retry-After`) and 403 (plan ended) mapped to a friendly "reference unavailable", never bulk-stores the catalogue (DrugDB terms), records `source = drugdb` + `product_id` (DDID…) on items it fills. Taught in Hub → Learn → Day 19 ⚠ paid plan + terms confirmed | B | P3 | S |
| INT-17 | **GSTIN verification adapter** (provider behind PTY-15) in `integrations`: `GstinVerifier` port + adapter for the provider chosen in P2; first candidate the public GST verify API `GET https://api.gstverify.dubey.app/api/v1/gst/details?gstin=&full=false` (basic details without a key; `full=true` needs a key), server-side only, 8 s timeout, one reused HTTP client, provider 400 → not found, 429 / timeout / 5xx → "enter by hand", result cached by GSTIN with source and fetch date, only the GSTIN is sent. Spec: [GSTIN_FETCH.md](GSTIN_FETCH.md). Taught in Hub → Learn → Day 22 ⚠ provider terms, limits and cost | B | P3 | S |
| CAT-24 | **Medicine search-as-you-type on the item create form** (feeds CAT-23): search box with a dropdown of DrugDB matches after a 200 ms pause, previous request cancelled, ↑ ↓ Enter Esc keyboard control, each row shows name, composition, pack, manufacturer, MRP; DrugDB's `fuzzy` / `searched_as` / `unit_ignored` / `ignored` notes shown to the user; picking a row pre-fills name, composition, manufacturer, dosage form and pack (each marked and editable), MRP shown as a hint only, barcode / HSN / GST / schedule left for the user; works by hand if DrugDB is down. Calls only meno-api, never DrugDB directly | B | P3 | S |
| CAT-22 | **Barcode lookup for unknown items**: when a scanned barcode is not in the tenant catalogue, look up own barcodes (CAT-04) → Indian medicine data (CAT-10 / INT-11); a hit pre-fills a draft item, a miss opens quick-create with the barcode filled. Never blocks billing | B | P4 | S |
| CAT-23 | **Pre-fill the medicine create form** from Indian medicine data: search by brand, salt or barcode and fill name, brand, salts + strengths, manufacturer, dosage form, pack and loose units; each pre-filled field marked and editable; save blocked until HSN, GST, schedule and pack are confirmed by the user ⚠ | B | P3 | S |
| INT-10 | openFDA adapter in `integrations` (reference only): server-side client for the drug label endpoint, optional API key from secrets, cache by label `set_id` (weekly updates), handles 404 "no matches" and 429; only needed for CAT-21 | B | P6 | C |
| CAT-21 | **Drug reference panel** on the medicine detail page and POS item info (`F1`): indications, dosage, boxed warning, warnings, contraindications, interactions, pregnancy, storage, looked up **by salt** with an Indian (INN) → US name map held in a configuration table (paracetamol → acetaminophen); shows the FDA disclaimer, attribution and "US label, the Indian label may differ" ⚠ pharmacist review | B | P6 | C |

### 22.7 AI assistant (`assistant`, P7: the last phase)

Plain-language, **read-only** questions over the tenant's own data, answered by **one shared LLM provider (Groq first) for all tenants**. meno-api is the security boundary: tenant and branch come from the token, the model may only call allowlisted typed tools that check permissions, every figure comes from MENO services, and no patient or personal data leaves MENO. Replaces PLT-21. Design: [AI_ASSISTANT.md](../architecture/AI_ASSISTANT.md), decision: ADR-0017 (Proposed). Rows are in build order.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| AIA-03 | **LLM provider adapter** in `integrations`: `LlmClient` port + Groq adapter (OpenAI-compatible chat API with tool calling), key in Key Vault, model, timeout, token limit and retries from configuration, provider errors mapped to friendly messages, egress allowlist, recorded-response mock for CI ⚠ provider terms, retention and model (R-52) | B | P7 | S |
| AIA-02 | **Assistant module and orchestrator**: per-question pipeline (tenant from token, branch checked against the token, permission and tenant setting, prompt assembly, max 3 tool rounds, answer), conversations and messages API (`/api/v1/assistant/*`, `Idempotency-Key`), redacted history kept in MENO, no state at the provider | B | P7 | S |
| AIA-04 | **Tool registry**: allowlisted typed tools with JSON schema and Bean Validation, bounds on dates and limits, one permission per tool, tools hidden from users without it, tenant and branch injected from `TenantContext` (never tool arguments), no SQL from the model, write tools forbidden | B | P7 | S |
| AIA-05 | **Sales tools**: `get_sales_summary` (period ≤ 366 days, group by day / week / month, compare to previous period or last year), `get_top_items`, `get_payment_mode_split`, from reporting views, tenant time zone | B | P7 | S |
| AIA-06 | **Stock tools**: `get_low_stock_items`, `get_expiring_batches`, `search_inventory` (name, salt or barcode) through read-only `StockQueryFacade` and `CatalogFacade` | B | P7 | S |
| AIA-07 | **Bill quote tool**: `quote_bill` prices lines through `PricingEngine` + `GstCalculator` (passes every case in `contracts/test-vectors/`); a quote only, never an invoice; the model explains, it never calculates | B | P7 | S |
| AIA-08 | **Privacy and consent**: `Redactor` strips phone, email, Aadhaar / ABHA-like numbers and patient names; never sends customer, prescription, doctor, register, GSTIN, PAN or bank data; party names only on owner opt-in; owner enables the assistant per tenant after a notice, audited ⚠ DPDP notice and consent wording (R-52) | B | P7 | S |
| AIA-09 | **Answer guards**: every figure in the answer must come from a tool result (else the card is shown with a template text), prompt-injection defence (tool output, item names and documents are untrusted), refusal with a screen link for write requests, length limits | B | P7 | S |
| AIA-01 | **Assistant screen** (`/assistant` + Ask in Ctrl+K, formerly PLT-21): chat with answer text and data cards (tables from tool results), "data used" line with branch and period, suggested questions per role, feedback, keyboard-first, 1280 / 375 px, disabled offline on desktop | B | P7 | S |
| AIA-10 | **Usage limits and cost**: questions per user per day from plan entitlements, per-tenant rate limit (429 `ASSISTANT_QUOTA_EXCEEDED`), token metering per tenant, usage shown in Settings → Assistant ⚠ quota numbers per plan | B | P7 | S |
| AIA-11 | **Assistant audit, security tests and monitoring**: audit row per question (who, tenant, branch, tools, tokens, latency, outcome, no prompt text), Grafana metrics and alerts (errors, p95, daily tokens), RLS fail-closed and connection-pool leak tests under `meno_app`, cross-tenant through tools (critical scenario #16) | B | P7 | S |
| AIA-12 | **Store documents (RAG, optional)**: owner uploads SOPs, policies and supplier terms; chunked and embedded into PostgreSQL **pgvector** with tenant RLS; `search_store_documents` returns snippets with document and page; content treated as untrusted ⚠ embedding provider | B | P7 | C |

## 23. Licensing: license keys, plans and entitlements (`subscription`)

How MENO is sold: the MENO team (super admin) creates a license for a buyer, the buyer enters its key once, and MENO enforces the plan's edition, limits and expiry. Design: [LICENSING.md](../architecture/LICENSING.md), [ADR-0015](../decisions/0015-license-keys-signed-certificates.md). Builds on PLT-14 (plans, edition gating) and PLT-15 (super-admin console). Teaching lesson: MENO Hub → Learn → "Licensing". ⚠ grace length, restricted-mode rules, invoice limit type and prices are confirmed by Nitheesh before LIC-06.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| LIC-01 | **Plan catalogue** (super admin): plans as data: code, name, edition, limits (users, branches, devices, invoices per month), features, duration, grace days, list price; effective-dated; never hard-coded | B | P5 | M |
| LIC-02 | **Issue a license key** (super admin): buyer name, GSTIN, email, phone, plan, start and expiry, trial flag, limit overrides, notes → key `MENO-XXXXX-XXXXX-XXXXX-XXXXX` (Crockford Base32, 95 random bits, Luhn mod-32 check), stored only as an HMAC hash, shown once, PDF / email to the buyer; `Idempotency-Key`; plan limits snapshotted onto the license | B | P5 | M |
| LIC-03 | **Activate a license key** (business owner) in onboarding (`/onboarding/license`) or Settings → License: check character validated in the browser, server binds the license to the tenant, rate-limited (5 tries / 15 min), same message for unknown and already-used keys, every attempt recorded | B | P5 | M |
| LIC-04 | **Signed license certificate**: Ed25519-signed JWS with plan, edition, limits, features, dates and tenant; 7-day lifetime; returned on activation, login and sync; private key in secrets with `kid` rotation; public keys bundled in web and desktop | B | P5 | M |
| LIC-05 | **Entitlement enforcement**: `EntitlementGuard` (edition, feature, capacity, writable) checked server-side before creating users, branches, devices and documents; RFC 9457 codes `license_expired`, `license_limit_reached`, `license_edition`, `license_feature`; UI hides or explains | B | P5 | M |
| LIC-06 | **Expiry lifecycle**: computed states valid → expiring (reminders 30/15/7/1 days) → grace → expired; restricted mode after grace blocks new documents, users, branches and devices but always allows sign-in, viewing, reports, export, payments received and sync of bills made before the grace end; no data is ever deleted ⚠ | B | P5 | M |
| LIC-07 | **Desktop offline license**: cached certificate verified offline (signature, tenant, lifetime), clock-rollback check against the last server time seen, device activation counted against the device limit, restricted mode applied offline | R | P5 | M |
| LIC-08 | **Super-admin license console** (`/platform/licenses`): list and filters (status, plan, expiring before), detail with history and activations; extend, change plan, suspend, resume, revoke, re-issue key, transfer to another tenant; every action needs a reason, is audited, and requires 2FA | B | P5 | M |
| LIC-09 | **Tenant license page** (`/admin/license`): plan, edition, start and expiry, days left, limits with usage bars, masked key, history, renew / upgrade contact | B | P5 | S |
| LIC-10 | **Renew or upgrade with a new key** on an active tenant: the new license takes over on its start date, the old one ends; stacking and pro-rata rules ⚠ | B | P6 | S |
| LIC-11 | License sale invoices: GST invoice to the buyer for each license, linked to platform billing (ADM-10) ⚠ | B | P6 | C |

## 24. Master field completeness (supplier, customer, product)

Field-by-field specification: [MASTER_FIELDS.md](MASTER_FIELDS.md). Added on 24-11-2026 after comparing MENO's master screens with a general-purpose Indian ERP; pharmacy-only fields (licences, schedule, salt, storage) are kept on top. ⚠ rows need CA or pharmacist confirmation.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PTY-15 | **GSTIN fetch** on supplier and customer forms: verify a GSTIN and fill legal/trade name, state, address and GST status (Active / Cancelled / Suspended); cancelled GSTIN warns at purchase and sale; spec [GSTIN_FETCH.md](GSTIN_FETCH.md), provider adapter INT-17 ⚠ GSP provider and cost | B | P3 | S |
| PTY-16 | Party identity fields: print name, party code (auto from series), party type (supplier: manufacturer, distributor, stockist, C&F; customer: retail, retailer, hospital, clinic, institution, doctor) and party group, all options from the API | B | P2 | M |
| PTY-17 | **Multiple contacts** per party: type (primary, accounts, orders, sales rep), person, designation, email, mobile, office no.; exactly one primary | B | P2 | M |
| PTY-18 | **Multiple addresses** per party (billing, shipping, godown) with PIN code auto-fill of state, district and city; billing state must match the GSTIN state | B | P2 | M |
| PTY-19 | Party licences as rows: drug licence form + number + valid from/to + scan upload, FSSAI licence, NDPS licence; expiry reminders 30/15/7 days ⚠ | B | P2 | M |
| PTY-20 | **Multiple bank accounts** per party with IFSC validation and auto-fill, UPI ID, masked and encrypted account no.; bank-detail changes need approval (maker-checker) and are audited | B | P3 | M |
| PTY-21 | Per-party **payment reminders**: schedule (N days before due, on due date, custom) and channels (email, WhatsApp, SMS); supplier reminders are for us, customer reminders go to the customer | B | P5 | S |
| PTY-22 | Party income-tax fields: PAN (matches GSTIN), related-party flag, TDS/TCS applicable + section from `tds_section`; related-party transactions report ⚠ | B | P5 | S |
| PTY-23 | **MSME (Udyam) details** for suppliers: category (micro / small / medium / not applicable), Udyam no., certificate; MSME payables due-date tracking and overdue report ⚠ CA to confirm payment limit and tax effect | B | P5 | S |
| PTY-24 | Party GST fields: registration type (regular, composition, unregistered, SEZ, overseas) and default rate mode on their bills (exclusive / inclusive of GST); composition and unregistered suppliers give no input tax credit | B | P2 | M |
| PTY-25 | **One party in both roles** (customer and supplier) with a single ledger and netted outstanding ⚠ CA | B | P5 | C |
| PTY-26 | Transporter master and party defaults (transporter, mode, vehicle type) used by GRN, delivery and e-way bill | B | P5 | S |
| PTY-27 | Party default discounts (discount %, cash discount %, special discount %) copied to purchase and sale documents | B | P3 | S |
| PTY-28 | Agent master and party agent/salesman with commission %; commission report | W | P6 | S |
| PTY-29 | Interest on overdue: % and basis (simple 365 / 360 days, compound monthly) per party; interest calculation report and optional interest debit note ⚠ | B | P6 | C |
| PTY-30 | Retail patient profile on the customer: age or date of birth, gender, allergies, chronic conditions, regular doctor, ABHA no.; permission-gated, never logged, consent recorded ⚠ | R | P4 | S |
| CAT-25 | Product identity and control fields: product code, print name, department, 2-level category and therapeutic class trees, nature of product (finished goods, consumable, service, asset), shelf life, warranty (devices), barcode / batch / active toggles (pharma items always batch-enabled), remarks | B | P2 | M |
| CAT-26 | Bundles / kits: one sellable line made of component items, stock taken from components | B | P5 | C |
| CAT-27 | Product stock defaults: lead time, default in/out warehouse, ranked preferred vendors (used by PO and reorder) | B | P3 | S |
| PRC-12 | Product price defaults: discount received %, discount allowed %, maximum discount % per item (lower of item and role cap wins) | B | P3 | M |
| PRC-13 | Minimum / maximum mark-up % per item (warn below cost + min mark-up, block below cost ⚠ policy) and product commission % | B | P5 | S |
| PLT-22 | Reference data: PIN code directory (state, district, city) and IFSC directory (bank, branch), loaded from public sources with scheduled refresh ⚠ licence check | B | P2 | M |

## 25. Transaction logic and pharmacy controls (audit of 24-11-2026)

Field, validation and posting specification for every document: [DOCUMENT_FIELDS.md](DOCUMENT_FIELDS.md); formulas: [CALCULATIONS.md](../architecture/CALCULATIONS.md) §6a–§20. These close gaps found when the whole plan was checked against a complete medical-billing ERP.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PLT-23 | **Period lock**: close a month or a date range per company; no posting, back-dating or reversal into a locked period; unlock needs permission + reason and is audited | B | P5 | M |
| PLT-24 | Attachments on any document or master (supplier bill, Rx, licence scan, delivery proof): type and size rules from settings, virus scan, retention per ADM-09 | B | P3 | M |
| ACC-14 | **Cheque bounce**: reverse the receipt, re-open the invoices, optional bank-charge debit note, flag the party and notify | B | P5 | M |
| ACC-15 | Financial (rate-difference) credit / debit notes without stock, GST at the original invoice rate ⚠ | B | P5 | S |
| CMP-12 | **NPPA / DPCO ceiling price check**: ceiling price table (effective-dated); warn at purchase when batch MRP exceeds the ceiling, block sale once confirmed ⚠ source and update process | B | P4 | S |
| CMP-13 | Patient safety warnings at POS: allergy match with the patient profile, duplicate-therapy and interaction alerts from the drug reference; pharmacist acknowledges and it is logged ⚠ pharmacist review | R | P6 | S |
| CMP-14 | Expired / damaged stock destruction record: batches, quantities, date, method, witnesses, linked to the write-off adjustment ⚠ | B | P5 | S |
| INV-19 | Batch MRP revision (price change notified by the manufacturer): new MRP from a date, relabel note, old stock rule, full audit | B | P4 | S |
| INV-20 | Batch block / recall: block a batch across branches with a reason; traceability list of who bought it (RPT-14) and supplier return | B | P4 | M |
| RET-09 | Counter return without the original bill, only when the store policy setting allows it, at the lower of last selling price and MRP, with approval ⚠ | R | P4 | C |
| GST-12 | Reverse charge (RCM) on applicable inward supplies (e.g. some services) with self-invoice and liability posting ⚠ | B | P6 | S |
| GST-13 | GSTR-9 annual summary data from posted documents ⚠ | B | P6 | S |
| GST-14 | Invoice Management System (IMS) workflow on inward invoices (accept / reject / pending) feeding GSTR-2B matching ⚠ current GSTN process | B | P6 | S |
| POS-27 | Reprint marking: reprints show "Duplicate copy" with reprint count, user and time audited | B | P4 | M |
| PTY-31 | Party merge (duplicate cleanup) with ledgers, documents and history preserved | B | P5 | S |
| PTY-32 | Doctor master fields: qualification, registration no. + state council (unique together), specialisation, clinic, address with PIN auto-fill | R | P4 | M |
| INT-13 | Insurance / TPA / corporate credit billing for hospital pharmacies: payer master, co-pay split, claim status | B | P7 | C |

## 26. Invoice completeness (distributor bill review, 24-11-2026)

Compared with a typical distributor's printed tax invoice. Fields and print layout: [DOCUMENT_FIELDS.md](DOCUMENT_FIELDS.md) §2, §3, §3a; maths: [CALCULATIONS.md](../architecture/CALCULATIONS.md) §22. Demo: MENO Hub → Learn → Day 21 → Wholesale invoice.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| WHS-15 | **Combined distributor bill**: one printed document with sections Sales, Less sales return, Less breakage / expiry return, Add replacement; each return section is a credit note with its own number linked to the invoice, replacement lines are invoice lines (RET-07), the settlement is netted ⚠ CA | W | P5 | M |
| WHS-16 | Dispatch details on invoices: order no. + date, L.R. no. + date, transporter, vehicle no., number of cases, weight; printed and passed to the e-way bill | W | P5 | M |
| DOC-06 | **Additional charges** on sales and purchase invoices (freight, insurance, packing, other): amount, GST treatment from the setting `billing.charges_gst` ⚠, posted to its own ledger; on purchase, allocated into landed cost (PUR-06) | B | P5 | M |
| DOC-07 | **Invoice print content standard**: both parties' DL nos., GSTINs and state codes, invoice / order / L.R. / due date, line columns (S. no., product, packing, manufacturer, HSN, batch, expiry, qty, free, MRP, rate, disc %, GST %, amount), section headings, tax summary by rate, sub total, item discount, returns, taxable, tax heads, charges, round off, grand total, amount in words, terms from the terms master, declaration, E.&O.E., checked by, authorised signatory, bank / UPI QR, page x of y with carried-forward totals | B | P4 | M |
| POS-28 | **POS line columns**: item with pack, manufacturer, HSN and schedule badge; batch · expiry; qty; MRP; disc % and ₹; taxable; GST % and ₹; amount; column set configurable per counter (narrow screens hide optional columns) | R | P4 | M |
| PRC-14 | Totals breakdown on every invoice: sub total, item discount, bill discount, returns, taxable value, CGST / SGST / IGST / cess, charges, round off, grand total, each shown separately and never merged | B | P4 | M |

## 27. Competitor-parity additions (Marg ERP, VarthagamSoft audit, 24-11-2026)

Audit, sources and coverage table: [research/COMPETITOR_AUDIT.md](research/COMPETITOR_AUDIT.md). Each row closes a gap where a leading Indian pharmacy product offers something MENO did not plan.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| CAT-28 | **Discontinued items**: flag with date and reason; blocks new purchase, PO and sale; returns allowed per setting; shown in search with a badge; replacement item suggested | B | P3 | M |
| PLT-25 | **Master bulk update**: filter items or parties, change chosen fields (rack, category, discount caps, reorder levels, price list, salesman, HSN) with preview, approval above a count, full audit | B | P3 | S |
| PLT-26 | **Migration importers** for exports of popular software (Marg, Tally, Busy, Vyapar, GoFrugal): items, parties, opening stock by batch, outstanding bills, ledgers with opening balances; dry run with error report | B | P5 | M |
| PLT-27 | **Accountant (CA) access**: invite an external accountant with a read-only books + GST scope, time-boxed, export allowed, every view audited | B | P5 | S |
| PUR-19 | **Merge purchase orders**: receive several open POs of one supplier into one purchase invoice or challan; pending-PO-lines report per supplier and item | B | P4 | S |
| WHS-17 | **Stock & sales statement (secondary sales)** per manufacturer / company: opening, purchase, purchase return, sales, sales return, free, closing by item for a month; Excel / PDF / email to the company or C&F | W | P5 | M |
| WHS-18 | **Sub-stockist accounting**: sub-stockist party type, stock sent on sub-stockist terms, their secondary sales and claims, settlement | W | P6 | S |
| WHS-19 | **Dispatch checking (item checker)**: scan every item and batch against the invoice before dispatch on web or phone, mismatch alerts, several checkers in parallel, checker name on the packing slip; same scan for GRN check-in with rack allocation | W | P5 | M |
| WHS-20 | **Packing slip, parcel and dispatch register**: packing slip per case, parcel register, L.R. update after dispatch, delivery acknowledgement (POD) report | W | P5 | S |
| WHS-21 | **Collection tagging**: assign outstanding bills to salesmen or collectors, print a collection sheet, record collections against it, assigned-vs-collected report | W | P5 | S |
| ACC-16 | **Cheque management**: cheque book master per bank account, cheque leaf printing in bank formats, cheque number sequence and tracking, cancelled / void leaves, issued-cheque register | B | P5 | S |
| RPT-17 | Outstanding by **area, route, salesman** and **as-on-date / age-wise** for receivables and payables, shareable as PDF / WhatsApp | B | P5 | M |
| RPT-18 | **Exception (bill audit) report**: edited drafts, cancelled, back-dated, reprinted, below-cost, above-cap discount, FEFO overrides, negative-stock attempts, by user and day | B | P5 | M |
| ANX-08 | **Staff performance**: sales, bills, average bill value, discounts given, returns, cancellations by user, salesman, counter and outlet | B | P5 | S |
| DOC-08 | **Print formats**: laser A4 / A5, dot-matrix on pre-printed stationery (fixed positions, carry-forward per page), thermal 2" / 3"; template chosen per document type, counter and party | B | P4 | M |
| INV-21 | **Dosage labels**: print a medicine label with patient name, dose, frequency, timing and instructions from the bill line ⚠ pharmacist review of wording | R | P5 | S |
| POS-29 | **Multi-firm billing**: one counter billing under different firms (companies / GSTINs) of the same tenant; firm picked per bill or by item rule; separate series, books and stock (extends PLT-02) | B | P5 | S |
| GST-15 | **GST rate change roll-over**: effective-dated bulk HSN rate change, drafts and open orders re-priced on the change date, MRP relabel prompts for old stock, before/after report ⚠ confirm rates with CA | B | P3 | M |
| NTF-07 | **Owner daily digest**: end-of-day email / WhatsApp with sales, collections, purchases, cash, low stock, near expiry, overdue and exceptions | B | P5 | S |
| MOB-06 | Android quick-billing app for small shops with Bluetooth thermal printer, barcode by camera, offline queue | R | P7 | C |
| INT-14 | **Hospital (IP) pharmacy**: ward indents, issue against admission, returns from ward, consolidated IP bill to the hospital system (extends INT-09) | B | P7 | C |

## 28. Onboarding and account setup (24-11-2026)

Full flow, fields and rules: [ONBOARDING.md](ONBOARDING.md) (with what Marg, Vyapar, eVitalRx, GoFrugal and VarthagamSoft do at set-up). Extends PLT-01, AUT-02, AUT-03, ACX-11, LIC-03.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| AUT-04 | **Sign-up and verification**: owner name, mobile OTP, email link, password policy, business name, state, partner code, trial / demo / license choice, DPDP notice acceptance stored with version; rate limits and bot checks | B | P1 | M |
| AUT-05 | **Business profile step**: business type (retail, wholesale, both, hospital, chain), branches, catalogue size, current software, language; tailors the remaining steps and menus | B | P2 | M |
| AUT-06 | **GSTIN-first company step**: fetch fills legal name, address, state and registration type; state locked to the GSTIN; composition → Bill of Supply; PAN check; logo | B | P2 | M |
| AUT-07 | **Licences and pharmacist step**: retail / wholesale drug licences with expiry and scans, FSSAI, NDPS, pharmacist in charge with registration and council | B | P2 | M |
| AUT-08 | **Invoice look set-up with live preview**: paper size, logo, header, terms, bank details, UPI QR, signature, declaration, series preview | B | P2 | M |
| AUT-09 | **Team step**: invite staff by mobile or email with role and branch; counter PIN on first login | B | P2 | S |
| AUT-10 | **Data step**: start fresh, Excel templates or migrate from current software; dry run, review and approve before commit; masters → opening stock by batch → outstanding → ledger openings | B | P3 | M |
| AUT-11 | **Devices step**: desktop download, device registration, printer test page, barcode scan test, cash drawer test | R | P4 | S |
| AUT-12 | **Practice mode**: separate practice company with sample data and a guided first-bill tour; practice bills marked "not a tax invoice" and excluded from all reports | B | P4 | S |
| AUT-13 | **Go-live**: readiness checks (GST, licences, books balanced, preferences, printer, stock, plan, email), go-live date, practice data removed, opening balances locked, series start | B | P3 | M |
| AUT-14 | **Assisted onboarding**: book a set-up call, chat, owner-granted time-boxed support access (view / assist) with full audit; partner (implementer) linking with the same consent | B | P5 | S |
| AUT-15 | **Resume and progress**: every step saved on Next, resume on sign-in, checklist on the dashboard until go-live, reminders to finish | B | P2 | M |
| PLT-28 | **Onboarding pipeline** (super admin): tenants by step, days stuck, trial days left, nudges, sign-up → go-live → first-100-bills funnel | B | P5 | S |

## 29. Five-product parity: Marg, Vyapar, eVitalRx, GoFrugal, VarthagamSoft (24-11-2026)

Feature-by-feature matrix and sources: [research/COMPETITOR_AUDIT.md](research/COMPETITOR_AUDIT.md) §6. Every list below (offer types, segment rules, custom-field types, target periods, reminder schedules) is configuration, never hard-coded (ADR-0014).

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PLT-29 | **Head-office control for chains**: items, HSN / GST, prices, offers, users and settings managed centrally and pushed to outlets; which fields an outlet may override is a setting; push log per outlet | B | P5 | M |
| PLT-30 | **Custom fields** on items, parties and documents: type (text, number, date, list), required, searchable, printable; defined per tenant | B | P5 | S |
| PLT-31 | **Clone set-up**: copy settings, series, print templates, roles and optionally masters from one company or branch to a new one | B | P5 | S |
| PUR-20 | **Chain indents**: outlets raise indents (manual or from min / max); head office consolidates them into supplier POs or fulfils from the warehouse by stock transfer; indent status per outlet | B | P5 | M |
| PUR-21 | **Purchase inbox**: a dedicated email address or connected mailbox receives distributor CSV / PDF bills, auto-creates draft purchases with item mapping, flags rate changes | B | P5 | S |
| INV-22 | **Stock reallocation**: suggests moving non-moving or short-expiry stock to branches with demand or to the warehouse; one click creates the transfer | B | P5 | S |
| WHS-22 | **Sales targets and incentives**: targets by salesman, area, company or product for a period; achievement tracking; incentive slabs; leaderboard | W | P6 | S |
| PTY-33 | **Party self-registration link**: send a link; the retailer or customer fills GSTIN, licences, address and contacts; staff review and approve before the party is active | B | P5 | S |
| PTY-34 | **Credit rules beyond amount**: limit by value, number of open bills and oldest bill age; over-limit approval from the owner's phone; average payment days shown at billing | B | P5 | M |
| PRC-15 | **Offer engine**: bill value, item, item group, category, manufacturer, combo, buy-X-get-Y, accumulated purchase, time-bound (hours / days), customer segment and near-expiry batch offers; priority and stacking rules; usage report | B | P5 | M |
| CRM-10 | **Customer segments** by rules (chronic, regular, walk-in, lapsed, high value, by medicine class) used for offers, reminders and campaigns | R | P6 | S |
| CRM-11 | **Notify when available**: record a customer's request for an out-of-stock medicine; message them automatically when stock arrives; feeds the short book | R | P5 | S |
| CRM-12 | **Greetings automation**: birthday, anniversary and festival messages with templates, consent and opt-out | R | P6 | C |
| ACX-18 | **Cash-flow forecast**: expected receipts by due date, payables, PDCs and expenses for the next N weeks | B | P6 | S |
| ADM-14 | **Data health check**: user-run checks (stock vs ledger, unbalanced vouchers, items without HSN, duplicate parties, negative batches) with links to fix | B | P5 | S |
| RPT-19 | **Customer payment behaviour**: average payment days, delay trend, bills paid after due date per customer and area | B | P5 | S |
| RPT-20 | **Manufacturer-wise reports**: sales, stock, expiry and returns by manufacturer / company | B | P5 | S |
| ANX-09 | **Customer retention**: new vs repeat, lapsed customers, refill adherence by month and branch | R | P6 | S |
| INT-15 | Zoho Books sync (sales, purchases, returns, payments) alongside Tally export | B | P6 | C |

Deliberately **not** adopted: doctor commission per medicine (legal and ethical risk under medical-council and pharma marketing codes ⚠), self-checkout kiosks (prescription medicines need a pharmacist), per-bill pricing (business model, not a feature).

## 30. Ideas from the Ekagraha ERP codebase review (24-11-2026)

Ekagraha is a general Indian ERP (masters, sales, purchase, inventory journals, accounts, assets, reports; 165 screens). Its screens and docs were reviewed for ideas only — no code is reused. Most of its screens already map to MENO (§19 market parity); these six are new.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PLT-32 | **Excel import templates done properly**: grey hint text in empty cells, cell tooltips (≤ 255 chars), defaults per column, dropdowns fed from a hidden locked master-data tab, Excel validation that stops bad entries while typing, upload error table by row number, re-download of only the failed rows | B | P3 | M |
| CAT-29 | **Create missing masters on the fly** when adding or importing a product (brand, manufacturer, category, unit): shown as "will be created", reviewed in one list, audited | B | P3 | S |
| RPT-21 | **Commission and TDS register**: salesman / agent commission vouchers with sales amount, commission %, commission, TDS section, TDS % and TDS amount by period ⚠ CA (TDS on commission) | W | P6 | S |
| RPT-22 | **Group register**: net sales quantity and amount, profit and growth % vs the previous period by product group, category, brand or manufacturer | B | P5 | S |
| ANX-10 | **Risk flags**: customers approaching their credit limit and declining customers; dead and declining stock; each with drill-down to bills and items (extends ANX-04) | B | P5 | S |
| NTF-08 | **WhatsApp usage and cost**: messages by Meta category (utility, marketing, authentication, service), template approval status, cost per branch and month, monthly cap and alert | B | P5 | S |

## 31. Enterprise readiness (24-11-2026)

Targets, tiers and controls: [ENTERPRISE_READINESS.md](../architecture/ENTERPRISE_READINESS.md). These make MENO sellable to chains and large distributors; numbers (SLOs, budgets, policies) live in configuration.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| PLT-33 | **Single sign-on**: SAML 2.0 and OIDC (Microsoft Entra ID, Google Workspace) per tenant, enforce-SSO switch, just-in-time user creation, break-glass owner login | B | P6 | S |
| PLT-34 | SCIM 2.0 user provisioning and de-provisioning from the customer's directory | B | P7 | C |
| PLT-35 | **Tenant security policies**: password rules, MFA mandatory per role, idle timeout, session length, device binding for counters | B | P5 | M |
| PLT-36 | **Field-level encryption and masking** for PAN, bank accounts and patient health data; masked in lists and exports unless permitted; yearly key rotation | B | P5 | M |
| PLT-37 | **Data residency and exit**: data and backups in Indian regions; tenant exit with full export and deletion certificate listing records kept by law | B | P5 | M |
| PLT-38 | **Sandbox tenant**: a copy of the customer's masters and settings to try changes and train staff; no GST filings, e-invoices or messages leave it | B | P6 | S |
| PLT-39 | **Feature flags and release channels**: per-tenant flags, early-access and stable channels, staged desktop rollout with automatic halt on crash rate | B | P4 | M |
| PLT-40 | **Tenant health page**: device sync lag, failed jobs, e-invoice / e-way queue age, licence and backup state, with fixes | B | P5 | S |
| PLT-41 | **High availability and disaster recovery**: managed PostgreSQL with point-in-time recovery, second-region backup copy, RPO / RTO per tier, monthly timed restore drill | B | P6 | M |
| PLT-42 | **Accessibility WCAG 2.1 AA**: audit, contrast and label checks in CI, screen-reader support, public accessibility statement | B | P5 | S |
| PLT-43 | **Performance budgets in CI**: POS keystroke ≤ 50 ms, item search p95 ≤ 150 ms, bill save p95 ≤ 500 ms, page load ≤ 2 s on a 4 GB PC; failing budget fails the build | B | P4 | M |
| PLT-44 | **Security assurance**: OWASP ASVS L2 checklist per release, dependency and container scanning, annual VAPT by a CERT-In empanelled auditor, CERT-In 6-hour incident reporting and 180-day log retention ⚠, ISO 27001 readiness | B | P6 | M |
| ADM-16 | **Status page and maintenance notices**: public status, incident history, maintenance announced 72 h ahead, in-app banner | B | P5 | S |
| ADM-17 | **Support SLAs**: priority levels, response and resolution timers per tier, escalation, satisfaction rating (extends ADM-11) | B | P5 | S |
| ADM-18 | **Audit export and SIEM streaming**: audit log as CSV / JSON export and signed webhook stream | B | P6 | S |
| ADM-19 | **Maker-checker for sensitive settings**: tax settings, number series, posting rules, bank details, price lists need a second approver | B | P5 | M |
| ADM-20 | **Chain branding**: logo, accent colour, custom domain for portal and customer app, branded emails and WhatsApp templates | B | P6 | C |
| INT-16 | **Public API platform**: versioned API, OAuth 2.0 client credentials, per-client rate limits, idempotent writes, bulk master endpoints, signed webhooks with retries, developer portal with sandbox (extends INT-05) | B | P6 | S |

## 32. Security (`security`, 24-11-2026)

Threats: [THREAT_MODEL.md](../security/THREAT_MODEL.md) · controls: [SECURITY.md](../security/SECURITY.md) (catalogue mapped to OWASP ASVS L2 and ISO 27001) · decision: [ADR-0016](../decisions/0016-tamper-evident-records-and-device-signing.md). Thresholds, retention periods and rule lists are configuration.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| SEC-01 | **Tamper-evident records**: hash-chained posted documents, statutory registers and audit log per series; signed daily anchors in immutable storage; nightly verifier and auditor "Verify records" report | B | P4 | M |
| SEC-02 | **Device-signed offline bills**: per-device Ed25519 key in the OS keystore; offline bills signed; server verifies on sync; bad or revoked-device bills quarantined, owner alerted | R | P5 | M |
| SEC-03 | **Envelope encryption and key management**: per-tenant data keys wrapped by a Key Vault master key, versioned keys, yearly rotation, crypto-shredding on tenant exit | B | P6 | S |
| SEC-04 | **Secrets management**: all secrets in Key Vault, none on disk or in env files, short-lived DB credentials, rotation schedule, secret scanning in CI | B | P1 | M |
| SEC-05 | **Insider-fraud detection**: rules for voids, reprints, discounts, returns without bill, write-offs, price edits during shifts, after-hours activity, FEFO overrides, cash shortfalls; thresholds in configuration; alerts and case notes | B | P5 | M |
| SEC-06 | **Privileged access management**: separate platform-admin realm, hardware-key MFA, just-in-time elevation with approval and expiry, two-person rule for destructive actions, break-glass account with alert | B | P5 | M |
| SEC-07 | **Security monitoring**: central logs with redaction, detection rules (brute force, token reuse, impossible travel, mass export, cross-tenant attempt, admin outside hours), alerting, 180-day retention in India ⚠ | B | P5 | M |
| SEC-08 | **Supply-chain security**: pinned dependencies, SBOM per build (CycloneDX), signed container images, protected branches with required reviews, build provenance (SLSA L2) | B | P3 | S |
| SEC-09 | **Desktop hardening**: code-signed installer and updates, update signature check, sandboxed renderer, app-bundle integrity check, SQLCipher key in OS keystore, idle lock, remote wipe on device revoke | R | P5 | M |
| SEC-10 | **API and edge protection**: WAF rules, rate limits per IP / user / tenant, request size limits, CORS lockdown, bot checks on public endpoints, abuse alerts | B | P4 | M |
| SEC-11 | **Data classification and export control**: class per field (restricted-health, restricted-financial, confidential, internal, public); exports watermarked with user and time; approval for restricted data; bulk-export alert | B | P5 | S |
| SEC-12 | **Tenant security centre**: security score, MFA coverage, admins list, active sessions and devices, recent risky events, recommended actions | B | P5 | S |
| SEC-13 | **Login protection**: passkeys (WebAuthn) for owners and admins, new-device and new-location alerts, step-up challenge for risky sign-ins | B | P5 | S |
| SEC-14 | **Secure SDLC gates**: threat-model review per epic, SAST (CodeQL / Semgrep), DAST (ZAP), secret scanning, IaC scanning, security sign-off for auth / money / sync / file PRs, abuse-case tests from THREAT_MODEL.md §5 | B | P1 | M |
| SEC-15 | **Ransomware-resistant backups**: encrypted, immutable second-region copies with separate credentials, deletion protection, restore drills | B | P5 | M |
| SEC-16 | **Responsible disclosure**: security.txt, disclosure policy and safe-harbour text, triage SLA, hall of fame; bug bounty later | B | P5 | S |
| SEC-17 | **Patient-data vault**: prescriptions and patient fields in a separate encrypted store, access logged with purpose, retention auto-delete after the legal period ⚠ | R | P4 | M |
| SEC-18 | **Trust centre and security pack**: public trust page, security whitepaper, VAPT summary, DPA template, sub-processor list, ready answers to security questionnaires | B | P6 | C |

## 33. Walk-in and counter customers (24-11-2026)

A walk-in bill must stay fast (no details needed for an OTC sale), but the counter often has the buyer's name and phone, and Schedule H1 / X needs the patient's name (R-18). Walk-in details are stored **on the bill**, not as a customer, unless the cashier chooses to save them. Field rules: [DOCUMENT_FIELDS.md](DOCUMENT_FIELDS.md) §2.

| ID | Feature | Ed. | Ph. | Pri. |
|---|---|---|---|---|
| POS-30 | **Walk-in customer details**: optional name, mobile, age, gender and address on a walk-in bill, stored as a snapshot on the bill (no customer record); patient name required when the bill has a Schedule H1 / X line; a mobile that matches a saved customer offers to link the bill; "Save as customer" creates a Retail (person) customer; walk-in mobiles with repeat visits listed for conversion (CRM-10); printed on the bill; searchable by mobile for returns and reprints; DPDP notice and consent before storing the mobile ⚠ | R | P4 | M |
| POS-31 | **Add and edit a customer from POS**: F3 picker shows "+ New customer" (Alt+N), and a typed unknown mobile offers "Add as new customer"; dialog with mobile, name, age, gender, address + PIN, regular doctor, allergies; saves a Retail (person) customer into the **same customer master** and selects it on the bill; "Edit customer" on the selected customer; duplicate mobile offers the existing customer instead; walk-in details already typed are carried into the dialog; consent recorded ⚠; old bills keep their snapshot | R | P4 | M |

---

### MVP definition (Pilot release, end of P5)

Platform admin, licensing (LIC-01 … LIC-08), masters, purchase (+ CSV import), batch inventory with expiry, retail POS (online + offline desktop), returns incl. expiry returns, Schedule H1 register, payments & outstanding, wholesale orders/invoices with credit and e-invoice, core reports, notifications by email + WhatsApp share link, Azure deployment with backups and monitoring.
