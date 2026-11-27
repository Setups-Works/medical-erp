# Module `tenancy` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P1–P2 · **Features:** PLT-01…05, PLT-13

## Purpose
Tenant, company, branch, financial year, number series, tenant settings, edition guard.

## Owns tables
tenant, company, branch, financial_year, number_series, tenant_setting

## Public API (`tenancy.api`)
TenantContext, BranchFacade, NumberSeriesFacade.next(docType), SettingsFacade, EditionGuard

## Events published
BranchCreated, FinancialYearClosed

## Allowed dependencies
—

## Built so far (P1, 26-11-2026)
- `tenant` (V202611261700). `TenantFacade` (api): `isActive`, `createTenant`.
- `state` lookup (GST state codes, seeded, effective-dated) and sign-up columns on `tenant` (V202611262000). `TenantFacade`: `createTenant(NewTenant)`, `findBySignupKey`, `activeStates`, `isActiveState`.
- Tenant isolation (#7): `security/TenantContext` (+ `TenantContextFilter` from the token's `tid`), `TenantAwareDataSource` sets `app.tenant_id` / `app.rls_bypass` per connection, RLS policies on every tenant table (V202611262100), app connects as non-owner `meno_app`; `CrossTenantSupport` test helper + `RowLevelSecurityTest`. Not built: Hibernate filter (repositories name the tenant explicitly instead).
- Onboarding (V202611262300): `OnboardingService` + `/api/v1/onboarding/*` — checklist/resume, options, business, company & GST, licences, branches, books, configuration, skip, go-live readiness + go-live. `GoLiveCheck` SPI in `tenancy.api` (identity contributes OWNER_EMAIL_VERIFIED); `TenantWentLive` event. Permissions `tenancy.onboarding.view|manage`. Not yet: GSTIN fetch on the company step (call `/api/v1/gstin-verifications`), logo / scans (files), data / devices / plan / practice steps.
- Team step (27-11-2026): `onboarding_step` TEAM available (V202611271201); data lives in identity (invitations). `tenancy.api.BranchDirectory` (branch list for other modules) and `tenancy.api.OnboardingSteps.markDone` (implemented by `OnboardingService`; no-op once live) let identity mark the step without tenancy depending on it. `TenantFacade.displayName`.

## Error codes
TENANCY_STATE_UNKNOWN (400), TENANCY_OPTION_INVALID (400), TENANCY_GSTIN_REQUIRED / TENANCY_GSTIN_NOT_ALLOWED / TENANCY_GSTIN_INVALID / TENANCY_GSTIN_STATE_MISMATCH / TENANCY_PAN_GSTIN_MISMATCH (400), TENANCY_LICENCE_REQUIRED / TENANCY_LICENCE_EXPIRY_REQUIRED / TENANCY_LICENCE_EXPIRED / TENANCY_FSSAI_INVALID (400), TENANCY_BRANCH_STATE_MISMATCH (400), TENANCY_BRANCH_CODE_TAKEN (409), TENANCY_BRANCH_NOT_FOUND (404), TENANCY_FY_START_INVALID / TENANCY_BOOKS_START_OUTSIDE_FY (400), TENANCY_SETTING_UNKNOWN / TENANCY_SETTING_INVALID (400), TENANCY_STEP_UNKNOWN (404), TENANCY_STEP_REQUIRED / TENANCY_STEP_ORDER / TENANCY_ALREADY_LIVE / TENANCY_NOT_READY (409), TENANCY_GO_LIVE_DATE_INVALID (400), TENANCY_BRANCH_NOT_ALLOWED, TENANCY_FY_CLOSED, TENANCY_EDITION_REQUIRED

## Module rules
1. Number series allocation locks the series row (SELECT … FOR UPDATE) inside the document transaction.
2. Device number-series blocks are allocated here for sync.
3. GSTIN first two digits must match company state code.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
