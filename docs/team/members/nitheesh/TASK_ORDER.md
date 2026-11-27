# Nitheesh — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**352 tasks** · P0: 10 · P1: 14 · P2: 46 · P3: 26 · P4: 42 · P5: 100 · P6: 62 · P7: 52

## P0 · Foundation (10)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | ✅ Monorepo folder structure, AGENTS.md files, architecture docs, ADRs | Groundwork | — |
| 2 | ✅ Study 2 existing pharmacy products: features, flows, pain points (share notes with Prakalya) | Groundwork | — |
| 3 | ✅ Review BRD for P1–P3 with Prakalya | Groundwork | — |
| 4 | ✅ Review ER diagram with Kamesh; review wireframes with Meyyarivu | Groundwork | — |
| 5 | ✅ Run architecture review meeting (day 13); approve Sprint 1 backlog | Groundwork | — |
| 6 | Onboard Gokul (frontend): GitHub and Hub access, CODEOWNERS handle, walk through OWNERSHIP_MATRIX.md and the gokul/ PHASE_PLAN, review the first PR | Groundwork | — |
| 7 | ✅ Create the GitHub repo `meno`, push the foundation (folders + docs) through a PR into `develop` | Readiness | — |
| 8 | ✅ Hold the architecture review meeting and accept or change each ADR (`docs/decisions/`) | Readiness | — |
| 9 | ✅ Decide ADR-0009 (Problem Details vs response envelope) and mark it Accepted | Readiness | — |
| 10 | P0 phase gate: Foundation complete, start P1 | Phase gate | — |

## P1 · Platform core (14)

| Step | Task | Type | With |
|---|---|---|---|
| 11 | `identity` + `audit` modules (users, roles, permissions, audit log) | Groundwork | — |
| 12 | Configuration framework: `tenant_setting`, lookup tables and the `SettingsFacade` (nothing hard-coded, see VALIDATION_AND_BUSINESS_RULES.md) | Groundwork | — |
| 13 | OpenAPI export → `contracts/openapi/meno-api.yaml` → `packages/api-client` generation script | Groundwork | — |
| 14 | Users & roles screens and role permission editor (web `users/`) | Groundwork | — |
| 15 | PLT-01 Tenant sign-up, onboarding wizard (business type, GSTIN, drug licence nos., first branch, financial year) | Feature | — |
| 16 | PLT-06 Users, invitations, branch access, deactivate | Feature | — |
| 17 | PLT-07 Roles & configurable permissions (`module.resource.action`); default roles: Super Admin, Business Owner, Branch Manager, Pharmacist, Billing Operator, Inventory Manager, Accountant, Wholesale Manager, Sales Representative, Auditor, Delivery (see ROLES_AND_DASHBOARDS.md) | Feature | — |
| 18 | PLT-08 Login with email/phone + password, refresh-token rotation, logout all devices | Feature | — |
| 19 | AUT-01 Forgot / reset password (single-use emailed token, 30 min expiry, all sessions revoked on reset); sign in with email or mobile | Feature | Meyyarivu |
| 20 | AUT-04 Sign-up and verification: owner name, mobile OTP, email link, password policy, business name, state, partner code, trial / demo / license choice, DPDP notice acceptance stored with version; rate limits and bot checks | Feature | Meyyarivu |
| 21 | NAV-01 App sidebar navigation: Dashboard + 10 groups (Sales, Purchase, Inventory, Masters, Wholesale, Finance, CRM & Engagement, Reports, GST & Compliance, Administration) exactly as in NAVIGATION.md; hides items by edition and permission; collapsible rail; remembers open groups | Feature | Meyyarivu |
| 22 | SEC-04 Secrets management: all secrets in Key Vault, none on disk or in env files, short-lived DB credentials, rotation schedule, secret scanning in CI | Feature | Jeeva |
| 23 | Cross-tenant test base class in place and used by every endpoint test | Readiness | Kamesh |
| 24 | P1 phase gate: Platform core complete, start P2 | Phase gate | — |

## P2 · Masters (46)

| Step | Task | Type | With |
|---|---|---|---|
| 25 | `files` module (signed URLs, MinIO/Azure Blob adapter) | Groundwork | — |
| 26 | Company, branch and settings screens (web `company/`, `branches/`, `settings/`) | Groundwork | — |
| 27 | Number series + tenant settings endpoints and screens | Groundwork | — |
| 28 | Decide the Indian medicine data source and licence (CAT-10, INT-11) from Jeeva's comparison and Prakalya's hit-rate check; record it as an ADR | Groundwork | — |
| 29 | Decide the GSTIN verification provider (PTY-15, INT-17) from Jeeva's comparison: update R-31 in RESEARCHED_ANSWERS.md and `docs/product/GSTIN_FETCH.md`, record an ADR | Groundwork | — |
| 30 | Confirm compliance rule: Drugs and Cosmetics Act 1940 & Rules 1945 | Confirm rule | — |
| 31 | Confirm compliance rule: Schedule H | Confirm rule | — |
| 32 | Confirm compliance rule: Schedule H1 | Confirm rule | — |
| 33 | Confirm compliance rule: Schedule X | Confirm rule | — |
| 34 | Confirm compliance rule: NDPS | Confirm rule | — |
| 35 | Confirm compliance rule: Pharmacist | Confirm rule | — |
| 36 | Confirm compliance rule: Banned FDCs / recalls | Confirm rule | — |
| 37 | Confirm compliance rule: GST invoice rules | Confirm rule | — |
| 38 | Confirm compliance rule: Default chart of accounts | Confirm rule | — |
| 39 | Confirm compliance rule: State rules | Confirm rule | — |
| 40 | Confirm compliance rule: NPPA / DPCO ceiling prices | Confirm rule | — |
| 41 | Confirm compliance rule: MSME payments | Confirm rule | — |
| 42 | Confirm compliance rule: TDS / TCS on goods | Confirm rule | — |
| 43 | Confirm compliance rule: Interest on overdue | Confirm rule | — |
| 44 | Confirm compliance rule: Reverse charge and IMS | Confirm rule | — |
| 45 | Confirm compliance rule: Inter-branch transfers | Confirm rule | — |
| 46 | Confirm compliance rule: Expired-stock destruction | Confirm rule | — |
| 47 | Confirm compliance rule: GST rate list for medicines | Confirm rule | — |
| 48 | Confirm compliance rule: CERT-In directions | Confirm rule | — |
| 49 | Confirm compliance rule: TDS on commission | Confirm rule | — |
| 50 | Confirm compliance rule: Doctor incentives | Confirm rule | — |
| 51 | Confirm compliance rule: Marketing messages | Confirm rule | — |
| 52 | Confirm compliance rule: Sign-up consent | Confirm rule | — |
| 53 | Confirm compliance rule: Dosage label wording | Confirm rule | — |
| 54 | Confirm compliance rule: GST on charges | Confirm rule | — |
| 55 | Confirm compliance rule: Patient data | Confirm rule | — |
| 56 | PLT-02 Multiple companies per tenant (separate GSTIN, edition per company) | Feature | — |
| 57 | PLT-03 Multiple branches / warehouses, branch-specific settings, address, licence numbers | Feature | — |
| 58 | PLT-05 Document number series per branch / type / FY / device (INV, PUR, SR, PR, CN, DN, RCPT…) | Feature | — |
| 59 | PLT-12 Audit log viewer (who changed what, before/after, filter by user/document) | Feature | — |
| 60 | PLT-13 Tenant settings: rounding, negative stock allowed, MRP-inclusive billing, discount limits per role, expiry block days, print formats | Feature | — |
| 61 | AUT-02 Initial configuration wizard: tax settings, invoice number series, currency (INR), units, rounding, negative-stock policy (writes tenant settings, nothing hard-coded) | Feature | Meyyarivu |
| 62 | AUT-05 Business profile step: business type (retail, wholesale, both, hospital, chain), branches, catalogue size, current software, language; tailors the remaining steps and menus | Feature | Meyyarivu |
| 63 | AUT-06 GSTIN-first company step: fetch fills legal name, address, state and registration type; state locked to the GSTIN; composition → Bill of Supply; PAN check; logo | Feature | Meyyarivu |
| 64 | AUT-07 Licences and pharmacist step: retail / wholesale drug licences with expiry and scans, FSSAI, NDPS, pharmacist in charge with registration and council | Feature | Meyyarivu |
| 65 | AUT-08 Invoice look set-up with live preview: paper size, logo, header, terms, bank details, UPI QR, signature, declaration, series preview | Feature | Meyyarivu |
| 66 | AUT-15 Resume and progress: every step saved on Next, resume on sign-in, checklist on the dashboard until go-live, reminders to finish | Feature | Meyyarivu |
| 67 | NAV-04 Global keyboard shortcuts: one shortcut registry, global keys, `G` go-to and `N` create sequences, list keys, form keys (`Ctrl+S`, `Ctrl+Enter`, `Ctrl+P`), shortcut sheet `Ctrl+/`, shortcuts in tooltips and command search (KEYBOARD_SHORTCUTS.md) | Feature | Meyyarivu |
| 68 | AUT-03 Onboarding checklist: setup steps with progress (company, licence, GST, branch, users, items, opening stock, printer) until the business is ready to bill | Feature | Meyyarivu |
| 69 | AUT-09 Team step: invite staff by mobile or email with role and branch; counter PIN on first login | Feature | Meyyarivu |
| 70 | P2 phase gate: Masters complete, start P3 | Phase gate | — |

