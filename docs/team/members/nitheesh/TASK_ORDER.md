# Nitheesh — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**196 tasks** · P0: 9 · P1: 15 · P2: 20 · P3: 15 · P4: 31 · P5: 46 · P6: 38 · P7: 22

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

## P2 · Masters (20)

| Step | Task | Type | With |
|---|---|---|---|
| 25 | `files` module (signed URLs, MinIO/Azure Blob adapter) | Groundwork | — |
| 26 | Company, branch and settings screens (web `company/`, `branches/`, `settings/`) | Groundwork | — |
| 27 | Number series + tenant settings endpoints and screens | Groundwork | — |
| 28 | Confirm compliance rule: Drugs and Cosmetics Act 1940 & Rules 1945 | Confirm rule | — |
| 29 | Confirm compliance rule: Schedule H | Confirm rule | — |
| 30 | Confirm compliance rule: Schedule H1 | Confirm rule | — |
| 31 | Confirm compliance rule: Schedule X | Confirm rule | — |
| 32 | Confirm compliance rule: NDPS | Confirm rule | — |
| 33 | Confirm compliance rule: Pharmacist | Confirm rule | — |
| 34 | Confirm compliance rule: Banned FDCs / recalls | Confirm rule | — |
| 35 | Confirm compliance rule: GST invoice rules | Confirm rule | — |
| 36 | Confirm compliance rule: State rules | Confirm rule | — |
| 37 | PLT-02 Multiple companies per tenant (separate GSTIN, edition per company) | Feature | — |
| 38 | PLT-03 Multiple branches / warehouses, branch-specific settings, address, licence numbers | Feature | — |
| 39 | PLT-05 Document number series per branch / type / FY / device (INV, PUR, SR, PR, CN, DN, RCPT…) | Feature | — |
| 40 | PLT-12 Audit log viewer (who changed what, before/after, filter by user/document) | Feature | — |
| 41 | PLT-13 Tenant settings: rounding, negative stock allowed, MRP-inclusive billing, discount limits per role, expiry block days, print formats | Feature | — |
| 42 | AUT-02 Initial configuration wizard: tax settings, invoice number series, currency (INR), units, rounding, negative-stock policy (writes tenant settings, nothing hard-coded) | Feature | Meyyarivu |
| 43 | AUT-03 Onboarding checklist: setup steps with progress (company, licence, GST, branch, users, items, opening stock, printer) until the business is ready to bill | Feature | Meyyarivu |
| 44 | P2 phase gate: Masters complete, start P3 | Phase gate | — |

## P3 · Purchase & inventory (15)

| Step | Task | Type | With |
|---|---|---|---|
| 45 | `packages/billing-engine` (decimal.js) passing all test vectors, with Kamesh's Java engines | Groundwork | — |
| 46 | `reporting` module: report framework (filters, pagination, export, permissions), stock/expiry/purchase report views | Groundwork | — |
| 47 | Inventory dashboard screens (web `dashboard/`); report API contracts for Ashok's reports centre | Groundwork | — |
| 48 | Confirm compliance rule: Record retention | Confirm rule | — |
| 49 | PLT-16 Data import on onboarding (items, opening stock, customers, suppliers, outstanding) from Excel/CSV and common pharmacy software exports | Feature | — |
| 50 | DSH-04 Inventory dashboard: stock value, low stock, near-expiry, expired, dead stock, pending GRNs | Feature | — |
| 51 | RPT-03 Purchase register (supplier-wise, item-wise) | Feature | Ashok |
| 52 | RPT-04 Stock reports: current stock, batch-wise, valuation, movement history of an item | Feature | Ashok |
| 53 | RPT-05 Expiry report, expired stock, near-expiry by supplier (for returns) | Feature | Ashok |
| 54 | RPT-16 Report framework standard: every report has date range, filters, server pagination, export and permission control | Feature | Ashok |
| 55 | ADM-06 Import centre: all imports as jobs with status, error rows download, re-run | Feature | — |
| 56 | INT-04 Distributor file formats (CSV templates per major distributor) | Feature | Jeeva |
| 57 | Calculation parity CI job: Java and TypeScript must pass every test vector | Readiness | Ashok |
| 58 | Choose the GST e-invoice provider (GSP/IRP) with a cost comparison and sandbox access | Readiness | — |
| 59 | P3 phase gate: Purchase & inventory complete, start P4 | Phase gate | — |

