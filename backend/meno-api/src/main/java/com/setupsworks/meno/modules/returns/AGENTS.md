# Module `returns` — AGENTS.md

**Owner:** Kamesh · **QA:** Ashok · **Phase:** P4 · **Features:** RET-01…06

## Purpose
Sales returns, purchase returns, expiry/breakage returns and claims, credit/debit notes.

## Owns tables
sales_return(+line), purchase_return(+line), expiry_return(+line), credit_note, debit_note

## Public API (`returns.api`)
ReturnsFacade

## Events published
ReturnPosted

## Allowed dependencies
sales::api, purchase::api, inventory::api, taxation::api, party::api, tenancy::api

## Error codes
RETURNS_QTY_EXCEEDS_SOLD, RETURNS_WINDOW_EXPIRED

## Module rules
1. Cannot return more than sold/purchased minus previous returns.
2. Returned stock goes back to saleable only if not expired/damaged.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
