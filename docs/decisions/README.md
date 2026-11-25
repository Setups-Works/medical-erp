# Architecture Decision Records

An ADR records one significant decision: context, decision, consequences. Write one when you change module boundaries, add a framework/infrastructure piece, change data/money/sync rules, or reverse an earlier ADR. Copy [0000-template.md](0000-template.md). Status: Proposed → Accepted (by Nitheesh) → Superseded by ADR-x.

| # | Decision | Status |
|---|---|---|
| [0001](0001-monorepo.md) | Monorepo: pnpm + Turborepo for TS, Maven for backend | Accepted |
| [0002](0002-modular-monolith.md) | Modular monolith with Spring Modulith | Accepted |
| [0003](0003-nextjs-static-spa.md) | Next.js as static SPA; Spring Boot is the only backend | Accepted |
| [0004](0004-electron-desktop-offline.md) | Electron desktop with SQLite offline billing | Accepted |
| [0005](0005-azure-vm-docker-compose.md) | Azure VM + Docker Compose + managed PostgreSQL | Accepted |
| [0006](0006-shared-schema-multitenancy.md) | Shared-schema multi-tenancy with RLS | Accepted |
| [0007](0007-inventory-ledger-immutable-docs.md) | Inventory movement ledger and immutable posted documents | Accepted |
| [0008](0008-mobile-deferred.md) | Mobile app deferred to P7 | Accepted |
| [0009](0009-problem-details-no-envelope.md) | Plain resources + RFC 9457 errors instead of response envelope | Accepted |
| [0010](0010-uuidv7-keys.md) | UUIDv7 primary keys | Accepted |
| [0011](0011-shared-calculation-vectors.md) | Calculation parity through shared test vectors | Accepted |
| [0012](0012-design-language.md) | Paper-and-ink design language on shadcn/ui | Accepted |
| [0013](0013-postgresql-system-of-record.md) | PostgreSQL is the only product database | Accepted |
| [0014](0014-configuration-over-hardcoding.md) | Configuration over hard-coding, four-layer validation | Accepted |
| [0015](0015-license-keys-signed-certificates.md) | License keys + server-side licenses + Ed25519-signed certificates | Proposed |
| [0016](0016-tamper-evident-records-and-device-signing.md) | Hash-chained posted records and device-signed offline bills | Proposed |
| [0017](0017-ai-assistant-shared-llm.md) | AI assistant on one shared LLM provider, behind meno-api tools | Proposed |