## P4 · Retail POS & returns (31)

| Step | Task | Type | With |
|---|---|---|---|
| 60 | Electron main process: window, preload bridge, printing service, scanner input, auto-update hook (Jeeva packages) | Groundwork | — |
| 61 | Data-source abstraction in web (`online` HTTP / `local` IPC) agreed with Meyyarivu | Groundwork | — |
| 62 | Role-based landing + retail dashboard + widget library (web `dashboard/`) | Groundwork | — |
| 63 | `notification` module: email + in-app, alert rules | Groundwork | — |
| 64 | Admin settings screens: payment, printer, notification settings (web `admin/`) | Groundwork | — |
| 65 | Confirm compliance rule: E-invoice | Confirm rule | — |
| 66 | Confirm compliance rule: E-way bill | Confirm rule | — |
| 67 | Confirm compliance rule: GST returns | Confirm rule | — |
| 68 | DSH-01 Role-based landing: each role opens its own dashboard and menu (see ROLES_AND_DASHBOARDS.md); dashboards are configuration, not code branches | Feature | — |
| 69 | DSH-02 Retail dashboard: counter sales, bills today, collections by mode, returns, top items | Feature | — |
| 70 | DSH-08 Dashboard widget library: today's sales, purchases, gross margin, net sales, invoices, cash collection, credit sales, receivables, payables, low stock, near-expiry, expired, fast-moving, slow-moving, branch performance; each widget permission-aware | Feature | — |
| 71 | RPT-01 Owner dashboard: today's sales, collections, purchases, margin, low stock, near expiry, outstanding | Feature | Ashok |
| 72 | RPT-02 Sales register (day/month, bill-wise, item-wise, customer-wise, doctor-wise, user-wise, branch-wise) | Feature | Ashok |
| 73 | RPT-09 Schedule H1 / narcotic registers | Feature | Ashok |
| 74 | RPT-13 Reports centre: catalogue, favourites, saved filters, recent | Feature | Ashok |
| 75 | RPT-14 Batch-wise sales and traceability: who received batch X (recalls) | Feature | Ashok |
| 76 | ANX-06 POS register (counter/shift-wise), sales & sales-return registers, compliance register | Feature | Ashok |
| 77 | NTF-01 In-app notification centre | Feature | Meyyarivu |
| 78 | NTF-02 Email (invoices, reports, alerts) | Feature | Meyyarivu |
| 79 | NTF-05 Alert rules: low stock, near expiry, credit overdue, licence expiry, device not synced | Feature | Meyyarivu |
| 80 | ADM-02 Payment settings: payment modes, UPI VPA, card terminals, bank accounts | Feature | — |
| 81 | ADM-03 Printer and print-template settings (per branch / counter, web and desktop) | Feature | — |
| 82 | DSK-01 Windows installer (and macOS), auto-update with staged rollout | Feature | Meyyarivu, Jeeva |
| 83 | DSK-03 Thermal/A4 printing without browser dialog, printer profiles per counter | Feature | Meyyarivu, Jeeva |
| 84 | DSK-04 USB/HID barcode scanner support, weighing scale (later) | Feature | Meyyarivu, Jeeva |
| 85 | NAV-02 Global command search (`Ctrl K`): jump to any menu item, item, party or document number | Feature | Meyyarivu |
| 86 | DSH-07 Activity timeline: recent user activity (from audit log) filtered by branch/user/module | Feature | — |
| 87 | RPT-15 Discount report by user, item, reason | Feature | Ashok |
| 88 | ADM-04 Notification settings per user, role and channel | Feature | — |
| 89 | Choose the WhatsApp Business and SMS (DLT) providers | Readiness | — |
| 90 | P4 phase gate: Retail POS & returns complete, start P5 | Phase gate | — |

