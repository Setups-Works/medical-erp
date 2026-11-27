# Module `identity` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P1 · **Features:** PLT-06, PLT-07

## Purpose
Users, invitations, roles, permissions, user–branch access.

## Owns tables
app_user, role, permission, role_permission, user_role, user_branch, invitation, invitation_branch

## Public API (`identity.api`)
PermissionChecker.require(perm), UserDirectory

## Events published
UserInvited, RoleChanged

## Allowed dependencies
<!-- built: tenancy::api, notification::api (EmailSender for one-time links: an event would store the raw token in event_publication) -->
tenancy::api

## Built so far (P1, 26-11-2026)
- `app_user`, `user_role` (V202611261701); mobile unique (`ux_app_user_mobile`, V202611262700). `CredentialCheck` (api): finds the user by email or mobile (`AppUser.normalizeMobile`), password check + lockout (`meno.identity.max-failed-attempts`, `lock-duration`), same result for unknown email and wrong password.
- `BootstrapOwner`: first tenant + OWNER from `MENO_BOOTSTRAP_*` on an empty DB.
- Sign-up (AUT-04 step 1): `SignupFacade` (api) → `SignupService` creates tenant + OWNER (mobile E.164) + `consent` in one transaction; Idempotency-Key replay; options (states, start options, terms version, password minimum) from data / `meno.signup.*`. Password minimum 10 (SECURITY.md). Email link built: `EmailVerification` (api) sends after commit through `notification.api.EmailSender` (SMTP); `/auth/verify-email`, `/auth/verify-email/resend`, `/auth/verification`. `OwnerEmailVerifiedCheck` implements tenancy's `GoLiveCheck`. Mobile OTP: `MobileVerification` (api) → `MobileVerificationService`: 6 digits, 5 min, 3 tries then IDENTITY_VERIFICATION_LOCKED (423), resend after 30 s (`meno.identity.verification.sms-*`), newest code only, hash salted with the row id, `verification.attempts` (V202611271000); SMS sent after commit through `notification.api.SmsSender`. Not yet: a real SMS provider (INT-02).
- `PasswordAccounts` (api) for the reset flow: `findForReset(email)` (active users only), `changePassword(userId, raw)` (policy check, clears lockout).
- `permission` / `role_permission` seed (V202611262101) read by `security/PermissionChecker` (permissions, never role names).
- Team step (AUT-09, 27-11-2026): `role` table (V202611271200, roles as data, `invitable` flag) + `invitation` / `invitation_branch` (RLS). `InvitationService` + `TeamController` `/api/v1/team`: `GET options` (invitable roles, branches via `tenancy.api.BranchDirectory`, `smsAvailable`, link days), `GET invitations` (page envelope), `POST invitations` (201), `POST invitations/{id}/resend`, `POST invitations/{id}/revoke`. Permissions `identity.invitation.view|manage` (OWNER). Link `meno.identity.invitation.link-base` + token (hash stored), valid `meno.identity.invitation.ttl` (7 d ⚠ to confirm), resend cooldown 60 s; sent after commit by email, and SMS when a provider is configured (mobile-only invites need SMS → 503 NOTIFICATION_CHANNEL_DISABLED). The first invite marks the TEAM step done (`tenancy.api.OnboardingSteps`). Duplicate checks run under RLS (this tenant only) so an invite never reveals another business's users; global one-email-one-user is enforced on acceptance. Not yet: accepting (`/api/v1/invitations/{token}`, proposed in `contracts/openapi/proposed/auth.yaml`), `user_branch`, the new role codes in the `Role` enum, counter PIN (PLT-10, P5).
- `Role` enum is temporary: replace with role / permission / role_permission tables (ADR-0014).
- Open: Argon2id (THREAT_MODEL) needs BouncyCastle → tech-lead approval; bcrypt via the delegating encoder until then.

## Error codes
IDENTITY_VERIFICATION_INVALID / IDENTITY_VERIFICATION_EXPIRED (400), IDENTITY_VERIFICATION_LOCKED (423), IDENTITY_ALREADY_VERIFIED (409), IDENTITY_VERIFICATION_TOO_SOON (429), IDENTITY_USER_NOT_FOUND (404), COMMON_PERMISSION_DENIED (403), IDENTITY_EMAIL_TAKEN (409), IDENTITY_MOBILE_TAKEN (409), IDENTITY_PASSWORD_TOO_SHORT (400), IDENTITY_START_OPTION_INVALID (400), IDENTITY_TERMS_NOT_ACCEPTED (400), IDENTITY_SIGNUP_REJECTED (400, honeypot), IDENTITY_SIGNUP_CLOSED (403), COMMON_IDEMPOTENCY_MISMATCH (422), IDENTITY_INVITATION_CONTACT_REQUIRED / IDENTITY_ROLE_INVALID / IDENTITY_INVITATION_BRANCH_INVALID (400), IDENTITY_INVITATION_NOT_FOUND (404), IDENTITY_INVITATION_PENDING / IDENTITY_INVITATION_NOT_PENDING (409), IDENTITY_INVITATION_TOO_SOON (429), IDENTITY_LAST_ADMIN, IDENTITY_PERMISSION_DENIED

## Module rules
1. Permission strings are `module.resource.action`; each module seeds its own via a migration.
2. A tenant must always keep at least one Company Admin.
3. Permission checks live in services, not only controllers.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
