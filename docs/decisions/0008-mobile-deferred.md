# ADR-0008: Mobile app deferred to P7

- Status: Accepted · Date: 2026-11-21

## Decision
No mobile app until after pilot. Desktop (Electron) covers retail and wholesale counters; the responsive web covers owners on phones for read-mostly use. Wholesale field sales (salesman, collection) moves to P7 with an Expo app reusing `types`, `validation`, `api-client`, `billing-engine`.

## Consequences
+ Team focuses on correctness of core flows. − Field-sales distributors wait for P7.
