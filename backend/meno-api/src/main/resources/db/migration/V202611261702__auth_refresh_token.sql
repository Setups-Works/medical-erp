-- auth: refresh tokens, stored only as SHA-256 hashes. Same-login tokens share family_id.
-- RLS policy added by the tenancy task (#7).
create table refresh_token (
    id             uuid         primary key,
    tenant_id      uuid         not null references tenant (id),
    user_id        uuid         not null references app_user (id) on delete cascade,
    token_hash     varchar(64)  not null,
    family_id      uuid         not null,
    expires_at     timestamptz  not null,
    revoked_at     timestamptz,
    replaced_by_id uuid,
    created_at     timestamptz  not null,
    created_by_ip  varchar(64),
    user_agent     varchar(255),
    version        bigint       not null default 0,
    constraint uq_refresh_token_hash unique (token_hash),
    constraint ck_refresh_token_expiry check (expires_at > created_at)
);

create index ix_refresh_token_tenant_user on refresh_token (tenant_id, user_id);
create index ix_refresh_token_family on refresh_token (family_id);
