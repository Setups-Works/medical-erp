# Environment examples

| File | Environment | Real file lives at | Secrets from |
|---|---|---|---|
| `/.env.example` | Local (docker compose on your laptop) | `/.env` | dummy dev values |
| `.env.development.example` | Optional shared dev server | `/opt/meno/.env` | GitHub Environment `development` |
| `.env.staging.example` | Staging | **now:** App settings on the staging App Service · later: `/opt/meno/.env` on `vm-meno-stg` | Key Vault / App settings; deploy credentials in GitHub Environment `staging` |
| `.env.production.example` | Production | **now:** App settings on the production App Service · later: `/opt/meno/.env` on `vm-meno-prod` (600, root) | Key Vault / App settings; deploy credentials in GitHub Environment `production` (Nitheesh + Jeeva only) |

App Service setup and the exact app settings: `docs/deployment/AZURE_APP_SERVICE.md` (ADR-0018).

Differences that matter: production uses `sslmode=verify-full`, secure cookies, JSON logs, `INFO` level, live GSP, rate limits and backups; development uses local containers, `DEBUG`, Mailpit and MinIO. Adding a variable = add it to **all four** files + `docs/deployment/ENVIRONMENTS.md`.
