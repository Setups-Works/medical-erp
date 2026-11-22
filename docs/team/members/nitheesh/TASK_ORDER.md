# Nitheesh — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**227 tasks** · P0: 9 · P1: 15 · P2: 23 · P3: 19 · P4: 32 · P5: 51 · P6: 44 · P7: 34

## P0 · Foundation (9)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | ✅ Monorepo folder structure, AGENTS.md files, architecture docs, ADRs | Groundwork | — |
| 2 | ✅ Study 2 existing pharmacy products: features, flows, pain points (share notes with Prakalya) | Groundwork | — |
| 3 | ✅ Review BRD for P1–P3 with Prakalya | Groundwork | — |
| 4 | ✅ Review ER diagram with Kamesh; review wireframes with Meyyarivu | Groundwork | — |
| 5 | ✅ Run architecture review meeting (day 13); approve Sprint 1 backlog | Groundwork | — |
| 6 | ✅ Create the GitHub repo `meno`, push the foundation (folders + docs) through a PR into `develop` | Readiness | — |
| 7 | ✅ Hold the architecture review meeting and accept or change each ADR (`docs/decisions/`) | Readiness | — |
| 8 | ✅ Decide ADR-0009 (Problem Details vs response envelope) and mark it Accepted | Readiness | — |
| 9 | P0 phase gate: Foundation complete, start P1 | Phase gate | — |

## P1 · Platform core (15)

| Step | Task | Type | With |
|---|---|---|---|
| 10 | Backend skeleton: Maven project, Spring Modulith, `ArchitectureTest`, `common/error` (Problem Details), `common/web` (page envelope), `common/money`, `common/validation` | Groundwork | — |
| 11 | `security/`: JWT issue/verify, refresh rotation, cookie handling, `PermissionChecker` | Groundwork | — |
| 12 | `tenancy/`: `TenantContextFilter`, Hibernate filter, RLS `SET LOCAL` interceptor, `CrossTenantAccessTest` base | Groundwork | — |
| 13 | `identity` + `audit` modules (users, roles, permissions, audit log) | Groundwork | — |
| 14 | Configuration framework: `tenant_setting`, lookup tables and the `SettingsFacade` (nothing hard-coded, see VALIDATION_AND_BUSINESS_RULES.md) | Groundwork | — |
| 15 | OpenAPI export → `contracts/openapi/meno-api.yaml` → `packages/api-client` generation script | Groundwork | — |
| 16 | Users & roles screens and role permission editor (web `users/`) | Groundwork | — |
| 17 | PLT-01 Tenant sign-up, onboarding wizard (business type, GSTIN, drug licence nos., first branch, financial year) | Feature | — |
| 18 | PLT-06 Users, invitations, branch access, deactivate | Feature | — |
| 19 | PLT-07 Roles & configurable permissions (`module.resource.action`); default roles: Super Admin, Business Owner, Branch Manager, Pharmacist, Billing Operator, Inventory Manager, Accountant, Wholesale Manager, Sales Representative, Auditor, Delivery (see ROLES_AND_DASHBOARDS.md) | Feature | — |
| 20 | PLT-08 Login with email/phone + password, refresh-token rotation, logout all devices | Feature | — |
| 21 | AUT-01 Forgot / reset password (single-use emailed token, 30 min expiry, all sessions revoked on reset); sign in with email or username | Feature | Meyyarivu |
| 22 | NAV-01 App sidebar navigation: Dashboard + 10 groups (Sales, Purchase, Inventory, Masters, Wholesale, Finance, CRM & Engagement, Reports, GST & Compliance, Administration) exactly as in NAVIGATION.md; hides items by edition and permission; collapsible rail; remembers open groups | Feature | Meyyarivu |
| 23 | Cross-tenant test base class in place and used by every endpoint test | Readiness | Kamesh |
| 24 | P1 phase gate: Platform core complete, start P2 | Phase gate | — |

## P2 · Masters (23)

