"""Generates docs/product/PAGES.md from the page list below + FEATURES.md (phases) + OWNERSHIP_MATRIX.md (owners).
Run: python3 scripts/docs/build_pages.py   (re-run after changing FEATURES.md or OWNERSHIP_MATRIX.md)"""
import re, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[2]
feat = {}
for line in (ROOT/"docs/product/FEATURES.md").read_text().splitlines():
    c = [x.strip() for x in line.split("|")]
    if len(c) > 4 and re.fullmatch(r"[A-Z]{3}-\d{2}", c[1]):
        rest = c[3:-1]
        ph = rest[1] if len(rest) >= 3 else rest[0]
        feat[c[1]] = ph
own = {}
for line in (ROOT/"docs/team/OWNERSHIP_MATRIX.md").read_text().splitlines():
    c = [x.strip() for x in line.split("|")]
    if len(c) > 7 and re.fullmatch(r"[A-Z]{3}", c[1]):
        own[c[1]] = (c[4].capitalize(), (c[5] or "—").capitalize(), ((c[8] if len(c) > 9 else "") or "Ashok").capitalize())

ALL = "All"
S = []  # (section, intro, pages); page = (name, route, what, ids, roles)
def sec(title, intro, pages, note=""): S.append((title, intro, pages, note))

sec("A. Authentication & onboarding", "Public and first-run pages.", [
 ("Login", "/login", "Email or username, password, MFA for admins", "AUT-01 PLT-08 PLT-09", ALL),
 ("Forgot password", "/forgot-password", "Request a reset link", "AUT-01", ALL),
 ("Reset password", "/reset-password", "Single-use token, strong password rules", "AUT-01", ALL),
 ("Accept invitation", "/invite/[token]", "Join a company with an invited role", "PLT-06", ALL),
 ("Company registration", "/signup", "Owner account, mobile and email, business name, state, trial / demo / license (see ONBOARDING.md)", "PLT-01 AUT-04", "OW"),
 ("Verify account", "/verify", "Mobile OTP and email verification", "AUT-04", "OW"),
 ("Business profile", "/onboarding/business", "Business type, branches, catalogue size, current software, language", "AUT-05", "OW"),
 ("Company & GST", "/onboarding/pharmacy", "GSTIN fetch, legal name, registration type, PAN, address (state locked to GSTIN), logo", "PLT-01 PLT-02 GST-09 AUT-06", "OW"),
 ("Licences & pharmacist", "/onboarding/licences", "Drug licences with expiry and scans, FSSAI, pharmacist in charge", "AUT-07", "OW"),
 ("Branch setup", "/onboarding/branches", "Create branches and warehouses", "PLT-03 MKT-06", "OW"),
 ("Billing preferences", "/onboarding/configuration", "Series, pricing, stock rules, invoice look with live preview", "AUT-02 AUT-08 PLT-05 CAT-17", "OW"),
 ("Team", "/onboarding/team", "Invite staff with roles and branches", "AUT-09", "OW"),
 ("Data import", "/onboarding/data", "Start fresh, Excel or migrate; dry run, review, approve", "AUT-10 PLT-16 PLT-26", "OW"),
 ("Devices & printers", "/onboarding/devices", "Desktop download, device registration, printer and scanner tests", "AUT-11 DSK-01 DSK-03", "OW BM"),
 ("Books setup", "/onboarding/books", "Chart of accounts, bank accounts, financial year, opening balances", "ACX-11 ACX-15", "OW AC"),
 ("Subscription selection", "/onboarding/plan", "Choose plan / trial", "PLT-14", "OW"),
 ("License activation", "/onboarding/license", "Enter a license key", "LIC-03", "OW"),
 ("Practice mode", "/onboarding/practice", "Practice company and guided first bill", "AUT-12", "OW BM PH BO"),
 ("Go-live", "/onboarding/go-live", "Readiness checks and go-live date", "AUT-13", "OW"),
 ("Set-up help", "/onboarding/help", "Book a call, chat, grant time-boxed support access", "AUT-14", "OW"),
 ("Onboarding checklist", "/onboarding", "Setup steps with progress until ready to bill; resume anywhere", "AUT-03 AUT-15", "OW BM"),
])
sec("B. Dashboards & overview", "Each role lands on its own dashboard (ROLES_AND_DASHBOARDS.md). Widgets come from the DSH-08 library.", [
 ("Main dashboard", "/dashboard", "Sales, purchases, stock, profit overview", "RPT-01 DSH-01 DSH-08", "OW BM"),
 ("Retail dashboard", "/dashboard/retail", "Counter sales, daily bills, collections", "DSH-02", "OW BM PH BO"),
 ("Wholesale dashboard", "/dashboard/wholesale", "Distributor sales, orders, receivables", "DSH-03", "OW WM"),
 ("Inventory dashboard", "/dashboard/inventory", "Total stock, low stock, expiry", "DSH-04", "OW BM IM"),
 ("Financial dashboard", "/dashboard/finance", "Cash, bank, outstanding, expenses", "DSH-05", "OW AC"),
 ("Branch dashboard", "/dashboard/branches", "Branch-level comparison", "DSH-06 RPT-10 MKT-10", "OW"),
 ("Notifications", "/notifications", "Alerts and reminders", "NTF-01 NTF-05", ALL),
 ("Activity timeline", "/activity", "Recent user activities", "DSH-07", "OW BM AU"),
 ("Platform dashboard", "/platform", "Tenants, plans, usage, health (super admin)", "DSH-09 PLT-15", "SA"),
 ("License console", "/platform/licenses", "Issue keys, extend, suspend, revoke, re-issue, transfer; sale invoices", "LIC-08 LIC-02 LIC-11", "SA"),
 ("Plan catalogue", "/platform/plans", "Plans, editions, limits and prices as data", "LIC-01", "SA"),
 ("Reference data", "/platform/reference-data", "PIN, IFSC, HSN, ceiling-price and banned-drug lists with refresh status", "PLT-22", "SA"),
 ("Feature flags & releases", "/platform/releases", "Per-tenant flags, channels, staged desktop rollout", "PLT-39", "SA"),
 ("Reliability", "/platform/reliability", "SLOs, error budgets, performance budgets, backups and restore drills", "PLT-41 PLT-43", "SA"),
 ("Security assurance", "/platform/security", "VAPT findings, scan results, incident register, certification status", "PLT-44", "SA"),
 ("Onboarding pipeline", "/platform/onboarding", "Tenants by set-up step, stuck owners, trial days left, funnel", "PLT-28", "SA"),
], "Dashboard widgets (DSH-08): today's sales, today's purchases, gross margin, net sales, total invoices, cash collection, credit sales, outstanding receivables, supplier payables, low-stock medicines, near-expiry batches, expired stock, fast-moving medicines, slow-moving medicines, branch performance. Each widget checks permissions and reads its numbers from the reporting module; no widget computes money in the browser.")
sec("C. Medicine master", "Masters that every other module depends on.", [
 ("Medicine list", "/masters/items", "Search, filters, server pagination", "CAT-01", "OW BM PH IM BO"),
 ("Add medicine", "/masters/items/new", "Tabs: Details, Pharmacy, Pricing & tax, Stock & warehouse (see MASTER_FIELDS.md)", "CAT-01 CAT-02 CAT-03 CAT-04 CAT-25 CAT-27 PRC-12 PRC-13", "OW BM IM"),
 ("Bundles / kits", "/masters/items/bundles", "Kits made of component items", "CAT-26", "OW IM"),
 ("Edit medicine", "/masters/items/[id]/edit", "Update medicine details (audited)", "CAT-01", "OW BM IM"),
 ("Medicine details", "/masters/items/[id]", "Complete profile: stock by branch, batches, substitutes", "CAT-20", "OW BM PH IM"),
 ("Medicine categories", "/masters/categories", "Tablets, capsules, syrups, therapeutic class", "CAT-06", "OW BM IM"),
 ("Generic / salt master", "/masters/salts", "Composition and strength management", "CAT-15", "OW BM IM PH"),
 ("Brand master", "/masters/brands", "Brand information", "CAT-16", "OW BM IM"),
 ("Manufacturer master", "/masters/manufacturers", "Manufacturer / marketer details", "CAT-16", "OW BM IM"),
 ("Drug classification", "/masters/schedules", "Prescription and schedule categories (rules are data)", "CAT-03", "OW PH"),
 ("Unit master", "/masters/units", "Tablet, strip, box, bottle", "CAT-17", "OW IM"),
 ("Unit conversion", "/masters/units/conversions", "Box → strip → tablet", "CAT-17 CAT-05", "OW IM"),
 ("Barcode management", "/masters/barcodes", "Barcodes and QR, label printing", "CAT-04 INV-15", "OW IM"),
 ("Medicine import", "/admin/imports?type=items", "Excel/CSV import with row errors", "PLT-16 ADM-06", "OW IM"),
 ("Medicine export", "/masters/items/export", "Excel/CSV export", "CAT-18", "OW IM"),
 ("Item merge", "/masters/items/merge", "Merge duplicate medicines, history kept", "CAT-11", "OW IM"),
 ("AI item onboarding", "/masters/items/ai-onboard", "Create items and a draft purchase from a bill photo or PDF; missing masters created on review", "MKT-09 CAT-29", "OW IM"),
 ("Batch categories", "/masters/batch-categories", "Cold chain, high value and other batch groups", "IJX-03", "OW IM"),
 ("Discontinued items", "/masters/items/discontinued", "Discontinued medicines, reasons, replacements", "CAT-28", "OW IM PH"),
 ("Master bulk update", "/masters/bulk-update", "Change fields on many items or parties with preview and approval", "PLT-25", "OW IM"),
 ("Substitute medicines", "/masters/items/[id]/substitutes", "Same salt, strength and dosage form lookup", "CAT-09", "OW PH BO"),
 ("Medicine history", "/masters/items/[id]/history", "Price and transaction history", "CAT-19 PRC-09", "OW BM IM AU"),
], "Medicine fields (required unless noted): product name, generic name, brand, manufacturer, composition, strength, dosage form, pack size, HSN code, GST % (from HSN master, not typed), drug schedule, prescription requirement, barcode (optional), rack location, minimum / maximum stock, reorder level, storage instructions, active status. Substitute suggestions match salt, strength, dosage form and release type and are labelled \"same composition\": never clinically interchangeable without the pharmacist's professional judgement.")
sec("D. Supplier management", "", [
 ("Supplier list", "/masters/suppliers", "All suppliers", "PTY-01", "OW BM IM AC"),
 ("Add supplier", "/masters/suppliers/new", "Tabs: Books (GSTIN fetch, contacts, addresses), Licences, Bank, Income tax (PAN, MSME, TDS), GST, Others (see MASTER_FIELDS.md)", "PTY-01 PTY-15 PTY-16 PTY-17 PTY-18 PTY-19 PTY-20 PTY-21 PTY-22 PTY-23 PTY-24", "OW BM IM"),
 ("Supplier details", "/masters/suppliers/[id]", "Profile and business details", "PTY-01", "OW BM IM AC"),
 ("Supplier ledger", "/masters/suppliers/[id]/ledger", "Debit and credit history", "PTY-06", "OW AC AU"),
 ("Supplier outstanding", "/masters/suppliers/[id]/outstanding", "Payable balances and ageing", "PTY-06 ACC-09", "OW AC"),
 ("Supplier transactions", "/masters/suppliers/[id]/purchases", "Purchase history", "RPT-03", "OW BM IM AC"),
 ("Supplier payments", "/finance/payments?supplier=[id]", "Payment management", "ACC-02", "OW AC"),
 ("Supplier returns", "/purchase/returns?supplier=[id]", "Return history", "RET-03", "OW BM IM"),
 ("Supplier claims", "/purchase/claims", "Expiry/damage claims until credit note", "RET-04", "OW BM IM AC"),
 ("Supplier price list", "/masters/suppliers/[id]/prices", "Supplier-specific rates", "PTY-11", "OW IM"),
 ("Supplier import", "/admin/imports?type=suppliers", "Bulk data import", "PLT-16 ADM-06", "OW"),
])
sec("E. Customer management", "", [
 ("Customer list", "/masters/customers", "All customers and retailers", "PTY-02 PTY-03", "OW BM PH BO AC WM"),
 ("Add customer", "/masters/customers/new", "Retail or wholesale; same tabs as supplier plus Patient for a person (see MASTER_FIELDS.md)", "PTY-02 PTY-03 PTY-15 PTY-16 PTY-17 PTY-18 PTY-19 PTY-24 PTY-30", "OW BM BO WM"),
 ("Party merge", "/masters/parties/merge", "Merge duplicate suppliers or customers, history kept", "PTY-31", "OW"),
 ("Transporters", "/masters/transporters", "Transporter master used by GRN, delivery and e-way bill", "PTY-26", "OW IM WM"),
 ("Agents", "/masters/agents", "Agents and commission", "PTY-28", "OW WM"),
 ("Customer details", "/masters/customers/[id]", "Customer profile", "PTY-02", "OW BM PH BO AC WM"),
 ("Customer ledger", "/masters/customers/[id]/ledger", "Account history", "PTY-06", "OW AC AU WM"),
 ("Customer outstanding", "/masters/customers/[id]/outstanding", "Receivables and ageing", "PTY-06 ACC-09", "OW AC WM"),
 ("Customer purchase history", "/crm/customers/[id]", "Past purchases (customer 360)", "CRM-01", "OW BM PH BO"),
 ("Customer credit limit", "/wholesale/credit", "Credit limits and days, overrides", "PTY-07", "OW AC WM"),
 ("Customer groups", "/masters/customer-groups", "Retailers, hospitals, individuals", "PTY-12", "OW WM"),
 ("Customer statements", "/masters/customers/[id]/statement", "Account statements (PDF, share)", "PTY-13", "OW AC WM"),
 ("Customer import", "/admin/imports?type=customers", "Bulk import", "PLT-16 ADM-06", "OW"),
 ("Doctor master", "/masters/doctors", "Doctors with registration no. + council, specialisation, clinic", "PTY-05 PTY-32", "OW BM PH"),
])
sec("F. Purchase management", "", [
 ("Purchase dashboard", "/purchase", "Purchase overview", "PUR-12", "OW BM IM"),
 ("Purchase orders", "/purchase/orders", "Create and manage POs", "PUR-01", "OW BM IM"),
 ("Add purchase order", "/purchase/orders/new", "Supplier order creation (from short book / reorder)", "PUR-01 MKT-01", "OW BM IM"),
 ("Purchase order details", "/purchase/orders/[id]", "Order tracking", "PUR-13", "OW BM IM"),
 ("Indents", "/purchase/indents", "Outlet indents, consolidation into POs or transfers", "PUR-20", "OW BM IM"),
 ("Distributor marketplace", "/purchase/marketplace", "Compare rates, schemes and stock across distributors", "PUR-18", "OW IM"),
 ("Purchase inbox", "/purchase/inbox", "Distributor bills received by email, drafts to review", "PUR-21", "OW IM"),
 ("Party registration links", "/masters/parties/invite", "Send a link; party fills details; staff approve", "PTY-33", "OW BM WM"),
 ("Merge purchase orders", "/purchase/orders/merge", "Receive several POs into one purchase; pending PO lines", "PUR-19", "OW IM"),
 ("Purchase invoices", "/purchase/invoices", "All purchase invoices", "PUR-02", "OW BM IM AC"),
 ("Create purchase invoice", "/purchase/invoices/new", "Invoice entry grid", "PUR-02 PUR-05 PUR-06 PRC-04 PRC-05", "OW BM IM"),
 ("Purchase import", "/purchase/import", "Excel, CSV and supported invoice formats", "PUR-04", "OW IM"),
 ("Goods received note", "/purchase/grn", "Goods inward", "PUR-03 DOC-02", "OW BM IM"),
 ("Purchase verification", "/purchase/verification", "Verify quantity and batch against PO/GRN", "PUR-14", "OW BM IM"),
 ("Purchase return", "/purchase/returns", "Return to supplier", "RET-03", "OW BM IM"),
 ("Purchase debit note", "/purchase/debit-notes", "Supplier adjustment", "RET-03", "OW AC"),
 ("Purchase payment", "/finance/payments/new?type=supplier", "Supplier payment", "ACC-02", "OW AC"),
 ("Pending purchases", "/purchase/pending", "Unreceived / partially received orders", "PUR-13", "OW BM IM"),
 ("Purchase history", "/reports/purchase", "Historical transactions", "RPT-03", "OW BM IM AC AU"),
 ("Purchase price analysis", "/purchase/price-analysis", "Compare supplier prices", "PUR-09 PUR-15", "OW IM"),
 ("Purchase approval", "/admin/approvals?type=purchase", "Approval workflow above thresholds", "PLT-19", "OW BM"),
], "Purchase entry must support: batch and expiry, MRP / PTR / purchase rate, free quantity, scheme quantity, trade discount, GST (from HSN master), freight and other charges, invoice matching, supplier bill number, PO matching, batch-wise stock creation, duplicate invoice detection.")
sec("G. Inventory management", "Default batch selection is FEFO; authorised users may override with a recorded reason (INV-18).", [
 ("Inventory dashboard", "/dashboard/inventory", "Inventory KPIs", "DSH-04", "OW BM IM"),
 ("Stock overview", "/inventory/stock", "All medicine stock", "RPT-04 INV-10", "OW BM IM PH"),
 ("Batch stock", "/inventory/batches", "Batch-wise quantity", "INV-01", "OW BM IM PH"),
 ("Batch details", "/inventory/batches/[id]", "Batch history and traceability; MRP revision; block / recall", "INV-01 INV-02 RPT-14 INV-19 INV-20", "OW BM IM AU"),
 ("Batch recalls", "/inventory/recalls", "Blocked and recalled batches across branches, who bought them", "INV-20 RPT-14", "OW BM IM PH"),
 ("Expiry dashboard", "/inventory/expiry", "Near-expiry stock with actions", "INV-05", "OW BM IM"),
 ("Expired stock", "/inventory/expired", "Expired inventory", "INV-04 RPT-05", "OW BM IM"),
 ("Stock adjustment", "/inventory/adjustments", "Manual adjustments with reason and approval", "INV-07", "OW BM IM"),
 ("Stock transfer", "/inventory/transfers", "Branch transfers", "INV-08", "OW BM IM"),
 ("Stock vouchers", "/inventory/stock-vouchers", "Stock inward / outward without purchase or sale (samples, issues)", "IJX-01", "OW BM IM"),
 ("Stock journal", "/inventory/stock-journal", "Convert or repack: bulk to loose packs", "IJX-02", "OW IM"),
 ("Stock reallocation", "/inventory/reallocation", "Move non-moving and short-expiry stock to where it sells", "INV-22", "OW BM IM"),
 ("Warehouse management", "/inventory/warehouses", "Godown management", "MKT-06", "OW BM IM"),
 ("Rack management", "/inventory/racks", "Shelf / rack locations", "CAT-07", "OW BM IM"),
 ("Stock audit", "/inventory/audit", "Physical verification", "INV-09", "OW BM IM AU"),
 ("Stock reconciliation", "/inventory/reconciliation", "Actual vs system stock, ledger drift", "INV-12", "OW BM IM AU"),
 ("Stock valuation", "/inventory/valuation", "Inventory value", "INV-10", "OW AC AU"),
 ("Low stock", "/inventory/low-stock", "Reorder candidates", "INV-06", "OW BM IM"),
 ("Non-moving stock", "/inventory/non-moving", "Dead stock", "INV-13", "OW BM IM"),
 ("Fast-moving stock", "/inventory/fast-moving", "High-demand medicines (ABC)", "ANX-02", "OW BM IM"),
 ("Stock aging", "/inventory/aging", "Inventory aging", "INV-16", "OW BM IM AC"),
 ("Stock movement", "/inventory/movements", "Inward / outward history", "INV-02 RPT-04", "OW BM IM AU"),
 ("Reorder management", "/inventory/reorder", "Automatic reorder suggestions", "PUR-11 CAT-08 MKT-01", "OW BM IM"),
 ("Stock reservation", "/inventory/reservations", "Reserved quantities", "INV-17", "OW BM IM WM"),
 ("Damage management", "/inventory/damaged", "Damaged stock bucket", "MKT-04", "OW BM IM"),
 ("Expiry claims", "/purchase/claims", "Supplier return claims", "RET-04", "OW BM IM AC"),
])
sec("H. Retail sales & POS", "", [
 ("POS billing", "/sales/pos", "Main fast billing interface; full line columns (pack, mfr, HSN, MRP, disc, taxable, GST)", "POS-01 POS-02 POS-03 POS-07 POS-22 POS-28 PRC-14", "OW BM PH BO"),
 ("New sales invoice", "/sales/invoices/new", "Create invoice (non-POS)", "POS-10 WHS-03", "OW BM PH BO"),
 ("Sales invoice list", "/sales/invoices", "Invoice history", "POS-20", "OW BM PH BO AC AU"),
 ("Invoice details", "/sales/invoices/[id]", "Complete invoice, reprint, share", "POS-20 POS-11", "OW BM PH BO AC AU"),
 ("Sales returns", "/sales/returns", "Return management", "RET-01 POS-12", "OW BM PH BO"),
 ("Sales return details", "/sales/returns/[id]", "Return history", "RET-01", "OW BM PH BO AC"),
 ("Credit notes", "/sales/credit-notes", "Customer adjustments", "RET-02", "OW BM AC"),
 ("Quotations", "/sales/quotations", "Estimates", "POS-19", "OW BM PH BO WM"),
 ("Sales orders", "/sales/orders", "Customer orders", "WHS-01", "OW BM WM"),
 ("Delivery challans", "/sales/challans", "Dispatch documents", "DOC-01", "OW BM WM"),
 ("Pending orders", "/sales/orders?status=pending", "Pending fulfilment / backorders", "WHS-02", "OW BM WM"),
 ("Counter closing", "/sales/counter-closing", "Cash closing, denomination count", "POS-14", "OW BM BO"),
 ("Cash register", "/sales/cash-register", "Counter transactions", "POS-14", "OW BM BO AC"),
 ("Suspended bills", "/sales/pos/held", "Hold and resume bills", "POS-09", "OW BM PH BO"),
 ("Bill reprint", "/sales/invoices/[id]/print", "Reprint invoices", "POS-20 POS-10", "OW BM PH BO"),
 ("Discount approval", "/sales/approvals", "Controlled discount overrides", "POS-21 PLT-19", "OW BM"),
], "POS must support: barcode scanner, search by name / generic or salt / manufacturer, batch selection with expiry validation, MRP and selling price, quantity with unit conversion, discount within limits, GST calculation, cash / UPI / card / other and split payments, customer selection, prescription capture where the schedule rule requires it, invoice and thermal printing, credit billing only with permission, hold and resume, offline billing on desktop.")
sec("I. Wholesale & distribution", "", [
 ("Wholesale dashboard", "/dashboard/wholesale", "Distributor overview", "DSH-03", "OW WM"),
 ("Distributor orders", "/wholesale/distributor-orders", "Orders placed to distributors on MENO (ERP-to-ERP)", "MKT-03", "OW BM IM"),
 ("Retailer orders", "/wholesale/retailer-orders", "Incoming retailer orders", "WHS-01 MKT-03", "OW WM SR"),
 ("Sales order processing", "/wholesale/orders/processing", "Process orders, pick lists", "WHS-02", "OW WM"),
 ("Bulk billing", "/wholesale/billing", "Bulk invoice generation", "WHS-03", "OW WM"),
 ("Wholesale invoice", "/wholesale/invoices/[id]", "B2B billing with dispatch details, return and replacement sections, charges, e-invoice", "WHS-03 WHS-06 WHS-15 WHS-16 DOC-06", "OW WM AC"),
 ("Distributor pricing", "/wholesale/pricing", "Customer-specific rates", "PRC-02 PRC-03", "OW WM"),
 ("Price list management", "/wholesale/price-lists", "Multiple price lists", "PRC-02", "OW WM"),
 ("Trade schemes", "/wholesale/schemes", "Quantity and value schemes", "PRC-05 PRC-10 WHS-08", "OW WM"),
 ("Free quantity management", "/wholesale/free-quantity", "Bonus quantity", "PRC-04", "OW WM"),
 ("Credit limit management", "/wholesale/credit", "Limits by value, open bills and bill age; overrides", "PTY-07 WHS-04 PTY-34", "OW WM AC"),
 ("Retailer portal", "/portal", "Retailers order online, see stock, schemes, outstanding", "WHS-10", "Retailer"),
 ("Sales targets", "/wholesale/targets", "Targets, achievement and incentives", "WHS-22", "OW WM"),
 ("Outstanding collection", "/finance/receipts?type=collection", "Payment collection", "ACC-01 ACC-09", "OW WM AC SR"),
 ("Salesman orders", "/wholesale/salesman-orders", "Sales representative orders", "MOB-02", "OW WM SR"),
 ("Salesman management", "/masters/salesmen", "Representative profiles, commission", "DOC-04 WHS-09 DOC-03", "OW WM"),
 ("Route management", "/wholesale/routes", "Delivery and visit routes", "WHS-11", "OW WM"),
 ("Delivery planning", "/wholesale/delivery-planning", "Delivery schedules", "WHS-12", "OW WM"),
 ("Dispatch management", "/wholesale/dispatch", "Order dispatch, packing slips, parcel register, L.R. update, acknowledgements", "WHS-05 WHS-20", "OW WM"),
 ("Dispatch checking", "/wholesale/dispatch/check", "Scan items against the invoice before dispatch", "WHS-19", "OW WM IM"),
 ("Collection tagging", "/wholesale/collections", "Assign bills to collectors, collection sheets", "WHS-21", "OW WM AC SR"),
 ("Stock & sales statement", "/wholesale/stock-sales-statement", "Secondary sales per manufacturer for the month", "WHS-17", "OW WM"),
 ("Sub-stockists", "/wholesale/sub-stockists", "Sub-stockist stock, sales and claims", "WHS-18", "OW WM AC"),
 ("Delivery tracking", "/wholesale/delivery", "Shipment status", "WHS-05 MOB-04", "OW WM"),
 ("E-way bill workflow", "/gst/eway-bills", "Prepare documentation for eligible shipments", "WHS-07", "OW WM AC"),
 ("Customer claims", "/wholesale/claims", "Claims and adjustments", "WHS-13", "OW WM AC"),
 ("Scheme claims", "/wholesale/scheme-claims", "Scheme reconciliation with manufacturers", "WHS-14", "OW WM AC"),
 ("Sales performance", "/reports/sales-performance", "Customer and salesman analytics", "ANX-03 WHS-09", "OW WM"),
], "Wholesale must support: PTR / PTS / MRP pricing, customer-specific price, company-wise discount (PRC-11), product-wise and free-quantity schemes, credit days and limits, bill-wise outstanding, partial payments, delivery challans, multiple warehouses, stock allocation (INV-17), batch traceability, expiry and damage claims, replacement management (RET-07).")
sec("J. Returns management", "", [
 ("Sales return list", "/sales/returns", "Retail and wholesale returns", "RET-01", "OW BM PH BO WM"),
 ("Create sales return", "/sales/returns/new", "Return entry against invoice", "RET-01 POS-12", "OW BM PH BO WM"),
 ("Purchase return list", "/purchase/returns", "Supplier returns", "RET-03", "OW BM IM"),
 ("Create purchase return", "/purchase/returns/new", "Purchase return entry", "RET-03", "OW BM IM"),
 ("Expiry return", "/purchase/returns/new?type=expiry", "Expired batch return", "RET-04", "OW BM IM"),
 ("Damage return", "/purchase/returns/new?type=damage", "Damaged products", "RET-04 MKT-04", "OW BM IM"),
 ("Replacement management", "/returns/replacements", "Replacement processing", "RET-07", "OW BM WM"),
 ("Return inspection", "/returns/inspection", "Condition verification per line", "RET-08", "OW BM IM PH"),
 ("Return approval", "/admin/approvals?type=return", "Authorisation above limits", "RET-06 PLT-19", "OW BM"),
 ("Credit note management", "/sales/credit-notes", "Customer adjustments", "RET-02", "OW AC"),
 ("Debit note management", "/purchase/debit-notes", "Supplier adjustments", "RET-03", "OW AC"),
 ("Return claims tracking", "/purchase/claims", "Claim status until settled", "RET-04 WHS-13", "OW BM AC"),
])
sec("K. Accounting & finance", "Double-entry ledger: sales, purchases, payments, returns and taxes post controlled vouchers automatically (ACC-04); manual journals are permission-gated and audited.", [
 ("Finance dashboard", "/dashboard/finance", "Financial summary", "DSH-05 ACX-13", "OW AC"),
 ("Ledger groups", "/finance/account-groups", "Chart-of-accounts tree: groups and sub-groups", "ACX-14", "OW AC"),
 ("Chart of accounts", "/finance/accounts", "Ledgers by group, opening balances, default system ledgers", "ACC-03 ACX-03 ACX-15 ACX-16", "OW AC"),
 ("Posting rules", "/finance/posting-rules", "Which ledgers each document posts to", "ACX-17", "OW AC"),
 ("TDS / TCS sections", "/finance/tds-sections", "Section and rate masters (data, never hard-coded)", "ACX-06", "OW AC"),
 ("Fixed assets", "/finance/assets", "Asset master, purchase, depreciation schedule", "ACX-04", "OW AC"),
 ("Loans", "/finance/loans", "Loan accounts, EMI schedule, interest", "ACX-05", "OW AC"),
 ("General ledger", "/finance/ledger", "Ledger entries with drill-down", "ACX-13 ACC-06", "OW AC AU"),
 ("Customer ledger", "/finance/ledgers/customers", "Receivables", "PTY-06", "OW AC AU"),
 ("Supplier ledger", "/finance/ledgers/suppliers", "Payables", "PTY-06", "OW AC AU"),
 ("Cash book", "/finance/cash-book", "Cash transactions", "ACC-06", "OW AC AU"),
 ("Bank book", "/finance/bank-book", "Bank transactions", "ACC-06 ACX-08", "OW AC AU"),
 ("Receipts", "/finance/receipts", "Money received with allocation", "ACC-01", "OW AC"),
 ("Income-tax overview", "/dashboard/income-tax", "Turnover, profit, advance-tax reminders for the owner", "ACX-10", "OW AC"),
 ("Cash-flow forecast", "/finance/cash-forecast", "Expected receipts and payments by week", "ACX-18", "OW AC"),
 ("Cheque management", "/finance/cheques", "Cheque books, leaf printing, issued-cheque register", "ACC-16", "OW AC"),
 ("Cheque bounce", "/finance/receipts/[id]/bounce", "Reverse a bounced cheque, re-open invoices, charges", "ACC-14", "OW AC"),
 ("Rate-difference notes", "/finance/notes", "Financial credit / debit notes without stock", "ACC-15", "OW AC"),
 ("Period lock", "/finance/period-lock", "Lock months against posting and back-dating", "PLT-23", "OW AC"),
 ("Payments", "/finance/payments", "Money paid with allocation", "ACC-02", "OW AC"),
 ("Expenses", "/finance/expenses", "Expense records", "ACC-05 ACX-02", "OW AC"),
 ("Income", "/finance/income", "Other income", "ACX-02", "OW AC"),
 ("Journal entries", "/finance/journal", "Accounting journals", "ACX-01", "OW AC"),
 ("Contra entries", "/finance/contra", "Cash / bank transfers", "ACX-01", "OW AC"),
 ("Credit notes", "/sales/credit-notes", "Adjustments", "RET-02", "OW AC"),
 ("Debit notes", "/purchase/debit-notes", "Adjustments", "RET-03", "OW AC"),
 ("Bank reconciliation", "/finance/bank-reconciliation", "Bank statement matching", "ACC-07", "OW AC"),
 ("Financial statements", "/finance/statements", "Hub for trial balance, P&L, balance sheet, cash flow", "ACX-07 ACC-08", "OW AC AU"),
 ("Trial balance", "/finance/trial-balance", "Account summary", "ACX-07 ACC-08", "OW AC AU"),
 ("Profit & loss", "/finance/profit-and-loss", "Financial performance", "ACX-07 ACC-08", "OW AC AU"),
 ("Balance sheet", "/finance/balance-sheet", "Financial position", "ACX-07 ACC-08", "OW AC AU"),
 ("Cash flow", "/finance/cash-flow", "Cash-flow statement", "ACX-12", "OW AC AU"),
 ("Day book", "/finance/day-book", "Daily transactions", "ACC-06", "OW AC AU"),
 ("Outstanding reports", "/finance/outstanding", "Receivable / payable ageing", "ACC-09 RPT-07", "OW AC WM"),
 ("Financial year closing", "/finance/year-closing", "Period closing and carry-forward", "PLT-04", "OW AC"),
])
sec("L. GST & statutory workflows", "", [
 ("GST configuration", "/gst/settings", "Registrations, rates, reverse charge, composition", "GST-09", "OW AC"),
 ("GST rate changes", "/gst/rate-changes", "Effective-dated bulk HSN rate change with impact report", "GST-15", "OW AC"),
 ("GST summary", "/gst", "Tax overview", "ACX-09 RPT-08", "OW AC AU"),
 ("GSTR-1 preparation", "/gst/gstr-1", "Outward supply data: prepare, validate, export", "GST-03", "OW AC"),
 ("GSTR-3B preparation", "/gst/gstr-3b", "Tax summary: prepare and export", "GST-04", "OW AC"),
 ("HSN summary", "/gst/hsn-summary", "HSN-wise reporting", "GST-02", "OW AC"),
 ("Input tax credit", "/gst/itc", "Purchase tax tracking", "GST-10", "OW AC"),
 ("GST reconciliation", "/gst/reconciliation", "Compare books with 2B", "GST-05", "OW AC"),
 ("Invoice Management System", "/gst/ims", "Accept / reject / pending on inward invoices", "GST-14", "OW AC"),
 ("Reverse charge", "/gst/rcm", "RCM supplies, self-invoices and liability", "GST-12", "OW AC"),
 ("GSTR-9 summary", "/gst/gstr-9", "Annual summary data from posted documents", "GST-13", "OW AC"),
 ("E-invoice management", "/gst/e-invoices", "IRN workflow where applicable", "WHS-06 GST-06", "OW AC WM"),
 ("E-way bill", "/gst/eway-bills", "Eligible transport workflows", "WHS-07 GST-06", "OW AC WM"),
 ("Tax reports", "/reports/gst", "Tax reporting", "RPT-08", "OW AC AU"),
 ("Invoice validation", "/gst/validation", "GST field checks before posting", "GST-11", "OW AC"),
 ("Statutory registers", "/compliance/registers", "Applicable record-keeping", "CMP-01 CMP-02", "OW PH AU"),
 ("Banned & recalled drugs", "/compliance/banned-drugs", "Banned FDC and recall list; blocking at sale and purchase", "CAT-12 CMP-06", "OW PH AU"),
 ("Ceiling prices", "/compliance/ceiling-prices", "NPPA / DPCO ceiling price list and MRP check results", "CMP-12", "OW PH AU"),
 ("Stock destruction register", "/compliance/destruction", "Expired / damaged stock destroyed: batches, method, witnesses", "CMP-14", "OW PH AU"),
], "These pages **prepare, validate and export** records. Do not advertise or build direct filing or government API connectivity until the integration and authorisation exist (VALIDATION_AND_BUSINESS_RULES.md §6).")
sec("M. Prescription & pharmacy compliance", "Exact statutory workflows are built only after the rule is confirmed with a qualified pharmacy compliance professional (central and state); until then they sit behind a feature flag.", [
 ("Prescription list", "/compliance/prescriptions", "Prescription records", "CMP-03", "OW BM PH AU"),
 ("Add prescription", "/compliance/prescriptions/new", "Capture prescription", "CMP-03 POS-06", "OW BM PH"),
 ("Prescription details", "/compliance/prescriptions/[id]", "Patient and prescription information", "CMP-03", "OW BM PH AU"),
 ("Prescription attachments", "/compliance/prescriptions/[id]/files", "Image / document uploads", "CMP-03", "OW PH"),
 ("Prescription-linked billing", "/sales/pos?rx=[id]", "Link sale to prescription", "POS-06", "PH BO"),
 ("Patient history", "/compliance/patients/[id]", "Historical prescription records (consent-based)", "CMP-08", "OW PH"),
 ("Restricted medicine alerts", "/compliance/alerts", "Applicable schedule warnings", "CMP-09", "OW PH BM"),
 ("Schedule H/H1 register", "/compliance/registers/h1", "Applicable statutory register", "CMP-01", "OW PH AU"),
 ("Schedule X records", "/compliance/registers/x", "Controlled-drug records", "CMP-02", "OW PH AU"),
 ("Controlled stock register", "/compliance/controlled-stock", "Restricted inventory tracking", "CMP-10", "OW PH AU"),
 ("Pharmacist details", "/compliance/pharmacists", "Authorised personnel", "CMP-04", "OW BM"),
 ("Drug licence management", "/compliance/licences", "Licence records and expiry", "CMP-05 PTY-04", "OW BM AU"),
 ("Regulatory audit", "/compliance/audit", "Compliance activity, inspection pack", "CMP-11", "OW AU"),
])
sec("N. CRM & customer engagement", "Reminders need recorded customer consent and an opt-out (CMP-07).", [
 ("CRM dashboard", "/crm", "Customer engagement", "CRM-03", "OW BM"),
 ("Customer history", "/crm/customers", "Find a customer and open their full history", "CRM-01", "OW BM PH BO"),
 ("Customer groups", "/masters/customer-groups", "Segmentation", "PTY-12", "OW BM WM"),
 ("Loyalty programme", "/crm/loyalty", "Rewards rules", "PTY-08", "OW BM"),
 ("Loyalty transactions", "/crm/loyalty/transactions", "Points history", "CRM-04", "OW BM BO"),
 ("Offers & coupons", "/crm/offers", "Offer engine: bill, item, combo, buy-X-get-Y, time-bound, segment, near-expiry", "CRM-05 PRC-15", "OW BM"),
 ("Customer segments", "/crm/segments", "Rule-based customer groups", "CRM-10", "OW BM"),
 ("Stock requests", "/crm/stock-requests", "Customers waiting for out-of-stock medicines", "CRM-11", "OW BM PH BO"),
 ("Memberships", "/crm/memberships", "Paid membership plans and members", "CRM-08", "OW BM"),
 ("Gift vouchers", "/crm/vouchers", "Issue, redeem, balance, expiry; flash sales", "CRM-09", "OW BM"),
 ("Customer feedback", "/crm/feedback", "Feedback collected from invoice links", "ENG-02", "OW BM"),
 ("Dose reminders", "/crm/reminders?type=dose", "Pill / dose-time reminders from the prescription", "NTF-06", "OW BM PH"),
 ("Greetings", "/crm/greetings", "Birthday, anniversary and festival messages", "CRM-12", "OW BM"),
 ("Prescription reminders", "/crm/reminders?type=refill", "Refill reminders (consent)", "PTY-09", "OW BM PH"),
 ("Follow-up reminders", "/crm/reminders?type=follow-up", "Customer follow-up tasks", "CRM-06", "OW BM WM SR"),
 ("WhatsApp integration", "/admin/integrations/whatsapp", "Invoices, reminders, campaigns", "NTF-03 ENG-01 ADM-01", "OW"),
 ("SMS integration", "/admin/integrations/sms", "Notifications", "NTF-04 ADM-01", "OW"),
 ("Accounting integrations", "/admin/integrations/accounting", "Tally export, Zoho Books sync", "ACC-10 INT-03 INT-15", "OW AC"),
 ("Email notifications", "/admin/notifications/email", "Email communication", "NTF-02", "OW"),
 ("Complaints", "/crm/complaints", "Customer complaints", "CRM-02", "OW BM PH BO WM"),
 ("Support tickets", "/crm/tickets", "Issue management", "CRM-07", "OW BM"),
])
sec("O. Reports & analytics", "Every report: date range, filters, server pagination, export (Excel / PDF / CSV) and permission control (RPT-16).", [
 ("Reports dashboard", "/reports", "Report catalogue, favourites, saved filters", "RPT-13", "OW BM AC AU IM WM"),
 ("Sales report", "/reports/sales", "Sales performance", "RPT-02", "OW BM AC AU"),
 ("Purchase report", "/reports/purchase", "Purchase analysis", "RPT-03", "OW BM IM AC AU"),
 ("Item-wise sales", "/reports/sales/items", "Medicine performance", "RPT-02", "OW BM IM"),
 ("Batch-wise sales", "/reports/sales/batches", "Batch movement and recall traceability", "RPT-14", "OW BM IM AU"),
 ("Customer-wise sales", "/reports/sales/customers", "Customer performance", "RPT-02 ANX-03", "OW BM WM"),
 ("Supplier-wise purchase", "/reports/purchase/suppliers", "Supplier analysis", "RPT-03", "OW IM AC"),
 ("Profit report", "/reports/profit", "Gross margin", "RPT-06 ANX-01", "OW AC"),
 ("Discount report", "/reports/discounts", "Discount analysis", "RPT-15", "OW BM AU"),
 ("Tax report", "/reports/gst", "GST details", "RPT-08", "OW AC AU"),
 ("Stock report", "/reports/stock", "Stock position", "RPT-04", "OW BM IM AU"),
 ("Expiry report", "/reports/expiry", "Expiry analysis", "RPT-05", "OW BM IM"),
 ("Stock aging report", "/reports/stock-aging", "Aging", "INV-16", "OW IM AC"),
 ("Dead stock report", "/reports/dead-stock", "Non-moving products", "INV-13", "OW BM IM"),
 ("Reorder report", "/reports/reorder", "Purchase requirements", "PUR-11", "OW BM IM"),
 ("Outstanding report", "/reports/outstanding", "Receivables / payables", "RPT-07", "OW AC WM"),
 ("Outstanding by area / route", "/reports/outstanding/by-area", "Area, route, salesman, as-on-date and age-wise", "RPT-17", "OW AC WM"),
 ("Exception report", "/reports/exceptions", "Cancelled, back-dated, reprinted, below-cost and override bills", "RPT-18", "OW BM AU"),
 ("Customer & product intelligence", "/reports/intelligence", "Purchase frequency, refill prediction, credit-limit and decline flags, dead and declining stock", "ANX-04 ANX-10", "OW BM AC"),
 ("Group register", "/reports/groups", "Sales, profit and growth by group, category, brand, manufacturer", "RPT-22", "OW BM"),
 ("Commission & TDS register", "/reports/commissions", "Salesman / agent commission and TDS", "RPT-21", "OW AC WM"),
 ("Payment behaviour", "/reports/payment-behaviour", "Average payment days and delays by customer", "RPT-19", "OW AC WM"),
 ("Manufacturer-wise reports", "/reports/manufacturers", "Sales, stock, expiry and returns by company", "RPT-20", "OW BM IM WM"),
 ("Customer retention", "/reports/retention", "New vs repeat, lapsed, refill adherence", "ANX-09", "OW BM"),
 ("Staff performance", "/reports/staff-performance", "Sales, bills, discounts and returns by user and salesman", "ANX-08", "OW BM"),
 ("Cash flow report", "/reports/cash-flow", "Cash movement", "ACX-12", "OW AC"),
 ("Financial reports", "/reports/financial", "Final accounts and outstanding reports", "ACX-07 RPT-07", "OW AC AU"),
 ("Branch comparison", "/reports/branches", "Location performance", "RPT-10", "OW"),
 ("Salesman report", "/reports/salesmen", "Representative performance", "WHS-09", "OW WM"),
 ("Audit report", "/reports/audit", "User activity", "PLT-12", "OW AU"),
 ("Export centre", "/admin/exports", "Excel / PDF / CSV exports as jobs", "RPT-11 ADM-07", "OW AC AU"),
])
sec("P. Administration & system settings", "", [
 ("Company profile", "/admin/company", "Business details", "PLT-01 PLT-02", "OW"),
 ("Branch settings", "/admin/branches", "Branch configuration", "PLT-03", "OW BM"),
 ("Warehouse settings", "/admin/warehouses", "Warehouse configuration", "MKT-06", "OW BM"),
 ("User management", "/admin/users", "Staff accounts", "PLT-06", "OW BM"),
 ("Accountant access", "/admin/accountant-access", "Invite a CA with read-only books and GST access", "PLT-27", "OW"),
 ("Import templates", "/admin/imports/templates", "Excel templates with hints, dropdowns and in-sheet validation", "PLT-32", "OW IM"),
 ("Print designer", "/admin/printing/designer", "Choose fields, logo, terms and copies per document", "DOC-05", "OW BM"),
 ("WhatsApp usage", "/admin/integrations/whatsapp/usage", "Messages by category, template status, cost and cap", "NTF-08", "OW"),
 ("Owner digest", "/admin/notifications/digest", "End-of-day summary: contents, time, channel", "NTF-07", "OW"),
 ("License", "/admin/license", "Plan, edition, expiry, limits and usage, masked key, renew", "LIC-09 LIC-05 LIC-06 LIC-04 LIC-10", "OW"),
 ("AI assistant", "/assistant", "Read-only questions over the shop's own data", "PLT-21", "OW BM AC"),
 ("Staff training", "/help/training", "Role lessons, quizzes, certificates", "ADM-13", ALL),
 ("Security centre", "/admin/security-center", "Security score, MFA coverage, admins, sessions, devices, risky events", "SEC-12 SEC-13", "OW"),
 ("Fraud alerts", "/reports/fraud-alerts", "Insider-fraud alerts with case notes", "SEC-05", "OW BM"),
 ("Privileged access", "/platform/privileged-access", "JIT elevation requests, approvals, break-glass log", "SEC-06", "SA"),
 ("Keys & secrets", "/platform/keys", "Key versions, rotation schedule, secret inventory", "SEC-03 SEC-04", "SA"),
 ("Security policies", "/admin/security", "Password, MFA per role, sessions, device binding, field masking", "PLT-35 PLT-36", "OW"),
 ("Single sign-on", "/admin/sso", "SAML / OIDC set-up, enforce SSO, SCIM provisioning", "PLT-33 PLT-34", "OW"),
 ("Data & residency", "/admin/data", "Where data lives, full export, exit and deletion certificate", "PLT-37", "OW"),
 ("Sandbox", "/admin/sandbox", "Create and refresh a practice copy of the business", "PLT-38", "OW"),
 ("Tenant health", "/admin/health", "Sync lag, failed jobs, queues, backups, licence", "PLT-40", "OW BM"),
 ("Branding", "/admin/branding", "Logo, accent, custom domain, branded messages", "ADM-20", "OW"),
 ("Developer portal", "/developers", "API clients, keys, docs, sandbox, webhook logs", "INT-16 ADM-12", "OW"),
 ("Data migration", "/admin/migration", "Import from Marg, Tally, Busy, Vyapar exports with dry run", "PLT-26", "OW"),
 ("Head-office control", "/admin/central-control", "Central masters and settings pushed to outlets; override rules", "PLT-29", "OW"),
 ("Custom fields", "/admin/custom-fields", "Extra fields on items, parties and documents", "PLT-30", "OW"),
 ("Clone set-up", "/admin/clone", "Copy settings and templates to a new company or branch", "PLT-31", "OW"),
 ("Data health", "/admin/data-health", "Integrity checks with links to fix", "ADM-14", "OW AC"),
 ("Firms", "/admin/firms", "Firms billed from the same counter and their rules", "POS-29 PLT-02", "OW"),
 ("Role management", "/admin/roles", "Roles", "PLT-07", "OW"),
 ("Permission management", "/admin/permissions", "Granular access", "PLT-07", "OW"),
 ("Approval workflows", "/admin/approvals", "Transaction approvals", "PLT-19", "OW BM"),
 ("Number series", "/admin/number-series", "Invoice numbering", "PLT-05", "OW"),
 ("Tax settings", "/gst/settings", "GST configuration", "GST-09", "OW AC"),
 ("Payment settings", "/admin/payment-modes", "Payment modes", "ADM-02", "OW AC"),
 ("Printer settings", "/admin/printing", "Invoice printing templates and printers; laser, dot-matrix, thermal formats", "ADM-03 DSK-03 POS-10 DOC-07 DOC-08", "OW BM"),
 ("Dosage labels", "/sales/labels", "Print dosage labels from a bill", "INV-21", "OW PH BO"),
 ("Notification settings", "/admin/notifications", "Alerts per user, role, channel", "ADM-04 NTF-05", "OW BM"),
 ("Audit logs", "/admin/audit", "Activity records", "PLT-12", "OW AU"),
 ("Login history", "/admin/login-history", "Security history, active sessions", "ADM-05", "OW AU"),
 ("Device management", "/admin/devices", "Registered counter PCs", "PLT-11 DSK-05", "OW BM"),
 ("API keys", "/admin/api-keys", "Integration credentials", "ADM-12 INT-05", "OW"),
 ("Webhooks", "/admin/webhooks", "External events", "ADM-12 INT-05", "OW"),
 ("Import centre", "/admin/imports", "Bulk imports as jobs", "ADM-06 PLT-16", "OW IM"),
 ("Export centre", "/admin/exports", "Data export", "ADM-07 PLT-17", "OW AU"),
 ("Backup management", "/admin/backups", "Backup status, tenant data download", "ADM-08", "OW"),
 ("Data retention", "/admin/retention", "Retention policies", "ADM-09", "OW"),
 ("Subscription management", "/admin/subscription", "SaaS plans", "PLT-14", "OW SA"),
 ("Billing & invoices", "/admin/billing", "Platform billing", "ADM-10", "OW SA"),
 ("Settings home", "/admin", "Tiles for every administration page below", "PLT-13", "OW BM"),
 ("Help & support", "/help", "Help centre and support tickets", "ADM-11", ALL),
 ("My keyboard shortcuts", "/me/shortcuts", "View and change your shortcuts; reset to default", "MKT-08 NAV-04", ALL),
 ("Integrations", "/admin/integrations", "GSP, WhatsApp, SMS, Tally, payments", "ADM-01 INT-01 INT-02 INT-03", "OW"),
])

