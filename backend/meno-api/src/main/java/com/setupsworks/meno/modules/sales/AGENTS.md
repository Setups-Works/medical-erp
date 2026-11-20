# Module `sales` — AGENTS.md

**Owner:** Kamesh · **QA:** Ashok · **Phase:** P4–P5 · **Features:** POS-*, WHS-*

## Purpose
Retail POS invoices, held bills, wholesale orders → invoices, deliveries, e-invoice requests.

## Owns tables
sales_invoice(+line), held_bill, sales_order(+line), delivery

## Public API (`sales.api`)
SalesFacade

## Events published
InvoicePosted, InvoiceCancelled, OrderConfirmed

## Allowed dependencies
catalog::api, party::api, pricing::api, taxation::api, inventory::api, compliance::api, tenancy::api

## Error codes
SALES_CREDIT_LIMIT_EXCEEDED, SALES_RX_REQUIRED, SALES_ALREADY_POSTED, SALES_EDITION_REQUIRED

## Module rules
1. Posting: price → tax → compliance check → consume stock → number → save → event, all in one transaction.
2. Idempotency-Key mandatory on post.
3. Retail vs wholesale behaviour switched by edition, not by duplicated code.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
