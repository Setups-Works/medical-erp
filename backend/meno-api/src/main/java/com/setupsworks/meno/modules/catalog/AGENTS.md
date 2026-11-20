# Module `catalog` — AGENTS.md

**Owner:** Kamesh · **QA:** Ashok · **Phase:** P2 · **Features:** CAT-01…14

## Purpose
Item (medicine) master, manufacturers, compositions, HSN, units, barcodes, categories, rack locations, substitutes, banned list.

## Owns tables
item, manufacturer, composition, item_composition, hsn, category, barcode, item_branch_setting, substitute_group, banned_drug

## Public API (`catalog.api`)
CatalogFacade.findItem(id), search(q), itemSnapshot(id)

## Events published
ItemChanged

## Allowed dependencies
taxation::api, tenancy::api

## Error codes
CATALOG_DUPLICATE_BARCODE, CATALOG_ITEM_INACTIVE, CATALOG_ITEM_BANNED

## Module rules
1. Search must use trigram index; p95 < 150 ms for 50k items.
2. Schedule and Rx flags are mandatory for medicines.
3. Never hard-delete items with stock or history — deactivate.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
