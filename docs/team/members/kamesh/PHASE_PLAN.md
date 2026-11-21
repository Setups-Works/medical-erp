# Kamesh — phase plan

Do tasks in the **Step** order shown in MENO Hub and in [TASK_ORDER.md](TASK_ORDER.md).

Backend only. Feature tasks for CAT, PTY, PRC, PUR, INV, IJX, MKT, POS, WHS, DOC, RET, CMP, GST come from FEATURES.md in MENO Hub; this list is the module groundwork around them.

## P0 Foundation
- [x] Learn: Spring Boot 4 basics, Spring Data JPA, Flyway, Testcontainers, Spring Modulith (links in `docs/team/ONBOARDING.md`)
- [x] ER diagram v1 for catalog, party, purchase, inventory, sales (`docs/database/DATA_MODEL.md`)
- [x] Walk through module template with Nitheesh

## P1 Platform core
- [ ] Help Nitheesh with `identity` and audit; write the permission seed migration for your modules
- [ ] Validation layer for your modules: Bean Validation DTOs + domain invariants + DB constraints (VALIDATION_AND_BUSINESS_RULES.md)
- [ ] Cross-tenant tests for every endpoint you add

## P2 Masters
- [ ] `catalog`: items, generic/salt, brands, manufacturers, HSN, units + conversion, barcodes, categories
- [ ] `party`: suppliers, customers, retailers, doctors, opening balances, customer groups
- [ ] Item search endpoint (trigram index, < 150 ms)

## P3 Purchase & inventory
- [ ] `taxation` GstCalculator & `pricing` engine passing test vectors (pair with Nitheesh)
- [ ] `inventory`: batch, movement ledger, stock_balance, adjustments, nightly reconciliation job
- [ ] `purchase`: PO, GRN, verification, invoice entry, posting, reversal, duplicate detection, import pipeline

## P4 Retail POS & returns
- [ ] `sales`: retail invoice posting, FEFO with authorised override, `SELECT … FOR UPDATE` batch locking, idempotency
- [ ] Held bills, discount approval, invoice list/reprint
- [ ] `returns`: sales return with inspection, purchase return, expiry/breakage claims, credit/debit notes
- [ ] `compliance`: prescriptions, Schedule H1 register, restricted-medicine guard

## P5 Wholesale, finance, offline
- [ ] Wholesale orders → pick → invoice, price lists, schemes, credit control, reservations
- [ ] e-invoice / e-way bill via the GSP adapter (`integrations/gst`)
- [ ] Stock transfers, stock count, stock aging
- [ ] Server-side validation used by `sync` push (with Nitheesh)

## P6 Pilot
- [ ] GSTR-1/3B preparation, ITC register, GST reconciliation exports
- [ ] Performance fixes from pilot; bug SLA

## P7 Growth
- [ ] Retailer → distributor ordering API between tenants
