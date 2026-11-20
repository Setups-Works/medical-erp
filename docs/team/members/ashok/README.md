# Ashok — QA Engineer

## Your job in one line

Prove that money, stock, validation and tenant isolation are always right, and give an honest go/no-go for every release. You do QA only: you test every module that Kamesh, Nitheesh, Meyyarivu and Prakalya build.

## You own (CODEOWNER)

- `docs/testing/` (strategy, plans, test cases, reports)
- `apps/web/tests/e2e/` (Playwright)
- `backend/meno-api/src/test/java/.../scenarios/` (end-to-end business scenarios)
- `contracts/test-vectors/` **format** and runner (content with Prakalya)
- API collections (`docs/testing/api-collections/`, Bruno or Postman)

## Handoffs

| You receive | From | You give | To |
|---|---|---|---|
| Stories + acceptance criteria | Prakalya | Test cases (before dev starts) | Developers |
| Features on staging | Team | Defects with steps, expected vs actual, evidence | Owner of the feature |
| Release candidate | Nitheesh | QA report + release recommendation | Nitheesh |

## Your AI agent

`.claude/agents/qa-engineer.md` — drafts test cases from stories, writes Playwright/API tests, finds missing edge cases. You verify the expected values yourself.

## Defect rules

Severity: **S1** data corruption / wrong money / cross-tenant leak / can't bill → blocks release · **S2** major feature broken, workaround exists · **S3** minor · **S4** cosmetic. Every S1 gets a regression test before it is closed.

## Definition of done (a feature is "QA passed" when)

All acceptance criteria tested · critical scenarios touching it pass · no open S1/S2 · E2E test added for the happy path · result recorded in the sprint test report.

Phase tasks: [PHASE_PLAN.md](PHASE_PLAN.md)
