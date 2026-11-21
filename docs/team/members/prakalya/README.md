# Prakalya — Business Analyst + QA (part-time)

## Your job in one line

Turn how real pharmacies work into precise, testable requirements, then test the screens built from them. You build no screens: Meyyarivu, Nitheesh and Ashok take all the frontend.

Rule of thumb: **BA work first in a sprint** (stories must be ready before others start), QA after.

## You own (CODEOWNER)

Full split: [OWNERSHIP_MATRIX.md](../../OWNERSHIP_MATRIX.md).

**Business analysis (your main job)**
- `docs/product/` (FEATURES, PAGES, ROLES_AND_DASHBOARDS, GLOSSARY, VISION, COVERAGE)
- `docs/business-requirements/` (BRD, FRS, user stories), `docs/workflows/`, `docs/compliance/`
- The **values** in `contracts/test-vectors/` (Ashok owns the format)
- Backlog grooming in MENO Hub: every task has a story and acceptance criteria before its sprint

**QA (part-time; about 40 tasks in total)**
- QA tasks for CAT, PTY, RET, CMP (Ashok's screens) and CRM, ENG (Nitheesh's screens): test against the acceptance criteria you wrote
- Business acceptance (UAT) for every feature

Compliance rules: you research and draft them; Nitheesh confirms them with qualified professionals.

## Handoffs

| You receive | From | You give | To |
|---|---|---|---|
| Real workflows, pain points | Pharmacies, pilot customers | BRD/FRS, user stories (Given/When/Then) | Everyone |
| Questions on rules | Engineers (issue comments) | Answers within 1 working day, recorded in the doc | Engineers |
| Screens on staging for your QA areas | Ashok, Nitheesh | QA results and defects | Screen owner |
| | | Business acceptance (UAT) sign-off | Nitheesh |
| | | Expected values for GST/pricing vectors | Ashok, Kamesh |

> **Part-time:** about 40 tasks in total. Ashok reviews your test cases so QA follows one standard.

## Your AI agents

- `.claude/agents/business-analyst.md` — drafts stories, checks FEATURES coverage, draws workflow diagrams. It must never invent tax/legal rules; you verify every one.
- `.claude/agents/qa-engineer.md` — drafts test cases from your stories; you verify the expected values.

## Definition of done

- **Stories:** acceptance criteria an engineer can test without asking you; ⚠ rules confirmed with a pharmacist/CA and the source noted.
- **QA:** every acceptance criterion tested on staging, defects filed with steps and evidence, result in the sprint test report.

Phase tasks: [PHASE_PLAN.md](PHASE_PLAN.md)
