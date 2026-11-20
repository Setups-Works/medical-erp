# Module `compliance` — AGENTS.md

**Owner:** Kamesh · **QA:** Ashok · **Phase:** P4 · **Features:** CMP-01…07

## Purpose
Prescriptions, doctors, Schedule H/H1/X registers, licence checks, banned-drug guard.

## Owns tables
prescription, schedule_register_entry

## Public API (`compliance.api`)
ComplianceGuard.checkSale(lines, rx)

## Events published
—

## Allowed dependencies
catalog::api, files::api, party::api, tenancy::api

## Error codes
COMPLIANCE_RX_REQUIRED, COMPLIANCE_ITEM_BANNED, COMPLIANCE_LICENCE_EXPIRED

## Module rules
1. All rules come from docs/compliance/COMPLIANCE.md confirmed items only.
2. Register entries are immutable.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
