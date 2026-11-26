-- Permissions (ADR-0014): code checks permission strings, never role names. Global seed for the four temporary
-- roles until per-tenant roles (PLT-07, Hub #158) replace it. Platform tables: no tenant_id, no RLS.
create table permission (
    code         varchar(100) primary key,
    description  varchar(300) not null,
    constraint ck_permission_code check (code ~ '^[a-z]+(\.[a-z-]+){2}$')
);

create table role_permission (
    role             text         not null,
    permission_code  varchar(100) not null references permission (code),
    primary key (role, permission_code)
);

-- Seed (clearly marked, VALIDATION_AND_BUSINESS_RULES.md §3). Onboarding pages are for the owner (PAGES.md §A).
insert into permission (code, description) values
    ('tenancy.onboarding.view', 'See the onboarding checklist and steps'),
    ('tenancy.onboarding.manage', 'Fill in onboarding steps and go live');

insert into role_permission (role, permission_code) values
    ('OWNER', 'tenancy.onboarding.view'),
    ('OWNER', 'tenancy.onboarding.manage');