| Step | Task | Type | With |
|---|---|---|---|
| 25 | `files` module (signed URLs, MinIO/Azure Blob adapter) | Groundwork | — |
| 26 | Company, branch and settings screens (web `company/`, `branches/`, `settings/`) | Groundwork | — |
| 27 | Number series + tenant settings endpoints and screens | Groundwork | — |
| 28 | Decide the Indian medicine data source and licence (CAT-10, INT-11) from Jeeva's comparison and Prakalya's hit-rate check; record it as an ADR | Groundwork | — |
| 29 | Confirm compliance rule: Drugs and Cosmetics Act 1940 & Rules 1945 | Confirm rule | — |
| 30 | Confirm compliance rule: Schedule H | Confirm rule | — |
| 31 | Confirm compliance rule: Schedule H1 | Confirm rule | — |
| 32 | Confirm compliance rule: Schedule X | Confirm rule | — |
| 33 | Confirm compliance rule: NDPS | Confirm rule | — |
| 34 | Confirm compliance rule: Pharmacist | Confirm rule | — |
| 35 | Confirm compliance rule: Banned FDCs / recalls | Confirm rule | — |
| 36 | Confirm compliance rule: GST invoice rules | Confirm rule | — |
| 37 | Confirm compliance rule: Default chart of accounts | Confirm rule | — |
| 38 | Confirm compliance rule: State rules | Confirm rule | — |
| 39 | PLT-02 Multiple companies per tenant (separate GSTIN, edition per company) | Feature | — |
| 40 | PLT-03 Multiple branches / warehouses, branch-specific settings, address, licence numbers | Feature | — |
| 41 | PLT-05 Document number series per branch / type / FY / device (INV, PUR, SR, PR, CN, DN, RCPT…) | Feature | — |
| 42 | PLT-12 Audit log viewer (who changed what, before/after, filter by user/document) | Feature | — |
| 43 | PLT-13 Tenant settings: rounding, negative stock allowed, MRP-inclusive billing, discount limits per role, expiry block days, print formats | Feature | — |
| 44 | AUT-02 Initial configuration wizard: tax settings, invoice number series, currency (INR), units, rounding, negative-stock policy (writes tenant settings, nothing hard-coded) | Feature | Meyyarivu |
| 45 | NAV-04 Global keyboard shortcuts: one shortcut registry, global keys, `G` go-to and `N` create sequences, list keys, form keys (`Ctrl+S`, `Ctrl+Enter`, `Ctrl+P`), shortcut sheet `Ctrl+/`, shortcuts in tooltips and command search (KEYBOARD_SHORTCUTS.md) | Feature | Meyyarivu |
| 46 | AUT-03 Onboarding checklist: setup steps with progress (company, licence, GST, branch, users, items, opening stock, printer) until the business is ready to bill | Feature | Meyyarivu |
| 47 | P2 phase gate: Masters complete, start P3 | Phase gate | — |

## P3 · Purchase & inventory (19)

