# Module `audit` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P1 · **Features:** PLT-12

## Purpose
Append-only audit trail for masters and documents.

## Owns tables
audit_log (partitioned monthly)

## Public API (`audit.api`)
AuditRecorder.record(...), audit query endpoints

## Events published
—

## Allowed dependencies
—

## Error codes
—

## Module rules
1. Insert-only; no update/delete endpoints.
2. Store before/after JSON with secrets and PII masked.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
