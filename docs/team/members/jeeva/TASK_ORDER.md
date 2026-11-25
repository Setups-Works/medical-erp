# Jeeva — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**105 tasks** · P0: 5 · P1: 9 · P2: 8 · P3: 6 · P4: 14 · P5: 40 · P6: 12 · P7: 11

## P0 · Foundation (5)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | ✅ GitHub org/repo `meno`, branches `main` + `develop`, protection rules, CODEOWNERS, labels, Projects board | Groundwork | — |
| 2 | ✅ Azure: subscription check, resource group `rg-meno-staging`, budget alerts | Groundwork | — |
| 3 | ✅ Design docs: CI pipeline, environments, naming (`docs/deployment/ENVIRONMENTS.md`) | Groundwork | — |
| 4 | ✅ Learn: Docker, Compose, GitHub Actions, Nginx, Linux basics, Azure CLI/Bicep | Groundwork | — |
| 5 | ✅ Replace placeholder GitHub handles in `.github/CODEOWNERS` and turn on branch protection | Readiness | — |

## P1 · Platform core (9)

| Step | Task | Type | With |
|---|---|---|---|
| 6 | `docker-compose.yml`: postgres, redis, minio, mailpit (+ api, web profiles) | Groundwork | — |
| 7 | Dockerfiles: `meno-api` (layered JAR, non-root), `web` (static → nginx) | Groundwork | — |
| 8 | CI: backend verify, frontend typecheck/test/lint/design, Modulith test, dependency + image scan (Trivy), CodeQL | Groundwork | — |
| 9 | Staging VM (Bicep), Docker, Nginx + Let's Encrypt, GHCR pull, deploy workflow on `develop` | Groundwork | — |
| 10 | Azure PostgreSQL Flexible (staging), firewall to VM only | Groundwork | — |
| 11 | SEC-04 Secrets management: all secrets in Key Vault, none on disk or in env files, short-lived DB credentials, rotation schedule, secret scanning in CI | Feature | Nitheesh |
| 12 | SEC-14 Secure SDLC gates: threat-model review per epic, SAST (CodeQL / Semgrep), DAST (ZAP), secret scanning, IaC scanning, security sign-off for auth / money / sync / file PRs, abuse-case tests from THREAT_MODEL.md §5 | Feature | Ashok |
| 13 | Create `.env` files for local/staging from `infrastructure/env/*.example`; store secrets in GitHub Environments | Readiness | — |
| 14 | Staging reachable over HTTPS with a real domain and TLS certificate | Readiness | — |

## P2 · Masters (8)

| Step | Task | Type | With |
|---|---|---|---|
| 15 | Observability: Prometheus, Grafana dashboards (JVM, HTTP, DB), Loki logs, Sentry projects | Groundwork | — |
| 16 | Daily `pg_dump` backup to Blob + 7/4/3 retention (daily/weekly/monthly); restore script | Groundwork | — |
| 17 | Seed/reset staging data job | Groundwork | — |
| 18 | Compare Indian medicine data sources for CAT-10 / INT-11 (DrugDB API paid-plan quote, Kaggle A–Z dataset licence, GS1 India DataKart, other licensed drug databases, NPPA / CDSCO lists): coverage, barcode lookup, API, update frequency, cost, licence terms; share with Nitheesh (start from Hub → Learn → Day 19) | Groundwork | — |
| 19 | Compare GSTIN verification providers for PTY-15 / INT-17 (the GST verify API `api.gstverify.dubey.app` tried in Hub → Learn → Day 22, the GSTIN search of the e-invoice GSP shortlisted for INT-01, verification vendors from R-31): fields returned, cancelled / suspended status, rate limits, uptime, terms, data retention, cost; share with Nitheesh (spec: `docs/product/GSTIN_FETCH.md`) | Groundwork | — |
| 20 | PLT-22 Reference data: PIN code directory (state, district, city) and IFSC directory (bank, branch), loaded from public sources with scheduled refresh (verify) licence check | Feature | Kamesh |
| 21 | Daily database backup to Blob Storage with a tested restore script | Readiness | — |
| 22 | Grafana dashboards + Loki logs + Sentry for API and web | Readiness | — |

## P3 · Purchase & inventory (6)

