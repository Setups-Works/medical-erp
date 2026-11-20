# ADR-0007: Inventory movement ledger and immutable posted documents

- Status: Accepted · Date: 2026-11-21

## Decision
Stock changes only by inserting `inventory_movement` rows in the same transaction as the source document; `stock_balance` is a cache reconciled nightly. Posted documents (invoices, purchases, returns, vouchers) are never updated or deleted — corrections are reversals/credit-debit notes. Snapshots of party/item/tax data are stored on documents.

## Consequences
+ Full audit trail, reproducible reports, legally safer. − More rows; reports read from views/aggregates.
