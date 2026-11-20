# ADR-0009: Plain resources + RFC 9457 Problem Details

- Status: Proposed · Date: 2026-11-21

## Context
Base plan proposed wrapping every response in `{success, message, data, timestamp}`.

## Decision
Return resources directly with correct HTTP status; lists use a page envelope; errors use Problem Details with a stable `code`. User-facing messages are produced by the UI from codes.

## Consequences
+ Cleaner generated clients, standard tooling, HTTP caching. − Team must learn status codes properly. Review at Sprint 0 architecture meeting.