| Step | Task | Type | With |
|---|---|---|---|
| 23 | Test-vector parity CI job (Java + TS) | Groundwork | — |
| 24 | Production VM + DB provisioned (private), deploy workflow with manual approval on `main` | Groundwork | — |
| 25 | INT-04 Distributor file formats (CSV templates per major distributor) | Feature | Nitheesh |
| 26 | INT-11 Indian medicine data adapter in `integrations`: server-side client for the source chosen under CAT-10 (lookup by EAN-13 barcode, brand and salt), key in secrets, shared cache, records source + source id + fetched date on anything it fills (verify) provider and licence | Feature | Nitheesh |
| 27 | SEC-08 Supply-chain security: pinned dependencies, SBOM per build (CycloneDX), signed container images, protected branches with required reviews, build provenance (SLSA L2) | Feature | — |
| 28 | Production VM and database provisioned (private, not public yet) | Readiness | — |

## P4 · Retail POS & returns (14)

| Step | Task | Type | With |
|---|---|---|---|
| 29 | electron-builder: Windows NSIS installer, code signing plan, auto-update feed (GitHub Releases) | Groundwork | — |
| 30 | Release workflow: tag → images + desktop build → changelog | Groundwork | — |
| 31 | Performance test environment for Ashok | Groundwork | — |
| 32 | Compare GSP/IRP providers (cost, API, sandbox) and share with Nitheesh | Groundwork | — |
| 33 | PLT-39 Feature flags and release channels: per-tenant flags, early-access and stable channels, staged desktop rollout with automatic halt on crash rate | Feature | Nitheesh |
| 34 | PLT-43 Performance budgets in CI: POS keystroke ≤ 50 ms, item search p95 ≤ 150 ms, bill save p95 ≤ 500 ms, page load ≤ 2 s on a 4 GB PC; failing budget fails the build | Feature | Ashok, Nitheesh |
| 35 | DSK-01 Windows installer (and macOS), auto-update with staged rollout | Feature | Nitheesh, Meyyarivu |
| 36 | DSK-03 Thermal/A4 printing without browser dialog, printer profiles per counter | Feature | Nitheesh, Meyyarivu |
| 37 | DSK-04 USB/HID barcode scanner support, weighing scale (later) | Feature | Nitheesh, Meyyarivu |
| 38 | SEC-01 Tamper-evident records: hash-chained posted documents, statutory registers and audit log per series; signed daily anchors in immutable storage; nightly verifier and auditor "Verify records" report | Feature | Nitheesh, Meyyarivu |
| 39 | SEC-10 API and edge protection: WAF rules, rate limits per IP / user / tenant, request size limits, CORS lockdown, bot checks on public endpoints, abuse alerts | Feature | Nitheesh |
| 40 | SEC-17 Patient-data vault: prescriptions and patient fields in a separate encrypted store, access logged with purpose, retention auto-delete after the legal period (verify) | Feature | Nitheesh, Meyyarivu |
| 41 | AUT-11 Devices step: desktop download, device registration, printer test page, barcode scan test, cash drawer test | Feature | Nitheesh, Meyyarivu |
| 42 | Windows installer for the desktop app with code signing and an auto-update channel | Readiness | — |

## P5 · Wholesale, finance, offline (40)

