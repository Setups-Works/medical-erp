# Page catalogue

> Every screen MENO will have, grouped A–P. **Generated** by `scripts/docs/build_pages.py` from the page list in that script, `FEATURES.md` (phases) and `docs/team/OWNERSHIP_MATRIX.md` (owners): edit those, then re-run the script. MENO Hub shows this catalogue on its Product map with live status.

**255 pages** in 16 sections.

- **Phase**: the phase in which the page is complete (latest phase among its features). Pages can appear earlier with partial functionality.
- **Backend / Frontend**: owners of the page's first feature prefix. QA for every page: Ashok.
- **Roles**: SA Super Admin · OW Business Owner · BM Branch Manager · PH Pharmacist · BO Billing Operator · IM Inventory Manager · AC Accountant · WM Wholesale Manager · SR Sales Representative · AU Auditor · All = every signed-in user. Access is enforced by permissions, not by role names (ROLES_AND_DASHBOARDS.md).
- **Validation**: every page follows `docs/architecture/VALIDATION_AND_BUSINESS_RULES.md`.

## A. Authentication & onboarding

Public and first-run pages.

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Login | `/login` | Email or username, password, MFA for admins | AUT-01, PLT-08, PLT-09 | P5 | Nitheesh | Meyyarivu | All |
| Forgot password | `/forgot-password` | Request a reset link | AUT-01 | P1 | Nitheesh | Meyyarivu | All |
| Reset password | `/reset-password` | Single-use token, strong password rules | AUT-01 | P1 | Nitheesh | Meyyarivu | All |
| Accept invitation | `/invite/[token]` | Join a company with an invited role | PLT-06 | P1 | Nitheesh | Nitheesh | All |
| Company registration | `/signup` | Business registration, owner account | PLT-01 | P1 | Nitheesh | Nitheesh | OW |
| Pharmacy setup | `/onboarding/pharmacy` | Drug licences, GSTIN, company details | PLT-01, PLT-02, GST-09 | P2 | Nitheesh | Nitheesh | OW |
| Branch setup | `/onboarding/branches` | Create branches and warehouses | PLT-03, MKT-06 | P5 | Nitheesh | Nitheesh | OW |
| Initial configuration | `/onboarding/configuration` | Tax, invoice series, currency, units, rounding | AUT-02, PLT-05, CAT-17 | P2 | Nitheesh | Meyyarivu | OW |
| Subscription selection | `/onboarding/plan` | Choose plan / trial | PLT-14 | P6 | Nitheesh | Nitheesh | OW |
| Onboarding checklist | `/onboarding` | Setup steps with progress until ready to bill | AUT-03 | P2 | Nitheesh | Meyyarivu | OW BM |

## B. Dashboards & overview

Each role lands on its own dashboard (ROLES_AND_DASHBOARDS.md). Widgets come from the DSH-08 library.

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Main dashboard | `/dashboard` | Sales, purchases, stock, profit overview | RPT-01, DSH-01, DSH-08 | P4 | Nitheesh | Ashok | OW BM |
| Retail dashboard | `/dashboard/retail` | Counter sales, daily bills, collections | DSH-02 | P4 | Nitheesh | Nitheesh | OW BM PH BO |
| Wholesale dashboard | `/dashboard/wholesale` | Distributor sales, orders, receivables | DSH-03 | P5 | Nitheesh | Nitheesh | OW WM |
| Inventory dashboard | `/dashboard/inventory` | Total stock, low stock, expiry | DSH-04 | P3 | Nitheesh | Nitheesh | OW BM IM |
| Financial dashboard | `/dashboard/finance` | Cash, bank, outstanding, expenses | DSH-05 | P5 | Nitheesh | Nitheesh | OW AC |
| Branch dashboard | `/dashboard/branches` | Branch-level comparison | DSH-06, RPT-10, MKT-10 | P6 | Nitheesh | Nitheesh | OW |
| Notifications | `/notifications` | Alerts and reminders | NTF-01, NTF-05 | P4 | Nitheesh | Meyyarivu | All |
| Activity timeline | `/activity` | Recent user activities | DSH-07 | P4 | Nitheesh | Nitheesh | OW BM AU |
| Platform dashboard | `/platform` | Tenants, plans, usage, health (super admin) | DSH-09, PLT-15 | P6 | Nitheesh | Nitheesh | SA |

Dashboard widgets (DSH-08): today's sales, today's purchases, gross margin, net sales, total invoices, cash collection, credit sales, outstanding receivables, supplier payables, low-stock medicines, near-expiry batches, expired stock, fast-moving medicines, slow-moving medicines, branch performance. Each widget checks permissions and reads its numbers from the reporting module; no widget computes money in the browser.

## C. Medicine master

