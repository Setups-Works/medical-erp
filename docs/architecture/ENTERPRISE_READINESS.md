# Enterprise readiness: the standards MENO is held to

> What turns a pharmacy billing app into enterprise software a 50-store chain or a large distributor can trust. Every target here is a number someone can test; every number lives in configuration or an SLO file, not in code. Owners: Nitheesh (platform, security), Jeeva (infrastructure, reliability), Ashok (performance and accessibility testing), Prakalya (support process). Features: FEATURES §31. ⚠ = confirm before committing to a customer.

## 1. Service tiers

| Tier | Who | Availability target | RPO / RTO | Support | Hosting |
|---|---|---|---|---|---|
| **Pilot** | 1–5 friendly shops | 99.0 % monthly (business hours focus) | 15 min / 4 h | Business hours, WhatsApp + phone | Current single-VM Docker Compose (AZURE_DEPLOYMENT.md) |
| **Standard** | Paying single-store and small chains | 99.5 % | 15 min / 2 h | 9–9 six days, P1 response 1 h | Managed PostgreSQL with PITR, 2 app nodes |
| **Enterprise** | Chains 10+ stores, large distributors | 99.9 % | 5 min / 1 h | 24×7 for P1, named account manager, quarterly review | Multi-zone, read replica, separate tenant DB option |

Counter billing never depends on these numbers alone: the desktop app keeps billing offline and syncs later (OFFLINE_SYNC.md), so a cloud outage stops reports, not sales.

The current Azure student plan fits **Pilot only**. Moving to Standard needs an ADR (managed database, paid subscription, backups in a second region) before the first paying customer.

## 2. Performance budgets (enforced in CI, PLT-43)

| Action | Budget | Measured on |
|---|---|---|
| POS keystroke to screen | ≤ 50 ms | 4 GB RAM counter PC, desktop app |
| Item search (name / salt / barcode) | p95 ≤ 150 ms | API, 50k items per tenant |
| Save & print POS bill (online) | p95 ≤ 500 ms server, ≤ 1.5 s to printer | API + desktop |
| Save bill offline | ≤ 200 ms | desktop SQLite |
| Page first load | ≤ 2 s | 4 GB PC, 10 Mbps |
| Report up to 10k rows | ≤ 3 s, larger ones become export jobs | API |
| Sync of 500 offline bills | ≤ 60 s after reconnect | desktop → API |

A pull request that breaks a budget fails CI (k6 for API, Playwright traces for screens).

## 3. Scale assumptions (design for, then test)

Per tenant: 200 users, 50 branches, 200 devices, 500k items incl. batches, 10M movements a year, 20k bills a day. Platform: 5,000 tenants on shared schema with RLS; any tenant can be moved to its own database (enterprise option) without code changes.

## 4. Security controls

| Control | Standard | Feature |
|---|---|---|
| Sign-in | Password policy per tenant, MFA mandatory for owner / admin / accountant roles, idle timeout, device binding for counters | PLT-35, PLT-09, PLT-11 |
| SSO | SAML 2.0 and OIDC (Microsoft Entra ID, Google Workspace), enforce-SSO switch, just-in-time users | PLT-33 |
| Provisioning | SCIM 2.0 create / disable users from the customer's directory | PLT-34 |
| Sensitive data | PAN, bank account, patient health fields encrypted at field level, masked in lists and exports unless permitted, keys rotated yearly | PLT-36 |
| Network | IP allowlist per branch / role | PLT-20 |
| Change control | Maker-checker on tax settings, series, posting rules, bank details, price lists | ADM-19 |
| Audit | Every write, sign-in and export; customer can export or stream to their SIEM | PLT-12, ADM-18 |
| Testing | Annual VAPT by a CERT-In empanelled auditor, OWASP ASVS L2 checklist per release, dependency and container scanning in CI | PLT-44 |
| Incidents | Report to CERT-In within 6 hours, keep ICT logs 180 days in India (CERT-In directions 2022) ⚠ verify current text | PLT-44 |
| Certification path | ISO 27001 readiness in year 1, audit when the first enterprise customer requires it ⚠ | PLT-44 |

## 5. Data protection and residency

All tenant data and backups stay in Indian regions. A tenant can export everything (PLT-17) and, on exit, request deletion with a deletion certificate, except records the law requires us to keep, which are listed in the certificate (PLT-37, ADM-09). DPDP: notices, consent, rights requests (CMP-07) ⚠ lawyer.

## 6. Reliability engineering

- **SLOs** per service in `infrastructure/monitoring/slo.yaml`: availability, p95 latency, sync lag, e-invoice queue age. Error budgets decide when feature work pauses.
- **Backups**: PostgreSQL PITR + nightly full, copy in a second region; monthly restore drill timed against RTO (PLT-41).
- **Releases**: feature flags per tenant and release channels (early access, stable); desktop staged rollout 5 % → 25 % → 100 % with automatic halt on crash rate (PLT-39, DSK-01).
- **Status**: public status page, maintenance windows announced 72 h ahead, in-app banner (ADM-16).
- **Customer view**: tenant health page (device sync lag, failed jobs, e-invoice queue, licence state) (PLT-40).

## 7. Support and success

Priority levels P1 (billing stopped) to P4 (question); response targets per tier (§1); ticket portal (ADM-11) with SLA timers (ADM-17); sandbox tenant to try changes safely (PLT-38); in-app training (ADM-13); release notes in the app.

## 8. Integration standards

Versioned public API (`/api/v1`, deprecation notice ≥ 6 months), OAuth 2.0 client credentials, per-client rate limits, `Idempotency-Key` on every write, bulk endpoints for masters, webhooks with signed payloads and retries, developer portal with OpenAPI docs and a sandbox (INT-16, ADM-12).

## 9. Accessibility and language

WCAG 2.1 AA for web and desktop; full keyboard operation (already a POS rule); screen-reader labels; contrast checked in CI; accessibility statement page (PLT-42). UI language packs (PLT-18): English first, Tamil and Hindi next; printed documents in English plus an optional second language ⚠.

## 10. Customer branding (chains)

Logo, accent colour, custom domain for the retailer portal and customer app, branded emails and WhatsApp templates (ADM-20).
