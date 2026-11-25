# Backend implementation guide (`backend/meno-api`)

> How to build the Spring Boot modular monolith so that every rule in the specs ends up in code the same way. Read with [backend/meno-api/AGENTS.md](../../backend/meno-api/AGENTS.md) (layout, template, must-follow rules), [MODULES.md](MODULES.md) (module catalogue and allowed dependencies), [API_GUIDELINES.md](../api/API_GUIDELINES.md) (REST conventions), [DATA_MODEL.md](../database/DATA_MODEL.md), [DOCUMENT_FIELDS.md](../product/DOCUMENT_FIELDS.md), [CALCULATIONS.md](CALCULATIONS.md), [SECURITY.md](../security/SECURITY.md) and [ADR-0016](../decisions/0016-tamper-evident-records-and-device-signing.md).
> Owners: Kamesh (business modules, migrations), Nitheesh (platform, security, accounting, sync). Status: **specification** — the backend project does not exist yet (P1 creates it). Everything here is what the code must do; where a value is a business rule it is read from configuration (ADR-0014).

## 1. Build order

| Phase | Modules | Why first |
|---|---|---|
| P1 | `common`, `config`, `security`, `tenancy`, `auth`, `identity`, `audit`, `files` | Nothing else works without tenant, user, permission, audit |
| P2 | `catalog`, `party`, `taxation` (rates + calculator), settings | Masters and the GST engine |
| P3 | `pricing`, `purchase`, `inventory` | Stock comes in |
| P4 | `sales` (POS), `returns`, `compliance`, `payment`, `notification` | Pilot A: counter billing |
| P5 | `sync`, `accounting`, `subscription`, `reporting`, wholesale parts of `sales` | Pilot B + offline |
| P6 | `fieldsales`, e-invoice / e-way adapters, enterprise items | Growth |

## 2. One request, end to end

```
HTTP → Nginx/WAF (TLS, rate limit) → RequestIdFilter → JwtAuthFilter → TenantContextFilter
     → (DB) SET app.tenant_id for RLS → IdempotencyFilter (POST money/stock) → @RequiresPermission
     → @Valid record DTO (Bean Validation: @Gstin, @Hsn …) → Controller (map only)
     → Service @Transactional: load settings for the document date → domain rules → engine maths
       → repositories → other modules' facades (same transaction) → events → AuditRecorder
     → commit (Modulith event publication registry = outbox) → response or Problem Details
```

- **Tenant** comes only from the token; `TenantContextFilter` sets it, `TenantScopedEntity` filters by it, and PostgreSQL RLS (`current_setting('app.tenant_id')`) is the safety net. Any cross-tenant hit returns **404** and logs an S1 security event.
- **Branch** from `X-Branch-Id`, validated against `user_branch`.
- **Clock**: inject `Clock`; the document date (not "now") selects tax rates and settings.
- **Errors**: throw `BusinessRuleViolation(code, detail, fieldErrors)` → `ProblemDetailsHandler` → RFC 9457 with `code` = `MODULE_REASON`.

## 3. The posting pipeline (every money / stock document)

All of purchase, POS bill, wholesale invoice, returns, transfers, adjustments and receipts follow the same steps inside **one** transaction:

| # | Step | Code |
|---|---|---|
| 1 | Idempotency: same key + same body → return stored response; same key + different body → 422 `COMMON_IDEMPOTENCY_MISMATCH` | `IdempotencyFilter`, table `idempotency_record` |
| 2 | Load the draft with `version` (optimistic lock) or build from the request | `If-Match` |
| 3 | Period check: date in an open FY and not in a locked period | `PeriodGuard` → `ACCOUNTING_PERIOD_LOCKED` |
| 4 | Entitlement: edition / capacity / writable licence | `EntitlementGuard` → `LICENSE_*` |
| 5 | Snapshot masters (party, item, HSN, GST rate for the date, batch MRP) onto the document | `SnapshotService` |
| 6 | Domain rules (batch not expired, ≤ MRP, discount cap, credit check, licence valid, Rx present …) | domain methods, `ComplianceGuard`, `PartyFacade.creditStatus` |
| 7 | **Calculate** with the shared engine (§4); never trust client totals | `taxation.GstCalculator`, `pricing.PricingEngine` |
| 8 | Number: `SELECT … FOR UPDATE` on `number_series` (branch + type + FY [+ device]) | `NumberSeriesFacade.next()` → max 16 chars |
| 9 | Stock: `StockFacade.consume/receive` writes `inventory_movement` rows; balances updated under row lock on `stock_balance (batch, location)`; negative stock per setting | `INVENTORY_INSUFFICIENT_STOCK` |
| 10 | Status `POSTED`, `posted_at`, hash-chain link (`prev_hash`, `hash`) for the series | ADR-0016 |
| 11 | Publish event (`InvoicePosted`, `PurchasePosted` …) → accounting voucher, registers, notifications run as listeners (outbox, retried) | Spring Modulith |
| 12 | Audit (before / after) | `AuditRecorder` |