Masters that every other module depends on.

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Medicine list | `/masters/items` | Search, filters, server pagination | CAT-01 | P2 | Kamesh | Meyyarivu | OW BM PH IM BO |
| Add medicine | `/masters/items/new` | Create medicine with all required fields | CAT-01, CAT-02, CAT-03, CAT-04 | P2 | Kamesh | Meyyarivu | OW BM IM |
| Edit medicine | `/masters/items/[id]/edit` | Update medicine details (audited) | CAT-01 | P2 | Kamesh | Meyyarivu | OW BM IM |
| Medicine details | `/masters/items/[id]` | Complete profile: stock by branch, batches, substitutes | CAT-20 | P2 | Kamesh | Meyyarivu | OW BM PH IM |
| Medicine categories | `/masters/categories` | Tablets, capsules, syrups, therapeutic class | CAT-06 | P2 | Kamesh | Meyyarivu | OW BM IM |
| Generic / salt master | `/masters/salts` | Composition and strength management | CAT-15 | P2 | Kamesh | Meyyarivu | OW BM IM PH |
| Brand master | `/masters/brands` | Brand information | CAT-16 | P2 | Kamesh | Meyyarivu | OW BM IM |
| Manufacturer master | `/masters/manufacturers` | Manufacturer / marketer details | CAT-16 | P2 | Kamesh | Meyyarivu | OW BM IM |
| Drug classification | `/masters/schedules` | Prescription and schedule categories (rules are data) | CAT-03 | P2 | Kamesh | Meyyarivu | OW PH |
| Unit master | `/masters/units` | Tablet, strip, box, bottle | CAT-17 | P2 | Kamesh | Meyyarivu | OW IM |
| Unit conversion | `/masters/units/conversions` | Box → strip → tablet | CAT-17, CAT-05 | P4 | Kamesh | Meyyarivu | OW IM |
| Barcode management | `/masters/barcodes` | Barcodes and QR, label printing | CAT-04, INV-15 | P5 | Kamesh | Meyyarivu | OW IM |
| Medicine import | `/admin/imports?type=items` | Excel/CSV import with row errors | PLT-16, ADM-06 | P3 | Nitheesh | Nitheesh | OW IM |
| Medicine export | `/masters/items/export` | Excel/CSV export | CAT-18 | P3 | Kamesh | Meyyarivu | OW IM |
| Substitute medicines | `/masters/items/[id]/substitutes` | Same salt, strength and dosage form lookup | CAT-09 | P4 | Kamesh | Meyyarivu | OW PH BO |
| Medicine history | `/masters/items/[id]/history` | Price and transaction history | CAT-19, PRC-09 | P3 | Kamesh | Meyyarivu | OW BM IM AU |

Medicine fields (required unless noted): product name, generic name, brand, manufacturer, composition, strength, dosage form, pack size, HSN code, GST % (from HSN master, not typed), drug schedule, prescription requirement, barcode (optional), rack location, minimum / maximum stock, reorder level, storage instructions, active status. Substitute suggestions match salt, strength, dosage form and release type and are labelled "same composition": never clinically interchangeable without the pharmacist's professional judgement.

## D. Supplier management

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Supplier list | `/masters/suppliers` | All suppliers | PTY-01 | P2 | Kamesh | Prakalya | OW BM IM AC |
| Add supplier | `/masters/suppliers/new` | Registration with GSTIN, DL, bank, credit terms | PTY-01 | P2 | Kamesh | Prakalya | OW BM IM |
| Supplier details | `/masters/suppliers/[id]` | Profile and business details | PTY-01 | P2 | Kamesh | Prakalya | OW BM IM AC |
| Supplier ledger | `/masters/suppliers/[id]/ledger` | Debit and credit history | PTY-06 | P5 | Kamesh | Prakalya | OW AC AU |
| Supplier outstanding | `/masters/suppliers/[id]/outstanding` | Payable balances and ageing | PTY-06, ACC-09 | P5 | Kamesh | Prakalya | OW AC |
| Supplier transactions | `/masters/suppliers/[id]/purchases` | Purchase history | RPT-03 | P3 | Nitheesh | Ashok | OW BM IM AC |
| Supplier payments | `/finance/payments?supplier=[id]` | Payment management | ACC-02 | P5 | Nitheesh | Nitheesh | OW AC |
| Supplier returns | `/purchase/returns?supplier=[id]` | Return history | RET-03 | P4 | Kamesh | Ashok | OW BM IM |
| Supplier claims | `/purchase/claims` | Expiry/damage claims until credit note | RET-04 | P4 | Kamesh | Ashok | OW BM IM AC |
| Supplier price list | `/masters/suppliers/[id]/prices` | Supplier-specific rates | PTY-11 | P3 | Kamesh | Prakalya | OW IM |
| Supplier import | `/admin/imports?type=suppliers` | Bulk data import | PLT-16, ADM-06 | P3 | Nitheesh | Nitheesh | OW |

## E. Customer management

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Customer list | `/masters/customers` | All customers and retailers | PTY-02, PTY-03 | P2 | Kamesh | Prakalya | OW BM PH BO AC WM |
| Add customer | `/masters/customers/new` | Registration (retail or wholesale) | PTY-02, PTY-03 | P2 | Kamesh | Prakalya | OW BM BO WM |
| Customer details | `/masters/customers/[id]` | Customer profile | PTY-02 | P2 | Kamesh | Prakalya | OW BM PH BO AC WM |
| Customer ledger | `/masters/customers/[id]/ledger` | Account history | PTY-06 | P5 | Kamesh | Prakalya | OW AC AU WM |
| Customer outstanding | `/masters/customers/[id]/outstanding` | Receivables and ageing | PTY-06, ACC-09 | P5 | Kamesh | Prakalya | OW AC WM |
| Customer purchase history | `/crm/customers/[id]` | Past purchases (customer 360) | CRM-01 | P5 | Nitheesh | Nitheesh | OW BM PH BO |
| Customer credit limit | `/wholesale/credit` | Credit limits and days, overrides | PTY-07 | P5 | Kamesh | Prakalya | OW AC WM |
| Customer groups | `/masters/customer-groups` | Retailers, hospitals, individuals | PTY-12 | P5 | Kamesh | Prakalya | OW WM |
| Customer statements | `/masters/customers/[id]/statement` | Account statements (PDF, share) | PTY-13 | P5 | Kamesh | Prakalya | OW AC WM |
| Customer import | `/admin/imports?type=customers` | Bulk import | PLT-16, ADM-06 | P3 | Nitheesh | Nitheesh | OW |
| Doctor master | `/masters/doctors` | Doctors and registration numbers for prescriptions | PTY-05 | P4 | Kamesh | Prakalya | OW BM PH |

