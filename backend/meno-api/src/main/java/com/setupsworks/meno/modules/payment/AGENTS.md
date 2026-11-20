# Module `payment` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P5 · **Features:** ACC-01, ACC-02, ACC-09

## Purpose
Receipts and payments, allocation to documents, modes, cheques/PDC.

## Owns tables
payment, payment_allocation

## Public API (`payment.api`)
PaymentFacade, OutstandingQuery

## Events published
PaymentRecorded, PaymentReversed

## Allowed dependencies
party::api, tenancy::api

## Error codes
PAYMENT_OVER_ALLOCATED

## Module rules
1. Allocation total ≤ payment amount; unallocated = on-account.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
