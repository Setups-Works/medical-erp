# MENO Hub — team project management

The team's own project-management app for building MENO: sign-in, boards (one per phase + the product backlog), drag-and-drop tasks, assignees, comments with @mentions, notifications and **live updates for everyone** (no refresh). It uses the same paper-and-ink design language as MENO (Light/Dark, Geist, hairline cards, lucide icons).

It is a **separate app** from the MENO product: own `package.json`, own `.env`, own MongoDB. It does not use Spring Boot, Docker or anything under `apps/`.

## Stack

Next.js 15 (App Router, route handlers) · React 19 · TypeScript · Tailwind v4 · Radix · dnd-kit · SWR · MongoDB + Mongoose · jose (signed session cookie) · bcrypt · Server-Sent Events for live updates.

## Run locally

```bash
cd project-management
npm install
cp .env.example .env.local    # then fill in MONGODB_URI, HUB_SESSION_SECRET, SEED_DEFAULT_PASSWORD, HUB_TEAM_EMAILS
npm run dev                   # http://localhost:4100
```

On the first start with an empty database the app creates the 6 team accounts (emails from `HUB_TEAM_EMAILS`, password `SEED_DEFAULT_PASSWORD`, everyone must change it on first sign-in) and imports the plan from `../docs`:

- **P0–P7 boards**: every checklist item from `docs/team/members/<name>/PHASE_PLAN.md`, assigned to that member.
- **Features**: every row of `docs/product/FEATURES.md`, placed on its phase board as a full slice (story → API → screen → QA).
- **Production readiness**, **critical test scenarios**, **compliance checks**, **runbooks** and one **phase gate** per phase (`docs/planning/PRODUCTION_READINESS.md`, `docs/testing/TEST_STRATEGY.md`, `docs/compliance/COMPLIANCE.md`, `docs/runbooks/README.md`).
- **QA tasks**: one per module per phase for Ashok, listing every feature to test.
- **Pages, roles and features** for the Features, Pages and Product map screens (`docs/product/PAGES.md`, `ROLES_AND_DASHBOARDS.md`, `FEATURES.md`).
- **Owners** come from `docs/team/OWNERSHIP_MATRIX.md`; change an owner there and re-run `npm run seed` to reassign tasks that haven't started and weren't reassigned by hand.
- **Ideas & later**: an empty board for new requests.

When every task is Done, MENO is in production.

After you edit those docs, run `npm run seed` to import new items. It never duplicates or overwrites existing tasks.

AI agents work tasks by number with `npm run agent-task -- <show|start|check|comment|review> <n>` (acts as `HUB_AGENT_AS`; never moves to Done). See `../docs/team/AGENT_TASK_WORKFLOW.md`.

Without `MONGODB_URI` (development only) the app starts an in-memory MongoDB; data is lost on restart.

### Troubleshooting

- **"missing required error components, refreshing..."**: the `.next` folder holds a production build from `npm run build`. Stop the dev server, run `rm -rf .next`, then `npm run dev` again. Don't run `npm run build` while `npm run dev` is running; both write to `.next`.

## Environments

| File | Use |
|---|---|
| `.env.example` | Template for local development → copy to `.env.local` |
| `.env.production.example` | Template for the server; real values only on the host |

Never commit `.env.local` or real emails/passwords (already in `.gitignore`).

## Deploy (production)

1. MongoDB Atlas M0 (free) cluster; allow only the server IP.
2. On the server (Azure VM or any Node 22+ host): `npm ci && npm run build && npm start` behind Nginx with TLS. Run it with a process manager (systemd/pm2).
3. Nginx: disable buffering for `/api/events` (`proxy_buffering off;`) so live updates stream.
4. One instance only (live updates use an in-process event bus). For several instances, switch `src/lib/events.ts` to MongoDB change streams.

## Features

| Area | What you get |
|---|---|
| Accounts | Email + password sign-in, 7-day session cookie, change password, admin adds members, forced password change on first sign-in |
| Boards | Phase boards, product backlog, custom boards; columns Backlog → To do → In progress → In review → QA → Done with WIP limits; progress bars |
| Tasks | Drag and drop, number (#123), assignees, priority, size (S/M/L), phase, due date, labels, checklist, description, archive |
| Collaboration | Task comments and board discussion with @firstname mentions; notifications for assignment, mention and comments on your tasks |
| Live | Every change appears for everyone instantly; "who's online" avatars; reconnects automatically |
| Views | Home (road to production, phase progress, my tasks, activity, workload), My tasks, Activity feed, search + filters on boards |
| Team member page | Each person's stats, tasks grouped by phase, progress per phase, recent activity, and their role guide from `docs/team/members/<name>/README.md` |
| Admin dashboard | Team progress table: every developer's total, pending, in-progress, review/QA and finished tasks (live) |
| Features | Checklist of all features from FEATURES.md, grouped by section, with phase/owner/status filters; ticking moves the task to Done |
| Pages | Checklist of all 255 screens from PAGES.md (A–P) with their feature status; tick a page when it is completed (who/when recorded) |
| Product map | MENO's app sidebar (`docs/design/NAVIGATION.md`) and capability list (`docs/product/COVERAGE.md`) with live status per menu item and feature |
| Task content | Every imported task has a description (what, why, read first, done when) and a role-specific checklist; editing a task stops the importer from overwriting it |