## F. Purchase management

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Purchase dashboard | `/purchase` | Purchase overview | PUR-12 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Purchase orders | `/purchase/orders` | Create and manage POs | PUR-01 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Add purchase order | `/purchase/orders/new` | Supplier order creation (from short book / reorder) | PUR-01, MKT-01 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Purchase order details | `/purchase/orders/[id]` | Order tracking | PUR-13 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Purchase invoices | `/purchase/invoices` | All purchase invoices | PUR-02 | P3 | Kamesh | Meyyarivu | OW BM IM AC |
| Create purchase invoice | `/purchase/invoices/new` | Invoice entry grid | PUR-02, PUR-05, PUR-06, PRC-04, PRC-05 | P5 | Kamesh | Meyyarivu | OW BM IM |
| Purchase import | `/purchase/import` | Excel, CSV and supported invoice formats | PUR-04 | P3 | Kamesh | Meyyarivu | OW IM |
| Goods received note | `/purchase/grn` | Goods inward | PUR-03, DOC-02 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Purchase verification | `/purchase/verification` | Verify quantity and batch against PO/GRN | PUR-14 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Purchase return | `/purchase/returns` | Return to supplier | RET-03 | P4 | Kamesh | Ashok | OW BM IM |
| Purchase debit note | `/purchase/debit-notes` | Supplier adjustment | RET-03 | P4 | Kamesh | Ashok | OW AC |
| Purchase payment | `/finance/payments/new?type=supplier` | Supplier payment | ACC-02 | P5 | Nitheesh | Nitheesh | OW AC |
| Pending purchases | `/purchase/pending` | Unreceived / partially received orders | PUR-13 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Purchase history | `/reports/purchase` | Historical transactions | RPT-03 | P3 | Nitheesh | Ashok | OW BM IM AC AU |
| Purchase price analysis | `/purchase/price-analysis` | Compare supplier prices | PUR-09, PUR-15 | P5 | Kamesh | Meyyarivu | OW IM |
| Purchase approval | `/admin/approvals?type=purchase` | Approval workflow above thresholds | PLT-19 | P5 | Nitheesh | Nitheesh | OW BM |

Purchase entry must support: batch and expiry, MRP / PTR / purchase rate, free quantity, scheme quantity, trade discount, GST (from HSN master), freight and other charges, invoice matching, supplier bill number, PO matching, batch-wise stock creation, duplicate invoice detection.

## G. Inventory management

Default batch selection is FEFO; authorised users may override with a recorded reason (INV-18).

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Inventory dashboard | `/dashboard/inventory` | Inventory KPIs | DSH-04 | P3 | Nitheesh | Nitheesh | OW BM IM |
| Stock overview | `/inventory/stock` | All medicine stock | RPT-04, INV-10 | P3 | Nitheesh | Ashok | OW BM IM PH |
| Batch stock | `/inventory/batches` | Batch-wise quantity | INV-01 | P3 | Kamesh | Meyyarivu | OW BM IM PH |
| Batch details | `/inventory/batches/[id]` | Batch history and traceability | INV-01, INV-02, RPT-14 | P4 | Kamesh | Meyyarivu | OW BM IM AU |
| Expiry dashboard | `/inventory/expiry` | Near-expiry stock with actions | INV-05 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Expired stock | `/inventory/expired` | Expired inventory | INV-04, RPT-05 | P4 | Kamesh | Meyyarivu | OW BM IM |
| Stock adjustment | `/inventory/adjustments` | Manual adjustments with reason and approval | INV-07 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Stock transfer | `/inventory/transfers` | Branch transfers | INV-08 | P5 | Kamesh | Meyyarivu | OW BM IM |
| Warehouse management | `/inventory/warehouses` | Godown management | MKT-06 | P5 | Kamesh | Meyyarivu | OW BM IM |
| Rack management | `/inventory/racks` | Shelf / rack locations | CAT-07 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Stock audit | `/inventory/audit` | Physical verification | INV-09 | P5 | Kamesh | Meyyarivu | OW BM IM AU |
| Stock reconciliation | `/inventory/reconciliation` | Actual vs system stock, ledger drift | INV-12 | P3 | Kamesh | Meyyarivu | OW BM IM AU |
| Stock valuation | `/inventory/valuation` | Inventory value | INV-10 | P3 | Kamesh | Meyyarivu | OW AC AU |
| Low stock | `/inventory/low-stock` | Reorder candidates | INV-06 | P3 | Kamesh | Meyyarivu | OW BM IM |
| Non-moving stock | `/inventory/non-moving` | Dead stock | INV-13 | P5 | Kamesh | Meyyarivu | OW BM IM |
| Fast-moving stock | `/inventory/fast-moving` | High-demand medicines (ABC) | ANX-02 | P5 | Nitheesh | Ashok | OW BM IM |
| Stock aging | `/inventory/aging` | Inventory aging | INV-16 | P5 | Kamesh | Meyyarivu | OW BM IM AC |
| Stock movement | `/inventory/movements` | Inward / outward history | INV-02, RPT-04 | P3 | Kamesh | Meyyarivu | OW BM IM AU |
| Reorder management | `/inventory/reorder` | Automatic reorder suggestions | PUR-11, CAT-08, MKT-01 | P5 | Kamesh | Meyyarivu | OW BM IM |
| Stock reservation | `/inventory/reservations` | Reserved quantities | INV-17 | P5 | Kamesh | Meyyarivu | OW BM IM WM |
| Damage management | `/inventory/damaged` | Damaged stock bucket | MKT-04 | P4 | Kamesh | Meyyarivu | OW BM IM |
| Expiry claims | `/purchase/claims` | Supplier return claims | RET-04 | P4 | Kamesh | Ashok | OW BM IM AC |

