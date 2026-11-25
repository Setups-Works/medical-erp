# ADR-0016: Tamper-evident records and device-signed offline bills

- Status: Proposed
- Date: 2026-11-24
- Deciders: Nitheesh (+ Jeeva, Kamesh)

## Context
Posted invoices, vouchers, stock movements and the Schedule H1 / X / NDPS registers are legal and financial records. Rule 6 makes them immutable in the application, but someone with database access (an insider, a compromised admin credential, a restored backup) could still change a row, and nothing would show it. Offline desktops create bills that the server only sees later; a copied or forged SQLite file could inject bills. Auditors, drug inspectors and enterprise customers will ask how MENO proves records were not altered (THREAT_MODEL.md §3, §4).

## Options considered
1. **Database permissions only** (no UPDATE / DELETE grants on posted tables). Cheap, but a superuser or restored backup bypasses it and nothing proves integrity afterwards.
2. **Hash chain per series with daily anchors.** Each posted record stores `hash = SHA-256(prev_hash ‖ canonical_json(record))`; every day the head hash of each chain is signed with a server key and stored in an append-only anchor table plus an external copy (object storage with immutability). A verifier recomputes chains. Low cost, works on PostgreSQL, explainable to auditors.
3. **External ledger / blockchain service.** Strong, but adds a dependency, cost and complexity a pilot does not need.

For offline bills: (a) trust the device's login token only; (b) **per-device Ed25519 key pair** created at device registration, private key in the OS keystore, each offline bill signed over its canonical form, public key held by the server.

## Decision
We will use option 2 for posted documents, statutory registers and the audit log, and option (b) for offline bills.
- Chains are per tenant + branch + document series (and per register), so they stay short and parallel.
- Canonical JSON (sorted keys, strings for numbers) is defined in `contracts/` and shared by Java and TS.
- The verifier is a platform job (nightly) and an auditor tool (`/admin/audit` → "Verify records"); a break raises an S1 alert.
- Sync rejects offline bills whose signature fails or whose device is revoked; rejected bills are quarantined for review, never silently dropped.
- Signing keys are versioned (`kid`) in Key Vault and rotated yearly (SEC-03, SEC-04).

## Consequences
- Good: alterations become detectable and provable; auditors get a verification report; forged offline bills are rejected.
- Cost: one hash per posted row (negligible), an anchor job, a verifier, and a canonical-JSON contract that must never change silently (versioned like test vectors).
- Must do: SEC-01 and SEC-02 features; canonical JSON spec in `contracts/sync/`; tests for chain break and bad signature (THREAT_MODEL.md §5, cases 3 and 4); runbook `chain-break.md`.