## P3 · Purchase & inventory (26)

| Step | Task | Type | With |
|---|---|---|---|
| 71 | ✅ `packages/billing-engine` (decimal.js) passing all test vectors (72 / 72 on 24-11-2026; `pnpm --filter @meno/billing-engine test`) | Groundwork | — |
| 72 | Review the billing-engine code and the 52 extended draft vectors; mark vectors confirmed after Prakalya's hand check and the CA session | Groundwork | — |
| 73 | `reporting` module: report framework (filters, pagination, export, permissions), stock/expiry/purchase report views | Groundwork | — |
| 74 | Inventory dashboard and report API contracts for Gokul's dashboard and reports centre screens | Groundwork | — |
| 75 | Confirm compliance rule: Record retention | Confirm rule | — |
| 76 | Confirm compliance rule: Patient-data retention | Confirm rule | — |
| 77 | PLT-16 Data import on onboarding (items, opening stock, customers, suppliers, outstanding) from Excel/CSV and common pharmacy software exports | Feature | — |
| 78 | PLT-24 Attachments on any document or master (supplier bill, Rx, licence scan, delivery proof): type and size rules from settings, virus scan, retention per ADM-09 | Feature | — |
| 79 | PLT-32 Excel import templates done properly: grey hint text in empty cells, cell tooltips (≤ 255 chars), defaults per column, dropdowns fed from a hidden locked master-data tab, Excel validation that stops bad entries while typing, upload error table by row number, re-download of only the failed rows | Feature | — |
| 80 | AUT-13 Go-live: readiness checks (GST, licences, books balanced, preferences, printer, stock, plan, email), go-live date, practice data removed, opening balances locked, series start | Feature | Meyyarivu |
| 81 | NAV-05 Transaction-screen keyboard map: purchase entry, sales invoice, transfers and journals use the POS meanings (`F2` item, `F3` party, `F5` batch, `F10` save & post, `Ctrl+Del` remove line); full grid navigation without a mouse | Feature | Meyyarivu |
| 82 | DSH-04 Inventory dashboard: stock value, low stock, near-expiry, expired, dead stock, pending GRNs | Feature | Gokul |
| 83 | RPT-03 Purchase register (supplier-wise, item-wise) | Feature | Gokul |
| 84 | RPT-04 Stock reports: current stock, batch-wise, valuation, movement history of an item | Feature | Gokul |
| 85 | RPT-05 Expiry report, expired stock, near-expiry by supplier (for returns) | Feature | Gokul |
| 86 | RPT-16 Report framework standard: every report has date range, filters, server pagination, export and permission control | Feature | Gokul |
| 87 | ADM-06 Import centre: all imports as jobs with status, error rows download, re-run | Feature | — |
| 88 | INT-04 Distributor file formats (CSV templates per major distributor) | Feature | Jeeva |
| 89 | PLT-25 Master bulk update: filter items or parties, change chosen fields (rack, category, discount caps, reorder levels, price list, salesman, HSN) with preview, approval above a count, full audit | Feature | — |
| 90 | CAT-24 Medicine search-as-you-type on the item create form (feeds CAT-23): search box with a dropdown of DrugDB matches after a 200 ms pause, previous request cancelled, ↑ ↓ Enter Esc keyboard control, each row shows name, composition, pack, manufacturer, MRP; DrugDB's `fuzzy` / `searched_as` / `unit_ignored` / `ignored` notes shown to the user; picking a row pre-fills name, composition, manufacturer, dosage form and pack (each marked and editable), MRP shown as a hint only, barcode / HSN / GST / schedule left for the user; works by hand if DrugDB is down. Calls only meno-api, never DrugDB directly | Feature | — |
| 91 | INT-11 Indian medicine data adapter in `integrations`: server-side client for the source chosen under CAT-10 (lookup by EAN-13 barcode, brand and salt), key in secrets, shared cache, records source + source id + fetched date on anything it fills (verify) provider and licence | Feature | Jeeva |
| 92 | INT-12 DrugDB API adapter (first provider behind INT-11, if the P2 decision picks DrugDB): server-side client for `GET https://drugdb.in/v1/search?q=` and `GET /v1/products/{product_id}`, `X-Api-Key` from secrets (paid plan for production; the trial and keyless visitor access are for evaluation only), one reused HTTP client, 5 s timeout, product details cached 1 h with ETag / `If-None-Match`, search never cached, 429 (`Retry-After`) and 403 (plan ended) mapped to a friendly "reference unavailable", never bulk-stores the catalogue (DrugDB terms), records `source = drugdb` + `product_id` (DDID…) on items it fills. Taught in Hub → Learn → Day 19 (verify) paid plan + terms confirmed | Feature | — |
| 93 | INT-17 GSTIN verification adapter (provider behind PTY-15) in `integrations`: `GstinVerifier` port + adapter for the provider chosen in P2; first candidate the public GST verify API `GET https://api.gstverify.dubey.app/api/v1/gst/details?gstin=&full=false` (basic details without a key; `full=true` needs a key), server-side only, 8 s timeout, one reused HTTP client, provider 400 → not found, 429 / timeout / 5xx → "enter by hand", result cached by GSTIN with source and fetch date, only the GSTIN is sent. Spec: [GSTIN_FETCH.md](GSTIN_FETCH.md). Taught in Hub → Learn → Day 22 (verify) provider terms, limits and cost | Feature | — |
| 94 | Calculation parity CI job: Java and TypeScript must pass every test vector | Readiness | Ashok |
| 95 | Choose the GST e-invoice provider (GSP/IRP) with a cost comparison and sandbox access | Readiness | — |
| 96 | P3 phase gate: Purchase & inventory complete, start P4 | Phase gate | — |