## H. Retail sales & POS

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| POS billing | `/sales/pos` | Main fast billing interface | POS-01, POS-02, POS-03, POS-07, POS-22 | P4 | Kamesh | Meyyarivu | OW BM PH BO |
| New sales invoice | `/sales/invoices/new` | Create invoice (non-POS) | POS-10, WHS-03 | P5 | Kamesh | Meyyarivu | OW BM PH BO |
| Sales invoice list | `/sales/invoices` | Invoice history | POS-20 | P4 | Kamesh | Meyyarivu | OW BM PH BO AC AU |
| Invoice details | `/sales/invoices/[id]` | Complete invoice, reprint, share | POS-20, POS-11 | P4 | Kamesh | Meyyarivu | OW BM PH BO AC AU |
| Sales returns | `/sales/returns` | Return management | RET-01, POS-12 | P4 | Kamesh | Ashok | OW BM PH BO |
| Sales return details | `/sales/returns/[id]` | Return history | RET-01 | P4 | Kamesh | Ashok | OW BM PH BO AC |
| Credit notes | `/sales/credit-notes` | Customer adjustments | RET-02 | P4 | Kamesh | Ashok | OW BM AC |
| Quotations | `/sales/quotations` | Estimates | POS-19 | P5 | Kamesh | Meyyarivu | OW BM PH BO WM |
| Sales orders | `/sales/orders` | Customer orders | WHS-01 | P5 | Kamesh | Meyyarivu | OW BM WM |
| Delivery challans | `/sales/challans` | Dispatch documents | DOC-01 | P5 | Kamesh | Meyyarivu | OW BM WM |
| Pending orders | `/sales/orders?status=pending` | Pending fulfilment / backorders | WHS-02 | P5 | Kamesh | Meyyarivu | OW BM WM |
| Counter closing | `/sales/counter-closing` | Cash closing, denomination count | POS-14 | P5 | Kamesh | Meyyarivu | OW BM BO |
| Cash register | `/sales/cash-register` | Counter transactions | POS-14 | P5 | Kamesh | Meyyarivu | OW BM BO AC |
| Suspended bills | `/sales/pos/held` | Hold and resume bills | POS-09 | P4 | Kamesh | Meyyarivu | OW BM PH BO |
| Bill reprint | `/sales/invoices/[id]/print` | Reprint invoices | POS-20, POS-10 | P4 | Kamesh | Meyyarivu | OW BM PH BO |
| Discount approval | `/sales/approvals` | Controlled discount overrides | POS-21, PLT-19 | P5 | Kamesh | Meyyarivu | OW BM |

POS must support: barcode scanner, search by name / generic or salt / manufacturer, batch selection with expiry validation, MRP and selling price, quantity with unit conversion, discount within limits, GST calculation, cash / UPI / card / other and split payments, customer selection, prescription capture where the schedule rule requires it, invoice and thermal printing, credit billing only with permission, hold and resume, offline billing on desktop.

