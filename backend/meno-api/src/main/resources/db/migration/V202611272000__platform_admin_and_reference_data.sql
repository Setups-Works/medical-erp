-- platform: MENO staff realm (ADR-0020) and shared reference data (PLT-22, /platform/reference-data).
--
-- Platform staff are not tenant users: they live in platform_user, sign in at /api/v1/platform/auth/login and get a
-- token with no tenant, which only /api/v1/platform/* accepts. TenantAwareDataSource sets app.platform = 'on' for
-- those requests; nothing here bypasses tenant RLS (tenant data is not readable from the platform realm yet).

create or replace function app_platform() returns boolean
    language sql stable
    as $$ select coalesce(current_setting('app.platform', true), '') = 'on' $$;

-- ---------- platform staff ----------
create table platform_permission (
    code        varchar(80)  primary key,
    label       varchar(120) not null,
    sort_order  int          not null unique
);

insert into platform_permission (code, label, sort_order) values
    ('platform.reference.view',   'See reference data and its load history', 10),
    ('platform.reference.manage', 'Load reference data files',               20);

create table platform_user (
    id                 uuid         primary key,
    email              varchar(254) not null,
    full_name          varchar(120) not null,
    password_hash      varchar(255) not null,
    active             boolean      not null default true,
    failed_login_count int          not null default 0,
    locked_until       timestamptz,
    last_login_at      timestamptz,
    created_at         timestamptz  not null,
    created_by         uuid,
    updated_at         timestamptz  not null,
    updated_by         uuid,
    version            bigint       not null default 0,
    constraint ck_platform_user_email check (email = lower(email) and position('@' in email) > 1),
    constraint ck_platform_user_name check (length(trim(full_name)) > 0),
    constraint ck_platform_user_failed check (failed_login_count >= 0)
);
create unique index ux_platform_user_email on platform_user (email);

create table platform_user_permission (
    user_id          uuid        not null references platform_user (id) on delete cascade,
    permission_code  varchar(80) not null references platform_permission (code),
    primary key (user_id, permission_code)
);

-- Tenant requests never see platform staff; login (before the realm is known) uses the system bypass.
alter table platform_user enable row level security;
create policy platform_only on platform_user
    using (app_platform() or app_rls_bypass())
    with check (app_platform() or app_rls_bypass());

alter table platform_user_permission enable row level security;
create policy platform_only on platform_user_permission
    using (app_platform() or app_rls_bypass())
    with check (app_platform() or app_rls_bypass());

-- ---------- reference datasets (registry + load history) ----------
-- One row per list shown on /platform/reference-data. Sources, licences and refresh cadence are data (R-30, R-21,
-- R-28): researched, not yet signed off. Lists owned by later modules are listed with loadable = false.
create table reference_dataset (
    code            varchar(40)  primary key,
    name            varchar(80)  not null,
    description     varchar(300) not null,
    source_name     varchar(160) not null,
    source_url      varchar(500),
    licence         varchar(200) not null,
    attribution     varchar(300),
    refresh_months  int          not null,
    owner_module    varchar(40)  not null,
    phase           varchar(4)   not null,
    loadable        boolean      not null default false,
    sort_order      int          not null unique,
    row_count       int          not null default 0,
    source_date     date,
    loaded_at       timestamptz,
    loaded_by       uuid         references platform_user (id),
    version         bigint       not null default 0,
    constraint ck_reference_dataset_refresh check (refresh_months between 1 and 60),
    constraint ck_reference_dataset_rows check (row_count >= 0),
    constraint ck_reference_dataset_loaded check ((loaded_at is null) = (source_date is null))
);

insert into reference_dataset
    (code, name, description, source_name, source_url, licence, attribution, refresh_months, owner_module, phase,
     loadable, sort_order) values
    ('PINCODE', 'PIN codes', 'PIN code to state, district and post-office localities. Fills addresses.',
     'India Post, All India Pincode Directory (data.gov.in)', 'https://data.gov.in/catalog/all-india-pincode-directory',
     'Government Open Data License – India', 'Contains data from India Post, published on data.gov.in under GODL-India.',
     12, 'platform', 'P2', true, 10),
    ('IFSC', 'IFSC codes', 'IFSC to bank, branch and address. Fills bank account details.',
     'Reserve Bank of India, NEFT / RTGS bank branch lists', 'https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=2009',
     'RBI public list; redistribution terms to confirm (R-30)', 'Bank branch data from the Reserve Bank of India.',
     1, 'platform', 'P2', true, 20),
    ('HSN', 'HSN codes and GST rates', 'HSN / SAC codes with their GST rates, effective-dated.',
     'CBIC GST rate notifications', null, 'Government notification (public)', null,
     3, 'taxation', 'P3', false, 30),
    ('CEILING_PRICE', 'Ceiling prices', 'NPPA / DPCO ceiling prices for scheduled formulations.',
     'NPPA price notifications', null, 'Government notification (public)', null,
     1, 'compliance', 'P4', false, 40),
    ('BANNED_DRUG', 'Banned drugs', 'Banned fixed-dose combinations and recalls (section 26A).',
     'CDSCO banned FDC list and e-Gazette notifications', null, 'Government notification (public)', null,
     1, 'compliance', 'P4', false, 50);

create table reference_dataset_load (
    id               uuid         primary key,
    dataset_code     varchar(40)  not null references reference_dataset (code),
    status           varchar(12)  not null,
    file_name        varchar(255) not null,
    file_sha256      char(64)     not null,
    file_bytes       bigint       not null,
    source_date      date         not null,
    rows_read        int          not null default 0,
    rows_loaded      int          not null default 0,
    rows_skipped     int          not null default 0,
    reason_code      varchar(60),
    problems         jsonb        not null default '[]',
    replaced_anyway  boolean      not null default false,
    loaded_by        uuid         not null references platform_user (id),
    started_at       timestamptz  not null,
    finished_at      timestamptz  not null,
    constraint ck_reference_load_status check (status in ('LOADED', 'REJECTED')),
    constraint ck_reference_load_counts check (rows_read >= 0 and rows_loaded >= 0 and rows_skipped >= 0),
    constraint ck_reference_load_reason check ((status = 'REJECTED') = (reason_code is not null)),
    constraint ck_reference_load_bytes check (file_bytes >= 0)
);
create index ix_reference_load_dataset on reference_dataset_load (dataset_code, started_at desc);

alter table reference_dataset_load enable row level security;
create policy platform_only on reference_dataset_load
    using (app_platform() or app_rls_bypass())
    with check (app_platform() or app_rls_bypass());

-- The registry is read by tenants too (attribution next to lookups); only the platform realm changes it.
alter table reference_dataset enable row level security;
create policy read_all on reference_dataset for select using (true);
create policy platform_write on reference_dataset
    using (app_platform() or app_rls_bypass())
    with check (app_platform() or app_rls_bypass());

-- ---------- the lists themselves (not tenant-owned; everyone reads, only the platform realm writes) ----------
create table ref_pincode (
    pincode     char(6)     primary key,
    state_code  bpchar(2)   not null references state (code),
    district    varchar(80) not null,
    localities  text[]      not null default '{}',
    constraint ck_ref_pincode check (pincode ~ '^[1-9][0-9]{5}$'),
    constraint ck_ref_pincode_district check (length(trim(district)) > 0)
);

create table ref_ifsc (
    ifsc      char(11)     primary key,
    bank      varchar(120) not null,
    branch    varchar(160) not null,
    address   varchar(500),
    city      varchar(80),
    district  varchar(80),
    state     varchar(80),
    constraint ck_ref_ifsc check (ifsc ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
    constraint ck_ref_ifsc_bank check (length(trim(bank)) > 0 and length(trim(branch)) > 0)
);

alter table ref_pincode enable row level security;
create policy read_all on ref_pincode for select using (true);
create policy platform_write on ref_pincode
    using (app_platform() or app_rls_bypass())
    with check (app_platform() or app_rls_bypass());

alter table ref_ifsc enable row level security;
create policy read_all on ref_ifsc for select using (true);
create policy platform_write on ref_ifsc
    using (app_platform() or app_rls_bypass())
    with check (app_platform() or app_rls_bypass());
