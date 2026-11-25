# Ashok — phase plan

QA lead + frontend. Legend: **[FE]** frontend; everything else is QA. Do tasks in the **Step** order shown in MENO Hub and in [TASK_ORDER.md](TASK_ORDER.md). MENO Hub also gives you one **QA task per module per phase** for your areas (see the QA column in OWNERSHIP_MATRIX.md) (e.g. "QA: Purchase · P3") listing every feature to test, plus the 15 critical scenarios.

## P0 Foundation
- [x] Review `docs/testing/TEST_STRATEGY.md`; adapt to our tools
- [x] Test-case template, defect template, sprint test report template
- [x] 40 test vectors JSON with Prakalya (GST, MRP-inclusive, discounts, free qty, rounding)
- [x] Learn: Playwright, REST testing (Bruno/Postman), JUnit basics, SQL for verification
- [x] [FE] Learn the frontend stack (Next.js, TanStack Query, RHF + Zod, shadcn/ui); pair sessions with Meyyarivu

## P1 Platform core
- [ ] Playwright setup in `apps/web/tests/e2e`, CI job with Jeeva
- [ ] Auth, roles, tenant isolation test cases; API collection v1
- [ ] Test vector runner contract (JSON schema) for Java + TS
- [ ] Review the 20 draft vectors in `contracts/test-vectors/` with Prakalya: recompute by hand, mark confirmed or fix; the P0 "40 vectors" item was ticked but no files existed until 24-11-2026
- [ ] Test vectors for CALCULATIONS.md §7–§22 with Prakalya: combined distributor bill with returns and charges, loose sale, bill-discount allocation, landed cost and suggested PTR, margin/mark-up, weighted-average valuation, returns, payment allocation, credit check, ageing and interest, reorder, expiry buckets (`contracts/test-vectors/`)
- [ ] [FE] First screen on Meyyarivu's patterns: medicine list on ListPage with MSW mocks (web `catalog/`); the reports skeleton moved to Gokul

## P2 Masters
- [ ] [FE] Medicine master screens: list, add/edit, details, generic/salt, brand, manufacturer, units + conversion, barcodes (web `catalog/`)
- [ ] [FE] Suppliers, customers, doctors: list, add/edit, details (web `parties/`)
- [ ] Masters test cases + E2E for item/party CRUD (screens you didn't build: Prakalya runs QA on yours)
- [ ] Validation test suite from VALIDATION_AND_BUSINESS_RULES.md (every rule: valid, invalid, boundary), audit log checks
- [ ] Master form test cases from MASTER_FIELDS.md: every tab, conditional fields (retailer vs person, MSME, TDS, bank on/off), PIN/IFSC/GSTIN auto-fill, red-dot tab errors

## P3 Purchase & inventory
- [ ] Critical scenarios 1, 2, 3, 5 automated (backend scenario tests)
- [ ] Stock reconciliation verification queries
- [ ] CSV import negative tests (bad rows, duplicates, unknown items)
- [ ] [FE] Medicine export, medicine history and supplier price list screens

## P4 Retail POS & returns
- [ ] Scenario 6 (concurrent billing, no oversell) — parallel API test
- [ ] Scenario 11 (duplicate requests → one invoice)
- [ ] POS E2E: keyboard-only billing, H1 capture, returns, printing
- [ ] Performance baseline (k6): item search, invoice post
- [ ] [FE] Returns screens: sales/purchase return, inspection, credit/debit notes (web `returns/`)
- [ ] [FE] Compliance screens: Schedule H/H1/X registers, prescription register, narcotic stock (web `compliance/`)

## P5 Wholesale, finance, offline
- [ ] Scenario 12 offline sync: 3-day offline, conflicts, duplicates
- [ ] Credit limit, outstanding, ageing, ledger balance tests
- [ ] Security: OWASP ZAP baseline, cross-tenant fuzzing, permission matrix tests
- [ ] Full regression suite in CI; restore drill verification with Jeeva
- [ ] [FE] Customer groups and account statements screens (web `parties/`)

## P6 Pilot
- [ ] GSTR export validation, pilot defect triage, release reports

## P7 Growth
- [ ] Mobile test strategy
