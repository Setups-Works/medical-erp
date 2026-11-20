# Module `sync` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P5 · **Features:** DSK-02, DSK-05, POS-15

## Purpose
Device registration and offline push/pull protocol.

## Owns tables
device, sync_batch, sync_cursor, sync_conflict

## Public API (`sync.api`)
/api/v1/sync/push, /pull, /devices

## Events published
OfflineInvoiceAccepted, SyncConflictRaised

## Allowed dependencies
sales::api, returns::api, payment::api, catalog::api, party::api, inventory::api, pricing::api, tenancy::api

## Error codes
SYNC_DEVICE_REVOKED, SYNC_SCHEMA_TOO_OLD

## Module rules
1. Read docs/architecture/OFFLINE_SYNC.md fully first.
2. Idempotent by document UUID; accept-and-flag conflict policy; never overwrite silently.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
