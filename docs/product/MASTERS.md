# Masters

> Master data is the reference data every transaction uses. This page lists **every master in MENO**, where it lives in the menu, and who builds it. Menu: [NAVIGATION.md](../design/NAVIGATION.md) (group **Masters**). Pages and phases: [PAGES.md](PAGES.md). Owners: [OWNERSHIP_MATRIX.md](../team/OWNERSHIP_MATRIX.md).

Rules for every master:
- Tenant-owned, audited (who/when/before/after), soft-deactivate instead of delete once used on a document.
- Validated in four layers (VALIDATION_AND_BUSINESS_RULES.md); option lists come from the API, never hard-coded.
- Bulk import/export through the Import and Export centres (PLT-16, PLT-17).
- Keyboard: list keys and form keys from [KEYBOARD_SHORTCUTS.md](../design/KEYBOARD_SHORTCUTS.md); `G M`, `G C`, `G V`, `G D`, `G A`, `G L` jump to the main masters; `N M`, `N C`, `N V`, `N L` create.

## 1. Inventory masters (product)

Backend: Kamesh (`catalog`) · Frontend: Ashok · QA: Prakalya

| Master | Route | Features | Phase |
|---|---|---|---|
| Medicine / product (also non-pharma: FMCG, surgical, cosmetics) | `/masters/items` | CAT-01 … CAT-05, CAT-09, CAT-14, CAT-20 | P2 |
| Generic / salt | `/masters/salts` | CAT-15 | P2 |
| Brand | `/masters/brands` | CAT-16 | P2 |
| Manufacturer / marketer | `/masters/manufacturers` | CAT-16 | P2 |
| Category / therapeutic class | `/masters/categories` | CAT-06 | P2 |
| Drug schedule (H, H1, X, G, OTC, NDPS) | `/masters/schedules` | CAT-03 | P2 |
| Unit and unit conversion (box → strip → tablet) | `/masters/units` | CAT-17, CAT-05 | P2 / P4 |
| Barcode | `/masters/barcodes` | CAT-04, INV-15 | P5 |
| HSN → GST rate | `/gst/settings` | CAT-02, GST-09 | P2 |

## 2. Party masters (customer, vendor)

Backend: Kamesh (`party`) · Frontend: Ashok (Meyyarivu for salesmen) · QA: Prakalya

| Master | Route | Features | Phase |
|---|---|---|---|
| Supplier / vendor (GSTIN, drug licence, bank, credit terms) | `/masters/suppliers` | PTY-01 | P2 |
| Customer (retail and wholesale / retailer) | `/masters/customers` | PTY-02, PTY-03 | P2 |
| Customer group (retailers, hospitals, individuals) | `/masters/customer-groups` | PTY-12 | P5 |
| Doctor (registration number) | `/masters/doctors` | PTY-05 | P4 |
| Salesman (commission) | `/masters/salesmen` | DOC-04, WHS-09 | P6 |
| Supplier price list | `/masters/suppliers/[id]/prices` | PTY-11 | P3 |

Every supplier and customer automatically gets a **ledger** (ACX-16): suppliers under Sundry Creditors, customers under Sundry Debtors.

## 3. Accounts masters (asset, liability, equity, income, expense)

Backend + frontend: Nitheesh (`accounting`) · QA: Ashok. Defaults and rules: [CHART_OF_ACCOUNTS.md](../architecture/CHART_OF_ACCOUNTS.md) (⚠ confirm with a CA).

| Master | Route | Features | Phase |
|---|---|---|---|
| Ledger groups (tree: Asset / Liability / Equity / Income / Expense → sub-groups) | `/finance/account-groups` | ACX-14 | P5 |
| Ledgers (chart of accounts, opening balances; 43 default system ledgers) | `/finance/accounts` | ACC-03, ACX-03, ACX-15, ACX-16 | P5 |
| Posting rules (which ledgers each document posts to) | `/finance/posting-rules` | ACX-17 | P5 |
| TDS / TCS sections and rates | `/finance/tds-sections` | ACX-06 | P6 |
| Fixed assets (depreciation) | `/finance/assets` | ACX-04 | P6 |
| Loans (EMI schedule) | `/finance/loans` | ACX-05 | P6 |
| Bank accounts, financial year (books set-up) | `/onboarding/books` | ACX-11, ACX-15 | P5 |

**Default ledgers are created automatically** when a company is set up: cash, bank, card/UPI clearing, sales, purchase, returns, input/output CGST/SGST/IGST/cess, round-off, discounts, scheme income, expiry loss, stock adjustment, common expenses and fixed-asset ledgers. They can be renamed, never deleted.

## 4. Configuration masters (settings, effective-dated)

Backend: Nitheesh (platform) / Kamesh (`taxation`) · Frontend: Nitheesh / Meyyarivu. Data model: DATA_MODEL.md § configuration.

| Master | Route | Features | Phase |
|---|---|---|---|
| Company, branches, warehouses | `/admin/company`, `/admin/branches`, `/admin/warehouses` | PLT-01 … PLT-03, MKT-06 | P2 (warehouses P5) |
| Number series (per branch + financial year) | `/admin/number-series` | PLT-05 | P2 |
| Tax rates, HSN, states, GST registrations | `/gst/settings` | GST-09 | P2 |
| Payment modes | `/admin/payment-modes` | ADM-02 | P4 |
| Approval rules (discount, returns, purchase limits) | `/admin/approvals` | PLT-19 | P5 |
| Price lists and schemes | `/wholesale/price-lists`, `/wholesale/schemes` | PRC-02 … PRC-05 | P3 / P5 |
| Users, roles, permissions | `/admin/users`, `/admin/roles` | PLT-06, PLT-07 | P1 |
| Printer profiles and templates | `/admin/printing` | ADM-03, DSK-03 | P4 |
| Keyboard shortcuts (per user) | `/me/shortcuts` | MKT-08, NAV-04 | P5 |
