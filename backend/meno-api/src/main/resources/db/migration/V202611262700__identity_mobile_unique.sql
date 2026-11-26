-- identity: one mobile = one user, like email (PLT-08: sign in with email or mobile, decided 26-11-2026).
-- Partial index: users created before sign-up collected a mobile (bootstrap owner) keep it null.
-- Fails if two users already share a mobile; clean those test rows first (never on production data by hand).
create unique index ux_app_user_mobile on app_user (mobile) where mobile is not null;
