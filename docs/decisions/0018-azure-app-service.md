# ADR-0018: Azure App Service (Java 21) for meno-api until the pilot

- Status: Accepted (Nitheesh, 2026-11-26)
- Date: 2026-11-26
- Deciders: Nitheesh (+ Jeeva)

## Context
ADR-0005 puts meno-api on an Ubuntu VM with Docker Compose. Until the pilot we have only the Azure for Students credit, two App Services already created, and no one to patch a VM. The backend is one Spring Boot jar with no Redis, MinIO or nginx dependency yet, so a VM buys us nothing today.

## Options considered
1. **VM + Docker Compose (ADR-0005).** Same as local; full control. − B2s costs most of the credit, we must patch the OS, renew TLS and write the deploy scripts ourselves.
2. **App Service Free (F1), Linux, Java 21 SE, jar deploy.** + Costs nothing, HTTPS on `*.azurewebsites.net` included, OS and JVM patched by Azure, push-to-deploy with a publish profile, no container registry. − 1 GB RAM, 60 CPU minutes a day, sleeps after ~20 idle minutes (slow first request), no deployment slots, no custom domain TLS, no Always On.
3. **App Service B1 with a container image from GHCR.** + Same image as local. − About US$13 a month per plan from the credit, plus registry credentials on the app.
4. **Azure Container Apps.** + Scales to zero. − More moving parts (environment, ingress, registry) for a fresher DevOps engineer.

## Decision
Until the pilot, run meno-api on **two Linux App Services on the Free (F1) plan, runtime Java 21 SE**: `staging` (deployed on every push to `develop`) and `production` (deployed on every push to `main`). GitHub Actions builds and tests the jar, then deploys it with each app's publish profile, stored in the matching GitHub Environment. PostgreSQL stays on Azure Database for PostgreSQL Flexible Server (B1ms), one server with a `meno_staging` and a `meno_prod` database (as in ADR-0005). The Dockerfile (`infrastructure/docker/api.Dockerfile`) is still built and scanned in CI and used by docker compose, so moving to option 3 or back to ADR-0005 is a config change, not a rewrite.

## Consequences
+ Zero hosting cost; every merge is deployed and smoke-tested automatically; no server to patch.
+ App settings replace the `.env` file on the VM. JWT keys are passed as PEM text (`MENO_JWT_PRIVATE_KEY`, `MENO_JWT_PUBLIC_KEY`), ideally as Key Vault references.
− Cold starts and the CPU quota make F1 unfit for real counters. Move production to B1 (or ADR-0005) before the pilot; staging can stay on F1.
− Production deploys automatically on merge to `main`. The guard is the PR review into `main` plus optional required reviewers on the `production` GitHub Environment; turn those on before real tenants exist.
− No Redis, nginx rate limits or Prometheus on App Service. Add them (or move to the VM) when the features that need them land.
− Deploys authenticate with each app's publish profile (a long-lived password in a GitHub Environment secret). The threat model (SEC-08) prefers OIDC to Azure: `deploy-api.yml` already switches to `azure/login` OIDC when the Environment has `AZURE_CLIENT_ID`; `infrastructure/azure/setup-oidc.sh` creates a user-assigned managed identity (no app registration needed) with a federated credential per Environment, then deletes the publish profiles and turns basic-auth publishing off.
− **Update 26-11-2026 (Nitheesh):** F1 failed on the first deploy: the 60 CPU minutes a day are shared by every app on the plan, and a starting Spring Boot app used them up, so both apps were stopped (QuotaExceeded). The apps now run as `meno-api-staging` / `meno-api-production` on the existing, already-paid **B1** plan `untitled-ws-free-f1` in `nitheesh_group` (no extra cost, Always On, no CPU quota), sharing its 1.75 GB with two other apps (heap capped at 384 MB each). Still one plan for staging and production: a runaway staging app can slow production. Give production its own plan before the pilot.
− Partly supersedes ADR-0005 for P1–P4. Revisit at the pilot go-live (Hub #395).