def phase(ids):
    ps = [feat.get(i) for i in ids]
    missing = [i for i, p in zip(ids, ps) if p is None]
    if missing: sys.exit(f"Unknown feature IDs: {missing}")
    return max(ps)
def owners(ids):
    pre = ids[0][:3]
    return own.get(pre, ("?", "?", "Ashok"))

sec("P2. Public pages", "Pages anyone can open without signing in.", [
 ("Status page", "/status", "Service status, incidents, maintenance", "ADM-16", "Public"),
 ("Trust centre", "/trust", "Security overview, VAPT summary, DPA, sub-processors", "SEC-18", "Public"),
 ("Security disclosure", "/.well-known/security.txt", "How to report a vulnerability", "SEC-16", "Public"),
 ("Accessibility statement", "/accessibility", "WCAG conformance and how to report issues", "PLT-42", "Public"),
])
sec("Q. Delivery and online orders", "Home delivery, the customer-facing tracking link and online channels.", [
 ("Home delivery orders", "/delivery", "Orders, rider assignment, status, cash on delivery", "DLV-01 POS-18", "OW BM BO"),
 ("Fleet and riders", "/delivery/fleet", "Riders, vehicles, shifts, zones and charges", "DLV-03", "OW BM"),
 ("Order tracking (customer)", "/track/[token]", "Public link: order status and rider location", "DLV-02", "Customer"),
 ("Online orders", "/orders/online", "Orders from the customer app, WhatsApp, marketplaces and e-commerce", "OMN-02 OMN-04 OMN-03 INT-06", "OW BM PH"),
 ("Store web page", "/store/[branch]", "Public branch page: address, hours, order via WhatsApp", "OMN-01", "Public"),
])
sec("R. Desktop and mobile app screens", "Screens that live in the Electron desktop app or the mobile apps, not in the web router. Routes are app-internal names.", [
 ("Offline status & sync", "desktop:/sync", "Online / offline indicator, sync queue, conflicts", "DSK-02 POS-15", "OW BM BO"),
 ("Counter PIN switch", "desktop:/pin", "Fast user switch at the counter", "PLT-10", "BO PH"),
 ("Hardware", "desktop:/hardware", "Scanner, weighing scale, cash drawer, pole display", "DSK-04 POS-13", "OW BM"),
 ("Local backup", "desktop:/backup", "Emergency export of offline data", "DSK-06", "OW"),
 ("Menu bar", "desktop:/menu", "File, Edit, View, Go, New, Window, Help", "NAV-03", ALL),
 ("Offline license", "desktop:/license", "Cached certificate status and device activation", "LIC-07", "OW"),
 ("Owner app", "mobile:/owner", "Dashboard, approvals, alerts", "MOB-01", "OW"),
 ("Collection app", "mobile:/collections", "Record payments against invoices, share receipts", "MOB-03", "SR"),
 ("Stock count app", "mobile:/stock-count", "Camera barcode scan for physical counts", "MOB-05", "IM"),
 ("Quick billing app", "mobile:/quick-bill", "Small-shop billing with Bluetooth printer", "MOB-06", "BO"),
])