## I. Wholesale & distribution

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Wholesale dashboard | `/dashboard/wholesale` | Distributor overview | DSH-03 | P5 | Nitheesh | Nitheesh | OW WM |
| Distributor orders | `/wholesale/distributor-orders` | Orders placed to distributors on MENO (ERP-to-ERP) | MKT-03 | P6 | Kamesh | Meyyarivu | OW BM IM |
| Retailer orders | `/wholesale/retailer-orders` | Incoming retailer orders | WHS-01, MKT-03 | P6 | Kamesh | Meyyarivu | OW WM SR |
| Sales order processing | `/wholesale/orders/processing` | Process orders, pick lists | WHS-02 | P5 | Kamesh | Meyyarivu | OW WM |
| Bulk billing | `/wholesale/billing` | Bulk invoice generation | WHS-03 | P5 | Kamesh | Meyyarivu | OW WM |
| Wholesale invoice | `/wholesale/invoices/[id]` | B2B billing, e-invoice details | WHS-03, WHS-06 | P5 | Kamesh | Meyyarivu | OW WM AC |
| Distributor pricing | `/wholesale/pricing` | Customer-specific rates | PRC-02, PRC-03 | P5 | Kamesh | Meyyarivu | OW WM |
| Price list management | `/wholesale/price-lists` | Multiple price lists | PRC-02 | P5 | Kamesh | Meyyarivu | OW WM |
| Trade schemes | `/wholesale/schemes` | Quantity and value schemes | PRC-05, PRC-10, WHS-08 | P5 | Kamesh | Meyyarivu | OW WM |
| Free quantity management | `/wholesale/free-quantity` | Bonus quantity | PRC-04 | P3 | Kamesh | Meyyarivu | OW WM |
| Credit limit management | `/wholesale/credit` | Customer limits and days | PTY-07, WHS-04 | P5 | Kamesh | Prakalya | OW WM AC |
| Outstanding collection | `/finance/receipts?type=collection` | Payment collection | ACC-01, ACC-09 | P5 | Nitheesh | Nitheesh | OW WM AC SR |
| Salesman orders | `/wholesale/salesman-orders` | Sales representative orders | MOB-02 | P7 | Nitheesh | Meyyarivu | OW WM SR |
| Salesman management | `/masters/salesmen` | Representative profiles, commission | DOC-04, WHS-09, DOC-03 | P6 | Kamesh | Meyyarivu | OW WM |
| Route management | `/wholesale/routes` | Delivery and visit routes | WHS-11 | P6 | Kamesh | Meyyarivu | OW WM |
| Delivery planning | `/wholesale/delivery-planning` | Delivery schedules | WHS-12 | P6 | Kamesh | Meyyarivu | OW WM |
| Dispatch management | `/wholesale/dispatch` | Order dispatch | WHS-05 | P5 | Kamesh | Meyyarivu | OW WM |
| Delivery tracking | `/wholesale/delivery` | Shipment status | WHS-05, MOB-04 | P7 | Kamesh | Meyyarivu | OW WM |
| E-way bill workflow | `/gst/eway-bills` | Prepare documentation for eligible shipments | WHS-07 | P5 | Kamesh | Meyyarivu | OW WM AC |
| Customer claims | `/wholesale/claims` | Claims and adjustments | WHS-13 | P5 | Kamesh | Meyyarivu | OW WM AC |
| Scheme claims | `/wholesale/scheme-claims` | Scheme reconciliation with manufacturers | WHS-14 | P6 | Kamesh | Meyyarivu | OW WM AC |
| Sales performance | `/reports/sales-performance` | Customer and salesman analytics | ANX-03, WHS-09 | P6 | Nitheesh | Ashok | OW WM |

Wholesale must support: PTR / PTS / MRP pricing, customer-specific price, company-wise discount (PRC-11), product-wise and free-quantity schemes, credit days and limits, bill-wise outstanding, partial payments, delivery challans, multiple warehouses, stock allocation (INV-17), batch traceability, expiry and damage claims, replacement management (RET-07).

## J. Returns management

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Sales return list | `/sales/returns` | Retail and wholesale returns | RET-01 | P4 | Kamesh | Ashok | OW BM PH BO WM |
| Create sales return | `/sales/returns/new` | Return entry against invoice | RET-01, POS-12 | P4 | Kamesh | Ashok | OW BM PH BO WM |
| Purchase return list | `/purchase/returns` | Supplier returns | RET-03 | P4 | Kamesh | Ashok | OW BM IM |
| Create purchase return | `/purchase/returns/new` | Purchase return entry | RET-03 | P4 | Kamesh | Ashok | OW BM IM |
| Expiry return | `/purchase/returns/new?type=expiry` | Expired batch return | RET-04 | P4 | Kamesh | Ashok | OW BM IM |
| Damage return | `/purchase/returns/new?type=damage` | Damaged products | RET-04, MKT-04 | P4 | Kamesh | Ashok | OW BM IM |
| Replacement management | `/returns/replacements` | Replacement processing | RET-07 | P5 | Kamesh | Ashok | OW BM WM |
| Return inspection | `/returns/inspection` | Condition verification per line | RET-08 | P4 | Kamesh | Ashok | OW BM IM PH |
| Return approval | `/admin/approvals?type=return` | Authorisation above limits | RET-06, PLT-19 | P5 | Kamesh | Ashok | OW BM |
| Credit note management | `/sales/credit-notes` | Customer adjustments | RET-02 | P4 | Kamesh | Ashok | OW AC |
| Debit note management | `/purchase/debit-notes` | Supplier adjustments | RET-03 | P4 | Kamesh | Ashok | OW AC |
| Return claims tracking | `/purchase/claims` | Claim status until settled | RET-04, WHS-13 | P5 | Kamesh | Ashok | OW BM AC |

## K. Accounting & finance

