# Meyyarivu — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**219 tasks** · P0: 5 · P1: 10 · P2: 12 · P3: 29 · P4: 51 · P5: 73 · P6: 23 · P7: 16

## P0 · Foundation (5)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | ✅ Learn/refresh: Next.js App Router (client-side), TanStack Query, RHF + Zod, shadcn/ui, Tailwind v4 | Groundwork | — |
| 2 | ✅ Read `docs/design/DESIGN_LANGUAGE.md`; wireframes: app shell, POS, purchase grid, list/form/report patterns | Groundwork | — |
| 3 | ✅ POS keyboard map proposal (`docs/design/POS_KEYBOARD.md`) | Groundwork | — |
| 4 | ✅ Pair sessions with Ashok and Nitheesh on the frontend stack | Groundwork | — |
| 5 | Buddy for Gokul (new frontend engineer): pair on the stack and page patterns, UI review of the first PRs | Groundwork | — |

## P1 · Platform core (10)

| Step | Task | Type | With |
|---|---|---|---|
| 6 | Next.js scaffold (static export), Tailwind v4, tokens in `packages/ui/src/tokens` | Groundwork | — |
| 7 | shadcn new-york in `packages/ui`: Button, Input, Select, Dialog, Menu, DataTable, Tabs, Toast, Confirm, DatePicker, Combobox, Badge, EmptyState | Groundwork | — |
| 8 | App shell + sidebar from `docs/design/NAVIGATION.md` (edition and permission aware) | Groundwork | — |
| 9 | Page patterns: ListPage, FormPage, ReportPage, DocumentGrid; documented in `apps/web/AGENTS.md` | Groundwork | — |
| 10 | Form validation kit: Zod schemas in `packages/validation`, field errors from Problem Details, no hard-coded option lists | Groundwork | — |
| 11 | Auth pages: login, forgot/reset password, accept invitation, signup wizard; TanStack Query, error handling, MSW mocks | Groundwork | — |
| 12 | AUT-01 Forgot / reset password (single-use emailed token, 30 min expiry, all sessions revoked on reset); sign in with email or username | Feature | Nitheesh |
| 13 | AUT-04 Sign-up and verification: owner name, mobile OTP, email link, password policy, business name, state, partner code, trial / demo / license choice, DPDP notice acceptance stored with version; rate limits and bot checks | Feature | Nitheesh |
| 14 | NAV-01 App sidebar navigation: Dashboard + 10 groups (Sales, Purchase, Inventory, Masters, Wholesale, Finance, CRM & Engagement, Reports, GST & Compliance, Administration) exactly as in NAVIGATION.md; hides items by edition and permission; collapsible rail; remembers open groups | Feature | Nitheesh |
| 15 | Design-check script (`scripts/design/check-design.mjs`) running in pre-commit, Claude hook and CI | Readiness | — |

## P2 · Masters (12)

| Step | Task | Type | With |
|---|---|---|---|
| 16 | Barcode input, item/party search combobox (used by POS and purchase) | Groundwork | — |
| 17 | Onboarding configuration wizard and checklist screens | Groundwork | — |
| 18 | AUT-02 Initial configuration wizard: tax settings, invoice number series, currency (INR), units, rounding, negative-stock policy (writes tenant settings, nothing hard-coded) | Feature | Nitheesh |
| 19 | AUT-05 Business profile step: business type (retail, wholesale, both, hospital, chain), branches, catalogue size, current software, language; tailors the remaining steps and menus | Feature | Nitheesh |
| 20 | AUT-06 GSTIN-first company step: fetch fills legal name, address, state and registration type; state locked to the GSTIN; composition → Bill of Supply; PAN check; logo | Feature | Nitheesh |
| 21 | AUT-07 Licences and pharmacist step: retail / wholesale drug licences with expiry and scans, FSSAI, NDPS, pharmacist in charge with registration and council | Feature | Nitheesh |
| 22 | AUT-08 Invoice look set-up with live preview: paper size, logo, header, terms, bank details, UPI QR, signature, declaration, series preview | Feature | Nitheesh |
| 23 | AUT-15 Resume and progress: every step saved on Next, resume on sign-in, checklist on the dashboard until go-live, reminders to finish | Feature | Nitheesh |
| 24 | NAV-04 Global keyboard shortcuts: one shortcut registry, global keys, `G` go-to and `N` create sequences, list keys, form keys (`Ctrl+S`, `Ctrl+Enter`, `Ctrl+P`), shortcut sheet `Ctrl+/`, shortcuts in tooltips and command search (KEYBOARD_SHORTCUTS.md) | Feature | Nitheesh |
| 25 | DOC-04 Masters for transporters, terms & conditions, narrations, modes of payment, salesman/agent | Feature | Kamesh |
| 26 | AUT-03 Onboarding checklist: setup steps with progress (company, licence, GST, branch, users, items, opening stock, printer) until the business is ready to bill | Feature | Nitheesh |
| 27 | AUT-09 Team step: invite staff by mobile or email with role and branch; counter PIN on first login | Feature | Nitheesh |

