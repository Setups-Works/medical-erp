# Backend module catalogue

Package root: `com.setupsworks.meno.modules.<module>`. Each module has `api / web / service / domain / repository / mapper`. Only `api` is visible to other modules.

Base-plan names are kept as **sub-domains** inside fewer, larger modules so beginners have fewer boundaries to manage.

| Module | Owns (tables, roughly) | Base-plan names merged in | Public API (examples) | Publishes events | Allowed deps | Phase |
|---|---|---|---|---|---|---|
| `auth` | refresh_token, login_attempt, device | auth | `AuthFacade.currentUser()` | `UserLoggedIn` | identity, tenancy | 1 |
| `tenancy` | tenant, company, branch, financial_year, number_series, tenant_setting | company, branch | `TenantContext`, `BranchFacade` | `BranchCreated` | — | 1 |
| `identity` | app_user, role, permission, role_permission, user_branch | users, roles | `PermissionChecker` | `UserInvited` | tenancy | 1 |
| `subscription` | plan, license, license_event, license_activation_attempt, usage (LICENSING.md) | subscription, licensing | `EntitlementGuard.requireEdition/Feature/Capacity/Writable`, `EditionGuard.require(WHOLESALE)` | `LicenseActivated`, `LicenseChanged`, `PlanChanged` | tenancy | 5 |
| `audit` | audit_log | audit | `AuditRecorder` | — | — | 1 |
| `notification` | notification, template, channel_config | notifications | `Notifier.send(...)` | — | tenancy | 4 |
| `files` | stored_file | — | `FileStore.put/get` (signed URLs) | — | — | 2 |
| `sync` | device_registration, sync_batch, sync_conflict | — | `/api/v1/sync/*` | `OfflineInvoiceAccepted` | sales, inventory, catalog, party | 5 |
| `catalog` | item (medicine), manufacturer, salt/composition, category, unit, hsn, barcode, rack_location, substitute | medicine, categories | `CatalogFacade.findItem` | `ItemChanged` | taxation | 2 |
| `party` | party (supplier/customer/retailer), party_gst, party_contact, credit_terms | suppliers, customers | `PartyFacade.creditStatus` | `PartyChanged` | tenancy | 2 |
| `pricing` | price_list, price_list_item, scheme, discount_rule | pricing | `PricingEngine.price(lines)` | — | catalog, party | 3 |
| `purchase` | purchase_order, purchase_invoice(+lines), grn, import_job | purchase | `PurchaseFacade` | `PurchasePosted` | catalog, party, pricing, taxation, inventory, files | 3 |
| `inventory` | batch, inventory_movement, stock_balance, stock_transfer, stock_adjustment, stock_count | inventory | `StockFacade.consume/receive/available` | `StockLow`, `BatchExpiring` | catalog, tenancy | 3 |
| `sales` | sales_order, sales_invoice(+lines), held_bill, delivery | sales, billing | `SalesFacade` | `InvoicePosted`, `InvoiceCancelled` | catalog, party, pricing, taxation, inventory, compliance | 4 |
| `returns` | sales_return, purchase_return, expiry_return, credit_note, debit_note | returns | `ReturnsFacade` | `ReturnPosted` | sales, purchase, inventory, taxation | 4 |
| `compliance` | schedule_register_entry, prescription, doctor, banned_drug | — (new) | `ComplianceGuard.checkSale` | — | catalog, files | 4 |
| `payment` | payment, receipt, allocation, payment_mode | payments | `PaymentFacade` | `PaymentRecorded` | party | 4 |
| `accounting` | ledger_account, voucher, voucher_entry, expense, day_close | accounting | `LedgerFacade.balance` | — | party | 5 |
| `taxation` | tax_rate, hsn_tax, einvoice_request, gstr_export | taxation | `GstCalculator`, `EInvoiceService` | — | — | 3 |
| `reporting` | read models / SQL views only | reports | `/api/v1/reports/*` | — | everything (read-only) | 3+ |
| `fieldsales` | route, beat, salesman, visit, collection | — (new) | — | — | sales, party, payment | 6 |

## Rules

1. `@ApplicationModule(allowedDependencies = …)` in each module's `package-info.java` must match the "Allowed deps" column. Changing it is an architectural decision → ADR + tech lead review.
2. Cross-module writes inside one business transaction (e.g. sales → inventory) are **synchronous facade calls** in the same transaction. Side effects (ledger posting, notifications) are **events**.
3. Accounting listens to events and posts vouchers. If the listener fails, the event stays in the publication registry and is retried; reconciliation report flags gaps.
4. `reporting` never writes. Heavy reports read from SQL views/materialized views under `db/migration`.

## Adding a new module (checklist)

1. Create `modules/<name>/{api,web,service,domain,repository,mapper}` + `package-info.java`.
2. Add a row to the table above and to [ARCHITECTURE.md](ARCHITECTURE.md) §4 diagram.
3. Add `modules/<name>/AGENTS.md` from the template in `backend/meno-api/AGENTS.md`.
4. Migrations, RLS, permissions (`<module>.<resource>.<action>`), audit, tests incl. cross-tenant.
