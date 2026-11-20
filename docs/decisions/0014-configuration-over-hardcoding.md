# ADR-0014: Configuration over hard-coding, four-layer validation

- Status: Accepted · Date: 2026-11-21 · Deciders: Nitheesh

## Context
Tax rates, thresholds, schedules, number formats, discount limits and approval rules differ by tenant, state and date, and change by law. Hard-coded values cause wrong invoices when anything changes, and AI agents tend to hard-code "sensible" numbers.

## Decision
All business-variable values live in effective-dated configuration tables and tenant settings, read through typed facades; permissions (not role names) gate behaviour; option lists come from the API. Validation runs in four layers (UI Zod, API Bean Validation, domain rules, PostgreSQL constraints) as defined in `docs/architecture/VALIDATION_AND_BUSINESS_RULES.md`.

## Consequences
+ Behaviour changes without deployments; consistent rules across web, desktop and API; safer AI-generated code.
− More tables and seed migrations; every rule needs tests at more than one layer.
