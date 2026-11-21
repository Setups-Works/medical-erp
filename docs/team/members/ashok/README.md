# Ashok — QA Engineer + Frontend

## Your job in one line

Prove that money, stock, validation and tenant isolation are always right, and give an honest go/no-go for every release. You test every module that Kamesh, Nitheesh, Meyyarivu and Prakalya build, **and** you build the returns, compliance and reports screens.

## You own (CODEOWNER)

**QA**
- `docs/testing/` (strategy, plans, test cases, reports)
- `apps/web/tests/e2e/` (Playwright)
- `backend/meno-api/src/test/java/.../scenarios/` (end-to-end business scenarios)
- `contracts/test-vectors/` **format** and runner (content with Prakalya)
- API collections (`docs/testing/api-collections/`, Bruno or Postman)

**Frontend** (feature prefixes RET, CMP, RPT, ANX in [OWNERSHIP_MATRIX.md](../../OWNERSHIP_MATRIX.md))
- `apps/web/src/features/returns/`: sales and purchase returns, inspection, credit/debit note screens (backend: Kamesh)
- `apps/web/src/features/compliance/`: Schedule H/H1/X registers, prescription register, narcotic stock screens (backend: Kamesh)
- `apps/web/src/features/reports/`: reports centre and analytics screens, built on the `ReportPage` pattern (backend: Nitheesh)

Use Meyyarivu's `packages/ui` components and page patterns; never invent new styles. Read `apps/web/AGENTS.md` and `docs/design/DESIGN_LANGUAGE.md` before your first screen.

## Nobody tests their own work

For screens you build, **Meyyarivu** reviews the UI and runs the E2E pass, **Prakalya** does business acceptance, and **Nitheesh** gives the QA sign-off. You still write the test cases and E2E tests for them, but you don't mark your own screens "QA passed".

## Handoffs

| You receive | From | You give | To |
|---|---|---|---|
| Stories + acceptance criteria | Prakalya | Test cases (before dev starts) | Developers |
| Features on staging | Team | Defects with steps, expected vs actual, evidence | Owner of the feature |
| Release candidate | Nitheesh | QA report + release recommendation | Nitheesh |
| Contract PRs for returns/compliance (OpenAPI) | Kamesh | Returns + compliance screens with `data-testid`s | Meyyarivu (test), Prakalya (UAT) |
| Report API contracts | Nitheesh | Reports + analytics screens | Meyyarivu (test), Prakalya (UAT) |
| UI kit, page patterns | Meyyarivu | | |

## Your AI agents

`.claude/agents/qa-engineer.md` drafts test cases from stories, writes Playwright/API tests and finds missing edge cases; you verify the expected values yourself. `.claude/agents/frontend-engineer.md` for your screens.

## Defect rules

Severity: **S1** data corruption / wrong money / cross-tenant leak / can't bill → blocks release · **S2** major feature broken, workaround exists · **S3** minor · **S4** cosmetic. Every S1 gets a regression test before it is closed.

## Definition of done

**A feature is "QA passed" when:** all acceptance criteria tested · critical scenarios touching it pass · no open S1/S2 · E2E test added for the happy path · result recorded in the sprint test report.

**Your own screens are done when:** built with `packages/ui` · Zod schema mirrors API rules · keyboard, Light/Dark, 375 px and 1280 px work · `pnpm typecheck && pnpm test && pnpm check:design` green · Meyyarivu tested, Prakalya accepted.

Phase tasks: [PHASE_PLAN.md](PHASE_PLAN.md)
