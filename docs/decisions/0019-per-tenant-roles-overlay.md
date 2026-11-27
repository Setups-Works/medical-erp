# ADR-0019: Per-tenant roles as an overlay on MENO's default roles

- Status: Proposed
- Date: 2026-11-27
- Deciders: Nitheesh

## Context
ROLES_AND_DASHBOARDS.md says roles are bundles of permissions, the listed roles are seeded defaults, and "each tenant can edit them or create new ones" (PLT-07). Until now `role` and `role_permission` were one global seed, and every module adds its permissions with a migration that inserts default `role_permission` rows (`insert into role_permission (role, permission_code) values ('OWNER', 'party.customer.create')`). Codes such as `OWNER` are referenced by `user_role`, `invitation.role_code` and the JWT `roles` claim. Whatever we pick must keep tenant isolation (ADR-0006), keep permissions as data (ADR-0014), and not make every future module migration harder.

## Options considered
1. **Copy the defaults into every tenant** at sign-up (`role(id, tenant_id, …)`, all rows tenant-owned). + Simple reads. − A later migration that adds a default permission must also back-fill every tenant's copy, and must guess which tenants changed the role on purpose; role codes stop being stable keys (user_role / invitation would need `(tenant_id, code)` keys); bigger migration now.
2. **Overlay: shared defaults, per-tenant overrides.** Defaults stay global (`tenant_id` null). A tenant's own roles and its edited permission lists are rows with its `tenant_id`; `role_override(tenant_id, role)` marks "this tenant owns this role's list". + Module migrations keep seeding exactly as today; a new default permission reaches every tenant that hasn't edited that role; role codes stay the key everywhere. − Reading permissions needs one extra lookup (the override), and a tenant that edited a role doesn't get later default additions for it (it can reset).
3. **Per-tenant permission deltas** (granted / revoked rows on top of the defaults). + Edited roles still get new defaults. − Hard to explain on screen ("why does Pharmacist have this?"), two kinds of rows to reason about in every query and test.

## Decision
Option 2 (V202611271600):
- `role.tenant_id` null = MENO default role, shared by every tenant; set = that tenant's own role (generated code `CUSTOM_…`, always invitable, never every-branch or locked). `role.locked` marks roles that can't be edited (Business owner: every permission, ROLES_AND_DASHBOARDS.md). Own roles are archived, never deleted, so history keeps their names.
- `role_permission.tenant_id` null = the default list; set = the tenant's own list for that role, used **only** when `role_override(tenant_id, role)` exists (own roles always have one). Effective permissions: `rp.tenant_id is not distinct from (select tenant_id from role_override where tenant_id = :t and role = :r)`.
- RLS on `role` and `role_permission`: defaults readable by everyone, rows readable and writable only by their tenant; `role_override` per tenant.
- `PermissionChecker` resolves per (tenant, role) and caches for 30 s; identity evicts the tenant on its instance after commit, other instances catch up within the TTL.
- After every role or permission change, someone active must still hold `identity.user.manage` and `identity.role.manage`, or the change rolls back (IDENTITY_LAST_ADMIN).
- `permission_module(code, label, sort_order)` gives each module's permissions a heading on screen.

## Consequences
+ Module migrations don't change: keep inserting default `role_permission` rows. **New rule:** a module's first permission migration also inserts its `permission_module` row.
+ Tenant isolation is enforced in SQL as well as in the services; another tenant's role answers 404 (cross-tenant tests in `RoleAdminIntegrationTest`, `PermissionAdminIntegrationTest`).
− A tenant that edited a default role stops receiving new default permissions for it. The role screen shows "Changed" and offers reset; when a release adds permissions that edited roles should get, the release notes must say so (or a migration adds them to tenants' lists explicitly).
− Permission changes take up to 30 s to reach other API instances, and role assignments reach a person on their next token refresh (15 min). Acceptable for back-office settings; revisit if instant revocation is needed (e.g. a Redis invalidation channel when Redis lands).
− Super Admin (`platform.*`) permissions are not part of this model yet; they must never be grantable to tenant roles when they arrive.
