# Module `accounting` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P5–P6 · **Features:** ACC-03…10

## Purpose
Chart of accounts, vouchers auto-posted from events, expenses, books, trial balance, P&L, Tally export.

## Owns tables
ledger_account, voucher, voucher_entry, expense, day_close

## Public API (`accounting.api`)
LedgerFacade.balance(account)

## Events published
—

## Allowed dependencies
party::api, tenancy::api

## Error codes
ACCOUNTING_UNBALANCED, ACCOUNTING_PERIOD_LOCKED

## Module rules
1. Listens to PurchasePosted, InvoicePosted, ReturnPosted, PaymentRecorded; listener must be idempotent by source document.
2. Σ debit = Σ credit enforced by trigger.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
