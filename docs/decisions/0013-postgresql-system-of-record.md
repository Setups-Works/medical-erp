# ADR-0013: PostgreSQL is the only product database

- Status: Accepted · Date: 2026-11-21 · Deciders: Nitheesh

## Context
MENO stores invoices, stock, ledgers and statutory registers. These need transactions across many rows, strong constraints, row-level security and mature tooling for backups and point-in-time restore.

## Decision
PostgreSQL 17 is the single system of record for all MENO product data (Azure Database for PostgreSQL Flexible Server in the cloud, the official image locally). Shared schema, `tenant_id` + RLS, Flyway migrations, constraints for every invariant. SQLite on the desktop is only an offline cache and outbox. MongoDB is used only by the internal team tool `project-management/` and never by the product.

## Consequences
+ ACID transactions for sale + stock + voucher; constraints and RLS as a safety net; one backup story.
− Schema changes need migrations (planned, reviewed); reporting load handled with views/materialised views.
