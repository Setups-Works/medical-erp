-- identity: roles and permissions per tenant (/admin/roles and /admin/permissions, PLT-07, ADR-0014).
--
-- Model (an overlay, so module migrations keep seeding the way they do today):
--   * role rows with tenant_id null are MENO's default roles, shared by every tenant; rows with a tenant_id are that
--     tenant's own (custom) roles.
--   * role_permission rows with tenant_id null are the defaults' permissions (every module migration inserts these).
--   * role_override(tenant_id, role) says "this tenant has its own permission list for this role": its permissions
--     are then the role_permission rows with that tenant_id, not the defaults. Custom roles always have one.
-- So a new default permission added by a later migration reaches every tenant that hasn't changed that role.

-- ---------- role: tenant-owned rows, description, locked, archive, audit ----------
alter table role
    add column tenant_id    uuid references tenant (id),
    add column description  varchar(300),
    add column locked       boolean      not null default false,
    add column archived_at  timestamptz,
    add column created_at   timestamptz,
    add column created_by   uuid,
    add column updated_at   timestamptz,
    add column updated_by   uuid,
    add column version      bigint       not null default 0;

-- Custom roles share the sort space with nobody else's; display order is sort_order, then label.
alter table role drop constraint role_sort_order_key;

-- ROLES_AND_DASHBOARDS.md: the Business Owner has every tenant permission, so the role can't be edited (data, not a
-- name check in code).
update role set locked = true where code = 'OWNER';

update role set description = case code
    when 'OWNER' then 'Runs the business. Has every permission and sees every branch.'
    when 'ADMIN' then 'Temporary sign-in role from the first release.'
    when 'BRANCH_MANAGER' then 'Runs their branches: sales, stock, approvals and staff.'
    when 'PHARMACIST' then 'Prescriptions, medicine search, billing and registers.'
    when 'BILLING_OPERATOR' then 'Counter billing, invoices, customers and returns within limits.'
    when 'INVENTORY_MANAGER' then 'Purchases, GRN, batches, expiry, stock audit and transfers.'
    when 'ACCOUNTANT' then 'Ledgers, receipts, payments, expenses, GST and financial reports.'
    when 'CASHIER' then 'Temporary sign-in role from the first release.'
end
where tenant_id is null;

alter table role
    add constraint ck_role_tenant_audit check (tenant_id is null or (created_at is not null and updated_at is not null)),
    add constraint ck_role_custom_not_locked check (tenant_id is null or (not locked and not all_branches));

-- Two roles of one tenant can't share a name (the service also refuses a default role's name).
create unique index ux_role_tenant_label on role (tenant_id, lower(label)) where tenant_id is not null and archived_at is null;
create index ix_role_tenant on role (tenant_id) where tenant_id is not null;

alter table role enable row level security;
create policy tenant_isolation on role
    using (tenant_id is null or tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());

-- ---------- role_permission: defaults (tenant_id null) and tenant lists ----------
alter table role_permission add column tenant_id uuid references tenant (id);
alter table role_permission drop constraint role_permission_pkey;
create unique index ux_role_permission_default on role_permission (role, permission_code) where tenant_id is null;
create unique index ux_role_permission_tenant on role_permission (tenant_id, role, permission_code) where tenant_id is not null;

alter table role_permission enable row level security;
create policy tenant_isolation on role_permission
    using (tenant_id is null or tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());

-- ---------- role_override: the tenant owns this role's permission list ----------
create table role_override (
    tenant_id   uuid        not null references tenant (id),
    role        varchar(50) not null references role (code),
    created_at  timestamptz not null,
    created_by  uuid,
    updated_at  timestamptz not null,
    updated_by  uuid,
    version     bigint      not null default 0,
    primary key (tenant_id, role)
);

alter table role_override enable row level security;
create policy tenant_isolation on role_override using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());

-- ---------- permission groups for the screens ----------
-- Display group per module (the first part of module.resource.action). Each module adds its row in the migration
-- that seeds its first permission.
create table permission_module (
    code        varchar(50)  primary key,
    label       varchar(100) not null,
    sort_order  integer      not null,
    constraint ck_permission_module_code check (code ~ '^[a-z]+$')
);

insert into permission_module (code, label, sort_order) values
    ('tenancy', 'Business set-up', 1),
    ('identity', 'Users and roles', 2),
    ('party', 'Customers and suppliers', 3);

-- ---------- permissions (seed, VALIDATION_AND_BUSINESS_RULES.md §3) ----------
insert into permission (code, description) values
    ('identity.role.view', 'See roles and the permissions each one carries'),
    ('identity.role.manage', 'Create, rename and archive roles and change their permissions');

insert into role_permission (role, permission_code) values
    ('OWNER', 'identity.role.view'),
    ('OWNER', 'identity.role.manage');
