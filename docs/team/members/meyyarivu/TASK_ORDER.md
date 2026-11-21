# Meyyarivu — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**174 tasks** · P0: 4 · P1: 9 · P2: 6 · P3: 32 · P4: 41 · P5: 49 · P6: 21 · P7: 12

## P0 · Foundation (4)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | Learn/refresh: Next.js App Router (client-side), TanStack Query, RHF + Zod, shadcn/ui, Tailwind v4 | Groundwork | — |
| 2 | Read `docs/design/DESIGN_LANGUAGE.md`; wireframes: app shell, POS, purchase grid, list/form/report patterns | Groundwork | — |
| 3 | POS keyboard map proposal (`docs/design/POS_KEYBOARD.md`) | Groundwork | — |
| 4 | Pair sessions with Ashok and Nitheesh on the frontend stack | Groundwork | — |

## P1 · Platform core (9)

| Step | Task | Type | With |
|---|---|---|---|
| 5 | Next.js scaffold (static export), Tailwind v4, tokens in `packages/ui/src/tokens` | Groundwork | — |
| 6 | shadcn new-york in `packages/ui`: Button, Input, Select, Dialog, Menu, DataTable, Tabs, Toast, Confirm, DatePicker, Combobox, Badge, EmptyState | Groundwork | — |
| 7 | App shell + sidebar from `docs/design/NAVIGATION.md` (edition and permission aware) | Groundwork | — |
| 8 | Page patterns: ListPage, FormPage, ReportPage, DocumentGrid; documented in `apps/web/AGENTS.md` | Groundwork | — |
| 9 | Form validation kit: Zod schemas in `packages/validation`, field errors from Problem Details, no hard-coded option lists | Groundwork | — |
| 10 | Auth pages: login, forgot/reset password, accept invitation, signup wizard; TanStack Query, error handling, MSW mocks | Groundwork | — |
| 11 | AUT-01 Forgot / reset password (single-use emailed token, 30 min expiry, all sessions revoked on reset); sign in with email or username | Feature | Nitheesh |
| 12 | NAV-01 App sidebar navigation: Dashboard + 10 groups (Sales, Purchase, Inventory, Masters, Wholesale, Finance, CRM & Engagement, Reports, GST & Compliance, Administration) exactly as in NAVIGATION.md; hides items by edition and permission; collapsible rail; remembers open groups | Feature | Nitheesh |
| 13 | Design-check script (`scripts/design/check-design.mjs`) running in pre-commit, Claude hook and CI | Readiness | — |

## P2 · Masters (6)

| Step | Task | Type | With |
|---|---|---|---|
| 14 | Barcode input, item/party search combobox (used by POS and purchase) | Groundwork | — |
| 15 | Onboarding configuration wizard and checklist screens | Groundwork | — |
| 16 | AUT-02 Initial configuration wizard: tax settings, invoice number series, currency (INR), units, rounding, negative-stock policy (writes tenant settings, nothing hard-coded) | Feature | Nitheesh |
| 17 | DOC-04 Masters for transporters, terms & conditions, narrations, modes of payment, salesman/agent | Feature | Kamesh |
| 18 | GST-09 GST configuration: registrations per company, rate master, reverse-charge and composition settings (data, never hard-coded) | Feature | Kamesh |
| 19 | AUT-03 Onboarding checklist: setup steps with progress (company, licence, GST, branch, users, items, opening stock, printer) until the business is ready to bill | Feature | Nitheesh |

## P3 · Purchase & inventory (32)

