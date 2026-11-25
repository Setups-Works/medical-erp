# Security

Owner: Nitheesh (application), Jeeva (infrastructure), Ashok (testing). Threat model: [THREAT_MODEL.md](THREAT_MODEL.md), reviewed each phase gate and for every epic touching auth, money, stock, sync, files or integrations. Enterprise targets: [ENTERPRISE_READINESS.md](../architecture/ENTERPRISE_READINESS.md). Features: FEATURES §31–§32.

## Authentication

- Passwords hashed with **Argon2id** (Spring Security `Argon2PasswordEncoder`); min 10 chars, breached-password check (k-anonymity) optional P5.
- Access token: JWT (15 min, signed RS256 or ES256, key rotation via `kid`). Refresh token: opaque, 30 days, **rotated on every use**, reuse detection revokes the family. Stored hashed.
- Web: tokens in `HttpOnly; Secure; SameSite=Strict` cookies (same origin via Nginx) + CSRF token for state-changing requests. Desktop: tokens in OS keychain via Electron `safeStorage`.
- Login throttling + lockout after 10 failures (15 min). 2FA TOTP for admins (P5).
- Offline desktop login: PIN hash, valid N days since last online login (see OFFLINE_SYNC.md).

## Authorisation

Permission strings `module.resource.action` (e.g. `inventory.adjustment.approve`). Roles are bundles of permissions, editable per tenant. Branch scoping via `user_branch`. Checks happen in services (not only controllers). Approval limits (discount %, credit override) are data, not code.

## Tenant isolation

See [MULTI_TENANCY.md](../architecture/MULTI_TENANCY.md). Any cross-tenant read is an **S1** incident.

## Data protection

