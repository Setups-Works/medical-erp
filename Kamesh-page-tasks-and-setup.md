# Kamesh — page tasks and local setup

Nov 27, 2026 · Nitheesh

Your next work is the 14 P2 master pages (catalog + party + GST settings), built one page at a time, end to end. Set up your PC with the steps below first, then start with Unit master.

## How you work

Each page is one branch and one PR: SQL (if needed), backend and frontend together. The full playbook is `docs/team/BUILD_A_PAGE.md`; with Claude Code you can just say "build the Unit master page" and the `build-page` skill follows it.

1. From `project-management/`: `npm run agent-task -- start-page "/masters/units"`. This creates your BE + FE cards on MENO Hub, moves them to In progress and prints the brief.
2. Read every doc the brief lists (module `AGENTS.md`, `VALIDATION_AND_BUSINESS_RULES.md`, `DATA_MODEL.md`, `MASTER_FIELDS.md`, `DESIGN_LANGUAGE.md`).
3. Branch from `develop`: `feature/<BE#>-<page-name>`. Never commit to `main` or `develop`.
4. Build: Flyway migration (tenant_id, RLS, audit columns, version) → backend module with a cross-tenant integration test → regenerate OpenAPI + `packages/api-client` → screen in `apps/web` wired to the real API.
5. Verify: `./mvnw verify` and `pnpm typecheck && pnpm test && pnpm check:design`.
6. Open one PR into `develop` with both task numbers, then `npm run agent-task -- review <n> "…"` on both cards.
7. Stop. Nitheesh reviews and merges; Prakalya does QA on master pages.

A business or tax rule that is not in `docs/` → comment on the card, mention @prakalya, and wait. No AI attribution lines in commits or PRs.

## Your pages, in build order

These are the 14 P2 pages where you are the backend owner in `docs/product/PAGES.md`. Build them top to bottom: each one uses masters from the rows above it (an item needs units, salts, brands, schedules and HSN/GST rates).

| # | Page | Route | Features | Why here / notes | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Unit master | `/masters/units` | CAT-17 | Smallest master; sets up the `catalog` module, migration pattern and cross-tenant test | Not started |
| 2 | Medicine categories | `/masters/categories` | CAT-06 | Category + therapeutic class trees, storage condition | Not started |
| 3 | Generic / salt master | `/masters/salts` | CAT-15 | Same composition never stored twice (unique constraint) | Not started |
| 4 | Manufacturer master | `/masters/manufacturers` | CAT-16 | Marketer vs manufacturer, GSTIN format check | Not started |
| 5 | Brand master | `/masters/brands` | CAT-16 | Links to manufacturer | Not started |
| 6 | Drug classification | `/masters/schedules` | CAT-03 | Schedules H / H1 / X are data, not code; ask Prakalya if a rule is missing | Not started |
| 7 | GST configuration | `/gst/settings` | GST-09 | HSN + rate master, registrations per company (same route as Tax settings, one page) | Not started |
| 8 | Medicine list | `/masters/items` | CAT-01 | Includes the item search endpoint (trigram index, under 150 ms) and server pagination | Not started |
| 9 | Edit medicine | `/masters/items/[id]/edit` | CAT-01 | Build the basic create form with it (Add medicine is finished in P6); edits are audited | Not started |
| 10 | Medicine details | `/masters/items/[id]` | CAT-20 | Profile page; stock and batch panels stay empty until inventory (P3) | Not started |
| 11 | Supplier list | `/masters/suppliers` | PTY-01 | Sets up the `party` module | Not started |
| 12 | Supplier details | `/masters/suppliers/[id]` | PTY-01 | GSTIN + state, drug licence nos., credit days | Not started |
| 13 | Customer list | `/masters/customers` | PTY-02, PTY-03 | Retail customers and wholesale retailers in one list | Not started |
| 14 | Customer details | `/masters/customers/[id]` | PTY-02 | Customer profile | Not started |

Fields per tab are in `docs/product/MASTER_FIELDS.md`. If `start-page` says a card belongs to someone else, talk to Nitheesh before starting it.

## Set up your PC

Install these once. Versions match the repo (`package.json` pins pnpm 12.14.0).

