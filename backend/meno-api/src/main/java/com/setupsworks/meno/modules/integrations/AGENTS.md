# Module `integrations` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Features:** INT-17 (GSTIN), PLT-22 (online PIN directory, ADR-0021), later INT-01 (GSP), INT-02 (WhatsApp / SMS)

## Purpose
Adapters to outside services behind ports in `integrations.api`. Other modules never call a provider directly; swapping a provider is a new adapter.

## Built so far (26-11-2026)
- `api/GstinVerifier` port (`GstinDetails`, `GstinLookupException` with NOT_FOUND / RATE_LIMITED / UNAVAILABLE).
- `gst/GstVerifyAdapter` — candidate provider from GSTIN_FETCH.md §2 (basic details, no key), 8 s timeout, provider codes → ours. Chosen by `MENO_GSTIN_PROVIDER` = `none` (default: every lookup UNAVAILABLE → manual entry) or `gstverify`. Provider **not decided** (R-31, Hub #999) ⚠: don't enable in production until it is.
- Tests: `GstVerifyAdapterTest` against a local stub server (no live calls in CI).
- `api/PincodeDirectory` port (post offices of a PIN; `PincodeLookupException` when the directory can't be reached) and `pincode/PostalPincodeAdapter` for api.postalpincode.in (`GET /pincode/{pin}`, keyless, 5 s timeout; HTTP 200 with `Status: Error` = unknown PIN). Chosen by `MENO_PINCODE_PROVIDER` = `postalpincode` (default) or `none` (tests). Used by `platform` only for PINs missing from `ref_pincode`. Test: `PostalPincodeAdapterTest` (stub server).

## Rules
1. Only the GSTIN or the PIN leaves MENO; never personal data.
2. Keys come from Key Vault / app settings, never git.
3. Every adapter has timeouts and maps provider errors to the port's failures.

## Allowed dependencies
— (other modules depend on `integrations::api`)
