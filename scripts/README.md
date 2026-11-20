# scripts

Repo tooling (Node scripts unless noted). Planned for P1:

| Script | Owner | Purpose |
|---|---|---|
| `design/check-design.mjs` + `design/rules.mjs` | Meyyarivu | Design-language lint on added lines (DESIGN_LANGUAGE §13) |
| `gen-api.mjs` | Nitheesh | OpenAPI → `packages/api-client/src/generated` |
| `vectors-validate.mjs` | Ashok | JSON-schema check for `contracts/test-vectors` |
| `seed/` | Kamesh | Synthetic demo data for local/staging |
| `new-module.sh` | Nitheesh | Scaffold a backend module from the template |
