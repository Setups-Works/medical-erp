# project-management (MENO Hub) — AGENTS.md

Internal team tool, **not part of the MENO product**. Owner: Nitheesh. Read `README.md` first.

## Layout

```
src/app/(app)/        Signed-in pages: home, boards, boards/[id], my-tasks, team, activity, settings
src/app/login/        Sign-in page; forgot-password/ + reset-password/ (email link)
src/app/api/          Route handlers: auth, users, boards, tasks, comments, activity, notifications, stats, events (SSE)
src/components/       Shell, kanban, task-card, task-dialog, comments, feeds, date-picker, ui (primitives)
src/lib/              db (Mongo connection), models (Mongoose), session (jose), api (route wrapper), events (live bus), mail (SMTP),
                      actions (activity/notify/mentions), seed-runner (imports ../docs), client (SWR hooks), types
scripts/seed.ts       npm run seed: re-import the plan
scripts/agent-task.ts npm run agent-task: AI agents start/tick/comment/review a task by number (docs/team/AGENT_TASK_WORKFLOW.md)
```

## Rules

1. Same design language as MENO (`../docs/design/DESIGN_LANGUAGE.md`): tokens in `src/app/globals.css` only, Light/Dark, no raw hex in components, lucide icons, no native alert/confirm/date inputs.
2. Every API route goes through `route()` in `src/lib/api.ts` (session check + error mapping) and validates input with Zod.
3. Every mutation must call `logActivity`, `publish(...)` (live update) and `notify` where a person is affected.
4. Never put real emails, passwords or connection strings in code. They belong in `.env.local` (`HUB_TEAM_EMAILS`, `SEED_DEFAULT_PASSWORD`, `MONGODB_URI`, `HUB_SMTP_*`).
5. Branch + PR like the rest of the repo. Never push to `main`.
