# Meyyarivu — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**245 tasks** · P0: 4 · P1: 10 · P2: 13 · P3: 37 · P4: 54 · P5: 80 · P6: 31 · P7: 16

## P0 · Foundation (4)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | ✅ Learn/refresh: Next.js App Router (client-side), TanStack Query, RHF + Zod, shadcn/ui, Tailwind v4 | Groundwork | — |
| 2 | ✅ Read `docs/design/DESIGN_LANGUAGE.md`; wireframes: app shell, POS, purchase grid, list/form/report patterns | Groundwork | — |
| 3 | ✅ POS keyboard map proposal (`docs/design/POS_KEYBOARD.md`) | Groundwork | — |
| 4 | ✅ Pair sessions with Ashok and Nitheesh on the frontend stack | Groundwork | — |

## P1 · Platform core (10)

| Step | Task | Type | With |
|---|---|---|---|
| 5 | Next.js scaffold (static export), Tailwind v4, tokens in `packages/ui/src/tokens` | Groundwork | — |
| 6 | shadcn new-york in `packages/ui`: Button, Input, Select, Dialog, Menu, DataTable, Tabs, Toast, Confirm, DatePicker, Combobox, Badge, EmptyState | Groundwork | — |
| 7 | App shell + sidebar from `docs/design/NAVIGATION.md` (edition and permission aware) | Groundwork | — |
| 8 | Page patterns: ListPage, FormPage, ReportPage, DocumentGrid; documented in `apps/web/AGENTS.md` | Groundwork | — |
| 9 | Form validation kit: Zod schemas in `packages/validation`, field errors from Problem Details, no hard-coded option lists | Groundwork | — |
| 10 | Auth pages: login, forgot/reset password, accept invitation, signup wizard; TanStack Query, error handling, MSW mocks | Groundwork | — |
| 11 | AUT-01 Forgot / reset password (single-use emailed token, 30 min expiry, all sessions revoked on reset); sign in with email or username | Feature | Nitheesh |
| 12 | AUT-04 Sign-up and verification: owner name, mobile OTP, email link, password policy, business name, state, partner code, trial / demo / license choice, DPDP notice acceptance stored with version; rate limits and bot checks | Feature | Nitheesh |
| 13 | NAV-01 App sidebar navigation: Dashboard + 10 groups (Sales, Purchase, Inventory, Masters, Wholesale, Finance, CRM & Engagement, Reports, GST & Compliance, Administration) exactly as in NAVIGATION.md; hides items by edition and permission; collapsible rail; remembers open groups | Feature | Nitheesh |
| 14 | Design-check script (`scripts/design/check-design.mjs`) running in pre-commit, Claude hook and CI | Readiness | — |

## P2 · Masters (13)

| Step | Task | Type | With |
|---|---|---|---|
| 15 | Barcode input, item/party search combobox (used by POS and purchase) | Groundwork | — |
| 16 | Onboarding configuration wizard and checklist screens | Groundwork | — |
| 17 | AUT-02 Initial configuration wizard: tax settings, invoice number series, currency (INR), units, rounding, negative-stock policy (writes tenant settings, nothing hard-coded) | Feature | Nitheesh |
| 18 | AUT-05 Business profile step: business type (retail, wholesale, both, hospital, chain), branches, catalogue size, current software, language; tailors the remaining steps and menus | Feature | Nitheesh |
| 19 | AUT-06 GSTIN-first company step: fetch fills legal name, address, state and registration type; state locked to the GSTIN; composition → Bill of Supply; PAN check; logo | Feature | Nitheesh |
| 20 | AUT-07 Licences and pharmacist step: retail / wholesale drug licences with expiry and scans, FSSAI, NDPS, pharmacist in charge with registration and council | Feature | Nitheesh |
| 21 | AUT-08 Invoice look set-up with live preview: paper size, logo, header, terms, bank details, UPI QR, signature, declaration, series preview | Feature | Nitheesh |
| 22 | AUT-15 Resume and progress: every step saved on Next, resume on sign-in, checklist on the dashboard until go-live, reminders to finish | Feature | Nitheesh |
| 23 | NAV-04 Global keyboard shortcuts: one shortcut registry, global keys, `G` go-to and `N` create sequences, list keys, form keys (`Ctrl+S`, `Ctrl+Enter`, `Ctrl+P`), shortcut sheet `Ctrl+/`, shortcuts in tooltips and command search (KEYBOARD_SHORTCUTS.md) | Feature | Nitheesh |
| 24 | DOC-04 Masters for transporters, terms & conditions, narrations, modes of payment, salesman/agent | Feature | Kamesh |
| 25 | GST-09 GST configuration: registrations per company, rate master, reverse-charge and composition settings (data, never hard-coded) | Feature | Kamesh |
| 26 | AUT-03 Onboarding checklist: setup steps with progress (company, licence, GST, branch, users, items, opening stock, printer) until the business is ready to bill | Feature | Nitheesh |
| 27 | AUT-09 Team step: invite staff by mobile or email with role and branch; counter PIN on first login | Feature | Nitheesh |

