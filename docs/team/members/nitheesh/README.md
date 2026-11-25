# Nitheesh — Tech Lead & Full-stack Engineer

## Your job in one line

**Manage everything:** product scope, priorities, sprints, architecture, reviews, releases and the team. Hands-on, you also own the risky parts: security, tenancy, offline sync and money-maths parity.

## You manage

- **Product & backlog:** final say on scope and priority; you approve every sprint plan (Prakalya grooms the backlog).
- **People:** daily stand-up, 1:1 every two weeks with each member, mentoring, and rebalancing work when someone is blocked or overloaded.
- **Quality gates:** you are the **second reviewer on every path** (`* @nitheesh` in CODEOWNERS), and the release go/no-go is yours. You give the final QA sign-off. On the frontend you are one of four (with Meyyarivu, Ashok and Gokul) who build every screen.
- **Delivery:** phase gates (`docs/planning/PHASES.md`), `CURRENT_STATE.md`, risks and decisions log.
- **Budget & access:** Azure spend (with Jeeva), production access, secrets.

## You own hands-on (CODEOWNER)

Full split: [OWNERSHIP_MATRIX.md](../../OWNERSHIP_MATRIX.md).

- **Backend + frontend (full stack):** platform & admin (PLT, ADM), finance (ACC, ACX), licensing (LIC)
  - Backend modules: `auth`, `tenancy`, `identity`, `subscription`, `audit`, `files`, `sync`, `notification`, `payment`, `accounting`, `reporting`, `fieldsales`, plus `config/ security/ common/ tenancy/ integrations/`
  - Web features: `company`, `branches`, `users`, `settings`, `admin`, `accounting`, `payments`, `platform`
- **Backend only:** dashboards (DSH), reports & analytics (RPT, ANX), CRM & engagement (CRM, ENG), delivery (DLV), online channels (OMN): Gokul builds those screens (since 25-11-2026).
- **Backend only, Meyyarivu's screens:** auth/onboarding (AUT), navigation (NAV), desktop sync (DSK), notifications (NTF), integrations (INT), mobile (MOB).
- Confirms every ⚠ compliance rule with qualified professionals (Prakalya researches); vendor choices (GSP, WhatsApp/SMS), privacy notice, pilot onboarding, launch pricing
- `AGENTS.md`, `docs/architecture/`, `docs/decisions/`, `docs/planning/`, `contracts/`, `packages/billing-engine`, `packages/types`, `packages/api-client`
- Final approver for: new dependencies, module dependency changes, migrations touching money/stock tables, `.github/CODEOWNERS`, `docs/team/OWNERSHIP_MATRIX.md

## Handoffs

| You receive | From | You give | To |
|---|---|---|---|
| BRD/FRS, user stories, rule clarifications | Prakalya | Architecture, ADRs, module boundaries, API shape decisions | Everyone |
| PRs for review | Everyone | Platform foundations (security, tenancy, error model) | Kamesh |
| QA reports, release recommendation | Ashok | `api-client` generation pipeline, billing-engine | Meyyarivu, Gokul, Prakalya |
| Infra status, cost | Jeeva | Release decision (go/no-go) | All |

## Your AI agents

`.claude/agents/architecture-reviewer.md` for PR reviews; `backend-engineer.md` for platform code; `frontend-engineer.md` when touching desktop renderer bits.

## Weekly rhythm

Mon sprint check & unblock · Tue/Thu PR review blocks (max 24 h review turnaround) · Wed architecture office hour (anyone can bring a design question) · Fri demo + `CURRENT_STATE.md` update.

## Definition of done (for your own PRs)

ADR written if architecture changed · tests including cross-tenant · docs updated · reviewed by one other engineer (yes, even you).

Phase tasks: [PHASE_PLAN.md](PHASE_PLAN.md)
