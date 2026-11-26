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
- Not yet (#7): `TenantContext`, filter, Hibernate filter, RLS policies + `SET LOCAL`, cross-tenant test base.

## Error codes
TENANCY_BRANCH_NOT_ALLOWED, TENANCY_FY_CLOSED, TENANCY_EDITION_REQUIRED

## Module rules
1. Number series allocation locks the series row (SELECT … FOR UPDATE) inside the document transaction.
2. Device number-series blocks are allocated here for sync.
3. GSTIN first two digits must match company state code.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
