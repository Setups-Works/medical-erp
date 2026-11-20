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

## Error codes
IDENTITY_EMAIL_TAKEN, IDENTITY_LAST_ADMIN, IDENTITY_PERMISSION_DENIED

## Module rules
1. Permission strings are `module.resource.action`; each module seeds its own via a migration.
2. A tenant must always keep at least one Company Admin.
3. Permission checks live in services, not only controllers.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