| Tool | Version | Check with |
| --- | --- | --- |
| Git (GitHub 2FA on, account `kamesh77-git`) | latest | `git --version` |
| Docker Desktop (running) | latest | `docker compose version` |
| JDK Temurin | 21 | `java -version` |
| Node.js LTS + corepack | 22 or newer | `node -v` |
| pnpm (via corepack) | 12.14.0 | `pnpm -v` |
| IntelliJ IDEA or VS Code | latest | — |
| Claude Code | latest | `claude --version` |
| Bruno or Postman (optional) | latest | — |

Then clone and set your git identity:

```bash
git clone https://github.com/Setups-Works/medical-erp.git
cd medical-erp
git switch develop
git config user.name "Kamesh"
git config user.email "<your GitHub email>"
corepack enable
pnpm install
```

On Windows, use Git Bash or WSL for the shell commands, and `mvnw.cmd` instead of `./mvnw`.

## Env files

Three files, all copied from a committed `*.example` and all gitignored. Never commit them and never paste their values in chat, cards or PRs.

| File | Copy from | What to change |
| --- | --- | --- |
| `.env` (repo root) | `.env.example` | Nothing needed to start: the dummy `change-me` passwords work locally. Docker Compose reads it for Postgres, Redis and Mailpit. |
| `apps/web/.env.local` | `apps/web/.env.example` | `NEXT_PUBLIC_API_MOCKING=missing` (real backend, mocks only for endpoints not built yet) or `off`; keep `MENO_API_ORIGIN=http://localhost:8080`. Use `all` only to look at screens without a backend. |
| `project-management/.env.local` | `project-management/.env.example` | `MONGODB_URI` = the team Atlas URL (ask Nitheesh privately) and `HUB_AGENT_AS=kamesh`. Needed for `npm run agent-task`. Never use a local or in-memory MongoDB. |

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp project-management/.env.example project-management/.env.local
cd project-management && npm install && cd ..
```

The backend reads plain environment variables, not `.env`. Export these in the terminal where you run it (values must match `.env`):

```bash
export MENO_DB_PASSWORD=change-me
export MENO_FLYWAY_USER=meno_owner
export MENO_FLYWAY_PASSWORD=change-me
export MENO_BOOTSTRAP_TENANT="Demo Pharmacy"   # first start on an empty DB only
export MENO_BOOTSTRAP_EMAIL=owner@example.com
export MENO_BOOTSTRAP_PASSWORD=<pick a local test password>
```

The `local` profile makes a throw-away JWT key, so you do not need key files. Only for the full Docker stack (`--profile api`) run `scripts/dev/gen-jwt-keys.sh` first.

### Full env files (copy-paste)

These are complete local values. Every password here is a local dummy. The one real secret, the Atlas URL, is not in this doc: Nitheesh sends it to you directly.

`.env` (repo root):

```bash
MENO_ENV=development
SPRING_PROFILES_ACTIVE=development
TZ=Asia/Kolkata
MENO_PUBLIC_WEB_URL=http://localhost:3000
MENO_PUBLIC_API_URL=http://localhost:8080
MENO_DB_URL=jdbc:postgresql://postgres:5432/meno?sslmode=disable
MENO_DB_USER=meno_app
MENO_DB_PASSWORD=change-me
MENO_FLYWAY_USER=meno_owner
MENO_FLYWAY_PASSWORD=change-me
MENO_DB_POOL_SIZE=10
MENO_REDIS_URL=redis://redis:6379/0
MENO_STORAGE_PROVIDER=s3
MENO_STORAGE_ENDPOINT=http://minio:9000
MENO_STORAGE_BUCKET=meno-dev
MENO_STORAGE_ACCESS_KEY=meno
MENO_STORAGE_SECRET_KEY=meno-dev-secret
MENO_JWT_ISSUER=http://localhost:8080
MENO_JWT_KID=meno-development-1
MENO_JWT_PRIVATE_KEY_PATH=/run/secrets/jwt_private.pem
MENO_JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public.pem
MENO_LOGIN_MAX_FAILED_ATTEMPTS=10
MENO_LOGIN_LOCK_DURATION=PT15M
MENO_MIN_PASSWORD_LENGTH=10
MENO_SIGNUP_ENABLED=true
MENO_SIGNUP_START_OPTIONS=TRIAL,DEMO,LICENSE_KEY
MENO_SIGNUP_TERMS_VERSION=draft-2026-11
MENO_RATE_LIMIT_ENABLED=true
MENO_RATE_LIMIT_LOGIN=10
MENO_RATE_LIMIT_SIGNUP=5
MENO_FY_START_MONTH=4
MENO_GO_LIVE_MAX_DAYS_AHEAD=7
MENO_GSTIN_PROVIDER=none
MENO_GSTIN_API_KEY=
MENO_GSTIN_CACHE_TTL=PT24H
MENO_GSTIN_LOOKUPS_PER_MINUTE=30
MENO_JWT_ACCESS_TTL=PT15M
MENO_JWT_REFRESH_TTL=P30D
MENO_COOKIE_SECURE=false
MENO_COOKIE_DOMAIN=localhost
MENO_API_DOCS_ENABLED=true
MENO_MAIL_HOST=mailpit
MENO_MAIL_PORT=1025
MENO_MAIL_FROM="MENO Dev <no-reply@meno.local>"
MENO_MAIL_AUTH=false
MENO_MAIL_STARTTLS=false
MENO_MAIL_SSL=false
MENO_EMAIL_VERIFICATION_TTL=PT24H
MENO_VERIFICATION_RESEND_COOLDOWN=PT60S
MENO_PASSWORD_RESET_TTL=PT30M
MENO_PASSWORD_RESET_COOLDOWN=PT60S
MENO_LOG_LEVEL=DEBUG
MENO_LOG_FORMAT=text
MENO_SENTRY_DSN=
MENO_SENTRY_ENVIRONMENT=development
MENO_SENTRY_TRACES_SAMPLE_RATE=0
MENO_GSP_MODE=sandbox
MENO_GSP_BASE_URL=
MENO_GSP_CLIENT_ID=
MENO_GSP_CLIENT_SECRET=
MENO_WHATSAPP_PROVIDER=none
MENO_WHATSAPP_API_KEY=
MENO_SMS_PROVIDER=none
MENO_SMS_API_KEY=
MENO_SMS_DLT_ENTITY_ID=
MENO_FEATURES_OFFLINE_SYNC=true
MENO_FEATURES_EINVOICE=false
MENO_FEATURES_WHOLESALE=true
NEXT_PUBLIC_API_BASE=/api/v1
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SENTRY_DSN=
POSTGRES_PASSWORD=postgres-dev
MINIO_ROOT_USER=meno
MINIO_ROOT_PASSWORD=meno-dev-secret
MENO_AI_PROVIDER=groq
MENO_AI_GROQ_API_KEY=
MENO_AI_MODEL=
MENO_AI_TIMEOUT_SECONDS=30
MENO_AI_MAX_TOKENS=800
MENO_AI_MAX_TOOL_ROUNDS=3
MENO_AI_RETRIES=1
```

`apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_MOCKING=missing
MENO_API_ORIGIN=http://localhost:8080
```

`project-management/.env.local` (only these two are needed for `agent-task`):

```bash
MONGODB_URI=<Nitheesh sends you this URL privately>
HUB_AGENT_AS=kamesh
```

## Run and check

Your setup is done when all four steps work. Use three terminals.

1. Start the databases: `docker compose up -d` (Postgres on 5432, Redis on 6379, Mailpit inbox at http://localhost:8025).
2. Start the backend: `cd backend/meno-api && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local`. Open http://localhost:8080/swagger-ui.html, call **login** with the bootstrap email, press **Authorize**, then call **me**.
3. Start the web app: `pnpm dev:web`, open http://localhost:3000 and sign in with the same account.
4. Run the checks once: `cd backend/meno-api && ./mvnw verify` (needs Docker running), then `pnpm typecheck && pnpm test && pnpm check:design` from the repo root. Both must be green.

Check the Hub link too: `cd project-management && npm run agent-task -- page "/masters/units"` should print the Unit master brief without changing anything.

| Daily command | Where |
| --- | --- |
| `git switch develop && git pull` before each new page | repo root |
| `npm run agent-task -- start-page "<route>"` | `project-management/` |
| `npm run agent-task -- check <n> <item…>` when a checklist item is really done | `project-management/` |
| `pnpm gen:api` after the OpenAPI spec changes | repo root |
| `npm run agent-task -- review <n> "what changed · PR link · how verified"` | `project-management/` |

Stuck on setup → message Nitheesh. Docker or CI problems → Jeeva.
