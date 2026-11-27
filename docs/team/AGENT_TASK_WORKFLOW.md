# Agent task workflow (MENO Hub)

How an AI agent picks up a MENO Hub task **by its number**, works it, and hands it to review. Read this together with [AI_WORKFLOW.md](AI_WORKFLOW.md) (how to prompt and review agents) and [WORKFLOW.md](WORKFLOW.md) (branches, PRs).

```
To do ──start──▶ In progress ──review──▶ In review ──(Nitheesh, in the hub)──▶ Done
 (you)            (agent works,           (agent comments summary,
                   ticks checklist,         @nitheesh is notified)
                   comments)
```

| Who | Does |
|---|---|
| Developer | Picks the task (lowest open Step in **My tasks**), gives the agent the task number |
| AI agent | `start` → work → `check` items → `comment` progress → `review` |
| Nitheesh | Reviews the PR and the card, then moves it to **Done** in the hub (or back to In progress with a comment) |

**Agents never move a task to Done.** The script has no `done` command on purpose.

**Building a page?** Say "build the <X> page" to your agent: it runs `npm run agent-task -- start-page "<X>"` (creates the page's BE + FE tasks for you, moves them to In progress, prints a brief) and follows [BUILD_A_PAGE.md](BUILD_A_PAGE.md): SQL + backend + frontend on one branch, one PR. Nitheesh reviews and merges.

## One-time setup (each developer)

In `project-management/.env.local` (never committed):

```
MONGODB_URI=<hub database, ask Nitheesh>
HUB_AGENT_AS=<your hub first name or email>
```

The agent acts **as you**: its moves and comments show under your name in the hub, and it can only work tasks assigned to you. Changes reach everyone's open hub tab live.

## Commands

Run from `project-management/`. `<n>` is the task number shown on the card (`449` or `#449`).

| Command | What it does |
|---|---|
| `npm run agent-task -- show <n>` | Prints title, column, assignees, description, numbered checklist and comments. Read-only. |
| `npm run agent-task -- start <n>` | Moves the task from Backlog / To do to **In progress** and comments "Started (AI agent)." |
| `npm run agent-task -- check <n> 1 3 4` | Ticks checklist items by number (`all` ticks every item). |
| `npm run agent-task -- comment <n> "text"` | Adds a comment. `@name` mentions notify that person. |
| `npm run agent-task -- page "<name or route>"` | Prints a page's brief: features, docs to read, existing code, its BE / FE tasks. Read-only. |
| `npm run agent-task -- start-page "<name or route>"` | Takes a page: creates / links its BE + FE tasks for you, moves both to **In progress**, prints the brief. |
| `npm run agent-task -- review <n> "summary"` | Moves **In progress → In review** and posts the summary with `@nitheesh`. Refuses while checklist items are open unless you add `--allow-open`. |

## Steps for the agent

1. **Read the task.** `show <n>`. If the description or checklist is unclear, or the task needs a business/tax rule that isn't in `docs/`, `comment` the question (mention the owner, e.g. `@prakalya`) and stop. Don't guess.
2. **Start it.** `start <n>`. Then follow the normal repo flow: branch from `develop` (`feature/<issue#>-short-name`), read the `AGENTS.md` of every folder you touch.
3. **Work and tick as you go.** Tick an item with `check <n> <item>` only when it is really finished (code + tests + docs for that item), not when you plan to do it.
4. **Comment progress** at meaningful points: plan agreed, blocker hit, PR opened. Keep comments short and factual: what was done, what's next, links.
5. **Verify.** Backend `./mvnw verify`; frontend `pnpm typecheck && pnpm test && pnpm check:design`; docs-only tasks: links and tables render. Open the PR (no AI attribution, `Closes #<issue>`).
6. **Send to review.** `review <n> "<summary>"` with:
   - what changed (2–4 lines)
   - PR link
   - how it was verified (commands run, results)
   - anything unsure or left open

   If an item can't be finished in this task, don't tick it: use `--allow-open` and say why in the summary.
7. **Stop.** Do not start the next task until the developer says so. If Nitheesh sends it back (moves it to In progress with a comment), read the comment with `show <n>`, fix, and `review` again.

## Example

```bash
npm run agent-task -- show 512
npm run agent-task -- start 512
npm run agent-task -- comment 512 "Plan: add Flyway V202611211200__party.sql, PartyFacade, tests. Branch feature/42-party-master."
npm run agent-task -- check 512 1 2
npm run agent-task -- check 512 3
npm run agent-task -- review 512 "Party master API + migration. PR: https://github.com/<org>/meno/pull/57. ./mvnw verify green, cross-tenant test added."
```

## For Nitheesh (review)

Open the card from the notification. Check the PR, the ticked checklist and the summary. Then either move it to **Done** in the hub, or move it back to **In progress** with a comment saying what to fix. A task is Done only when its PR is merged.

## Rules

- Only work tasks assigned to you; the script refuses others. Ask Nitheesh to reassign.
- One task in progress at a time (the script warns if you already have one).
- Never paste secrets, passwords, connection strings or real patient/customer data into comments.
- Checklist ticks are permanent progress: after a tick, `npm run seed` no longer regenerates that card's checklist.
