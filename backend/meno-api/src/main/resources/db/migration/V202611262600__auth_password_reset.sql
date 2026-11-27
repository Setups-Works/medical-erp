-- auth: password reset links (AUT-01: single-use emailed token, 30 min expiry, all sessions revoked on reset).
-- Only the SHA-256 of the token is stored.
create table password_reset (
    id            uuid         primary key,
    tenant_id     uuid         not null references tenant (id),
    user_id       uuid         not null references app_user (id),
    token_hash    varchar(64)  not null,
    expires_at    timestamptz  not null,
    used_at       timestamptz,
    requested_ip  varchar(45),
    created_at    timestamptz  not null,
    version       bigint       not null default 0,
    constraint uq_password_reset_token_hash unique (token_hash),
    constraint ck_password_reset_expiry check (expires_at > created_at)
);

create index ix_password_reset_tenant_user on password_reset (tenant_id, user_id, created_at);

alter table password_reset enable row level security;
create policy tenant_isolation on password_reset
    using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());
