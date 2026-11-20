# Module `purchase` — AGENTS.md

**Owner:** Kamesh · **QA:** Ashok · **Phase:** P3 · **Features:** PUR-01…11

## Purpose
Purchase orders, purchase invoices, GRN, CSV import, posting and reversal.

## Owns tables
purchase_order(+line), purchase_invoice(+line), goods_receipt(+line), import_job, supplier_item_map

## Public API (`purchase.api`)
PurchaseFacade

## Events published
PurchasePosted, PurchaseReversed

## Allowed dependencies
catalog::api, party::api, pricing::api, taxation::api, inventory::api, files::api, tenancy::api

## Error codes
PURCHASE_DUPLICATE_SUPPLIER_INVOICE, PURCHASE_ALREADY_POSTED, PURCHASE_BATCH_EXPIRED

## Module rules
1. Posting creates/updates batches and writes inventory movements in the same transaction.
2. Duplicate check on (supplier, supplier_invoice_no, FY).
3. Landed cost includes free goods and allocated charges.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