## P4 · Retail POS & returns (42)

| Step | Task | Type | With |
|---|---|---|---|
| 97 | Electron main process: window, preload bridge, printing service, scanner input, auto-update hook (Jeeva packages) | Groundwork | — |
| 98 | Data-source abstraction in web (`online` HTTP / `local` IPC) agreed with Meyyarivu | Groundwork | — |
| 99 | Role-based landing and retail dashboard APIs (`reporting`) for Gokul's dashboard screens | Groundwork | — |
| 100 | `notification` module: email + in-app, alert rules | Groundwork | — |
| 101 | Admin settings screens: payment, printer, notification settings (web `admin/`) | Groundwork | — |
| 102 | Decide the licensing rules (grace days, what restricted mode blocks, soft vs hard invoice limit, first plans and prices) and accept ADR-0015 before LIC work starts in P5 (`docs/architecture/LICENSING.md`) | Groundwork | — |
| 103 | Confirm compliance rule: E-invoice | Confirm rule | — |
| 104 | Confirm compliance rule: E-way bill | Confirm rule | — |
| 105 | Confirm compliance rule: GST returns | Confirm rule | — |
| 106 | Confirm compliance rule: Combined bill with returns | Confirm rule | — |
| 107 | Confirm compliance rule: Returns without bill | Confirm rule | — |
| 108 | PLT-39 Feature flags and release channels: per-tenant flags, early-access and stable channels, staged desktop rollout with automatic halt on crash rate | Feature | Jeeva |
| 109 | PLT-43 Performance budgets in CI: POS keystroke ≤ 50 ms, item search p95 ≤ 150 ms, bill save p95 ≤ 500 ms, page load ≤ 2 s on a 4 GB PC; failing budget fails the build | Feature | Ashok, Jeeva |
| 110 | NAV-03 Desktop menu bar (File, Edit, View, Go, New, Window, Help) built from the same nav config as the sidebar, edition- and permission-aware, accelerators from KEYBOARD_SHORTCUTS.md | Feature | Meyyarivu |
| 111 | DSH-01 Role-based landing: each role opens its own dashboard and menu (see ROLES_AND_DASHBOARDS.md); dashboards are configuration, not code branches | Feature | Gokul |
| 112 | DSH-02 Retail dashboard: counter sales, bills today, collections by mode, returns, top items | Feature | Gokul |
| 113 | DSH-08 Dashboard widget library: today's sales, purchases, gross margin, net sales, invoices, cash collection, credit sales, receivables, payables, low stock, near-expiry, expired, fast-moving, slow-moving, branch performance; each widget permission-aware | Feature | Gokul |
| 114 | RPT-01 Owner dashboard: today's sales, collections, purchases, margin, low stock, near expiry, outstanding | Feature | Gokul |
| 115 | RPT-02 Sales register (day/month, bill-wise, item-wise, customer-wise, doctor-wise, user-wise, branch-wise) | Feature | Gokul |
| 116 | RPT-09 Schedule H1 / narcotic registers | Feature | Gokul |
| 117 | RPT-13 Reports centre: catalogue, favourites, saved filters, recent | Feature | Gokul |
| 118 | RPT-14 Batch-wise sales and traceability: who received batch X (recalls) | Feature | Gokul |
| 119 | ANX-06 POS register (counter/shift-wise), sales & sales-return registers, compliance register | Feature | Gokul |
| 120 | NTF-01 In-app notification centre | Feature | Meyyarivu |
| 121 | NTF-02 Email (invoices, reports, alerts) | Feature | Meyyarivu |
| 122 | NTF-05 Alert rules: low stock, near expiry, credit overdue, licence expiry, device not synced | Feature | Meyyarivu |
| 123 | ADM-02 Payment settings: payment modes, UPI VPA, card terminals, bank accounts | Feature | — |
| 124 | ADM-03 Printer and print-template settings (per branch / counter, web and desktop) | Feature | — |
| 125 | DSK-01 Windows installer (and macOS), auto-update with staged rollout | Feature | Meyyarivu, Jeeva |
| 126 | DSK-03 Thermal/A4 printing without browser dialog, printer profiles per counter | Feature | Meyyarivu, Jeeva |
| 127 | DSK-04 USB/HID barcode scanner support, weighing scale (later) | Feature | Meyyarivu, Jeeva |
| 128 | SEC-01 Tamper-evident records: hash-chained posted documents, statutory registers and audit log per series; signed daily anchors in immutable storage; nightly verifier and auditor "Verify records" report | Feature | Meyyarivu, Jeeva |
| 129 | SEC-10 API and edge protection: WAF rules, rate limits per IP / user / tenant, request size limits, CORS lockdown, bot checks on public endpoints, abuse alerts | Feature | Jeeva |
| 130 | SEC-17 Patient-data vault: prescriptions and patient fields in a separate encrypted store, access logged with purpose, retention auto-delete after the legal period (verify) | Feature | Meyyarivu, Jeeva |
| 131 | AUT-11 Devices step: desktop download, device registration, printer test page, barcode scan test, cash drawer test | Feature | Meyyarivu, Jeeva |
| 132 | AUT-12 Practice mode: separate practice company with sample data and a guided first-bill tour; practice bills marked "not a tax invoice" and excluded from all reports | Feature | Meyyarivu |
| 133 | NAV-02 Global command search (`Ctrl K`): jump to any menu item, item, party or document number | Feature | Meyyarivu |
| 134 | DSH-07 Activity timeline: recent user activity (from audit log) filtered by branch/user/module | Feature | Gokul |
| 135 | RPT-15 Discount report by user, item, reason | Feature | Gokul |
| 136 | ADM-04 Notification settings per user, role and channel | Feature | — |
| 137 | Choose the WhatsApp Business and SMS (DLT) providers | Readiness | — |
| 138 | P4 phase gate: Retail POS & returns complete, start P5 | Phase gate | — |