| Step | Task | Type | With |
|---|---|---|---|
| 20 | Purchase entry grid (batch/expiry/MRP/free qty, live totals from `billing-engine`), GRN and verification | Groundwork | — |
| 21 | Import mapping wizard | Groundwork | — |
| 22 | Stock & batch views, expiry dashboard actions, stock adjustments | Groundwork | — |
| 23 | PRC-01 Batch-wise MRP, PTR, PTS, purchase rate, selling rate | Feature | Kamesh |
| 24 | PRC-04 Free-quantity schemes (10+1, 20+3) on purchase and sale | Feature | Kamesh |
| 25 | PRC-05 Scheme discount %, trade discount, cash discount (verify) order of application | Feature | Kamesh |
| 26 | PUR-01 Purchase order (manual or from reorder suggestions), email/WhatsApp PO to supplier | Feature | Kamesh |
| 27 | PUR-02 Purchase invoice entry: supplier inv no/date, lines with batch, expiry, MRP, PTR, qty, free qty, discounts, GST | Feature | Kamesh |
| 28 | PUR-04 Distributor CSV / Excel purchase import with item mapping memory (supplier item code → our item) | Feature | Kamesh |
| 29 | PUR-05 Duplicate supplier invoice detection | Feature | Kamesh |
| 30 | PUR-07 Purchase posting → batches, stock movements, supplier ledger | Feature | Kamesh |
| 31 | PUR-08 Purchase cancellation via reversal (no edit after post) | Feature | Kamesh |
| 32 | PUR-13 PO tracking: pending, partially received, closed; pending purchases list | Feature | Kamesh |
| 33 | INV-01 Batch-wise stock (batch no, mfg date, expiry, MRP, cost) per branch | Feature | Kamesh |
| 34 | INV-02 Movement ledger for every change (purchase, sale, returns, transfer, adjustment, count) | Feature | Kamesh |
| 35 | INV-05 Near-expiry dashboard (30/60/90 days) with actions: return to supplier, discount, transfer | Feature | Kamesh |
| 36 | INV-06 Low stock / out of stock alerts | Feature | Kamesh |
| 37 | INV-07 Stock adjustment with reason codes (damage, theft, sample, correction) and approval | Feature | Kamesh |
| 38 | INV-10 Stock valuation (FIFO / weighted average, incl. free goods) | Feature | Kamesh |
| 39 | INV-11 Opening stock import | Feature | Kamesh |
| 40 | INV-12 Nightly reconciliation of balances vs ledger, alerts on drift | Feature | Kamesh |
| 41 | MKT-01 Short book / shortage list: items marked at the counter when out of stock or low; one click turns it into a PO per supplier | Feature | Kamesh |
| 42 | DOC-02 Full purchase cycle: Purchase order → Purchase challan (goods without bill) → Purchase bill → Return → Debit note | Feature | Kamesh |
| 43 | GST-01 Intra/inter-state determination, CGST/SGST/IGST, cess | Feature | Kamesh |
| 44 | GST-11 Invoice GST validation before posting (GSTIN format/state, place of supply, HSN, rate, totals) | Feature | Kamesh |
| 45 | PRC-09 Price change history | Feature | Kamesh |
| 46 | PUR-03 Goods receipt (GRN) with short/excess/damaged quantities | Feature | Kamesh |
| 47 | PUR-12 Purchase dashboard: open POs, pending GRNs, payables due, price changes | Feature | Kamesh |
| 48 | PUR-14 Purchase verification: match supplier bill against PO and GRN (qty, batch, rate) before posting | Feature | Kamesh |
| 49 | QA: Role dashboards · P3 (1 feature) | QA | — |
| 50 | QA: Reports · P3 (4 features) | QA | — |
| 51 | QA: Administration settings · P3 (1 feature) | QA | — |

## P4 · Retail POS & returns (41)

