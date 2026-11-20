# Module `inventory` — AGENTS.md

**Owner:** Kamesh · **QA:** Ashok · **Phase:** P3 · **Features:** INV-01…15

## Purpose
Batches, movement ledger, stock balance, adjustments, transfers, stock count, reconciliation, alerts.

## Owns tables
batch, inventory_movement, stock_balance, stock_adjustment(+line), stock_transfer(+line), stock_count(+line)

## Public API (`inventory.api`)
StockFacade.receive/consume/reserve/available/fefoBatches

## Events published
StockLow, BatchExpiring, StockReconciliationFailed

## Allowed dependencies
catalog::api, tenancy::api

## Error codes
INVENTORY_INSUFFICIENT_STOCK, INVENTORY_BATCH_EXPIRED, INVENTORY_NEGATIVE_NOT_ALLOWED

## Module rules
1. inventory_movement is insert-only.
2. consume() locks stock_balance rows FOR UPDATE in a consistent order (by batch id) to avoid deadlocks.
3. Nightly reconciliation per tenant compares ledger sum with balance.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