| Step | Task | Type | With |
|---|---|---|---|
| 48 | `packages/billing-engine` (decimal.js) passing all test vectors, with Kamesh's Java engines | Groundwork | — |
| 49 | `reporting` module: report framework (filters, pagination, export, permissions), stock/expiry/purchase report views | Groundwork | — |
| 50 | Inventory dashboard screens (web `dashboard/`); report API contracts for Ashok's reports centre | Groundwork | — |
| 51 | Confirm compliance rule: Record retention | Confirm rule | — |
| 52 | PLT-16 Data import on onboarding (items, opening stock, customers, suppliers, outstanding) from Excel/CSV and common pharmacy software exports | Feature | — |
| 53 | NAV-05 Transaction-screen keyboard map: purchase entry, sales invoice, transfers and journals use the POS meanings (`F2` item, `F3` party, `F5` batch, `F10` save & post, `Ctrl+Del` remove line); full grid navigation without a mouse | Feature | Meyyarivu |
| 54 | DSH-04 Inventory dashboard: stock value, low stock, near-expiry, expired, dead stock, pending GRNs | Feature | — |
| 55 | RPT-03 Purchase register (supplier-wise, item-wise) | Feature | Ashok |
| 56 | RPT-04 Stock reports: current stock, batch-wise, valuation, movement history of an item | Feature | Ashok |
| 57 | RPT-05 Expiry report, expired stock, near-expiry by supplier (for returns) | Feature | Ashok |
| 58 | RPT-16 Report framework standard: every report has date range, filters, server pagination, export and permission control | Feature | Ashok |
| 59 | ADM-06 Import centre: all imports as jobs with status, error rows download, re-run | Feature | — |
| 60 | INT-04 Distributor file formats (CSV templates per major distributor) | Feature | Jeeva |
| 61 | CAT-24 Medicine search-as-you-type on the item create form (feeds CAT-23): search box with a dropdown of DrugDB matches after a 200 ms pause, previous request cancelled, ↑ ↓ Enter Esc keyboard control, each row shows name, composition, pack, manufacturer, MRP; DrugDB's `fuzzy` / `searched_as` / `unit_ignored` / `ignored` notes shown to the user; picking a row pre-fills name, composition, manufacturer, dosage form and pack (each marked and editable), MRP shown as a hint only, barcode / HSN / GST / schedule left for the user; works by hand if DrugDB is down. Calls only meno-api, never DrugDB directly | Feature | — |
| 62 | INT-11 Indian medicine data adapter in `integrations`: server-side client for the source chosen under CAT-10 (lookup by EAN-13 barcode, brand and salt), key in secrets, shared cache, records source + source id + fetched date on anything it fills (verify) provider and licence | Feature | Jeeva |
| 63 | INT-12 DrugDB API adapter (first provider behind INT-11, if the P2 decision picks DrugDB): server-side client for `GET https://drugdb.in/v1/search?q=` and `GET /v1/products/{product_id}`, `X-Api-Key` from secrets (paid plan for production; the trial and keyless visitor access are for evaluation only), one reused HTTP client, 5 s timeout, product details cached 1 h with ETag / `If-None-Match`, search never cached, 429 (`Retry-After`) and 403 (plan ended) mapped to a friendly "reference unavailable", never bulk-stores the catalogue (DrugDB terms), records `source = drugdb` + `product_id` (DDID…) on items it fills. Taught in Hub → Learn → Day 19 (verify) paid plan + terms confirmed | Feature | — |
| 64 | Calculation parity CI job: Java and TypeScript must pass every test vector | Readiness | Ashok |
| 65 | Choose the GST e-invoice provider (GSP/IRP) with a cost comparison and sandbox access | Readiness | — |
| 66 | P3 phase gate: Purchase & inventory complete, start P4 | Phase gate | — |

## P4 · Retail POS & returns (32)

| Step | Task | Type | With |
|---|---|---|---|
| 67 | Electron main process: window, preload bridge, printing service, scanner input, auto-update hook (Jeeva packages) | Groundwork | — |
| 68 | Data-source abstraction in web (`online` HTTP / `local` IPC) agreed with Meyyarivu | Groundwork | — |
| 69 | Role-based landing + retail dashboard + widget library (web `dashboard/`) | Groundwork | — |
| 70 | `notification` module: email + in-app, alert rules | Groundwork | — |
| 71 | Admin settings screens: payment, printer, notification settings (web `admin/`) | Groundwork | — |
| 72 | Confirm compliance rule: E-invoice | Confirm rule | — |
| 73 | Confirm compliance rule: E-way bill | Confirm rule | — |
| 74 | Confirm compliance rule: GST returns | Confirm rule | — |
| 75 | NAV-03 Desktop menu bar (File, Edit, View, Go, New, Window, Help) built from the same nav config as the sidebar, edition- and permission-aware, accelerators from KEYBOARD_SHORTCUTS.md | Feature | Meyyarivu |
| 76 | DSH-01 Role-based landing: each role opens its own dashboard and menu (see ROLES_AND_DASHBOARDS.md); dashboards are configuration, not code branches | Feature | — |
| 77 | DSH-02 Retail dashboard: counter sales, bills today, collections by mode, returns, top items | Feature | — |
| 78 | DSH-08 Dashboard widget library: today's sales, purchases, gross margin, net sales, invoices, cash collection, credit sales, receivables, payables, low stock, near-expiry, expired, fast-moving, slow-moving, branch performance; each widget permission-aware | Feature | — |
| 79 | RPT-01 Owner dashboard: today's sales, collections, purchases, margin, low stock, near expiry, outstanding | Feature | Ashok |
| 80 | RPT-02 Sales register (day/month, bill-wise, item-wise, customer-wise, doctor-wise, user-wise, branch-wise) | Feature | Ashok |
| 81 | RPT-09 Schedule H1 / narcotic registers | Feature | Ashok |
| 82 | RPT-13 Reports centre: catalogue, favourites, saved filters, recent | Feature | Ashok |
| 83 | RPT-14 Batch-wise sales and traceability: who received batch X (recalls) | Feature | Ashok |
| 84 | ANX-06 POS register (counter/shift-wise), sales & sales-return registers, compliance register | Feature | Ashok |
| 85 | NTF-01 In-app notification centre | Feature | Meyyarivu |
| 86 | NTF-02 Email (invoices, reports, alerts) | Feature | Meyyarivu |
| 87 | NTF-05 Alert rules: low stock, near expiry, credit overdue, licence expiry, device not synced | Feature | Meyyarivu |
| 88 | ADM-02 Payment settings: payment modes, UPI VPA, card terminals, bank accounts | Feature | — |
| 89 | ADM-03 Printer and print-template settings (per branch / counter, web and desktop) | Feature | — |
| 90 | DSK-01 Windows installer (and macOS), auto-update with staged rollout | Feature | Meyyarivu, Jeeva |
| 91 | DSK-03 Thermal/A4 printing without browser dialog, printer profiles per counter | Feature | Meyyarivu, Jeeva |
| 92 | DSK-04 USB/HID barcode scanner support, weighing scale (later) | Feature | Meyyarivu, Jeeva |
| 93 | NAV-02 Global command search (`Ctrl K`): jump to any menu item, item, party or document number | Feature | Meyyarivu |
| 94 | DSH-07 Activity timeline: recent user activity (from audit log) filtered by branch/user/module | Feature | — |
| 95 | RPT-15 Discount report by user, item, reason | Feature | Ashok |
| 96 | ADM-04 Notification settings per user, role and channel | Feature | — |
| 97 | Choose the WhatsApp Business and SMS (DLT) providers | Readiness | — |
| 98 | P4 phase gate: Retail POS & returns complete, start P5 | Phase gate | — |

