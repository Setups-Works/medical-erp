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
| MENO Hub (project management) | live | https://setupsworks-pms.vercel.app · `project-management/`: step-ordered tasks, 258 pages, 288 features imported from these docs; owners from OWNERSHIP_MATRIX.md |
| Sprint 0 review pack | live | `docs/planning/sprint-0/`: architecture review held, all 14 ADRs accepted; BRD / ER / wireframe review checklists |
| Product study | building | `docs/product/research/PRODUCT_STUDY.md`: desk study of 2 products; pain points to confirm in pharmacy visits |

## Known decisions pending

- GSP/IRP provider for e-invoice (P5) — Jeeva compares providers, Nitheesh decides.
- WhatsApp Business provider (P5).
- Indian medicine data source & licence (CAT-10, INT-11): Jeeva compares, Prakalya checks hit rate on real bills, Nitheesh decides (P2). openFDA is reference only (CAT-21), not a product source.
- Rules marked ⚠ VERIFY in `docs/architecture/CALCULATIONS.md`.
