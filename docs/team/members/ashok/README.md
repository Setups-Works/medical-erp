# Ashok — QA Lead + Frontend

## Your job in one line

Prove that money, stock, validation and tenant isolation are always right, and give an honest go/no-go for every release. You are the **QA lead**: you own the test strategy, the 15 critical scenarios, the release QA report, and QA for the core modules (pricing, purchase, inventory, POS, wholesale, GST, payments, accounting, platform, auth, desktop, integrations). Meyyarivu, Prakalya and Nitheesh also run QA for the areas they didn't build; you review their test cases and keep one standard.

## You own (CODEOWNER)

- `docs/testing/` (strategy, plans, test cases, reports)
- `apps/web/tests/e2e/` (Playwright)
- `backend/meno-api/src/test/java/.../scenarios/` (end-to-end business scenarios)
- `contracts/test-vectors/` **format** and runner (content with Prakalya)
- API collections (`docs/testing/api-collections/`, Bruno or Postman)

**Frontend** (prefixes CAT, PTY, RET, CMP in [OWNERSHIP_MATRIX.md](../../OWNERSHIP_MATRIX.md))
- `apps/web/src/features/catalog/`: medicine master, generics/salts, brands, manufacturers, units, barcodes, export/history (backend: Kamesh)
- `apps/web/src/features/parties/`: suppliers, customers, doctors, customer groups, statements, supplier price lists (backend: Kamesh)
- `apps/web/src/features/returns/`: sales and purchase returns, inspection, credit/debit notes (backend: Kamesh)
- `apps/web/src/features/compliance/`: Schedule H/H1/X registers, prescription register, narcotic stock (backend: Kamesh)

Use Meyyarivu's `packages/ui` components and page patterns; read `apps/web/AGENTS.md` and `docs/design/DESIGN_LANGUAGE.md` before your first screen. **You don't QA your own screens:** Prakalya runs QA for CAT, PTY, RET and CMP. The reports centre and analytics (RPT, ANX) moved to Gokul on 25-11-2026, so you now QA Gokul's pricing, GST and delivery screens (PRC, GST, DLV).

## Handoffs

| You receive | From | You give | To |
|---|---|---|---|
| Stories + acceptance criteria | Prakalya | Test cases (before dev starts) | Developers |
| Features on staging | Team | Defects with steps, expected vs actual, evidence | Owner of the feature |
| Release candidate | Nitheesh | QA report + release recommendation | Nitheesh |
| Contract PRs (OpenAPI) for masters, parties, returns, compliance | Kamesh | Your screens with `data-testid`s | Prakalya / Meyyarivu (QA), Prakalya (UAT) |

## Your AI agent

`.claude/agents/qa-engineer.md` — drafts test cases from stories, writes Playwright/API tests, finds missing edge cases. You verify the expected values yourself.

## Defect rules

Severity: **S1** data corruption / wrong money / cross-tenant leak / can't bill → blocks release · **S2** major feature broken, workaround exists · **S3** minor · **S4** cosmetic. Every S1 gets a regression test before it is closed.

## Definition of done (a feature is "QA passed" when)

All acceptance criteria tested · critical scenarios touching it pass · no open S1/S2 · E2E test added for the happy path · result recorded in the sprint test report.

Phase tasks: [PHASE_PLAN.md](PHASE_PLAN.md)
