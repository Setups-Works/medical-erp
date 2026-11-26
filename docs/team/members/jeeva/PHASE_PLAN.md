# Jeeva — phase plan

Do tasks in the **Step** order shown in MENO Hub and in [TASK_ORDER.md](TASK_ORDER.md).

## P0 Foundation
- [x] GitHub org/repo `meno`, branches `main` + `develop`, protection rules, CODEOWNERS, labels, Projects board
- [x] Azure: subscription check, resource group `rg-meno-staging`, budget alerts
- [x] Design docs: CI pipeline, environments, naming (`docs/deployment/ENVIRONMENTS.md`)
- [x] Learn: Docker, Compose, GitHub Actions, Nginx, Linux basics, Azure CLI/Bicep

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
- [ ] Compare Indian medicine data sources for CAT-10 / INT-11 (DrugDB API paid-plan quote, Kaggle A–Z dataset licence, GS1 India DataKart, other licensed drug databases, NPPA / CDSCO lists): coverage, barcode lookup, API, update frequency, cost, licence terms; share with Nitheesh (start from Hub → Learn → Day 19)
- [ ] Compare GSTIN verification providers for PTY-15 / INT-17 (the GST verify API `api.gstverify.dubey.app` tried in Hub → Learn → Day 22, the GSTIN search of the e-invoice GSP shortlisted for INT-01, verification vendors from R-31): fields returned, cancelled / suspended status, rate limits, uptime, terms, data retention, cost; share with Nitheesh (spec: `docs/product/GSTIN_FETCH.md`)

## P3 Purchase & inventory
- [ ] Test-vector parity CI job (Java + TS)
- [ ] Production VM + DB provisioned (private), deploy workflow with manual approval on `main`

## P4 Retail POS & returns
- [ ] electron-builder: Windows NSIS installer, code signing plan, auto-update feed (GitHub Releases)
- [ ] Release workflow: tag → images + desktop build → changelog
- [ ] Performance test environment for Ashok
- [ ] Compare GSP/IRP providers (cost, API, sandbox) and share with Nitheesh

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
- [ ] Compare LLM providers for the AI assistant (Groq first): tool calling, latency, price, data retention, training use, region, DPA; embeddings option for RAG; write it into ADR-0017
- [ ] AI assistant infrastructure: `MENO_AI_*` secrets in Key Vault, egress allowlist to the provider, pgvector-enabled PostgreSQL image (if AIA-12 goes ahead), Grafana panels and alerts for AI errors, latency and tokens