| Step | Task | Type | With |
|---|---|---|---|
| 52 | POS: barcode-first, search by name/salt/manufacturer, batch picker, payments, hold/recall, discount approval | Groundwork | — |
| 53 | Prescription capture and restricted-medicine alerts | Groundwork | — |
| 54 | Print templates (thermal 2"/3", A4/A5) | Groundwork | — |
| 55 | Notification centre | Groundwork | — |
| 56 | PRC-06 Item/category/party-wise discount rules, max discount per role | Feature | Kamesh |
| 57 | PRC-07 Bill-level discount and round-off | Feature | Kamesh |
| 58 | PRC-08 Never sell above MRP (hard rule) | Feature | Kamesh |
| 59 | INV-03 FEFO batch suggestion (first expiry first out) at sale | Feature | Kamesh |
| 60 | INV-04 Expiry block: cannot sell expired; warn within N days (setting) | Feature | Kamesh |
| 61 | INV-18 FEFO override with an authorised reason (recorded in the movement and audit log) | Feature | Kamesh |
| 62 | MKT-02 Salt-wise / composition-wise search with all brands and stock shown side by side | Feature | Kamesh |
| 63 | MKT-05 Party-wise last rate and last discount shown while billing and purchasing | Feature | Kamesh |
| 64 | POS-01 Keyboard-first billing screen (F-keys, no mouse needed), barcode-first | Feature | Kamesh |
| 65 | POS-02 Fast search by name / generic / composition / barcode, fuzzy, < 150 ms | Feature | Kamesh |
| 66 | POS-03 Batch picker with FEFO default, expiry and stock shown | Feature | Kamesh |
| 67 | POS-04 Loose quantity sale (tablets from strip) | Feature | Kamesh |
| 68 | POS-05 Customer + doctor selection, quick add customer by phone | Feature | Kamesh |
| 69 | POS-06 Prescription capture for Schedule H/H1/X (doctor, Rx no., image upload/scan) — blocks sale until captured | Feature | Kamesh |
| 70 | POS-07 Multiple payment modes in one bill (cash, UPI, card, credit, wallet), change calculation | Feature | Kamesh |
| 71 | POS-09 Hold / recall bills, multiple open bills | Feature | Kamesh |
| 72 | POS-10 Thermal (2"/3") and A4/A5 invoice printing, configurable templates | Feature | Kamesh |
| 73 | POS-12 Sales return / exchange from POS against invoice | Feature | Kamesh |
| 74 | POS-20 Invoice list and details: search, filter, reprint, share, cancel through credit note | Feature | Kamesh |
| 75 | POS-21 Discount approval at the counter: manager PIN override above the role limit, logged | Feature | Kamesh |
| 76 | POS-22 Search by manufacturer and by salt in POS search (in addition to name/barcode) | Feature | Kamesh |
| 77 | GST-02 HSN summary on invoices and reports | Feature | Kamesh |
| 78 | NTF-01 In-app notification centre | Feature | Nitheesh |
| 79 | NTF-02 Email (invoices, reports, alerts) | Feature | Nitheesh |
| 80 | NTF-05 Alert rules: low stock, near expiry, credit overdue, licence expiry, device not synced | Feature | Nitheesh |
| 81 | DSK-01 Windows installer (and macOS), auto-update with staged rollout | Feature | Nitheesh, Jeeva |
| 82 | DSK-03 Thermal/A4 printing without browser dialog, printer profiles per counter | Feature | Nitheesh, Jeeva |
| 83 | DSK-04 USB/HID barcode scanner support, weighing scale (later) | Feature | Nitheesh, Jeeva |
| 84 | NAV-02 Global command search (`Ctrl K`): jump to any menu item, item, party or document number | Feature | Nitheesh |
| 85 | MKT-04 Dump / broken / damaged stock bucket, kept separate from saleable stock, feeding expiry and breakage claims | Feature | Kamesh |
| 86 | POS-11 WhatsApp / SMS invoice share (PDF link) | Feature | Kamesh |
| 87 | POS-16 Substitute suggestion when item out of stock | Feature | Kamesh |
| 88 | Print templates checked on real thermal (58/80 mm) and A4/A5 printers | Readiness | — |
| 89 | QA: Role dashboards · P4 (4 features) | QA | — |
| 90 | QA: Reports · P4 (6 features) | QA | — |
| 91 | QA: Analytics · P4 (1 feature) | QA | — |
| 92 | QA: Administration settings · P4 (3 features) | QA | — |

## P5 · Wholesale, finance, offline (49)

