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

## Error codes
AUTH_INVALID_CREDENTIALS, AUTH_LOCKED, AUTH_REFRESH_REUSED, AUTH_2FA_REQUIRED

## Module rules
1. Refresh tokens stored hashed; reuse of a rotated token revokes the whole family.
2. Never reveal whether an email exists (same response for unknown user and wrong password).
3. Rate limit login and reset endpoints.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
