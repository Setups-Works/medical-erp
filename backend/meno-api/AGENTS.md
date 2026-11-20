# backend/meno-api — AGENTS.md

Spring Boot 4 / Java 21 modular monolith (ADR-0002). The **only** backend. Owners: Kamesh (business modules, migrations), Nitheesh (platform: `config`, `security`, `common`, `tenancy`, modules `auth`, `tenancy`, `identity`, `files`, `sync`).

## Layout

```
src/main/java/com/setupsworks/meno/
  MenoApplication.java
  config/          Spring config (Jackson, OpenAPI, Clock, async, cache, CORS-none)
  security/        JWT, refresh rotation, filters, @RequiresPermission, PermissionChecker
  common/
    error/         Problem Details, MenoException hierarchy, error codes
    money/         Money/Percent value objects, rounding policy
    validation/    Custom constraint annotations (@Gstin, @Pan, @Hsn, @IndianPhone, @PinCode), BusinessRuleViolation
    web/           Page envelope, Idempotency-Key filter, request id
    persistence/   BaseEntity (UUIDv7, audit cols, version), TenantScopedEntity
    events/        Base domain event types
  tenancy/         TenantContext, TenantContextFilter, Hibernate filter, RLS session setter
  integrations/    Adapters to outside systems (gst, whatsapp, sms, storage, tally) — behind interfaces
  modules/<module>/
    package-info.java   @ApplicationModule(allowedDependencies = {...})
    api/          PUBLIC: <Module>Facade interface, public DTOs (records), events
    web/          @RestController + request/response records
    service/      Use cases (@Service, @Transactional), facade implementation
    domain/       JPA entities, value objects, enums, domain rules (pure where possible)
    repository/   Spring Data JPA repositories, specifications
    mapper/       MapStruct mappers entity ↔ DTO
    AGENTS.md     Module-specific rules, tables, error codes, events
src/main/resources/
  application.yml (+ -local, -test, -staging, -prod)
  db/migration/   Flyway V<yyyyMMddHHmm>__<module>_<what>.sql
  db/seed/        Dev/demo seed (never runs in prod)
src/test/java/com/setupsworks/meno/
  architecture/   ModulithTest, ArchUnit rules
  support/        Testcontainers base, CrossTenantAccessTest, fixtures, fixed Clock
  modules/<m>/    Unit + integration tests per module
  scenarios/      Cross-module business scenarios (Ashok + Kamesh)
```

## Module template (copy for every module)

```java
// modules/inventory/package-info.java
@org.springframework.modulith.ApplicationModule(
    allowedDependencies = { "catalog::api", "tenancy::api" })
package com.setupsworks.meno.modules.inventory;
```

- Controller: `@RestController @RequestMapping("/api/v1/<resources>")`, validates `@Valid` record DTOs, calls one service method, maps result. No business logic, no repository access.
- Service: one public method per use case (`postPurchaseInvoice(cmd)`), `@Transactional` here, checks permission (`permissionChecker.require("purchase.invoice.post")`), calls domain + repositories + other modules' facades, publishes events.
- Domain: entities with behaviour (`invoice.post(clock)`, `batch.ensureSellable(date)`), invariants enforced in methods; no setters for state transitions.
- Repository: interfaces only; custom queries via `@Query` with named params or Specifications. **Never** string-concatenated SQL.
- Mapper: MapStruct; entities never leave the module.

## Must-follow rules

1. Other modules only via `<module>.api`. `ModulithTest` enforces it.
2. Tenant from `TenantContext` only; entities extend `TenantScopedEntity`.
3. `BigDecimal` for money with `common.money` helpers; never `double`.
4. Stock changes only through `inventory.api.StockFacade` (which writes movements).
5. Posted documents immutable; reversal methods only.
6. Create/post endpoints for money/stock: `@Idempotent`.
7. Every write audited (entity listener or explicit `AuditRecorder`).
8. Migrations: new file each time, RLS + tenant indexes; never edit applied ones.
9. Use the injected `Clock`, never `LocalDate.now()` directly (testability, FY logic).
10. Log with SLF4J structured args; no PII.
11. Validation in every layer you own: Bean Validation on request records (custom annotations `@Gstin`, `@Pan`, `@Hsn`, `@IndianPhone`, `@PinCode` in `common/validation`), domain rules throwing `BusinessRuleViolation(code)`, and PostgreSQL constraints in the migration. See `docs/architecture/VALIDATION_AND_BUSINESS_RULES.md`.
12. **No hard-coded business values**: read rates, thresholds, limits and formats via `SettingsFacade`, `TaxRateRepository`, `ApprovalPolicy`, `NumberSeriesFacade`. Check permissions, never role names.

## Error codes

`<MODULE>_<REASON>` e.g. `INVENTORY_BATCH_EXPIRED`, `SALES_CREDIT_LIMIT_EXCEEDED`, `PURCHASE_DUPLICATE_SUPPLIER_INVOICE`. Listed in each module's `AGENTS.md`.

## Commands (from P1)

`./mvnw spring-boot:run -Dspring-boot.run.profiles=local` · `./mvnw test` · `./mvnw verify` (incl. integration + Modulith + coverage) · `./mvnw -Pexport-openapi` (writes `contracts/openapi/meno-api.yaml`)
