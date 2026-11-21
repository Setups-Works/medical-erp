# Current state

> Agents read this to know what exists. **Update it in every PR that changes what works.** Keep it factual: `live` (merged & on staging) · `building` (in progress) · `planned`.

**Phase:** P0 Foundation · **Last updated:** 2026-11-21 · **By:** Nitheesh

| Area | Status | Notes |
|---|---|---|
| Repo structure & docs | live | Folders, AGENTS.md, architecture, phases, team plans, page catalogue, roles, validation rulebook, ownership matrix |
| Backend scaffold | planned | P1 |
| Web scaffold / design system | planned | P1 — tokens defined in `docs/design/DESIGN_LANGUAGE.md` |
| Desktop shell | planned | P4 (online), P5 (offline) |
| Docker Compose / CI | planned | P1 |
| Azure staging | planned | P1 |
| Mobile | deferred | P7 |
| MENO Hub (project management) | live | https://setupsworks-pms.vercel.app · `project-management/`: 618 tasks with step order, 255 pages, 284 features imported from these docs; owners from OWNERSHIP_MATRIX.md |
| Sprint 0 review pack | building | `docs/planning/sprint-0/`: architecture review agenda + ADR decision sheet, BRD / ER / wireframe review checklists |
| Product study | building | `docs/product/research/PRODUCT_STUDY.md`: desk study of 2 products; pain points to confirm in pharmacy visits |

## Known decisions pending

- **ADR-0009** (Problem Details, no envelope): proposed with a recommendation; decide at the Sprint 0 architecture review.
- **ADR-0001 repo name**: ADR says `meno`, GitHub repo is `Setups-Works/medical-erp`; decide at the review.
- GSP/IRP provider for e-invoice (P5) — Jeeva compares providers, Nitheesh decides.
- WhatsApp Business provider (P5).
- Medicine database seed source & licence (CAT-10).
- Rules marked ⚠ VERIFY in `docs/architecture/CALCULATIONS.md`.
