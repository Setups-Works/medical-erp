-- GSTIN fetch (GSTIN_FETCH.md §5): allowed for whoever may create suppliers / customers, and for the owner's
-- onboarding company step. Seed for the temporary roles until per-tenant roles (PLT-07).
insert into permission (code, description) values
    ('party.supplier.create', 'Create suppliers'),
    ('party.customer.create', 'Create customers');

insert into role_permission (role, permission_code) values
    ('OWNER', 'party.supplier.create'),
    ('OWNER', 'party.customer.create');