## P5 · Wholesale, finance, offline (46)

| Step | Task | Type | With |
|---|---|---|---|
| 91 | `modules/sync` (device registration, number-series blocks, push/pull, conflicts) + desktop SQLCipher store and sync engine | Groundwork | — |
| 92 | `payment` module: receipts and payments with allocation; screens (web `payments/`) | Groundwork | — |
| 93 | `accounting` module: chart of accounts, vouchers from events, books, ledgers; screens (web `accounting/`) | Groundwork | — |
| 94 | Financial and wholesale dashboards; customer history (CRM) | Groundwork | — |
| 95 | Pilot go/no-go | Groundwork | — |
| 96 | Confirm compliance rule: DPDP Act 2023 | Confirm rule | — |
| 97 | PLT-04 Financial year management, year-end closing and carry-forward of balances and stock | Feature | — |
| 98 | PLT-11 Session & device management (register/revoke counter PCs) | Feature | — |
| 99 | ACC-01 Customer receipts with allocation to invoices (FIFO or manual), on-account | Feature | — |
| 100 | ACC-02 Supplier payments with allocation, cheque details, PDC tracking | Feature | — |
| 101 | ACC-03 Chart of accounts with default ledgers (sales, purchase, GST input/output, cash, bank, round-off) | Feature | — |
| 102 | ACC-04 Auto-posting of vouchers from documents (event-driven, double-entry) | Feature | — |
| 103 | ACC-05 Expenses entry (rent, salary, electricity) | Feature | — |
| 104 | ACC-06 Cash book, bank book, day book, ledger statements | Feature | — |
| 105 | ACC-09 Outstanding & ageing (receivable/payable), payment reminders | Feature | — |
| 106 | ACX-01 Journal, contra (cash↔bank), receipt and payment vouchers with narration templates | Feature | — |
| 107 | ACX-02 Income & expense vouchers and an income/expense register | Feature | — |
| 108 | ACX-03 Ledger groups (chart of accounts tree), opening balances, set-up ledgers wizard | Feature | — |
| 109 | ACX-11 Onboarding wizard for books: chart of accounts, bank accounts, GST registration, FY | Feature | — |
| 110 | ACX-13 Finance dashboard and general ledger page (drill down from any balance to vouchers to documents) | Feature | — |
| 111 | DSH-03 Wholesale dashboard: orders by status, dispatch, receivables, credit-limit breaches, salesman performance | Feature | — |
| 112 | DSH-05 Financial dashboard: cash, bank, receivables, payables, expenses, GST liability | Feature | — |
| 113 | RPT-06 Profit reports (bill-wise, item-wise, category-wise) on landed cost | Feature | Ashok |
| 114 | RPT-07 Outstanding & ageing reports | Feature | Ashok |
| 115 | ADM-05 Login history and active sessions (with sign-out of other sessions) | Feature | — |
| 116 | INT-01 GST IRP / GSP for e-invoice & e-way bill (verify) provider choice | Feature | Jeeva |
| 117 | DSK-02 Offline SQLite store, sync engine, status bar indicator | Feature | Meyyarivu, Jeeva |
| 118 | DSK-05 Device registration & revoke, local data encryption | Feature | Meyyarivu, Jeeva |
| 119 | PLT-09 Two-factor authentication (TOTP) for admins | Feature | — |
| 120 | PLT-10 Counter PIN login on desktop (fast user switch at the counter) | Feature | — |
| 121 | PLT-19 Approval workflows (discount above limit, credit limit override, stock adjustment, purchase above value) | Feature | — |
| 122 | RPT-11 Export every report to Excel/PDF, schedule by email | Feature | Ashok |
| 123 | ANX-01 Bill-wise profit and rate / quantity difference analysis (purchase vs sale price drift) | Feature | Ashok |
| 124 | ANX-02 ABC ranking of items by value/volume; stock-flow card (opening → in → out → closing) | Feature | Ashok |
| 125 | ANX-07 Sales vs payment and sales vs purchase trend charts | Feature | Ashok |
| 126 | CRM-01 Customer history (customer 360): all bills, returns, prescriptions, doctors, outstanding, refill pattern on one page | Feature | — |
| 127 | NTF-03 WhatsApp Business API: invoice share, payment reminders, refill reminders (verify) template approval & cost | Feature | Meyyarivu |
| 128 | NTF-04 SMS (DLT-registered templates) (verify) | Feature | Meyyarivu |
| 129 | ADM-01 Integrations settings page: GST e-invoice provider, WhatsApp, SMS, email, Tally export, payment links: connect, test, see status and last error | Feature | — |
| 130 | ADM-07 Export centre: job-based exports (reports, masters, full tenant export) | Feature | — |
| 131 | INT-02 WhatsApp Business provider, SMS provider | Feature | Jeeva |
| 132 | DSK-06 Local backup export of offline data (emergency) | Feature | Meyyarivu, Jeeva |
| 133 | External or peer penetration test of auth, tenancy, file upload and sync; fix all High/Critical | Readiness | — |
| 134 | Privacy notice and terms of service reviewed (DPDP Act) | Readiness | — |
| 135 | Production go/no-go review: QA report, security report, restore drill, UAT, all S1/S2 closed | Readiness | — |
| 136 | P5 phase gate: Wholesale, finance, offline complete, start P6 | Phase gate | — |

