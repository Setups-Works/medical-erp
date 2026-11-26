# infrastructure — AGENTS.md

Owner: Jeeva. Approver: Nitheesh. Agents write files here; **humans apply them**. Read `docs/deployment/AZURE_DEPLOYMENT.md`.

```
docker/        api.Dockerfile (built: multi-stage, layered jar, non-root, healthcheck; CI builds + Trivy-scans it)
               web Dockerfile (build → nginx static): when apps/web has code
               compose overrides: compose.staging.yml, compose.prod.yml
nginx/         nginx.conf, site config (TLS, /api proxy, static web, security headers, rate limits, gzip/brotli)
azure/         Bicep: vm.bicep, postgres.bicep, storage.bicep, network.bicep, main.bicep + params per env
monitoring/    prometheus/ (scrape config, alert rules), grafana/dashboards/*.json, loki/ (+promtail)
backup/        pg_dump script, retention script, restore script, cron definitions
scripts/       VM bootstrap (docker, ufw, fail2ban, unattended-upgrades), deploy.sh, rollback.sh, smoke.sh
```

Built: `../docker-compose.yml` (local stack), `docker/api.Dockerfile`, `docker/postgres/init-roles.sh`, `azure/setup-oidc.sh` (a person runs it).
Hosting now: two free App Services, jar deploy from `.github/workflows/deploy-api.yml` (ADR-0017, `docs/deployment/AZURE_APP_SERVICE.md`). `azure/` Bicep and the VM scripts are for the later VM setup (ADR-0005).

Rules: pin image versions; non-root containers; healthchecks everywhere; no secrets in files (use `.env` on the VM from GitHub Environments); every change has a rollback note and a runbook update in `docs/runbooks/`.
