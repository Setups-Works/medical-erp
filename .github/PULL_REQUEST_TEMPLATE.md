## What & why
<!-- One or two sentences. Link the issue. -->
Closes #

Feature ID: <!-- e.g. PUR-02 -->

## How it was tested
- [ ] Unit tests
- [ ] Integration tests (incl. cross-tenant 404 for new endpoints)
- [ ] Manual check on local / staging
<!-- Paste evidence: test output, screenshots (light + dark for UI), API responses -->

## Checklist
- [ ] Stayed within my owned paths (or the owner approved)
- [ ] Money uses BigDecimal / decimal.js; stock only via movements
- [ ] New migration is new (no edits to applied ones); RLS + indexes added
- [ ] OpenAPI / api-client regenerated if the API changed
- [ ] UI: tokens only, `pnpm check:design` passes, keyboard-operable
- [ ] Docs updated (folder AGENTS.md, CURRENT_STATE, DATA_MODEL, ADR if architectural)
- [ ] No secrets, no real customer/patient data
- [ ] AI-generated code reviewed line by line by me
- [ ] No AI attribution lines (`Co-Authored-By`, "Generated with …") in commits or this description

## Migration / deploy notes
<!-- New env vars, data migrations, feature flags, rollback steps. "None" if none. -->