## P5 · Wholesale, finance, offline (100)

| Step | Task | Type | With |
|---|---|---|---|
| 139 | `modules/sync` (device registration, number-series blocks, push/pull, conflicts) + desktop SQLCipher store and sync engine | Groundwork | — |
| 140 | `payment` module: receipts and payments with allocation; screens (web `payments/`) | Groundwork | — |
| 141 | `accounting` module: chart of accounts, vouchers from events, books, ledgers; screens (web `accounting/`) | Groundwork | — |
| 142 | Financial and wholesale dashboard and customer history (CRM) APIs; screens by Gokul | Groundwork | — |
| 143 | Pilot go/no-go | Groundwork | — |
| 144 | Confirm compliance rule: DPDP Act 2023 | Confirm rule | — |
| 145 | PLT-04 Financial year management, year-end closing and carry-forward of balances and stock | Feature | — |
| 146 | PLT-11 Session & device management (register/revoke counter PCs) | Feature | — |
| 147 | PLT-23 Period lock: close a month or a date range per company; no posting, back-dating or reversal into a locked period; unlock needs permission + reason and is audited | Feature | — |
| 148 | PLT-29 Head-office control for chains: items, HSN / GST, prices, offers, users and settings managed centrally and pushed to outlets; which fields an outlet may override is a setting; push log per outlet | Feature | Kamesh |
| 149 | PLT-35 Tenant security policies: password rules, MFA mandatory per role, idle timeout, session length, device binding for counters | Feature | — |
| 150 | PLT-36 Field-level encryption and masking for PAN, bank accounts and patient health data; masked in lists and exports unless permitted; yearly key rotation | Feature | — |
| 151 | PLT-37 Data residency and exit: data and backups in Indian regions; tenant exit with full export and deletion certificate listing records kept by law | Feature | — |
| 152 | LIC-01 Plan catalogue (super admin): plans as data: code, name, edition, limits (users, branches, devices, invoices per month), features, duration, grace days, list price; effective-dated; never hard-coded | Feature | — |
| 153 | LIC-02 Issue a license key (super admin): buyer name, GSTIN, email, phone, plan, start and expiry, trial flag, limit overrides, notes → key `MENO-XXXXX-XXXXX-XXXXX-XXXXX` (Crockford Base32, 95 random bits, Luhn mod-32 check), stored only as an HMAC hash, shown once, PDF / email to the buyer; `Idempotency-Key`; plan limits snapshotted onto the license | Feature | — |
| 154 | LIC-03 Activate a license key (business owner) in onboarding (`/onboarding/license`) or Settings → License: check character validated in the browser, server binds the license to the tenant, rate-limited (5 tries / 15 min), same message for unknown and already-used keys, every attempt recorded | Feature | — |
| 155 | LIC-04 Signed license certificate: Ed25519-signed JWS with plan, edition, limits, features, dates and tenant; 7-day lifetime; returned on activation, login and sync; private key in secrets with `kid` rotation; public keys bundled in web and desktop | Feature | — |
| 156 | LIC-05 Entitlement enforcement: `EntitlementGuard` (edition, feature, capacity, writable) checked server-side before creating users, branches, devices and documents; RFC 9457 codes `license_expired`, `license_limit_reached`, `license_edition`, `license_feature`; UI hides or explains | Feature | — |
| 157 | LIC-06 Expiry lifecycle: computed states valid → expiring (reminders 30/15/7/1 days) → grace → expired; restricted mode after grace blocks new documents, users, branches and devices but always allows sign-in, viewing, reports, export, payments received and sync of bills made before the grace end; no data is ever deleted (verify) | Feature | — |
| 158 | LIC-07 Desktop offline license: cached certificate verified offline (signature, tenant, lifetime), clock-rollback check against the last server time seen, device activation counted against the device limit, restricted mode applied offline | Feature | Meyyarivu, Jeeva |
| 159 | LIC-08 Super-admin license console (`/platform/licenses`): list and filters (status, plan, expiring before), detail with history and activations; extend, change plan, suspend, resume, revoke, re-issue key, transfer to another tenant; every action needs a reason, is audited, and requires 2FA | Feature | — |
| 160 | ACC-01 Customer receipts with allocation to invoices (FIFO or manual), on-account | Feature | — |
| 161 | ACC-02 Supplier payments with allocation, cheque details, PDC tracking | Feature | — |
| 162 | ACC-03 Chart of accounts with default ledgers (sales, purchase, GST input/output, cash, bank, round-off) | Feature | — |
| 163 | ACC-04 Auto-posting of vouchers from documents (event-driven, double-entry) | Feature | — |
| 164 | ACC-05 Expenses entry (rent, salary, electricity) | Feature | — |
| 165 | ACC-06 Cash book, bank book, day book, ledger statements | Feature | — |
| 166 | ACC-09 Outstanding & ageing (receivable/payable), payment reminders | Feature | — |
| 167 | ACC-14 Cheque bounce: reverse the receipt, re-open the invoices, optional bank-charge debit note, flag the party and notify | Feature | — |
| 168 | ACX-01 Journal, contra (cash↔bank), receipt and payment vouchers with narration templates | Feature | — |
| 169 | ACX-02 Income & expense vouchers and an income/expense register | Feature | — |
| 170 | ACX-03 Ledger groups (chart of accounts tree), opening balances, set-up ledgers wizard | Feature | — |
| 171 | ACX-11 Onboarding wizard for books: chart of accounts, bank accounts, GST registration, FY | Feature | — |
| 172 | ACX-13 Finance dashboard and general ledger page (drill down from any balance to vouchers to documents) | Feature | — |
| 173 | ACX-14 Ledger group master: chart-of-accounts tree (Asset / Liability / Equity / Income / Expense → sub-groups such as Current Assets → Sundry Debtors); user sub-groups; system groups locked | Feature | — |
| 174 | ACX-15 Default chart of accounts seeded on company set-up (CHART_OF_ACCOUNTS.md: 24 groups, 43 ledgers for cash, bank, sales, purchase, returns, GST input/output, round-off, discounts, expiry loss, expenses); system ledgers renamable, never deletable (verify) confirm with CA | Feature | — |
| 175 | ACX-16 Party ledgers created automatically: every supplier under Sundry Creditors, every customer under Sundry Debtors, linked to the party master | Feature | — |
| 176 | ACX-17 Posting rules: each document event (sale, purchase, returns, receipt, payment, write-off, expense) mapped to system ledgers by code, effective-dated; posting is refused if a ledger is missing | Feature | — |
| 177 | DSH-03 Wholesale dashboard: orders by status, dispatch, receivables, credit-limit breaches, salesman performance | Feature | Gokul |
| 178 | DSH-05 Financial dashboard: cash, bank, receivables, payables, expenses, GST liability | Feature | Gokul |
| 179 | RPT-06 Profit reports (bill-wise, item-wise, category-wise) on landed cost | Feature | Gokul |
| 180 | RPT-07 Outstanding & ageing reports | Feature | Gokul |
| 181 | RPT-17 Outstanding by area, route, salesman and as-on-date / age-wise for receivables and payables, shareable as PDF / WhatsApp | Feature | Gokul |
| 182 | RPT-18 Exception (bill audit) report: edited drafts, cancelled, back-dated, reprinted, below-cost, above-cap discount, FEFO overrides, negative-stock attempts, by user and day | Feature | Gokul |
| 183 | ADM-05 Login history and active sessions (with sign-out of other sessions) | Feature | — |
| 184 | ADM-19 Maker-checker for sensitive settings: tax settings, number series, posting rules, bank details, price lists need a second approver | Feature | — |
| 185 | INT-01 GST IRP / GSP for e-invoice & e-way bill (verify) provider choice | Feature | Jeeva |
| 186 | DSK-02 Offline SQLite store, sync engine, status bar indicator | Feature | Meyyarivu, Jeeva |
| 187 | DSK-05 Device registration & revoke, local data encryption | Feature | Meyyarivu, Jeeva |
| 188 | SEC-02 Device-signed offline bills: per-device Ed25519 key in the OS keystore; offline bills signed; server verifies on sync; bad or revoked-device bills quarantined, owner alerted | Feature | Meyyarivu |
| 189 | SEC-05 Insider-fraud detection: rules for voids, reprints, discounts, returns without bill, write-offs, price edits during shifts, after-hours activity, FEFO overrides, cash shortfalls; thresholds in configuration; alerts and case notes | Feature | Meyyarivu, Jeeva |
| 190 | SEC-06 Privileged access management: separate platform-admin realm, hardware-key MFA, just-in-time elevation with approval and expiry, two-person rule for destructive actions, break-glass account with alert | Feature | Meyyarivu, Jeeva |
| 191 | SEC-07 Security monitoring: central logs with redaction, detection rules (brute force, token reuse, impossible travel, mass export, cross-tenant attempt, admin outside hours), alerting, 180-day retention in India (verify) | Feature | Meyyarivu, Jeeva |
| 192 | SEC-09 Desktop hardening: code-signed installer and updates, update signature check, sandboxed renderer, app-bundle integrity check, SQLCipher key in OS keystore, idle lock, remote wipe on device revoke | Feature | Meyyarivu, Jeeva |
| 193 | PLT-09 Two-factor authentication (TOTP) for admins | Feature | — |
| 194 | PLT-10 Counter PIN login on desktop (fast user switch at the counter) | Feature | — |
| 195 | PLT-19 Approval workflows (discount above limit, credit limit override, stock adjustment, purchase above value) | Feature | — |
| 196 | PLT-20 Network (IP) allowlist per branch: restrict sign-in for chosen roles to the shop's network; denied attempts logged | Feature | — |
| 197 | PLT-27 Accountant (CA) access: invite an external accountant with a read-only books + GST scope, time-boxed, export allowed, every view audited | Feature | — |
| 198 | PLT-28 Onboarding pipeline (super admin): tenants by step, days stuck, trial days left, nudges, sign-up → go-live → first-100-bills funnel | Feature | — |
| 199 | PLT-30 Custom fields on items, parties and documents: type (text, number, date, list), required, searchable, printable; defined per tenant | Feature | — |
| 200 | PLT-31 Clone set-up: copy settings, series, print templates, roles and optionally masters from one company or branch to a new one | Feature | — |
| 201 | PLT-40 Tenant health page: device sync lag, failed jobs, e-invoice / e-way queue age, licence and backup state, with fixes | Feature | — |
| 202 | PLT-42 Accessibility WCAG 2.1 AA: audit, contrast and label checks in CI, screen-reader support, public accessibility statement | Feature | — |
| 203 | LIC-09 Tenant license page (`/admin/license`): plan, edition, start and expiry, days left, limits with usage bars, masked key, history, renew / upgrade contact | Feature | — |
| 204 | AUT-14 Assisted onboarding: book a set-up call, chat, owner-granted time-boxed support access (view / assist) with full audit; partner (implementer) linking with the same consent | Feature | Meyyarivu |
| 205 | PTY-22 Party income-tax fields: PAN (matches GSTIN), related-party flag, TDS/TCS applicable + section from `tds_section`; related-party transactions report (verify) | Feature | Ashok |
| 206 | PTY-23 MSME (Udyam) details for suppliers: category (micro / small / medium / not applicable), Udyam no., certificate; MSME payables due-date tracking and overdue report (verify) CA to confirm payment limit and tax effect | Feature | Ashok |
| 207 | ACC-15 Financial (rate-difference) credit / debit notes without stock, GST at the original invoice rate (verify) | Feature | — |
| 208 | ACC-16 Cheque management: cheque book master per bank account, cheque leaf printing in bank formats, cheque number sequence and tracking, cancelled / void leaves, issued-cheque register | Feature | — |
| 209 | RPT-11 Export every report to Excel/PDF, schedule by email | Feature | Gokul |
| 210 | RPT-19 Customer payment behaviour: average payment days, delay trend, bills paid after due date per customer and area | Feature | Gokul |
| 211 | RPT-20 Manufacturer-wise reports: sales, stock, expiry and returns by manufacturer / company | Feature | Gokul |
| 212 | RPT-22 Group register: net sales quantity and amount, profit and growth % vs the previous period by product group, category, brand or manufacturer | Feature | Gokul |
| 213 | ANX-01 Bill-wise profit and rate / quantity difference analysis (purchase vs sale price drift) | Feature | Gokul |
| 214 | ANX-02 ABC ranking of items by value/volume; stock-flow card (opening → in → out → closing) | Feature | Gokul |
| 215 | ANX-07 Sales vs payment and sales vs purchase trend charts | Feature | Gokul |
| 216 | ANX-08 Staff performance: sales, bills, average bill value, discounts given, returns, cancellations by user, salesman, counter and outlet | Feature | Gokul |
| 217 | ANX-10 Risk flags: customers approaching their credit limit and declining customers; dead and declining stock; each with drill-down to bills and items (extends ANX-04) | Feature | Gokul |
| 218 | CRM-01 Customer history (customer 360): all bills, returns, prescriptions, doctors, outstanding, refill pattern on one page | Feature | Gokul |
| 219 | CRM-11 Notify when available: record a customer's request for an out-of-stock medicine; message them automatically when stock arrives; feeds the short book | Feature | Gokul |
| 220 | NTF-03 WhatsApp Business API: invoice share, payment reminders, refill reminders (verify) template approval & cost | Feature | Meyyarivu |
| 221 | NTF-04 SMS (DLT-registered templates) (verify) | Feature | Meyyarivu |
| 222 | NTF-07 Owner daily digest: end-of-day email / WhatsApp with sales, collections, purchases, cash, low stock, near expiry, overdue and exceptions | Feature | Meyyarivu |
| 223 | NTF-08 WhatsApp usage and cost: messages by Meta category (utility, marketing, authentication, service), template approval status, cost per branch and month, monthly cap and alert | Feature | Meyyarivu |
| 224 | ADM-01 Integrations settings page: GST e-invoice provider, WhatsApp, SMS, email, Tally export, payment links: connect, test, see status and last error | Feature | — |
| 225 | ADM-07 Export centre: job-based exports (reports, masters, full tenant export) | Feature | — |
| 226 | ADM-14 Data health check: user-run checks (stock vs ledger, unbalanced vouchers, items without HSN, duplicate parties, negative batches) with links to fix | Feature | — |
| 227 | ADM-17 Support SLAs: priority levels, response and resolution timers per tier, escalation, satisfaction rating (extends ADM-11) | Feature | — |
| 228 | INT-02 WhatsApp Business provider, SMS provider | Feature | Jeeva |
| 229 | DSK-06 Local backup export of offline data (emergency) | Feature | Meyyarivu, Jeeva |
| 230 | SEC-11 Data classification and export control: class per field (restricted-health, restricted-financial, confidential, internal, public); exports watermarked with user and time; approval for restricted data; bulk-export alert | Feature | Meyyarivu, Jeeva |
| 231 | SEC-12 Tenant security centre: security score, MFA coverage, admins list, active sessions and devices, recent risky events, recommended actions | Feature | Meyyarivu, Jeeva |
| 232 | SEC-13 Login protection: passkeys (WebAuthn) for owners and admins, new-device and new-location alerts, step-up challenge for risky sign-ins | Feature | Meyyarivu, Jeeva |
| 233 | SEC-16 Responsible disclosure: security.txt, disclosure policy and safe-harbour text, triage SLA, hall of fame; bug bounty later | Feature | Meyyarivu, Jeeva |
| 234 | PTY-25 One party in both roles (customer and supplier) with a single ledger and netted outstanding (verify) CA | Feature | Ashok |
| 235 | External or peer penetration test of auth, tenancy, file upload and sync; fix all High/Critical | Readiness | — |
| 236 | Privacy notice and terms of service reviewed (DPDP Act) | Readiness | — |
| 237 | Production go/no-go review: QA report, security report, restore drill, UAT, all S1/S2 closed | Readiness | — |
| 238 | P5 phase gate: Wholesale, finance, offline complete, start P6 | Phase gate | — |

