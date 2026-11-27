# GSTIN fetch (PTY-15, INT-17)

> Status: **endpoint built 26-11-2026** (`GET /api/v1/gstin-verifications/{gstin}`, `party` + `integrations`), provider switch `MENO_GSTIN_PROVIDER` = `none` (default) | `gstverify`. Fetch buttons on the forms and the audit table are still to do. Provider **not decided** ⚠ (R-31): Jeeva compares providers and Nitheesh decides in P2. Live learning demo: MENO Hub → Learn → Day 22. Field rules: [MASTER_FIELDS.md](MASTER_FIELDS.md) §1.1 and §1.5.

## 1. What it does

On the supplier and customer forms, the user types a GSTIN and presses **Fetch**. MENO verifies it with a GST verification provider and fills name, legal name, billing address, state, PAN, GST registration type and GST status. Everything stays editable except legal name and status. A cancelled or suspended GSTIN warns at purchase and sale (PTY-15). If the provider is down, the user types the details by hand: **saving never depends on the provider**.

## 2. Candidate provider: GST verify API (checked live 25-11-2026)

| | |
|---|---|
| Request | `GET https://api.gstverify.dubey.app/api/v1/gst/details?gstin={gstin}&full=false` |
| Auth | None for `full=false` (basic details). `full=true` → **403** "API key or sign in required" |
| Not found / wrong GSTIN | **400** `{"success": false, "detail": "Invalid GSTIN / UID"}` (same answer for both) |
| CORS | None: can't be called from a browser, which suits us (server-side only) |
| Unknown ⚠ | Terms of use, rate limits, uptime / SLA, paid-plan cost, data retention. It is an unofficial third-party service; R-31 prefers one contract with the e-invoice GSP (INT-01) |

Real response (basic details):

```json
{ "success": true, "credits_used": 0.0, "credits_remaining": null,
  "data": { "gstin": "33AAJCN0778N1ZZ",
    "lgnm": "NATURESJOY HERBAL COSMETICS PRIVATE LIMITED", "tradeNam": "NATURESJOY HERBAL COSMETICS PRIVATE LIMITED",
    "sts": "Active", "rgdt": "12/12/2023", "ctb": "Private Limited Company", "dty": "Regular",
    "stj": "State - Tamil Nadu,Division - KANCHEEPURAM,Zone - Poonamallee,Circle - PORUR",
    "ctj": "State - CBIC,Zone - CHENNAI,Commissionerate - CHENNAI-SOUTH,Division - PORUR,Range - RANGE I (Jurisdictional Office)",
    "cxdt": "", "einvoiceStatus": "No",
    "nba": ["Supplier of Services", "Retail Business", "Wholesale Business", "Factory / Manufacturing"],
    "principal_address": "NO. 5, AGS COLONY, THILAGAR NAGAR, ALWATHIRU NAGAR, Chennai, Chennai, Tamil Nadu, 600087",
    "structured_address": { "address_line1": "NO. 5, AGS COLONY", "address_line2": "THILAGAR NAGAR, ALWATHIRU NAGAR, Chennai",
      "city": "Chennai", "state": "Tamil Nadu", "pincode": "600087" } } }
```

## 3. Field map

| Provider field | MENO field | Tab | Editable |
|---|---|---|---|
| `tradeNam` (else `lgnm`) | Name, print name | Books | Yes |
| `lgnm` | Legal name | Books | No |
| `structured_address.address_line1/2`, `pincode` | Billing address line 1, line 2, PIN (state, district, city then come from the PIN master, PLT-22) | Books | Yes |
| GSTIN chars 1–2 | State code → place of supply (CGST + SGST vs IGST) | GST | Derived |
| `dty` | GST registration type, mapped to the configured list (Regular / Composition / SEZ…) | GST | Yes |
| `sts`, `cxdt` | GST status (Active / Cancelled / Suspended), cancellation date | GST | No |
| GSTIN chars 3–12 | PAN | Income tax | Derived |
| `rgdt`, `ctb`, `nba`, `einvoiceStatus`, `stj`, `ctj` | Portal facts, stored read-only with the fetch | GST | No |
| — | Contacts, drug licences, bank, MSME, TDS, credit terms, party type | other tabs | User |

