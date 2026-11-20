# Jeeva — phase plan

## P0 Foundation
- [ ] GitHub org/repo `meno`, branches `main` + `develop`, protection rules, CODEOWNERS, labels, Projects board
- [ ] Azure: subscription check, resource group `rg-meno-staging`, budget alerts
- [ ] Design docs: CI pipeline, environments, naming (`docs/deployment/ENVIRONMENTS.md`)
- [ ] Learn: Docker, Compose, GitHub Actions, Nginx, Linux basics, Azure CLI/Bicep

## P1 Platform core
- [ ] `docker-compose.yml`: postgres, redis, minio, mailpit (+ api, web profiles)
- [ ] Dockerfiles: `meno-api` (layered JAR, non-root), `web` (static → nginx)
- [ ] CI: backend verify, frontend typecheck/test/lint/design, Modulith test, dependency + image scan (Trivy), CodeQL
- [ ] Staging VM (Bicep), Docker, Nginx + Let's Encrypt, GHCR pull, deploy workflow on `develop`
- [ ] Azure PostgreSQL Flexible (staging), firewall to VM only

## P2 Masters
- [ ] Observability: Prometheus, Grafana dashboards (JVM, HTTP, DB), Loki logs, Sentry projects
- [ ] Daily `pg_dump` backup to Blob + 7/4/3 retention (daily/weekly/monthly); restore script
- [ ] Seed/reset staging data job

## P3 Purchase & inventory
- [ ] Test-vector parity CI job (Java + TS)
- [ ] Production VM + DB provisioned (private), deploy workflow with manual approval on `main`

## P4 Retail POS & returns
- [ ] electron-builder: Windows NSIS installer, code signing plan, auto-update feed (GitHub Releases)
- [ ] Release workflow: tag → images + desktop build → changelog
- [ ] Performance test environment for Ashok

## P5 Wholesale, finance, offline
- [ ] Production hardening: firewall, fail2ban, SSH keys only, TLS A+, rate limits in Nginx, secrets rotation
- [ ] Restore drill (documented, timed), disaster-recovery runbook
- [ ] Alerts: API down, 5xx rate, DB CPU/storage, backup failed, cert expiry, device not syncing
- [ ] Go-live checklist

## P6 Pilot
- [ ] On-call rota, incident runbooks, monthly cost & uptime report
- [ ] Scale plan if pilot grows (bigger VM / Container Apps ADR)

## P7 Growth
- [ ] Mobile build pipeline (EAS), environment for public API
