# Ashok — phase plan

QA only. MENO Hub also gives you one **QA task per module per phase** (e.g. "QA: Purchase · P3") listing every feature to test, plus the 15 critical scenarios.

## P0 Foundation
- [ ] Review `docs/testing/TEST_STRATEGY.md`; adapt to our tools
- [ ] Test-case template, defect template, sprint test report template
- [ ] 40 test vectors JSON with Prakalya (GST, MRP-inclusive, discounts, free qty, rounding)
- [ ] Learn: Playwright, REST testing (Bruno/Postman), JUnit basics, SQL for verification

## P1 Platform core
- [ ] Playwright setup in `apps/web/tests/e2e`, CI job with Jeeva
- [ ] Auth, roles, tenant isolation test cases; API collection v1
- [ ] Test vector runner contract (JSON schema) for Java + TS

## P2 Masters
- [ ] Masters test cases + E2E for item/party CRUD
- [ ] Validation test suite from VALIDATION_AND_BUSINESS_RULES.md (every rule: valid, invalid, boundary), audit log checks

## P3 Purchase & inventory
- [ ] Critical scenarios 1, 2, 3, 5 automated (backend scenario tests)
- [ ] Stock reconciliation verification queries
- [ ] CSV import negative tests (bad rows, duplicates, unknown items)

## P4 Retail POS & returns
- [ ] Scenario 6 (concurrent billing, no oversell) — parallel API test
- [ ] Scenario 11 (duplicate requests → one invoice)
- [ ] POS E2E: keyboard-only billing, H1 capture, returns, printing
- [ ] Performance baseline (k6): item search, invoice post

## P5 Wholesale, finance, offline
- [ ] Scenario 12 offline sync: 3-day offline, conflicts, duplicates
- [ ] Credit limit, outstanding, ageing, ledger balance tests
- [ ] Security: OWASP ZAP baseline, cross-tenant fuzzing, permission matrix tests
- [ ] Full regression suite in CI; restore drill verification with Jeeva

## P6 Pilot
- [ ] GSTR export validation, pilot defect triage, release reports

## P7 Growth
- [ ] Mobile test strategy
