# ADR-0004: Electron desktop with SQLite offline billing

- Status: Accepted · Date: 2026-11-21 · Supersedes base-plan choice of Tauri

## Context
Pharmacy counters must bill during internet outages, print to thermal printers silently and read barcode scanners. Base plan proposed Tauri (small, Rust). The team knows TypeScript, not Rust; the sync engine is the riskiest code and should share types and calculation code with the web.

## Decision
Electron (main process in TypeScript) with better-sqlite3 + SQLCipher, a sync engine in TS, silent printing via Electron APIs, auto-update via electron-updater. Renderer = the web static build with a data-source switch (HTTP vs IPC).

## Consequences
+ One language end-to-end; `billing-engine`, `types`, `validation` shared. + Mature printing/update ecosystem.
− Larger installer (~100 MB) and RAM (~200–300 MB); acceptable on 4 GB counter PCs. Revisit Tauri if low-end hardware becomes a problem.
