# Agentic coding at MENO

Every member pairs with an AI agent (Claude Code, Cursor, Copilot, Gemini). This guide makes the agents produce code that fits — and keeps humans responsible.

## The golden rules

1. **You own every line the agent writes.** Read the diff before you commit. "The AI wrote it" is not a review comment.
2. **Issue first.** The agent works from a GitHub Issue with acceptance criteria, never from a vague prompt.
3. **Scope the agent** to folders. State what it must not touch.
4. **Tests first** for business rules: ask for failing tests from the acceptance criteria, check them, then ask for the implementation.
5. **Docs are the agent's memory.** If you had to explain something to the agent twice, put it in the right `AGENTS.md`.
6. **Never paste secrets, real customer or patient data** into prompts.
7. **No AI attribution in git.** Agents must not add `Co-Authored-By` lines or "Generated with" footers to commits or PRs. If your tool adds one automatically, turn it off (Claude Code: `includeCoAuthoredBy: false` in `.claude/settings.json`).

## Working a MENO Hub task

Agents start, update and hand off hub tasks by number with `npm run agent-task` (in `project-management/`): start → tick checklist → comment → review. Only Nitheesh moves a task to Done. Full steps: [AGENT_TASK_WORKFLOW.md](AGENT_TASK_WORKFLOW.md).

## How context reaches the agent

```
AGENTS.md (root)                      ← always loaded (CLAUDE.md/GEMINI.md/.cursor/copilot point here)
 └─ <folder>/AGENTS.md                ← read for each folder touched
     └─ docs/...                      ← linked from AGENTS.md: architecture, glossary, design, data model
 └─ .claude/agents/<role>.md          ← role sub-agent with its checklist
 └─ the GitHub Issue                  ← what to build now
```

## Role agents (`.claude/agents/`)

| Agent | Used by | Does |
|---|---|---|
| `backend-engineer` | Kamesh, Nitheesh | Spring module work following the module recipe |
| `frontend-engineer` | Meyyarivu, Nitheesh, Ashok | Screens with the design system and TanStack Query |
| `qa-engineer` | Ashok | Test cases, Playwright, API and scenario tests |
| `devops-engineer` | Jeeva | Dockerfiles, Compose, workflows, Bicep, runbooks (never applies to Azure) |
| `business-analyst` | Prakalya | Stories, FRS sections, workflow diagrams, FEATURES coverage |
| `architecture-reviewer` | Nitheesh (and anyone before opening a PR) | Reviews a diff against AGENTS.md rules |

## Prompt template (copy into your agent)

```
Issue: #<n> <title>
Feature ID: <e.g. PUR-02>
Role: use the <backend-engineer|frontend-engineer|...> agent.
Scope: only change <paths>. Do not touch <paths>.
Read first: AGENTS.md, <folder>/AGENTS.md, <docs links>.
Acceptance criteria:
- ...
Steps:
1. Propose a short plan and list files you'll change. Wait for my OK.
2. Write tests from the acceptance criteria (they should fail).
3. Implement until tests pass.
4. Run <verify commands>. Fix all failures.
5. Update docs: <CURRENT_STATE row / DATA_MODEL / folder AGENTS.md>.
6. Summarise what changed and anything you were unsure about.
```

## Review checklist for agent output

- [ ] Stayed inside scope; no unrelated formatting changes
- [ ] No invented business/tax rule (compare with the story and CALCULATIONS.md)
- [ ] Money as BigDecimal/decimal.js; no floats
- [ ] Tenant from context only; cross-tenant test present
- [ ] No new dependency without justification
- [ ] Tokens only in UI; `check:design` passes
- [ ] Tests actually assert behaviour (not just "doesn't throw")
- [ ] Docs updated

## When the agent is wrong

Fix the code **and** the docs that misled it. Record repeated agent mistakes in the folder `AGENTS.md` under "Mistakes to avoid".
