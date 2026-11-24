# Chart of accounts (default for a pharmacy)

> Owner: Nitheesh (`accounting` module, backend + screens). QA: Ashok.
> Status: **⚠ VERIFY with a CA before P5 build.** This is the usual Indian double-entry structure (the one accountants know from desktop accounting software), adapted for pharmacy retail and wholesale. It is a starting template, not a statutory rule. Confirmation is tracked in `docs/compliance/COMPLIANCE.md`.
> Seed data: [`contracts/reference-data/chart-of-accounts.v1.json`](../../contracts/reference-data/chart-of-accounts.v1.json). Features: ACC-03, ACX-03, ACX-11, ACX-14 … ACX-17.

## Why we need it

Every posted document creates a double-entry voucher automatically (ACC-04). A sale needs a sales ledger, an output GST ledger, a cash/bank/customer ledger and a round-off ledger to exist **before** the first bill. So every company gets this chart when it is set up (ACX-11 books wizard), and the posting engine finds ledgers by **system code**, never by name (names are editable; rule 13: no hard-coding).

## Rules

1. **Two levels of master**: *ledger groups* (a tree) and *ledgers* (accounts that carry balances and vouchers). Only ledgers are posted to.
2. **Five natures**: `ASSET`, `LIABILITY`, `EQUITY`, `INCOME`, `EXPENSE`. A sub-group and its ledgers always have the nature of their primary group (DB CHECK + domain rule).
3. **System groups and ledgers** (`is_system = true`, with a `system_code`) are seeded per company. They can be **renamed** but not **deleted, moved to another nature or merged**. Users add their own sub-groups and ledgers under any group.
4. **Party ledgers** are created automatically: every supplier gets a ledger under Sundry Creditors, every customer under Sundry Debtors (ACX-16). The ledger is linked to the party; the party master stays the place to edit name, GSTIN and so on.
5. **GST ledgers** are split by tax head (CGST, SGST, IGST, cess). Whether sales and purchase ledgers are also split per GST rate is a tenant setting (`accounting.split_by_gst_rate`), default off. Rates themselves come from `tax_rate` (configuration), never from ledger names.
6. **Posting rules** map each document event to system codes (ACX-17), effective-dated, stored in `posting_rule`. Posting fails with Problem Details `ACCOUNTING_LEDGER_MISSING` (ADR-0009) if a required system ledger is missing, so no voucher is ever half-posted.
7. **Opening balances** are entered per ledger at the books start date; Σ debit = Σ credit is enforced before the books open (ACX-03).
8. Every change to groups and ledgers is audited (rule 10).

## Default groups

`affects_gross_profit` = true puts the group in the trading account (gross profit) rather than P&L below gross profit.

| System code | Group | Parent | Nature | Gross profit |
|---|---|---|---|---|
| `CAPITAL` | Capital Account | — | Equity | |
| `RESERVES` | Reserves & Surplus | Capital Account | Equity | |
| `LOANS` | Loans (Liability) | — | Liability | |
| `SECURED_LOANS` | Secured Loans | Loans (Liability) | Liability | |
| `UNSECURED_LOANS` | Unsecured Loans | Loans (Liability) | Liability | |
| `CURRENT_LIABILITIES` | Current Liabilities | — | Liability | |
| `DUTIES_TAXES` | Duties & Taxes | Current Liabilities | Liability | |
| `SUNDRY_CREDITORS` | Sundry Creditors | Current Liabilities | Liability | |
| `PROVISIONS` | Provisions | Current Liabilities | Liability | |
| `FIXED_ASSETS` | Fixed Assets | — | Asset | |
| `CURRENT_ASSETS` | Current Assets | — | Asset | |
| `CASH_IN_HAND` | Cash-in-hand | Current Assets | Asset | |
| `BANK_ACCOUNTS` | Bank Accounts | Current Assets | Asset | |
| `SUNDRY_DEBTORS` | Sundry Debtors | Current Assets | Asset | |
| `STOCK_IN_HAND` | Stock-in-hand | Current Assets | Asset | |
| `INPUT_TAX` | Input Tax Credit | Current Assets | Asset | |
| `DEPOSITS` | Deposits (Asset) | Current Assets | Asset | |
| `LOANS_ADVANCES` | Loans & Advances (Asset) | Current Assets | Asset | |
| `SALES_ACCOUNTS` | Sales Accounts | — | Income | ✓ |
| `DIRECT_INCOMES` | Direct Incomes | — | Income | ✓ |
| `INDIRECT_INCOMES` | Indirect Incomes | — | Income | |
| `PURCHASE_ACCOUNTS` | Purchase Accounts | — | Expense | ✓ |
| `DIRECT_EXPENSES` | Direct Expenses | — | Expense | ✓ |
| `INDIRECT_EXPENSES` | Indirect Expenses | — | Expense | |

