# Module `party` — AGENTS.md

**Owner:** Kamesh · **QA:** Ashok · **Phase:** P2 · **Features:** PTY-01…10

## Built so far (26-11-2026)
- GSTIN fetch (PTY-15, `docs/product/GSTIN_FETCH.md`): `GET /api/v1/gstin-verifications/{gstin}`, `GstinVerificationService` (§4 checks first via `common/gst/Gstin`, 24 h cache, per-tenant limit, log line as audit until the audit module) → `integrations.api.GstinVerifier`. Permission `party.supplier.create` or `party.customer.create` or `tenancy.onboarding.manage`. Allowed deps now `integrations::api`, `tenancy::api`.
- Codes: PARTY_GSTIN_INVALID (422, `failedCheck` FORMAT/STATE/PAN/CHECK_CHARACTER), PARTY_GSTIN_NOT_FOUND (404), PARTY_GSTIN_RATE_LIMITED (429), PARTY_GSTIN_SERVICE_UNAVAILABLE (503).

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