# Features that are behaviour inside an existing screen: attach them so every feature has a home page.
EXTRA = {
 "/sales/pos": "INV-18 POS-04 POS-05 POS-30 POS-31 POS-08 POS-16 POS-17 POS-23 POS-24 POS-26 INV-03 PRC-06 PRC-07 PRC-08 MKT-02 MKT-05 MKT-07 CMP-13 GST-01 CAT-21 CAT-22",
 "/sales/invoices/[id]/print": "POS-25 POS-27",
 "/sales/invoices/new": "GST-07 GST-08 PTY-27",
 "/sales/returns/new": "RET-09",
 "/purchase/invoices/new": "PUR-07 PUR-08 PUR-10 PUR-16 INT-04 PRC-01 PTY-14 PLT-24",
 "/masters/items/new": "CAT-10 CAT-13 CAT-14 CAT-23 CAT-24 INT-10 INT-11 INT-12 INV-14",
 "/masters/suppliers/new": "PTY-25 PTY-29 PLT-22",
 "/masters/customers/new": "PTY-25 PTY-29",
 "/onboarding/data": "PTY-10 INV-11",
 "/inventory/reorder": "PUR-17 RPT-12",
 "/wholesale/claims": "RET-05",
 "/compliance/registers/h1": "RPT-09",
 "/admin/integrations/accounting": "ACC-10",
 "/finance/receipts": "ACC-11 ACC-12 ACC-13",
 "/admin/integrations": "INT-07 INT-08 INT-09 INT-13 INT-14",
 "/dashboard": "ANX-05 NAV-01 NAV-02",
 "/reports/sales": "ANX-06 ANX-07",
 "/me/shortcuts": "NAV-05",
 "/admin/company": "PLT-18",
 "/admin/branches": "PLT-20",
 "/admin/retention": "CMP-07",
 "/finance/posting-rules": "ACC-04",
 "/wholesale/pricing": "PRC-11",
 "/reports": "RPT-16",
 "/admin/audit": "ADM-18 SEC-01",
 "/admin/approvals": "ADM-19",
 "/admin/devices": "SEC-02 SEC-09",
 "/admin/exports": "SEC-11",
 "/compliance/prescriptions": "SEC-17",
 "/platform/security": "SEC-07 SEC-08 SEC-10 SEC-14",
 "/platform/reliability": "SEC-15",
 "/help": "ADM-17",
}
for _i, (_t, _intro, _ps, _note) in enumerate(S):
    _new = []
    for (_n, _r, _w, _ids, _roles) in _ps:
        if _r in EXTRA:
            _l = _ids.split()
            _ids = " ".join(_l + [x for x in EXTRA[_r].split() if x not in _l])
        _new.append((_n, _r, _w, _ids, _roles))
    S[_i] = (_t, _intro, _new, _note)
