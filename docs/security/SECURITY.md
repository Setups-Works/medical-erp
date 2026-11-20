# Security

Owner: Nitheesh (application), Jeeva (infrastructure), Ashok (testing). Threat model reviewed each phase gate.

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

## Infrastructure

SSH key-only, no root login, fail2ban, UFW (80/443 only + SSH from allow-listed IPs), unattended security upgrades, DB firewall allows only the VM, least-privilege DB roles (`meno_owner` for migrations, `meno_app` for runtime, no superuser), daily encrypted backups + monthly restore drill.

## Testing

Per release: OWASP ZAP baseline, permission-matrix tests, cross-tenant suite, dependency scan clean of High/Critical. Before pilot: external or peer pen-test of auth, tenancy, file upload, sync.

## Incident response

Detect (alerts/Sentry) → contain (revoke tokens/devices, block IP) → assess (audit log) → notify Nitheesh immediately; affected tenants within 72 h if personal data involved ⚠ legal → fix + postmortem in `docs/runbooks/incidents/`.
