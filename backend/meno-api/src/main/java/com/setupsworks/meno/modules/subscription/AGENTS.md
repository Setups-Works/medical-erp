# Module `subscription` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P6 · **Features:** PLT-14

## Purpose
Plans, edition limits, usage counters, trials.

## Owns tables
plan, tenant_subscription, usage_counter

## Public API (`subscription.api`)
SubscriptionFacade.limits()

## Events published
PlanChanged

## Allowed dependencies
tenancy::api

## Error codes
SUBSCRIPTION_LIMIT_REACHED

## Module rules
1. Limits are soft-warned at 90 % and enforced at 100 % except for billing (never stop a counter mid-day).

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