_routes = {r[1] for _, _, ps, _ in S for r in ps}
_bad = [r for r in EXTRA if r not in _routes]
if _bad: sys.exit(f"EXTRA routes not in the page list: {_bad}")
_used = {i for _, _, ps, _ in S for r in ps for i in r[3].split()}
_unpaged = [k for k in feat if k not in _used]
if _unpaged: sys.exit(f"Features without a page (add a page or an EXTRA entry): {_unpaged}")

out = ["# Page catalogue", "",
"> Every screen MENO will have, grouped A–R (Q delivery and online, R desktop and mobile app screens). **Generated** by `scripts/docs/build_pages.py` from the page list in that script, `FEATURES.md` (phases) and `docs/team/OWNERSHIP_MATRIX.md` (owners): edit those, then re-run the script. MENO Hub shows this catalogue on its Product map with live status.",
"",
"- **Phase**: the phase in which the page is complete (latest phase among its features). Pages can appear earlier with partial functionality.",
"- **Backend / Frontend / QA**: owners of the page's first feature prefix (QA is never the person who built it). Frontend is split between Meyyarivu, Nitheesh, Ashok and Gokul.",
"- **Roles**: SA Super Admin · OW Business Owner · BM Branch Manager · PH Pharmacist · BO Billing Operator · IM Inventory Manager · AC Accountant · WM Wholesale Manager · SR Sales Representative · AU Auditor · All = every signed-in user. Access is enforced by permissions, not by role names (ROLES_AND_DASHBOARDS.md).",
"- **Validation**: every page follows `docs/architecture/VALIDATION_AND_BUSINESS_RULES.md`.",
""]
total = 0
fe_count = {}
for title, intro, pages, note in S:
    out += [f"## {title}", ""]
    if intro: out += [intro, ""]
    out += ["| Page | Route | What it does | Feature IDs | Phase | Backend | Frontend | Roles | QA |", "|---|---|---|---|---|---|---|---|---|"]
    for name, route, what, ids, roles in pages:
        idl = ids.split()
        be, fe, qa = owners(idl)
        fe_count[fe] = fe_count.get(fe, 0) + 1
        out.append(f"| {name} | `{route}` | {what} | {', '.join(idl)} | {phase(idl)} | {be} | {fe} | {roles} | {qa} |")
        total += 1
    out.append("")
    if note: out += [note, ""]
out.insert(3, f"**{total} pages** in {len(S)} sections. Frontend: " + " · ".join(f"{k} {v}" for k, v in sorted(fe_count.items(), key=lambda x: -x[1])) + ".")
out.insert(3, "")
routes = {r[1].split("?")[0] for _, _, ps, _ in S for r in ps}
nav_missing = []
for line in (ROOT/"docs/design/NAVIGATION.md").read_text().splitlines():
    c = [x.strip() for x in line.split("|")]
    if len(c) > 5 and c[3].startswith("/") and c[3] not in routes:
        nav_missing.append(c[3])
if nav_missing:
    sys.exit(f"NAVIGATION.md routes without a page in PAGES: {nav_missing}")
(ROOT/"docs/product/PAGES.md").write_text("\n".join(out))
print("pages", total)
