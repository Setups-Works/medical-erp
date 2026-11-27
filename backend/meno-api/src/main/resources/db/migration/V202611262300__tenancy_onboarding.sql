-- tenancy: onboarding (docs/product/ONBOARDING.md, AUT-03/05/06/07/13/15, PLT-03, AUT-02 subset).
-- Option lists, setting definitions and the step catalogue are seeded DATA, not code (ADR-0014, rule 13).

-- ---------- platform reference data (no tenant_id, no RLS) ----------
create table lookup_option (
    list_code   varchar(50)  not null,
    code        varchar(50)  not null,
    label       varchar(100) not null,
    sort_order  integer      not null,
    active      boolean      not null default true,
    primary key (list_code, code),
    constraint ck_lookup_option_code check (code ~ '^[A-Z0-9_]+$')
);

insert into lookup_option (list_code, code, label, sort_order) values
    ('business_type', 'RETAIL', 'Retail pharmacy', 1),
    ('business_type', 'WHOLESALE', 'Wholesale / distributor', 2),
    ('business_type', 'BOTH', 'Both retail and wholesale', 3),
    ('business_type', 'HOSPITAL', 'Hospital pharmacy', 4),
    ('business_type', 'CHAIN', 'Chain (2+ shops)', 5),
    ('branch_count', 'ONE', '1', 1),
    ('branch_count', 'TWO_TO_FIVE', '2–5', 2),
    ('branch_count', 'SIX_PLUS', '6+', 3),
    ('catalogue_size', 'UNDER_2000', 'Fewer than 2,000 medicines', 1),
    ('catalogue_size', 'FROM_2000_TO_10000', '2,000–10,000 medicines', 2),
    ('catalogue_size', 'OVER_10000', 'More than 10,000 medicines', 3),
    ('current_software', 'MARG', 'Marg', 1),
    ('current_software', 'TALLY', 'Tally', 2),
    ('current_software', 'BUSY', 'Busy', 3),
    ('current_software', 'VYAPAR', 'Vyapar', 4),
    ('current_software', 'GOFRUGAL', 'GoFrugal', 5),
    ('current_software', 'OTHER', 'Other', 6),
    ('current_software', 'NONE', 'Paper / none', 7),
    ('language', 'EN', 'English', 1),
    ('registration_type', 'REGULAR', 'Regular', 1),
    ('registration_type', 'COMPOSITION', 'Composition', 2),
    ('registration_type', 'UNREGISTERED', 'Not registered', 3),
    ('negative_stock_policy', 'BLOCK', 'Block the sale', 1),
    ('negative_stock_policy', 'WARN', 'Warn and allow', 2),
    ('paper_size', 'THERMAL_2IN', 'Thermal 2 inch', 1),
    ('paper_size', 'THERMAL_3IN', 'Thermal 3 inch', 2),
    ('paper_size', 'A5', 'A5', 3),
    ('paper_size', 'A4', 'A4', 4),
    ('paper_size', 'DOT_MATRIX', 'Dot-matrix', 5);