## P3 · Purchase & inventory (29)

| Step | Task | Type | With |
|---|---|---|---|
| 28 | Purchase entry grid (batch/expiry/MRP/free qty, live totals from `billing-engine`), GRN and verification | Groundwork | — |
| 29 | Import mapping wizard | Groundwork | — |
| 30 | Stock & batch views, expiry dashboard actions, stock adjustments | Groundwork | — |
| 31 | AUT-10 Data step: start fresh, Excel templates or migrate from current software; dry run, review and approve before commit; masters → opening stock by batch → outstanding → ledger openings | Feature | Kamesh |
| 32 | AUT-13 Go-live: readiness checks (GST, licences, books balanced, preferences, printer, stock, plan, email), go-live date, practice data removed, opening balances locked, series start | Feature | Nitheesh |
| 33 | NAV-05 Transaction-screen keyboard map: purchase entry, sales invoice, transfers and journals use the POS meanings (`F2` item, `F3` party, `F5` batch, `F10` save & post, `Ctrl+Del` remove line); full grid navigation without a mouse | Feature | Nitheesh |
| 34 | PUR-01 Purchase order (manual or from reorder suggestions), email/WhatsApp PO to supplier | Feature | Kamesh |
| 35 | PUR-02 Purchase invoice entry: supplier inv no/date, lines with batch, expiry, MRP, PTR, qty, free qty, discounts, GST | Feature | Kamesh |
| 36 | PUR-04 Distributor CSV / Excel purchase import with item mapping memory (supplier item code → our item) | Feature | Kamesh |
| 37 | PUR-05 Duplicate supplier invoice detection | Feature | Kamesh |
| 38 | PUR-07 Purchase posting → batches, stock movements, supplier ledger | Feature | Kamesh |
| 39 | PUR-08 Purchase cancellation via reversal (no edit after post) | Feature | Kamesh |
| 40 | PUR-13 PO tracking: pending, partially received, closed; pending purchases list | Feature | Kamesh |
| 41 | INV-01 Batch-wise stock (batch no, mfg date, expiry, MRP, cost) per branch | Feature | Kamesh |
| 42 | INV-02 Movement ledger for every change (purchase, sale, returns, transfer, adjustment, count) | Feature | Kamesh |
| 43 | INV-05 Near-expiry dashboard (30/60/90 days) with actions: return to supplier, discount, transfer | Feature | Kamesh |
| 44 | INV-06 Low stock / out of stock alerts | Feature | Kamesh |
| 45 | INV-07 Stock adjustment with reason codes (damage, theft, sample, correction) and approval | Feature | Kamesh |
| 46 | INV-10 Stock valuation (FIFO / weighted average, incl. free goods) | Feature | Kamesh |
| 47 | INV-11 Opening stock import | Feature | Kamesh |
| 48 | INV-12 Nightly reconciliation of balances vs ledger, alerts on drift | Feature | Kamesh |
| 49 | MKT-01 Short book / shortage list: items marked at the counter when out of stock or low; one click turns it into a PO per supplier | Feature | Kamesh |
| 50 | DOC-02 Full purchase cycle: Purchase order → Purchase challan (goods without bill) → Purchase bill → Return → Debit note | Feature | Kamesh |
| 51 | PUR-03 Goods receipt (GRN) with short/excess/damaged quantities | Feature | Kamesh |
| 52 | PUR-12 Purchase dashboard: open POs, pending GRNs, payables due, price changes | Feature | Kamesh |
| 53 | PUR-14 Purchase verification: match supplier bill against PO and GRN (qty, batch, rate) before posting | Feature | Kamesh |
| 54 | QA: Role dashboards · P3 (1 feature) | QA | — |
| 55 | QA: Reports · P3 (4 features) | QA | — |
| 56 | QA: Administration settings · P3 (1 feature) | QA | — |

