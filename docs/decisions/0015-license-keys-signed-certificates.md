# ADR-0015: License keys with server-side licenses and signed certificates

- Status: Proposed
- Date: 2026-11-22
- Deciders: Nitheesh

## Context
MENO is sold to pharmacy businesses. The MENO team (super admin) must create a license for each buyer with a plan, edition, limits and an expiry, and the buyer must switch MENO on by entering a key. Licensing must also work for the **offline desktop** (ADR-0004), must never put sales or stock data at risk (AGENTS.md §1), and plans must be data, not code (ADR-0014). Details: `docs/architecture/LICENSING.md`.

## Options considered
1. **Self-contained signed key** (the key itself is a signed blob holding plan and dates). Works offline with no server, but keys are long and hard to type, can't be revoked or extended, and limits can't change without a new key.
2. **Random key + server-side license only.** Short, typeable, revocable, extendable. But the offline desktop can't check anything without the server.
3. **Random key + server-side license + short-lived signed certificate.** Short typeable key for the buyer; the server is the source of truth; the server issues an Ed25519-signed certificate (plan, limits, dates, 7-day lifetime) that the desktop verifies offline.
4. **Third-party licensing service** (e.g. a SaaS licensing provider). Less code, but another vendor with tenant data, cost, and it doesn't know our plans and limits.

## Decision
We will use **option 3**. Licenses and plans live in PostgreSQL in the `subscription` module. Keys are `MENO-XXXXX-XXXXX-XXXXX-XXXXX` (Crockford Base32, 95 random bits + Luhn mod-32 check character), stored only as an HMAC hash. Activation binds a license to a tenant. The server enforces entitlements through `EntitlementGuard` on every protected action; the signed certificate is used by the desktop offline and for display only. Time-based states (expiring, grace, expired) are computed from dates, never stored. After grace the tenant enters restricted mode that never blocks viewing, exporting or syncing bills already made.

## Consequences
- Good: short keys, revocation and extension without new keys, works offline, plans are data, a DB leak exposes no keys.
- Must now: keep an Ed25519 signing key and an HMAC pepper in secrets with a rotation runbook; ship public keys (by `kid`) in web and desktop builds; add `EntitlementGuard` checks to user, branch, device and document creation; write cross-tenant, permission, tampering, revocation and expiry-sync tests.
- Bad: a desktop that stays offline keeps working for up to one certificate lifetime after a revoke (7 days by default, configurable). A determined user can patch the desktop binary; we accept that, because the server (where all data syncs) is the real enforcement point.
- ⚠ Open: grace length, exactly what restricted mode blocks, soft vs hard invoice limit, prices. Nitheesh decides before LIC-06 is built.
