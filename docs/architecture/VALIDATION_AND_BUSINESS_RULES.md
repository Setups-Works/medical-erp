# Validation, business rules and "no hard-coding"

> **Mandatory reading for every developer and every AI agent before writing MENO code.** MENO is an ERP: it holds money, stock, tax and legal records for real businesses. A missing check is not a small bug. It is a wrong invoice, a lost batch or a compliance breach. Reviewers reject PRs that break any rule marked **MUST**.

Related: [CALCULATIONS.md](CALCULATIONS.md) (money maths), [MULTI_TENANCY.md](MULTI_TENANCY.md), [DATA_MODEL.md](../database/DATA_MODEL.md), [API_GUIDELINES.md](../api/API_GUIDELINES.md), [COMPLIANCE.md](../compliance/COMPLIANCE.md).

---

## 1. Database: PostgreSQL only

- **MUST** use PostgreSQL (17) for all MENO product data: one database per environment, shared schema, RLS per tenant (ADR-0013). No MongoDB, MySQL or document stores inside the product. (MongoDB is used only by the internal team tool `project-management/`, never by MENO.)
- **MUST** make PostgreSQL enforce what it can: `NOT NULL`, `CHECK`, `UNIQUE`, foreign keys, exclusion constraints, deferred triggers for balanced vouchers. The database is the last line of defence when application code has a bug.
- Desktop offline storage is SQLite only as a **cache + outbox** (OFFLINE_SYNC.md); PostgreSQL stays the system of record.

## 2. Four layers of validation (all four, every time)

| Layer | Where | Purpose | Tooling |
|---|---|---|---|
| 1. UI | `apps/web` forms | Fast feedback, prevent obvious mistakes | Zod schemas from `@meno/validation`, React Hook Form |
| 2. API contract | Controller request records | Reject malformed input with field errors | Jakarta Bean Validation (`@NotNull`, `@Size`, `@Pattern`, custom `@Gstin`, `@Hsn`…) |
| 3. Domain | Entities / services | Business rules that need state (stock, credit, expiry, period lock) | Domain methods that throw `BusinessRuleViolation(code)` |
| 4. Database | PostgreSQL | Invariants that must never break even with buggy code | Constraints, RLS, triggers |

Rules:
- **MUST** never rely on layer 1 alone. The UI can be bypassed; layers 2–4 always run.
- **MUST** keep layer 1 and 2 rules identical: field names, lengths and patterns come from the same source (the OpenAPI spec + `packages/validation`). If they differ, the backend wins and the Zod schema is fixed.
- **MUST** validate **every** input: request bodies, query params, path ids, headers (`X-Branch-Id`, `Idempotency-Key`), uploaded files (type sniffing + size), CSV import rows, sync payloads from devices, webhook callbacks from providers.
- **MUST** return all field errors at once (not one by one) using Problem Details with an `errors[]` array: `{ field, code, message }`.
- **MUST** use stable error codes (`INVENTORY_BATCH_EXPIRED`, `PARTY_INVALID_GSTIN`); the UI maps codes to friendly text. Never show stack traces or SQL errors.

## 3. No hard-coding (configuration over code)

ERP behaviour differs per tenant, state, edition and year. Anything that can change belongs in **data**, not in code.

