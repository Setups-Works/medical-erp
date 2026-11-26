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
- `BootstrapOwner`: first tenant + OWNER from `MENO_BOOTSTRAP_*` on an empty DB.
- Sign-up (AUT-04 step 1): `SignupFacade` (api) → `SignupService` creates tenant + OWNER (mobile E.164) + `consent` in one transaction; Idempotency-Key replay; options (states, start options, terms version, password minimum) from data / `meno.signup.*`. Password minimum 10 (SECURITY.md). Not yet: mobile OTP + email link (`verification`, needs notification providers), rate limits (SEC-10).
- `Role` enum is temporary: replace with role / permission / role_permission tables (ADR-0014).
- Open: Argon2id (THREAT_MODEL) needs BouncyCastle → tech-lead approval; bcrypt via the delegating encoder until then.

## Error codes
IDENTITY_EMAIL_TAKEN (409), IDENTITY_PASSWORD_TOO_SHORT (400), IDENTITY_START_OPTION_INVALID (400), IDENTITY_TERMS_NOT_ACCEPTED (400), IDENTITY_SIGNUP_REJECTED (400, honeypot), IDENTITY_SIGNUP_CLOSED (403), COMMON_IDEMPOTENCY_MISMATCH (422), IDENTITY_LAST_ADMIN, IDENTITY_PERMISSION_DENIED

## Module rules
1. Permission strings are `module.resource.action`; each module seeds its own via a migration.
2. A tenant must always keep at least one Company Admin.
3. Permission checks live in services, not only controllers.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