| Step | Task | Type | With |
|---|---|---|---|
| 93 | Wholesale order entry, pick list, invoice, credit warnings, price lists and schemes screens | Groundwork | — |
| 94 | Transfers, stock count, GST e-invoice screens | Groundwork | — |
| 95 | Desktop: data-source switch online/offline, sync status bar, "Sync issues" screen, device registration | Groundwork | — |
| 96 | PRC-02 Price lists / rate levels (A/B/C retailers, institutions, hospitals) | Feature | Kamesh |
| 97 | PUR-11 Reorder suggestions (min/max, sales velocity, lead time) | Feature | Kamesh |
| 98 | INV-08 Branch-to-branch stock transfer (dispatch → in transit → receive) with GST delivery challan / inter-state invoice (verify) | Feature | Kamesh |
| 99 | POS-14 Shift open/close, cash denomination count, day-end report per counter | Feature | Kamesh |
| 100 | POS-15 Offline billing on desktop with sync (see OFFLINE_SYNC.md) | Feature | Kamesh |
| 101 | WHS-01 Sales order entry (phone/WhatsApp orders) with price list, schemes, credit check | Feature | Kamesh |
| 102 | WHS-02 Order → pick list → invoice (partial fulfilment, backorders) | Feature | Kamesh |
| 103 | WHS-03 Bulk GST tax invoice (A4), with DL nos. of both parties printed | Feature | Kamesh |
| 104 | WHS-04 Credit sales with due dates, credit limit enforcement | Feature | Kamesh |
| 105 | WHS-06 E-invoice (IRN + QR) generation via IRP/GSP (verify) turnover threshold | Feature | Kamesh |
| 106 | DOC-01 Full sales cycle: Quotation → Sales order → Delivery challan → Invoice → Return → Credit note (convert any step to the next, partial conversion supported) | Feature | Kamesh |
| 107 | GST-06 E-invoice and e-way bill (see WHS-06/07) | Feature | Kamesh |
| 108 | DSK-02 Offline SQLite store, sync engine, status bar indicator | Feature | Nitheesh, Jeeva |
| 109 | DSK-05 Device registration & revoke, local data encryption | Feature | Nitheesh, Jeeva |
| 110 | PRC-03 Margin-based selling price rules (e.g. PTR = MRP − 20 %) | Feature | Kamesh |
| 111 | PRC-10 Value-based schemes (spend ₹X, get Y % or free goods) | Feature | Kamesh |
| 112 | PRC-11 Company-wise (manufacturer-wise) discount rules for wholesale | Feature | Kamesh |
| 113 | PUR-06 Landed cost (freight, other charges) allocation | Feature | Kamesh |
| 114 | PUR-09 Rate difference / price change alerts vs last purchase | Feature | Kamesh |
| 115 | PUR-15 Supplier price comparison for an item across suppliers and time | Feature | Kamesh |
| 116 | INV-09 Physical stock count / cycle count with variance posting | Feature | Kamesh |
| 117 | INV-13 Dead / slow-moving stock report | Feature | Kamesh |
| 118 | INV-15 Barcode label printing for loose/repacked items | Feature | Kamesh |
| 119 | INV-16 Stock aging: by inward date and by expiry bucket | Feature | Kamesh |
| 120 | INV-17 Stock reservation for confirmed orders and held bills (available = on hand − reserved) | Feature | Kamesh |
| 121 | IJX-01 Stock inward / outward vouchers (non-purchase receipts and issues, e.g. samples, free goods from company) | Feature | Kamesh |
| 122 | MKT-06 Multi-warehouse within a branch (godown, cold room, display) with location-level stock | Feature | Kamesh |
| 123 | MKT-08 Customisable keyboard shortcuts per user (settings page) | Feature | Kamesh |
| 124 | POS-08 UPI QR on screen / on bill (static VPA QR with amount) | Feature | Kamesh |
| 125 | POS-17 Repeat last bill for a customer (chronic refill) | Feature | Kamesh |
| 126 | POS-19 Estimate / quotation convertible to bill | Feature | Kamesh |
| 127 | WHS-05 Delivery challan, dispatch, delivery tracking (packed, dispatched, delivered) | Feature | Kamesh |
| 128 | WHS-07 E-way bill generation for consignments above threshold (verify) | Feature | Kamesh |
| 129 | WHS-08 Retailer-wise / item-wise scheme overrides | Feature | Kamesh |
| 130 | WHS-09 Salesman assignment and commission report | Feature | Kamesh |
| 131 | WHS-13 Retailer claims: short supply, damage, rate difference; resolved by credit note | Feature | Kamesh |
| 132 | DOC-05 Document print designer (choose fields, logo, terms, copies) | Feature | Kamesh |
| 133 | NTF-03 WhatsApp Business API: invoice share, payment reminders, refill reminders (verify) template approval & cost | Feature | Nitheesh |
| 134 | NTF-04 SMS (DLT-registered templates) (verify) | Feature | Nitheesh |
| 135 | DSK-06 Local backup export of offline data (emergency) | Feature | Nitheesh, Jeeva |
| 136 | IJX-03 Batch category master (e.g. "cold chain", "high value") for reporting | Feature | Kamesh |
| 137 | POS-13 Cash drawer open, customer display (pole) | Feature | Kamesh |
| 138 | QA: Role dashboards · P5 (2 features) | QA | — |
| 139 | QA: Reports · P5 (3 features) | QA | — |
| 140 | QA: Analytics · P5 (3 features) | QA | — |
| 141 | QA: Administration settings · P5 (3 features) | QA | — |

