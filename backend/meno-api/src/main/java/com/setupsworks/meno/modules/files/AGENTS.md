# Module `files` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P2 · **Features:** —

## Purpose
Upload/download of files (prescriptions, imports, invoices PDF) via object storage.

## Owns tables
stored_file

## Public API (`files.api`)
FileStore.put/get/signedUrl

## Events published
—

## Allowed dependencies
—

## Error codes
FILES_TOO_LARGE, FILES_TYPE_NOT_ALLOWED

## Module rules
1. Private buckets; signed URLs ≤ 5 min.
2. Validate MIME by content sniffing; size limits per purpose.
3. Path prefix = tenant id.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