Double-entry ledger: sales, purchases, payments, returns and taxes post controlled vouchers automatically (ACC-04); manual journals are permission-gated and audited.

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Finance dashboard | `/dashboard/finance` | Financial summary | DSH-05, ACX-13 | P5 | Nitheesh | Nitheesh | OW AC |
| Chart of accounts | `/finance/accounts` | Account hierarchy | ACC-03, ACX-03 | P5 | Nitheesh | Nitheesh | OW AC |
| General ledger | `/finance/ledger` | Ledger entries with drill-down | ACX-13, ACC-06 | P5 | Nitheesh | Nitheesh | OW AC AU |
| Customer ledger | `/finance/ledgers/customers` | Receivables | PTY-06 | P5 | Kamesh | Prakalya | OW AC AU |
| Supplier ledger | `/finance/ledgers/suppliers` | Payables | PTY-06 | P5 | Kamesh | Prakalya | OW AC AU |
| Cash book | `/finance/cash-book` | Cash transactions | ACC-06 | P5 | Nitheesh | Nitheesh | OW AC AU |
| Bank book | `/finance/bank-book` | Bank transactions | ACC-06, ACX-08 | P6 | Nitheesh | Nitheesh | OW AC AU |
| Receipts | `/finance/receipts` | Money received with allocation | ACC-01 | P5 | Nitheesh | Nitheesh | OW AC |
| Payments | `/finance/payments` | Money paid with allocation | ACC-02 | P5 | Nitheesh | Nitheesh | OW AC |
| Expenses | `/finance/expenses` | Expense records | ACC-05, ACX-02 | P5 | Nitheesh | Nitheesh | OW AC |
| Income | `/finance/income` | Other income | ACX-02 | P5 | Nitheesh | Nitheesh | OW AC |
| Journal entries | `/finance/journal` | Accounting journals | ACX-01 | P5 | Nitheesh | Nitheesh | OW AC |
| Contra entries | `/finance/contra` | Cash / bank transfers | ACX-01 | P5 | Nitheesh | Nitheesh | OW AC |
| Credit notes | `/sales/credit-notes` | Adjustments | RET-02 | P4 | Kamesh | Ashok | OW AC |
| Debit notes | `/purchase/debit-notes` | Adjustments | RET-03 | P4 | Kamesh | Ashok | OW AC |
| Bank reconciliation | `/finance/bank-reconciliation` | Bank statement matching | ACC-07 | P6 | Nitheesh | Nitheesh | OW AC |
| Financial statements | `/finance/statements` | Hub for trial balance, P&L, balance sheet, cash flow | ACX-07, ACC-08 | P6 | Nitheesh | Nitheesh | OW AC AU |
| Trial balance | `/finance/trial-balance` | Account summary | ACX-07, ACC-08 | P6 | Nitheesh | Nitheesh | OW AC AU |
| Profit & loss | `/finance/profit-and-loss` | Financial performance | ACX-07, ACC-08 | P6 | Nitheesh | Nitheesh | OW AC AU |
| Balance sheet | `/finance/balance-sheet` | Financial position | ACX-07, ACC-08 | P6 | Nitheesh | Nitheesh | OW AC AU |
| Cash flow | `/finance/cash-flow` | Cash-flow statement | ACX-12 | P6 | Nitheesh | Nitheesh | OW AC AU |
| Day book | `/finance/day-book` | Daily transactions | ACC-06 | P5 | Nitheesh | Nitheesh | OW AC AU |
| Outstanding reports | `/finance/outstanding` | Receivable / payable ageing | ACC-09, RPT-07 | P5 | Nitheesh | Nitheesh | OW AC WM |
| Financial year closing | `/finance/year-closing` | Period closing and carry-forward | PLT-04 | P5 | Nitheesh | Nitheesh | OW AC |

## L. GST & statutory workflows

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| GST configuration | `/gst/settings` | Registrations, rates, reverse charge, composition | GST-09 | P2 | Kamesh | Meyyarivu | OW AC |
| GST summary | `/gst` | Tax overview | ACX-09, RPT-08 | P6 | Nitheesh | Nitheesh | OW AC AU |
| GSTR-1 preparation | `/gst/gstr-1` | Outward supply data: prepare, validate, export | GST-03 | P6 | Kamesh | Meyyarivu | OW AC |
| GSTR-3B preparation | `/gst/gstr-3b` | Tax summary: prepare and export | GST-04 | P6 | Kamesh | Meyyarivu | OW AC |
| HSN summary | `/gst/hsn-summary` | HSN-wise reporting | GST-02 | P4 | Kamesh | Meyyarivu | OW AC |
| Input tax credit | `/gst/itc` | Purchase tax tracking | GST-10 | P6 | Kamesh | Meyyarivu | OW AC |
| GST reconciliation | `/gst/reconciliation` | Compare books with 2B | GST-05 | P6 | Kamesh | Meyyarivu | OW AC |
| E-invoice management | `/gst/e-invoices` | IRN workflow where applicable | WHS-06, GST-06 | P5 | Kamesh | Meyyarivu | OW AC WM |
| E-way bill | `/gst/eway-bills` | Eligible transport workflows | WHS-07, GST-06 | P5 | Kamesh | Meyyarivu | OW AC WM |
| Tax reports | `/reports/gst` | Tax reporting | RPT-08 | P6 | Nitheesh | Ashok | OW AC AU |
| Invoice validation | `/gst/validation` | GST field checks before posting | GST-11 | P3 | Kamesh | Meyyarivu | OW AC |
| Statutory registers | `/compliance/registers` | Applicable record-keeping | CMP-01, CMP-02 | P6 | Kamesh | Ashok | OW PH AU |

These pages **prepare, validate and export** records. Do not advertise or build direct filing or government API connectivity until the integration and authorisation exist (VALIDATION_AND_BUSINESS_RULES.md §6).

## M. Prescription & pharmacy compliance

