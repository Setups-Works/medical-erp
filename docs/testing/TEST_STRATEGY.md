# Test strategy

Owner: Ashok. Principle: **the riskier the code (money, stock, tenancy, sync), the more layers test it.**

## Test pyramid

| Level | Tool | Where | Who writes | Runs |
|---|---|---|---|---|
| Unit (domain, calculators, utils) | JUnit 5 + AssertJ; Vitest | `src/test/.../modules/<m>`; `apps/web/tests/unit`, `packages/*/tests` | Developers | Every push |
| Calculation parity | JUnit + Vitest over `contracts/test-vectors/**` | both | Ashok (runner), Prakalya (values) | Every push |
| Integration (API + DB) | Spring Boot Test + Testcontainers (PostgreSQL, Redis) + MockMvc | backend | Developers | Every PR |
| Architecture | Spring Modulith `ApplicationModules.verify()`, ArchUnit | `test/.../architecture` | Nitheesh | Every PR |
| Business scenarios | JUnit scenario tests (multi-module flows) | `test/.../scenarios` | Ashok + Kamesh | Every PR |
| API (black box) | Bruno/Postman collections | `docs/testing/api-collections` | Ashok | Nightly on staging |
| E2E UI | Playwright | `apps/web/tests/e2e` | Ashok (+ devs for happy paths) | PR (smoke) + nightly (full) |
| Performance | k6 | `docs/testing/performance` | Ashok + Jeeva | Each phase gate |
| Security | OWASP ZAP, permission matrix, cross-tenant suite | CI + staging | Ashok | Each phase gate |
| Recovery | Restore drill | staging | Jeeva + Ashok | Monthly |
| UAT | Manual scripts | `docs/business-requirements/uat` | Prakalya | Phase gate |

Coverage gates: backend `service/` + `domain/` ≥ 80 % lines; `billing-engine` ≥ 95 %; frontend logic utils ≥ 70 %.

## Critical scenarios (must be automated before pilot)

| # | Scenario | Level |
|---|---|---|
| 1 | Purchase invoice (incl. free qty, discounts) creates correct batch stock and landed cost | scenario |
| 2 | Sales invoice reduces the right batch (FEFO) | scenario + E2E |
| 3 | Expired batch cannot be sold (online and offline) | scenario + E2E |
| 4 | Sales return restores stock only if saleable; credit note correct | scenario |
| 5 | Purchase return updates stock and supplier balance | scenario |
| 6 | 20 concurrent bills on the last 10 units → no oversell | integration (parallel) |
| 7 | GST correct: intra/inter-state, MRP-inclusive, rounding — all vectors pass | parity |
| 8 | Customer outstanding = invoices − receipts − credit notes | scenario |
| 9 | User of tenant A gets 404 for every tenant B resource | cross-tenant suite |
| 10 | Branch transfer: out = in, in-transit visible, reconciles | scenario |
| 11 | Same `Idempotency-Key` twice → one invoice, same response | integration |
| 12 | Desktop offline 3 days, 500 bills, reconnect → all synced once, conflicts flagged | E2E desktop + scenario |
| 13 | H1 sale without Rx is blocked; register entry created with Rx | scenario + E2E |
| 14 | Posted invoice cannot be edited; reversal creates opposite movements and vouchers | scenario |
| 15 | Vouchers always balance; trial balance totals equal | scenario |

## Test data

Seeded, synthetic only (`backend/.../db/seed`, `scripts/seed`). Fixed clock in tests (`Clock` bean). No real patient/customer data ever.

## Defects

Template in [test-cases/](test-cases/). Severity S1–S4 as in Ashok's README. S1 → stop-the-line: fix before other work, regression test mandatory.

## Release recommendation

Per release Ashok publishes `docs/testing/reports/<version>.md`: scope, results by level, open defects, risks, **GO / NO-GO**.