| Never hard-code | Put it in | Owner module |
|---|---|---|
| GST rates, cess, HSN → rate mapping | `tax_rate`, `hsn_tax` tables (effective-dated) | taxation |
| State codes and names | `state` lookup table (seeded, versioned) | tenancy |
| Document number formats / prefixes | `number_series` per branch, doc type, FY, device | tenancy |
| Financial year dates | `financial_year` table | tenancy |
| Payment modes, card terminals, UPI VPA | `payment_mode` settings | payment / ADM-02 |
| Units and conversions (box → strip → tablet) | `unit`, `unit_conversion` | catalog |
| Drug schedules and what each requires (Rx, register, retention) | `schedule_rule` table | compliance |
| Discount limits per role, credit-override limits, approval thresholds | `approval_rule`, role settings | identity / PLT-19 |
| Near-expiry days, low-stock levels, reorder levels | `tenant_setting`, `item_branch_setting` | tenancy / catalog |
| Rounding mode, MRP-inclusive billing, negative-stock policy | `tenant_setting` | tenancy |
| Roles and permissions | `role`, `permission`, `role_permission` (seeded defaults, editable) | identity |
| Price lists, schemes, discount rules | pricing tables | pricing |
| Menu items, dashboard widgets per role | `NAVIGATION.md` → `config/nav.ts`; role dashboard config | NAV / DSH |
| Email/WhatsApp/SMS templates | `notification_template` | notification |
| Thresholds such as e-invoice turnover, e-way bill value | `statutory_setting` (effective-dated, ⚠ verified source) | taxation |
| URLs, keys, credentials | environment variables / secrets | DevOps |

Rules:
- **MUST NOT** write business numbers in code (`if (gstRate == 12)`, `days < 90`, `amount > 50000`). Read them from configuration through a typed facade (`SettingsFacade`, `TaxRateRepository`, `ApprovalPolicy`).
- **MUST NOT** branch on role names (`if (role == "PHARMACIST")`). Check **permissions** (`permissionChecker.require("sales.discount.override")`).
- **MUST NOT** hard-code option lists in the UI (states, units, payment modes, schedules). Load them from the API (cached with TanStack Query).
- Enums in code are allowed only for **closed, structural** sets that never change per tenant (document status `DRAFT/POSTED/REVERSED`, movement type). Everything business-variable is data.
- Effective-dated configuration: rates and statutory values have `valid_from` / `valid_to`. Documents use the value valid **on the document date**, and snapshot it on the document.
- Seed data (default roles, states, HSN sample rates) lives in Flyway seed migrations, clearly marked, and can be changed per tenant where appropriate.

## 4. Field validation catalogue (minimum)

Prakalya maintains the full catalogue in the FRS; these are the baseline rules every implementation uses (backend annotations + Zod).

| Field | Rule |
|---|---|
| GSTIN | 15 chars, pattern `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$`, valid check digit, first 2 digits = a valid state code that matches the party's state |
| PAN | `^[A-Z]{5}[0-9]{4}[A-Z]$`; must equal GSTIN chars 3–12 when both present |
| Drug licence no. | Required for pharmacies/retailers/suppliers per edition; free text with trimmed length 3–40; expiry date required and in the future for active use ⚠ format per state |
| Phone (India) | 10 digits starting 6–9 (store E.164 `+91…`) |
| Email | RFC-compliant, lower-cased, max 254 |
| PIN code | 6 digits, not starting with 0; must exist in the PIN directory (PLT-22), which fills state, district and city. Looked up in MENO's list, then India Post's online directory (ADR-0021). In forms today an unknown PIN shows "We don't know this PIN" and the person types city and district (saving is not blocked) |
| IFSC | `^[A-Z]{4}0[A-Z0-9]{6}$`; must exist in the IFSC directory (PLT-22) |
| Bank account no. | 9–18 digits, entered twice to confirm; stored encrypted, shown as last 4 |
| Udyam (MSME) no. | `^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$` |
| FSSAI licence no. | 14 digits |
| UPI ID | `^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$` |
| Percentages (discount, commission, mark-up, interest) | 0–100, max 2 decimals; mark-up min ≤ max |
| HSN | 4, 6 or 8 digits; must exist in `hsn_tax` for the document date |
| Batch number | Required for medicines; 1–30 chars; unique per item + expiry + MRP + branch |
| Expiry date | Required for medicines; > manufacturing date; purchase entry warns if already within near-expiry days and blocks if expired (unless an expiry-return document) |
| MRP | > 0; selling rate ≤ MRP (hard rule); purchase rate ≤ MRP |
| Quantity | > 0 (returns are separate documents, never negative quantities); respects unit conversion and allowed decimals for loose units |
| Discount % | 0–100 and ≤ the role's approval limit, otherwise approval required |
| Money amounts | ≥ 0, max 2 decimals on input, `BigDecimal` / decimal.js only |
| Dates | Document date within an **open** financial year and not in a locked period; not in the future beyond the configured tolerance |
| Names | Trimmed, 1–200 chars, no control characters; duplicates detected case-insensitively where unique (item, party) |
| Files | Allowed MIME types per purpose (Rx: jpg/png/pdf), max size from settings, virus scan (P5) |

