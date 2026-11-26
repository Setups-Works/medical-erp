# Runbook: roll back meno-api

Owner: Jeeva. When: the deploy smoke test failed, or a release misbehaves.

## Roll back the app (2–10 minutes)

1. Actions → **Deploy API** → filter by branch (`develop` for staging, `main` for production) → open the **last green run before the bad one**.
2. **Re-run all jobs**. It rebuilds and redeploys that older commit to the same App Service.
3. Wait for the smoke test to pass. Check `/actuator/health`.
4. Fix forward on a branch: revert the bad commit with a PR (`git revert <sha>`) so the next merge does not redeploy it.

To stop deploys while you investigate: Actions → Deploy API → **⋯ → Disable workflow**. Enable it again afterwards.

## If the database changed

Rolling back the app is safe when the migration was backward compatible (the rule in AZURE_DEPLOYMENT.md). Never edit or delete an applied Flyway migration. If data is damaged: stop, tell Nitheesh, and use restore-database.md (Azure PITR, 7 days).

## Rolling back the pipeline itself

The workflows are plain files: revert the PR that changed `.github/workflows/ci.yml` or `deploy-api.yml`. The App Services keep running the last deployed jar.
