# ADR-0021: PIN codes missing from MENO's list are looked up online (api.postalpincode.in)

- Status: Accepted
- Date: 2026-11-27
- Deciders: Nitheesh

## Context
Address forms (company, branches; later customers, suppliers, doctors) fill state, district and city from a PIN code (PLT-22, VALIDATION_AND_BUSINESS_RULES.md). Until now the only source was `ref_pincode`, loaded by MENO staff from India Post's directory on data.gov.in (`/platform/reference-data`). On staging and on a fresh install the list is empty, and a loaded file is up to a year old, so new PINs are unknown. Asked by Nitheesh (27-11-2026): use `https://api.postalpincode.in/pincode/{pin}`.

## Options considered
1. **List only** (today). + Offline, no outside dependency. − Nothing fills until someone loads the file; new PINs unknown for months.
2. **Online directory only.** + Always fresh, no file to load. − Every address form depends on a free, unofficial service with no SLA; the desktop app has no list offline.
3. **List first, online directory for the rest.** + Works on day one, a loaded list keeps working when the service is down, the desktop app keeps the offline list. − A second source to keep an eye on.

## Decision
Option 3.
- Port `integrations::api.PincodeDirectory`, adapter `integrations.pincode.PostalPincodeAdapter` (`GET /pincode/{pin}`, 5 s timeout, keyless). `MENO_PINCODE_PROVIDER` = `postalpincode` (default) | `none` (list only; tests use it).
- `platform` `ReferenceLookup.pincode`: `ref_pincode` first; on a miss, the directory. Its post offices go through the same rules as a file row (`PincodeFile.fromOffices`: state name → GST state code via the `state` table, most common district, office names as localities). Answers, including "unknown", are kept in memory for 24 h (at most 5,000 PINs); an outage is not cached.
- Only the PIN leaves MENO. Answers are **not** written to `ref_pincode`: the list stays exactly what was loaded from the licensed file (GODL-India).
- The directory being down or not knowing a PIN is the same as today's "unknown": the form says so and the person types city and district. A lookup never blocks saving.
- The reference-data page says when the online lookup is on (`onlineLookup` on the PINCODE dataset).

## Consequences
+ Address forms fill state, district and city choices on staging and new installs without loading a file.
+ Swapping the provider (for example to an official India Post API if one appears) is a new adapter.
− api.postalpincode.in is a free community service with no published SLA or terms. Watch the `PIN directory` warnings in the API log; switch to `none` if it misbehaves.
− The desktop app (P5) works offline only with a loaded list: the online lookup needs the API.