## 5. Business rules that must hold (examples, not the full list)

| Area | Rule (MUST) | Enforced in |
|---|---|---|
| Inventory | Stock changes only through `inventory_movement`; no direct edits | domain + DB (no UPDATE grant on balances except via movement procedure) |
| Inventory | No sale from an expired batch; FEFO default; override needs permission + reason, recorded | domain + audit |
| Inventory | Concurrent sales cannot oversell (row locks) | domain + DB `CHECK (qty >= 0)` unless tenant allows negative |
| Sales | Selling price ≤ MRP; discount above role limit needs approval | domain |
| Sales | Schedule H/H1/X items need the prescription data the schedule rule requires before posting | compliance guard |
| Sales | Credit sale blocked above credit limit unless approved | domain (party facade) |
| Purchase | Duplicate supplier invoice number in the same FY is blocked | domain + unique index |
| Documents | Posted documents are immutable; corrections via reversal / credit / debit notes | domain + DB trigger |
| Documents | Document numbers are gap-aware, unique per series and FY | number series lock + unique index |
| Accounting | Every voucher balances (Σ debit = Σ credit) | DB deferred trigger |
| Accounting | Posting into a closed period is blocked | domain |
| GST | Place of supply decides CGST+SGST vs IGST; invoice fails validation if GSTIN/state/HSN/rate inconsistent (GST-11) | taxation |
| Tenancy | Every query is tenant-scoped; ids from other tenants return 404 | filter + RLS |
| Idempotency | Same `Idempotency-Key` returns the original result | web filter + unique index |

## 6. Statutory and safety boundaries

- **GST:** MENO **prepares, validates and exports** GSTR data, e-invoice and e-way bill payloads. Do **not** claim, label or build "direct filing" or government API connectivity until the integration and authorisation actually exist and are approved (ADR needed). UI copy says "Prepare" / "Export", not "File".
- **Schedules and registers:** implement exact statutory workflows only after the rule is confirmed in COMPLIANCE.md by a qualified pharmacy compliance professional (central and state rules). Until then, the feature stays behind a flag.
- **Substitutes:** suggestions match salt, strength, dosage form and release type. The UI must say they are "same composition" and **must not** present them as clinically interchangeable; the pharmacist decides.
- **Reminders and patient data:** refill and follow-up reminders require recorded customer consent and an opt-out; store the minimum patient data needed (DPDP Act, ⚠ legal review).
- **FEFO overrides, discount overrides, credit overrides, stock adjustments:** always permission-checked, reason required, audited.

## 7. Rules for AI agents (repeat of the above, as a checklist)

Before you write code, confirm:
- [ ] Which validation rules apply (this file + the FRS) and at which of the 4 layers you implement them
- [ ] No business number, rate, threshold, role name, state or option list is written in code
- [ ] Every input (body, params, headers, files, imports, sync payloads) is validated
- [ ] Error responses use Problem Details with stable codes and all field errors
- [ ] Money uses `BigDecimal` / decimal.js; stock uses movements; posted documents are immutable
- [ ] PostgreSQL constraints back up the rule (NOT NULL, CHECK, UNIQUE, FK, RLS)
- [ ] Tests cover valid, invalid and boundary values for each rule, plus permission and cross-tenant cases
- [ ] If a rule is unclear or marked ⚠, stop and ask (Hub task comment to Prakalya); never invent it

## 8. Review checklist (reviewers)

Reject the PR if any of these is true: a hard-coded business value; a missing server-side validation for a field the UI validates; a new table without constraints/RLS; an error that leaks internals; a rule implemented differently in UI and API; an override without permission + reason + audit; a statutory claim the product can't back up.
