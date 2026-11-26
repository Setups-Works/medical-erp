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
- `POST /api/v1/auth/login` → access token (ES256 JWT, 15 min) in body + `meno_refresh` HttpOnly, Secure, SameSite=Strict cookie (path `/api/v1/auth`)
- `POST /api/v1/auth/refresh` rotates the refresh token · `POST /api/v1/auth/logout` revokes the family · `GET /api/v1/auth/me`
- `GET /api/v1/auth/signup/options` and `POST /api/v1/auth/signup` (201, signed in like login; 200 on Idempotency-Key replay). Rules live in identity (`SignupFacade`); `SessionResponses` builds the body + cookie for login, refresh and sign-up.
- Table `refresh_token` (V202611261702). `login_attempt`, `password_reset`, `AuthFacade`, events: not yet.
- Config `meno.auth.*` (refresh TTL, cookie secure); all from env, no hard-coded values.
- Documented in Swagger (`@Operation` + one `@ApiResponse` per error code); login/refresh/logout are marked public, `me` needs the bearer token.

## Error codes
AUTH_INVALID_CREDENTIALS (401), AUTH_LOCKED (423), AUTH_ACCOUNT_DISABLED (403), AUTH_REFRESH_INVALID (401), AUTH_REFRESH_REUSED (401), AUTH_2FA_REQUIRED (P5)

## Module rules
1. Refresh tokens stored hashed; reuse of a rotated token revokes the whole family.
2. Never reveal whether an email exists (same response for unknown user and wrong password).
3. Rate limit login and reset endpoints.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