## Default ledgers

| System code | Ledger | Group | Used by |
|---|---|---|---|
| `OWNER_CAPITAL` | Owner's Capital | Capital Account | Opening balances |
| `DRAWINGS` | Drawings | Capital Account | Owner withdrawals |
| `PROFIT_LOSS` | Profit & Loss A/c | Reserves & Surplus | Year closing (PLT-04) |
| `OUTPUT_CGST` | Output CGST | Duties & Taxes | Sales, sales returns |
| `OUTPUT_SGST` | Output SGST | Duties & Taxes | Sales, sales returns |
| `OUTPUT_IGST` | Output IGST | Duties & Taxes | Inter-state sales |
| `OUTPUT_CESS` | Output Cess | Duties & Taxes | Sales with cess |
| `TDS_PAYABLE` | TDS Payable | Duties & Taxes | ACX-06 ⚠ |
| `TCS_PAYABLE` | TCS Payable | Duties & Taxes | ACX-06 ⚠ |
| `SALARY_PAYABLE` | Salary Payable | Provisions | Expenses |
| `FURNITURE` | Furniture & Fixtures | Fixed Assets | ACX-04 |
| `COMPUTERS` | Computers & Printers | Fixed Assets | ACX-04 |
| `COLD_STORAGE` | Refrigerator / Cold Storage | Fixed Assets | ACX-04 |
| `CASH` | Cash | Cash-in-hand | Cash sales, receipts, payments (one more per branch/counter if the tenant wants) |
| `PETTY_CASH` | Petty Cash | Cash-in-hand | Small expenses |
| `BANK_DEFAULT` | Bank Account | Bank Accounts | Bank receipts/payments; the books wizard renames it and adds more |
| `CARD_UPI_CLEARING` | Card / UPI Clearing | Bank Accounts | Card and UPI sales until the settlement reaches the bank |
| `CHEQUES_IN_HAND` | Cheques in Hand (PDC) | Current Assets | ACC-02 post-dated cheques |
| `CLOSING_STOCK` | Closing Stock | Stock-in-hand | Balance sheet; value from the inventory ledger (INV-10), not typed |
| `INPUT_CGST` | Input CGST | Input Tax Credit | Purchases, purchase returns |
| `INPUT_SGST` | Input SGST | Input Tax Credit | Purchases, purchase returns |
| `INPUT_IGST` | Input IGST | Input Tax Credit | Inter-state purchases |
| `INPUT_CESS` | Input Cess | Input Tax Credit | Purchases with cess |
| `RENT_DEPOSIT` | Rent Deposit | Deposits (Asset) | Shop deposit |
| `SALES` | Sales | Sales Accounts | Retail and wholesale invoices |
| `SALES_RETURN` | Sales Return | Sales Accounts | Credit notes (RET-01/02), shown as a reduction of sales |
| `PURCHASE` | Purchase | Purchase Accounts | Purchase invoices (PUR-07) |
| `PURCHASE_RETURN` | Purchase Return | Purchase Accounts | Debit notes (RET-03/04) |
| `FREIGHT_INWARD` | Freight Inward | Direct Expenses | Landed cost (PUR-06) |
| `SCHEME_INCOME` | Scheme & Claim Income | Direct Incomes | Supplier scheme credits, expiry/breakage claims settled (RET-04, WHS-14) |
| `DISCOUNT_RECEIVED` | Discount Received | Indirect Incomes | Cash discount on supplier payments |
| `INTEREST_RECEIVED` | Interest Received | Indirect Incomes | Bank interest |
| `OTHER_INCOME` | Other Income | Indirect Incomes | Miscellaneous |
| `FREIGHT_RECOVERED` | Freight & Insurance Recovered | Indirect Incomes | Freight, insurance and packing charged on sales invoices (DOC-06) ⚠ CA |
| `DISCOUNT_ALLOWED` | Discount Allowed | Indirect Expenses | Bill discounts not inside the line price |
| `ROUND_OFF` | Round Off | Indirect Expenses | Invoice round-off (PRC-07; nature by sign) |
| `EXPIRY_LOSS` | Expiry & Breakage Loss | Indirect Expenses | Expired/damaged stock written off (INV-07, MKT-04) |
| `STOCK_ADJUSTMENT` | Stock Adjustment | Indirect Expenses | Count variance, theft, samples (INV-07, INV-09) |
| `RENT` | Rent | Indirect Expenses | ACC-05 |
| `SALARY` | Salary & Wages | Indirect Expenses | ACC-05 |
| `ELECTRICITY` | Electricity | Indirect Expenses | ACC-05 |
| `BANK_CHARGES` | Bank & Card Charges | Indirect Expenses | MDR on card/UPI settlements |
| `DEPRECIATION` | Depreciation | Indirect Expenses | ACX-04 |
| `OFFICE_EXPENSES` | Office & Shop Expenses | Indirect Expenses | ACC-05 |

