# Environment examples

| File | Environment | Real file lives at | Secrets from |
|---|---|---|---|
| `/.env.example` | Local (docker compose on your laptop) | `/.env` | dummy dev values |
| `.env.development.example` | Optional shared dev server | `/opt/meno/.env` | GitHub Environment `development` |
| `.env.staging.example` | Staging | `/opt/meno/.env` on `vm-meno-stg` | GitHub Environment `staging` |
| `.env.production.example` | Production | `/opt/meno/.env` on `vm-meno-prod` (600, root) | GitHub Environment `production` (Nitheesh + Jeeva only) |

Differences that matter: production uses `sslmode=verify-full`, secure cookies, JSON logs, `INFO` level, live GSP, rate limits and backups; development uses local containers, `DEBUG`, Mailpit and MinIO. Adding a variable = add it to **all four** files + `docs/deployment/ENVIRONMENTS.md`.
