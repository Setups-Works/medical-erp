-- identity: staff invitations from the Team step (AUT-09, ONBOARDING.md step 9; PLT-06) and the roles they carry.

-- ---------- roles as data (ADR-0014, rule 13) ----------
-- Platform table (no tenant_id, no RLS) until per-tenant roles (PLT-07, Hub #158) add tenant_id. Codes are the
-- values user_role.role and role_permission.role already hold. `invitable` = offered on the Team step: the five
-- staff roles ONBOARDING.md step 9 names (labels from ROLES_AND_DASHBOARDS.md). OWNER is never invited; ADMIN and
-- CASHIER are the temporary P1 login roles.
create table role (
    code        varchar(50)  primary key,
    label       varchar(100) not null,
    invitable   boolean      not null default false,
    sort_order  integer      not null unique,
    constraint ck_role_code check (code ~ '^[A-Z][A-Z0-9_]*$'),
    constraint ck_role_label_not_blank check (length(trim(label)) > 0)
);

insert into role (code, label, invitable, sort_order) values
    ('OWNER', 'Business owner', false, 1),
    ('ADMIN', 'Administrator', false, 2),
    ('BRANCH_MANAGER', 'Branch manager', true, 3),
    ('PHARMACIST', 'Pharmacist', true, 4),
    ('BILLING_OPERATOR', 'Billing operator', true, 5),
    ('INVENTORY_MANAGER', 'Inventory manager', true, 6),
    ('ACCOUNTANT', 'Accountant', true, 7),
    ('CASHIER', 'Cashier', false, 8);

-- Every role name in use must now be a known role (rule 14: invariants as constraints).
alter table role_permission
    add constraint fk_role_permission_role foreign key (role) references role (code);
alter table user_role
    add constraint fk_user_role_role foreign key (role) references role (code);

-- ---------- invitations (tenant data, RLS) ----------
-- Only the SHA-256 of the link token is stored. "Expired" is not a status: it is PENDING past expires_at, so a
-- resend (new token + expiry) brings it back without rewriting history.
create table invitation (
    id                uuid          primary key,
    tenant_id         uuid          not null references tenant (id),
    full_name         varchar(100)  not null,
    email             varchar(254),
    mobile            varchar(13),
    role_code         varchar(50)   not null references role (code),
    status            text          not null default 'PENDING',
    token_hash        char(64)      not null,
    expires_at        timestamptz   not null,
    sent_at           timestamptz   not null,
    send_count        integer       not null default 1,
    accepted_user_id  uuid          references app_user (id),
    accepted_at       timestamptz,
    revoked_at        timestamptz,
    created_at        timestamptz   not null,
    created_by        uuid,
    updated_at        timestamptz   not null,
    updated_by        uuid,
    version           bigint        not null default 0,
    constraint ck_invitation_contact check (email is not null or mobile is not null),
    constraint ck_invitation_email check (email is null or (email = lower(email) and position('@' in email) > 1)),
    constraint ck_invitation_mobile check (mobile is null or mobile ~ '^\+91[6-9][0-9]{9}$'),
    constraint ck_invitation_name check (length(trim(full_name)) > 0),
    constraint ck_invitation_status check (status in ('PENDING', 'ACCEPTED', 'REVOKED')),
    constraint ck_invitation_send_count check (send_count >= 1),
    constraint ck_invitation_accepted check ((status = 'ACCEPTED') = (accepted_at is not null)),
    constraint ck_invitation_revoked check ((status = 'REVOKED') = (revoked_at is not null)),
    constraint ck_invitation_expiry check (expires_at > sent_at)
);

create unique index ux_invitation_token on invitation (token_hash);
-- One open invitation per person per tenant (the service answers IDENTITY_INVITATION_PENDING first).
create unique index ux_invitation_pending_email on invitation (tenant_id, email) where status = 'PENDING' and email is not null;
create unique index ux_invitation_pending_mobile on invitation (tenant_id, mobile) where status = 'PENDING' and mobile is not null;
create index ix_invitation_tenant_created on invitation (tenant_id, created_at desc);

-- Branches the invited person will work at (becomes user_branch on acceptance). Every invitable role is
-- branch-scoped (ROLES_AND_DASHBOARDS.md: all roles except Super Admin and Business Owner).
create table invitation_branch (
    invitation_id  uuid  not null references invitation (id) on delete cascade,
    tenant_id      uuid  not null references tenant (id),
    branch_id      uuid  not null references branch (id),
    primary key (invitation_id, branch_id)
);
create index ix_invitation_branch_tenant on invitation_branch (tenant_id, branch_id);

alter table invitation enable row level security;
create policy tenant_isolation on invitation using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());
alter table invitation_branch enable row level security;
create policy tenant_isolation on invitation_branch using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());

-- ---------- permissions (seed, VALIDATION_AND_BUSINESS_RULES.md §3) ----------
-- The Team step and later /admin/users are the owner's (PAGES.md: Team = OW).
insert into permission (code, description) values
    ('identity.invitation.view', 'See staff invitations and the roles and branches they can carry'),
    ('identity.invitation.manage', 'Invite staff, resend and revoke invitations');

insert into role_permission (role, permission_code) values
    ('OWNER', 'identity.invitation.view'),
    ('OWNER', 'identity.invitation.manage');