## P5 · Wholesale, finance, offline (51)

| Step | Task | Type | With |
|---|---|---|---|
| 99 | `modules/sync` (device registration, number-series blocks, push/pull, conflicts) + desktop SQLCipher store and sync engine | Groundwork | — |
| 100 | `payment` module: receipts and payments with allocation; screens (web `payments/`) | Groundwork | — |
| 101 | `accounting` module: chart of accounts, vouchers from events, books, ledgers; screens (web `accounting/`) | Groundwork | — |
| 102 | Financial and wholesale dashboards; customer history (CRM) | Groundwork | — |
| 103 | Pilot go/no-go | Groundwork | — |
| 104 | Confirm compliance rule: DPDP Act 2023 | Confirm rule | — |
| 105 | PLT-04 Financial year management, year-end closing and carry-forward of balances and stock | Feature | — |
| 106 | PLT-11 Session & device management (register/revoke counter PCs) | Feature | — |
| 107 | ACC-01 Customer receipts with allocation to invoices (FIFO or manual), on-account | Feature | — |
| 108 | ACC-02 Supplier payments with allocation, cheque details, PDC tracking | Feature | — |
| 109 | ACC-03 Chart of accounts with default ledgers (sales, purchase, GST input/output, cash, bank, round-off) | Feature | — |
| 110 | ACC-04 Auto-posting of vouchers from documents (event-driven, double-entry) | Feature | — |
| 111 | ACC-05 Expenses entry (rent, salary, electricity) | Feature | — |
| 112 | ACC-06 Cash book, bank book, day book, ledger statements | Feature | — |
| 113 | ACC-09 Outstanding & ageing (receivable/payable), payment reminders | Feature | — |
| 114 | ACX-01 Journal, contra (cash↔bank), receipt and payment vouchers with narration templates | Feature | — |
| 115 | ACX-02 Income & expense vouchers and an income/expense register | Feature | — |
| 116 | ACX-03 Ledger groups (chart of accounts tree), opening balances, set-up ledgers wizard | Feature | — |
| 117 | ACX-11 Onboarding wizard for books: chart of accounts, bank accounts, GST registration, FY | Feature | — |
| 118 | ACX-13 Finance dashboard and general ledger page (drill down from any balance to vouchers to documents) | Feature | — |
| 119 | ACX-14 Ledger group master: chart-of-accounts tree (Asset / Liability / Equity / Income / Expense → sub-groups such as Current Assets → Sundry Debtors); user sub-groups; system groups locked | Feature | — |
| 120 | ACX-15 Default chart of accounts seeded on company set-up (CHART_OF_ACCOUNTS.md: 24 groups, 43 ledgers for cash, bank, sales, purchase, returns, GST input/output, round-off, discounts, expiry loss, expenses); system ledgers renamable, never deletable (verify) confirm with CA | Feature | — |
| 121 | ACX-16 Party ledgers created automatically: every supplier under Sundry Creditors, every customer under Sundry Debtors, linked to the party master | Feature | — |
| 122 | ACX-17 Posting rules: each document event (sale, purchase, returns, receipt, payment, write-off, expense) mapped to system ledgers by code, effective-dated; posting is refused if a ledger is missing | Feature | — |
| 123 | DSH-03 Wholesale dashboard: orders by status, dispatch, receivables, credit-limit breaches, salesman performance | Feature | — |
| 124 | DSH-05 Financial dashboard: cash, bank, receivables, payables, expenses, GST liability | Feature | — |
| 125 | RPT-06 Profit reports (bill-wise, item-wise, category-wise) on landed cost | Feature | Ashok |
| 126 | RPT-07 Outstanding & ageing reports | Feature | Ashok |
| 127 | ADM-05 Login history and active sessions (with sign-out of other sessions) | Feature | — |
| 128 | INT-01 GST IRP / GSP for e-invoice & e-way bill (verify) provider choice | Feature | Jeeva |
| 129 | DSK-02 Offline SQLite store, sync engine, status bar indicator | Feature | Meyyarivu, Jeeva |
| 130 | DSK-05 Device registration & revoke, local data encryption | Feature | Meyyarivu, Jeeva |
| 131 | PLT-09 Two-factor authentication (TOTP) for admins | Feature | — |
| 132 | PLT-10 Counter PIN login on desktop (fast user switch at the counter) | Feature | — |
| 133 | PLT-19 Approval workflows (discount above limit, credit limit override, stock adjustment, purchase above value) | Feature | — |
| 134 | PLT-20 Network (IP) allowlist per branch: restrict sign-in for chosen roles to the shop's network; denied attempts logged | Feature | — |
| 135 | RPT-11 Export every report to Excel/PDF, schedule by email | Feature | Ashok |
| 136 | ANX-01 Bill-wise profit and rate / quantity difference analysis (purchase vs sale price drift) | Feature | Ashok |
| 137 | ANX-02 ABC ranking of items by value/volume; stock-flow card (opening → in → out → closing) | Feature | Ashok |
| 138 | ANX-07 Sales vs payment and sales vs purchase trend charts | Feature | Ashok |
| 139 | CRM-01 Customer history (customer 360): all bills, returns, prescriptions, doctors, outstanding, refill pattern on one page | Feature | — |
| 140 | NTF-03 WhatsApp Business API: invoice share, payment reminders, refill reminders (verify) template approval & cost | Feature | Meyyarivu |
| 141 | NTF-04 SMS (DLT-registered templates) (verify) | Feature | Meyyarivu |
| 142 | ADM-01 Integrations settings page: GST e-invoice provider, WhatsApp, SMS, email, Tally export, payment links: connect, test, see status and last error | Feature | — |
| 143 | ADM-07 Export centre: job-based exports (reports, masters, full tenant export) | Feature | — |
| 144 | INT-02 WhatsApp Business provider, SMS provider | Feature | Jeeva |
| 145 | DSK-06 Local backup export of offline data (emergency) | Feature | Meyyarivu, Jeeva |
| 146 | External or peer penetration test of auth, tenancy, file upload and sync; fix all High/Critical | Readiness | — |
| 147 | Privacy notice and terms of service reviewed (DPDP Act) | Readiness | — |
| 148 | Production go/no-go review: QA report, security report, restore drill, UAT, all S1/S2 closed | Readiness | — |
| 149 | P5 phase gate: Wholesale, finance, offline complete, start P6 | Phase gate | — |