## P3 · Purchase & inventory (37)

| Step | Task | Type | With |
|---|---|---|---|
| 28 | Purchase entry grid (batch/expiry/MRP/free qty, live totals from `billing-engine`), GRN and verification | Groundwork | — |
| 29 | Import mapping wizard | Groundwork | — |
| 30 | Stock & batch views, expiry dashboard actions, stock adjustments | Groundwork | — |
| 31 | AUT-10 Data step: start fresh, Excel templates or migrate from current software; dry run, review and approve before commit; masters → opening stock by batch → outstanding → ledger openings | Feature | Kamesh |
| 32 | AUT-13 Go-live: readiness checks (GST, licences, books balanced, preferences, printer, stock, plan, email), go-live date, practice data removed, opening balances locked, series start | Feature | Nitheesh |
| 33 | NAV-05 Transaction-screen keyboard map: purchase entry, sales invoice, transfers and journals use the POS meanings (`F2` item, `F3` party, `F5` batch, `F10` save & post, `Ctrl+Del` remove line); full grid navigation without a mouse | Feature | Nitheesh |
| 34 | PRC-01 Batch-wise MRP, PTR, PTS, purchase rate, selling rate | Feature | Kamesh |
| 35 | PRC-04 Free-quantity schemes (10+1, 20+3) on purchase and sale | Feature | Kamesh |
| 36 | PRC-05 Scheme discount %, trade discount, cash discount (verify) order of application | Feature | Kamesh |
| 37 | PRC-12 Product price defaults: discount received %, discount allowed %, maximum discount % per item (lower of item and role cap wins) | Feature | Kamesh |
| 38 | PUR-01 Purchase order (manual or from reorder suggestions), email/WhatsApp PO to supplier | Feature | Kamesh |
| 39 | PUR-02 Purchase invoice entry: supplier inv no/date, lines with batch, expiry, MRP, PTR, qty, free qty, discounts, GST | Feature | Kamesh |
| 40 | PUR-04 Distributor CSV / Excel purchase import with item mapping memory (supplier item code → our item) | Feature | Kamesh |
| 41 | PUR-05 Duplicate supplier invoice detection | Feature | Kamesh |
| 42 | PUR-07 Purchase posting → batches, stock movements, supplier ledger | Feature | Kamesh |
| 43 | PUR-08 Purchase cancellation via reversal (no edit after post) | Feature | Kamesh |
| 44 | PUR-13 PO tracking: pending, partially received, closed; pending purchases list | Feature | Kamesh |
| 45 | INV-01 Batch-wise stock (batch no, mfg date, expiry, MRP, cost) per branch | Feature | Kamesh |
| 46 | INV-02 Movement ledger for every change (purchase, sale, returns, transfer, adjustment, count) | Feature | Kamesh |
| 47 | INV-05 Near-expiry dashboard (30/60/90 days) with actions: return to supplier, discount, transfer | Feature | Kamesh |
| 48 | INV-06 Low stock / out of stock alerts | Feature | Kamesh |
| 49 | INV-07 Stock adjustment with reason codes (damage, theft, sample, correction) and approval | Feature | Kamesh |
| 50 | INV-10 Stock valuation (FIFO / weighted average, incl. free goods) | Feature | Kamesh |
| 51 | INV-11 Opening stock import | Feature | Kamesh |
| 52 | INV-12 Nightly reconciliation of balances vs ledger, alerts on drift | Feature | Kamesh |
| 53 | MKT-01 Short book / shortage list: items marked at the counter when out of stock or low; one click turns it into a PO per supplier | Feature | Kamesh |
| 54 | DOC-02 Full purchase cycle: Purchase order → Purchase challan (goods without bill) → Purchase bill → Return → Debit note | Feature | Kamesh |
| 55 | GST-01 Intra/inter-state determination, CGST/SGST/IGST, cess | Feature | Kamesh |
| 56 | GST-11 Invoice GST validation before posting (GSTIN format/state, place of supply, HSN, rate, totals) | Feature | Kamesh |
| 57 | GST-15 GST rate change roll-over: effective-dated bulk HSN rate change, drafts and open orders re-priced on the change date, MRP relabel prompts for old stock, before/after report (verify) confirm rates with CA | Feature | Kamesh |
| 58 | PRC-09 Price change history | Feature | Kamesh |
| 59 | PUR-03 Goods receipt (GRN) with short/excess/damaged quantities | Feature | Kamesh |
| 60 | PUR-12 Purchase dashboard: open POs, pending GRNs, payables due, price changes | Feature | Kamesh |
| 61 | PUR-14 Purchase verification: match supplier bill against PO and GRN (qty, batch, rate) before posting | Feature | Kamesh |
| 62 | QA: Role dashboards · P3 (1 feature) | QA | — |
| 63 | QA: Reports · P3 (4 features) | QA | — |
| 64 | QA: Administration settings · P3 (1 feature) | QA | — |

