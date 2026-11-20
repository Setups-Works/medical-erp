# Module `party` — AGENTS.md

**Owner:** Kamesh · **QA:** Ashok · **Phase:** P2 · **Features:** PTY-01…10

## Purpose
Suppliers, customers, retailers, doctors; GST/DL details; credit terms; opening balances.

## Owns tables
party, party_contact, party_address, credit_terms

## Public API (`party.api`)
PartyFacade.find(id), creditStatus(id), snapshot(id)

## Events published
PartyChanged

## Allowed dependencies
tenancy::api

## Error codes
PARTY_INVALID_GSTIN, PARTY_DL_EXPIRED, PARTY_DUPLICATE

## Module rules
1. Validate GSTIN format + checksum + state code.
2. Credit status = limit − outstanding (from payment/accounting read model).

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
