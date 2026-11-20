# Nitheesh — phase plan

Manager + full-stack. Feature tasks (story → API → screen) for PLT, ADM, ACC, ACX, DSH, RPT, ANX, CRM, ENG come from FEATURES.md in MENO Hub; this list is the platform and leadership work around them.

## P0 Foundation
- [x] Monorepo folder structure, AGENTS.md files, architecture docs, ADRs
- [ ] Review BRD for P1–P3 with Prakalya
- [ ] Review ER diagram with Kamesh; review wireframes with Meyyarivu
- [ ] Run architecture review meeting (day 13); approve Sprint 1 backlog

## P1 Platform core
- [ ] Backend skeleton: Maven project, Spring Modulith, `ArchitectureTest`, `common/error` (Problem Details), `common/web` (page envelope), `common/money`, `common/validation`
- [ ] `security/`: JWT issue/verify, refresh rotation, cookie handling, `PermissionChecker`
- [ ] `tenancy/`: `TenantContextFilter`, Hibernate filter, RLS `SET LOCAL` interceptor, `CrossTenantAccessTest` base
- [ ] `identity` + `audit` modules (users, roles, permissions, audit log)
- [ ] Configuration framework: `tenant_setting`, lookup tables and the `SettingsFacade` (nothing hard-coded, see VALIDATION_AND_BUSINESS_RULES.md)
- [ ] OpenAPI export → `contracts/openapi/meno-api.yaml` → `packages/api-client` generation script
- [ ] Users & roles screens and role permission editor (web `users/`)

## P2 Masters
- [ ] `files` module (signed URLs, MinIO/Azure Blob adapter)
- [ ] Company, branch and settings screens (web `company/`, `branches/`, `settings/`)
- [ ] Number series + tenant settings endpoints and screens

## P3 Purchase & inventory
- [ ] `packages/billing-engine` (decimal.js) passing all test vectors, with Kamesh's Java engines
- [ ] `reporting` module: report framework (filters, pagination, export, permissions), stock/expiry/purchase report views
- [ ] Reports centre + inventory dashboard screens (web `reports/`, `dashboard/`)

## P4 Retail POS & returns
- [ ] Electron main process: window, preload bridge, printing service, scanner input, auto-update hook (Jeeva packages)
- [ ] Data-source abstraction in web (`online` HTTP / `local` IPC) agreed with Meyyarivu
- [ ] Role-based landing + retail dashboard + widget library (web `dashboard/`)
- [ ] `notification` module: email + in-app, alert rules
- [ ] Admin settings screens: payment, printer, notification settings (web `admin/`)

## P5 Wholesale, finance, offline
- [ ] `modules/sync` (device registration, number-series blocks, push/pull, conflicts) + desktop SQLCipher store and sync engine
- [ ] `payment` module: receipts and payments with allocation; screens (web `payments/`)
- [ ] `accounting` module: chart of accounts, vouchers from events, books, ledgers; screens (web `accounting/`)
- [ ] Financial and wholesale dashboards; customer history (CRM)
- [ ] Pilot go/no-go

## P6 Pilot
- [ ] Final accounts (trial balance, P&L, balance sheet, cash flow), Tally export
- [ ] Super-admin console, subscriptions, platform billing
- [ ] Pilot support rota, weekly pilot review, prioritise feedback

## P7 Growth
- [ ] Mobile architecture ADR (Expo, shared packages), fieldsales module design