Every filled field is marked "From GST portal" until the user edits it. The party keeps `gst_source`, `gst_fetched_at` and the status at that time (audit).

## 4. Checks before any provider call (web and API)

1. Pattern `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$`.
2. State code exists in the state master.
3. Characters 3–12 are a valid PAN pattern.
4. Check character: base-36 values of characters 1–14, weights 1, 2, 1, 2…; sum the two base-36 digits of each product; check = (36 − sum mod 36) mod 36.

All four run in the browser (Zod, `packages/validation`) **and** again in meno-api (Bean Validation). A GSTIN that fails never reaches the provider.

## 5. API (meno-api)

`GET /api/v1/gstin-verifications/{gstin}` · module `party` · permission `party.supplier.create` or `party.customer.create` · tenant from the token.

```json
200 { "gstin": "33AAJCN0778N1ZZ", "legalName": "…", "tradeName": "…", "status": "ACTIVE", "registrationType": "REGULAR",
      "registeredOn": "2023-12-12", "cancelledOn": null, "constitution": "Private Limited Company",
      "natureOfBusiness": ["…"], "eInvoiceEnabled": false, "stateCode": "33", "pan": "AAJCN0778N",
      "address": { "line1": "…", "line2": "…", "city": "Chennai", "pin": "600087" },
      "source": "gstverify", "fetchedAt": "2026-11-25T14:55:28Z" }
```

| Problem `code` | HTTP | When | User sees |
|---|---|---|---|
| `PARTY_GSTIN_INVALID` | 422 | Fails a check in §4 | "Check the GSTIN: …" with the failing check |
| `PARTY_GSTIN_NOT_FOUND` | 404 | Provider says invalid / unknown | "The GST portal doesn't know this GSTIN." |
| `PARTY_GSTIN_RATE_LIMITED` | 429 | Provider or our own limit | "Too many lookups. Try again in a minute." |
| `PARTY_GSTIN_SERVICE_UNAVAILABLE` | 503 | Timeout, 5xx, provider plan ended | "Couldn't verify now. Enter the details by hand." |

## 6. How it is built

```
web party form ──► meno-api party: GstinVerificationController → GstinVerificationService
                                     │  (validates §4, permission, rate limit per tenant)
                                     ▼
                   integrations: GstinVerifier port ──► GstVerifyAdapter (INT-17) ──► provider
                                     │  key from Key Vault (if the chosen plan needs one), 8 s timeout,
                                     │  one reused HTTP client, provider codes → our codes
                                     ▼
                   cache by GSTIN (24 h ⚠ confirm), audit row: who, tenant, GSTIN, source, result status
```

- `party` depends only on the `GstinVerifier` interface in `integrations/api` (module rule 2). Swapping the provider = a new adapter, no change in `party`.
- Web and desktop never call the provider. Offline desktop: Fetch is disabled with "Needs internet"; the form works by hand and the party syncs later.
- Only the GSTIN is sent to the provider. Never send personal data (customer phone, patient details).
- Cancelled GSTIN: can't be saved on an active party; Suspended: saved with a warning; both warn at purchase and sale entry.

## 7. Tests

- Unit: the §4 checks (valid sample `33AAJCN0778N1ZZ`, `27AAPFU0939F1ZV`; wrong check character `33AAJCN0778N1ZA`; unknown state `99…`), status and registration-type mapping.
- Adapter: recorded responses for 200, 400, 403, 429, timeout (WireMock); no live calls in CI.
- Integration (Testcontainers): endpoint permission, cross-tenant access test, rate limit, audit row written.
- E2E (Playwright, mocked API): Fetch fills Books, address, PAN and GST tabs; cancelled GSTIN blocks save; provider down → manual entry still saves.

## 8. Who does what

| Step | Who | Phase | Hub |
|---|---|---|---|
| Compare GSTIN verification providers (this API, the e-invoice GSP's GSTIN search, verification vendors) | Jeeva | P2 | plan task |
| Decide the provider, update R-31, record an ADR | Nitheesh | P2 | plan task |
| INT-17 adapter in `integrations` | Nitheesh | P3 | feature task |
| PTY-15 endpoint in `party` + Fetch on the supplier and customer forms | Kamesh (backend), Ashok (frontend) | P3 | feature task |
| QA of PTY-15 | Prakalya | P3 | QA task |