Reversal is the same pipeline with a reversing document; **no UPDATE or DELETE** on posted rows (DB grants enforce it).

## 4. Calculation engine (Java twin of `@meno/billing-engine`)

`packages/billing-engine` (TypeScript, decimal.js) is built and passes **all 72 vectors** in `contracts/test-vectors/`. The Java engine must expose the same functions with `BigDecimal` (`MathContext(40)`, `RoundingMode.HALF_UP`) and pass the same files in `TestVectorsTest` (loads `contracts/test-vectors/**`, dispatches on `input.fn`).

| TS function | Java (module.class.method) | CALCULATIONS § | Vectors |
|---|---|---|---|
| `calcLine`, `calcInvoice` | `taxation.GstCalculator.line / invoice` | §2–§4 | `gst/gst-core.json`, `pricing/exclusive.json`, `schemes/free-and-scheme.json` |
| `looseSale` | `pricing.PricingEngine.looseSale` | §7 | `pricing/loose-sale.json` |
| `allocateBillDiscount`, `largestRemainder` | `pricing.Allocation.billDiscount / largestRemainder` | §8 | `pricing/bill-discount.json` |
| `landedCost`, `suggestedPtr` | `purchase.LandedCost.compute`, `pricing.PricingEngine.suggestedPtr` | §9 | `schemes/landed-cost.json` |
| `margin`, `weightedAverage` | `pricing.Margin.compute`, `inventory.Valuation.weightedAverage` | §10–§11 | `pricing/margin.json` |
| `allocatePayment`, `changeDue`, `creditCheck` | `payment.Allocation.fifo`, `sales.Tender.change`, `party.CreditPolicy.check` | §13–§14 | `accounting/payments.json` |
| `interestSimple`, `interestCompoundMonthly`, `tds` | `accounting.Interest.*`, `accounting.Tds.compute` | §15–§16 | `accounting/interest-tds.json` |
| `reorder`, `expiryStatus` | `inventory.Reorder.compute`, `inventory.Expiry.status` | §17–§18 | `inventory/reorder-expiry.json` |
| `combinedBill` | `sales.CombinedBill.compute` | §22 | `documents/combined-bill.json` |

Conventions that are tenant settings (`gst.split_rounding`, `pricing.discount_order`, `billing.charges_gst`, rounding of the grand total, tie-break) are **parameters**, read from `SettingsFacade` and passed in — never constants. Money in JSON is a string (`"123.4500"`).

## 5. Settings and reference data

- `SettingsFacade.get(key, tenant, branch, date)` → effective-dated value from `tenant_setting` / `statutory_setting`; seeds in `contracts/reference-data/statutory-settings.v1.json` (36 keys, each with its research answer and confidence) and `chart-of-accounts.v1.json`.
- `TaxRateRepository.rateFor(hsn, date)` → `hsn_tax` (effective-dated; R-01).
- Reference lists (PIN, IFSC, banned FDCs, ceiling prices) are platform tables loaded by jobs with source and date (PLT-22, CMP-12, CAT-12).
- A settings change is audited and, for sensitive keys, needs a second approver (ADM-19).

## 6. Modules

Each block: **owns** (tables) · **endpoints** · **use cases** · **rules → error codes** · **events** · **tests**. Permissions are `module.resource.action`. Every module also has: cross-tenant test per endpoint, audit on every write, OpenAPI annotations.