-- Which drug licences a business type needs at set-up (ONBOARDING.md step 5: "Y for retail" / "Y for
-- wholesale"). Hospital and chain follow retail. ⚠ confirm with Prakalya (BA).
create table business_type_licence (
    business_type  varchar(50) not null,
    licence_kind   text        not null,
    primary key (business_type, licence_kind),
    constraint ck_btl_kind check (licence_kind in ('DRUG_RETAIL', 'DRUG_WHOLESALE'))
);
insert into business_type_licence (business_type, licence_kind) values
    ('RETAIL', 'DRUG_RETAIL'), ('WHOLESALE', 'DRUG_WHOLESALE'), ('BOTH', 'DRUG_RETAIL'), ('BOTH', 'DRUG_WHOLESALE'),
    ('HOSPITAL', 'DRUG_RETAIL'), ('CHAIN', 'DRUG_RETAIL');

-- GST registration types and whether a GSTIN is required (ONBOARDING.md step 4).
create table registration_type_rule (
    code            varchar(50) primary key,
    gstin_required  boolean     not null
);
insert into registration_type_rule (code, gstin_required) values
    ('REGULAR', true), ('COMPOSITION', true), ('UNREGISTERED', false);

-- Tenant settings the configuration step may write (AUT-02 subset). Defaults are starting values the owner
-- changes in the step; ⚠ confirm defaults with Prakalya.
create table setting_definition (
    key            varchar(100) primary key,
    value_type     text         not null,
    list_code      varchar(50),
    default_value  text         not null,
    min_value      integer,
    max_value      integer,
    sort_order     integer      not null,
    constraint ck_setting_type check (value_type in ('BOOLEAN', 'INTEGER', 'LIST')),
    constraint ck_setting_list check ((value_type = 'LIST') = (list_code is not null))
);

insert into setting_definition (key, value_type, list_code, default_value, min_value, max_value, sort_order) values
    ('stock.negative_policy', 'LIST', 'negative_stock_policy', 'BLOCK', null, null, 1),
    ('stock.fefo_default', 'BOOLEAN', null, 'true', null, null, 2),
    ('stock.near_expiry_days', 'INTEGER', null, '90', 1, 365, 3),
    ('pricing.round_grand_total', 'BOOLEAN', null, 'true', null, null, 4),
    ('invoice.paper_size', 'LIST', 'paper_size', 'A4', null, null, 5);

-- Step catalogue (ONBOARDING.md §1-2). "available" = built in this release; the rest show their phase.
create table onboarding_step (
    code        varchar(30)  primary key,
    sort_order  integer      not null unique,
    required    boolean      not null,
    available   boolean      not null,
    phase       varchar(4)   not null,
    route       varchar(60)  not null
);

insert into onboarding_step (code, sort_order, required, available, phase, route) values
    ('BUSINESS', 1, true, true, 'P2', '/onboarding/business'),
    ('COMPANY', 2, true, true, 'P2', '/onboarding/pharmacy'),
    ('LICENCES', 3, true, true, 'P2', '/onboarding/licences'),
    ('BRANCHES', 4, true, true, 'P2', '/onboarding/branches'),
    ('BOOKS', 5, true, true, 'P2', '/onboarding/books'),
    ('CONFIGURATION', 6, true, true, 'P2', '/onboarding/configuration'),
    ('TEAM', 7, false, false, 'P2', '/onboarding/team'),
    ('DATA', 8, false, false, 'P3', '/onboarding/data'),
    ('DEVICES', 9, false, false, 'P4', '/onboarding/devices'),
    ('PLAN', 10, false, false, 'P5', '/onboarding/plan'),
    ('PRACTICE', 11, false, false, 'P4', '/onboarding/practice');

-- ---------- tenant data (RLS) ----------
alter table tenant
    add column business_type     varchar(50),
    add column branch_count      varchar(50),
    add column catalogue_size    varchar(50),
    add column current_software  varchar(50),
    add column language          varchar(50),
    add column go_live_date      date,
    add column go_live_at        timestamptz;

create table company (
    id                        uuid          primary key,
    tenant_id                 uuid          not null references tenant (id),
    is_primary                boolean       not null default true,
    registration_type         varchar(50)   not null,
    gstin                     char(15),
    legal_name                varchar(200)  not null,
    trade_name                varchar(200),
    pan                       char(10)      not null,
    address_line1             varchar(200)  not null,
    address_line2             varchar(200),
    pin                       char(6)       not null,
    city                      varchar(100)  not null,
    district                  varchar(100),
    state_code                char(2)       not null references state (code),
    phone                     varchar(13),
    email                     varchar(254),
    pharmacist_name           varchar(200),
    pharmacist_reg_no         varchar(40),
    pharmacist_council_state  char(2)       references state (code),
    created_at                timestamptz   not null,
    created_by                uuid,
    updated_at                timestamptz   not null,
    updated_by                uuid,
    version                   bigint        not null default 0,
    constraint ck_company_gstin check (gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'),
    constraint ck_company_gstin_state check (gstin is null or substr(gstin, 1, 2) = state_code),
    constraint ck_company_pan check (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
    constraint ck_company_pan_gstin check (gstin is null or substr(gstin, 3, 10) = pan),
    constraint ck_company_pin check (pin ~ '^[1-9][0-9]{5}$'),
    constraint ck_company_phone check (phone is null or phone ~ '^\+91[6-9][0-9]{9}$'),
    constraint ck_company_email check (email is null or email = lower(email))
);
create unique index ux_company_primary on company (tenant_id) where is_primary;
create unique index ux_company_gstin on company (tenant_id, gstin) where gstin is not null;

create table licence (
    id          uuid         primary key,
    tenant_id   uuid         not null references tenant (id),
    company_id  uuid         not null references company (id),
    branch_id   uuid,
    kind        text         not null,
    number      varchar(40)  not null,
    valid_to    date,
    created_at  timestamptz  not null,
    created_by  uuid,
    updated_at  timestamptz  not null,
    updated_by  uuid,
    version     bigint       not null default 0,
    constraint ck_licence_kind check (kind in ('DRUG_RETAIL', 'DRUG_WHOLESALE', 'FSSAI', 'NARCOTIC')),
    constraint ck_licence_number check (length(trim(number)) between 3 and 40),
    constraint ck_licence_fssai check (kind <> 'FSSAI' or number ~ '^[0-9]{14}$'),
    constraint ck_licence_drug_expiry check (kind not in ('DRUG_RETAIL', 'DRUG_WHOLESALE') or valid_to is not null)
);
create unique index ux_licence_company_kind on licence (tenant_id, company_id, kind) where branch_id is null;

create table branch (
    id              uuid          primary key,
    tenant_id       uuid          not null references tenant (id),
    company_id      uuid          not null references company (id),
    name            varchar(100)  not null,
    code            varchar(10)   not null,
    is_head_office  boolean       not null default false,
    address_line1   varchar(200)  not null,
    address_line2   varchar(200),
    pin             char(6)       not null,
    city            varchar(100)  not null,
    district        varchar(100),
    state_code      char(2)       not null references state (code),
    created_at      timestamptz   not null,
    created_by      uuid,
    updated_at      timestamptz   not null,
    updated_by      uuid,
    version         bigint        not null default 0,
    constraint ck_branch_code check (code ~ '^[A-Z0-9]{1,10}$'),
    constraint ck_branch_pin check (pin ~ '^[1-9][0-9]{5}$'),
    constraint uq_branch_code unique (tenant_id, code)
);
create unique index ux_branch_head_office on branch (tenant_id) where is_head_office;
create index ix_branch_tenant_company on branch (tenant_id, company_id);
alter table licence add constraint fk_licence_branch foreign key (branch_id) references branch (id);

create table financial_year (
    id                uuid         primary key,
    tenant_id         uuid         not null references tenant (id),
    company_id        uuid         not null references company (id),
    start_date        date         not null,
    end_date          date         not null,
    books_start_date  date         not null,
    status            text         not null default 'OPEN',
    created_at        timestamptz  not null,
    created_by        uuid,
    updated_at        timestamptz  not null,
    updated_by        uuid,
    version           bigint       not null default 0,
    constraint ck_fy_dates check (end_date > start_date),
    constraint ck_fy_books_start check (books_start_date between start_date and end_date),
    constraint ck_fy_status check (status in ('OPEN', 'CLOSED')),
    constraint uq_fy_start unique (tenant_id, company_id, start_date)
);

create table tenant_setting (
    tenant_id   uuid          not null references tenant (id),
    key         varchar(100)  not null references setting_definition (key),
    value       text          not null,
    updated_at  timestamptz   not null,
    updated_by  uuid,
    version     bigint        not null default 0,
    primary key (tenant_id, key)
);

create table onboarding_progress (
    tenant_id   uuid         not null references tenant (id),
    step        varchar(30)  not null references onboarding_step (code),
    status      text         not null,
    updated_at  timestamptz  not null,
    updated_by  uuid,
    version     bigint       not null default 0,
    primary key (tenant_id, step),
    constraint ck_onboarding_status check (status in ('DONE', 'SKIPPED'))
);

-- RLS on every new tenant table (MULTI_TENANCY.md layer 4).
alter table company enable row level security;
create policy tenant_isolation on company using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());
alter table licence enable row level security;
create policy tenant_isolation on licence using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());
alter table branch enable row level security;
create policy tenant_isolation on branch using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());
alter table financial_year enable row level security;
create policy tenant_isolation on financial_year using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());
alter table tenant_setting enable row level security;
create policy tenant_isolation on tenant_setting using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());
alter table onboarding_progress enable row level security;
create policy tenant_isolation on onboarding_progress using (tenant_id = app_current_tenant() or app_rls_bypass())
    with check (tenant_id = app_current_tenant() or app_rls_bypass());
