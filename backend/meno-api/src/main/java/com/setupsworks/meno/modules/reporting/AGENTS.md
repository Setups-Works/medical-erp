# Module `reporting` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P3+ · **Features:** RPT-01…12

## Purpose
Read-only reports and dashboards using SQL views/materialized views.

## Owns tables
views/materialized views only

## Public API (`reporting.api`)
/api/v1/reports/*

## Events published
—

## Allowed dependencies
all modules (read-only views)

## Error codes
REPORTING_RANGE_TOO_LARGE

## Module rules
1. Never writes business tables.
2. Large exports are async jobs producing a file in files module.
3. Always filtered by tenant and permitted branches.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
