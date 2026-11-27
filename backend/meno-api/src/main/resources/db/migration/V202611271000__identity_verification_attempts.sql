-- identity: mobile OTP (AUT-04, ONBOARDING.md step 2): wrong tries per SMS code (3 allowed, then a new code is needed).
alter table verification
    add column attempts integer not null default 0,
    add constraint ck_verification_attempts check (attempts >= 0);
