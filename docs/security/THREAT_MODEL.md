# Threat model

> STRIDE per component plus pharmacy-specific fraud and abuse. Reviewed at every phase gate and for every epic that touches auth, money, stock, sync, files or integrations (SEC-14). Each threat names the control that answers it; controls are catalogued in [SECURITY.md](SECURITY.md) and built by the SEC / PLT features. Owner: Nitheesh · Infra: Jeeva · Tests: Ashok.

## 1. What we protect (assets) and how sensitive it is

| Class | Examples | Impact if leaked / altered |
|---|---|---|
| **Restricted – health** | Prescriptions, patient name/age/address on H1 register, allergies, chronic conditions, ABHA no. | Legal (DPDP, Drugs & Cosmetics rules ⚠), patient harm, reputation |
| **Restricted – financial / identity** | PAN, bank accounts, GSTIN filings, card / UPI references, owner credentials | Fraud, tax exposure |
| **Integrity-critical** | Posted invoices, vouchers, stock movements, Schedule H1 / X / NDPS registers, prices, MRP, GST rates, audit log | Wrong tax, drug-control violations, undetected theft |
| **Confidential – business** | Purchase rates, margins, schemes, customer list, sales by doctor | Competitive harm |
| **Secrets** | JWT signing keys, licence signing key, HMAC pepper, DB credentials, GSP / WhatsApp / payment API keys, device keys | Full compromise |

## 2. Trust boundaries

```
Browser / desktop renderer ──TLS──▶ Nginx/WAF ──▶ meno-api ──▶ PostgreSQL (RLS) / Redis / Blob
Desktop main process ── SQLite (SQLCipher) ── sync ──TLS──▶ meno-api
meno-api ──TLS──▶ GSP/IRP · WhatsApp · SMS · payment gateway · medicine data · email
Super admin / support ──▶ platform console (separate role, MFA, JIT)
CI/CD ──▶ container registry ──▶ VM / cluster
```

## 3. STRIDE by component

| Component | Threat (STRIDE) | Example | Control |
|---|---|---|---|
| Sign-in | **S**poofing | Credential stuffing on owner accounts; phishing of counter staff | Argon2id, throttling + lockout, breached-password check, MFA per role (PLT-35), passkeys for owners, new-device alerts (SEC-13) |
| Sessions | **S**poofing | Stolen refresh token reused | Rotation with reuse detection, device binding, revoke all sessions (PLT-11) |
| Tenant isolation | **I**nfo disclosure | IDOR across tenants via guessed UUID | Tenant from token only, RLS safety net, cross-tenant test per endpoint, S1 incident on any hit |
| API | **D**oS | Bot floods search or sign-up | WAF, per-IP / user / tenant rate limits, request size limits, bot checks on public endpoints (SEC-10) |
| API | **T**ampering | Client sends its own totals or prices | Server recomputes every total; client totals ignored; idempotency keys |
| Posted documents | **T**ampering / **R**epudiation | DB admin edits an invoice or H1 entry after the fact | Hash-chained posted documents and audit log with daily anchors and a verifier (SEC-01, ADR-0016); no UPDATE grant on posted tables |
| Offline desktop | **S**poofing / **T**ampering | Copied SQLite file replayed, forged offline bills | Per-device key pair signs offline bills; server verifies on sync; revoked device rejected; SQLCipher with key in OS keystore (SEC-02, SEC-09) |
| Desktop app | **E**levation | Malicious update or DLL side-loading | Code-signed installer and updates, update signature check, sandboxed renderer, integrity check of the app bundle (SEC-09) |
| Files (Rx, licences, bills) | **T**ampering / **E**levation | Malware in an uploaded PDF; public link to a prescription | Type sniffing, size limits, AV scan, private storage with short signed URLs, separate patient-data vault (SEC-17) |
| Integrations | **I**nfo disclosure | Leaked GSP or WhatsApp API key | Secrets in a vault, least scope, rotation, outbound allowlist, per-integration audit (SEC-04) |
| Webhooks / public API | **S**poofing | Forged webhook to mark an order paid | HMAC-signed webhooks, timestamp + replay window, OAuth client credentials (INT-16) |
| Licensing | **T**ampering | Patched desktop skips licence check | Server always re-checks; Ed25519 certificate; clock-rollback detection (LIC-04, LIC-07) |
| Support access | **E**levation / **I**nfo disclosure | Support engineer browses a tenant without reason | Owner-granted, time-boxed, scoped access; JIT elevation with approval; every action audited and visible to the owner (AUT-14, SEC-06) |
| Platform admin | **E**levation | Compromised super-admin account | Separate admin realm, hardware-key MFA, IP allowlist, break-glass with alert, two-person rule for destructive actions (SEC-06) |
| CI/CD | **T**ampering | Malicious dependency or compromised GitHub token | Pinned deps, SBOM, signed images, protected branches, required reviews, secret scanning, OIDC to cloud (SEC-08, SEC-14) |
| Backups | **I**nfo disclosure / **D**oS | Ransomware deletes backups; backup copied | Encrypted, immutable copies with separate credentials in a second region; restore drills (SEC-15) |
| Logs | **I**nfo disclosure | Patient names or tokens in logs | Structured logging with redaction, no patient data, log access restricted, retention per policy (SEC-07) |
| Exports | **I**nfo disclosure | Staff exports the whole customer list before leaving | Export permission, watermark with user and time, approval for restricted data, bulk-export alert (SEC-11) |

