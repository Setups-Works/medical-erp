-- identity: owner contact details from sign-up, verification timestamps, and consent records (AUT-04).
-- Mobile is stored in E.164 (+91 and 10 digits starting 6-9, VALIDATION_AND_BUSINESS_RULES.md "Phone (India)").
alter table app_user
    add column mobile              varchar(13),
    add column mobile_verified_at  timestamptz,
    add column email_verified_at   timestamptz,
    add constraint ck_app_user_mobile check (mobile is null or mobile ~ '^\+91[6-9][0-9]{9}$');

-- Append-only: which notice (kind + version) a user accepted and when (DPDP notice, DATA_MODEL.md).
-- RLS arrives with #7 like the other tenant tables.
create table consent (
    id           uuid         primary key,
    tenant_id    uuid         not null references tenant (id),
    user_id      uuid         not null references app_user (id),
    kind         text         not null,
    version      varchar(40)  not null,
    accepted_at  timestamptz  not null,
    created_at   timestamptz  not null,
    created_by   uuid,
    constraint ck_consent_kind check (kind in ('TERMS_AND_PRIVACY')),
    constraint ck_consent_version_not_blank check (length(trim(version)) > 0)
);

create index ix_consent_tenant_user on consent (tenant_id, user_id);
