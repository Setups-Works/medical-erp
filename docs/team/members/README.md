# Team member folders

Each member has a folder with:

- `README.md` — role, what you own (paths), who you hand work to/from, your AI agent, your definition of done.
- `PHASE_PLAN.md` — exactly what you build in each phase (P0–P7), as checklists. Tick items as they merge.
- `TASK_ORDER.md` — **generated**: every task in the order to do it (Step 1, 2, 3…), same as the Step numbers in MENO Hub. Regenerate with `npm run task-order` in `project-management/`.
- `NOTES.md` (optional, create it yourself) — your learning notes, decisions you want reviewed. Not for secrets.

**Nitheesh manages everything**: he is the second reviewer on every path, sets priorities, and has the final say on scope, architecture and releases.

| Member | Role | Folder | Main paths owned |
|---|---|---|---|
| Nitheesh | Tech Lead & Full-stack Engineer (manages the team) | [nitheesh/](nitheesh/README.md) | Platform, finance, dashboards, reports, CRM (full stack); auth/sync/notifications/integrations backend; architecture, contracts |
| Prakalya | Business Analyst + QA · part-time, ~40 tasks | [prakalya/](prakalya/README.md) | `docs/product`, `docs/business-requirements`, `docs/workflows`, compliance research |
| Kamesh | Backend Engineer | [kamesh/](kamesh/README.md) | Backend modules catalog, party, pricing, purchase, inventory, sales, returns, compliance, taxation + their migrations |
| Meyyarivu | Frontend Lead + QA | [meyyarivu/](meyyarivu/README.md) | `packages/ui`, `packages/validation`, `docs/design`, app shell; web auth, purchase, inventory, pos, wholesale, pricing, gst |
| Ashok | QA Lead + Frontend | [ashok/](ashok/README.md) | `docs/testing`, `apps/web/tests/e2e`, backend `scenarios/` tests, API collections; QA task per module per phase; web catalog, parties, returns, compliance, reports |
| Jeeva | DevOps Engineer | [jeeva/](jeeva/README.md) | `infrastructure/`, `.github/workflows`, `docker-compose.yml`, Dockerfiles, desktop packaging |

## Frontend split (Meyyarivu, Nitheesh, Ashok take all the screens)

```
apps/web/src/features/
  auth/ purchase/ inventory/ pos/ wholesale/ pricing/ gst/                → Meyyarivu (+ app shell, packages/ui)
  company/ branches/ users/ settings/ admin/ dashboard/ accounting/ payments/ crm/ → Nitheesh
  catalog/ parties/ returns/ compliance/ reports/                                  → Ashok
```

Everything is derived from [OWNERSHIP_MATRIX.md](../OWNERSHIP_MATRIX.md); change that file first.

How we avoid stepping on each other: [../CONFLICT_FREE_COLLABORATION.md](../CONFLICT_FREE_COLLABORATION.md).
