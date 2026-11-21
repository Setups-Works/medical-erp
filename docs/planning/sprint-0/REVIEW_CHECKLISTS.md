# Sprint 0 review checklists

> Owner: Nitheesh. Use these when reviewing the Sprint 0 deliverables so every review checks the same things. Leave review comments on the PR; record the result at the bottom of each section.
> Hub tasks: "Review BRD for P1–P3 with Prakalya" and "Review ER diagram with Kamesh; review wireframes with Meyyarivu".

## 1. BRD for P1–P3 (Prakalya)

Files: `docs/business-requirements/brd/` (from `templates/BRD_TEMPLATE.md`). Scope: Platform, Masters, Purchase, Inventory, POS.

- [ ] Every section of the template is filled; nothing says "TBD" without an owner and date
- [ ] **Business context** uses the Sprint 0 pharmacy visits and `docs/product/research/PRODUCT_STUDY.md` (confirmed pain points only)
- [ ] **Objectives** are measurable (e.g. "a 20-line bill in under 60 s", "purchase bill entry 3× faster with import")
- [ ] **Scope** lists feature IDs from `FEATURES.md` for P1–P3; out-of-scope is explicit
- [ ] **As-is / to-be** flows are Mermaid diagrams and match `docs/workflows/`
- [ ] **Business rules** table: every rule has a source; ⚠ rules link to `COMPLIANCE.md` / `CALCULATIONS.md` and are not marked confirmed until a pharmacist/CA has confirmed them (AGENTS.md: never invent rules)
- [ ] No hard-coded values in rules: rates, limits, days and lists say "from configuration" (ADR-0014)
- [ ] Roles match `ROLES_AND_DASHBOARDS.md` and are described by permissions, not role names
- [ ] Reports and printed documents listed (invoice, H1 register, purchase register)
- [ ] No real patient, customer or prescription data anywhere
- [ ] P1 user stories exist for signup, users, roles, login with Given/When/Then acceptance criteria

Result: ☐ Approved ☐ Changes requested · Date: ______ · Notes: ______

## 2. ER diagram v1 (Kamesh)

File: `docs/database/DATA_MODEL.md` (§2 Core ER, §3 Key tables). Scope: catalog, party, purchase, inventory, sales.

- [ ] Every tenant table has `tenant_id uuid not null`; branch-owned tables also `branch_id` (MULTI_TENANCY.md)
- [ ] Every table has `id` UUIDv7 (ADR-0010), `created_at/created_by/updated_at/updated_by`, `version`
- [ ] Indexes on tenant tables start with `tenant_id`; RLS policy noted for each table
- [ ] Stock is a ledger: `inventory_movement` is insert-only; `stock_balance` is a derived cache (ADR-0007). No column that would invite `UPDATE qty`
- [ ] Posted documents are immutable: status (`DRAFT → POSTED → REVERSED`), reversal links, snapshots of party/item/tax on lines
- [ ] Money and tax columns are `numeric(18,4)`; quantities have an explicit scale; no float types
- [ ] Batch carries expiry, MRP, PTR, PTS, cost; MRP check (never sell above MRP) has a place to live
- [ ] Human document numbers are separate from ids, unique per branch + financial year
- [ ] Every invariant that can be a constraint is one: NOT NULL, CHECK (qty > 0, expiry > mfg), UNIQUE, FK
- [ ] Idempotency: client document UUID / `Idempotency-Key` storage modelled for purchase and sale
- [ ] Configuration tables (tax rates, settings) are effective-dated (ADR-0014)
- [ ] Mermaid ER renders on GitHub; modules own their tables (no table shared by two modules)

Result: ☐ Approved ☐ Changes requested · Date: ______ · Notes: ______

## 3. Wireframes (Meyyarivu)

Scope: app shell + sidebar, POS, purchase entry grid, item form, list/form/report patterns.

- [ ] Follows `DESIGN_LANGUAGE.md`: paper-and-ink, hairlines, tokens only, Light and Dark versions
- [ ] Sidebar matches `NAVIGATION.md` (groups, order, edition- and permission-aware items)
- [ ] **POS is keyboard-only**: F-key map from `POS_KEYBOARD.md` shown; barcode-first focus; batch picker with FEFO default; prescription capture step for Schedule H/H1/X
- [ ] **Purchase grid**: batch, expiry, MRP, PTR, qty, free qty, discounts, GST per line; live totals; import button; keyboard row navigation
- [ ] Item form: units + conversion, HSN/GST, schedule, barcodes; field errors shown inline
- [ ] Every screen at 1280 px (counter PC) and 375 px
- [ ] Empty, loading, error and offline states drawn (desktop: sync status bar)
- [ ] Each screen maps to a route in `PAGES.md`
- [ ] List / Form / Report page patterns defined so Nitheesh and Ashok can reuse them

Result: ☐ Approved ☐ Changes requested · Date: ______ · Notes: ______