## P4 · Retail POS & returns (54)

| Step | Task | Type | With |
|---|---|---|---|
| 65 | POS: barcode-first, search by name/salt/manufacturer, batch picker, payments, hold/recall, discount approval | Groundwork | — |
| 66 | Prescription capture and restricted-medicine alerts | Groundwork | — |
| 67 | Print templates (thermal 2"/3", A4/A5) | Groundwork | — |
| 68 | Notification centre | Groundwork | — |
| 69 | NAV-03 Desktop menu bar (File, Edit, View, Go, New, Window, Help) built from the same nav config as the sidebar, edition- and permission-aware, accelerators from KEYBOARD_SHORTCUTS.md | Feature | Nitheesh |
| 70 | PRC-06 Item/category/party-wise discount rules, max discount per role | Feature | Kamesh |
| 71 | PRC-07 Bill-level discount and round-off | Feature | Kamesh |
| 72 | PRC-08 Never sell above MRP (hard rule) | Feature | Kamesh |
| 73 | PRC-14 Totals breakdown on every invoice: sub total, item discount, bill discount, returns, taxable value, CGST / SGST / IGST / cess, charges, round off, grand total, each shown separately and never merged | Feature | Kamesh |
| 74 | INV-03 FEFO batch suggestion (first expiry first out) at sale | Feature | Kamesh |
| 75 | INV-04 Expiry block: cannot sell expired; warn within N days (setting) | Feature | Kamesh |
| 76 | INV-18 FEFO override with an authorised reason (recorded in the movement and audit log) | Feature | Kamesh |
| 77 | INV-20 Batch block / recall: block a batch across branches with a reason; traceability list of who bought it (RPT-14) and supplier return | Feature | Kamesh |
| 78 | MKT-02 Salt-wise / composition-wise search with all brands and stock shown side by side | Feature | Kamesh |
| 79 | MKT-05 Party-wise last rate and last discount shown while billing and purchasing | Feature | Kamesh |
| 80 | POS-01 Keyboard-first billing screen (F-keys, no mouse needed), barcode-first | Feature | Kamesh |
| 81 | POS-02 Fast search by name / generic / composition / barcode, fuzzy, < 150 ms | Feature | Kamesh |
| 82 | POS-03 Batch picker with FEFO default, expiry and stock shown | Feature | Kamesh |
| 83 | POS-04 Loose quantity sale (tablets from strip) | Feature | Kamesh |
| 84 | POS-05 Customer + doctor selection, quick add customer by phone | Feature | Kamesh |
| 85 | POS-06 Prescription capture for Schedule H/H1/X (doctor, Rx no., image upload/scan) — blocks sale until captured | Feature | Kamesh |
| 86 | POS-07 Multiple payment modes in one bill (cash, UPI, card, credit, wallet), change calculation | Feature | Kamesh |
| 87 | POS-09 Hold / recall bills, multiple open bills | Feature | Kamesh |
| 88 | POS-10 Thermal (2"/3") and A4/A5 invoice printing, configurable templates | Feature | Kamesh |
| 89 | POS-12 Sales return / exchange from POS against invoice | Feature | Kamesh |
| 90 | POS-20 Invoice list and details: search, filter, reprint, share, cancel through credit note | Feature | Kamesh |
| 91 | POS-21 Discount approval at the counter: manager PIN override above the role limit, logged | Feature | Kamesh |
| 92 | POS-22 Search by manufacturer and by salt in POS search (in addition to name/barcode) | Feature | Kamesh |
| 93 | POS-27 Reprint marking: reprints show "Duplicate copy" with reprint count, user and time audited | Feature | Kamesh |
| 94 | POS-28 POS line columns: item with pack, manufacturer, HSN and schedule badge; batch · expiry; qty; MRP; disc % and ₹; taxable; GST % and ₹; amount; column set configurable per counter (narrow screens hide optional columns) | Feature | Kamesh |
| 95 | DOC-07 Invoice print content standard: both parties' DL nos., GSTINs and state codes, invoice / order / L.R. / due date, line columns (S. no., product, packing, manufacturer, HSN, batch, expiry, qty, free, MRP, rate, disc %, GST %, amount), section headings, tax summary by rate, sub total, item discount, returns, taxable, tax heads, charges, round off, grand total, amount in words, terms from the terms master, declaration, E.&O.E., checked by, authorised signatory, bank / UPI QR, page x of y with carried-forward totals | Feature | Kamesh |
| 96 | DOC-08 Print formats: laser A4 / A5, dot-matrix on pre-printed stationery (fixed positions, carry-forward per page), thermal 2" / 3"; template chosen per document type, counter and party | Feature | Kamesh |
| 97 | GST-02 HSN summary on invoices and reports | Feature | Kamesh |
| 98 | NTF-01 In-app notification centre | Feature | Nitheesh |
| 99 | NTF-02 Email (invoices, reports, alerts) | Feature | Nitheesh |
| 100 | NTF-05 Alert rules: low stock, near expiry, credit overdue, licence expiry, device not synced | Feature | Nitheesh |
| 101 | DSK-01 Windows installer (and macOS), auto-update with staged rollout | Feature | Nitheesh, Jeeva |
| 102 | DSK-03 Thermal/A4 printing without browser dialog, printer profiles per counter | Feature | Nitheesh, Jeeva |
| 103 | DSK-04 USB/HID barcode scanner support, weighing scale (later) | Feature | Nitheesh, Jeeva |
| 104 | SEC-01 Tamper-evident records: hash-chained posted documents, statutory registers and audit log per series; signed daily anchors in immutable storage; nightly verifier and auditor "Verify records" report | Feature | Nitheesh, Jeeva |
| 105 | SEC-17 Patient-data vault: prescriptions and patient fields in a separate encrypted store, access logged with purpose, retention auto-delete after the legal period (verify) | Feature | Nitheesh, Jeeva |
| 106 | AUT-11 Devices step: desktop download, device registration, printer test page, barcode scan test, cash drawer test | Feature | Nitheesh, Jeeva |
| 107 | AUT-12 Practice mode: separate practice company with sample data and a guided first-bill tour; practice bills marked "not a tax invoice" and excluded from all reports | Feature | Nitheesh |
| 108 | NAV-02 Global command search (`Ctrl K`): jump to any menu item, item, party or document number | Feature | Nitheesh |
| 109 | PUR-19 Merge purchase orders: receive several open POs of one supplier into one purchase invoice or challan; pending-PO-lines report per supplier and item | Feature | Kamesh |
| 110 | INV-19 Batch MRP revision (price change notified by the manufacturer): new MRP from a date, relabel note, old stock rule, full audit | Feature | Kamesh |
| 111 | MKT-04 Dump / broken / damaged stock bucket, kept separate from saleable stock, feeding expiry and breakage claims | Feature | Kamesh |
| 112 | POS-11 WhatsApp / SMS invoice share (PDF link) | Feature | Kamesh |
| 113 | POS-16 Substitute suggestion when item out of stock | Feature | Kamesh |
| 114 | Print templates checked on real thermal (58/80 mm) and A4/A5 printers | Readiness | — |
| 115 | QA: Role dashboards · P4 (4 features) | QA | — |
| 116 | QA: Reports · P4 (6 features) | QA | — |
| 117 | QA: Analytics · P4 (1 feature) | QA | — |
| 118 | QA: Administration settings · P4 (3 features) | QA | — |

