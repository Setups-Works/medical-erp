# Ashok — phase plan

Legend: **[FE]** frontend; everything else is QA.

QA + frontend. MENO Hub also gives you one **QA task per module per phase** (e.g. "QA: Purchase · P3") listing every feature to test, plus the 15 critical scenarios, and the feature tasks for RET, CMP, RPT and ANX screens (from FEATURES.md).

## P0 Foundation
- [ ] Review `docs/testing/TEST_STRATEGY.md`; adapt to our tools
- [ ] Test-case template, defect template, sprint test report template
- [ ] 40 test vectors JSON with Prakalya (GST, MRP-inclusive, discounts, free qty, rounding)
- [ ] Learn: Playwright, REST testing (Bruno/Postman), JUnit basics, SQL for verification
- [ ] [FE] Learn the frontend stack (Next.js, TanStack Query, RHF + Zod, shadcn/ui); pair sessions with Meyyarivu

## P1 Platform core
- [ ] Playwright setup in `apps/web/tests/e2e`, CI job with Jeeva
- [ ] Auth, roles, tenant isolation test cases; API collection v1
- [ ] Test vector runner contract (JSON schema) for Java + TS
- [ ] [FE] First screen with Meyyarivu's page patterns: report filter bar + ReportPage skeleton (web `reports/`)

## P2 Masters
- [ ] Masters test cases + E2E for item/party CRUD
- [ ] Validation test suite from VALIDATION_AND_BUSINESS_RULES.md (every rule: valid, invalid, boundary), audit log checks

## P3 Purchase & inventory
- [ ] Critical scenarios 1, 2, 3, 5 automated (backend scenario tests)
- [ ] Stock reconciliation verification queries
- [ ] CSV import negative tests (bad rows, duplicates, unknown items)
- [ ] [FE] Reports centre screens: stock, batch, expiry, purchase reports with export (web `reports/`)

## P4 Retail POS & returns
- [ ] Scenario 6 (concurrent billing, no oversell) — parallel API test
- [ ] Scenario 11 (duplicate requests → one invoice)
- [ ] POS E2E: keyboard-only billing, H1 capture, returns, printing
- [ ] Performance baseline (k6): item search, invoice post
- [ ] [FE] Returns screens: sales return, purchase return, inspection, credit/debit notes (web `returns/`)
- [ ] [FE] Compliance screens: Schedule H/H1/X registers, prescription register, narcotic stock (web `compliance/`)
- [ ] [FE] Sales and daily-business reports (web `reports/`)

## P5 Wholesale, finance, offline
- [ ] Scenario 12 offline sync: 3-day offline, conflicts, duplicates
- [ ] Credit limit, outstanding, ageing, ledger balance tests
- [ ] Security: OWASP ZAP baseline, cross-tenant fuzzing, permission matrix tests
- [ ] Full regression suite in CI; restore drill verification with Jeeva
- [ ] [FE] Outstanding, ageing, GST and wholesale reports; analytics screens (web `reports/`)

## P6 Pilot
- [ ] GSTR export validation, pilot defect triage, release reports
- [ ] [FE] UX fixes from pilot on returns, compliance and reports screens

## P7 Growth
- [ ] Mobile test strategy
