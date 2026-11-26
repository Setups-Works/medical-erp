# Environments & configuration

## Local services (docker-compose, P1)

Built: [`docker-compose.yml`](../../docker-compose.yml). `cp .env.example .env`, then `docker compose up -d` (postgres, redis, mailpit) or `scripts/dev/gen-jwt-keys.sh && docker compose --profile api up -d --build` (+ meno-api on :8080). The postgres container creates `meno_owner` (Flyway) and `meno_app` (runtime) on first start. MinIO is not included yet: the `minio/minio` image is no longer published on Docker Hub, and nothing stores files yet.

| Service | Image (pin exact version in P1) | Port | Purpose |
|---|---|---|---|
| postgres | postgres:17 | 5432 | DB (`meno`, roles `meno_owner`, `meno_app`) |
| redis | redis:7 | 6379 | cache, rate limit, locks |
| minio | minio/minio | 9000/9001 | S3-compatible files |
| mailpit | axllent/mailpit | 8025 | catch-all email |
| meno-api | built locally | 8080 | backend (profile `api`) |
| web | built locally / `pnpm dev` | 3000 | frontend |

## Configuration rules

- Backend: `application.yml` + `application-{local,test,staging,prod}.yml`; secrets only from environment variables (`MENO_DB_PASSWORD`, `MENO_JWT_PRIVATE_KEY`, …). Custom keys under `meno.<module>.*`.
- Web: build-time `NEXT_PUBLIC_*` only for non-secrets (API base path, Sentry DSN, flags). The web has **no secrets**.
- Desktop: API base URL + update channel baked per build; device credentials in OS keychain.
- Every variable is listed in `.env.example` (root) with a comment. Adding a variable = update `.env.example` + this file + GitHub Environment.
- On App Service (ADR-0018) the server-side values are **App settings** on each app, not a `.env` file. GitHub Environments `staging` / `production` hold only the deploy credentials (`AZURE_WEBAPP_NAME`, `AZURE_WEBAPP_PUBLISH_PROFILE`). See `AZURE_APP_SERVICE.md`.

## Variable catalogue (initial)

| Name | Used by | Secret | Notes |
|---|---|---|---|
| `MENO_DB_URL`, `MENO_DB_USER`, `MENO_DB_PASSWORD` | api | pw yes | runtime role `meno_app` |
| `MENO_FLYWAY_USER`, `MENO_FLYWAY_PASSWORD` | api | yes | owner role for migrations |
| `MENO_REDIS_URL` | api | no | |
| `MENO_STORAGE_*` (endpoint, bucket, key, secret) | api | yes | MinIO / Azure Blob |
| `MENO_JWT_PRIVATE_KEY_PATH`, `MENO_JWT_PUBLIC_KEY_PATH` | api | private yes | ES256 PEM files (VM / Docker secrets) |
| `MENO_JWT_PRIVATE_KEY`, `MENO_JWT_PUBLIC_KEY` | api | private yes | PEM text instead of files (App Service app settings / Key Vault reference, ADR-0018); used only when the paths are unset |
| `MENO_JWT_KID`, `MENO_JWT_ISSUER` | api | no | rotated per runbook |
| `MENO_API_DOCS_ENABLED` | api | no | Swagger UI + `/v3/api-docs`; `false` in production |
| `PORT` / `SERVER_PORT` | api | no | HTTP port (8080 locally, 80 on App Service) |
| `JAVA_OPTS` | api (App Service) | no | JVM flags (heap capped: the B1 plan is shared by four apps) |
| `MENO_MAIL_*` | api | yes | SMTP |
| `MENO_SENTRY_DSN` | api, web, desktop | no | |
| `MENO_GSP_*` | api | yes | e-invoice provider (P5) |
| `MENO_WHATSAPP_*`, `MENO_SMS_*` | api | yes | P5 |
| `NEXT_PUBLIC_API_BASE` | web | no | `/api/v1` |
