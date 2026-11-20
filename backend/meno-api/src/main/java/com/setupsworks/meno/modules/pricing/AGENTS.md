# Module `pricing` — AGENTS.md

**Owner:** Kamesh · **QA:** Ashok · **Phase:** P3, P5 · **Features:** PRC-01…09

## Purpose
Price lists, schemes (free qty, %), discount rules, price calculation engine.

## Owns tables
price_list, price_list_item, scheme, discount_rule, price_history

## Public API (`pricing.api`)
PricingEngine.price(PricingRequest) → priced lines

## Events published
—

## Allowed dependencies
catalog::api, party::api, taxation::api

## Error codes
PRICING_ABOVE_MRP, PRICING_DISCOUNT_LIMIT

## Module rules
1. Must pass every case in contracts/test-vectors/pricing and /schemes.
2. Never price above MRP.
3. Pure functions where possible; no I/O inside the calculation.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
