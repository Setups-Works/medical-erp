# Roles and role-based experiences

MENO does **not** give everyone the same dashboard. Each role lands on its own home, sees only its menu items, and gets widgets for its job. Owner: Prakalya (definitions), Nitheesh (DSH features, permissions), Meyyarivu (sidebar).

## How it works (no hard-coding)

- A role is a **bundle of permissions** stored in the database (`role`, `permission`, `role_permission`). The roles below are **seeded defaults**; each tenant can edit them or create new ones.
- Code never checks a role name. Menu items, pages, widgets and actions check **permissions** (`sales.invoice.create`, `finance.reports.view`, …).
- The landing page and default widgets come from **role dashboard configuration** (`role_dashboard(role_id, landing_route, widgets[])`), seeded per role and editable by the Business Owner (DSH-01).
- A user can hold several roles; permissions are the union, and the landing page is the first role's.
- Branch scope: every role except Super Admin and Business Owner is limited to the branches assigned to the user.

## Default roles

| Code | Role | Lands on | Main screens | Default widgets (DSH-08) | Key permissions (examples) | Never sees |
|---|---|---|---|---|---|---|
| SA | Super Admin (MENO platform staff) | `/platform` | Tenant management, subscriptions, platform analytics, support (with tenant consent) | Tenants, active users, plans, revenue, system health | `platform.*` | Tenant business data without time-boxed consent (audited) |
| OW | Business Owner | `/dashboard` | Business dashboard, profit, branches, finance, approvals, settings | Today's sales, purchases, gross margin, net sales, cash collection, receivables, payables, low stock, near-expiry, branch performance | All tenant permissions | Platform admin |
| BM | Branch Manager | `/dashboard` (own branches) | Branch dashboard, stock, sales, approvals, staff | Today's sales, invoices, low stock, near-expiry, expired, discount approvals pending | `sales.*`, `inventory.*`, `approvals.approve` (within limits), `users.view` | Other branches, company finance settings |
| PH | Pharmacist | `/sales/pos` | Prescription workflows, medicine search, billing, registers | Bills today, prescriptions today, restricted-item alerts | `sales.invoice.create`, `compliance.prescription.*`, `catalog.view` | Finance, purchase costs/margins |
| BO | Billing Operator | `/sales/pos` | POS, invoices, customer search, returns (within limits) | Bills today, held bills, cash in drawer | `sales.invoice.create`, `sales.return.create` (limit), `parties.customer.create` | Margins, purchase rates, finance, settings |
| IM | Inventory Manager | `/dashboard/inventory` | Purchase, GRN, batches, expiry, stock audit, transfers, reorder | Low stock, near-expiry, expired, pending GRNs, stock value | `purchase.*`, `inventory.*`, `catalog.*` | Finance statements, user admin |
| AC | Accountant | `/dashboard/finance` | Ledgers, receipts, payments, expenses, GST, financial reports | Cash, bank, receivables, payables, GST liability | `finance.*`, `gst.*`, `reports.finance.view` | POS billing, stock adjustments |
| WM | Wholesale Manager | `/dashboard/wholesale` | Orders, distributors, price lists, schemes, credit, dispatch | Orders by status, dispatch today, receivables, credit breaches | `wholesale.*`, `sales.order.*`, `parties.credit.approve` (limit) | Retail POS settings, finance statements |
| SR | Sales Representative | `/wholesale/salesman-orders` (mobile in P7) | Customer visits, orders, collections | My orders, my collections, retailers due | `sales.order.create` (own), `finance.receipt.create` (own) | Other reps' data, pricing setup, finance |
| AU | Auditor (read-only) | `/reports` | Audit logs, financial and inventory reports, registers | Audit events today, stock drift, unbalanced items (should be 0) | `*.view`, `audit.view`, `reports.*.view` | Any create / edit / approve action |

Delivery staff (P7 mobile) and custom roles are added the same way.

## Rules

- Every page in [PAGES.md](PAGES.md) lists the roles that use it; the backend enforces the matching permissions on every endpoint, and the UI hides what the user can't do.
- Sensitive numbers (purchase rate, margin, profit) are permission-gated **in the API response**, not just hidden in the UI.
- Approvals (discount, credit, stock adjustment, return, purchase above threshold) use `approval_rule` thresholds, never numbers in code.
- Tests: for each role, Ashok keeps a permission matrix test (allowed and denied actions) that runs in CI.