### 6.1 `tenancy` (Nitheesh)
- Owns: tenant, company, branch, warehouse, financial_year, number_series, tenant_setting, period_lock, onboarding_progress.
- Endpoints: `GET/PUT /companies/{id}`, `/branches`, `/financial-years`, `/number-series`, `/settings`, `/period-locks`, `/onboarding/{step}`.
- Rules: GSTIN state = company state (`TENANCY_GSTIN_STATE_MISMATCH`); FY non-overlapping (`TENANCY_FY_OVERLAP`); series ≤ 16 chars (`TENANCY_SERIES_TOO_LONG`); go-live readiness checks (`TENANCY_NOT_READY` with list).
- Events: `BranchCreated`, `CompanyWentLive`. Tests: readiness matrix, series concurrency (100 parallel `next()` → no gaps or duplicates).

### 6.2 `auth` / `identity` / `security` (Nitheesh)
- Owns: app_user, role, permission, role_permission, user_branch, refresh_token, login_attempt, device, verification, consent, support_grant, passkey.
- Endpoints: `/auth/login|refresh|logout|otp|passkey/*`, `/users`, `/roles`, `/devices`, `/support-grants`, `/security/events`.
- Rules: lockout after N failures (setting); MFA required per role (PLT-35); refresh reuse → revoke family (`AUTH_TOKEN_REUSE`); support access only with an active grant (`SECURITY_NO_GRANT`); device revoked → reject sync (`SYNC_DEVICE_REVOKED`).
- Tests: THREAT_MODEL §5 cases 1, 5, 8, 10.

### 6.3 `audit` (Nitheesh)
- Owns: audit_log (hash-chained), chain_anchor.
- API: `AuditRecorder.record(entity, before, after, reason)`; `/audit?entity=&from=&to=`; `/audit/verify`.
- Rules: append-only; nightly verifier; break → S1 alert (`chain-break.md`).

### 6.4 `catalog` (Kamesh)
- Owns: item, composition, item_composition, manufacturer, brand, category, unit, unit_conversion, barcode, hsn, item_branch_setting, item_preferred_vendor, item_bundle, banned_drug, ceiling_price (ref).
- Endpoints: `/items` (CRUD, search `?q=` name / salt / barcode, ≤ 150 ms p95), `/items/{id}/substitutes`, `/salts`, `/manufacturers`, `/units`, `/hsn`, `/items/bulk-update`, `/items/merge`.
- Rules: name unique case-insensitive (`CATALOG_DUPLICATE_ITEM`); pharma items batch-enabled (`CATALOG_BATCH_REQUIRED`); barcode unique (`CATALOG_DUPLICATE_BARCODE`); GST from HSN only; discontinued blocks purchase / sale (`CATALOG_ITEM_DISCONTINUED`); banned blocks (`CATALOG_ITEM_BANNED`).
- Events: `ItemChanged`. Tests: search performance with 50k items; substitute matching by salt + strength + form.

### 6.5 `party` (Kamesh)
- Owns: party, party_contact, party_address, party_licence, party_bank_account, party_reminder, party_patient, party_invite, doctor, party_group.
- Endpoints: `/suppliers`, `/customers`, `/doctors`, `/parties/{id}/statement`, `/parties/{id}/credit-status`, `/party-invites`, `/gstin/{gstin}` (verification adapter).
- Rules: GSTIN pattern + check digit + state (`PARTY_INVALID_GSTIN`); PAN = GSTIN[2..12] (`PARTY_PAN_MISMATCH`); one primary contact / billing address; licence valid for pharma parties (`PARTY_LICENCE_EXPIRED`); bank change needs approval (`PARTY_BANK_CHANGE_PENDING`); credit check (§14) → `SALES_CREDIT_LIMIT_EXCEEDED`.
- API: `PartyFacade.creditStatus(partyId, extra)`. Events: `PartyChanged` (accounting creates the ledger).

### 6.6 `taxation` (Kamesh)
- Owns: tax_rate, hsn_tax, statutory_setting, einvoice_request, eway_request, gstr_export, ims_action.
- API: `GstCalculator` (§4), `PlaceOfSupply.resolve(seller, buyer)`, `EInvoiceService.submit(invoiceId)` (async, outbox, GSP adapter), `GstrExporter.gstr1(period)`.
- Rules: invoice GST validation before post (`TAXATION_INVALID_INVOICE` with field list); e-invoice when AATO > setting; 30-day IRP limit warning (R-02); credit note GST reduction blocked after the s.34 date (`TAXATION_CREDIT_NOTE_TIME_BARRED`, R-08).
- Tests: `TestVectorsTest`; GSTR-1 JSON against the portal schema.