## P4 · Retail POS & returns (51)

| Step | Task | Type | With |
|---|---|---|---|
| 57 | POS: barcode-first, search by name/salt/manufacturer, batch picker, payments, hold/recall, discount approval | Groundwork | — |
| 58 | Prescription capture and restricted-medicine alerts | Groundwork | — |
| 59 | Print templates (thermal 2"/3", A4/A5) | Groundwork | — |
| 60 | Notification centre | Groundwork | — |
| 61 | NAV-03 Desktop menu bar (File, Edit, View, Go, New, Window, Help) built from the same nav config as the sidebar, edition- and permission-aware, accelerators from KEYBOARD_SHORTCUTS.md | Feature | Nitheesh |
| 62 | INV-03 FEFO batch suggestion (first expiry first out) at sale | Feature | Kamesh |
| 63 | INV-04 Expiry block: cannot sell expired; warn within N days (setting) | Feature | Kamesh |
| 64 | INV-18 FEFO override with an authorised reason (recorded in the movement and audit log) | Feature | Kamesh |
| 65 | INV-20 Batch block / recall: block a batch across branches with a reason; traceability list of who bought it (RPT-14) and supplier return | Feature | Kamesh |
| 66 | MKT-02 Salt-wise / composition-wise search with all brands and stock shown side by side | Feature | Kamesh |
| 67 | MKT-05 Party-wise last rate and last discount shown while billing and purchasing | Feature | Kamesh |
| 68 | POS-01 Keyboard-first billing screen (F-keys, no mouse needed), barcode-first | Feature | Kamesh |
| 69 | POS-02 Fast search by name / generic / composition / barcode, fuzzy, < 150 ms | Feature | Kamesh |
| 70 | POS-03 Batch picker with FEFO default, expiry and stock shown | Feature | Kamesh |
| 71 | POS-04 Loose quantity sale (tablets from strip) | Feature | Kamesh |
| 72 | POS-05 Customer + doctor selection, quick add customer by phone | Feature | Kamesh |
| 73 | POS-06 Prescription capture for Schedule H/H1/X (doctor, Rx no., image upload/scan) — blocks sale until captured | Feature | Kamesh |
| 74 | POS-07 Multiple payment modes in one bill (cash, UPI, card, credit, wallet), change calculation | Feature | Kamesh |
| 75 | POS-09 Hold / recall bills, multiple open bills | Feature | Kamesh |
| 76 | POS-10 Thermal (2"/3") and A4/A5 invoice printing, configurable templates | Feature | Kamesh |
| 77 | POS-12 Sales return / exchange from POS against invoice | Feature | Kamesh |
| 78 | POS-20 Invoice list and details: search, filter, reprint, share, cancel through credit note | Feature | Kamesh |
| 79 | POS-21 Discount approval at the counter: manager PIN override above the role limit, logged | Feature | Kamesh |
| 80 | POS-22 Search by manufacturer and by salt in POS search (in addition to name/barcode) | Feature | Kamesh |
| 81 | POS-27 Reprint marking: reprints show "Duplicate copy" with reprint count, user and time audited | Feature | Kamesh |
| 82 | POS-28 POS line columns: item with pack, manufacturer, HSN and schedule badge; batch · expiry; qty; MRP; disc % and ₹; taxable; GST % and ₹; amount; column set configurable per counter (narrow screens hide optional columns) | Feature | Kamesh |
| 83 | POS-30 Walk-in customer details: optional name, mobile, age, gender and address on a walk-in bill, stored as a snapshot on the bill (no customer record); patient name required when the bill has a Schedule H1 / X line; a mobile that matches a saved customer offers to link the bill; "Save as customer" creates a Retail (person) customer; walk-in mobiles with repeat visits listed for conversion (CRM-10); printed on the bill; searchable by mobile for returns and reprints; DPDP notice and consent before storing the mobile (verify) | Feature | Kamesh |
| 84 | POS-31 Add and edit a customer from POS: F3 picker shows "+ New customer" (Alt+N), and a typed unknown mobile offers "Add as new customer"; dialog with mobile, name, age, gender, address + PIN, regular doctor, allergies; saves a Retail (person) customer into the same customer master and selects it on the bill; "Edit customer" on the selected customer; duplicate mobile offers the existing customer instead; walk-in details already typed are carried into the dialog; consent recorded (verify); old bills keep their snapshot | Feature | Kamesh |
| 85 | DOC-07 Invoice print content standard: both parties' DL nos., GSTINs and state codes, invoice / order / L.R. / due date, line columns (S. no., product, packing, manufacturer, HSN, batch, expiry, qty, free, MRP, rate, disc %, GST %, amount), section headings, tax summary by rate, sub total, item discount, returns, taxable, tax heads, charges, round off, grand total, amount in words, terms from the terms master, declaration, E.&O.E., checked by, authorised signatory, bank / UPI QR, page x of y with carried-forward totals | Feature | Kamesh |
| 86 | DOC-08 Print formats: laser A4 / A5, dot-matrix on pre-printed stationery (fixed positions, carry-forward per page), thermal 2" / 3"; template chosen per document type, counter and party | Feature | Kamesh |
| 87 | NTF-01 In-app notification centre | Feature | Nitheesh |
| 88 | NTF-02 Email (invoices, reports, alerts) | Feature | Nitheesh |
| 89 | NTF-05 Alert rules: low stock, near expiry, credit overdue, licence expiry, device not synced | Feature | Nitheesh |
| 90 | DSK-01 Windows installer (and macOS), auto-update with staged rollout | Feature | Nitheesh, Jeeva |
| 91 | DSK-03 Thermal/A4 printing without browser dialog, printer profiles per counter | Feature | Nitheesh, Jeeva |
| 92 | DSK-04 USB/HID barcode scanner support, weighing scale (later) | Feature | Nitheesh, Jeeva |
| 93 | SEC-01 Tamper-evident records: hash-chained posted documents, statutory registers and audit log per series; signed daily anchors in immutable storage; nightly verifier and auditor "Verify records" report | Feature | Nitheesh, Jeeva |
| 94 | SEC-17 Patient-data vault: prescriptions and patient fields in a separate encrypted store, access logged with purpose, retention auto-delete after the legal period (verify) | Feature | Nitheesh, Jeeva |
| 95 | AUT-11 Devices step: desktop download, device registration, printer test page, barcode scan test, cash drawer test | Feature | Nitheesh, Jeeva |
| 96 | AUT-12 Practice mode: separate practice company with sample data and a guided first-bill tour; practice bills marked "not a tax invoice" and excluded from all reports | Feature | Nitheesh |
| 97 | NAV-02 Global command search (`Ctrl K`): jump to any menu item, item, party or document number | Feature | Nitheesh |
| 98 | PUR-19 Merge purchase orders: receive several open POs of one supplier into one purchase invoice or challan; pending-PO-lines report per supplier and item | Feature | Kamesh |
| 99 | INV-19 Batch MRP revision (price change notified by the manufacturer): new MRP from a date, relabel note, old stock rule, full audit | Feature | Kamesh |
| 100 | MKT-04 Dump / broken / damaged stock bucket, kept separate from saleable stock, feeding expiry and breakage claims | Feature | Kamesh |
| 101 | POS-11 WhatsApp / SMS invoice share (PDF link) | Feature | Kamesh |
| 102 | POS-16 Substitute suggestion when item out of stock | Feature | Kamesh |
| 103 | Print templates checked on real thermal (58/80 mm) and A4/A5 printers | Readiness | — |
| 104 | QA: Role dashboards · P4 (4 features) | QA | — |
| 105 | QA: Reports · P4 (6 features) | QA | — |
| 106 | QA: Analytics · P4 (1 feature) | QA | — |
| 107 | QA: Administration settings · P4 (3 features) | QA | — |