Exact statutory workflows are built only after the rule is confirmed with a qualified pharmacy compliance professional (central and state); until then they sit behind a feature flag.

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Prescription list | `/compliance/prescriptions` | Prescription records | CMP-03 | P4 | Kamesh | Ashok | OW BM PH AU |
| Add prescription | `/compliance/prescriptions/new` | Capture prescription | CMP-03, POS-06 | P4 | Kamesh | Ashok | OW BM PH |
| Prescription details | `/compliance/prescriptions/[id]` | Patient and prescription information | CMP-03 | P4 | Kamesh | Ashok | OW BM PH AU |
| Prescription attachments | `/compliance/prescriptions/[id]/files` | Image / document uploads | CMP-03 | P4 | Kamesh | Ashok | OW PH |
| Prescription-linked billing | `/sales/pos?rx=[id]` | Link sale to prescription | POS-06 | P4 | Kamesh | Meyyarivu | PH BO |
| Patient history | `/compliance/patients/[id]` | Historical prescription records (consent-based) | CMP-08 | P5 | Kamesh | Ashok | OW PH |
| Restricted medicine alerts | `/compliance/alerts` | Applicable schedule warnings | CMP-09 | P4 | Kamesh | Ashok | OW PH BM |
| Schedule H/H1 register | `/compliance/registers/h1` | Applicable statutory register | CMP-01 | P4 | Kamesh | Ashok | OW PH AU |
| Schedule X records | `/compliance/registers/x` | Controlled-drug records | CMP-02 | P6 | Kamesh | Ashok | OW PH AU |
| Controlled stock register | `/compliance/controlled-stock` | Restricted inventory tracking | CMP-10 | P6 | Kamesh | Ashok | OW PH AU |
| Pharmacist details | `/compliance/pharmacists` | Authorised personnel | CMP-04 | P4 | Kamesh | Ashok | OW BM |
| Drug licence management | `/compliance/licences` | Licence records and expiry | CMP-05, PTY-04 | P5 | Kamesh | Ashok | OW BM AU |
| Regulatory audit | `/compliance/audit` | Compliance activity, inspection pack | CMP-11 | P6 | Kamesh | Ashok | OW AU |

## N. CRM & customer engagement

Reminders need recorded customer consent and an opt-out (CMP-07).

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| CRM dashboard | `/crm` | Customer engagement | CRM-03 | P6 | Nitheesh | Nitheesh | OW BM |
| Customer history | `/crm/customers` | Find a customer and open their full history | CRM-01 | P5 | Nitheesh | Nitheesh | OW BM PH BO |
| Customer groups | `/masters/customer-groups` | Segmentation | PTY-12 | P5 | Kamesh | Prakalya | OW BM WM |
| Loyalty programme | `/crm/loyalty` | Rewards rules | PTY-08 | P6 | Kamesh | Prakalya | OW BM |
| Loyalty transactions | `/crm/loyalty/transactions` | Points history | CRM-04 | P6 | Nitheesh | Nitheesh | OW BM BO |
| Offers & coupons | `/crm/offers` | Promotions | CRM-05 | P7 | Nitheesh | Nitheesh | OW BM |
| Prescription reminders | `/crm/reminders?type=refill` | Refill reminders (consent) | PTY-09 | P6 | Kamesh | Prakalya | OW BM PH |
| Follow-up reminders | `/crm/reminders?type=follow-up` | Customer follow-up tasks | CRM-06 | P6 | Nitheesh | Nitheesh | OW BM WM SR |
| WhatsApp integration | `/admin/integrations/whatsapp` | Invoices, reminders, campaigns | NTF-03, ENG-01, ADM-01 | P6 | Nitheesh | Meyyarivu | OW |
| SMS integration | `/admin/integrations/sms` | Notifications | NTF-04, ADM-01 | P5 | Nitheesh | Meyyarivu | OW |
| Email notifications | `/admin/notifications/email` | Email communication | NTF-02 | P4 | Nitheesh | Meyyarivu | OW |
| Complaints | `/crm/complaints` | Customer complaints | CRM-02 | P6 | Nitheesh | Nitheesh | OW BM PH BO WM |
| Support tickets | `/crm/tickets` | Issue management | CRM-07 | P7 | Nitheesh | Nitheesh | OW BM |

## O. Reports & analytics

Every report: date range, filters, server pagination, export (Excel / PDF / CSV) and permission control (RPT-16).

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Reports dashboard | `/reports` | Report catalogue, favourites, saved filters | RPT-13 | P4 | Nitheesh | Ashok | OW BM AC AU IM WM |
| Sales report | `/reports/sales` | Sales performance | RPT-02 | P4 | Nitheesh | Ashok | OW BM AC AU |
| Purchase report | `/reports/purchase` | Purchase analysis | RPT-03 | P3 | Nitheesh | Ashok | OW BM IM AC AU |
| Item-wise sales | `/reports/sales/items` | Medicine performance | RPT-02 | P4 | Nitheesh | Ashok | OW BM IM |
| Batch-wise sales | `/reports/sales/batches` | Batch movement and recall traceability | RPT-14 | P4 | Nitheesh | Ashok | OW BM IM AU |
| Customer-wise sales | `/reports/sales/customers` | Customer performance | RPT-02, ANX-03 | P6 | Nitheesh | Ashok | OW BM WM |
| Supplier-wise purchase | `/reports/purchase/suppliers` | Supplier analysis | RPT-03 | P3 | Nitheesh | Ashok | OW IM AC |
| Profit report | `/reports/profit` | Gross margin | RPT-06, ANX-01 | P5 | Nitheesh | Ashok | OW AC |
| Discount report | `/reports/discounts` | Discount analysis | RPT-15 | P4 | Nitheesh | Ashok | OW BM AU |
| Tax report | `/reports/gst` | GST details | RPT-08 | P6 | Nitheesh | Ashok | OW AC AU |
| Stock report | `/reports/stock` | Stock position | RPT-04 | P3 | Nitheesh | Ashok | OW BM IM AU |
| Expiry report | `/reports/expiry` | Expiry analysis | RPT-05 | P3 | Nitheesh | Ashok | OW BM IM |
| Stock aging report | `/reports/stock-aging` | Aging | INV-16 | P5 | Kamesh | Meyyarivu | OW IM AC |
| Dead stock report | `/reports/dead-stock` | Non-moving products | INV-13 | P5 | Kamesh | Meyyarivu | OW BM IM |
| Reorder report | `/reports/reorder` | Purchase requirements | PUR-11 | P5 | Kamesh | Meyyarivu | OW BM IM |
| Outstanding report | `/reports/outstanding` | Receivables / payables | RPT-07 | P5 | Nitheesh | Ashok | OW AC WM |
| Cash flow report | `/reports/cash-flow` | Cash movement | ACX-12 | P6 | Nitheesh | Nitheesh | OW AC |
| Financial reports | `/reports/financial` | Final accounts and outstanding reports | ACX-07, RPT-07 | P6 | Nitheesh | Nitheesh | OW AC AU |
| Branch comparison | `/reports/branches` | Location performance | RPT-10 | P6 | Nitheesh | Ashok | OW |
| Salesman report | `/reports/salesmen` | Representative performance | WHS-09 | P5 | Kamesh | Meyyarivu | OW WM |
| Audit report | `/reports/audit` | User activity | PLT-12 | P2 | Nitheesh | Nitheesh | OW AU |
| Export centre | `/admin/exports` | Excel / PDF / CSV exports as jobs | RPT-11, ADM-07 | P5 | Nitheesh | Ashok | OW AC AU |