| Step | Task | Type | With |
|---|---|---|---|
| 43 | Production hardening: firewall, fail2ban, SSH keys only, TLS A+, rate limits in Nginx, secrets rotation | Groundwork | — |
| 44 | Restore drill (documented, timed), disaster-recovery runbook | Groundwork | — |
| 45 | Alerts: API down, 5xx rate, DB CPU/storage, backup failed, cert expiry, device not syncing | Groundwork | — |
| 46 | Go-live checklist | Groundwork | — |
| 47 | PLT-26 Migration importers for exports of popular software (Marg, Tally, Busy, Vyapar, GoFrugal): items, parties, opening stock by batch, outstanding bills, ledgers with opening balances; dry run with error report | Feature | Kamesh, Ashok |
| 48 | LIC-07 Desktop offline license: cached certificate verified offline (signature, tenant, lifetime), clock-rollback check against the last server time seen, device activation counted against the device limit, restricted mode applied offline | Feature | Nitheesh, Meyyarivu |
| 49 | INT-01 GST IRP / GSP for e-invoice & e-way bill (verify) provider choice | Feature | Nitheesh |
| 50 | DSK-02 Offline SQLite store, sync engine, status bar indicator | Feature | Nitheesh, Meyyarivu |
| 51 | DSK-05 Device registration & revoke, local data encryption | Feature | Nitheesh, Meyyarivu |
| 52 | SEC-05 Insider-fraud detection: rules for voids, reprints, discounts, returns without bill, write-offs, price edits during shifts, after-hours activity, FEFO overrides, cash shortfalls; thresholds in configuration; alerts and case notes | Feature | Nitheesh, Meyyarivu |
| 53 | SEC-06 Privileged access management: separate platform-admin realm, hardware-key MFA, just-in-time elevation with approval and expiry, two-person rule for destructive actions, break-glass account with alert | Feature | Nitheesh, Meyyarivu |
| 54 | SEC-07 Security monitoring: central logs with redaction, detection rules (brute force, token reuse, impossible travel, mass export, cross-tenant attempt, admin outside hours), alerting, 180-day retention in India (verify) | Feature | Nitheesh, Meyyarivu |
| 55 | SEC-09 Desktop hardening: code-signed installer and updates, update signature check, sandboxed renderer, app-bundle integrity check, SQLCipher key in OS keystore, idle lock, remote wipe on device revoke | Feature | Nitheesh, Meyyarivu |
| 56 | SEC-15 Ransomware-resistant backups: encrypted, immutable second-region copies with separate credentials, deletion protection, restore drills | Feature | — |
| 57 | PUR-21 Purchase inbox: a dedicated email address or connected mailbox receives distributor CSV / PDF bills, auto-creates draft purchases with item mapping, flags rate changes | Feature | Kamesh, Ashok |
| 58 | ADM-16 Status page and maintenance notices: public status, incident history, maintenance announced 72 h ahead, in-app banner | Feature | Meyyarivu |
| 59 | INT-02 WhatsApp Business provider, SMS provider | Feature | Nitheesh |
| 60 | DSK-06 Local backup export of offline data (emergency) | Feature | Nitheesh, Meyyarivu |
| 61 | SEC-11 Data classification and export control: class per field (restricted-health, restricted-financial, confidential, internal, public); exports watermarked with user and time; approval for restricted data; bulk-export alert | Feature | Nitheesh, Meyyarivu |
| 62 | SEC-12 Tenant security centre: security score, MFA coverage, admins list, active sessions and devices, recent risky events, recommended actions | Feature | Nitheesh, Meyyarivu |
| 63 | SEC-13 Login protection: passkeys (WebAuthn) for owners and admins, new-device and new-location alerts, step-up challenge for risky sign-ins | Feature | Nitheesh, Meyyarivu |
| 64 | SEC-16 Responsible disclosure: security.txt, disclosure policy and safe-harbour text, triage SLA, hall of fame; bug bounty later | Feature | Nitheesh, Meyyarivu |
| 65 | Production hardening: firewall, SSH keys only, fail2ban, TLS A+, Nginx rate limits, security headers | Readiness | — |
| 66 | Monthly restore drill done and timed (RTO ≤ 4 h); result in `docs/runbooks/restore-drill-log.md` | Readiness | — |
| 67 | Alerts tested end to end: API down, 5xx rate, DB storage, backup failed, cert expiry, device not syncing | Readiness | — |
| 68 | Production go-live: deploy `v1.0.0`, smoke test, monitoring on, rollback plan rehearsed | Readiness | — |
| 69 | Write and rehearse runbook: deploy.md | Runbook | — |
| 70 | Write and rehearse runbook: rollback.md | Runbook | — |
| 71 | Write and rehearse runbook: restore-database.md | Runbook | — |
| 72 | Write and rehearse runbook: rotate-secrets.md | Runbook | — |
| 73 | Write and rehearse runbook: api-down.md | Runbook | — |
| 74 | Write and rehearse runbook: disk-full.md | Runbook | — |
| 75 | Write and rehearse runbook: revoke-device.md | Runbook | — |
| 76 | Write and rehearse runbook: incident-template.md | Runbook | — |
| 77 | Write and rehearse runbook: security-incident.md | Runbook | — |
| 78 | Write and rehearse runbook: chain-break.md | Runbook | — |
| 79 | Write and rehearse runbook: insider-fraud.md | Runbook | — |
| 80 | Write and rehearse runbook: key-rotation.md | Runbook | — |
| 81 | Write and rehearse runbook: ransomware.md | Runbook | — |
| 82 | Write and rehearse runbook: vulnerability-report.md | Runbook | — |