## P6 · Pilot & GST returns (38)

| Step | Task | Type | With |
|---|---|---|---|
| 137 | Final accounts (trial balance, P&L, balance sheet, cash flow), Tally export | Groundwork | — |
| 138 | Super-admin console, subscriptions, platform billing | Groundwork | — |
| 139 | Pilot support rota, weekly pilot review, prioritise feedback | Groundwork | — |
| 140 | ACX-07 Final accounts: trial balance, trading & P&L, balance sheet, group register, ledger report | Feature | — |
| 141 | ACX-09 GST dashboard: output vs input tax, liability, filing status by period | Feature | — |
| 142 | RPT-08 GST reports (see §12) | Feature | Ashok |
| 143 | PLT-14 Subscription plans, edition gating, usage limits (users, branches, invoices/month), trial | Feature | — |
| 144 | PLT-15 Platform super-admin console (tenants, plans, health, support impersonation with consent) | Feature | — |
| 145 | PLT-17 Data export (full tenant export for portability) | Feature | — |
| 146 | ACC-07 Bank reconciliation (statement import) | Feature | — |
| 147 | ACC-08 Trial balance, P&L, balance sheet | Feature | — |
| 148 | ACC-10 Tally export (XML vouchers + masters) | Feature | — |
| 149 | ACX-04 Fixed assets: asset master, purchase voucher, depreciation schedule (SLM/WDV) (verify) rates | Feature | — |
| 150 | ACX-06 TDS / TCS section and rate masters, deduction on payments/receipts (verify) | Feature | — |
| 151 | ACX-08 Bank dashboard: balances, unreconciled entries, cheque status | Feature | — |
| 152 | ACX-12 Cash-flow statement | Feature | — |
| 153 | DSH-06 Branch dashboard: branch-to-branch comparison of sales, margin, stock, expiry | Feature | — |
| 154 | DSH-09 Super-admin platform analytics: tenants, plans, usage, health, revenue | Feature | — |
| 155 | RPT-10 Branch comparison | Feature | Ashok |
| 156 | ANX-03 Customer, product and vendor performance reports (top, declining, dormant) | Feature | Ashok |
| 157 | CRM-02 Complaints: log customer/retailer complaints (wrong item, short supply, damaged, billing error) with status, owner, due date, resolution and link to the bill/return | Feature | — |
| 158 | ENG-01 WhatsApp connection settings, broadcast campaigns (offers, refill reminders) with delivery reports (verify) opt-in | Feature | — |
| 159 | ADM-08 Backup status and tenant data download | Feature | — |
| 160 | ADM-09 Data retention policies per record type (verify) | Feature | — |
| 161 | ADM-10 Platform billing: MENO's invoices to the tenant, payment history | Feature | — |
| 162 | ADM-11 Help centre and support tickets to the MENO team | Feature | — |
| 163 | INT-03 Tally export | Feature | Jeeva |
| 164 | ACX-05 Loans and liabilities: loan voucher, EMI schedule, interest booking | Feature | — |
| 165 | ANX-05 Smart insights card on dashboard (plain-language highlights: "Sales of X down 30 % vs last month") | Feature | Ashok |
| 166 | CRM-03 CRM dashboard: active customers, refills due, complaints, loyalty | Feature | — |
| 167 | CRM-04 Loyalty transactions: points earned / redeemed ledger | Feature | — |
| 168 | CRM-06 Follow-up reminders for staff (call customer, collect payment) | Feature | — |
| 169 | Onboard pilot pharmacy 1 (retail): data migration, training, first live bill | Readiness | — |
| 170 | Onboard pilot pharmacy 2 (retail) | Readiness | — |
| 171 | Onboard pilot distributor (wholesale) with e-invoice live | Readiness | — |
| 172 | Support rota and incident process during the pilot (response times agreed) | Readiness | — |
| 173 | Four weeks of pilot with zero data-integrity incidents: declare MENO production-ready (v1.1) | Readiness | — |
| 174 | P6 phase gate: Pilot & GST returns complete, start P7 | Phase gate | — |

