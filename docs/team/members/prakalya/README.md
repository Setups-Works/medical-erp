# Prakalya — Business Analyst + Frontend Developer

## Your job in one line

Turn how real pharmacies work into precise, testable requirements — and build the back-office screens (masters, settings, reports, compliance, accounting) that you specified.

You have two hats. Because you write the stories, the screens you build will match the business exactly. Rule of thumb: **BA work first in a sprint** (stories must be ready before others start), frontend work after.

## You own (CODEOWNER)

Full split: [OWNERSHIP_MATRIX.md](../../OWNERSHIP_MATRIX.md).

**Business analysis (your main job)**
- `docs/product/` (FEATURES, PAGES, ROLES_AND_DASHBOARDS, GLOSSARY, VISION, COVERAGE)
- `docs/business-requirements/` (BRD, FRS, user stories), `docs/workflows/`, `docs/compliance/`
- The **values** in `contracts/test-vectors/` (Ashok owns the format)
- Backlog grooming in MENO Hub: every task has a story and acceptance criteria before its sprint

**Frontend (parties only; 40 tasks in total)**
- Features with prefix PTY: suppliers, customers, doctors, customer groups, statements, supplier price list
- `apps/web/src/features/parties/` and its routes

Compliance rules: you research and draft them; Nitheesh confirms them with qualified professionals.

You use `packages/ui`, the app shell and Meyyarivu's ListPage / FormPage patterns. Need a shared component? Open a Hub task for Meyyarivu.

## Handoffs

| You receive | From | You give | To |
|---|---|---|---|
| Real workflows, pain points | Pharmacies, pilot customers | BRD/FRS, user stories (Given/When/Then) | Everyone |
| Questions on rules | Engineers (issue comments) | Answers within 1 working day, recorded in the doc | Engineers |
| Contract PRs (OpenAPI) for your screens | Kamesh | Back-office screens + `data-testid`s | Ashok, Nitheesh |
| Shared components, patterns | Meyyarivu | Business acceptance (UAT) sign-off | Nitheesh |
| | | Expected values for GST/pricing vectors | Ashok, Kamesh |

> **Conflict of interest guard:** you don't sign off UAT on screens you built yourself alone — Ashok tests them and Nitheesh accepts them.

## Your AI agents

- `.claude/agents/business-analyst.md` — drafts stories, checks FEATURES coverage, draws workflow diagrams. It must never invent tax/legal rules; you verify every one.
- `.claude/agents/frontend-engineer.md` — builds screens. Give it the story, the reference screen from `docs/design/DESIGN_LANGUAGE.md`, and the generated API types.

## Screen recipe (same as the whole frontend team)

Route (thin) → `features/<area>/queries.ts` (TanStack Query) → form with RHF + Zod from `packages/validation` → components from `packages/ui` only, tokens only → `data-testid`s → check Light/Dark at 1280 px and 375 px → `pnpm typecheck && pnpm test && pnpm check:design`.

## Definition of done

- **Stories:** acceptance criteria an engineer can test without asking you; ⚠ rules confirmed with a pharmacist/CA and the source noted.
- **Screens:** checks green, design checklist passed, reviewed by Meyyarivu (UI) and Nitheesh.

Phase tasks: [PHASE_PLAN.md](PHASE_PLAN.md)
