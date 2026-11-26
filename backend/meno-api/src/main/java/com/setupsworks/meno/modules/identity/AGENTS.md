# Module `identity` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P1 · **Features:** PLT-06, PLT-07

## Purpose
Users, invitations, roles, permissions, user–branch access.

## Owns tables
app_user, role, permission, role_permission, user_role, user_branch, invitation

## Public API (`identity.api`)
PermissionChecker.require(perm), UserDirectory

## Events published
UserInvited, RoleChanged

## Allowed dependencies
tenancy::api

## Built so far (P1, 26-11-2026)
- `app_user`, `user_role` (V202611261701). `CredentialCheck` (api): password check + lockout (`meno.identity.max-failed-attempts`, `lock-duration`), same result for unknown email and wrong password.
- `BootstrapOwner`: first tenant + OWNER from `MENO_BOOTSTRAP_*` on an empty DB (until sign-up PLT-01).
- `Role` enum is temporary: replace with role / permission / role_permission tables (ADR-0014).
- Open: Argon2id (THREAT_MODEL) needs BouncyCastle → tech-lead approval; bcrypt via the delegating encoder until then.

## Error codes
IDENTITY_EMAIL_TAKEN, IDENTITY_LAST_ADMIN, IDENTITY_PERMISSION_DENIED

## Module rules
1. Permission strings are `module.resource.action`; each module seeds its own via a migration.
2. A tenant must always keep at least one Company Admin.
3. Permission checks live in services, not only controllers.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