## P5 · Wholesale, finance, offline (73)

| Step | Task | Type | With |
|---|---|---|---|
| 108 | Wholesale order entry, pick list, invoice, credit warnings screens (price lists and schemes screens: Gokul) | Groundwork | — |
| 109 | Transfers and stock count screens (GST e-invoice screens: Gokul) | Groundwork | — |
| 110 | Desktop: data-source switch online/offline, sync status bar, "Sync issues" screen, device registration | Groundwork | — |
| 111 | LIC-07 Desktop offline license: cached certificate verified offline (signature, tenant, lifetime), clock-rollback check against the last server time seen, device activation counted against the device limit, restricted mode applied offline | Feature | Nitheesh, Jeeva |
| 112 | PUR-11 Reorder suggestions (min/max, sales velocity, lead time) | Feature | Kamesh |
| 113 | PUR-20 Chain indents: outlets raise indents (manual or from min / max); head office consolidates them into supplier POs or fulfils from the warehouse by stock transfer; indent status per outlet | Feature | Kamesh |
| 114 | INV-08 Branch-to-branch stock transfer (dispatch → in transit → receive) with GST delivery challan / inter-state invoice (verify) | Feature | Kamesh |
| 115 | POS-14 Shift open/close, cash denomination count, day-end report per counter | Feature | Kamesh |
| 116 | POS-15 Offline billing on desktop with sync (see OFFLINE_SYNC.md) | Feature | Kamesh |
| 117 | WHS-01 Sales order entry (phone/WhatsApp orders) with price list, schemes, credit check | Feature | Kamesh |
| 118 | WHS-02 Order → pick list → invoice (partial fulfilment, backorders) | Feature | Kamesh |
| 119 | WHS-03 Bulk GST tax invoice (A4), with DL nos. of both parties printed | Feature | Kamesh |
| 120 | WHS-04 Credit sales with due dates, credit limit enforcement | Feature | Kamesh |
| 121 | WHS-06 E-invoice (IRN + QR) generation via IRP/GSP (verify) turnover threshold | Feature | Kamesh |
| 122 | WHS-15 Combined distributor bill: one printed document with sections Sales, Less sales return, Less breakage / expiry return, Add replacement; each return section is a credit note with its own number linked to the invoice, replacement lines are invoice lines (RET-07), the settlement is netted (verify) CA | Feature | Kamesh |
| 123 | WHS-16 Dispatch details on invoices: order no. + date, L.R. no. + date, transporter, vehicle no., number of cases, weight; printed and passed to the e-way bill | Feature | Kamesh |
| 124 | WHS-17 Stock & sales statement (secondary sales) per manufacturer / company: opening, purchase, purchase return, sales, sales return, free, closing by item for a month; Excel / PDF / email to the company or C&F | Feature | Kamesh |
| 125 | WHS-19 Dispatch checking (item checker): scan every item and batch against the invoice before dispatch on web or phone, mismatch alerts, several checkers in parallel, checker name on the packing slip; same scan for GRN check-in with rack allocation | Feature | Kamesh |
| 126 | DOC-01 Full sales cycle: Quotation → Sales order → Delivery challan → Invoice → Return → Credit note (convert any step to the next, partial conversion supported) | Feature | Kamesh |
| 127 | DOC-06 Additional charges on sales and purchase invoices (freight, insurance, packing, other): amount, GST treatment from the setting `billing.charges_gst` (verify), posted to its own ledger; on purchase, allocated into landed cost (PUR-06) | Feature | Kamesh |
| 128 | DSK-02 Offline SQLite store, sync engine, status bar indicator | Feature | Nitheesh, Jeeva |
| 129 | DSK-05 Device registration & revoke, local data encryption | Feature | Nitheesh, Jeeva |
| 130 | SEC-02 Device-signed offline bills: per-device Ed25519 key in the OS keystore; offline bills signed; server verifies on sync; bad or revoked-device bills quarantined, owner alerted | Feature | Nitheesh |
| 131 | SEC-05 Insider-fraud detection: rules for voids, reprints, discounts, returns without bill, write-offs, price edits during shifts, after-hours activity, FEFO overrides, cash shortfalls; thresholds in configuration; alerts and case notes | Feature | Nitheesh, Jeeva |
| 132 | SEC-06 Privileged access management: separate platform-admin realm, hardware-key MFA, just-in-time elevation with approval and expiry, two-person rule for destructive actions, break-glass account with alert | Feature | Nitheesh, Jeeva |
| 133 | SEC-07 Security monitoring: central logs with redaction, detection rules (brute force, token reuse, impossible travel, mass export, cross-tenant attempt, admin outside hours), alerting, 180-day retention in India (verify) | Feature | Nitheesh, Jeeva |
| 134 | SEC-09 Desktop hardening: code-signed installer and updates, update signature check, sandboxed renderer, app-bundle integrity check, SQLCipher key in OS keystore, idle lock, remote wipe on device revoke | Feature | Nitheesh, Jeeva |
| 135 | AUT-14 Assisted onboarding: book a set-up call, chat, owner-granted time-boxed support access (view / assist) with full audit; partner (implementer) linking with the same consent | Feature | Nitheesh |
| 136 | PUR-06 Landed cost (freight, other charges) allocation | Feature | Kamesh |
| 137 | PUR-09 Rate difference / price change alerts vs last purchase | Feature | Kamesh |
| 138 | PUR-15 Supplier price comparison for an item across suppliers and time | Feature | Kamesh |
| 139 | INV-09 Physical stock count / cycle count with variance posting | Feature | Kamesh |
| 140 | INV-13 Dead / slow-moving stock report | Feature | Kamesh |
| 141 | INV-15 Barcode label printing for loose/repacked items | Feature | Kamesh |
| 142 | INV-16 Stock aging: by inward date and by expiry bucket | Feature | Kamesh |
| 143 | INV-17 Stock reservation for confirmed orders and held bills (available = on hand − reserved) | Feature | Kamesh |
| 144 | INV-21 Dosage labels: print a medicine label with patient name, dose, frequency, timing and instructions from the bill line (verify) pharmacist review of wording | Feature | Kamesh |
| 145 | INV-22 Stock reallocation: suggests moving non-moving or short-expiry stock to branches with demand or to the warehouse; one click creates the transfer | Feature | Kamesh |
| 146 | IJX-01 Stock inward / outward vouchers (non-purchase receipts and issues, e.g. samples, free goods from company) | Feature | Kamesh |
| 147 | MKT-06 Multi-warehouse within a branch (godown, cold room, display) with location-level stock | Feature | Kamesh |
| 148 | MKT-08 Customisable keyboard shortcuts per user (`/me/shortcuts`): change any key from KEYBOARD_SHORTCUTS.md, conflict check, reset to default, synced to desktop | Feature | Kamesh |
| 149 | POS-08 UPI QR on screen / on bill (static VPA QR with amount) | Feature | Kamesh |
| 150 | POS-17 Repeat last bill for a customer (chronic refill) | Feature | Kamesh |
| 151 | POS-19 Estimate / quotation convertible to bill | Feature | Kamesh |
| 152 | POS-23 One-click generic conversion: switch every branded line on a bill to an in-stock generic with the same salts + strength (CAT-15); show patient saving and margin per line; pharmacist confirms each swap; extends CAT-09 / POS-16 (verify) substitution rules | Feature | Kamesh |
| 153 | POS-24 Counter recommendations: among same-composition alternatives, rank by near-expiry batch and margin (configurable weights, never above MRP) | Feature | Kamesh |
| 154 | POS-25 Invoice verification QR: unique QR on every printed invoice opening a read-only verification page (number, date, total, store); no patient data | Feature | Kamesh |
| 155 | POS-26 Service billing: non-stock service items (BP / sugar check, injection charge, consultation fee, delivery charge) with own SAC and GST, no stock movement (verify) SAC / GST rates | Feature | Kamesh |
| 156 | POS-29 Multi-firm billing: one counter billing under different firms (companies / GSTINs) of the same tenant; firm picked per bill or by item rule; separate series, books and stock (extends PLT-02) | Feature | Kamesh |
| 157 | WHS-05 Delivery challan, dispatch, delivery tracking (packed, dispatched, delivered) | Feature | Kamesh |
| 158 | WHS-07 E-way bill generation for consignments above threshold (verify) | Feature | Kamesh |
| 159 | WHS-08 Retailer-wise / item-wise scheme overrides | Feature | Kamesh |
| 160 | WHS-09 Salesman assignment and commission report | Feature | Kamesh |
| 161 | WHS-13 Retailer claims: short supply, damage, rate difference; resolved by credit note | Feature | Kamesh |
| 162 | WHS-20 Packing slip, parcel and dispatch register: packing slip per case, parcel register, L.R. update after dispatch, delivery acknowledgement (POD) report | Feature | Kamesh |
| 163 | WHS-21 Collection tagging: assign outstanding bills to salesmen or collectors, print a collection sheet, record collections against it, assigned-vs-collected report | Feature | Kamesh |
| 164 | DOC-05 Document print designer (choose fields, logo, terms, copies) | Feature | Kamesh |
| 165 | NTF-03 WhatsApp Business API: invoice share, payment reminders, refill reminders (verify) template approval & cost | Feature | Nitheesh |
| 166 | NTF-04 SMS (DLT-registered templates) (verify) | Feature | Nitheesh |
| 167 | NTF-07 Owner daily digest: end-of-day email / WhatsApp with sales, collections, purchases, cash, low stock, near expiry, overdue and exceptions | Feature | Nitheesh |
| 168 | NTF-08 WhatsApp usage and cost: messages by Meta category (utility, marketing, authentication, service), template approval status, cost per branch and month, monthly cap and alert | Feature | Nitheesh |
| 169 | ADM-16 Status page and maintenance notices: public status, incident history, maintenance announced 72 h ahead, in-app banner | Feature | Jeeva |
| 170 | DSK-06 Local backup export of offline data (emergency) | Feature | Nitheesh, Jeeva |
| 171 | SEC-11 Data classification and export control: class per field (restricted-health, restricted-financial, confidential, internal, public); exports watermarked with user and time; approval for restricted data; bulk-export alert | Feature | Nitheesh, Jeeva |
| 172 | SEC-12 Tenant security centre: security score, MFA coverage, admins list, active sessions and devices, recent risky events, recommended actions | Feature | Nitheesh, Jeeva |
| 173 | SEC-13 Login protection: passkeys (WebAuthn) for owners and admins, new-device and new-location alerts, step-up challenge for risky sign-ins | Feature | Nitheesh, Jeeva |
| 174 | SEC-16 Responsible disclosure: security.txt, disclosure policy and safe-harbour text, triage SLA, hall of fame; bug bounty later | Feature | Nitheesh, Jeeva |
| 175 | IJX-03 Batch category master (e.g. "cold chain", "high value") for reporting | Feature | Kamesh |
| 176 | POS-13 Cash drawer open, customer display (pole) | Feature | Kamesh |
| 177 | QA: Role dashboards · P5 (2 features) | QA | — |
| 178 | QA: Reports · P5 (8 features) | QA | — |
| 179 | QA: Analytics · P5 (5 features) | QA | — |
| 180 | QA: Administration settings · P5 (7 features) | QA | — |

