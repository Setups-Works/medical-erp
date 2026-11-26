@AGENTS.md

# Claude Code specifics

- Prefer Read/Edit/Write over shell heredocs when changing project files.
- Role sub-agents live in `.claude/agents/` (backend-engineer, frontend-engineer, qa-engineer, devops-engineer, business-analyst, architecture-reviewer). Use the one that matches the folder you are changing.
- Before finishing a task: backend `./mvnw verify`, frontend `pnpm typecheck && pnpm test && pnpm check:design`.
- Don't commit or push unless asked. Branch from `develop`, never commit `.env*`, use Conventional Commits.
- **Never add AI attribution**: no `Co-Authored-By: Claude` lines in commits and no "Generated with Claude Code" footer in PRs.
- Given a Hub task number, keep its card updated with `npm run agent-task` (AGENTS.md §8, "Keep MENO Hub updated").- Ask before destructive actions (dropping data, editing applied migrations, rotating keys, touching Azure).
- The project is in the FOUNDATION phase: if the issue doesn't say "implement", produce docs/plans, not code.