## P5 · Wholesale, finance, offline (80)

| Step | Task | Type | With |
|---|---|---|---|
| 119 | Wholesale order entry, pick list, invoice, credit warnings, price lists and schemes screens | Groundwork | — |
| 120 | Transfers, stock count, GST e-invoice screens | Groundwork | — |
| 121 | Desktop: data-source switch online/offline, sync status bar, "Sync issues" screen, device registration | Groundwork | — |
| 122 | LIC-07 Desktop offline license: cached certificate verified offline (signature, tenant, lifetime), clock-rollback check against the last server time seen, device activation counted against the device limit, restricted mode applied offline | Feature | Nitheesh, Jeeva |
| 123 | PRC-02 Price lists / rate levels (A/B/C retailers, institutions, hospitals) | Feature | Kamesh |
| 124 | PRC-15 Offer engine: bill value, item, item group, category, manufacturer, combo, buy-X-get-Y, accumulated purchase, time-bound (hours / days), customer segment and near-expiry batch offers; priority and stacking rules; usage report | Feature | Kamesh |
| 125 | PUR-11 Reorder suggestions (min/max, sales velocity, lead time) | Feature | Kamesh |
| 126 | PUR-20 Chain indents: outlets raise indents (manual or from min / max); head office consolidates them into supplier POs or fulfils from the warehouse by stock transfer; indent status per outlet | Feature | Kamesh |
| 127 | INV-08 Branch-to-branch stock transfer (dispatch → in transit → receive) with GST delivery challan / inter-state invoice (verify) | Feature | Kamesh |
| 128 | POS-14 Shift open/close, cash denomination count, day-end report per counter | Feature | Kamesh |
| 129 | POS-15 Offline billing on desktop with sync (see OFFLINE_SYNC.md) | Feature | Kamesh |
| 130 | WHS-01 Sales order entry (phone/WhatsApp orders) with price list, schemes, credit check | Feature | Kamesh |
| 131 | WHS-02 Order → pick list → invoice (partial fulfilment, backorders) | Feature | Kamesh |
| 132 | WHS-03 Bulk GST tax invoice (A4), with DL nos. of both parties printed | Feature | Kamesh |
| 133 | WHS-04 Credit sales with due dates, credit limit enforcement | Feature | Kamesh |
| 134 | WHS-06 E-invoice (IRN + QR) generation via IRP/GSP (verify) turnover threshold | Feature | Kamesh |
| 135 | WHS-15 Combined distributor bill: one printed document with sections Sales, Less sales return, Less breakage / expiry return, Add replacement; each return section is a credit note with its own number linked to the invoice, replacement lines are invoice lines (RET-07), the settlement is netted (verify) CA | Feature | Kamesh |
| 136 | WHS-16 Dispatch details on invoices: order no. + date, L.R. no. + date, transporter, vehicle no., number of cases, weight; printed and passed to the e-way bill | Feature | Kamesh |
| 137 | WHS-17 Stock & sales statement (secondary sales) per manufacturer / company: opening, purchase, purchase return, sales, sales return, free, closing by item for a month; Excel / PDF / email to the company or C&F | Feature | Kamesh |
| 138 | WHS-19 Dispatch checking (item checker): scan every item and batch against the invoice before dispatch on web or phone, mismatch alerts, several checkers in parallel, checker name on the packing slip; same scan for GRN check-in with rack allocation | Feature | Kamesh |
| 139 | DOC-01 Full sales cycle: Quotation → Sales order → Delivery challan → Invoice → Return → Credit note (convert any step to the next, partial conversion supported) | Feature | Kamesh |
| 140 | DOC-06 Additional charges on sales and purchase invoices (freight, insurance, packing, other): amount, GST treatment from the setting `billing.charges_gst` (verify), posted to its own ledger; on purchase, allocated into landed cost (PUR-06) | Feature | Kamesh |
| 141 | GST-06 E-invoice and e-way bill (see WHS-06/07) | Feature | Kamesh |
| 142 | DSK-02 Offline SQLite store, sync engine, status bar indicator | Feature | Nitheesh, Jeeva |
| 143 | DSK-05 Device registration & revoke, local data encryption | Feature | Nitheesh, Jeeva |
| 144 | SEC-02 Device-signed offline bills: per-device Ed25519 key in the OS keystore; offline bills signed; server verifies on sync; bad or revoked-device bills quarantined, owner alerted | Feature | Nitheesh |
| 145 | SEC-05 Insider-fraud detection: rules for voids, reprints, discounts, returns without bill, write-offs, price edits during shifts, after-hours activity, FEFO overrides, cash shortfalls; thresholds in configuration; alerts and case notes | Feature | Nitheesh, Jeeva |
| 146 | SEC-06 Privileged access management: separate platform-admin realm, hardware-key MFA, just-in-time elevation with approval and expiry, two-person rule for destructive actions, break-glass account with alert | Feature | Nitheesh, Jeeva |
| 147 | SEC-07 Security monitoring: central logs with redaction, detection rules (brute force, token reuse, impossible travel, mass export, cross-tenant attempt, admin outside hours), alerting, 180-day retention in India (verify) | Feature | Nitheesh, Jeeva |
| 148 | SEC-09 Desktop hardening: code-signed installer and updates, update signature check, sandboxed renderer, app-bundle integrity check, SQLCipher key in OS keystore, idle lock, remote wipe on device revoke | Feature | Nitheesh, Jeeva |
| 149 | AUT-14 Assisted onboarding: book a set-up call, chat, owner-granted time-boxed support access (view / assist) with full audit; partner (implementer) linking with the same consent | Feature | Nitheesh |
| 150 | PRC-03 Margin-based selling price rules (e.g. PTR = MRP − 20 %) | Feature | Kamesh |
| 151 | PRC-10 Value-based schemes (spend ₹X, get Y % or free goods) | Feature | Kamesh |
| 152 | PRC-11 Company-wise (manufacturer-wise) discount rules for wholesale | Feature | Kamesh |
| 153 | PRC-13 Minimum / maximum mark-up % per item (warn below cost + min mark-up, block below cost (verify) policy) and product commission % | Feature | Kamesh |
| 154 | PUR-06 Landed cost (freight, other charges) allocation | Feature | Kamesh |
| 155 | PUR-09 Rate difference / price change alerts vs last purchase | Feature | Kamesh |
| 156 | PUR-15 Supplier price comparison for an item across suppliers and time | Feature | Kamesh |
| 157 | INV-09 Physical stock count / cycle count with variance posting | Feature | Kamesh |
| 158 | INV-13 Dead / slow-moving stock report | Feature | Kamesh |
| 159 | INV-15 Barcode label printing for loose/repacked items | Feature | Kamesh |
| 160 | INV-16 Stock aging: by inward date and by expiry bucket | Feature | Kamesh |
| 161 | INV-17 Stock reservation for confirmed orders and held bills (available = on hand − reserved) | Feature | Kamesh |
| 162 | INV-21 Dosage labels: print a medicine label with patient name, dose, frequency, timing and instructions from the bill line (verify) pharmacist review of wording | Feature | Kamesh |
| 163 | INV-22 Stock reallocation: suggests moving non-moving or short-expiry stock to branches with demand or to the warehouse; one click creates the transfer | Feature | Kamesh |
| 164 | IJX-01 Stock inward / outward vouchers (non-purchase receipts and issues, e.g. samples, free goods from company) | Feature | Kamesh |
| 165 | MKT-06 Multi-warehouse within a branch (godown, cold room, display) with location-level stock | Feature | Kamesh |
| 166 | MKT-08 Customisable keyboard shortcuts per user (`/me/shortcuts`): change any key from KEYBOARD_SHORTCUTS.md, conflict check, reset to default, synced to desktop | Feature | Kamesh |
| 167 | POS-08 UPI QR on screen / on bill (static VPA QR with amount) | Feature | Kamesh |
| 168 | POS-17 Repeat last bill for a customer (chronic refill) | Feature | Kamesh |
| 169 | POS-19 Estimate / quotation convertible to bill | Feature | Kamesh |
| 170 | POS-23 One-click generic conversion: switch every branded line on a bill to an in-stock generic with the same salts + strength (CAT-15); show patient saving and margin per line; pharmacist confirms each swap; extends CAT-09 / POS-16 (verify) substitution rules | Feature | Kamesh |
| 171 | POS-24 Counter recommendations: among same-composition alternatives, rank by near-expiry batch and margin (configurable weights, never above MRP) | Feature | Kamesh |
| 172 | POS-25 Invoice verification QR: unique QR on every printed invoice opening a read-only verification page (number, date, total, store); no patient data | Feature | Kamesh |
| 173 | POS-26 Service billing: non-stock service items (BP / sugar check, injection charge, consultation fee, delivery charge) with own SAC and GST, no stock movement (verify) SAC / GST rates | Feature | Kamesh |
| 174 | POS-29 Multi-firm billing: one counter billing under different firms (companies / GSTINs) of the same tenant; firm picked per bill or by item rule; separate series, books and stock (extends PLT-02) | Feature | Kamesh |
| 175 | WHS-05 Delivery challan, dispatch, delivery tracking (packed, dispatched, delivered) | Feature | Kamesh |
| 176 | WHS-07 E-way bill generation for consignments above threshold (verify) | Feature | Kamesh |
| 177 | WHS-08 Retailer-wise / item-wise scheme overrides | Feature | Kamesh |
| 178 | WHS-09 Salesman assignment and commission report | Feature | Kamesh |
| 179 | WHS-13 Retailer claims: short supply, damage, rate difference; resolved by credit note | Feature | Kamesh |
| 180 | WHS-20 Packing slip, parcel and dispatch register: packing slip per case, parcel register, L.R. update after dispatch, delivery acknowledgement (POD) report | Feature | Kamesh |
| 181 | WHS-21 Collection tagging: assign outstanding bills to salesmen or collectors, print a collection sheet, record collections against it, assigned-vs-collected report | Feature | Kamesh |
| 182 | DOC-05 Document print designer (choose fields, logo, terms, copies) | Feature | Kamesh |
| 183 | NTF-03 WhatsApp Business API: invoice share, payment reminders, refill reminders (verify) template approval & cost | Feature | Nitheesh |
| 184 | NTF-04 SMS (DLT-registered templates) (verify) | Feature | Nitheesh |
| 185 | NTF-07 Owner daily digest: end-of-day email / WhatsApp with sales, collections, purchases, cash, low stock, near expiry, overdue and exceptions | Feature | Nitheesh |
| 186 | NTF-08 WhatsApp usage and cost: messages by Meta category (utility, marketing, authentication, service), template approval status, cost per branch and month, monthly cap and alert | Feature | Nitheesh |
| 187 | ADM-16 Status page and maintenance notices: public status, incident history, maintenance announced 72 h ahead, in-app banner | Feature | Jeeva |
| 188 | DSK-06 Local backup export of offline data (emergency) | Feature | Nitheesh, Jeeva |
| 189 | SEC-11 Data classification and export control: class per field (restricted-health, restricted-financial, confidential, internal, public); exports watermarked with user and time; approval for restricted data; bulk-export alert | Feature | Nitheesh, Jeeva |
| 190 | SEC-12 Tenant security centre: security score, MFA coverage, admins list, active sessions and devices, recent risky events, recommended actions | Feature | Nitheesh, Jeeva |
| 191 | SEC-13 Login protection: passkeys (WebAuthn) for owners and admins, new-device and new-location alerts, step-up challenge for risky sign-ins | Feature | Nitheesh, Jeeva |
| 192 | SEC-16 Responsible disclosure: security.txt, disclosure policy and safe-harbour text, triage SLA, hall of fame; bug bounty later | Feature | Nitheesh, Jeeva |
| 193 | IJX-03 Batch category master (e.g. "cold chain", "high value") for reporting | Feature | Kamesh |
| 194 | POS-13 Cash drawer open, customer display (pole) | Feature | Kamesh |
| 195 | QA: Role dashboards · P5 (2 features) | QA | — |
| 196 | QA: Reports · P5 (8 features) | QA | — |
| 197 | QA: Analytics · P5 (5 features) | QA | — |
| 198 | QA: Administration settings · P5 (7 features) | QA | — |