## P6 · Pilot & GST returns (21)

| Step | Task | Type | With |
|---|---|---|---|
| 142 | UX fixes from pilot; POS speed tuning; GST returns screens | Groundwork | — |
| 143 | GST-03 GSTR-1 data export (B2B, B2C large/small, CDNR, HSN summary) in portal JSON/Excel format | Feature | Kamesh |
| 144 | GST-04 GSTR-3B summary | Feature | Kamesh |
| 145 | GST-10 Input tax credit register from purchases | Feature | Kamesh |
| 146 | MKT-03 Retailer → distributor online ordering (ERP-to-ERP): a retailer on MENO sends a PO that arrives as a sales order at a distributor on MENO, with live stock, rates and schemes; item codes, HSN and GST mapped automatically | Feature | Kamesh |
| 147 | MKT-10 Consolidated multi-branch dashboard for chains | Feature | Kamesh |
| 148 | WHS-11 Routes and beats (web): retailers per route, visit days | Feature | Kamesh |
| 149 | WHS-12 Delivery planning: schedule dispatches by route/vehicle, pick lists per trip | Feature | Kamesh |
| 150 | WHS-14 Scheme claims: reconcile schemes given to retailers with manufacturer claims | Feature | Kamesh |
| 151 | DOC-03 Commission vouchers for salesmen / agents (sales and purchase side) | Feature | Kamesh |
| 152 | GST-05 GSTR-2B reconciliation with purchases (import 2B JSON) | Feature | Kamesh |
| 153 | GST-07 Composition-scheme dealer support (bill of supply) (verify) | Feature | Kamesh |
| 154 | PUR-10 Scan supplier invoice (image/PDF) attach to purchase; OCR later | Feature | Kamesh |
| 155 | INV-14 Cold-chain items flag and storage reports | Feature | Kamesh |
| 156 | IJX-02 Stock journal (convert/repack: e.g. bulk into loose packs) | Feature | Kamesh |
| 157 | MKT-07 Expiry-based promotions (auto-suggested discount on near-expiry batches) | Feature | Kamesh |
| 158 | POS-18 Home delivery orders with delivery status | Feature | Kamesh |
| 159 | QA: Role dashboards · P6 (2 features) | QA | — |
| 160 | QA: Reports · P6 (2 features) | QA | — |
| 161 | QA: Analytics · P6 (2 features) | QA | — |
| 162 | QA: Administration settings · P6 (4 features) | QA | — |

## P7 · Growth (12)

| Step | Task | Type | With |
|---|---|---|---|
| 163 | Share `packages/ui` primitives with mobile (Expo) | Groundwork | — |
| 164 | MOB-01 Owner app: dashboard, approvals, alerts | Feature | Nitheesh |
| 165 | MOB-02 Salesman app: routes/beats, retailer visit, take order offline, schemes, credit status | Feature | Nitheesh |
| 166 | MOB-03 Collection app: record payments against invoices, receipt share | Feature | Nitheesh |
| 167 | MKT-09 AI-assisted item onboarding: create items and a draft purchase from a photo or PDF of a supplier bill | Feature | Kamesh |
| 168 | WHS-10 Retailer self-ordering portal (web) | Feature | Kamesh |
| 169 | GST-08 TCS/TDS fields where applicable (verify) | Feature | Kamesh |
| 170 | MOB-04 Delivery app: delivery proof (photo/signature), returns pickup | Feature | Nitheesh |
| 171 | MOB-05 Camera barcode scan for stock count | Feature | Nitheesh |
| 172 | QA: Reports · P7 (1 feature) | QA | — |
| 173 | QA: Analytics · P7 (1 feature) | QA | — |
| 174 | QA: Administration settings · P7 (1 feature) | QA | — |