## P6 · Pilot & GST returns (23)

| Step | Task | Type | With |
|---|---|---|---|
| 181 | UX fixes from pilot; POS speed tuning | Groundwork | — |
| 182 | PUR-16 PDF / scanned purchase bill import: read lines from a distributor PDF or photo into a draft purchase that is reviewed before posting (brings MKT-09 forward for purchases) | Feature | Kamesh |
| 183 | PUR-17 Optimal stock levels: min / max per item and branch computed from sales velocity, lead time and expiry risk; request fulfilment rate (short-book hits vs misses) | Feature | Kamesh |
| 184 | MKT-03 Retailer → distributor online ordering (ERP-to-ERP): a retailer on MENO sends a PO that arrives as a sales order at a distributor on MENO, with live stock, rates and schemes; item codes, HSN and GST mapped automatically | Feature | Kamesh |
| 185 | MKT-10 Consolidated multi-branch dashboard for chains | Feature | Kamesh |
| 186 | WHS-11 Routes and beats (web): retailers per route, visit days | Feature | Kamesh |
| 187 | WHS-12 Delivery planning: schedule dispatches by route/vehicle, pick lists per trip | Feature | Kamesh |
| 188 | WHS-14 Scheme claims: reconcile schemes given to retailers with manufacturer claims | Feature | Kamesh |
| 189 | WHS-18 Sub-stockist accounting: sub-stockist party type, stock sent on sub-stockist terms, their secondary sales and claims, settlement | Feature | Kamesh |
| 190 | WHS-22 Sales targets and incentives: targets by salesman, area, company or product for a period; achievement tracking; incentive slabs; leaderboard | Feature | Kamesh |
| 191 | DOC-03 Commission vouchers for salesmen / agents (sales and purchase side) | Feature | Kamesh |
| 192 | SEC-03 Envelope encryption and key management: per-tenant data keys wrapped by a Key Vault master key, versioned keys, yearly rotation, crypto-shredding on tenant exit | Feature | Nitheesh, Jeeva |
| 193 | PUR-10 Scan supplier invoice (image/PDF) attach to purchase; OCR later | Feature | Kamesh |
| 194 | INV-14 Cold-chain items flag and storage reports | Feature | Kamesh |
| 195 | IJX-02 Stock journal (convert/repack: e.g. bulk into loose packs) | Feature | Kamesh |
| 196 | MKT-07 Expiry-based promotions (auto-suggested discount on near-expiry batches) | Feature | Kamesh |
| 197 | POS-18 Home delivery orders with delivery status | Feature | Kamesh |
| 198 | SEC-18 Trust centre and security pack: public trust page, security whitepaper, VAPT summary, DPA template, sub-processor list, ready answers to security questionnaires | Feature | Nitheesh, Jeeva |
| 199 | QA: Role dashboards · P6 (2 features) | QA | — |
| 200 | QA: Reports · P6 (3 features) | QA | — |
| 201 | QA: Analytics · P6 (3 features) | QA | — |
| 202 | QA: Administration settings · P6 (6 features) | QA | — |
| 203 | QA: Online channels (store page, customer app, marketplaces) · P6 (1 feature) | QA | — |