- TLS 1.2+ everywhere (Let's Encrypt on Nginx; DB connections `sslmode=require`).
- Azure PostgreSQL and Blob encrypted at rest; backups encrypted; desktop SQLite encrypted (SQLCipher).
- Personal data minimised: patient name/age only where law requires (H1 register, Rx). No Aadhaar. Prescription files in private blob containers with short-lived signed URLs.
- Logs: structured JSON, **no passwords, tokens, patient names, prescription content**. Mask phone numbers.
- DPDP Act 2023: privacy notice, purpose limitation, deletion requests workflow (except records the law requires us to keep) ⚠ legal review.

## Application security

- Input validation (Bean Validation + Zod), parameterised queries only (JPA/Criteria; no string SQL), output encoding by React.
- Security headers via Nginx: HSTS, CSP (`default-src 'self'`), X-Content-Type-Options, Referrer-Policy, frame-ancestors none.
- File uploads: type sniffing, size limits, virus scan (ClamAV container, P5), never served from the API domain path directly.
- Electron: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, narrow preload API, signed installers, update feed over HTTPS with signature check.
- Dependencies: Dependabot + `mvn dependency-check`/Trivy + `pnpm audit` in CI; CodeQL.
- Secrets: GitHub Environments + VM `.env` (root-only, 600); rotation runbook. Never in git, never in logs.
- Licensing (LICENSING.md, ADR-0015): license keys stored only as `HMAC-SHA256(pepper, key)`, shown once, logged as last 4 characters only; activation rate-limited; Ed25519 certificate-signing key and the HMAC pepper are secrets with a rotation runbook (`kid`); the server always re-checks the license in the database, the certificate is for offline use and display only.

## Infrastructure

SSH key-only, no root login, fail2ban, UFW (80/443 only + SSH from allow-listed IPs), unattended security upgrades, DB firewall allows only the VM, least-privilege DB roles (`meno_owner` for migrations, `meno_app` for runtime, no superuser), daily encrypted backups + monthly restore drill.

## Testing

Per release: OWASP ZAP baseline, permission-matrix tests, cross-tenant suite, dependency scan clean of High/Critical. Before pilot: external or peer pen-test of auth, tenancy, file upload, sync.

## Incident response

Detect (alerts/Sentry) → contain (revoke tokens/devices, block IP) → assess (audit log) → notify Nitheesh immediately; affected tenants within 72 h if personal data involved ⚠ legal → fix + postmortem in `docs/runbooks/incidents/`.


## Controls catalogue (enterprise level)

Each control maps to OWASP ASVS 4.0 (L2) and ISO 27001:2022 Annex A so a customer's security questionnaire can be answered from this table. Feature IDs show who builds it.

| # | Control | Detail | ASVS | ISO 27001 | Feature |
|---|---|---|---|---|---|
| 1 | Strong authentication | Argon2id, breached-password check, MFA per role, passkeys (WebAuthn) for owners and admins, new-device / location alerts | V2 | A.5.17, A.8.5 | PLT-35, SEC-13 |
| 2 | Federated identity | SAML / OIDC SSO, enforce-SSO, SCIM de-provisioning within 15 min | V2 | A.5.16 | PLT-33, PLT-34 |
| 3 | Session security | Short JWT, rotating refresh with reuse detection, device binding, idle timeout, sign out everywhere | V3 | A.8.5 | PLT-11, PLT-35 |
| 4 | Authorisation | Permission checks in services, branch scoping, approvals as data, maker-checker on sensitive settings | V4 | A.5.15, A.8.3 | PLT-07, ADM-19 |
| 5 | Tenant isolation | Token-derived tenant, RLS, cross-tenant test per endpoint, optional dedicated DB for enterprise | V4 | A.8.3 | (MULTI_TENANCY.md) |
| 6 | Input / output safety | Bean Validation + Zod, parameterised SQL, CSP, file sniffing and AV scan | V5, V12 | A.8.28 | (rule 12) |
| 7 | Cryptography and keys | TLS 1.2+ (1.3 preferred), envelope encryption with per-tenant data keys wrapped by a cloud KMS / Key Vault master key, yearly rotation, crypto-shredding on tenant exit | V6 | A.8.24 | SEC-03 |
| 8 | Secrets | Key Vault (no secrets on disk), short-lived DB credentials, rotation schedule, secret scanning in CI | V6, V14 | A.8.24 | SEC-04 |
| 9 | Field-level protection | PAN, bank, health fields encrypted and masked; export watermarking; restricted-data export approval | V6, V8 | A.8.11, A.8.12 | PLT-36, SEC-11 |
| 10 | Tamper evidence | Hash-chained posted documents, statutory registers and audit log; daily anchor; verifier for auditors (ADR-0016) | V7 | A.8.15 | SEC-01 |
| 11 | Offline integrity | Device key pairs sign offline bills; server verifies; revoked devices rejected; remote wipe | V7 | A.8.1 | SEC-02, SEC-09 |
| 12 | Logging and detection | Central logs with redaction, detection rules (brute force, token reuse, mass export, cross-tenant attempt, impossible travel), alerting, 180-day retention in India ⚠ | V7 | A.8.15, A.8.16 | SEC-07 |
| 13 | Fraud detection | Insider-fraud rules (voids, discounts, returns, write-offs, price edits, after-hours), thresholds in configuration | — | A.5.7 | SEC-05 |
| 14 | Privileged access | Separate admin realm, hardware-key MFA, JIT elevation with approval, two-person rule for destructive actions, break-glass alert | V4 | A.8.2, A.8.18 | SEC-06 |
| 15 | API protection | WAF, rate limits per IP / user / tenant, size limits, CORS lockdown, signed webhooks with replay window | V13 | A.8.20 | SEC-10, INT-16 |
| 16 | Desktop hardening | Code-signed installer and updates, sandboxed renderer, bundle integrity check, SQLCipher key in OS keystore, idle lock | V10, V14 | A.8.19 | SEC-09 |
| 17 | Secure SDLC | Threat-model review per epic, CodeQL / Semgrep, ZAP, gitleaks, IaC scan, security sign-off for auth / money / sync PRs | V1, V14 | A.8.25–A.8.29 | SEC-14 |
| 18 | Supply chain | Pinned dependencies, SBOM (CycloneDX) per build, signed images (cosign), protected branches, required reviews, SLSA level 2 provenance | V14 | A.5.19–A.5.22 | SEC-08 |
| 19 | Backup and recovery | Encrypted PITR, immutable second-region copies with separate credentials, restore drills | — | A.8.13, A.5.30 | SEC-15, PLT-41 |
| 20 | Patient data vault | Prescriptions and patient fields in a separate encrypted store, access logged with purpose, retention auto-delete ⚠ | V8 | A.5.34 | SEC-17 |
| 21 | Vulnerability management | Dependency and container scans, patch SLAs (critical 7 days, high 30 days), annual VAPT by a CERT-In empanelled auditor | V14 | A.8.8 | PLT-44 |
| 22 | Incident response | Runbooks, severity levels, CERT-In reporting window ⚠, customer notification, post-mortem | — | A.5.24–A.5.28 | PLT-44 |
| 23 | Disclosure and trust | security.txt, disclosure policy, trust centre with security pack (whitepaper, VAPT summary, DPA, sub-processors) | — | A.5.5 | SEC-16, SEC-18 |

## Data classification

| Class | Examples | Rules |
|---|---|---|
| Restricted – health | Prescriptions, H1 patient details, allergies, ABHA | Vault, purpose-logged access, never in logs, export needs approval |
| Restricted – financial | PAN, bank accounts, payment references | Field encryption, masked, maker-checker on change |
| Confidential | Rates, margins, customers, sales | Role-based, export watermarked |
| Internal | Masters, settings | Role-based |
| Public | Store page, status page | — |

## Patch and response targets

| Severity | Fix in production |
|---|---|
| Critical (CVSS ≥ 9, or tenant isolation / auth bypass) | 24 h mitigation, 7 days fix |
| High | 30 days |
| Medium | 90 days |
| Low | Next planned release |
