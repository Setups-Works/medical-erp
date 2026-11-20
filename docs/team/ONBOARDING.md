# Onboarding (day 1–3)

## Day 1 — understand

1. Read: [README](../../README.md) → [AGENTS.md](../../AGENTS.md) → [VISION](../product/VISION.md) → [GLOSSARY](../product/GLOSSARY.md) → [FEATURES](../product/FEATURES.md) (skim).
2. Read your folder: `docs/team/members/<you>/README.md` and `PHASE_PLAN.md`.
3. Read [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) and [CONFLICT_FREE_COLLABORATION.md](CONFLICT_FREE_COLLABORATION.md).
4. Watch a pharmacist bill at a counter (visit or video call). Note 5 things that surprised you.

## Day 2 — set up

| Tool | Version | Who |
|---|---|---|
| Git + GitHub account (2FA on) | latest | All |
| Docker Desktop | latest | All |
| Node.js LTS + corepack (pnpm) | 22+ | Frontend, QA, Nitheesh |
| JDK (Temurin) | 21 | Backend, QA, Nitheesh |
| IntelliJ IDEA Community / VS Code | latest | Engineers |
| Claude Code / Cursor | latest | All |
| Bruno or Postman | latest | QA, Backend |
| Azure CLI | latest | Jeeva, Nitheesh |

Clone, then (from Sprint 1): `docker compose up -d`, `pnpm install`, `pnpm dev`, `./mvnw spring-boot:run`.

## Day 3 — first contribution

Pick a `good-first-issue` (usually docs or a small test). Open a PR using the template and get it merged. That proves your setup, branch, commit style and review flow.

## Learning paths

- **Backend:** Spring Boot reference guide (getting started, data JPA, security), Spring Modulith reference, Flyway docs, Testcontainers Java quickstart.
- **Frontend:** Next.js App Router docs, TanStack Query guides, React Hook Form + Zod, shadcn/ui docs, Tailwind v4 docs.
- **QA:** Playwright docs, REST API testing basics, SQL basics, OWASP Top 10.
- **DevOps:** Docker & Compose docs, GitHub Actions docs, Nginx beginner's guide, Azure Bicep quickstarts.
- **Domain (everyone):** GST basics for goods (CBIC), the Drugs & Cosmetics Rules overview for Schedule H/H1/X (Prakalya summarises in `docs/compliance/`).