## P6 · Pilot & GST returns (62)

| Step | Task | Type | With |
|---|---|---|---|
| 239 | Final accounts (trial balance, P&L, balance sheet, cash flow), Tally export | Groundwork | — |
| 240 | Super-admin console, subscriptions, platform billing | Groundwork | — |
| 241 | Pilot support rota, weekly pilot review, prioritise feedback | Groundwork | — |
| 242 | PLT-41 High availability and disaster recovery: managed PostgreSQL with point-in-time recovery, second-region backup copy, RPO / RTO per tier, monthly timed restore drill | Feature | Jeeva |
| 243 | PLT-44 Security assurance: OWASP ASVS L2 checklist per release, dependency and container scanning, annual VAPT by a CERT-In empanelled auditor, CERT-In 6-hour incident reporting and 180-day log retention (verify), ISO 27001 readiness | Feature | Jeeva, Ashok |
| 244 | ACX-07 Final accounts: trial balance, trading & P&L, balance sheet, group register, ledger report | Feature | — |
| 245 | ACX-09 GST dashboard: output vs input tax, liability, filing status by period | Feature | — |
| 246 | RPT-08 GST reports (see §12) | Feature | Gokul |
| 247 | PLT-14 Subscription plans, edition gating, usage limits (users, branches, invoices/month), trial | Feature | — |
| 248 | PLT-15 Platform super-admin console (tenants, plans, health, support impersonation with consent) | Feature | — |
| 249 | PLT-17 Data export (full tenant export for portability) | Feature | — |
| 250 | PLT-33 Single sign-on: SAML 2.0 and OIDC (Microsoft Entra ID, Google Workspace) per tenant, enforce-SSO switch, just-in-time user creation, break-glass owner login | Feature | — |
| 251 | PLT-38 Sandbox tenant: a copy of the customer's masters and settings to try changes and train staff; no GST filings, e-invoices or messages leave it | Feature | — |
| 252 | LIC-10 Renew or upgrade with a new key on an active tenant: the new license takes over on its start date, the old one ends; stacking and pro-rata rules (verify) | Feature | — |
| 253 | ACC-07 Bank reconciliation (statement import) | Feature | — |
| 254 | ACC-08 Trial balance, P&L, balance sheet | Feature | — |
| 255 | ACC-10 Tally export (XML vouchers + masters) | Feature | — |
| 256 | ACC-12 Payment gateway integration: dynamic UPI QR, card and wallet with automatic confirmation on the bill (webhook, idempotent) (verify) provider choice | Feature | — |
| 257 | ACC-13 Auto payment reconciliation: match gateway / UPI settlements and bank credits to bills and receipts; unmatched items go to a review queue | Feature | — |
| 258 | ACX-04 Fixed assets: asset master, purchase voucher, depreciation schedule (SLM/WDV) (verify) rates | Feature | — |
| 259 | ACX-06 TDS / TCS section and rate masters, deduction on payments/receipts (verify) | Feature | — |
| 260 | ACX-08 Bank dashboard: balances, unreconciled entries, cheque status | Feature | — |
| 261 | ACX-12 Cash-flow statement | Feature | — |
| 262 | ACX-18 Cash-flow forecast: expected receipts by due date, payables, PDCs and expenses for the next N weeks | Feature | — |
| 263 | DSH-06 Branch dashboard: branch-to-branch comparison of sales, margin, stock, expiry | Feature | Gokul |
| 264 | DSH-09 Super-admin platform analytics: tenants, plans, usage, health, revenue | Feature | Gokul |
| 265 | RPT-10 Branch comparison | Feature | Gokul |
| 266 | RPT-21 Commission and TDS register: salesman / agent commission vouchers with sales amount, commission %, commission, TDS section, TDS % and TDS amount by period (verify) CA (TDS on commission) | Feature | Gokul |
| 267 | ANX-03 Customer, product and vendor performance reports (top, declining, dormant) | Feature | Gokul |
| 268 | ANX-09 Customer retention: new vs repeat, lapsed customers, refill adherence by month and branch | Feature | Gokul |
| 269 | CRM-02 Complaints: log customer/retailer complaints (wrong item, short supply, damaged, billing error) with status, owner, due date, resolution and link to the bill/return | Feature | Gokul |
| 270 | CRM-10 Customer segments by rules (chronic, regular, walk-in, lapsed, high value, by medicine class) used for offers, reminders and campaigns | Feature | Gokul |
| 271 | ENG-01 WhatsApp connection settings, broadcast campaigns (offers, refill reminders) with delivery reports (verify) opt-in | Feature | Gokul |
| 272 | ADM-08 Backup status and tenant data download | Feature | — |
| 273 | ADM-09 Data retention policies per record type (verify) | Feature | — |
| 274 | ADM-10 Platform billing: MENO's invoices to the tenant, payment history | Feature | — |
| 275 | ADM-11 Help centre and support tickets to the MENO team | Feature | — |
| 276 | ADM-18 Audit export and SIEM streaming: audit log as CSV / JSON export and signed webhook stream | Feature | — |
| 277 | DLV-01 Home-delivery orders with rider assignment, status, cash-on-delivery collection and rider settlement (extends POS-18) | Feature | Gokul |
| 278 | OMN-04 WhatsApp ordering: customer sends an order or prescription on WhatsApp, it lands as a draft bill at the counter | Feature | Gokul, Jeeva |
| 279 | INT-03 Tally export | Feature | Jeeva |
| 280 | INT-16 Public API platform: versioned API, OAuth 2.0 client credentials, per-client rate limits, idempotent writes, bulk master endpoints, signed webhooks with retries, developer portal with sandbox (extends INT-05) | Feature | Jeeva |
| 281 | SEC-03 Envelope encryption and key management: per-tenant data keys wrapped by a Key Vault master key, versioned keys, yearly rotation, crypto-shredding on tenant exit | Feature | Meyyarivu, Jeeva |
| 282 | LIC-11 License sale invoices: GST invoice to the buyer for each license, linked to platform billing (ADM-10) (verify) | Feature | — |
| 283 | PTY-29 Interest on overdue: % and basis (simple 365 / 360 days, compound monthly) per party; interest calculation report and optional interest debit note (verify) | Feature | Ashok |
| 284 | ACX-05 Loans and liabilities: loan voucher, EMI schedule, interest booking | Feature | — |
| 285 | ANX-05 Smart insights card on dashboard (plain-language highlights: "Sales of X down 30 % vs last month") | Feature | Gokul |
| 286 | CRM-03 CRM dashboard: active customers, refills due, complaints, loyalty | Feature | Gokul |
| 287 | CRM-04 Loyalty transactions: points earned / redeemed ledger | Feature | Gokul |
| 288 | CRM-06 Follow-up reminders for staff (call customer, collect payment) | Feature | Gokul |
| 289 | CRM-08 Paid membership plans: fee, validity, benefits (discount %, free delivery), renewal reminders | Feature | Gokul |
| 290 | CRM-12 Greetings automation: birthday, anniversary and festival messages with templates, consent and opt-out | Feature | Gokul |
| 291 | ADM-20 Chain branding: logo, accent colour, custom domain for portal and customer app, branded emails and WhatsApp templates | Feature | — |
| 292 | INT-10 openFDA adapter in `integrations` (reference only): server-side client for the drug label endpoint, optional API key from secrets, cache by label `set_id` (weekly updates), handles 404 "no matches" and 429; only needed for CAT-21 | Feature | Jeeva |
| 293 | INT-15 Zoho Books sync (sales, purchases, returns, payments) alongside Tally export | Feature | Jeeva |
| 294 | SEC-18 Trust centre and security pack: public trust page, security whitepaper, VAPT summary, DPA template, sub-processor list, ready answers to security questionnaires | Feature | Meyyarivu, Jeeva |
| 295 | Onboard pilot pharmacy 1 (retail): data migration, training, first live bill | Readiness | — |
| 296 | Onboard pilot pharmacy 2 (retail) | Readiness | — |
| 297 | Onboard pilot distributor (wholesale) with e-invoice live | Readiness | — |
| 298 | Support rota and incident process during the pilot (response times agreed) | Readiness | — |
| 299 | Four weeks of pilot with zero data-integrity incidents: declare MENO production-ready (v1.1) | Readiness | — |
| 300 | P6 phase gate: Pilot & GST returns complete, start P7 | Phase gate | — |

