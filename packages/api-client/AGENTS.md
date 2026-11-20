# @meno/api-client — AGENTS.md

Owner: Nitheesh. `src/generated/` is produced from `contracts/openapi/meno-api.yaml` by `pnpm gen:api` — **never edit by hand**; resolve conflicts by regenerating. `src/client.ts` is a thin wrapper: base URL, credentials/cookies (web) or bearer (desktop), `X-Branch-Id`, `Idempotency-Key`, Problem Details → typed `ApiError`.