## P6 · Pilot & GST returns (31)

| Step | Task | Type | With |
|---|---|---|---|
| 199 | UX fixes from pilot; POS speed tuning; GST returns screens | Groundwork | — |
| 200 | GST-03 GSTR-1 data export (B2B, B2C large/small, CDNR, HSN summary) in portal JSON/Excel format | Feature | Kamesh |
| 201 | GST-04 GSTR-3B summary | Feature | Kamesh |
| 202 | GST-10 Input tax credit register from purchases | Feature | Kamesh |
| 203 | PUR-16 PDF / scanned purchase bill import: read lines from a distributor PDF or photo into a draft purchase that is reviewed before posting (brings MKT-09 forward for purchases) | Feature | Kamesh |
| 204 | PUR-17 Optimal stock levels: min / max per item and branch computed from sales velocity, lead time and expiry risk; request fulfilment rate (short-book hits vs misses) | Feature | Kamesh |
| 205 | MKT-03 Retailer → distributor online ordering (ERP-to-ERP): a retailer on MENO sends a PO that arrives as a sales order at a distributor on MENO, with live stock, rates and schemes; item codes, HSN and GST mapped automatically | Feature | Kamesh |
| 206 | MKT-10 Consolidated multi-branch dashboard for chains | Feature | Kamesh |
| 207 | WHS-11 Routes and beats (web): retailers per route, visit days | Feature | Kamesh |
| 208 | WHS-12 Delivery planning: schedule dispatches by route/vehicle, pick lists per trip | Feature | Kamesh |
| 209 | WHS-14 Scheme claims: reconcile schemes given to retailers with manufacturer claims | Feature | Kamesh |
| 210 | WHS-18 Sub-stockist accounting: sub-stockist party type, stock sent on sub-stockist terms, their secondary sales and claims, settlement | Feature | Kamesh |
| 211 | WHS-22 Sales targets and incentives: targets by salesman, area, company or product for a period; achievement tracking; incentive slabs; leaderboard | Feature | Kamesh |
| 212 | DOC-03 Commission vouchers for salesmen / agents (sales and purchase side) | Feature | Kamesh |
| 213 | GST-05 GSTR-2B reconciliation with purchases (import 2B JSON) | Feature | Kamesh |
| 214 | GST-07 Composition-scheme dealer support (bill of supply) (verify) | Feature | Kamesh |
| 215 | GST-12 Reverse charge (RCM) on applicable inward supplies (e.g. some services) with self-invoice and liability posting (verify) | Feature | Kamesh |
| 216 | GST-13 GSTR-9 annual summary data from posted documents (verify) | Feature | Kamesh |
| 217 | GST-14 Invoice Management System (IMS) workflow on inward invoices (accept / reject / pending) feeding GSTR-2B matching (verify) current GSTN process | Feature | Kamesh |
| 218 | SEC-03 Envelope encryption and key management: per-tenant data keys wrapped by a Key Vault master key, versioned keys, yearly rotation, crypto-shredding on tenant exit | Feature | Nitheesh, Jeeva |
| 219 | PUR-10 Scan supplier invoice (image/PDF) attach to purchase; OCR later | Feature | Kamesh |
| 220 | INV-14 Cold-chain items flag and storage reports | Feature | Kamesh |
| 221 | IJX-02 Stock journal (convert/repack: e.g. bulk into loose packs) | Feature | Kamesh |
| 222 | MKT-07 Expiry-based promotions (auto-suggested discount on near-expiry batches) | Feature | Kamesh |
| 223 | POS-18 Home delivery orders with delivery status | Feature | Kamesh |
| 224 | SEC-18 Trust centre and security pack: public trust page, security whitepaper, VAPT summary, DPA template, sub-processor list, ready answers to security questionnaires | Feature | Nitheesh, Jeeva |
| 225 | QA: Role dashboards · P6 (2 features) | QA | — |
| 226 | QA: Reports · P6 (3 features) | QA | — |
| 227 | QA: Analytics · P6 (3 features) | QA | — |
| 228 | QA: Administration settings · P6 (6 features) | QA | — |
| 229 | QA: Online channels (store page, customer app, marketplaces) · P6 (1 feature) | QA | — |

