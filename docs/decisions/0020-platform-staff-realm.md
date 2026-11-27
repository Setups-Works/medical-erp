# ADR-0020: A separate realm for MENO platform staff

- Status: Proposed
- Date: 2026-11-27
- Deciders: Nitheesh

## Context
`/platform/*` pages (Super Admin, ROLES_AND_DASHBOARDS.md "SA") start with Reference data (PLT-22). Nothing existed for them: every `app_user` belongs to a tenant (`tenant_id not null`), every token carries a `tid`, and RLS is keyed on that tenant. MULTI_TENANCY.md sketches a `PLATFORM_ADMIN` role with a `BYPASSRLS` connection; SECURITY.md control 14 asks for a "separate admin realm". ADR-0019 notes that `platform.*` permissions must never be grantable to tenant roles.

## Options considered
1. **Separate platform users and token** (`platform_user`, own login, token with no tenant that only `/api/v1/platform/*` accepts). + Tenant identity, roles and RLS untouched; a tenant role can never hold platform power because the two never share tables or claims. − A second login and a small amount of parallel code.
2. **Nullable tenant on `app_user`** with a `PLATFORM_ADMIN` role. + One login. − Every tenant query, RLS policy and token check must now handle "no tenant"; one missed check leaks across tenants.
3. **MENO's own tenant** whose owner gets `platform.*`. + Quickest. − Platform power rides on a normal tenant login and the tenant role model (exactly what ADR-0019 warns against).

## Decision
Option 1 (V202611272000, module `platform`):
- `platform_user` (+ `platform_permission`, `platform_user_permission`), RLS so only the platform realm or the sign-in bypass sees them. The first staff member comes from `MENO_PLATFORM_BOOTSTRAP_EMAIL / _PASSWORD` on an empty table and gets every platform permission.
- `POST /api/v1/platform/auth/login` → ES256 token with `realm=platform`, `perms=[…]`, no `tid`, no `roles`, 1 h (configurable), **no refresh token**. Lockout after 5 wrong passwords for 30 min; rate limit 5/min per IP.
- `SecurityConfig`: `/api/v1/platform/**` accepts only platform tokens; every other endpoint rejects them (403). `TenantContextFilter` marks platform requests; `TenantAwareDataSource` sets `app.platform = on`, read by `app_platform()` in RLS policies.
- Platform permissions are checked by `PlatformAccess` from the token, never by `PermissionChecker` (tenant roles).
- **No tenant data from the platform realm yet**: nothing bypasses tenant RLS. Tenant access for support (MULTI_TENANCY.md: consent, time-boxed, audited, `BYPASSRLS` role) is a later decision when the first page needs it.
- Web: separate in-memory session and API client (`refreshOnUnauthorized: false`), routes `/platform/login` and `/platform/*`.

## Consequences
+ Tenant code paths are unchanged; the realm check is one place in `SecurityConfig` and covered by `PlatformReferenceDataIntegrationTest`.
+ Reference lists (not tenant-owned) get a clear owner: the platform realm writes them, tenants only read.
− Staff sign in again after an hour or a page reload. Acceptable for a privileged, low-traffic area.
− No MFA, staff management screen or general audit log yet: staff are added by the bootstrap or SQL, sign-ins are logged, and reference loads are recorded in `reference_dataset_load`. Hardware-key MFA and JIT elevation come with SEC-06 (`/platform/privileged-access`, P5).