### 6.7 `pricing` (Kamesh)
- Owns: price_list, price_list_item, scheme, discount_rule, offer, segment.
- API: `PricingEngine.price(lines, party, date)` → rate, schemes, free qty, caps; `Allocation`.
- Rules: never above MRP (`PRICING_ABOVE_MRP`); discount above effective cap → approval (`PRICING_DISCOUNT_APPROVAL_REQUIRED`); below cost needs `sales.below_cost` (`PRICING_BELOW_COST`).

### 6.8 `purchase` (Kamesh)
- Owns: purchase_order, purchase_invoice(+lines), grn, indent, import_job, inbound_mail, landed_cost.
- Endpoints: `/purchase-orders`, `/purchase-orders/merge`, `/purchase-invoices` (draft, `POST /{id}/post`, `POST /{id}/reverse`), `/purchase-imports`, `/indents`.
- Rules: supplier bill no. unique per supplier + FY (`PURCHASE_DUPLICATE_SUPPLIER_INVOICE`); expired batch (`PURCHASE_BATCH_EXPIRED`); typed total vs computed ±₹1 (`PURCHASE_TOTAL_MISMATCH`); rate deviation warning; ITC only when claimable.
- Calls: `StockFacade.receive`, `LandedCost`. Events: `PurchasePosted` → voucher, payables, MSME due date.
- Tests: scenario "purchase with free goods and freight → landed cost and stock".

### 6.9 `inventory` (Kamesh)
- Owns: batch, inventory_movement, stock_balance, stock_location, stock_transfer, stock_adjustment, stock_count, reservation, batch_price_revision.
- API: `StockFacade.receive / consume / transfer / adjust / available / reserve`.
- Rules: FEFO default, override needs permission + reason (`INVENTORY_FEFO_OVERRIDE_REASON`); expired batch (`INVENTORY_BATCH_EXPIRED`); insufficient stock per policy (`INVENTORY_INSUFFICIENT_STOCK`); blocked / recalled batch (`INVENTORY_BATCH_BLOCKED`); movements only, never balance edits.
- Jobs: nightly reconciliation balance vs Σ movements (`INV-12`), near-expiry alerts, reorder suggestions (§17).
- Events: `StockLow`, `BatchExpiring`, `BatchRecalled`.

### 6.10 `sales` (Kamesh backend, Meyyarivu POS)
- Owns: sales_invoice(+lines), held_bill, sales_order, delivery_challan, quotation, document_charge, print_log, combined bill links.
- Endpoints: `/sales-invoices` (draft, `/{id}/post`, `/{id}/cancel`, `/{id}/print`), `/pos/held-bills`, `/sales-orders`, `/quotations`.
- Rules: Rx required for Schedule H/H1/X (`COMPLIANCE_PRESCRIPTION_REQUIRED`); retailer licence valid (`PARTY_LICENCE_EXPIRED`); credit check; open shift (`SALES_SHIFT_NOT_OPEN`); same-day cancel window (`SALES_CANCEL_WINDOW_PASSED`); payments sum = total (`SALES_PAYMENT_MISMATCH`).
- Calls: `PricingEngine`, `GstCalculator`, `StockFacade.consume`, `ComplianceGuard.checkSale`. Events: `InvoicePosted`, `InvoiceCancelled`.
- Tests: critical scenarios (TEST_STRATEGY) incl. double F10 → one bill; combined bill vector.

### 6.11 `returns` (Kamesh)
- Owns: sales_return, purchase_return, expiry_claim, credit_note, debit_note, return_inspection.
- Rules: qty ≤ sold − returned (`RETURNS_QTY_EXCEEDS_SOLD`); same batch, price, GST as original (snapshot); inspection decides saleable vs dump; reasons from master; credit note time limit (R-08).
- Events: `ReturnPosted`, `ClaimSettled`.

### 6.12 `compliance` (Kamesh)
- Owns: schedule_register_entry (hash-chained), prescription (vault), destruction_record, licence_alert, inspection_pack.
- API: `ComplianceGuard.checkSale(lines, rx)`; register entries written from `InvoicePosted`.
- Rules: H1 fields per `schedule.h1.register_fields` setting (R-18); NDPS sale off unless licensed (`COMPLIANCE_NDPS_DISABLED`, R-27); ceiling price warning (`COMPLIANCE_ABOVE_CEILING`, R-21).

