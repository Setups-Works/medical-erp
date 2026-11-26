-- identity: users and their starting roles.
-- RLS policies for app_user / user_role are added by the tenancy task (#7) together with the
-- SET LOCAL interceptor; login looks users up by email before the tenant is known, so it will
-- need an explicit exemption there.
create table app_user (
    id               uuid         primary key,
    tenant_id        uuid         not null references tenant (id),
    email            varchar(254) not null,
    password_hash    varchar(255) not null,
    full_name        varchar(200) not null,
    status           text         not null,
    failed_attempts  integer      not null default 0,
    locked_until     timestamptz,
    last_login_at    timestamptz,
    created_at       timestamptz  not null,
    created_by       uuid,
    updated_at       timestamptz  not null,
    updated_by       uuid,
    version          bigint       not null default 0,
    constraint ck_app_user_email_lower check (email = lower(email)),
    constraint ck_app_user_status check (status in ('ACTIVE', 'DISABLED')),
    constraint ck_app_user_failed_attempts check (failed_attempts >= 0)
);

-- One login email maps to exactly one user (and therefore one tenant).
create unique index ux_app_user_email on app_user (email);
create index ix_app_user_tenant on app_user (tenant_id);

create table user_role (
    user_id  uuid not null references app_user (id) on delete cascade,
    role     text not null,
    primary key (user_id, role)
);
