-- identity: user management (/admin/users, PLT-06): branch access per user and the permissions for the page.

-- ---------- branch scope as data (ROLES_AND_DASHBOARDS.md "Branch scope") ----------
-- Every role except Super Admin and Business Owner is limited to the user's branches. Stored on the role, so code
-- never checks a role name to decide whether someone sees every branch (ADR-0014).
alter table role add column all_branches boolean not null default false;
update role set all_branches = true where code = 'OWNER';

-- ---------- user_branch (tenant data, RLS) ----------
-- Branches a user works at. Users whose roles have all_branches need no rows. Accepted invitations copy their
-- invitation_branch rows here (the /invite page).
create table user_branch (
    user_id     uuid        not null references app_user (id) on delete cascade,
    tenant_id   uuid        not null references tenant (id),
    branch_id   uuid        not null references branch (id),
    created_at  timestamptz not null,
    created_by  uuid,
    primary key (user_id, branch_id)
);
create index ix_user_branch_tenant on user_branch (tenant_id, branch_id);

alter table user_branch enable row level security;
create policy tenant_isolation on user_branch using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());

-- ---------- permissions (seed, VALIDATION_AND_BUSINESS_RULES.md §3) ----------
-- PAGES.md: /admin/users is for OW and BM; ROLES_AND_DASHBOARDS.md gives the Branch Manager "users.view" only.
insert into permission (code, description) values
    ('identity.user.view', 'See staff accounts, their roles and branches'),
    ('identity.user.manage', 'Change a person''s roles and branches, deactivate and reactivate accounts');

insert into role_permission (role, permission_code) values
    ('OWNER', 'identity.user.view'),
    ('OWNER', 'identity.user.manage'),
    ('BRANCH_MANAGER', 'identity.user.view');
