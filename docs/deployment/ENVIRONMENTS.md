# Environments & configuration

## Local services (docker-compose, P1)

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

## Variable catalogue (initial)

| Name | Used by | Secret | Notes |
|---|---|---|---|
| `MENO_DB_URL`, `MENO_DB_USER`, `MENO_DB_PASSWORD` | api | pw yes | runtime role `meno_app` |
| `MENO_FLYWAY_USER`, `MENO_FLYWAY_PASSWORD` | api | yes | owner role for migrations |
| `MENO_REDIS_URL` | api | no | |
| `MENO_STORAGE_*` (endpoint, bucket, key, secret) | api | yes | MinIO / Azure Blob |
| `MENO_JWT_PRIVATE_KEY`, `MENO_JWT_KID` | api | yes | rotated per runbook |
| `MENO_MAIL_*` | api | yes | SMTP |
| `MENO_SENTRY_DSN` | api, web, desktop | no | |
| `MENO_GSP_*` | api | yes | e-invoice provider (P5) |
| `MENO_WHATSAPP_*`, `MENO_SMS_*` | api | yes | P5 |
| `NEXT_PUBLIC_API_BASE` | web | no | `/api/v1` |
