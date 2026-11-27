# meno-api

Spring Boot 4.2 · Java 21 · PostgreSQL 17 · Flyway · Spring Modulith. Rules: [AGENTS.md](AGENTS.md).
P1 so far: login only (modules `tenancy`, `identity`, `auth`; shared `security`, `common`, `config`).

## Run locally

1. PostgreSQL from the repo's docker compose, or create it once by hand:

   ```sql
   create user meno_app with password 'choose-a-password';
   create database meno owner meno_app;
   ```

2. Start with the `local` profile (a throw-away JWT key is used unless you set the key paths):

   ```bash
   export MENO_DB_PASSWORD=choose-a-password
   export MENO_BOOTSTRAP_TENANT="Demo Pharmacy"     # first start only, empty DB
   export MENO_BOOTSTRAP_EMAIL=owner@example.com
   export MENO_BOOTSTRAP_PASSWORD=owner-password
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
   ```

   Or with no local PostgreSQL but Docker running: `./mvnw spring-boot:test-run`.

3. Staging / prod need real ES256 keys (never committed):

   ```bash
   openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out jwt_private.pem
   openssl pkey -in jwt_private.pem -pubout -out jwt_public.pem
   ```

   and `MENO_JWT_PRIVATE_KEY_PATH`, `MENO_JWT_PUBLIC_KEY_PATH`, `MENO_JWT_KID`, `MENO_JWT_ISSUER`. All env names: `infrastructure/env/*.example`.

## Swagger UI

With the `local` profile: <http://localhost:8080/swagger-ui.html> (spec: `/v3/api-docs`). Call **login**, press **Authorize**, paste the `accessToken`, then try **me**. Controlled by `MENO_API_DOCS_ENABLED` (true on local/staging, false in production). The committed spec is `contracts/openapi/meno-api.yaml`; `./mvnw verify` or `./mvnw -Pexport-openapi` regenerates it.

## API so far

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/v1/auth/login` | – | `{"email","password"}` → access token in body, refresh token in `meno_refresh` HttpOnly cookie |
| POST | `/api/v1/auth/refresh` | cookie | Rotates the refresh token, returns a new access token |
| POST | `/api/v1/auth/logout` | cookie | Revokes the session family, clears the cookie |
| GET | `/api/v1/auth/signup/options` | – | States (GST codes), start options, terms version, password minimum for the sign-up screen |
| POST | `/api/v1/auth/signup` | – | Creates tenant + owner + consent, signs in (201); send `Idempotency-Key` (replay → 200, same account) |
| POST | `/api/v1/auth/password/forgot` | – | `{"email"}` → always 202; emails a single-use link (30 min) |
| POST | `/api/v1/auth/password/reset` | – | `{"token","password"}` → 204, ends every session; 410 if the link is used / expired |
| POST | `/api/v1/auth/verify-email` | – | `{"token"}` from the emailed link → 204 |
| POST | `/api/v1/auth/verify-email/resend` | Bearer | New link (older ones stop working) → 202 |
| POST | `/api/v1/auth/verify-mobile/send` | Bearer | 6-digit SMS code (5 min, resend after 30 s) → 202; 503 while `MENO_SMS_PROVIDER=none` |
| POST | `/api/v1/auth/verify-mobile` | Bearer | `{"code"}` → 204; 3 tries then 423 |
| GET | `/api/v1/auth/verification` | Bearer | `{emailVerified, mobileVerified}` |
| GET | `/api/v1/auth/me` | Bearer | User id, tenant id, email, roles from the token |
| GET | `/api/v1/onboarding` | Bearer | Checklist: steps, status, next step to resume |
| GET | `/api/v1/onboarding/options` | Bearer | Option lists, setting definitions, states |
| GET/PUT | `/api/v1/onboarding/business` · `/company` · `/licences` · `/books` · `/configuration` | Bearer | One step each (ONBOARDING.md) |
| GET/POST | `/api/v1/onboarding/branches`, GET/PUT `/branches/{id}` | Bearer | Branches; first = head office |
| POST | `/api/v1/onboarding/steps/{step}/skip` | Bearer | Skip an optional step |
| GET/POST | `/api/v1/onboarding/go-live` | Bearer | Readiness checks / go live |
| GET | `/api/v1/gstin-verifications/{gstin}` | Bearer | GSTIN checks + provider details (GSTIN_FETCH.md) |
| GET | `/actuator/health` | – | Health check |
| GET | `/swagger-ui.html`, `/v3/api-docs` | – | API docs (only when `MENO_API_DOCS_ENABLED=true`) |

Access token 15 min (`sub` user, `tid` tenant, `email`, `roles`). Refresh token 30 days, stored only as SHA-256; reusing a rotated one revokes the whole login. 10 wrong passwords lock the account for 15 minutes. Every value is configurable (`application.yml`).

## Docker and deploy

Whole local stack from the repo root: `cp .env.example .env && scripts/dev/gen-jwt-keys.sh && docker compose --profile api up -d --build`.

```bash
docker build -f infrastructure/docker/api.Dockerfile -t meno-api backend/meno-api   # from the repo root
```

Merging to `develop` deploys staging, merging to `main` deploys production (Azure App Service, ADR-0018). Where the host has no key files, pass the PEM text in `MENO_JWT_PRIVATE_KEY` / `MENO_JWT_PUBLIC_KEY`. Setup: `docs/deployment/AZURE_APP_SERVICE.md`.

## Tests

`./mvnw verify` — unit tests, `ModulithTest` (module boundaries), `AuthFlowIntegrationTest` and the OpenAPI tests (`OpenApiExportTest` writes the spec, `OpenApiDisabledByDefaultTest` proves docs are off by default) on real PostgreSQL (skipped without Docker).