## P7 · Growth (16)

| Step | Task | Type | With |
|---|---|---|---|
| 230 | Share `packages/ui` primitives with mobile (Expo) | Groundwork | — |
| 231 | MOB-01 Owner app: dashboard, approvals, alerts | Feature | Nitheesh |
| 232 | MOB-02 Salesman app: routes/beats, retailer visit, take order offline, schemes, credit status | Feature | Nitheesh |
| 233 | MOB-03 Collection app: record payments against invoices, receipt share | Feature | Nitheesh |
| 234 | PUR-18 Distributor marketplace: compare rates, schemes and stock across connected distributors and place POs from one screen (extends MKT-03 beyond MENO-to-MENO) (verify) partner agreements | Feature | Kamesh |
| 235 | MKT-09 AI-assisted item onboarding: create items and a draft purchase from a photo or PDF of a supplier bill | Feature | Kamesh |
| 236 | WHS-10 Retailer self-ordering portal (web) | Feature | Kamesh |
| 237 | GST-08 TCS/TDS fields where applicable (verify) | Feature | Kamesh |
| 238 | NTF-06 Pill / dose-time reminders to patients from the prescription schedule, opt-in only (verify) consent, DPDP Act | Feature | Nitheesh |
| 239 | MOB-04 Delivery app: delivery proof (photo/signature), returns pickup | Feature | Nitheesh |
| 240 | MOB-05 Camera barcode scan for stock count | Feature | Nitheesh |
| 241 | MOB-06 Android quick-billing app for small shops with Bluetooth thermal printer, barcode by camera, offline queue | Feature | Nitheesh |
| 242 | QA: Reports · P7 (1 feature) | QA | — |
| 243 | QA: Analytics · P7 (1 feature) | QA | — |
| 244 | QA: Administration settings · P7 (2 features) | QA | — |
| 245 | QA: Online channels (store page, customer app, marketplaces) · P7 (3 features) | QA | — |
