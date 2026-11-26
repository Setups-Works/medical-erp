# Module `integrations` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Features:** INT-17 (GSTIN), later INT-01 (GSP), INT-02 (WhatsApp / SMS)

## Purpose
Adapters to outside services behind ports in `integrations.api`. Other modules never call a provider directly; swapping a provider is a new adapter.

## Built so far (26-11-2026)
- `api/GstinVerifier` port (`GstinDetails`, `GstinLookupException` with NOT_FOUND / RATE_LIMITED / UNAVAILABLE).
- `gst/GstVerifyAdapter` — candidate provider from GSTIN_FETCH.md §2 (basic details, no key), 8 s timeout, provider codes → ours. Chosen by `MENO_GSTIN_PROVIDER` = `none` (default: every lookup UNAVAILABLE → manual entry) or `gstverify`. Provider **not decided** (R-31, Hub #999) ⚠: don't enable in production until it is.
- Tests: `GstVerifyAdapterTest` against a local stub server (no live calls in CI).

## Rules
1. Only the GSTIN leaves MENO; never personal data.
2. Keys come from Key Vault / app settings, never git.
3. Every adapter has timeouts and maps provider errors to the port's failures.

## Allowed dependencies
— (other modules depend on `integrations::api`)
