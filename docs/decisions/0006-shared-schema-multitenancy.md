# ADR-0006: Shared-schema multi-tenancy with Row-Level Security

- Status: Accepted · Date: 2026-11-21

## Decision
All tenants share one schema; every tenant row has `tenant_id`. Isolation by token-derived tenant context, Hibernate filter and PostgreSQL RLS (`SET LOCAL app.tenant_id`). Cross-tenant test base class mandatory for endpoints.

## Consequences
+ One migration path, cheap. − A bug can leak data → defence in depth + tests. Large tenants can later move to a dedicated DB with the same schema.
