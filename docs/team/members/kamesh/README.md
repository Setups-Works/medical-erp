# Kamesh — Backend Engineer

## Your job in one line

Build the business modules of `meno-api` so every purchase, sale, return and payment leaves stock and money exactly right.

## You own (CODEOWNER)

Full split: [OWNERSHIP_MATRIX.md](../../OWNERSHIP_MATRIX.md). You are the **backend owner of the core money and stock modules**: every feature with prefix CAT, PTY, PRC, PUR, INV, IJX, MKT, POS, WHS, DOC, RET, CMP, GST.

- `backend/meno-api/src/main/java/com/setupsworks/meno/modules/{catalog,party,pricing,purchase,inventory,sales,returns,compliance,taxation}/`
- `backend/meno-api/src/main/resources/db/migration/` for those modules (Nitheesh approves money/stock tables)
- `docs/database/DATA_MODEL.md`, `docs/api/` endpoint docs, the `AGENTS.md` of your modules

Platform, finance, reporting and notification modules are Nitheesh's (`auth`, `tenancy`, `identity`, `audit`, `files`, `sync`, `notification`, `payment`, `accounting`, `reporting`). Use their `api/` packages; ask for changes through a PR.

## Handoffs

| You receive | From | You give | To |
|---|---|---|---|
| FRS + stories | Prakalya | Endpoints + OpenAPI spec (**merged first as a contract PR**) | Meyyarivu |
| Platform base classes | Nitheesh | Business modules with tests | Ashok (for API tests) |
| Bugs | Ashok | Migration notes for deploys | Jeeva |
| Test vectors | Prakalya/Ashok | Passing Java engines | Nitheesh |

## Your AI agent

`.claude/agents/backend-engineer.md`. Give it the issue, the module `AGENTS.md`, and the FRS section. Always ask it for tests first (cross-tenant + business rule), then implementation.

## Module recipe (follow every time)

1. Migration `V<timestamp>__<module>_<what>.sql` (tenant_id, RLS, indexes, audit cols, version).
2. `domain/` entity + rules (unit-tested without Spring).
3. `repository/` Spring Data interfaces.
4. `service/` use cases with `@Transactional`; call other modules only via their `api/`.
5. `web/` controller + request/response records + `mapper/` (MapStruct).
6. `api/` facade + events if other modules need it.
7. Tests: domain unit, service unit (Mockito), controller integration (Testcontainers) incl. **cross-tenant** and **permission** tests.
8. Update OpenAPI export, `DATA_MODEL.md`, module `AGENTS.md`, `CURRENT_STATE.md`.

## Definition of done

`./mvnw verify` green (incl. Modulith + ArchUnit) · coverage ≥ 80 % on `service/` and `domain/` · no N+1 queries (check SQL log) · money as BigDecimal · reviewed by Nitheesh.

Phase tasks: [PHASE_PLAN.md](PHASE_PLAN.md)
