# meno-api on Azure App Service (free student setup)

Owner: Jeeva. Approver: Nitheesh. Decision: [ADR-0017](../decisions/0017-azure-app-service-free-tier.md). Workflows: [`ci.yml`](../../.github/workflows/ci.yml), [`deploy-api.yml`](../../.github/workflows/deploy-api.yml).

```mermaid
flowchart LR
    pr[Pull request] -->|CI: Backend verify + API image scan| review[Review + merge]
    review -->|push to develop| stg[GitHub Environment staging] --> appS["App Service (F1, Java 21)<br/>https://&lt;staging-app&gt;.azurewebsites.net"]
    review -->|push to main| prod[GitHub Environment production] --> appP["App Service (F1, Java 21)<br/>https://&lt;prod-app&gt;.azurewebsites.net"]
    appS --> pg[("PostgreSQL Flexible B1ms<br/>meno_staging · meno_prod")]
    appP --> pg
```

| Branch | Deploys to | URL | Swagger |
|---|---|---|---|
| `develop` | staging App Service | `https://<staging-app>.azurewebsites.net` (shown on the workflow run and in the repo's **Environments** list) | `/swagger-ui.html` on |
| `main` | production App Service | `https://<prod-app>.azurewebsites.net` | off (smoke test fails if it is on) |

Every deploy: `./mvnw verify` on the exact commit → upload `app.jar` → restart → Flyway migrates → smoke test (`/actuator/health` is UP, login rejects an empty body with 400, production does not serve `/v3/api-docs`).

## What it costs

Everything here is on free tiers for an Azure for Students subscription. ⚠ Check each price in the portal before you create it: free offers change.

| Resource | SKU | Note |
|---|---|---|
| 2 × App Service (Linux) | **Free F1** | 1 GB RAM, 60 CPU minutes a day, sleeps after ~20 idle minutes. Move production to B1 before the pilot (ADR-0017) |
| PostgreSQL Flexible Server | B1ms, 32 GB | 750 h a month free for 12 months on eligible student subscriptions. One server, two databases |
| Key Vault (optional) | Standard | Tiny per-operation cost; holds the JWT keys and DB passwords as references |

## One-time setup (a person does this, not an agent)

Names follow `AZURE_DEPLOYMENT.md`: resource group `rg-meno-staging` (exists, Hub #129), server `psql-meno`, apps of your choice (for example `meno-api-stg`, `meno-api-prod`; the name becomes the URL).

### 1. PostgreSQL

Create **Azure Database for PostgreSQL – Flexible Server**, version 17, B1ms, public access. Then, as the admin user:

```sql
create role meno_owner login password '<owner-password>';
create role meno_app   login password '<app-password>';
create database meno_staging owner meno_owner;
create database meno_prod    owner meno_owner;
-- in each database:
grant connect on database meno_staging to meno_app;  -- meno_prod for production
grant usage on schema public to meno_app;
alter default privileges for role meno_owner in schema public grant select, insert, update, delete on tables to meno_app;
alter default privileges for role meno_owner in schema public grant usage, select on sequences to meno_app;
```

Use different passwords for staging and production. Firewall: add each App Service's **outbound IP addresses** (app → Networking → Outbound addresses). Avoid "Allow public access from any Azure service" (it lets every Azure customer try your login).

### 2. The two App Services

Portal → Create → Web App: **Publish: Code**, **Runtime stack: Java 21**, **Java web server stack: Java SE (Embedded Web Server)**, **OS: Linux**, region Central India, pricing plan **Free F1**. Do it twice (staging, production). Then on each app:

- Settings → Configuration → General settings: **SCM Basic Auth Publishing Credentials: On** (the publish profile needs it), HTTPS only: On, minimum TLS 1.2.
- Settings → Environment variables → App settings: the table below.
- Overview → **Download publish profile** (keep the file private; it is a deploy password).

| App setting | staging | production | Secret |
|---|---|---|---|
| `SERVER_PORT` | `80` | `80` | no (App Service Java SE routes traffic to port 80) |
| `JAVA_OPTS` | `-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -XX:TieredStopAtLevel=1` | same | no (fits the 1 GB F1 plan, faster start) |
| `SPRING_PROFILES_ACTIVE` | `staging` | `prod` | no |
| `TZ` | `Asia/Kolkata` | `Asia/Kolkata` | no |
| `MENO_DB_URL` | `jdbc:postgresql://psql-meno.postgres.database.azure.com:5432/meno_staging?sslmode=verify-full&sslfactory=org.postgresql.ssl.DefaultJavaSSLFactory` | same with `meno_prod` | no |
| `MENO_DB_USER` / `MENO_DB_PASSWORD` | `meno_app` / … | `meno_app` / … | password yes |
| `MENO_FLYWAY_USER` / `MENO_FLYWAY_PASSWORD` | `meno_owner` / … | `meno_owner` / … | password yes |
| `MENO_JWT_ISSUER` | `https://<staging-app>.azurewebsites.net` | `https://<prod-app>.azurewebsites.net` | no |
| `MENO_JWT_KID` | `meno-staging-1` | `meno-prod-1` | no |
| `MENO_JWT_PRIVATE_KEY` | PEM text of `jwt_private.pem` | a **different** key | **yes** |
| `MENO_JWT_PUBLIC_KEY` | PEM text of `jwt_public.pem` | matching public key | no |
| `MENO_COOKIE_SECURE` | `true` | `true` | no |
| `MENO_API_DOCS_ENABLED` | `true` | `false` | no |
| `MENO_BOOTSTRAP_TENANT` / `_EMAIL` / `_PASSWORD` | first start only, then delete | first start only, then delete | password yes |

Generate keys (once per environment, never commit them):

```bash
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out jwt_private.pem
openssl pkey -in jwt_private.pem -pubout -out jwt_public.pem
```

Paste the whole PEM (with the `-----BEGIN …-----` lines) into the app setting. If the portal flattens the newlines, that is fine: the API accepts spaces or `\n` in place of line breaks. Better: store secrets in Key Vault and set the app setting to `@Microsoft.KeyVault(SecretUri=…)`.

All other `MENO_*` names and defaults: `infrastructure/env/.env.staging.example`, `.env.production.example`.

### 3. GitHub Environments

Repo → Settings → Environments → create `staging` and `production`. In each:

- Variable `AZURE_WEBAPP_NAME` = the app name (only the name, not the URL).
- Secret `AZURE_WEBAPP_PUBLISH_PROFILE` = the full XML of that app's publish profile.
- Deployment branches: `staging` → `develop` only; `production` → `main` only.
- `production` (recommended before real tenants): Required reviewers → Nitheesh, Jeeva. The deploy then waits for one click.

Or with the CLI (as a repo admin):

```bash
gh api -X PUT repos/Setups-Works/medical-erp/environments/staging
gh api -X PUT repos/Setups-Works/medical-erp/environments/production
gh variable set AZURE_WEBAPP_NAME --env staging    --body "<staging-app>"
gh variable set AZURE_WEBAPP_NAME --env production --body "<prod-app>"
gh secret set AZURE_WEBAPP_PUBLISH_PROFILE --env staging    < staging.PublishSettings
gh secret set AZURE_WEBAPP_PUBLISH_PROFILE --env production < prod.PublishSettings
```

### 4. Branch protection

On `develop` and `main`, require the status checks **Backend verify** and **API image + scan** (they appear after the first PR runs CI).

### 5. First deploy

Actions → **Deploy API** → Run workflow on `develop` (or merge any backend change). The run page shows the URL. Open `https://<staging-app>.azurewebsites.net/swagger-ui.html`, sign in with the bootstrap owner, then remove the `MENO_BOOTSTRAP_*` settings.

## Day to day

- Merge to `develop` → staging updates in about 5 minutes. Merge `develop` → `main` (release PR) → production updates.
- Something broke: [docs/runbooks/rollback.md](../runbooks/rollback.md). Normal procedure: [docs/runbooks/deploy.md](../runbooks/deploy.md).
- Logs: app → Monitoring → Log stream (or `az webapp log tail -n <app> -g rg-meno-staging`).
- First request after idle is slow on F1 (the app sleeps). The deploy smoke test waits up to 10 minutes for that reason.