## P7 · Growth (52)

| Step | Task | Type | With |
|---|---|---|---|
| 301 | Field-sales and mobile owner app requirements (Prakalya reviews) | Groundwork | — |
| 302 | Mobile architecture ADR (Expo, shared packages), fieldsales module design | Groundwork | — |
| 303 | Accept ADR-0017 (AI assistant): provider, model, client library (RestClient or Spring AI), retention; update AI_ASSISTANT.md and R-52 (after Jeeva's comparison and Prakalya's privacy review) | Groundwork | — |
| 304 | AI assistant design review with Kamesh, Gokul, Jeeva and Ashok: tool list, permissions, redaction, guards, test pack (docs/architecture/AI_ASSISTANT.md) | Groundwork | — |
| 305 | Confirm compliance rule: AI assistant (external LLM) | Confirm rule | — |
| 306 | MOB-01 Owner app: dashboard, approvals, alerts | Feature | Meyyarivu |
| 307 | MOB-02 Salesman app: routes/beats, retailer visit, take order offline, schemes, credit status | Feature | Meyyarivu |
| 308 | MOB-03 Collection app: record payments against invoices, receipt share | Feature | Meyyarivu |
| 309 | AIA-01 Assistant screen (`/assistant` + Ask in Ctrl+K, formerly PLT-21): chat with answer text and data cards (tables from tool results), "data used" line with branch and period, suggested questions per role, feedback, keyboard-first, 1280 / 375 px, disabled offline on desktop | Feature | Gokul |
| 310 | AIA-02 Assistant module and orchestrator: per-question pipeline (tenant from token, branch checked against the token, permission and tenant setting, prompt assembly, max 3 tool rounds, answer), conversations and messages API (`/api/v1/assistant/*`, `Idempotency-Key`), redacted history kept in MENO, no state at the provider | Feature | — |
| 311 | AIA-03 LLM provider adapter in `integrations`: `LlmClient` port + Groq adapter (OpenAI-compatible chat API with tool calling), key in Key Vault, model, timeout, token limit and retries from configuration, provider errors mapped to friendly messages, egress allowlist, recorded-response mock for CI (verify) provider terms, retention and model (R-52) | Feature | Jeeva |
| 312 | AIA-04 Tool registry: allowlisted typed tools with JSON schema and Bean Validation, bounds on dates and limits, one permission per tool, tools hidden from users without it, tenant and branch injected from `TenantContext` (never tool arguments), no SQL from the model, write tools forbidden | Feature | — |
| 313 | AIA-05 Sales tools: `get_sales_summary` (period ≤ 366 days, group by day / week / month, compare to previous period or last year), `get_top_items`, `get_payment_mode_split`, from reporting views, tenant time zone | Feature | Kamesh |
| 314 | AIA-06 Stock tools: `get_low_stock_items`, `get_expiring_batches`, `search_inventory` (name, salt or barcode) through read-only `StockQueryFacade` and `CatalogFacade` | Feature | Kamesh |
| 315 | AIA-07 Bill quote tool: `quote_bill` prices lines through `PricingEngine` + `GstCalculator` (passes every case in `contracts/test-vectors/`); a quote only, never an invoice; the model explains, it never calculates | Feature | Kamesh |
| 316 | AIA-08 Privacy and consent: `Redactor` strips phone, email, Aadhaar / ABHA-like numbers and patient names; never sends customer, prescription, doctor, register, GSTIN, PAN or bank data; party names only on owner opt-in; owner enables the assistant per tenant after a notice, audited (verify) DPDP notice and consent wording (R-52) | Feature | Gokul |
| 317 | AIA-09 Answer guards: every figure in the answer must come from a tool result (else the card is shown with a template text), prompt-injection defence (tool output, item names and documents are untrusted), refusal with a screen link for write requests, length limits | Feature | — |
| 318 | AIA-10 Usage limits and cost: questions per user per day from plan entitlements, per-tenant rate limit (429 `ASSISTANT_QUOTA_EXCEEDED`), token metering per tenant, usage shown in Settings → Assistant (verify) quota numbers per plan | Feature | Gokul |
| 319 | AIA-11 Assistant audit, security tests and monitoring: audit row per question (who, tenant, branch, tools, tokens, latency, outcome, no prompt text), Grafana metrics and alerts (errors, p95, daily tokens), RLS fail-closed and connection-pool leak tests under `meno_app`, cross-tenant through tools (critical scenario #16) | Feature | Jeeva |
| 320 | PLT-18 Multi-language UI (English first; Tamil, Hindi later) | Feature | — |
| 321 | PLT-34 SCIM 2.0 user provisioning and de-provisioning from the customer's directory | Feature | — |
| 322 | ACC-11 Payment gateway / UPI collect links for wholesale dues | Feature | — |
| 323 | ACX-10 Income-tax overview for the owner (turnover, profit, advance-tax reminders) (verify) | Feature | — |
| 324 | RPT-12 Sales forecasting & smart reorder (ML) | Feature | Gokul |
| 325 | ANX-04 Customer & product intelligence: purchase frequency, refill prediction, churn risk | Feature | Gokul |
| 326 | CRM-05 Offers and coupons | Feature | Gokul |
| 327 | CRM-07 Support tickets for customer issues beyond complaints | Feature | Gokul |
| 328 | CRM-09 Gift vouchers (issue, redeem, balance, expiry) and time-boxed flash-sale prices (verify) voucher accounting / GST | Feature | Gokul |
| 329 | ENG-02 Customer feedback after purchase (link in WhatsApp invoice) | Feature | Gokul |
| 330 | NTF-06 Pill / dose-time reminders to patients from the prescription schedule, opt-in only (verify) consent, DPDP Act | Feature | Meyyarivu |
| 331 | ADM-12 API keys and webhooks management (with INT-05) | Feature | — |
| 332 | ADM-13 Staff training: in-app lessons and quizzes per role, completion certificates | Feature | — |
| 333 | DLV-02 Live order tracking link for the customer (rider location from the delivery app, MOB-04) | Feature | Gokul |
| 334 | DLV-03 Fleet management: riders, vehicles, shifts, delivery zones and charges, rider performance | Feature | Gokul |
| 335 | OMN-01 Store web page per branch: address, hours, contact, order via WhatsApp | Feature | Gokul, Jeeva |
| 336 | OMN-02 White-label customer app: order with prescription upload, reorder, track (verify) online sale of medicines rules | Feature | Gokul, Jeeva |
| 337 | OMN-03 Marketplace channels: ONDC, Amazon, Flipkart order intake with stock sync (extends INT-06) (verify) online sale of medicines rules | Feature | Gokul, Jeeva |
| 338 | INT-05 Public API + webhooks for partners | Feature | Jeeva |
| 339 | INT-06 Online pharmacy / e-commerce order intake | Feature | Jeeva |
| 340 | INT-07 ABHA / ABDM integration: link a customer's ABHA, receive e-prescriptions (verify) ABDM certification | Feature | Jeeva |
| 341 | INT-08 EMR integration: receive prescriptions from clinic software | Feature | Jeeva |
| 342 | INT-09 Hospital software (HMIS) integration: hospital pharmacy billing against patient / IP number, ward indents | Feature | Jeeva |
| 343 | INT-13 Insurance / TPA / corporate credit billing for hospital pharmacies: payer master, co-pay split, claim status | Feature | Jeeva |
| 344 | INT-14 Hospital (IP) pharmacy: ward indents, issue against admission, returns from ward, consolidated IP bill to the hospital system (extends INT-09) | Feature | Jeeva |
| 345 | MOB-04 Delivery app: delivery proof (photo/signature), returns pickup | Feature | Meyyarivu |
| 346 | MOB-05 Camera barcode scan for stock count | Feature | Meyyarivu |
| 347 | MOB-06 Android quick-billing app for small shops with Bluetooth thermal printer, barcode by camera, offline queue | Feature | Meyyarivu |
| 348 | AIA-12 Store documents (RAG, optional): owner uploads SOPs, policies and supplier terms; chunked and embedded into PostgreSQL pgvector with tenant RLS; `search_store_documents` returns snippets with document and page; content treated as untrusted (verify) embedding provider | Feature | Gokul, Jeeva |
| 349 | Mobile app ADR (Expo, shared packages) and field-sales module design | Readiness | — |
| 350 | Pricing and plans for public launch; subscription billing live | Readiness | — |
| 351 | Public launch checklist: marketing site, support channel, status page | Readiness | — |
| 352 | P7 phase gate: Growth complete | Phase gate | — |
