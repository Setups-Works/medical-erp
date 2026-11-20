# ADR-0002: Modular monolith with Spring Modulith

- Status: Accepted · Date: 2026-11-21

## Context
Microservices need DevOps maturity, distributed transactions and more people than we have. But a "big ball of mud" monolith becomes unmaintainable, especially with beginners and AI agents writing code.

## Decision
One Spring Boot deployable with modules under `modules/<name>`; only the `api` sub-package is public. Spring Modulith verifies boundaries in tests; cross-module side effects use persisted application events.

## Consequences
+ Single transaction for sale + stock + payment. + Simple deploys. + Modules can be extracted later.
− Must police boundaries (automated test + review). − One JVM scales vertically first.