Party ledgers (one per supplier / customer) are added under `SUNDRY_CREDITORS` / `SUNDRY_DEBTORS` automatically; a walk-in "Cash customer" sale posts straight to `CASH` / `CARD_UPI_CLEARING` with no party ledger.

## Default posting rules (ACX-17)

Amounts come from the posted document's snapshot. Dr = debit, Cr = credit.

| Event | Debit | Credit |
|---|---|---|
| Retail cash sale | `CASH` (or `CARD_UPI_CLEARING` per payment line) | `SALES` (taxable), `OUTPUT_CGST`/`SGST` or `IGST`, `OUTPUT_CESS`; `ROUND_OFF` by sign |
| Credit sale | Customer ledger | as above |
| Charges on a sales invoice (DOC-06) | (in the party debit above) | `FREIGHT_RECOVERED`; their GST to output GST ledgers ⚠ |
| Combined bill with returns (WHS-15) | Party (net), `SALES_RETURN` | `SALES`, output GST net, `FREIGHT_RECOVERED`; `ROUND_OFF` by sign (CALCULATIONS §22) |
| Sales return / credit note | `SALES_RETURN`, output GST ledgers | Customer ledger or `CASH` |
| Purchase invoice | `PURCHASE`, `INPUT_CGST`/`SGST` or `IGST`, `INPUT_CESS`, `FREIGHT_INWARD` | Supplier ledger; `ROUND_OFF` by sign |
| Purchase return / debit note | Supplier ledger | `PURCHASE_RETURN`, input GST ledgers |
| Customer receipt | `CASH` / bank / `CARD_UPI_CLEARING` / `CHEQUES_IN_HAND` | Customer ledger; `DISCOUNT_ALLOWED` if any |
| Supplier payment | Supplier ledger | `CASH` / bank; `DISCOUNT_RECEIVED` if any |
| Expiry claim settled by supplier | Supplier ledger | `SCHEME_INCOME` |
| Stock written off (expiry, damage) | `EXPIRY_LOSS` / `STOCK_ADJUSTMENT` | `PURCHASE` (cost of stock removed) ⚠ |
| Expense | Expense ledger | `CASH` / bank / `SALARY_PAYABLE` |

⚠ The stock write-off entry and whether free goods affect cost (INV-10) must be confirmed with the CA together with this chart.

## Screens

| Page | Route | Features |
|---|---|---|
| Ledger groups | `/finance/account-groups` | ACX-14 |
| Chart of accounts (ledgers) | `/finance/accounts` | ACC-03, ACX-03, ACX-15 |
| Posting rules | `/finance/posting-rules` | ACX-17 |
| Books set-up wizard | `/onboarding/books` | ACX-11, ACX-15 |
