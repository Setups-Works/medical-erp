# Module `auth` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P1 · **Features:** PLT-08, PLT-09, PLT-10

## Purpose
Login, token issue/refresh/rotation, logout, password reset, offline PIN setup, 2FA (P5).

## Owns tables
refresh_token, login_attempt, password_reset

## Public API (`auth.api`)
AuthFacade.currentUser()

## Events published
UserLoggedIn, UserLoggedOut

## Allowed dependencies
identity::api, tenancy::api

## Built so far (P1, from Kamesh's login work, 26-11-2026)
- `POST /api/v1/auth/login` `{identifier, password}`: identifier is the email or the Indian mobile (10 digits; `+91`, `91`, `0`, spaces and dashes allowed), decided 26-11-2026 (PLT-08; there is no username) → access token (ES256 JWT, 15 min) in body + `meno_refresh` HttpOnly, Secure, SameSite=Strict cookie (path `/api/v1/auth`)
- `POST /api/v1/auth/refresh` rotates the refresh token · `POST /api/v1/auth/logout` revokes the family · `POST /api/v1/auth/logout-all` (bearer) revokes every refresh token of the user, i.e. all browsers and counter PCs; access tokens already issued live out their 15 min · `GET /api/v1/auth/me`
- `GET /api/v1/auth/signup/options` and `POST /api/v1/auth/signup` (201, signed in like login; 200 on Idempotency-Key replay). Rules live in identity (`SignupFacade`); `SessionResponses` builds the body + cookie for login, refresh and sign-up.
- `POST /auth/verify-email` (public, token), `POST /auth/verify-email/resend`, `GET /auth/verification`, `POST /auth/verify-mobile/send` (bearer, 202 / 409 / 429 / 503 NOTIFICATION_CHANNEL_DISABLED) and `POST /auth/verify-mobile` `{code}` (bearer, 204 / 400 attemptsLeft / 409 / 423), both rate-limited. Login / refresh / logout / sign-up run with RLS bypass (`TenantContext.callAsSystem`) because no tenant is known yet.
- Rate limits (SEC-10, `security/RateLimitFilter`, `meno.rate-limit.*`): login 10/min, refresh 30/min, sign-up 5/10 min, verify 10/10 min, resend 5/h per client IP → 429 `COMMON_RATE_LIMITED` + Retry-After. In memory: move to Redis with a second instance.
- Forgot / reset password (AUT-01): `POST /auth/password/forgot` (always 202; email off the request thread after commit, so neither answer nor timing reveals an account; one email per user per cooldown) and `POST /auth/password/reset` (single-use link, 30 min, changes the password through `identity.api.PasswordAccounts`, clears lockout, revokes every refresh token of the user). Table `password_reset` (V202611262600, hash only, RLS). Contract = `contracts/openapi/proposed/auth.yaml`, now in the generated spec.
- Table `refresh_token` (V202611261702). `login_attempt`, `AuthFacade`, events: not yet.
- Config `meno.auth.*` (refresh TTL, cookie secure); all from env, no hard-coded values.
- Documented in Swagger (`@Operation` + one `@ApiResponse` per error code); login/refresh/logout are marked public, `me` needs the bearer token.

## Error codes
AUTH_RESET_TOKEN_INVALID (410, expired or used reset link), AUTH_INVALID_CREDENTIALS (401), AUTH_LOCKED (423), AUTH_ACCOUNT_DISABLED (403), AUTH_REFRESH_INVALID (401), AUTH_REFRESH_REUSED (401), AUTH_2FA_REQUIRED (P5)

## Module rules
1. Refresh tokens stored hashed; reuse of a rotated token revokes the whole family.
2. Never reveal whether an email or mobile exists (same response for unknown user, malformed identifier and wrong password).
3. Rate limit login and reset endpoints.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