## 4. Pharmacy-specific fraud and abuse

| Abuse | How it happens | Detect / prevent |
|---|---|---|
| Cash skimming | Bill printed, then deleted or voided; cash pocketed | Posted bills cannot be deleted; void = reversal with reason and approval; void and reprint ratios per user (SEC-05, RPT-18) |
| Discount abuse | Large discounts to friends | Role and item caps (PRC-12), manager PIN (POS-21), discount report by user, alert on outliers |
| Fake returns | Return without a bill, refund in cash | Returns only against invoices by default; counter returns policy-gated (RET-09); alert on frequency |
| Expiry write-off theft | Good stock written off as expired | Write-off needs batch proof (expiry date), approval above value, destruction record with witnesses (CMP-14) |
| Price manipulation | MRP or rate edited before a bill, then restored | Price changes are audited and effective-dated; maker-checker on price lists (ADM-19); alert on changes during open shifts |
| Schedule H1 / X diversion | Restricted drugs sold without Rx, register back-filled | Rx captured before save; register generated from sales, not typed; hash-chained register; alert on volume spikes per item |
| Purchase kickbacks | Inflated purchase rates or fake purchases | Rate deviation alerts (PUR-09), PO–GRN–bill match (PUR-14), supplier bank change maker-checker (PTY-20) |
| Stock pilferage | Physical stock disappears | Cycle counts with variance posting (INV-09), shrinkage by item / branch / user, after-hours activity alert |
| Supplier bank-detail fraud | Email asks to change supplier account | Bank changes need a second approver and a call-back note (PTY-20, ADM-19) |
| Account sharing | One password used by the whole counter | Counter PIN per person (PLT-10), device binding, concurrent-session alerts |

Fraud signals are rules with thresholds in configuration (no hard-coded numbers), shown to the owner as alerts and in the exception report.

## 5. Abuse cases that must have automated tests

1. Tenant A reads, writes or lists any object of tenant B → 404 / 403, logged as S1.
2. Billing operator posts a discount above cap without PIN → rejected.
3. Posted invoice modified directly in the DB → chain verifier reports the break.
4. Offline bill from a revoked device or with a bad signature → rejected at sync, owner alerted.
5. Refresh token reused → whole session family revoked.
6. Upload of a disguised executable as a prescription → rejected.
7. Webhook with a wrong signature or old timestamp → rejected.
8. Support user without an active grant opens a tenant → denied and alerted.
9. Export of patient data by a role without permission → denied.
10. 20 failed sign-ins from one IP → throttled; owner alerted on success after failures.

## 6. Residual risks (accepted for the pilot, revisit before Standard tier)

- Single VM hosting (no HA) — mitigated by offline billing and tested restore.
- No external pen test yet — peer test before pilot, CERT-In empanelled VAPT before Standard tier.
- Desktop machines are shop-owned and may be shared or unpatched — SQLCipher, device keys and remote wipe reduce, not remove, the risk.