## P. Administration & system settings

| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles |
|---|---|---|---|---|---|---|---|
| Company profile | `/admin/company` | Business details | PLT-01, PLT-02 | P2 | Nitheesh | Nitheesh | OW |
| Branch settings | `/admin/branches` | Branch configuration | PLT-03 | P2 | Nitheesh | Nitheesh | OW BM |
| Warehouse settings | `/admin/warehouses` | Warehouse configuration | MKT-06 | P5 | Kamesh | Meyyarivu | OW BM |
| User management | `/admin/users` | Staff accounts | PLT-06 | P1 | Nitheesh | Nitheesh | OW BM |
| Role management | `/admin/roles` | Roles | PLT-07 | P1 | Nitheesh | Nitheesh | OW |
| Permission management | `/admin/permissions` | Granular access | PLT-07 | P1 | Nitheesh | Nitheesh | OW |
| Approval workflows | `/admin/approvals` | Transaction approvals | PLT-19 | P5 | Nitheesh | Nitheesh | OW BM |
| Number series | `/admin/number-series` | Invoice numbering | PLT-05 | P2 | Nitheesh | Nitheesh | OW |
| Tax settings | `/gst/settings` | GST configuration | GST-09 | P2 | Kamesh | Meyyarivu | OW AC |
| Payment settings | `/admin/payment-modes` | Payment modes | ADM-02 | P4 | Nitheesh | Nitheesh | OW AC |
| Printer settings | `/admin/printing` | Invoice printing templates and printers | ADM-03, DSK-03, POS-10 | P4 | Nitheesh | Nitheesh | OW BM |
| Notification settings | `/admin/notifications` | Alerts per user, role, channel | ADM-04, NTF-05 | P4 | Nitheesh | Nitheesh | OW BM |
| Audit logs | `/admin/audit` | Activity records | PLT-12 | P2 | Nitheesh | Nitheesh | OW AU |
| Login history | `/admin/login-history` | Security history, active sessions | ADM-05 | P5 | Nitheesh | Nitheesh | OW AU |
| Device management | `/admin/devices` | Registered counter PCs | PLT-11, DSK-05 | P5 | Nitheesh | Nitheesh | OW BM |
| API keys | `/admin/api-keys` | Integration credentials | ADM-12, INT-05 | P7 | Nitheesh | Nitheesh | OW |
| Webhooks | `/admin/webhooks` | External events | ADM-12, INT-05 | P7 | Nitheesh | Nitheesh | OW |
| Import centre | `/admin/imports` | Bulk imports as jobs | ADM-06, PLT-16 | P3 | Nitheesh | Nitheesh | OW IM |
| Export centre | `/admin/exports` | Data export | ADM-07, PLT-17 | P6 | Nitheesh | Nitheesh | OW AU |
| Backup management | `/admin/backups` | Backup status, tenant data download | ADM-08 | P6 | Nitheesh | Nitheesh | OW |
| Data retention | `/admin/retention` | Retention policies | ADM-09 | P6 | Nitheesh | Nitheesh | OW |
| Subscription management | `/admin/subscription` | SaaS plans | PLT-14 | P6 | Nitheesh | Nitheesh | OW SA |
| Billing & invoices | `/admin/billing` | Platform billing | ADM-10 | P6 | Nitheesh | Nitheesh | OW SA |
| Settings home | `/admin` | Tiles for every administration page below | PLT-13 | P2 | Nitheesh | Nitheesh | OW BM |
| Help & support | `/help` | Help centre and support tickets | ADM-11 | P6 | Nitheesh | Nitheesh | All |
| Integrations | `/admin/integrations` | GSP, WhatsApp, SMS, Tally, payments | ADM-01, INT-01, INT-02, INT-03 | P6 | Nitheesh | Nitheesh | OW |