## P6 · Pilot & GST returns (44)

| Step | Task | Type | With |
|---|---|---|---|
| 150 | Final accounts (trial balance, P&L, balance sheet, cash flow), Tally export | Groundwork | — |
| 151 | Super-admin console, subscriptions, platform billing | Groundwork | — |
| 152 | Pilot support rota, weekly pilot review, prioritise feedback | Groundwork | — |
| 153 | ACX-07 Final accounts: trial balance, trading & P&L, balance sheet, group register, ledger report | Feature | — |
| 154 | ACX-09 GST dashboard: output vs input tax, liability, filing status by period | Feature | — |
| 155 | RPT-08 GST reports (see §12) | Feature | Ashok |
| 156 | PLT-14 Subscription plans, edition gating, usage limits (users, branches, invoices/month), trial | Feature | — |
| 157 | PLT-15 Platform super-admin console (tenants, plans, health, support impersonation with consent) | Feature | — |
| 158 | PLT-17 Data export (full tenant export for portability) | Feature | — |
| 159 | ACC-07 Bank reconciliation (statement import) | Feature | — |
| 160 | ACC-08 Trial balance, P&L, balance sheet | Feature | — |
| 161 | ACC-10 Tally export (XML vouchers + masters) | Feature | — |
| 162 | ACC-12 Payment gateway integration: dynamic UPI QR, card and wallet with automatic confirmation on the bill (webhook, idempotent) (verify) provider choice | Feature | — |
| 163 | ACC-13 Auto payment reconciliation: match gateway / UPI settlements and bank credits to bills and receipts; unmatched items go to a review queue | Feature | — |
| 164 | ACX-04 Fixed assets: asset master, purchase voucher, depreciation schedule (SLM/WDV) (verify) rates | Feature | — |
| 165 | ACX-06 TDS / TCS section and rate masters, deduction on payments/receipts (verify) | Feature | — |
| 166 | ACX-08 Bank dashboard: balances, unreconciled entries, cheque status | Feature | — |
| 167 | ACX-12 Cash-flow statement | Feature | — |
| 168 | DSH-06 Branch dashboard: branch-to-branch comparison of sales, margin, stock, expiry | Feature | — |
| 169 | DSH-09 Super-admin platform analytics: tenants, plans, usage, health, revenue | Feature | — |
| 170 | RPT-10 Branch comparison | Feature | Ashok |
| 171 | ANX-03 Customer, product and vendor performance reports (top, declining, dormant) | Feature | Ashok |
| 172 | CRM-02 Complaints: log customer/retailer complaints (wrong item, short supply, damaged, billing error) with status, owner, due date, resolution and link to the bill/return | Feature | — |
| 173 | ENG-01 WhatsApp connection settings, broadcast campaigns (offers, refill reminders) with delivery reports (verify) opt-in | Feature | — |
| 174 | ADM-08 Backup status and tenant data download | Feature | — |
| 175 | ADM-09 Data retention policies per record type (verify) | Feature | — |
| 176 | ADM-10 Platform billing: MENO's invoices to the tenant, payment history | Feature | — |
| 177 | ADM-11 Help centre and support tickets to the MENO team | Feature | — |
| 178 | DLV-01 Home-delivery orders with rider assignment, status, cash-on-delivery collection and rider settlement (extends POS-18) | Feature | — |
| 179 | OMN-04 WhatsApp ordering: customer sends an order or prescription on WhatsApp, it lands as a draft bill at the counter | Feature | Jeeva |
| 180 | INT-03 Tally export | Feature | Jeeva |
| 181 | ACX-05 Loans and liabilities: loan voucher, EMI schedule, interest booking | Feature | — |
| 182 | ANX-05 Smart insights card on dashboard (plain-language highlights: "Sales of X down 30 % vs last month") | Feature | Ashok |
| 183 | CRM-03 CRM dashboard: active customers, refills due, complaints, loyalty | Feature | — |
| 184 | CRM-04 Loyalty transactions: points earned / redeemed ledger | Feature | — |
| 185 | CRM-06 Follow-up reminders for staff (call customer, collect payment) | Feature | — |
| 186 | CRM-08 Paid membership plans: fee, validity, benefits (discount %, free delivery), renewal reminders | Feature | — |
| 187 | INT-10 openFDA adapter in `integrations` (reference only): server-side client for the drug label endpoint, optional API key from secrets, cache by label `set_id` (weekly updates), handles 404 "no matches" and 429; only needed for CAT-21 | Feature | Jeeva |
| 188 | Onboard pilot pharmacy 1 (retail): data migration, training, first live bill | Readiness | — |
| 189 | Onboard pilot pharmacy 2 (retail) | Readiness | — |
| 190 | Onboard pilot distributor (wholesale) with e-invoice live | Readiness | — |
| 191 | Support rota and incident process during the pilot (response times agreed) | Readiness | — |
| 192 | Four weeks of pilot with zero data-integrity incidents: declare MENO production-ready (v1.1) | Readiness | — |
| 193 | P6 phase gate: Pilot & GST returns complete, start P7 | Phase gate | — |

