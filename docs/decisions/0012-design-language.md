# ADR-0012: Paper-and-ink design language on shadcn/ui

- Status: Accepted · Date: 2026-11-21

## Decision
Use a paper-and-ink token system (paper/ink palette, hairlines, Geist, Light/Dark, tenant accent) mapped onto shadcn/ui (new-york, CSS variables) inside `packages/ui`. Enforced by a design-check script in hooks and CI.

## Consequences
+ Consistent look from day one; agents have concrete rules. − Custom mapping to maintain when shadcn updates.
