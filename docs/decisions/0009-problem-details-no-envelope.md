# ADR-0009: Plain resources + RFC 9457 Problem Details

- Status: Proposed (recommended for acceptance at the Sprint 0 architecture review, day 13)
- Date: 2026-11-21
- Deciders: Nitheesh (+ Kamesh, Meyyarivu, Ashok at the review)

## Context

The base plan wrapped every response in `{ success, message, data, timestamp }`. Before P1 starts we must pick one response shape, because every endpoint, the generated `packages/api-client`, the desktop sync client, Playwright/API tests and the error screens depend on it. Changing it after P1 means touching every endpoint and test.

What the shape has to support:
- **Generated clients** (springdoc OpenAPI → `packages/api-client`): types must come straight from the spec, no hand-written unwrapping (AGENTS.md rule 9).
- **Field errors from 4-layer validation** (rule 12): the UI maps `lines[2].batchId` errors to the right input.
- **Business-rule errors** with a stable machine code (batch expired, credit limit, version conflict), so the UI writes the friendly message and the desktop sync engine can decide retry vs. conflict.
- **Idempotent replays** (rule 7): a replayed `POST` returns the original result with the original status.
- **No tenant leaks**: other-tenant resources look exactly like "not found".

## Options considered

1. **Envelope for everything** `{ success, message, data, timestamp }`
   - \+ Familiar to the team; one shape to parse.
   - − Duplicates HTTP status (`success: false` with 200 happens in practice and breaks retries and monitoring).
   - − OpenAPI generators produce `Envelope<T>` wrappers; every call needs unwrapping; error shape is ad hoc.
   - − Server-written `message` pushes user-facing text into the backend (we want the UI to own wording and later languages).
2. **Plain resources + RFC 9457 Problem Details for errors** (proposed)
   - \+ Standard: Spring Boot has built-in `ProblemDetail` support; clients, proxies, Sentry and k6 understand HTTP status.
   - \+ Generated types are the resources themselves; errors are one typed schema.
   - \+ `code` + `errors[]` give the UI and sync engine everything they need.
   - − Team has to use status codes correctly (400 vs 409 vs 422); needs a short guide and review.
3. **GraphQL-style `{ data, errors }`**
   - − Not REST; poor fit with springdoc, caching and our API guidelines. Rejected.

## Decision

We adopt option 2:

- **Success:** return the resource directly with the correct status: `200`, `201` + `Location`, `204`. Lists use the page envelope `{ items, page, size, totalItems, totalPages }` (the only envelope we keep).
- **Errors:** `application/problem+json` (RFC 9457) with our extensions:
  - `code` — stable `MODULE_REASON` (UPPER_SNAKE), listed in each module's `AGENTS.md`
  - `errors[]` — `{ field, code }` per invalid field (JSON path, e.g. `lines[2].batchId`)
  - `requestId` — correlation id, also in logs and Sentry
- **Status codes:** 400 malformed · 401 · 403 no permission · 404 not found **or other tenant** · 409 version conflict / duplicate / idempotency-key reuse with a different body · 422 business rule · 429 · 500.
- **User-facing text** is built in the UI from `code` (friendly sentence, details to logs). `detail` is for developers and logs, never shown raw.
- **Idempotent replays** return the stored original response (same status and body) with header `Idempotent-Replayed: true`.
- One `common/error` handler (`@RestControllerAdvice`) produces every Problem Details response; controllers never build error bodies.

## Consequences

- \+ `packages/api-client` is generated without wrappers; `packages/validation` maps `errors[]` to form fields in one helper.
- \+ Desktop sync uses status + `code` to decide: 409 → conflict screen, 422 → "Sync issues" list, 5xx/network → retry.
- − Everyone learns the status table above; Ashok adds API tests that assert status **and** `code` for every rule.
- Must do in P1 (Nitheesh): `common/error` handler, `code` registry per module, page envelope in `common/web`, OpenAPI schema for Problem Details, an error-code → message map in `packages/validation`.
- Revisit only if a client we must support cannot read `application/problem+json` (none known).

## Review checklist (architecture meeting)

- [ ] Kamesh: happy to return resources directly and throw typed exceptions mapped by `common/error`
- [ ] Meyyarivu: generated client + `errors[]` → form fields works for the purchase grid and POS
- [ ] Ashok: API tests can assert `status` + `code`; Bruno/Postman collections updated
- [ ] Decision recorded: Status → **Accepted** (or changed), date and deciders filled in, index in `README.md` updated
