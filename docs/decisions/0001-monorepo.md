# ADR-0001: Monorepo with pnpm + Turborepo (TS) and Maven (Java)

- Status: Accepted · Date: 2026-11-21 · Deciders: Nitheesh

## Context
Web, desktop, shared TS packages, backend, contracts, infra and docs change together (an API change touches backend, client and screens). Six people; AI agents work best when all context is in one repo.

## Decision
One GitHub repo, `Setups-Works/medical-erp` (named `meno` in early drafts; kept as `medical-erp` at the Sprint 0 review; code names such as `meno-api` stay). TypeScript workspaces managed by pnpm with Turborepo task caching; backend is a standalone Maven project under `backend/meno-api` (with Maven wrapper). Contracts live in `contracts/` as the language-neutral bridge.

## Consequences
+ Atomic PRs across layers, one CI, one place for docs/agents. + Turborepo only rebuilds what changed.
− Two build tools; CI uses path filters so backend jobs don't run on docs-only changes.
