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
| GET | `/api/v1/auth/me` | Bearer | User id, tenant id, email, roles from the token |
| GET | `/actuator/health` | – | Health check |
| GET | `/swagger-ui.html`, `/v3/api-docs` | – | API docs (only when `MENO_API_DOCS_ENABLED=true`) |

Access token 15 min (`sub` user, `tid` tenant, `email`, `roles`). Refresh token 30 days, stored only as SHA-256; reusing a rotated one revokes the whole login. 10 wrong passwords lock the account for 15 minutes. Every value is configurable (`application.yml`).

## Tests

`./mvnw verify` — unit tests, `ModulithTest` (module boundaries), `AuthFlowIntegrationTest` and the OpenAPI tests (`OpenApiExportTest` writes the spec, `OpenApiDisabledByDefaultTest` proves docs are off by default) on real PostgreSQL (skipped without Docker).
