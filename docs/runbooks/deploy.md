# Runbook: deploy meno-api

Owner: Jeeva. Applies to the App Service setup (ADR-0018, [setup guide](../deployment/AZURE_APP_SERVICE.md)).

## Normal deploy (automatic)

1. Open a PR into `develop`. CI must be green: **Backend verify** (tests, Modulith, PostgreSQL, OpenAPI spec committed) and **API image + scan** (Dockerfile builds, no fixable CRITICAL CVE).
2. Review → merge. **Deploy API** runs on `develop` → environment `staging`.
3. Watch Actions → Deploy API → the run. When it is green, the run page shows the staging URL. Check `/actuator/health` and try the change in `/swagger-ui.html`.
4. Release: open a PR `develop → main`, review, merge. **Deploy API** runs on `main` → environment `production` (waits for approval if required reviewers are set).
5. Production smoke test passes → post the run link in the release PR.

## Manual deploy

Actions → Deploy API → **Run workflow** → choose `develop` (staging) or `main` (production). Other branches build but do not deploy.

## Migrations

Flyway runs when the app starts, as `meno_owner`. A failed migration makes the app fail its health check → smoke test fails → follow [rollback.md](rollback.md). Migrations must stay backward compatible with the previous release (expand → migrate → contract), so the previous jar still runs on the new schema.

## Checks after a production deploy

- `https://<prod-app>.azurewebsites.net/actuator/health` → `{"status":"UP"}`
- `/v3/api-docs` → 404 (docs are off in production)
- App → Monitoring → Log stream: no `ERROR` in the first minutes
