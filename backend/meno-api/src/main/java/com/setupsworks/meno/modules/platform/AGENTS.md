# Module `platform` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P2 · **Features:** PLT-22 · **ADR:** 0020

## Purpose
MENO staff realm (sign-in, platform permissions) and shared reference lists every tenant reads (PIN codes, IFSC).

## Owns tables
platform_user, platform_permission, platform_user_permission, reference_dataset, reference_dataset_load, ref_pincode, ref_ifsc (V202611272000)

## Public API (`platform.api`)
`ReferenceLookup.pincode(pin)` / `.ifsc(code)` for address and bank forms in other modules.

## Endpoints
- `POST /api/v1/platform/auth/login`, `GET /api/v1/platform/auth/me` (staff; token `realm=platform`, 1 h, no refresh)
- `GET /api/v1/platform/reference-data` (`platform.reference.view`), `GET …/{code}/loads` (last 20), `POST …/{code}/loads` multipart `file` + `sourceDate` + `replaceAnyway` (`platform.reference.manage`)
- `GET /api/v1/reference/pincodes/{pin}`, `GET /api/v1/reference/ifsc/{ifsc}` (any tenant user)

## Rules
- Platform tokens work only under `/api/v1/platform/**`; tenant tokens never do (`security/PlatformRealm`). Permissions come from the token via `security/PlatformAccess`, never from tenant roles.
- A load replaces the whole list in one transaction; readers see the old list until commit. Every attempt (loaded or refused) is a `reference_dataset_load` row with file hash, counts and up to 50 sample problems.
- Refused: missing required columns, no usable rows, or fewer rows than `meno.platform.min-retained-ratio` (0.5) of today's list unless `replaceAnyway`.
- PIN file: India Post directory (one row per post office) grouped per PIN; state name must match the `state` table (letters only, "&" = "and", leading "The" ignored), else the row is skipped. Most common district wins; office names (minus S.O / B.O / H.O / G.P.O) become `localities`.
- IFSC file: RBI or mirror CSV columns; IFSC `^[A-Z]{4}0[A-Z0-9]{6}$`, bank and branch required, first of a repeated IFSC wins.
- Sources, licences and cadence are data in `reference_dataset` (R-30 / R-21 / R-28 not signed off). HSN, ceiling prices and banned drugs are listed with `loadable = false`; their modules load them later.

## Error codes
PLATFORM_INVALID_CREDENTIALS (401), PLATFORM_ACCOUNT_DISABLED (403), PLATFORM_LOCKED (423), REFERENCE_DATASET_NOT_FOUND (404), REFERENCE_DATASET_NOT_LOADABLE (409), REFERENCE_LOAD_SHRINKS (409), REFERENCE_FILE_COLUMNS_MISSING / REFERENCE_FILE_NO_ROWS / REFERENCE_FILE_EMPTY / REFERENCE_FILE_UNREADABLE / REFERENCE_SOURCE_DATE_FUTURE (400), REFERENCE_PINCODE_NOT_FOUND / REFERENCE_IFSC_NOT_FOUND (404)

## Allowed dependencies
— (shared `security`, `common` only)

## Not built yet
Staff management screen, MFA (SEC-06), scheduled auto-download from data.gov.in / RBI, address and bank forms calling the lookups (company / branch / party screens).
