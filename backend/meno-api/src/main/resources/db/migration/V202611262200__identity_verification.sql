-- identity: one-time verification links / codes (AUT-04). Only the SHA-256 of the token is stored.
create table verification (
    id           uuid         primary key,
    tenant_id    uuid         not null references tenant (id),
    user_id      uuid         not null references app_user (id),
    channel      text         not null,
    token_hash   varchar(64)  not null,
    expires_at   timestamptz  not null,
    consumed_at  timestamptz,
    created_at   timestamptz  not null,
    created_by   uuid,
    version      bigint       not null default 0,
    constraint ck_verification_channel check (channel in ('EMAIL', 'SMS')),
    constraint ck_verification_expiry check (expires_at > created_at),
    constraint uq_verification_token_hash unique (token_hash)
);

create index ix_verification_tenant_user on verification (tenant_id, user_id, created_at);

alter table verification enable row level security;
create policy tenant_isolation on verification
    using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());
