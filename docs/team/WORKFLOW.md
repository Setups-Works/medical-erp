# Development workflow

> ## 🚫 Never push to `main` (or `develop`). Always: branch → commit → push branch → Pull Request.
>
> ```bash
> git checkout develop && git pull
> git checkout -b feature/123-purchase-entry-grid
> # …work, commit…
> git push -u origin feature/123-purchase-entry-grid
> # open a PR into develop on GitHub, fill the template, request review
> ```
>
> This applies to every member **and every AI agent**. Branch protection blocks direct pushes, force-pushes and merging your own PR. Only Nitheesh merges `release/*` / `hotfix/*` into `main`, through a PR.

## Branches

```
main        production; tagged releases only (vX.Y.Z)
develop     integration; auto-deploys to staging
feature/<issue#>-name   from develop
bugfix/<issue#>-name    from develop
release/vX.Y            from develop at phase gate; only fixes
hotfix/<issue#>-name    from main; merged back to main + develop
```

Protection: no direct pushes to `main`/`develop`; PR + 1 CODEOWNER approval + green CI; `main` also needs Nitheesh + QA label `qa-approved`.

## Issue lifecycle (MENO Hub + GitHub)

Day-to-day tasks live in **MENO Hub** (`project-management/`, one board per phase). Code changes still go through GitHub branches and PRs: put the Hub task number in the branch and PR (`feature/123-purchase-grid`, "Hub #123").


`Backlog → Ready (story + AC + estimate) → In progress → In review → QA → Done`

An issue enters **Ready** only when it has: feature ID, user story, acceptance criteria, test notes, owner, estimate (S ≤ 1 day, M ≤ 3 days, L ≤ 5 days — anything bigger is split). Nitheesh moves items to Ready in sprint planning.

## Labels

`area:backend` `area:web` `area:desktop` `area:infra` `area:docs` · `type:feature` `type:bug` `type:chore` `type:spike` · `phase:P1`… · `sev:S1`…`S4` · `edition:retail|wholesale|both` · `needs:ba` `needs:design` `blocked` · `qa-approved`

## Commits

**No AI attribution.** Never add `Co-Authored-By:` lines for AI tools (Claude, Copilot, Cursor, Gemini) or "Generated with …" footers to commits or PR descriptions. The developer is the author and is responsible for the code.

Conventional Commits with scope = module or feature:

```
feat(inventory): add FEFO batch selection
fix(pos): prevent double submit on F10
test(purchase): cover free-quantity scheme posting
docs(architecture): add sync conflict policies
chore(ci): cache maven dependencies
```

## Pull requests

Use the template. Must include: linked issue, what/why, screenshots for UI (light + dark), test evidence, migration notes, docs updated checkbox. Reviewers respond within 1 working day.

## Ceremonies

| When | What | Who |
|---|---|---|
| Daily 10:00, 1 h | Team meeting: stand-up, board walk, topic of the day, pairs ([WHAT_TO_BUILD_FIRST.md](WHAT_TO_BUILD_FIRST.md) §4) | All, run by Nitheesh |
| Sprint day 1 | Planning (2 h): pick Ready issues, assign, confirm contracts needed | All |
| Weekly Wed | Architecture office hour | Nitheesh + anyone |
| Weekly Thu | Backlog grooming for next sprint | Prakalya + Nitheesh (+ Ashok) |
| Sprint last day | Demo on staging (1 h), retrospective (45 min) | All |
| Every 2 weeks | 1:1 | Nitheesh with each member |

## Definition of Ready / Done

- **Ready:** see issue lifecycle above.
- **Done:** code merged to `develop`; tests (incl. cross-tenant for endpoints); docs updated; deployed to staging; Ashok verified ACs; Prakalya accepted (for features).

## Releases

Phase gate → `release/vX.Y` → regression on staging → QA report → Nitheesh go → merge to `main` + tag → production deploy → release notes.

Deploys are automatic (`.github/workflows/deploy-api.yml`, ADR-0017): every merge to `develop` deploys staging, every merge to `main` deploys production, each with a smoke test. So merging into `main` **is** the production release; the gate is the release PR review (plus required reviewers on the `production` GitHub Environment once enabled). Rollback: `docs/runbooks/rollback.md`.
