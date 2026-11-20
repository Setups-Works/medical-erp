# infrastructure — AGENTS.md

Owner: Jeeva. Approver: Nitheesh. Agents write files here; **humans apply them**. Read `docs/deployment/AZURE_DEPLOYMENT.md`.

```
docker/        Dockerfiles (api: multi-stage, layered jar, non-root, healthcheck; web: build → nginx static)
               compose overrides: compose.staging.yml, compose.prod.yml
nginx/         nginx.conf, site config (TLS, /api proxy, static web, security headers, rate limits, gzip/brotli)
azure/         Bicep: vm.bicep, postgres.bicep, storage.bicep, network.bicep, main.bicep + params per env
monitoring/    prometheus/ (scrape config, alert rules), grafana/dashboards/*.json, loki/ (+promtail)
backup/        pg_dump script, retention script, restore script, cron definitions
scripts/       VM bootstrap (docker, ufw, fail2ban, unattended-upgrades), deploy.sh, rollback.sh, smoke.sh
```

Rules: pin image versions; non-root containers; healthchecks everywhere; no secrets in files (use `.env` on the VM from GitHub Environments); every change has a rollback note and a runbook update in `docs/runbooks/`.
