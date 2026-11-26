# Current state

> Agents read this to know what exists. **Update it in every PR that changes what works.** Keep it factual: `live` (merged & on staging) · `building` (in progress) · `planned`.

**Phase:** P0 Foundation · **Last updated:** 2026-11-26 · **By:** Nitheesh

| Area | Status | Notes |
|---|---|---|
| Repo structure & docs | live | Folders, AGENTS.md, architecture, phases, team plans, page catalogue, roles, validation rulebook, ownership matrix |
| Backend scaffold | building | `backend/meno-api` (Kamesh, Hub #457/#458): Spring Boot 4.2, Java 21, Modulith (`ModulithTest`), Problem Details, UUIDv7, Flyway; login / refresh (rotation + reuse detection) / logout / me with ES256 JWT; modules `tenancy`, `identity`, `auth`; Swagger UI (`/swagger-ui.html`, off in production) and the generated spec in `contracts/openapi/meno-api.yaml`. `./mvnw verify` green (20 tests) (PostgreSQL integration test needs Docker). Not yet: RLS + TenantContext (#7), permissions, page envelope, money, validation annotations |
| Billing engine (`packages/billing-engine`) | building | TypeScript, decimal.js; 72 / 72 test vectors pass (draft vectors, awaiting hand check + CA); Java twin pending (Kamesh) |
| pnpm workspace root | live | `package.json`, `pnpm-workspace.yaml` (apps/*, packages/*) |
| Web scaffold / design system | planned | P1 — tokens defined in `docs/design/DESIGN_LANGUAGE.md` |
| Desktop shell | planned | P4 (online), P5 (offline) |
| Docker Compose / CI | building | `docker-compose.yml` (postgres 17, redis, mailpit, api profile). CI (`.github/workflows/ci.yml`): backend verify + OpenAPI-spec check + API image build + Trivy + frontend checks (once apps/web has code) on every PR; CodeQL (`codeql.yml`); Dependabot. Azure (26-11-2026): apps `meno-api-staging` / `meno-api-production` on the existing B1 plan in `nitheesh_group` (F1 ran out of CPU quota), GitHub Environments set. Waiting for the MENO databases on `untitled-ws-pg-13oct26` (run by Nitheesh). CD (`deploy-api.yml`): `develop` → staging App Service, `main` → production App Service, smoke-tested (ADR-0017, Hub #133/#134/#135/#141). `infrastructure/docker/api.Dockerfile`. Azure apps, DB and GitHub Environments are set up by hand per `docs/deployment/AZURE_APP_SERVICE.md`. Not yet: object storage in compose, web Dockerfile (no web code yet), OIDC switch (script ready) |
| Azure staging | planned | P1 |
| Mobile | deferred | P7 |
| Team access | live | 7 members. GitHub (`Setups-Works/medical-erp`): nitheeshdr, kamesh77-git, Meyyarivu, gokulb24 (invited 25-11-2026, Hub #978); real handles in `.github/CODEOWNERS`. Prakalya, Ashok and Jeeva still use placeholder handles until they join the repo. Hub: all 7 have accounts |
| MENO Hub (project management) | live | https://setupsworks-pms.vercel.app · `project-management/`: **Start here** page (build order with live milestone status, everyone's next Step, weekly goal, daily meeting), step-ordered tasks, 378 pages, 475 features (every feature linked to at least one page) imported from these docs; owners from OWNERSHIP_MATRIX.md. Learn Day 21: click-through ERP demo (tabbed supplier, customer, product forms; ledger, purchase, POS with full line columns, wholesale tax invoice with returns / replacement / charges and printed layout, results). Learn Day 22: live GSTIN fetch on the full supplier and customer forms (real GST verify API through `/api/learn/gst`; spec `docs/product/GSTIN_FETCH.md`) |
| Field and logic specs | live | `docs/product/MASTER_FIELDS.md` (supplier, customer, product tabs and fields), `docs/product/DOCUMENT_FIELDS.md` (every transaction document: fields, checks, posting), CALCULATIONS.md §6a–§22; FEATURES §24–§32; security: `docs/security/THREAT_MODEL.md`, controls catalogue in SECURITY.md, ADR-0016 (Proposed); researched answers `docs/compliance/RESEARCHED_ANSWERS.md` (51 answers; 189 / 189 open rules researched or proposed; sign-off sheets in `docs/compliance/signoff/`); plain-language guide `docs/product/HOW_A_PHARMACY_WORKS.md` and HTML learning guide `docs/guide/meno-learning-guide.html` and developer guide `docs/guide/meno-developer-guide.html` (13 core screens field by field, 378 pages with pattern and API; both in Hub → Learn) + seed `contracts/reference-data/statutory-settings.v1.json`; enterprise standard `docs/architecture/ENTERPRISE_READINESS.md`; pilot scope `docs/planning/PILOT_SCOPE.md` (generated); open rules `docs/compliance/RULES_TO_CONFIRM.md` (generated); 20 draft test vectors in `contracts/test-vectors/`; pharmacy visit guide; onboarding flow `docs/product/ONBOARDING.md`; competitor audit `docs/product/research/COMPETITOR_AUDIT.md` (Marg, VarthagamSoft, others) |
| Sprint 0 review pack | live | `docs/planning/sprint-0/`: architecture review held, all 14 ADRs accepted; BRD / ER / wireframe review checklists |
| Product study | building | `docs/product/research/PRODUCT_STUDY.md`: desk study of 2 products; pain points to confirm in pharmacy visits |

## Known decisions pending

- GSP/IRP provider for e-invoice (P5) — Jeeva compares providers, Nitheesh decides.
- Production hosting beyond the pilot: the Azure student plan fits the Pilot tier only (ENTERPRISE_READINESS.md §1); an ADR is needed before the first paying customer.
- GSTIN verification service and its cost (PTY-15).
- WhatsApp Business provider (P5).
- Indian medicine data source & licence (CAT-10, INT-11): Jeeva compares, Prakalya checks hit rate on real bills, Nitheesh decides (P2). openFDA is reference only (CAT-21), not a product source.
- Licensing (ADR-0015, Proposed): grace length, restricted-mode rules, soft vs hard invoice limit, plan prices. Nitheesh decides before LIC-06.
- Rules marked ⚠ VERIFY in `docs/architecture/CALCULATIONS.md`, `MASTER_FIELDS.md` and `DOCUMENT_FIELDS.md`; nine new rows in `docs/compliance/COMPLIANCE.md` (24-11-2026) for CA / pharmacist confirmation.
