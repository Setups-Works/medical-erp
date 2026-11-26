-- tenancy: the tenant (pharmacy business). Not tenant-scoped itself, so no RLS.
create table tenant (
    id          uuid         primary key,
    name        varchar(200) not null,
    code        varchar(50)  not null,
    status      text         not null,
    created_at  timestamptz  not null,
    created_by  uuid,
    updated_at  timestamptz  not null,
    updated_by  uuid,
    version     bigint       not null default 0,
    constraint uq_tenant_code unique (code),
    constraint ck_tenant_status check (status in ('ACTIVE', 'SUSPENDED')),
    constraint ck_tenant_name_not_blank check (length(trim(name)) > 0)
);
