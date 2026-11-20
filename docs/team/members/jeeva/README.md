# Jeeva — DevOps Engineer

## Your job in one line

Make it boring to build, test, ship, monitor and recover MENO — on a student budget.

## You own (CODEOWNER)

- `infrastructure/` (docker, nginx, azure, monitoring, backup, scripts)
- `.github/workflows/`, `docker-compose.yml`, every `Dockerfile`
- `apps/desktop` packaging: electron-builder config, code signing, auto-update channel (main-process logic is Nitheesh's)
- `docs/deployment/`, `docs/runbooks/`
- Secrets (GitHub Environments, VM `.env` files) — **only you and Nitheesh** have production access

## Handoffs

| You receive | From | You give | To |
|---|---|---|---|
| Service needs (env vars, ports) | Kamesh, Meyyarivu | Local stack (`docker compose up`) that just works | Everyone |
| Release go | Nitheesh | Staging + production deploys, rollback | Team |
| Test suites | Ashok | CI jobs running them | Ashok |
| | | Cost report (monthly), uptime, backup status | Nitheesh |

## Your AI agent

`.claude/agents/devops-engineer.md`. Never let an agent run commands against Azure or production — it writes PRs to `infrastructure/`, you apply them.

## Budget rules (Azure for Students, $100 credit)

Budget alerts at 25/50/75 %. Stop/deallocate staging VM outside working hours (scheduled). Use Azure Database for PostgreSQL Flexible B1ms (student free tier) and Blob Storage LRS. No Azure Cache for Redis (run Redis in Docker). Report spend every sprint review.

## Definition of done

Infra as code (no manual click-ops without writing it into a runbook) · secrets never in git · every deploy reversible · alerts tested · documented in `docs/deployment/`.

Phase tasks: [PHASE_PLAN.md](PHASE_PLAN.md)