## P7 · Growth (34)

| Step | Task | Type | With |
|---|---|---|---|
| 194 | Field-sales and mobile owner app requirements (Prakalya reviews) | Groundwork | — |
| 195 | Mobile architecture ADR (Expo, shared packages), fieldsales module design | Groundwork | — |
| 196 | MOB-01 Owner app: dashboard, approvals, alerts | Feature | Meyyarivu |
| 197 | MOB-02 Salesman app: routes/beats, retailer visit, take order offline, schemes, credit status | Feature | Meyyarivu |
| 198 | MOB-03 Collection app: record payments against invoices, receipt share | Feature | Meyyarivu |
| 199 | PLT-18 Multi-language UI (English first; Tamil, Hindi later) | Feature | — |
| 200 | PLT-21 AI assistant: plain-language, read-only questions over the tenant's own data ("what expires next month?"), permission-aware (verify) no patient data to an external AI without consent | Feature | — |
| 201 | ACC-11 Payment gateway / UPI collect links for wholesale dues | Feature | — |
| 202 | ACX-10 Income-tax overview for the owner (turnover, profit, advance-tax reminders) (verify) | Feature | — |
| 203 | RPT-12 Sales forecasting & smart reorder (ML) | Feature | Ashok |
| 204 | ANX-04 Customer & product intelligence: purchase frequency, refill prediction, churn risk | Feature | Ashok |
| 205 | CRM-05 Offers and coupons | Feature | — |
| 206 | CRM-07 Support tickets for customer issues beyond complaints | Feature | — |
| 207 | CRM-09 Gift vouchers (issue, redeem, balance, expiry) and time-boxed flash-sale prices (verify) voucher accounting / GST | Feature | — |
| 208 | ENG-02 Customer feedback after purchase (link in WhatsApp invoice) | Feature | — |
| 209 | NTF-06 Pill / dose-time reminders to patients from the prescription schedule, opt-in only (verify) consent, DPDP Act | Feature | Meyyarivu |
| 210 | ADM-12 API keys and webhooks management (with INT-05) | Feature | — |
| 211 | ADM-13 Staff training: in-app lessons and quizzes per role, completion certificates | Feature | — |
| 212 | DLV-02 Live order tracking link for the customer (rider location from the delivery app, MOB-04) | Feature | — |
| 213 | DLV-03 Fleet management: riders, vehicles, shifts, delivery zones and charges, rider performance | Feature | — |
| 214 | OMN-01 Store web page per branch: address, hours, contact, order via WhatsApp | Feature | Jeeva |
| 215 | OMN-02 White-label customer app: order with prescription upload, reorder, track (verify) online sale of medicines rules | Feature | Jeeva |
| 216 | OMN-03 Marketplace channels: ONDC, Amazon, Flipkart order intake with stock sync (extends INT-06) (verify) online sale of medicines rules | Feature | Jeeva |
| 217 | INT-05 Public API + webhooks for partners | Feature | Jeeva |
| 218 | INT-06 Online pharmacy / e-commerce order intake | Feature | Jeeva |
| 219 | INT-07 ABHA / ABDM integration: link a customer's ABHA, receive e-prescriptions (verify) ABDM certification | Feature | Jeeva |
| 220 | INT-08 EMR integration: receive prescriptions from clinic software | Feature | Jeeva |
| 221 | INT-09 Hospital software (HMIS) integration: hospital pharmacy billing against patient / IP number, ward indents | Feature | Jeeva |
| 222 | MOB-04 Delivery app: delivery proof (photo/signature), returns pickup | Feature | Meyyarivu |
| 223 | MOB-05 Camera barcode scan for stock count | Feature | Meyyarivu |
| 224 | Mobile app ADR (Expo, shared packages) and field-sales module design | Readiness | — |
| 225 | Pricing and plans for public launch; subscription billing live | Readiness | — |
| 226 | Public launch checklist: marketing site, support channel, status page | Readiness | — |
| 227 | P7 phase gate: Growth complete | Phase gate | — |
