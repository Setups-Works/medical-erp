# App navigation (sidebar)

The MENO web and desktop apps use **one sidebar**: Dashboard, then 10 groups (Sales, Purchase, Inventory, Masters, Wholesale, Finance, CRM & Engagement, Reports, GST & Compliance, Administration). Every route here must exist in [PAGES.md](../product/PAGES.md); `scripts/docs/build_pages.py` fails if not. Pages not in the sidebar (details, forms, settings sub-pages) are reached from their list or from Settings Home. This file is the source of truth for the menu. `apps/web/src/config/nav.ts` is generated from it in P1 (feature NAV-01), and MENO Hub shows it as the **Product map**.

Rules:
- Items are hidden when the company's edition doesn't include them (W = wholesale only) or the user lacks the permission.
- Routes live under `apps/web/src/app/(app)/`. The feature owner builds the screen (see `docs/team/members/README.md`).
- A menu item is **live** when all its Must feature IDs are Done.
- Adding or renaming a menu item = edit this table (Nitheesh approves) + FEATURES.md if it needs a new feature.

| Group | Menu item | Route | Edition | Feature IDs |
|---|---|---|---|---|
| Dashboard | Home dashboard | /dashboard | B | RPT-01, DSH-01, DSH-08 |
| Dashboard | Retail dashboard | /dashboard/retail | R | DSH-02 |
| Dashboard | Wholesale dashboard | /dashboard/wholesale | W | DSH-03 |
| Dashboard | Inventory dashboard | /dashboard/inventory | B | DSH-04 |
| Dashboard | Financial dashboard | /dashboard/finance | B | DSH-05, ACX-13 |
| Dashboard | Branch dashboard | /dashboard/branches | B | DSH-06, MKT-10 |
| Sales | POS Billing | /sales/pos | R | POS-01, POS-02, POS-03, POS-07, POS-09, POS-10, POS-15 |
| Sales | Sales Invoices | /sales/invoices | B | WHS-03, POS-10, GST-02 |
| Sales | Sales Orders | /sales/orders | W | WHS-01, WHS-02, DOC-01 |
| Sales | Quotations | /sales/quotations | B | POS-19, DOC-01 |
| Sales | Delivery Challans | /sales/challans | W | DOC-01, WHS-05 |
| Sales | Sales Returns | /sales/returns | B | RET-01, POS-12 |
| Sales | Credit Notes | /sales/credit-notes | B | RET-02 |
| Purchase | Purchase Orders | /purchase/orders | B | PUR-01, PUR-11, MKT-01 |
| Purchase | Purchase Invoices | /purchase/invoices | B | PUR-02, PUR-05, PUR-07, PUR-08 |
| Purchase | Goods Received | /purchase/grn | B | PUR-03, DOC-02 |
| Purchase | Purchase Returns | /purchase/returns | B | RET-03, RET-04 |
| Purchase | Debit Notes | /purchase/debit-notes | B | RET-03 |
| Purchase | Purchase Import | /purchase/import | B | PUR-04 |
| Inventory | Stock Overview | /inventory/stock | B | RPT-04, INV-10, ANX-02 |
| Inventory | Batch Management | /inventory/batches | B | INV-01, INV-03 |
| Inventory | Stock Transfers | /inventory/transfers | B | INV-08 |
| Inventory | Stock Adjustments | /inventory/adjustments | B | INV-07, MKT-04 |
| Inventory | Expiry Management | /inventory/expiry | B | INV-04, INV-05, RPT-05 |
| Inventory | Reorder Management | /inventory/reorder | B | CAT-08, PUR-11, MKT-01 |
| Inventory | Stock Audit | /inventory/audit | B | INV-09, INV-12 |
| Masters | Medicine Master | /masters/items | B | CAT-01, CAT-03, CAT-04, CAT-05, CAT-09 |
| Masters | Categories | /masters/categories | B | CAT-06 |
| Masters | Manufacturers | /masters/manufacturers | B | CAT-01 |
| Masters | Suppliers | /masters/suppliers | B | PTY-01 |
| Masters | Customers | /masters/customers | B | PTY-02, PTY-03 |
| Masters | Doctors | /masters/doctors | R | PTY-05 |
| Masters | Salesmen | /masters/salesmen | W | DOC-04, WHS-09 |
| Masters | Units & Taxes | /masters/units | B | CAT-17, CAT-02, GST-01 |
| Wholesale | Distributor Orders | /wholesale/distributor-orders | B | MKT-03 |
| Wholesale | Retailer Orders | /wholesale/retailer-orders | W | WHS-01, WHS-10 |
| Wholesale | Bulk Billing | /wholesale/billing | W | WHS-03, WHS-06, WHS-07 |
| Wholesale | Price Lists | /wholesale/price-lists | W | PRC-02, PRC-03 |
| Wholesale | Schemes & Offers | /wholesale/schemes | B | PRC-04, PRC-05, WHS-08 |
| Wholesale | Credit Limits | /wholesale/credit | W | PTY-07, WHS-04 |
| Wholesale | Delivery Management | /wholesale/delivery | W | WHS-05 |
| Finance | Cash & Bank | /finance/cash-book | B | ACC-06, ACX-08 |
| Finance | Receipts | /finance/receipts | B | ACC-01 |
| Finance | Payments | /finance/payments | B | ACC-02 |
| Finance | Expenses | /finance/expenses | B | ACC-05, ACX-02 |
| Finance | Ledgers | /finance/ledger | B | ACC-03, PTY-06, ACX-03, ACX-13 |
| Finance | Journal Entries | /finance/journal | B | ACX-01 |
| Finance | Bank Reconciliation | /finance/bank-reconciliation | B | ACC-07 |
| Finance | Financial Statements | /finance/statements | B | ACC-08, ACX-07 |
| CRM & Engagement | Prescription Records | /compliance/prescriptions | R | CMP-03, CMP-08 |
| CRM & Engagement | Customer History | /crm/customers | B | CRM-01 |
| CRM & Engagement | Reminders | /crm/reminders | B | PTY-09, ACC-09 |
| CRM & Engagement | Loyalty | /crm/loyalty | R | PTY-08 |
| CRM & Engagement | Complaints | /crm/complaints | B | CRM-02 |
| CRM & Engagement | Notifications | /notifications | B | NTF-01, NTF-05, ENG-01 |
| Reports | Reports Centre | /reports | B | RPT-13, RPT-16 |
| Reports | Sales Reports | /reports/sales | B | RPT-02, ANX-03, ANX-06 |
| Reports | Purchase Reports | /reports/purchase | B | RPT-03 |
| Reports | Stock Reports | /reports/stock | B | RPT-04, INV-13 |
| Reports | Expiry Reports | /reports/expiry | B | RPT-05 |
| Reports | Profit Reports | /reports/profit | B | RPT-06, ANX-01 |
| Reports | GST Reports | /reports/gst | B | GST-03, GST-04, GST-05, RPT-08 |
| Reports | Financial Reports | /reports/financial | B | ACX-07, RPT-07 |
| GST & Compliance | GST Summary | /gst | B | ACX-09, RPT-08 |
| GST & Compliance | GSTR Preparation | /gst/gstr-1 | B | GST-03, GST-04, GST-11 |
| GST & Compliance | E-invoice & E-way Bill | /gst/e-invoices | W | WHS-06, WHS-07, GST-06 |
| GST & Compliance | Input Tax Credit | /gst/itc | B | GST-10, GST-05 |
| GST & Compliance | Statutory Registers | /compliance/registers | R | CMP-01, CMP-02, CMP-10 |
| GST & Compliance | Drug Licences | /compliance/licences | B | CMP-05, PTY-04 |
| GST & Compliance | Regulatory Audit | /compliance/audit | B | CMP-11 |
| Administration | Settings Home | /admin | B | PLT-13 |
| Administration | Company Settings | /admin/company | B | PLT-01, PLT-02, PLT-13 |
| Administration | Branches & Warehouses | /admin/branches | B | PLT-03, MKT-06 |
| Administration | Users & Roles | /admin/users | B | PLT-06, PLT-07 |
| Administration | Approval Workflows | /admin/approvals | B | PLT-19 |
| Administration | Audit Logs | /admin/audit | B | PLT-12 |
| Administration | Integrations | /admin/integrations | B | ADM-01 |
| Administration | Subscriptions | /admin/subscription | B | PLT-14 |

Sidebar look: see DESIGN_LANGUAGE §5 (48 px icon rail expanding to a 264 px panel; group headings 11.5 px uppercase `text-ink-4`; items 13.5 px; active item `bg-hover` + 500 weight). One lucide icon per group: Dashboard `LayoutDashboard`, Sales `Receipt`, Purchase `ShoppingCart`, Inventory `Boxes`, Masters `Database`, Wholesale `Truck`, Finance `Landmark`, CRM & Engagement `HeartHandshake`, Reports `BarChart3`, GST & Compliance `ShieldCheck`, Administration `Settings2`. The Dashboard group shows only the dashboards the user's role may see (ROLES_AND_DASHBOARDS.md).
