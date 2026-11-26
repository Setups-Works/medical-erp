-- tenancy: Indian states / union territories with their GST state codes (VALIDATION_AND_BUSINESS_RULES.md:
-- "State codes and names: state lookup table (seeded, versioned)"). Platform reference data, not tenant data.
-- Source: GST state code list (GST portal). 25 (Daman and Diu, merged into 26 in 2020) stays with effective_to so
-- GSTINs issued before the merger still resolve. 28 (undivided Andhra Pradesh) is left out: GST registrations use 37.
create table state (
    code            char(2)      primary key,
    name            varchar(100) not null,
    kind            text         not null,
    effective_from  date         not null,
    effective_to    date,
    sort_order      integer      not null,
    constraint ck_state_code check (code ~ '^[0-9]{2}$'),
    constraint ck_state_kind check (kind in ('STATE', 'UNION_TERRITORY', 'OTHER')),
    constraint ck_state_effective check (effective_to is null or effective_to > effective_from),
    constraint uq_state_sort unique (sort_order)
);

insert into state (code, name, kind, effective_from, effective_to, sort_order) values
    ('01', 'Jammu and Kashmir', 'UNION_TERRITORY', '2017-07-01', null, 1),
    ('02', 'Himachal Pradesh', 'STATE', '2017-07-01', null, 2),
    ('03', 'Punjab', 'STATE', '2017-07-01', null, 3),
    ('04', 'Chandigarh', 'UNION_TERRITORY', '2017-07-01', null, 4),
    ('05', 'Uttarakhand', 'STATE', '2017-07-01', null, 5),
    ('06', 'Haryana', 'STATE', '2017-07-01', null, 6),
    ('07', 'Delhi', 'UNION_TERRITORY', '2017-07-01', null, 7),
    ('08', 'Rajasthan', 'STATE', '2017-07-01', null, 8),
    ('09', 'Uttar Pradesh', 'STATE', '2017-07-01', null, 9),
    ('10', 'Bihar', 'STATE', '2017-07-01', null, 10),
    ('11', 'Sikkim', 'STATE', '2017-07-01', null, 11),
    ('12', 'Arunachal Pradesh', 'STATE', '2017-07-01', null, 12),
    ('13', 'Nagaland', 'STATE', '2017-07-01', null, 13),
    ('14', 'Manipur', 'STATE', '2017-07-01', null, 14),
    ('15', 'Mizoram', 'STATE', '2017-07-01', null, 15),
    ('16', 'Tripura', 'STATE', '2017-07-01', null, 16),
    ('17', 'Meghalaya', 'STATE', '2017-07-01', null, 17),
    ('18', 'Assam', 'STATE', '2017-07-01', null, 18),
    ('19', 'West Bengal', 'STATE', '2017-07-01', null, 19),
    ('20', 'Jharkhand', 'STATE', '2017-07-01', null, 20),
    ('21', 'Odisha', 'STATE', '2017-07-01', null, 21),
    ('22', 'Chhattisgarh', 'STATE', '2017-07-01', null, 22),
    ('23', 'Madhya Pradesh', 'STATE', '2017-07-01', null, 23),
    ('24', 'Gujarat', 'STATE', '2017-07-01', null, 24),
    ('25', 'Daman and Diu', 'UNION_TERRITORY', '2017-07-01', '2020-01-26', 25),
    ('26', 'Dadra and Nagar Haveli and Daman and Diu', 'UNION_TERRITORY', '2017-07-01', null, 26),
    ('27', 'Maharashtra', 'STATE', '2017-07-01', null, 27),
    ('29', 'Karnataka', 'STATE', '2017-07-01', null, 29),
    ('30', 'Goa', 'STATE', '2017-07-01', null, 30),
    ('31', 'Lakshadweep', 'UNION_TERRITORY', '2017-07-01', null, 31),
    ('32', 'Kerala', 'STATE', '2017-07-01', null, 32),
    ('33', 'Tamil Nadu', 'STATE', '2017-07-01', null, 33),
    ('34', 'Puducherry', 'UNION_TERRITORY', '2017-07-01', null, 34),
    ('35', 'Andaman and Nicobar Islands', 'UNION_TERRITORY', '2017-07-01', null, 35),
    ('36', 'Telangana', 'STATE', '2017-07-01', null, 36),
    ('37', 'Andhra Pradesh', 'STATE', '2017-07-01', null, 37),
    ('38', 'Ladakh', 'UNION_TERRITORY', '2019-10-31', null, 38),
    ('97', 'Other Territory', 'OTHER', '2017-07-01', null, 97);

-- Sign-up details on the tenant (AUT-04, PLT-01). State becomes the company state in the GSTIN step (AUT-06).
-- Nullable: the bootstrap tenant is created without them.
alter table tenant
    add column state_code    char(2) references state (code),
    add column start_option  text,
    add column partner_code  varchar(40),
    add column signup_key    uuid;

-- Re-submitting a sign-up with the same Idempotency-Key returns the same tenant (ONBOARDING.md rule 4).
create unique index ux_tenant_signup_key on tenant (signup_key) where signup_key is not null;
