-- Tenant isolation in the database (MULTI_TENANCY.md layer 4, Hub #7). The app connects as a non-owner role
-- (meno_app / meno_<env>_app), so these policies apply to it; Flyway runs as the owner and is not affected.
-- TenantAwareDataSource sets app.tenant_id (from the token) and app.rls_bypass (only for login, refresh,
-- sign-up and the first-owner bootstrap, before a tenant is known) on every connection checkout.

create or replace function app_current_tenant() returns uuid
    language sql stable
    as $$ select nullif(current_setting('app.tenant_id', true), '')::uuid $$;

create or replace function app_rls_bypass() returns boolean
    language sql stable
    as $$ select coalesce(current_setting('app.rls_bypass', true), '') = 'on' $$;

alter table tenant enable row level security;
create policy tenant_isolation on tenant
    using (id = app_current_tenant() or app_rls_bypass())
    with check (id = app_current_tenant() or app_rls_bypass());

alter table app_user enable row level security;
create policy tenant_isolation on app_user
    using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());

-- user_role has no tenant_id: it follows its user (the subquery is itself filtered by app_user's policy).
alter table user_role enable row level security;
create policy tenant_isolation on user_role
    using (app_rls_bypass() or exists (select 1 from app_user u where u.id = user_id))
    with check (app_rls_bypass() or exists (select 1 from app_user u where u.id = user_id));

alter table refresh_token enable row level security;
create policy tenant_isolation on refresh_token
    using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());

alter table consent enable row level security;
create policy tenant_isolation on consent
    using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());