## P7 · Growth (22)

| Step | Task | Type | With |
|---|---|---|---|
| 175 | Field-sales and mobile owner app requirements (Prakalya reviews) | Groundwork | — |
| 176 | Mobile architecture ADR (Expo, shared packages), fieldsales module design | Groundwork | — |
| 177 | MOB-01 Owner app: dashboard, approvals, alerts | Feature | Meyyarivu |
| 178 | MOB-02 Salesman app: routes/beats, retailer visit, take order offline, schemes, credit status | Feature | Meyyarivu |
| 179 | MOB-03 Collection app: record payments against invoices, receipt share | Feature | Meyyarivu |
| 180 | PLT-18 Multi-language UI (English first; Tamil, Hindi later) | Feature | — |
| 181 | ACC-11 Payment gateway / UPI collect links for wholesale dues | Feature | — |
| 182 | ACX-10 Income-tax overview for the owner (turnover, profit, advance-tax reminders) (verify) | Feature | — |
| 183 | RPT-12 Sales forecasting & smart reorder (ML) | Feature | Ashok |
| 184 | ANX-04 Customer & product intelligence: purchase frequency, refill prediction, churn risk | Feature | Ashok |
| 185 | CRM-05 Offers and coupons | Feature | — |
| 186 | CRM-07 Support tickets for customer issues beyond complaints | Feature | — |
| 187 | ENG-02 Customer feedback after purchase (link in WhatsApp invoice) | Feature | — |
| 188 | ADM-12 API keys and webhooks management (with INT-05) | Feature | — |
| 189 | INT-05 Public API + webhooks for partners | Feature | Jeeva |
| 190 | INT-06 Online pharmacy / e-commerce order intake | Feature | Jeeva |
| 191 | MOB-04 Delivery app: delivery proof (photo/signature), returns pickup | Feature | Meyyarivu |
| 192 | MOB-05 Camera barcode scan for stock count | Feature | Meyyarivu |
| 193 | Mobile app ADR (Expo, shared packages) and field-sales module design | Readiness | — |
| 194 | Pricing and plans for public launch; subscription billing live | Readiness | — |
| 195 | Public launch checklist: marketing site, support channel, status page | Readiness | — |
| 196 | P7 phase gate: Growth complete | Phase gate | — |
