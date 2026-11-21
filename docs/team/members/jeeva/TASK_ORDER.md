# Jeeva — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**57 tasks** · P0: 5 · P1: 7 · P2: 5 · P3: 4 · P4: 8 · P5: 21 · P6: 4 · P7: 3

## P0 · Foundation (5)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | GitHub org/repo `meno`, branches `main` + `develop`, protection rules, CODEOWNERS, labels, Projects board | Groundwork | — |
| 2 | Azure: subscription check, resource group `rg-meno-staging`, budget alerts | Groundwork | — |
| 3 | Design docs: CI pipeline, environments, naming (`docs/deployment/ENVIRONMENTS.md`) | Groundwork | — |
| 4 | Learn: Docker, Compose, GitHub Actions, Nginx, Linux basics, Azure CLI/Bicep | Groundwork | — |
| 5 | Replace placeholder GitHub handles in `.github/CODEOWNERS` and turn on branch protection | Readiness | — |

## P1 · Platform core (7)

| Step | Task | Type | With |
|---|---|---|---|
| 6 | `docker-compose.yml`: postgres, redis, minio, mailpit (+ api, web profiles) | Groundwork | — |
| 7 | Dockerfiles: `meno-api` (layered JAR, non-root), `web` (static → nginx) | Groundwork | — |
| 8 | CI: backend verify, frontend typecheck/test/lint/design, Modulith test, dependency + image scan (Trivy), CodeQL | Groundwork | — |
| 9 | Staging VM (Bicep), Docker, Nginx + Let's Encrypt, GHCR pull, deploy workflow on `develop` | Groundwork | — |
| 10 | Azure PostgreSQL Flexible (staging), firewall to VM only | Groundwork | — |
| 11 | Create `.env` files for local/staging from `infrastructure/env/*.example`; store secrets in GitHub Environments | Readiness | — |
| 12 | Staging reachable over HTTPS with a real domain and TLS certificate | Readiness | — |

## P2 · Masters (5)

| Step | Task | Type | With |
|---|---|---|---|
| 13 | Observability: Prometheus, Grafana dashboards (JVM, HTTP, DB), Loki logs, Sentry projects | Groundwork | — |
| 14 | Daily `pg_dump` backup to Blob + 7/4/3 retention (daily/weekly/monthly); restore script | Groundwork | — |
| 15 | Seed/reset staging data job | Groundwork | — |
| 16 | Daily database backup to Blob Storage with a tested restore script | Readiness | — |
| 17 | Grafana dashboards + Loki logs + Sentry for API and web | Readiness | — |

## P3 · Purchase & inventory (4)

| Step | Task | Type | With |
|---|---|---|---|
| 18 | Test-vector parity CI job (Java + TS) | Groundwork | — |
| 19 | Production VM + DB provisioned (private), deploy workflow with manual approval on `main` | Groundwork | — |
| 20 | INT-04 Distributor file formats (CSV templates per major distributor) | Feature | Nitheesh |
| 21 | Production VM and database provisioned (private, not public yet) | Readiness | — |

## P4 · Retail POS & returns (8)

| Step | Task | Type | With |
|---|---|---|---|
| 22 | electron-builder: Windows NSIS installer, code signing plan, auto-update feed (GitHub Releases) | Groundwork | — |
| 23 | Release workflow: tag → images + desktop build → changelog | Groundwork | — |
| 24 | Performance test environment for Ashok | Groundwork | — |
| 25 | Compare GSP/IRP providers (cost, API, sandbox) and share with Nitheesh | Groundwork | — |
| 26 | DSK-01 Windows installer (and macOS), auto-update with staged rollout | Feature | Nitheesh, Meyyarivu |
| 27 | DSK-03 Thermal/A4 printing without browser dialog, printer profiles per counter | Feature | Nitheesh, Meyyarivu |
| 28 | DSK-04 USB/HID barcode scanner support, weighing scale (later) | Feature | Nitheesh, Meyyarivu |
| 29 | Windows installer for the desktop app with code signing and an auto-update channel | Readiness | — |

## P5 · Wholesale, finance, offline (21)

| Step | Task | Type | With |
|---|---|---|---|
| 30 | Production hardening: firewall, fail2ban, SSH keys only, TLS A+, rate limits in Nginx, secrets rotation | Groundwork | — |
| 31 | Restore drill (documented, timed), disaster-recovery runbook | Groundwork | — |
| 32 | Alerts: API down, 5xx rate, DB CPU/storage, backup failed, cert expiry, device not syncing | Groundwork | — |
| 33 | Go-live checklist | Groundwork | — |
| 34 | INT-01 GST IRP / GSP for e-invoice & e-way bill (verify) provider choice | Feature | Nitheesh |
| 35 | DSK-02 Offline SQLite store, sync engine, status bar indicator | Feature | Nitheesh, Meyyarivu |
| 36 | DSK-05 Device registration & revoke, local data encryption | Feature | Nitheesh, Meyyarivu |
| 37 | INT-02 WhatsApp Business provider, SMS provider | Feature | Nitheesh |
| 38 | DSK-06 Local backup export of offline data (emergency) | Feature | Nitheesh, Meyyarivu |
| 39 | Production hardening: firewall, SSH keys only, fail2ban, TLS A+, Nginx rate limits, security headers | Readiness | — |
| 40 | Monthly restore drill done and timed (RTO ≤ 4 h); result in `docs/runbooks/restore-drill-log.md` | Readiness | — |
| 41 | Alerts tested end to end: API down, 5xx rate, DB storage, backup failed, cert expiry, device not syncing | Readiness | — |
| 42 | Production go-live: deploy `v1.0.0`, smoke test, monitoring on, rollback plan rehearsed | Readiness | — |
| 43 | Write and rehearse runbook: deploy.md | Runbook | — |
| 44 | Write and rehearse runbook: rollback.md | Runbook | — |
| 45 | Write and rehearse runbook: restore-database.md | Runbook | — |
| 46 | Write and rehearse runbook: rotate-secrets.md | Runbook | — |
| 47 | Write and rehearse runbook: api-down.md | Runbook | — |
| 48 | Write and rehearse runbook: disk-full.md | Runbook | — |
| 49 | Write and rehearse runbook: revoke-device.md | Runbook | — |
| 50 | Write and rehearse runbook: incident-template.md | Runbook | — |

## P6 · Pilot & GST returns (4)

| Step | Task | Type | With |
|---|---|---|---|
| 51 | On-call rota, incident runbooks, monthly cost & uptime report | Groundwork | — |
| 52 | Scale plan if pilot grows (bigger VM / Container Apps ADR) | Groundwork | — |
| 53 | INT-03 Tally export | Feature | Nitheesh |
| 54 | Monthly cost and uptime report; scale plan if the pilot grows | Readiness | — |

## P7 · Growth (3)

| Step | Task | Type | With |
|---|---|---|---|
| 55 | Mobile build pipeline (EAS), environment for public API | Groundwork | — |
| 56 | INT-05 Public API + webhooks for partners | Feature | Nitheesh |
| 57 | INT-06 Online pharmacy / e-commerce order intake | Feature | Nitheesh |
