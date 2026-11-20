# apps/desktop — AGENTS.md

Electron app for counter PCs (Windows first, macOS second). Wraps the `apps/web` static build and adds: offline SQLite store, sync engine, silent printing, barcode scanners, device registration and auto-update. Design: `docs/architecture/OFFLINE_SYNC.md`, ADR-0004.

Owners: Nitheesh (`src/main`, `src/offline`, `src/preload`), Jeeva (packaging, signing, updater feed), Meyyarivu (renderer UI lives in `apps/web`).

## Layout

```
src/
  main/            App lifecycle, windows, menus, deep links, single-instance lock, IPC handlers registration
  preload/         contextBridge exposing a NARROW typed API as window.meno (no Node in renderer)
  offline/
    db/            better-sqlite3 + SQLCipher connection, schema, migrations/ (numbered SQL)
    repositories/  Local reads/writes (items, batches, customers, outbox docs)
    sync/          Push/pull engine, backoff, cursors, conflict intake, status events
  devices/
    printer/       Thermal (ESC/POS) + A4/A5 via webContents.print; printer profiles per counter
    scanner/       HID scanner detection helpers (most scanners are keyboards)
  updater/         electron-updater wiring, channels (stable/beta), staged rollout
resources/icons/   App icons (generated from brand SVG)
tests/             Vitest for offline/sync logic; Playwright-Electron smoke (Ashok)
```

## Rules

1. Security: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, strict CSP, no `remote`. Every IPC channel validates input with Zod.
2. The preload API is the contract: `window.meno.{local, sync, print, device, app}`; types in `packages/types/src/desktop.ts`. Changing it = PR reviewed by Nitheesh + Meyyarivu.
3. Local data is a **read-only snapshot + outbox**. Never edit reference data locally.
4. Every outbox document has a UUIDv7, device id and a local number from the device's series block.
5. All money maths through `@meno/billing-engine`.
6. Never log patient names, Rx details or tokens. Logs go to a rotating file + Sentry (scrubbed).
7. Sync engine must be idempotent and resumable after crash/power cut at any line (use SQLite transactions).

## Scope by phase

P4: online-only shell (window, printing, scanner, updater). P5: offline store + sync + device registration + status bar.