## P6 · Pilot & GST returns (12)

| Step | Task | Type | With |
|---|---|---|---|
| 83 | On-call rota, incident runbooks, monthly cost & uptime report | Groundwork | — |
| 84 | Scale plan if pilot grows (bigger VM / Container Apps ADR) | Groundwork | — |
| 85 | PLT-41 High availability and disaster recovery: managed PostgreSQL with point-in-time recovery, second-region backup copy, RPO / RTO per tier, monthly timed restore drill | Feature | Nitheesh |
| 86 | PLT-44 Security assurance: OWASP ASVS L2 checklist per release, dependency and container scanning, annual VAPT by a CERT-In empanelled auditor, CERT-In 6-hour incident reporting and 180-day log retention (verify), ISO 27001 readiness | Feature | Nitheesh, Ashok |
| 87 | OMN-04 WhatsApp ordering: customer sends an order or prescription on WhatsApp, it lands as a draft bill at the counter | Feature | Nitheesh, Gokul |
| 88 | INT-03 Tally export | Feature | Nitheesh |
| 89 | INT-16 Public API platform: versioned API, OAuth 2.0 client credentials, per-client rate limits, idempotent writes, bulk master endpoints, signed webhooks with retries, developer portal with sandbox (extends INT-05) | Feature | Nitheesh |
| 90 | SEC-03 Envelope encryption and key management: per-tenant data keys wrapped by a Key Vault master key, versioned keys, yearly rotation, crypto-shredding on tenant exit | Feature | Nitheesh, Meyyarivu |
| 91 | INT-10 openFDA adapter in `integrations` (reference only): server-side client for the drug label endpoint, optional API key from secrets, cache by label `set_id` (weekly updates), handles 404 "no matches" and 429; only needed for CAT-21 | Feature | Nitheesh |
| 92 | INT-15 Zoho Books sync (sales, purchases, returns, payments) alongside Tally export | Feature | Nitheesh |
| 93 | SEC-18 Trust centre and security pack: public trust page, security whitepaper, VAPT summary, DPA template, sub-processor list, ready answers to security questionnaires | Feature | Nitheesh, Meyyarivu |
| 94 | Monthly cost and uptime report; scale plan if the pilot grows | Readiness | — |

## P7 · Growth (11)

| Step | Task | Type | With |
|---|---|---|---|
| 95 | Mobile build pipeline (EAS), environment for public API | Groundwork | — |
| 96 | OMN-01 Store web page per branch: address, hours, contact, order via WhatsApp | Feature | Nitheesh, Gokul |
| 97 | OMN-02 White-label customer app: order with prescription upload, reorder, track (verify) online sale of medicines rules | Feature | Nitheesh, Gokul |
| 98 | OMN-03 Marketplace channels: ONDC, Amazon, Flipkart order intake with stock sync (extends INT-06) (verify) online sale of medicines rules | Feature | Nitheesh, Gokul |
| 99 | INT-05 Public API + webhooks for partners | Feature | Nitheesh |
| 100 | INT-06 Online pharmacy / e-commerce order intake | Feature | Nitheesh |
| 101 | INT-07 ABHA / ABDM integration: link a customer's ABHA, receive e-prescriptions (verify) ABDM certification | Feature | Nitheesh |
| 102 | INT-08 EMR integration: receive prescriptions from clinic software | Feature | Nitheesh |
| 103 | INT-09 Hospital software (HMIS) integration: hospital pharmacy billing against patient / IP number, ward indents | Feature | Nitheesh |
| 104 | INT-13 Insurance / TPA / corporate credit billing for hospital pharmacies: payer master, co-pay split, claim status | Feature | Nitheesh |
| 105 | INT-14 Hospital (IP) pharmacy: ward indents, issue against admission, returns from ward, consolidated IP bill to the hospital system (extends INT-09) | Feature | Nitheesh |