## P7 · Growth (16)

| Step | Task | Type | With |
|---|---|---|---|
| 204 | Share `packages/ui` primitives with mobile (Expo) | Groundwork | — |
| 205 | Design review of the AI assistant screen and Ctrl+K Ask entry (paper and ink, keyboard, 1280 / 375 px) with Gokul | Groundwork | — |
| 206 | MOB-01 Owner app: dashboard, approvals, alerts | Feature | Nitheesh |
| 207 | MOB-02 Salesman app: routes/beats, retailer visit, take order offline, schemes, credit status | Feature | Nitheesh |
| 208 | MOB-03 Collection app: record payments against invoices, receipt share | Feature | Nitheesh |
| 209 | PUR-18 Distributor marketplace: compare rates, schemes and stock across connected distributors and place POs from one screen (extends MKT-03 beyond MENO-to-MENO) (verify) partner agreements | Feature | Kamesh |
| 210 | MKT-09 AI-assisted item onboarding: create items and a draft purchase from a photo or PDF of a supplier bill | Feature | Kamesh |
| 211 | WHS-10 Retailer self-ordering portal (web) | Feature | Kamesh |
| 212 | NTF-06 Pill / dose-time reminders to patients from the prescription schedule, opt-in only (verify) consent, DPDP Act | Feature | Nitheesh |
| 213 | MOB-04 Delivery app: delivery proof (photo/signature), returns pickup | Feature | Nitheesh |
| 214 | MOB-05 Camera barcode scan for stock count | Feature | Nitheesh |
| 215 | MOB-06 Android quick-billing app for small shops with Bluetooth thermal printer, barcode by camera, offline queue | Feature | Nitheesh |
| 216 | QA: Reports · P7 (1 feature) | QA | — |
| 217 | QA: Analytics · P7 (1 feature) | QA | — |
| 218 | QA: Administration settings · P7 (2 features) | QA | — |
| 219 | QA: Online channels (store page, customer app, marketplaces) · P7 (3 features) | QA | — |
