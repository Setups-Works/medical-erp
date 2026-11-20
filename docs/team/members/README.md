# Team member folders

Each member has a folder with:

- `README.md` — role, what you own (paths), who you hand work to/from, your AI agent, your definition of done.
- `PHASE_PLAN.md` — exactly what you build in each phase (P0–P7), as checklists. Tick items as they merge.
- `NOTES.md` (optional, create it yourself) — your learning notes, decisions you want reviewed. Not for secrets.

**Nitheesh manages everything**: he is the second reviewer on every path, sets priorities, and has the final say on scope, architecture and releases.

| Member | Role | Folder | Main paths owned |
|---|---|---|---|
| Nitheesh | Product Owner, Tech Lead & PM (backend + frontend) | [nitheesh/](nitheesh/README.md) | Platform, finance, dashboards, reports, CRM (full stack); auth/sync/notifications/integrations backend; architecture, contracts |
| Prakalya | Business Analyst + Frontend (parties) · 40 tasks | [prakalya/](prakalya/README.md) | `docs/product`, `docs/business-requirements`, `docs/workflows`, compliance research; web `parties` |
| Kamesh | Backend Engineer | [kamesh/](kamesh/README.md) | Backend modules catalog, party, pricing, purchase, inventory, sales, returns, compliance, taxation + their migrations |
| Meyyarivu | Frontend Lead | [meyyarivu/](meyyarivu/README.md) | `packages/ui`, `packages/validation`, `docs/design`, app shell; web auth, purchase, inventory, pos, returns, wholesale, pricing, gst, compliance |
| Ashok | QA Engineer (QA only) | [ashok/](ashok/README.md) | `docs/testing`, `apps/web/tests/e2e`, backend `scenarios/` tests, API collections; QA task per module per phase |
| Jeeva | DevOps Engineer | [jeeva/](jeeva/README.md) | `infrastructure/`, `.github/workflows`, `docker-compose.yml`, Dockerfiles, desktop packaging |

## Frontend split

```
apps/web/src/features/
  auth/ catalog/ purchase/ inventory/ pos/ returns/ wholesale/ pricing/ gst/ compliance/ → Meyyarivu (+ app shell, packages/ui)
  parties/                                                                          → Prakalya
  company/ branches/ users/ settings/ admin/ dashboard/ reports/ accounting/ payments/ crm/ → Nitheesh
```

Everything is derived from [OWNERSHIP_MATRIX.md](../OWNERSHIP_MATRIX.md); change that file first.

How we avoid stepping on each other: [../CONFLICT_FREE_COLLABORATION.md](../CONFLICT_FREE_COLLABORATION.md).