### 6.13 `payment` (Nitheesh)
- Owns: payment, payment_allocation, payment_mode, cheque_book, cheque_leaf, collection_assignment.
- Rules: FIFO allocation (§13); cheque bounce reverses allocation (`PAYMENT_CHEQUE_BOUNCED` flow); TDS per section (§16).
- Events: `PaymentRecorded`, `ChequeBounced`.

### 6.14 `accounting` (Nitheesh)
- Owns: ledger_group, ledger_account, voucher, voucher_entry, posting_rule, period_lock, day_close.
- Listeners: `InvoicePosted`, `PurchasePosted`, `ReturnPosted`, `PaymentRecorded`, `StockAdjusted` → voucher via `posting_rule` (system codes, never ledger names).
- Rules: Σ debit = Σ credit (`ACCOUNTING_UNBALANCED`); missing system ledger (`ACCOUNTING_LEDGER_MISSING`); locked period.
- Reports: trial balance, P&L, balance sheet, day / cash / bank book from vouchers.

### 6.15 `sync` (Nitheesh)
- Owns: device_registration, device_key, sync_batch, sync_conflict, quarantine.
- Endpoints: `/sync/push`, `/sync/pull`, `/devices/register`.
- Rules: device signature valid (`SYNC_BAD_SIGNATURE`); device active; offline bills re-validated and posted through the same pipeline; conflicts recorded, never silently changed ([OFFLINE_SYNC.md](OFFLINE_SYNC.md)).

### 6.16 `subscription`, `notification`, `files`, `reporting`, `fieldsales`
- `subscription`: plans, licences, `EntitlementGuard` (LICENSING.md, ADR-0015).
- `notification`: templates, channels (WhatsApp / SMS DLT IDs / email), consent and opt-out (R-25), owner digest.
- `files`: private storage, AV scan, signed URLs, patient-data vault bucket (SEC-17).
- `reporting`: read-only SQL views; exports as jobs; never writes.
- `fieldsales`: routes, beats, targets, collections (P6).

## 7. Error-code catalogue (starter)

| Code | HTTP | Meaning |
|---|---|---|
| `COMMON_VALIDATION` | 400 | Field errors from Bean Validation |
| `COMMON_IDEMPOTENCY_MISMATCH` | 422 | Same key, different body |
| `COMMON_VERSION_CONFLICT` | 409 | Stale `If-Match` |
| `ACCOUNTING_PERIOD_LOCKED` | 422 | Date in a locked period |
| `LICENSE_EXPIRED` / `LICENSE_LIMIT_REACHED` | 402 / 422 | Entitlement |
| `PARTY_INVALID_GSTIN` / `PARTY_LICENCE_EXPIRED` | 422 | Party rules |
| `CATALOG_ITEM_BANNED` / `CATALOG_ITEM_DISCONTINUED` | 422 | Item blocked |
| `INVENTORY_BATCH_EXPIRED` / `INVENTORY_INSUFFICIENT_STOCK` | 422 | Stock rules |
| `PRICING_ABOVE_MRP` / `PRICING_DISCOUNT_APPROVAL_REQUIRED` | 422 | Price rules |
| `COMPLIANCE_PRESCRIPTION_REQUIRED` | 422 | Schedule H/H1/X without Rx |
| `SALES_CREDIT_LIMIT_EXCEEDED` | 422 | Credit |
| `PURCHASE_DUPLICATE_SUPPLIER_INVOICE` | 409 | Same supplier bill twice |
| `TAXATION_CREDIT_NOTE_TIME_BARRED` | 422 | After the s.34 date |
| `SYNC_BAD_SIGNATURE` / `SYNC_DEVICE_REVOKED` | 422 / 403 | Offline integrity |

Each module's `AGENTS.md` keeps its full list; the UI maps codes to friendly text.

## 8. Tests every module must have

| Level | What | Tool |
|---|---|---|
| Unit | Domain rules, engine functions (vectors) | JUnit 5 |
| Integration | Each endpoint incl. cross-tenant, permission denied, validation errors | Testcontainers PostgreSQL |
| Architecture | Module boundaries | Spring Modulith `ModulithTest`, ArchUnit |
| Scenario | 15 critical scenarios (TEST_STRATEGY.md) across modules | `scenarios/` |
| Security | THREAT_MODEL.md §5 abuse cases | integration + ZAP |
| Performance | Budgets (ENTERPRISE_READINESS §2) | k6 |
