"""Builds docs/guide/meno-developer-guide.html: the page-by-page guide for frontend and backend developers.
Run: python3 scripts/docs/build_developer_guide.py   (re-run after changing PAGES.md or the screen specs below)

For the core screens it states every field (API name, type, required, UI control, rule, why), the request and response
JSON, errors, and what each side builds. For every other page it derives a spec from PAGES.md and the page pattern.
Field rules follow docs/product/MASTER_FIELDS.md, DOCUMENT_FIELDS.md and VALIDATION_AND_BUSINESS_RULES.md; when they
disagree, those docs win and this script must be updated. A copy is written to project-management/public/guide/.
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/guide/meno-developer-guide.html"
HUB = ROOT / "project-management/public/guide/meno-developer-guide.html"
E = html.escape

# ---------------------------------------------------------------------------------------------------------------
# Field = (key, label, type, required, example, UI control, rule / why)
#   type: string | decimal (money / qty as string) | int | date | bool | uuid | enum(<options source>) | ro:<type>
#         ro: = returned by the server, never sent by the client
#   required: "Y" | "" | "C: <condition>"
# ---------------------------------------------------------------------------------------------------------------
def F(*a):
    return a

CONTACT = [F("type", "Contact type", "enum(contact-types)", "Y", "PRIMARY", "Select", "Exactly one PRIMARY per party; others: ACCOUNTS, ORDERS, SALES_REP"),
           F("person", "Contact person", "string", "Y", "R. Senthil", "Text", "Who to call; 1–100 chars"),
           F("mobile", "Mobile", "string", "Y", "9000000002", "Text (tel)", "10 digits starting 6–9; stored +91…; used for WhatsApp and OTP"),
           F("email", "Email", "string", "", "orders@kaveri.example", "Text (email)", "RFC email, lower-cased; invoices and reminders")]
ADDRESS = [F("type", "Address type", "enum(address-types)", "Y", "BILLING", "Select", "One BILLING required; SHIPPING / GODOWN optional"),
           F("line1", "Address line 1", "string", "Y", "4 Market Street", "Text", "Printed on documents"),
           F("line2", "Address line 2", "string", "", "", "Text", "Optional"),
           F("pincode", "PIN code", "string", "Y", "600003", "Text → auto-fill", "6 digits, not starting 0; must exist in the PIN directory; fills state / district / city"),
           F("stateCode", "State", "ro:string", "", "33", "Read-only (from PIN)", "Billing state must equal GSTIN state → decides CGST+SGST vs IGST"),
           F("district", "District", "ro:string", "", "Chennai", "Read-only", "From PIN directory"),
           F("city", "City", "ro:string", "", "Chennai", "Read-only", "From PIN directory")]
LICENCE = [F("kind", "Licence kind", "enum(licence-kinds)", "Y", "DRUG", "Select", "DRUG / FSSAI / NDPS"),
           F("form", "Form", "enum(drug-licence-forms)", "C: kind = DRUG", "20B/21B", "Select", "20/21 retail, 20B/21B wholesale"),
           F("number", "Licence number", "string", "Y", "20B-DEMO-0002", "Text", "3–40 chars; printed on B2B bills"),
           F("validTo", "Valid to", "date", "Y", "2029-03-31", "Date picker", "Must be in the future for an active party; reminders 30/15/7 days; expired → purchase / sale blocked"),
           F("fileId", "Scan", "uuid", "", "0193…", "File upload", "Proof for inspection; private storage")]
BANK = [F("type", "Bank type", "enum(bank-types)", "Y", "PRIMARY", "Select", "One primary"),
        F("ifsc", "IFSC", "string", "Y", "DEMO0000001", "Text → auto-fill", "^[A-Z]{4}0[A-Z0-9]{6}$; fills bank and branch"),
        F("accountNo", "Account number", "string", "Y", "000123456789", "Masked text, typed twice", "9–18 digits; encrypted at rest; shown as last 4; change needs approval (fraud control)"),
        F("holderName", "Account holder", "string", "", "Kaveri Pharma Distributors", "Text", "Must match party for payouts"),
        F("upiId", "UPI ID", "string", "", "", "Text", "name@bank")]

SCREENS = []


def screen(**kw):
    SCREENS.append(kw)


screen(
    id="supplier", title="Supplier (vendor) master", route="/masters/suppliers/new", pattern="FormPage (tabs)",
    permission="party.supplier.create / party.supplier.update", fe="Ashok", be="Kamesh", module="party",
    tables="party, party_contact, party_address, party_licence, party_bank_account, party_reminder",
    purpose="Who we buy from. Every purchase snapshots this record; the supplier's ledger (Sundry Creditors) is created on save.",
    endpoints=[("POST", "/api/v1/suppliers", "Create (Idempotency-Key)"), ("GET", "/api/v1/suppliers/{id}", "Read"), ("PUT", "/api/v1/suppliers/{id}", "Update (If-Match: version)"),
               ("GET", "/api/v1/gstin/{gstin}", "GSTIN fetch: legal name, address, state, status"), ("GET", "/api/v1/options/{list}", "Option lists (types, groups, forms…)")],
    sections=[
        ("Books", [F("gstin", "GSTIN", "string", "C: gstType in REGULAR, COMPOSITION, SEZ", "33BBBBB1111B1Z2", "Text + Fetch button", "15 chars, pattern + check digit; first 2 digits = billing state"),
                   F("name", "Vendor name", "string", "Y", "Kaveri Pharma Distributors", "Text", "1–200 chars; duplicate check ignores case"),
                   F("printName", "Print name", "string", "", "", "Text", "Defaults to name; printed on documents"),
                   F("code", "Code", "string", "", "", "Text", "Auto from number series when blank; unique"),
                   F("vendorType", "Vendor type", "enum(vendor-types)", "", "DISTRIBUTOR", "Select", "MANUFACTURER / DISTRIBUTOR / STOCKIST / CNF; reports and default terms"),
                   F("groupId", "Group", "uuid", "", "0193…", "Select (party groups)", "Group-level credit and discount defaults"),
                   F("contacts", "Contacts", "array<Contact>", "Y", None, "Repeatable cards", "At least one; exactly one PRIMARY"),
                   F("addresses", "Addresses", "array<Address>", "Y", None, "Repeatable cards", "One BILLING address")]),
        ("Licences", [F("licences", "Licences", "array<Licence>", "Y", None, "Repeatable rows", "Drug licence required for pharma suppliers")]),
        ("Bank", [F("bankAccounts", "Bank accounts", "array<Bank>", "", None, "Toggle + cards", "For payments; approval on change"),
                  F("reminders.enabled", "Payment reminders", "bool", "", True, "Toggle", "Due date = bill date + credit days"),
                  F("reminders.schedule", "Schedule", "array<enum>", "C: reminders on", ["BEFORE_7", "ON_DUE"], "Multi-chips", "From notification settings")]),
        ("Income tax", [F("pan", "PAN", "string", "C: TDS applicable", "BBBBB1111B", "Text (upper)", "^[A-Z]{5}[0-9]{4}[A-Z]$; equals GSTIN chars 3–12"),
                        F("relatedParty", "Related party", "bool", "", False, "Toggle", "Audit report"),
                        F("msmeCategory", "MSME category", "enum(msme-categories)", "Y", "SMALL", "Chips", "NONE / MICRO / SMALL / MEDIUM; micro and small → pay within 15 / 45 days (43B(h))"),
                        F("udyamNo", "Udyam no.", "string", "C: msmeCategory ≠ NONE", "UDYAM-TN-02-0001234", "Text (upper)", "^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$"),
                        F("tdsSectionId", "TDS section", "uuid", "", None, "Select (tds-sections)", "Section, rate, threshold from tds_section with act version")]),
        ("GST", [F("gstType", "GST registration type", "enum(gst-registration-types)", "Y", "REGULAR", "Chips", "REGULAR / COMPOSITION / UNREGISTERED / SEZ / OVERSEAS; composition & unregistered → no ITC"),
                 F("rateMode", "Rates on their bills", "enum(rate-modes)", "Y", "EXCLUSIVE", "Chips", "Default for purchase entry"),
                 F("gstStatus", "GST status", "ro:string", "", "ACTIVE", "Read-only badge", "From Fetch; CANCELLED blocks save")]),
        ("Others", [F("creditDays", "Credit days", "int", "Y", 15, "Number", "0–365; warn above MSME limit"),
                    F("creditLimit", "Credit limit", "decimal", "", "0.00", "Money", "≥ 0"),
                    F("discountPct", "Discount %", "decimal", "", "2.00", "Percent", "0–100; copied to purchases"),
                    F("cashDiscountPct", "Cash discount %", "decimal", "", "0.00", "Percent", "0–100"),
                    F("transporterId", "Transporter", "uuid", "", None, "Select", "Default for GRN / e-way bill"),
                    F("openingBalance", "Opening balance", "decimal", "", "2500.00", "Money", "Cr side for suppliers; one line of the opening trial balance"),
                    F("active", "Active", "bool", "Y", True, "Toggle", "Deactivate instead of delete once used")]),
    ],
    nested={"Contact": CONTACT, "Address": ADDRESS, "Licence": LICENCE, "Bank": BANK},
    response_extra={"id": "0193b2e4-…", "version": 0, "ledgerId": "0193b2e5-…", "gstStatus": "ACTIVE", "createdAt": "2026-11-24T10:15:00Z"},
    errors=[("PARTY_INVALID_GSTIN", "GSTIN pattern / check digit / state wrong", "Field error on GSTIN"), ("PARTY_DUPLICATE_NAME", "Same name exists", "Field error on name with link to existing"),
            ("PARTY_PAN_MISMATCH", "PAN ≠ GSTIN chars 3–12", "Field error on PAN"), ("PARTY_LICENCE_EXPIRED", "validTo in the past", "Field error on licence row"), ("COMMON_VERSION_CONFLICT", "Edited by someone else", "Banner: reload")],
    fe_notes=["Tabs: Books · Licences · Bank · Income tax · GST · Others; red dot on a tab with errors; save jumps to the first error.",
        "GSTIN Fetch calls GET /gstin/{gstin} and fills name, address, state, PAN; state field locks to the GSTIN.",
        "PIN and IFSC fields auto-fill read-only fields; never let the user type state for a billing address.",
        "Zod schema from @meno/validation (partySchema); the server re-validates every rule."],
    be_notes=["Request record SupplierRequest with @Valid nested records; @Gstin, @Pan, @PinCode, @IndianPhone annotations.",
        "Service PartyService.createSupplier: duplicate check, licence rules, encrypt account number, publish PartyChanged.",
        "accounting listens to PartyChanged → creates the ledger under SUNDRY_CREDITORS (never by name).",
        "Bank change on update → status PENDING_APPROVAL until a second user approves (ADM-19)."],
)

screen(
    id="customer", title="Customer master", route="/masters/customers/new", pattern="FormPage (tabs)",
    permission="party.customer.create / update", fe="Ashok", be="Kamesh", module="party",
    tables="party, party_contact, party_address, party_licence, party_patient",
    purpose="Who we sell to: a person at the counter or a pharmacy (retailer). Ledger under Sundry Debtors is created on save.",
    endpoints=[("POST", "/api/v1/customers", "Create"), ("GET", "/api/v1/customers?q=9000000010", "Search by phone / name (POS F3)"), ("PUT", "/api/v1/customers/{id}", "Update")],
    sections=[
        ("Books", [F("customerType", "Customer type", "enum(customer-types)", "Y", "RETAIL_PERSON", "Chips", "RETAIL_PERSON / RETAILER / HOSPITAL / CLINIC / INSTITUTION — decides required tabs"),
                   F("name", "Name", "string", "Y", "Meena Raghavan", "Text", "1–200 chars"),
                   F("gstin", "GSTIN", "string", "C: RETAILER and registered", "", "Text + Fetch", "Makes the sale B2B (GSTR-1 B2B)"),
                   F("contacts", "Contacts", "array<Contact>", "Y", None, "Cards", "Phone is the main search key at the counter"),
                   F("addresses", "Addresses", "array<Address>", "Y", None, "Cards", "Billing state = place of supply")]),
        ("Licences", [F("licences", "Licences", "array<Licence>", "C: RETAILER / HOSPITAL / CLINIC", None, "Rows", "A wholesaler may sell only to licensed buyers; expiry blocks sale")]),
        ("Patient", [F("patient.dob", "Date of birth", "date", "", "1968-03-12", "Date", "Restricted-health data; permission-gated; never logged"),
                     F("patient.gender", "Gender", "enum(genders)", "", "FEMALE", "Chips", ""),
                     F("patient.allergies", "Allergies", "string", "", "Penicillin", "Text", "Shown as a POS warning (CMP-13)"),
                     F("patient.chronicConditions", "Chronic conditions", "string", "", "Type 2 diabetes", "Text", "Drives refill reminders; consent required")]),
        ("Others", [F("creditLimit", "Credit limit", "decimal", "", "2000.00", "Money", "0 = cash only; checked at billing"),
                    F("creditDays", "Credit days", "int", "", 30, "Number", "Due date and ageing"),
                    F("priceListId", "Price list", "uuid", "", None, "Select", "Rate level A / B / C (wholesale)"),
                    F("salesmanId", "Salesman", "uuid", "", None, "Select", "Wholesale commission")]),
    ],
    nested={"Contact": CONTACT, "Address": ADDRESS, "Licence": LICENCE},
    response_extra={"id": "0193…", "version": 0, "ledgerId": "0193…", "outstanding": "0.00"},
    errors=[("PARTY_DUPLICATE_PHONE", "Phone already used by another retail customer", "Offer to open the existing customer"), ("PARTY_INVALID_GSTIN", "Bad GSTIN", "Field error")],
    fe_notes=["Quick-add from POS (F3) uses the same endpoint with only name + phone.", "Patient tab visible only to roles with party.patient.view; hide values in lists."],
    be_notes=["party_patient in the patient-data vault (SEC-17); access logged with purpose.", "PartyChanged → ledger under SUNDRY_DEBTORS."],
)

screen(
    id="item", title="Medicine (product) master", route="/masters/items/new", pattern="FormPage (tabs)",
    permission="catalog.item.create / update", fe="Ashok", be="Kamesh", module="catalog",
    tables="item, item_composition, barcode, item_branch_setting, item_preferred_vendor",
    purpose="What we sell. Holds what never changes per batch: salt, schedule, HSN, price defaults, stock levels. Batch, expiry and MRP come from purchases.",
    endpoints=[("POST", "/api/v1/items", "Create"), ("GET", "/api/v1/items?q=para&salt=&barcode=", "Search (≤ 150 ms p95)"), ("GET", "/api/v1/items/{id}/substitutes", "Same salt + strength + form")],
    sections=[
        ("Details", [F("name", "Product name", "string", "Y", "Paracip 650 Tablet", "Text", "1–200; duplicate check"),
                     F("printName", "Print name", "string", "", "Paracip 650", "Text", "Short name for thermal bills"),
                     F("departmentId", "Department", "uuid", "Y", "0193…", "Select", "Pharma items are always batch-enabled"),
                     F("manufacturerId", "Manufacturer", "uuid", "C: pharma", "0193…", "Select", "Company-wise reports, returns"),
                     F("categoryId", "Category", "uuid", "", None, "Tree select", "Reports, discount rules"),
                     F("unitId", "Pack unit + conversion", "uuid", "Y", "0193…", "Select", "Strip of 15 tablets → loose sale"),
                     F("barcodes", "Barcodes", "array<string>", "", ["8900000000011"], "Tags", "EAN-8/12/13, unique per tenant"),
                     F("shelfLifeMonths", "Shelf life (months)", "int", "", 24, "Number", "Sanity check on batch expiry")]),
        ("Pharmacy", [F("compositions", "Composition (salt + strength)", "array<{saltId,strength}>", "C: pharma", [{"saltId": "0193…", "strength": "650 mg"}], "Repeatable", "Substitutes and salt search"),
                      F("dosageForm", "Dosage form", "enum(dosage-forms)", "Y", "TABLET", "Select", ""),
                      F("schedule", "Schedule", "enum(schedules)", "Y", "OTC", "Chips", "OTC / H / H1 / X / G / NDPS → POS prescription check"),
                      F("storage", "Storage", "enum(storage-conditions)", "", "BELOW_25C", "Select", "Cold chain checked at GRN")]),
        ("Pricing & tax", [F("hsnId", "HSN", "uuid", "Y", "0193… (3004)", "Select", "GST rate comes from HSN for the document date — never typed"),
                           F("gstRate", "GST %", "ro:decimal", "", "5.00", "Read-only", "From hsn_tax for today"),
                           F("defaultMrp", "Default MRP", "decimal", "", "33.60", "Money", "Batches carry their own MRP"),
                           F("discountReceivedPct", "Discount received %", "decimal", "", "20.00", "Percent", "Suggested PTR"),
                           F("maxDiscountPct", "Max discount %", "decimal", "", "8.00", "Percent", "Lower of item and role cap wins at POS"),
                           F("minMarkupPct", "Min mark-up %", "decimal", "", "10.00", "Percent", "Warn below; block below cost"),
                           F("suggestedPtr", "Suggested PTR", "ro:decimal", "", "25.60", "Read-only", "MRP ÷ (1+GST) × (1−discount)")]),
        ("Stock", [F("branchSettings", "Per-branch levels", "array<{branchId,min,reorder,max,rack}>", "", [{"branchId": "0193…", "min": 10, "reorder": 30, "max": 60, "rack": "R3-S2"}], "Table", "min ≤ reorder ≤ max"),
                   F("leadTimeDays", "Lead time (days)", "int", "", 2, "Number", "Reorder point")]),
    ],
    nested={},
    response_extra={"id": "0193…", "version": 0, "active": True, "batchEnabled": True},
    errors=[("CATALOG_DUPLICATE_ITEM", "Same name", "Field error"), ("CATALOG_DUPLICATE_BARCODE", "Barcode used", "Field error naming the other item"), ("CATALOG_BATCH_REQUIRED", "Pharma item without batch tracking", "Toggle locked on")],
    fe_notes=["Never show a GST % input; show the rate read from the HSN.", "Salt search drives substitutes; show 'same composition' label, not 'equivalent'."],
    be_notes=["ItemChanged event → search index refresh, POS caches.", "GET search uses trigram / prefix indexes; 50k-item performance test."],
)

screen(
    id="doctor", title="Doctor master", route="/masters/doctors", pattern="ListPage + FormSheet",
    permission="party.doctor.create", fe="Ashok", be="Kamesh", module="party",
    tables="doctor", purpose="Prescriber details for prescriptions and the Schedule H1 register.",
    endpoints=[("POST", "/api/v1/doctors", "Create"), ("GET", "/api/v1/doctors?q=", "Search")],
    sections=[("Doctor", [F("name", "Name", "string", "Y", "Dr. R. Kumar", "Text", "H1 register needs prescriber name"),
                          F("regNo", "Registration no.", "string", "Y", "DEMO-1234", "Text", "Unique with council"),
                          F("councilState", "State council", "enum(states)", "Y", "33", "Select", "Registration is per state council"),
                          F("specialisation", "Specialisation", "string", "", "General medicine", "Text", "Reports"),
                          F("address", "Clinic address", "Address", "Y", None, "Card", "H1 register needs prescriber address")])],
    nested={"Address": ADDRESS}, response_extra={"id": "0193…", "version": 0},
    errors=[("PARTY_DUPLICATE_DOCTOR", "Same reg. no. + council", "Field error")], fe_notes=["Quick-add from POS F4 dialog."], be_notes=["UNIQUE (tenant_id, reg_no, council_state)."],
)

screen(
    id="ledger", title="Ledger (account) master", route="/finance/accounts/new", pattern="FormSheet",
    permission="accounting.ledger.create", fe="Nitheesh", be="Nitheesh", module="accounting",
    tables="ledger_group, ledger_account", purpose="An account that carries a balance (Cash, Rent, HDFC Bank). Party ledgers are made automatically; system ledgers are seeded and can be renamed, not deleted.",
    endpoints=[("GET", "/api/v1/ledger-groups", "Tree"), ("POST", "/api/v1/ledgers", "Create"), ("GET", "/api/v1/ledgers/{id}/statement?from=&to=", "Statement with running balance")],
    sections=[("Ledger", [F("name", "Ledger name", "string", "Y", "Shop Rent", "Text", "Unique per company"),
                          F("groupId", "Under group", "uuid", "Y", "0193… (Indirect Expenses)", "Tree select", "Group decides nature: ASSET / LIABILITY / EQUITY / INCOME / EXPENSE; party and GST groups hidden"),
                          F("nature", "Nature", "ro:enum", "", "EXPENSE", "Read-only", "Always the group's nature (DB CHECK)"),
                          F("openingBalance", "Opening balance", "decimal", "", "0.00", "Money", "On the books start date"),
                          F("openingSide", "Dr / Cr", "enum(DR,CR)", "C: opening > 0", "DR", "Segmented", "Opening Σ Dr must = Σ Cr before go-live")])],
    nested={}, response_extra={"id": "0193…", "version": 0, "systemCode": None, "isSystem": False, "balance": "0.00", "balanceSide": "DR"},
    errors=[("ACCOUNTING_DUPLICATE_LEDGER", "Same name", "Field error"), ("ACCOUNTING_SYSTEM_LEDGER", "Delete / move a system ledger", "Disable the action")],
    fe_notes=["Show the group tree with badges: System · Party · Yours.", "Balance shown as 1,23,456.70 Dr / Cr (Indian grouping)."],
    be_notes=["Posting finds ledgers by system_code, never by name.", "Vouchers: Σ debit = Σ credit or ACCOUNTING_UNBALANCED."],
)

PLINE = [F("itemId", "Item", "uuid", "Y", "0193…", "Search cell (F2)", "Active, not banned"),
         F("batchNo", "Batch no.", "string", "Y", "PC24A7", "Text cell", "Same item+batch+expiry+MRP = existing batch"),
         F("expiry", "Expiry (MM/YYYY)", "string", "Y", "08/2027", "Masked cell", "After today; near-expiry warns"),
         F("qty", "Billed qty", "decimal", "Y", "10", "Number cell", "> 0"),
         F("freeQty", "Free qty", "decimal", "", "1", "Number cell", "Stock in, not charged"),
         F("rate", "PTR / rate", "decimal", "Y", "24.00", "Money cell", "> 0 and < MRP ex-GST; deviation highlighted"),
         F("mrp", "MRP", "decimal", "Y", "33.60", "Money cell", "> ceiling → warn"),
         F("schemePct", "Scheme %", "decimal", "", "0", "Percent cell", "Before trade discount (setting)"),
         F("discountPct", "Trade disc %", "decimal", "", "0", "Percent cell", "0–100"),
         F("taxable", "Taxable", "ro:decimal", "", "240.0000", "Read-only", "Engine"), F("gst", "GST", "ro:decimal", "", "12.00", "Read-only", "Engine"),
         F("landedCost", "Landed cost / unit", "ro:decimal", "", "23.4673", "Read-only", "Incl. freight share and free goods")]

screen(
    id="purchase", title="Purchase invoice entry", route="/purchase/invoices/new", pattern="DocumentGrid",
    permission="purchase.invoice.create / post", fe="Meyyarivu", be="Kamesh", module="purchase",
    tables="purchase_invoice, purchase_line, batch, inventory_movement (+ voucher via event)",
    purpose="Enter a supplier's bill: stock comes in by batch, the supplier is owed, input GST is recorded.",
    endpoints=[("POST", "/api/v1/purchase-invoices", "Create draft"), ("PUT", "/api/v1/purchase-invoices/{id}", "Save draft (If-Match)"),
               ("POST", "/api/v1/purchase-invoices/{id}/post", "Post (Idempotency-Key)"), ("POST", "/api/v1/purchase-invoices/{id}/reverse", "Reverse (reason)")],
    sections=[("Header", [F("supplierId", "Supplier", "uuid", "Y", "0193…", "Party picker (F3)", "Active, licence valid on bill date"),
                          F("supplierInvoiceNo", "Supplier bill no.", "string", "Y", "KPD/26-27/004410", "Text", "Unique per supplier + FY"),
                          F("supplierInvoiceDate", "Supplier bill date", "date", "Y", "2026-11-24", "Date", "≤ today, in open FY"),
                          F("branchId", "Receive into", "uuid", "Y", "0193…", "Select", "User must have the branch"),
                          F("freight", "Freight", "decimal", "", "50.00", "Money", "Allocated by value to landed cost"),
                          F("typedTotal", "Supplier bill total", "decimal", "Y", "1506.00", "Money", "Must match computed ±₹1 — catches typing errors")]),
              ("Lines", [F("lines", "Lines", "array<PurchaseLine>", "Y", None, "Keyboard grid", "At least one")])],
    nested={"PurchaseLine": PLINE},
    response_extra={"id": "0193…", "status": "DRAFT", "version": 1, "taxable": "1349.5000", "cgst": "78.46", "sgst": "78.46", "igst": "0.00", "roundOff": "-0.42", "grandTotal": "1506.00"},
    errors=[("PURCHASE_DUPLICATE_SUPPLIER_INVOICE", "Same bill again", "Block with link to the existing entry"), ("PURCHASE_BATCH_EXPIRED", "Expired batch", "Row error"),
            ("PURCHASE_TOTAL_MISMATCH", "Computed ≠ typed", "Show both totals and the difference"), ("ACCOUNTING_PERIOD_LOCKED", "Locked month", "Banner")],
    fe_notes=["Totals panel recomputed live with @meno/billing-engine calcInvoice(EXCLUSIVE); the server recomputes on post.",
        "Grid keys: Enter next cell, Ctrl+Del delete line, F10 post.", "After post: show number PUR/26-27/000001 and the read-only document."],
    be_notes=["Post = posting pipeline (BACKEND_IMPLEMENTATION §3): snapshot → engine → number → StockFacade.receive → POSTED + hash → PurchasePosted.",
        "Never trust client taxable / GST; store engine output."],
)

POSLINE = [F("itemId", "Item", "uuid", "Y", "0193…", "Search (F2) / barcode", "Saleable stock, not banned"),
           F("batchId", "Batch", "uuid", "Y", "0193…", "Auto FEFO, override with reason", "Not expired; FEFO override needs permission"),
           F("qty", "Qty", "decimal", "Y", "2", "Number", "≤ available; loose allowed by unit"),
           F("discountPct", "Disc %", "decimal", "", "10", "Percent", "≤ min(role cap, item cap) else manager PIN"),
           F("rate", "Rate (MRP)", "ro:decimal", "", "33.60", "Read-only", "Batch MRP; never above"),
           F("taxable", "Taxable", "ro:decimal", "", "57.6000", "Read-only", "Back-calculated"), F("gst", "GST", "ro:decimal", "", "2.88", "Read-only", ""), F("total", "Amount", "ro:decimal", "", "60.4800", "Read-only", "")]
PAY = [F("mode", "Mode", "enum(payment-modes)", "Y", "UPI", "Chips (F9)", "CASH / UPI / CARD / CREDIT"), F("amount", "Amount", "decimal", "Y", "60.00", "Money", "Σ = grand total"), F("reference", "Reference", "string", "", "UPI ref 1234", "Text", "")]

screen(
    id="pos", title="POS bill (retail counter)", route="/sales/pos", pattern="PosScreen",
    permission="sales.invoice.create / post", fe="Meyyarivu", be="Kamesh", module="sales",
    tables="sales_invoice, sales_line, inventory_movement, schedule_register_entry (+ voucher)",
    purpose="Fast keyboard billing at MRP (GST included), online or offline.",
    endpoints=[("POST", "/api/v1/sales-invoices?mode=POS", "Create + post in one call (Idempotency-Key = client UUID)"), ("GET", "/api/v1/items/search?q=&withStock=true", "Search with batches"),
               ("POST", "/api/v1/pos/held-bills", "Hold (F6)"), ("POST", "/api/v1/sync/push", "Offline bills (desktop)")],
    sections=[("Header", [F("clientId", "Client bill id", "uuid", "Y", "0193f0a1-…", "Hidden", "UUIDv7 generated on the device; idempotency for offline and double F10"),
                          F("customerId", "Customer", "uuid", "", None, "F3 search by phone", "Walk-in if empty; required for credit"),
                          F("doctorId", "Doctor", "uuid", "C: any line H / H1 / X", "0193…", "F4 dialog", "Prescription required"),
                          F("prescriptionNo", "Rx no.", "string", "C: H / H1 / X", "RX-0001", "Text", "H1 register"),
                          F("billDiscount", "Bill discount", "decimal", "", "0.00", "Money", "Split by value across lines (§8)")]),
              ("Lines", [F("lines", "Lines", "array<PosLine>", "Y", None, "Cart table", "")]),
              ("Payment", [F("payments", "Payments", "array<Payment>", "Y", None, "Payment panel (F9)", "Split allowed")])],
    nested={"PosLine": POSLINE, "Payment": PAY},
    response_extra={"id": "0193…", "number": "AM/26-27/000124", "status": "POSTED", "taxable": "57.6000", "cgst": "1.44", "sgst": "1.44", "roundOff": "-0.48", "grandTotal": "60.00", "change": "0.00", "printUrl": "/api/v1/sales-invoices/{id}/print"},
    errors=[("COMPLIANCE_PRESCRIPTION_REQUIRED", "H / H1 / X without Rx", "Focus F4 dialog"), ("INVENTORY_BATCH_EXPIRED", "Expired", "Row error"),
            ("INVENTORY_INSUFFICIENT_STOCK", "Qty > available", "Row error with available qty"), ("PRICING_DISCOUNT_APPROVAL_REQUIRED", "Above cap", "Manager PIN dialog"),
            ("SALES_CREDIT_LIMIT_EXCEEDED", "Credit over limit", "Owner approval"), ("SALES_SHIFT_NOT_OPEN", "No open shift", "Open shift dialog")],
    fe_notes=["All F-keys from the shortcut registry; focus returns to search after each line.", "Live totals: billing-engine calcInvoice(MRP_INCLUSIVE); loose lines via looseSale.",
        "Offline (desktop): same engine, number from the device series, bill signed with the device key, queued for sync.", "Second F10 with the same clientId returns the same bill (Idempotent-Replayed header)."],
    be_notes=["One transaction: ComplianceGuard → PricingEngine → GstCalculator → number → StockFacade.consume → POSTED → InvoicePosted.",
        "InvoicePosted listeners: voucher, H1 register entry (hash-chained), loyalty, notifications."],
)

screen(
    id="wholesale", title="Wholesale tax invoice", route="/sales/invoices/new?type=wholesale", pattern="DocumentGrid",
    permission="sales.invoice.create / post (wholesale edition)", fe="Meyyarivu", be="Kamesh", module="sales",
    tables="sales_invoice, sales_line, document_charge, credit_note (returns), inventory_movement",
    purpose="Credit bill to a pharmacy at PTR, with schemes, dispatch details, returns as credit notes on one print.",
    endpoints=[("POST", "/api/v1/sales-invoices?type=WHOLESALE", "Draft"), ("POST", "/api/v1/sales-invoices/{id}/post", "Post"), ("POST", "/api/v1/sales-invoices/{id}/einvoice", "Queue e-invoice")],
    sections=[("Header", [F("customerId", "Retailer", "uuid", "Y", "0193…", "Party picker", "Licence valid; credit check"),
                          F("orderNo", "Order no.", "string", "", "SO/26-27/000045", "Text", "Printed"), F("lrNo", "L.R. no.", "string", "", "LR-131345", "Text", "Dispatch"),
                          F("vehicleNo", "Vehicle no.", "string", "C: e-way bill needed", "TN-01-AB-1234", "Text", "E-way bill above threshold"),
                          F("cases", "Cases", "int", "", 3, "Number", "Packing"), F("dueDate", "Due date", "ro:date", "", "2026-12-24", "Read-only", "Bill date + credit days"),
                          F("freight", "Freight", "decimal", "", "100.00", "Money", "GST per billing.charges_gst setting"), F("insurance", "Insurance", "decimal", "", "25.00", "Money", "")]),
              ("Lines", [F("lines", "Lines", "array<WholesaleLine>", "Y", None, "Grid with Section column", "SALE / SALES_RETURN / BRK_EXP_RETURN / REPLACEMENT")])],
    nested={"WholesaleLine": [F("section", "Section", "enum(bill-sections)", "Y", "SALE", "Select", "Returns become credit notes"), F("itemId", "Item", "uuid", "Y", "0193…", "Search", ""),
                              F("batchId", "Batch", "uuid", "Y", "0193…", "Select", ""), F("qty", "Qty", "decimal", "Y", "5", "Number", ""), F("freeQty", "Free", "decimal", "", "1", "Number", "Scheme"),
                              F("rate", "PTR", "decimal", "Y", "25.60", "Money", "From price list"), F("discountPct", "Disc %", "decimal", "", "0", "Percent", ""), F("reason", "Return reason", "enum(return-reasons)", "C: return section", None, "Select", "")]},
    response_extra={"id": "0193…", "number": "WS/26-27/000001", "creditNotes": ["CN/26-27/000001"], "igst": "83.96", "roundOff": "0.07", "grandTotal": "578.00"},
    errors=[("PARTY_LICENCE_EXPIRED", "Retailer licence expired", "Block"), ("SALES_CREDIT_LIMIT_EXCEEDED", "Over limit", "Approval")],
    fe_notes=["Printed layout per DOCUMENT_FIELDS §3a; totals from billing-engine combinedBill."], be_notes=["Return sections post separate credit notes linked to the invoice (WHS-15)."],
)

screen(
    id="return", title="Sales return / credit note", route="/sales/returns/new", pattern="DocumentGrid",
    permission="sales.return.create", fe="Ashok", be="Kamesh", module="returns",
    tables="sales_return, credit_note, inventory_movement", purpose="Goods come back against the original bill; credit note reverses GST.",
    endpoints=[("GET", "/api/v1/sales-invoices/{id}/returnable", "Lines with qty still returnable"), ("POST", "/api/v1/sales-returns", "Create + post")],
    sections=[("Return", [F("invoiceId", "Original invoice", "uuid", "Y", "0193…", "Invoice search", "Posted, same customer"),
                          F("lines", "Lines", "array<{salesLineId, qty, inspection}>", "Y", [{"salesLineId": "0193…", "qty": "1", "inspection": "SALEABLE"}], "Grid", "qty ≤ sold − returned; inspection SALEABLE / DAMAGED / EXPIRED"),
                          F("reasonId", "Reason", "uuid", "Y", "0193…", "Select", "Approval above limit"),
                          F("settlement", "Settlement", "enum(REFUND,ADJUST,CREDIT)", "Y", "REFUND", "Chips", "")])],
    nested={}, response_extra={"id": "0193…", "creditNoteNumber": "CN/26-27/000002", "total": "60.48"},
    errors=[("RETURNS_QTY_EXCEEDS_SOLD", "Too many", "Row error"), ("TAXATION_CREDIT_NOTE_TIME_BARRED", "After 30 Nov rule", "Explain: financial note only")],
    fe_notes=["Rate, discount, GST copied from the original line — read-only."], be_notes=["Saleable → stock back to batch; others to dump location."],
)

screen(
    id="receipt", title="Receipt (customer payment)", route="/finance/receipts", pattern="FormSheet",
    permission="payment.receipt.create", fe="Nitheesh", be="Nitheesh", module="payment",
    tables="payment, payment_allocation (+ voucher)", purpose="Money received, matched to open bills (oldest first).",
    endpoints=[("GET", "/api/v1/customers/{id}/open-invoices", "Open bills"), ("POST", "/api/v1/receipts", "Create (Idempotency-Key)")],
    sections=[("Receipt", [F("partyId", "Customer", "uuid", "Y", "0193…", "Party picker", ""), F("mode", "Mode", "enum(payment-modes)", "Y", "CASH", "Chips", "Cheque needs no., date, bank"),
                           F("amount", "Amount", "decimal", "Y", "650.00", "Money", "> 0"), F("allocations", "Allocations", "array<{invoiceId, amount}>", "", None, "Auto FIFO, editable", "Rest on account")])],
    nested={}, response_extra={"id": "0193…", "number": "RC/26-27/000010", "allocations": [{"invoiceId": "A", "amount": "500.00"}, {"invoiceId": "B", "amount": "150.00"}], "onAccount": "0.00"},
    errors=[("PAYMENT_OVER_ALLOCATED", "Allocations > amount", "Field error")], fe_notes=["Show ageing next to each open bill."], be_notes=["PaymentRecorded → voucher Dr Cash/Bank, Cr Customer."],
)

screen(
    id="transfer", title="Stock transfer", route="/inventory/transfers", pattern="DocumentGrid",
    permission="inventory.transfer.create / dispatch / receive", fe="Meyyarivu", be="Kamesh", module="inventory",
    tables="stock_transfer, inventory_movement", purpose="Move stock between branches: dispatch → in transit → receive.",
    endpoints=[("POST", "/api/v1/stock-transfers", "Create + dispatch"), ("POST", "/api/v1/stock-transfers/{id}/receive", "Receive with short / excess")],
    sections=[("Transfer", [F("fromBranchId", "From", "uuid", "Y", "0193…", "Select", ""), F("toBranchId", "To", "uuid", "Y", "0193…", "Select", "Different GSTIN → tax invoice (R-15)"),
                            F("lines", "Lines", "array<{batchId, qty}>", "Y", [{"batchId": "0193…", "qty": "5"}], "Grid", "qty ≤ available")])],
    nested={}, response_extra={"id": "0193…", "status": "IN_TRANSIT", "documentType": "DELIVERY_CHALLAN"}, errors=[("INVENTORY_INSUFFICIENT_STOCK", "Not enough", "Row error")],
    fe_notes=["Receiving screen shows expected vs received per line."], be_notes=["OUT at source into in-transit location; IN at destination on receive."],
)

screen(
    id="adjustment", title="Stock adjustment", route="/inventory/adjustments", pattern="DocumentGrid",
    permission="inventory.adjustment.create / approve", fe="Meyyarivu", be="Kamesh", module="inventory",
    tables="stock_adjustment, inventory_movement (+ voucher)", purpose="Authorised correction: damage, theft, sample, expiry write-off, count difference.",
    endpoints=[("POST", "/api/v1/stock-adjustments", "Create (approval above value limit)")],
    sections=[("Adjustment", [F("lines", "Lines", "array<{batchId, qty, reasonCode}>", "Y", [{"batchId": "0193…", "qty": "-2", "reasonCode": "DAMAGE"}], "Grid", "± qty; reason from master"),
                              F("remark", "Remark", "string", "Y", "Broken in transit", "Text", "Audit")])],
    nested={}, response_extra={"id": "0193…", "status": "PENDING_APPROVAL"}, errors=[("INVENTORY_APPROVAL_REQUIRED", "Above value limit", "Show approver")],
    fe_notes=["Show value impact (qty × unit cost) before saving."], be_notes=["Movements at unit cost; voucher to Expiry Loss / Stock Adjustment per posting rule."],
)

screen(
    id="onboarding-company", title="Onboarding: company & GST", route="/onboarding/pharmacy", pattern="Wizard step",
    permission="tenancy.company.update", fe="Meyyarivu", be="Nitheesh", module="tenancy",
    tables="company, onboarding_progress", purpose="GSTIN-first company set-up; state locked to the GSTIN.",
    endpoints=[("GET", "/api/v1/gstin/{gstin}", "Fetch"), ("PUT", "/api/v1/onboarding/company", "Save step (resume later)")],
    sections=[("Company", [F("gstin", "GSTIN", "string", "C: registered", "33AAAAA0000A1Z5", "Text + Fetch", ""), F("registrationType", "Registration type", "enum(gst-registration-types)", "Y", "REGULAR", "Chips", "Composition → Bill of Supply"),
                           F("legalName", "Legal name", "string", "Y", "Aruna Medicals", "Text (locked after fetch)", "Exactly as on GST"), F("tradeName", "Trade name", "string", "", "Aruna Medicals", "Text", "Printed"),
                           F("pan", "PAN", "string", "Y", "AAAAA0000A", "Text", "= GSTIN 3–12"), F("address", "Address", "Address", "Y", None, "Card", "State locked to GSTIN"), F("logoFileId", "Logo", "uuid", "", None, "Upload", "≤ 1 MB")])],
    nested={"Address": ADDRESS}, response_extra={"step": "company", "status": "DONE", "next": "licences"}, errors=[("TENANCY_GSTIN_STATE_MISMATCH", "State ≠ GSTIN", "Lock state")],
    fe_notes=["Every step saves on Next; resume lands on the same step."], be_notes=["onboarding_progress row per step; go-live checks read them."],
)

# ---------------------------------------------------------------------------------------------------------------
TYPEHINT = {"string": "string", "decimal": "string (decimal)", "int": "integer", "date": "string (yyyy-MM-dd)", "bool": "boolean", "uuid": "string (UUID)"}


def example_of(f, nested):
    key, label, typ, req, ex, ui, why = f
    if ex is not None:
        return ex
    m = re.match(r"array<(\w+)>", typ)
    if m and m.group(1) in nested:
        return [build(nested[m.group(1)], nested, request=True)]
    if typ in nested:
        return build(nested[typ], nested, request=True)
    return None


def set_path(d, key, value):
    parts = key.split(".")
    for p in parts[:-1]:
        d = d.setdefault(p, {})
    d[parts[-1]] = value


def build(fields, nested, request):
    out = {}
    for f in fields:
        ro = f[2].startswith("ro:")
        if request and ro:
            continue
        set_path(out, f[0], example_of(f, nested))
    return out


def field_rows(fields, prefix=""):
    rows = []
    for key, label, typ, req, ex, ui, why in fields:
        ro = typ.startswith("ro:")
        t = typ[3:] if ro else typ
        rq = "Yes" if req == "Y" else ("—" if not req else E(req[3:] if req.startswith("C: ") else req) + " <span class='pill'>conditional</span>")
        rows.append(f"<tr><td class='mono'>{E(prefix + key)}</td><td>{E(label)}</td><td class='mono'>{E(TYPEHINT.get(t, t))}{' <span class=\"pill ro\">server</span>' if ro else ''}</td><td>{rq}</td><td>{E(ui)}</td><td>{E(why)}</td></tr>")
    return rows


def screen_html(s):
    all_fields = [f for _, fs in s["sections"] for f in fs]
    req = build(all_fields, s["nested"], request=True)
    resp = {**s["response_extra"], **build(all_fields, s["nested"], request=False)}
    sect = []
    for name, fs in s["sections"]:
        sect.append(f"<h4>{E(name)}</h4>" + table(["API field", "Label on screen", "Type", "Required", "UI control", "Rule / why we need it"], field_rows(fs)))
    for nname, nfs in s["nested"].items():
        sect.append(f"<h4>Nested object <code>{E(nname)}</code></h4>" + table(["API field", "Label", "Type", "Required", "UI control", "Rule / why"], field_rows(nfs)))
    eps = table(["Method", "Path", "Use"], [[f"<span class='pill m'>{m}</span>", f"<span class='mono'>{E(p)}</span>", E(u)] for m, p, u in s["endpoints"]])
    errs = table(["Error code", "When", "Frontend shows"], [[f"<span class='mono'>{E(c)}</span>", E(w), E(u)] for c, w, u in s["errors"]])
    fe = "".join(f"<li>{E(x)}</li>" for x in s["fe_notes"])
    be = "".join(f"<li>{E(x)}</li>" for x in s["be_notes"])
    return f"""<article class="spec" id="screen-{s['id']}">
<h3>{E(s['title'])}</h3>
<p>{E(s['purpose'])}</p>
<div class="meta"><span><b>Route</b> <code>{E(s['route'])}</code></span><span><b>Pattern</b> {E(s['pattern'])}</span><span><b>Permission</b> <code>{E(s['permission'])}</code></span><span><b>Module</b> <code>{E(s['module'])}</code></span><span><b>Frontend</b> {E(s['fe'])}</span><span><b>Backend</b> {E(s['be'])}</span></div>
<p class="small"><b>Tables:</b> <code>{E(s['tables'])}</code></p>
<h4>Endpoints</h4>{eps}
{''.join(sect)}
<div class="two"><div><h4>Request body (example)</h4><pre>{E(json.dumps(req, indent=2, ensure_ascii=False))}</pre></div>
<div><h4>Response (example)</h4><pre>{E(json.dumps(resp, indent=2, ensure_ascii=False))}</pre></div></div>
<h4>Errors to handle</h4>{errs}
<div class="two"><div class="box fe"><h4>Frontend builds</h4><ul>{fe}</ul></div><div class="box be"><h4>Backend builds</h4><ul>{be}</ul></div></div>
</article>"""


def table(head, rows):
    h = "".join(f"<th>{x}</th>" for x in head)
    b = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" if isinstance(r, list) else r for r in rows)
    return f'<div class="tbl"><table><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table></div>'


# ---------------------------------------------------------------------------------------------------------------
# Every page from PAGES.md, with a pattern and API derived from its route (core screens link to their full spec).
pages, psec = [], ""
for line in (ROOT / "docs/product/PAGES.md").read_text().splitlines():
    h = re.match(r"^## (.+)$", line)
    if h:
        psec = re.sub(r"\*\*", "", h.group(1)).strip()
    c = [x.strip() for x in line.split("|")]
    if len(c) > 9 and c[2].startswith("`") and psec:
        route = c[2].strip("`")
        pages.append({"name": c[1], "route": route, "what": re.sub(r"[*`]", "", c[3]), "ids": c[4], "phase": c[5], "be": c[6], "fe": c[7], "roles": c[8], "section": psec})

SPEC_BY_ROUTE = {s["route"].split("?")[0]: s["id"] for s in SCREENS}


def pattern_for(r: str, name: str) -> str:
    if r.startswith(("desktop:", "mobile:")):
        return "App screen"
    if "/pos" in r:
        return "PosScreen"
    if r.startswith("/onboarding"):
        return "Wizard step"
    if r.startswith(("/dashboard", "/platform")) and r.count("/") <= 2:
        return "Dashboard"
    if r.startswith("/reports") or "register" in r or "statement" in r or "ledger" in r:
        return "ReportPage"
    if r.endswith("/new") or "new?" in r:
        doc = any(k in r for k in ("invoice", "purchase", "return", "transfer", "adjust", "order", "receipt", "payment", "journal", "contra", "challan"))
        return "DocumentGrid" if doc else "FormPage"
    if "[id]" in r:
        return "Detail page"
    if r.startswith(("/admin", "/gst/settings", "/finance/posting", "/me")):
        return "Settings form"
    return "ListPage"


def api_for(r: str) -> str:
    if r.startswith(("desktop:", "mobile:")):
        return "Desktop / mobile local API + /api/v1/sync/*"
    base = r.split("?")[0]
    seg = [p for p in base.split("/") if p and p not in ("new",)]
    if not seg:
        return "—"
    res = "/".join("{id}" if p == "[id]" else p for p in seg)
    if base.endswith("/new"):
        return f"POST /api/v1/{res}"
    if "[id]" in base:
        return f"GET /api/v1/{res}"
    return f"GET /api/v1/{res}?page=0&size=25&q=…"


PATTERNS = [
    ("ListPage", "Any list of records", "Title + count · search · filter pills · DataTable · pagination · primary New button", "GET list with ?page&size&sort&q → page envelope {items,page,size,totalItems,totalPages}", "Empty state with the New button; skeleton rows while loading; error banner with retry"),
    ("FormPage / FormSheet", "Create or edit a master", "Sections or tabs · RHF + Zod · sticky Save bar · dirty-state guard · field errors from Problem Details", "POST (Idempotency-Key) / PUT (If-Match) → resource; 422 with errors[] mapped to fields", "Disable Save while saving; keep form on error; toast 'Saved' on success"),
    ("DocumentGrid", "Purchase, sales, returns, transfers, adjustments", "Header (party, dates) · keyboard grid · totals panel from @meno/billing-engine · Post action", "Draft POST/PUT, then POST /{id}/post; server recomputes totals", "Show posted document read-only with number; reversals via action, never edit"),
    ("PosScreen", "Retail counter", "Search-first, F-keys, cart, payment panel, print", "Create+post in one call with client UUID; offline queue on desktop", "Never block typing; errors inline on the line; sound / focus cues"),
    ("ReportPage", "Registers and reports", "Filter bar (dates, branch, party) · summary tiles · DataTable · export", "GET with filters; large results → export job", "Totals row; export Excel / PDF as a job with status"),
    ("Dashboard", "Role home pages", "Widget grid by permission; each widget one API", "GET /api/v1/dashboard/widgets/{name}", "Each widget loads and fails independently"),
    ("Detail page", "One record", "Header + tabs (overview, history, documents, audit)", "GET /{id}; related lists paged", "Actions by permission"),
    ("Settings form", "Admin and configuration", "Grouped settings, effective date where it applies", "GET / PUT /settings/{group}; sensitive keys need approval", "Show who changed it and when"),
    ("Wizard step", "Onboarding", "One step per screen, Next saves, resume later", "PUT /onboarding/{step}", "Progress in the checklist"),
]

CONCEPTS = [
    ("Ledger", "An account that holds a running balance: Cash, Sales, Output CGST, each customer, each supplier. Every posted document adds lines to ledgers through a voucher.", "Table ledger_account (group_id, nature, system_code, party_id). Posting rules find ledgers by system_code. Party ledgers are created by the accounting module when it hears PartyChanged. Balance = Σ debit − Σ credit, never stored as an editable number."),
    ("Ledger group", "A folder of ledgers in a tree (Current Assets → Sundry Debtors). The group decides the nature: asset, liability, equity, income or expense.", "ledger_group tree; nature of a ledger must equal its group's (DB CHECK)."),
    ("Voucher", "One accounting entry with debit and credit lines that add up to the same total.", "voucher + voucher_entry; created by listeners on InvoicePosted, PurchasePosted, PaymentRecorded …; ACCOUNTING_UNBALANCED if Σ Dr ≠ Σ Cr."),
    ("Debit / credit", "Two sides of every entry. Assets and expenses grow on the debit side; liabilities, income and capital on the credit side.", "Store amount + side (DR/CR); show balances as '1,23,456.70 Dr'."),
    ("Master", "A reference record documents copy from: party, item, ledger, doctor.", "Masters are editable and audited; documents snapshot master values at post time so later edits never change old bills."),
    ("Document", "A business paper: purchase invoice, sales invoice, return, receipt, transfer.", "Status DRAFT → POSTED → (REVERSED). Only drafts change. Posted rows have no UPDATE grant."),
    ("Posting", "Making a document final. Stock moves, money is recorded, registers are written, all at once.", "The 12-step pipeline in BACKEND_IMPLEMENTATION §3, one database transaction."),
    ("Batch", "One production lot of an item with its own batch number, expiry and MRP.", "batch(item_id, batch_no, expiry, mrp, cost); stock is per batch per location."),
    ("Inventory movement", "One +/− row for every stock change, pointing to its document.", "Stock = Σ movements; stock_balance is a cache reconciled nightly. Never UPDATE quantities."),
    ("Snapshot", "Copy of master values stored on the document (party name, GSTIN, item name, HSN, GST rate, MRP).", "party_snapshot jsonb and line columns; printing and GST use the snapshot."),
    ("Tenant / company / branch", "Tenant = the customer business; company = a GSTIN; branch = a shop or warehouse.", "tenant_id on every row (RLS); branch_id on branch-owned rows; tenant comes from the token only."),
    ("Permission", "A named right like sales.invoice.post.", "@RequiresPermission on endpoints; usePermission() hides UI; never check role names."),
    ("Idempotency key", "A client-made id that makes a retry safe: the second call returns the first result.", "Header Idempotency-Key on money / stock POSTs; POS uses the bill's clientId (UUIDv7)."),
    ("Money as strings", "Amounts travel as \"123.4500\" strings, never floats.", "Java BigDecimal; TS decimal.js; formatMoney() only for display."),
    ("Effective date", "Settings and tax rates have a start date; the document date picks the value.", "SettingsFacade.get(key, date); hsn_tax rows by valid_from."),
    ("Problem Details", "The standard error body with a code and field errors.", "RFC 9457: {type,title,status,detail,code,errors[{field,code}],requestId}; UI maps code → friendly text."),
    ("Hash chain", "Each posted record stores a fingerprint of itself and the previous one, so tampering is detectable.", "ADR-0016; columns prev_hash, hash; nightly verifier."),
    ("Engine", "The shared maths library: same results on the server and offline.", "@meno/billing-engine (TS, built, 72 vectors pass) and its Java twin (to build)."),
]

CSS = r"""
<title>MENO Developer Guide</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* Layout: engineering spec sheet — sticky chapter rail, dense field tables, request/response side by side. */
:root{--bg:#f3f6f7;--surface:#ffffff;--ink:#14202a;--muted:#566472;--line:#d8e0e5;--accent:#1f5fa8;--accent-soft:#e3edf8;--fe:#0b7566;--fe-soft:#e2f1ed;--be:#7a4a12;--be-soft:#f6ecdd;--code:#eef2f5;
--display:"Plus Jakarta Sans",ui-sans-serif,system-ui,sans-serif;--text:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;--mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#0d1318;--surface:#131b22;--ink:#e1e9ef;--muted:#98a8b6;--line:#243240;--accent:#6aa6ec;--accent-soft:#16283d;--fe:#3fc2ac;--fe-soft:#12302b;--be:#e5a85a;--be-soft:#30230f;--code:#1a242d;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0d1318;--surface:#131b22;--ink:#e1e9ef;--muted:#98a8b6;--line:#243240;--accent:#6aa6ec;--accent-soft:#16283d;--fe:#3fc2ac;--fe-soft:#12302b;--be:#e5a85a;--be-soft:#30230f;--code:#1a242d;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 var(--text);-webkit-font-smoothing:antialiased}
a{color:var(--accent)} :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wrap{display:grid;grid-template-columns:250px minmax(0,1fr);gap:36px;max-width:1320px;margin:0 auto;padding-block:26px 80px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
nav.rail{position:sticky;top:calc(env(safe-area-inset-top,0px) + 18px);align-self:start;max-height:calc(100vh - 36px);overflow:auto;font-size:13.5px}
nav.rail .brand{font:800 19px/1.2 var(--display);margin:0 0 4px} nav.rail .sub{color:var(--muted);font-size:12.5px;margin:0 0 14px}
nav.rail ol{list-style:none;margin:0;padding:0;display:grid;gap:1px} nav.rail ol ol{padding-left:14px;margin:2px 0 4px}
nav.rail a{display:block;padding:5px 8px;border-radius:6px;color:var(--ink);text-decoration:none} nav.rail a:hover{background:var(--accent-soft)}
nav.rail a.on{background:var(--accent-soft);color:var(--accent);font-weight:600} nav.rail a.on-parent{color:var(--accent);font-weight:600}
main{min-width:0}
h1{font:800 clamp(28px,4.5vw,40px)/1.1 var(--display);letter-spacing:-.02em;margin:8px 0 10px;text-wrap:balance}
h2{font:700 24px/1.2 var(--display);margin:0 0 8px} h3{font:700 19px/1.3 var(--display);margin:0 0 6px} h4{font:700 14px/1.3 var(--display);margin:18px 0 6px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
section.ch{padding:38px 0 6px;border-bottom:1px solid var(--line);scroll-margin-top:12px}
.lead{font-size:17px;color:var(--muted);max-width:72ch} p,li{max-width:80ch}
.eyebrow{font:600 12px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.tbl{overflow-x:auto;border:1px solid var(--line);border-radius:9px;background:var(--surface);margin:10px 0}
table{border-collapse:collapse;width:100%;font-size:13.5px} th,td{text-align:left;padding:8px 11px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-weight:600;color:var(--muted);font-size:12.5px;background:var(--code);white-space:nowrap} tr:last-child td{border-bottom:0}
code,.mono{font-family:var(--mono);font-size:.88em} code{background:var(--code);padding:1px 5px;border-radius:4px;word-break:break-word}
pre{background:var(--code);border:1px solid var(--line);border-radius:9px;padding:12px 14px;overflow-x:auto;font:12.5px/1.5 var(--mono);margin:8px 0;max-height:460px}
.pill{display:inline-block;font:600 10.5px/1.6 var(--mono);padding:0 6px;border-radius:999px;background:var(--code);color:var(--muted);white-space:nowrap}
.pill.ro{background:var(--accent-soft);color:var(--accent)} .pill.m{background:var(--accent-soft);color:var(--accent)}
article.spec{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px;margin:18px 0;scroll-margin-top:12px}
.meta{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:13px;color:var(--muted);margin:8px 0} .meta b{color:var(--ink);font-weight:600;margin-right:4px}
.small{font-size:13px;color:var(--muted)}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px} .two>div{min-width:0}
.box{border-radius:10px;padding:4px 14px 10px} .box.fe{background:var(--fe-soft)} .box.be{background:var(--be-soft)} .box.fe h4{color:var(--fe)} .box.be h4{color:var(--be)}
.concepts{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}
.concepts .c{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px;min-width:0}
.concepts .c b{font-family:var(--display);font-size:16px;display:block;margin-bottom:4px} .concepts .c .code{font-size:13px;color:var(--muted);margin-top:6px}
.search{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0} input,select{font:14px var(--mono);padding:7px 9px;border:1px solid var(--line);border-radius:7px;background:var(--surface);color:var(--ink)} .search input{flex:1 1 220px}
.count{font-size:13px;color:var(--muted)}
.flowline{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font:12.5px var(--mono)} .flowline span{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:4px 8px} .flowline i{font-style:normal;color:var(--muted)}
.menu-btn{display:none}
@media (max-width:960px){.wrap{grid-template-columns:minmax(0,1fr);gap:0} nav.rail{position:static;max-height:none;border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:6px} nav.rail>ol{display:none} nav.rail.open>ol{display:grid}
.menu-btn{display:inline-block;font:600 13px var(--text);padding:6px 12px;border-radius:7px;border:1px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer}}
</style>
"""

flow = '<div class="flowline">' + "<i>→</i>".join(f"<span>{E(x)}</span>" for x in ["Nginx / WAF", "RequestId", "JWT auth", "Tenant + RLS", "Idempotency", "@RequiresPermission", "@Valid DTO", "Controller", "Service @Transactional", "Domain rules", "Engine", "Repositories + facades", "Events (outbox)", "Audit", "Response / Problem Details"]) + "</div>"

concepts_html = '<div class="concepts">' + "".join(f'<div class="c"><b>{E(t)}</b>{E(a)}<div class="code">In code: {E(b)}</div></div>' for t, a, b in CONCEPTS) + "</div>"
patterns_html = table(["Pattern", "Used for", "Layout", "API", "States"], [[f"<b>{E(a)}</b>", E(b), E(c), E(d), E(e)] for a, b, c, d, e in PATTERNS])
screens_nav = "".join(f'<li><a href="#screen-{s["id"]}">{E(s["title"])}</a></li>' for s in SCREENS)
screens_html = "".join(screen_html(s) for s in SCREENS)

api_conv = table(["Topic", "Rule"], [
    ["Base path", "<code>/api/v1</code>, JSON UTF-8, plural kebab-case resources; actions as sub-resources (<code>POST /sales-invoices/{id}/post</code>)"],
    ["Auth", "Web: HttpOnly cookie <code>meno_at</code> + CSRF header; desktop: <code>Authorization: Bearer</code>"],
    ["Branch", "<code>X-Branch-Id</code> header, validated against the user's branches"],
    ["Create / post money or stock", "<code>Idempotency-Key</code> header (UUID); replay returns the original with <code>Idempotent-Replayed: true</code>"],
    ["Update", "<code>If-Match: &lt;version&gt;</code>; stale → 409 <code>COMMON_VERSION_CONFLICT</code>"],
    ["Lists", "<code>?page=0&amp;size=25&amp;sort=docDate,desc&amp;q=</code> → <code>{items,page,size,totalItems,totalPages}</code>, size ≤ 200"],
    ["Money / qty", "Strings with up to 4 decimals (<code>\"123.4500\"</code>); never JSON numbers"],
    ["Dates", "<code>yyyy-MM-dd</code>; timestamps ISO-8601 UTC; display in IST"],
    ["Errors", "RFC 9457 Problem Details with <code>code</code> = <code>MODULE_REASON</code> and <code>errors[]</code> per field; 404 for other tenants' ids"],
    ["Options", "Every dropdown comes from the API (<code>/api/v1/options/{list}</code> or its master); never hard-coded"],
    ["Types", "Frontend never hand-writes request types: <code>packages/api-client</code> is generated from <code>contracts/openapi/meno-api.yaml</code>"]])

fe_conv = table(["Topic", "Rule"], [
    ["Where code goes", "<code>apps/web/src/features/&lt;area&gt;/</code> with <code>components/</code>, <code>queries.ts</code>, <code>schema.ts</code>; routes stay thin"],
    ["Server data", "TanStack Query hooks only (<code>useSuppliers</code>, <code>usePostInvoice</code>); no <code>useEffect</code> fetching, no copies in state"],
    ["Forms", "React Hook Form + Zod from <code>@meno/validation</code>; map Problem Details <code>errors[]</code> to fields"],
    ["Money maths in UI", "<code>@meno/billing-engine</code> for live totals; <code>formatMoney</code> for display (Indian grouping, 2 dp)"],
    ["Design", "Tokens only (no raw hex, no <code>bg-white</code>), shadcn from <code>@meno/ui</code>, lucide icons, light/dark, 1280 px and 375 px"],
    ["Keyboard", "POS and grids fully keyboard-operable; shortcuts from the registry, never <code>if (e.key === 'F9')</code>"],
    ["Permissions", "<code>usePermission('sales.invoice.post')</code> hides or disables actions; the server still checks"],
    ["States", "Every screen: loading skeleton, empty state with next action, error with retry, success toast"],
    ["Offline (desktop)", "Datasource switch online / local; offline bills carry client UUIDs and are signed by the device"]])

be_conv = table(["Topic", "Rule"], [
    ["Package", "<code>com.setupsworks.meno.modules.&lt;module&gt;.{api,web,service,domain,repository,mapper}</code>; other modules only via <code>api</code>"],
    ["Controller", "Thin: <code>@Valid</code> record DTO → one service call → map to response"],
    ["Service", "<code>@Transactional</code> per use case; permission check; settings by date; domain rules; engine; facades; events; audit"],
    ["Validation", "Bean Validation (<code>@Gstin @Pan @Hsn @IndianPhone @PinCode</code>) + domain rules (<code>BusinessRuleViolation(code)</code>) + DB constraints"],
    ["Money", "<code>BigDecimal</code>, HALF_UP, 4-dp intermediates; Java engine passes <code>contracts/test-vectors</code>"],
    ["Stock", "Only via <code>StockFacade</code> (movements); never UPDATE quantities"],
    ["Posted docs", "Immutable; reversal documents; hash chain (ADR-0016)"],
    ["Migrations", "New Flyway file each time; RLS + tenant index + audit columns + version"],
    ["Tests", "Unit, integration (Testcontainers) incl. cross-tenant, Modulith, scenario, vectors"]])

all_pages_js = json.dumps([[p["name"], p["route"], p["what"], p["ids"], p["phase"], p["fe"], p["be"], p["roles"], p["section"], pattern_for(p["route"], p["name"]), api_for(p["route"]), SPEC_BY_ROUTE.get(p["route"].split("?")[0], "")] for p in pages], ensure_ascii=False, separators=(",", ":"))

CH = [
    ("start", "Start here", f"""<p class="lead">This guide tells frontend and backend developers exactly what to build for each MENO screen: the fields, why each one exists, the API request and response, the errors, and who builds which side. Read chapters 1–4 once, then jump to the screen you are building.</p>
{table(["If you are…", "Read"], [["New to pharmacy", "Chapter 1 concepts (and the Learning guide in Hub → Learn)"], ["Frontend developer", "Chapters 2, 3 (frontend part), 4 patterns, then your screen in 5 and the page list in 6"], ["Backend developer", "Chapters 2, 3 (API and backend part), 5 field specs, then docs/architecture/BACKEND_IMPLEMENTATION.md"], ["QA", "Chapter 5 rules and errors are your test cases; contracts/test-vectors for maths"]])}
<p class="small">Sources of truth: docs/product/MASTER_FIELDS.md, DOCUMENT_FIELDS.md, PAGES.md; docs/architecture/BACKEND_IMPLEMENTATION.md, CALCULATIONS.md, VALIDATION_AND_BUSINESS_RULES.md; docs/api/API_GUIDELINES.md. If this guide and those disagree, those win.</p>"""),
    ("concepts", "Concepts every developer needs", f"""<p class="lead">What the words mean in the business, and what they mean in code.</p>{concepts_html}"""),
    ("architecture", "How a request flows", f"""<p>One backend (Spring Boot modular monolith), one web app (static Next.js SPA) reused inside the Electron desktop app. Every write follows this path:</p>{flow}
<p>Money and stock documents then go through the 12-step posting pipeline (snapshot → engine → number → stock → posted + hash → event → audit) in one transaction.</p>"""),
    ("conventions", "Conventions", f"<h3>API</h3>{api_conv}<h3>Frontend</h3>{fe_conv}<h3>Backend</h3>{be_conv}"),
    ("patterns", "Page patterns", f"<p>Build each pattern once in P1 and reuse it. Every page in chapter 6 names its pattern.</p>{patterns_html}"),
    ("screens", "Core screens: every field", f"""<p class="lead">Full specs for the screens every other page depends on. Each lists the fields by tab or section, the request and response JSON, the errors and the work on each side. Fields marked <span class="pill ro">server</span> are returned by the API and never sent.</p>{screens_html}"""),
    ("pages", "Every page", """<p class="lead">All pages from PAGES.md with their pattern, the main API call derived from the route, owners and features. Pages with a full spec link to it.</p>
<div class="search"><input id="q" type="search" placeholder="Search: route, name, feature ID" aria-label="Search pages"><select id="sec" aria-label="Section"><option value="">All sections</option></select><select id="pat" aria-label="Pattern"><option value="">All patterns</option></select><select id="own" aria-label="Frontend owner"><option value="">Any frontend owner</option></select></div>
<div class="count" id="count"></div>
<div class="tbl"><table><thead><tr><th>Page</th><th>Route · pattern</th><th>Main API call</th><th>Features · phase</th><th>Owners (FE / BE)</th></tr></thead><tbody id="rows"></tbody></table></div>"""),
    ("checklist", "Definition of done for a page", table(["Frontend", "Backend"], [
        ["Route + nav entry match NAVIGATION.md", "Endpoint(s) with OpenAPI annotations; api-client regenerated"],
        ["Zod schema from @meno/validation; all rules in chapter 5", "Bean Validation + domain rules + DB constraints for the same rules"],
        ["Loading, empty, error, success states", "Problem Details with codes listed in the module AGENTS.md"],
        ["Permission-gated actions", "@RequiresPermission + cross-tenant test"],
        ["Keyboard operable; 1280 px and 375 px; light and dark", "Idempotency on money / stock POSTs; If-Match on updates"],
        ["Money via billing-engine / formatMoney; no JS numbers", "BigDecimal; vectors pass; audit on every write"],
        ["Unit tests for utils; e2e for the main path (QA)", "Unit + integration + scenario tests; migration with RLS"]])),
]

nav = "<ol>" + "".join(f'<li><a href="#{cid}">{i}. {E(t)}</a>' + (f"<ol>{screens_nav}</ol>" if cid == "screens" else "") + "</li>" for i, (cid, t, _) in enumerate(CH)) + "</ol>"
body = "".join(f'<section class="ch" id="{cid}"><div class="eyebrow">Chapter {i}</div><h2>{E(t)}</h2>{c}</section>' for i, (cid, t, c) in enumerate(CH))

JS = r"""<script>
try { const th=new URLSearchParams(location.search).get('theme'); if(th==='dark'||th==='light') document.documentElement.dataset.theme=th; } catch(e) {}
const P = __PAGES__;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fill=(id,vals)=>{const s=document.getElementById(id);[...new Set(vals)].sort().forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;s.appendChild(o);});};
fill('sec',P.map(p=>p[8])); fill('pat',P.map(p=>p[9])); fill('own',P.map(p=>p[5]));
const v=id=>document.getElementById(id).value;
function render(){ const q=v('q').toLowerCase(), s=v('sec'), pt=v('pat'), o=v('own');
  const r=P.filter(p=>(!s||p[8]===s)&&(!pt||p[9]===pt)&&(!o||p[5]===o)&&(p[0]+' '+p[1]+' '+p[2]+' '+p[3]).toLowerCase().includes(q));
  document.getElementById('rows').innerHTML=r.map(p=>'<tr><td><b>'+esc(p[0])+'</b>'+(p[11]?' <a href="#screen-'+p[11]+'">full spec</a>':'')+'<div class="count">'+esc(p[2])+'</div></td><td><code>'+esc(p[1])+'</code><div class="count">'+esc(p[9])+'</div></td><td class="mono">'+esc(p[10])+'</td><td class="mono">'+esc(p[3])+'<div class="count">'+esc(p[4])+' · roles '+esc(p[7])+'</div></td><td>'+esc(p[5])+' / '+esc(p[6])+'</td></tr>').join('');
  document.getElementById('count').textContent=r.length+' of '+P.length+' pages'; }
['q','sec','pat','own'].forEach(id=>document.getElementById(id).addEventListener('input',render)); render();
// Scroll-spy: highlight the chapter / screen in view in the rail and keep it visible there.
const links=[...document.querySelectorAll('nav.rail a[href^="#"]')];
const targets=links.map(a=>[a,document.getElementById(a.getAttribute('href').slice(1))]).filter(x=>x[1]);
let current=null;
function spyNow(){ let hit=null; const line=innerHeight*0.25;
  // Rail links are in page order, so the last one whose target has scrolled past the line is the one in view.
  for(const x of targets){ if(x[1].getBoundingClientRect().top<=line) hit=x; }
  if(innerHeight+scrollY>=document.documentElement.scrollHeight-4) hit=targets[targets.length-1];
  hit=hit||targets[0]; if(hit[0]===current) return; current=hit[0];
  links.forEach(l=>l.classList.remove('on','on-parent')); current.classList.add('on');
  const parent=current.closest('ol').closest('li'); if(parent&&parent.firstElementChild!==current) parent.firstElementChild.classList.add('on-parent');
  const rail=document.querySelector('nav.rail'), r=current.getBoundingClientRect(), rr=rail.getBoundingClientRect();
  if(r.top<rr.top+40||r.bottom>rr.bottom-40) rail.scrollTop+=r.top-rr.top-rr.height/3; }
addEventListener('scroll',()=>requestAnimationFrame(spyNow),{passive:true}); addEventListener('resize',spyNow); spyNow();
document.getElementById('menu').addEventListener('click',()=>{const n=document.querySelector('nav.rail');n.classList.toggle('open');document.getElementById('menu').setAttribute('aria-expanded',n.classList.contains('open'));});
</script>"""

PAGE = CSS + f"""<div class="wrap"><nav class="rail" aria-label="Chapters"><p class="brand">MENO Developer Guide</p><p class="sub">Fields, APIs and screens</p><button class="menu-btn" id="menu" aria-expanded="false">Chapters</button>{nav}</nav>
<main><div class="eyebrow">Frontend + backend</div><h1>What to build on every MENO screen</h1>
<p class="lead">{len(SCREENS)} core screens specified field by field with request and response JSON, {len(CONCEPTS)} concepts explained for code, {len(PATTERNS)} page patterns, and all {len(pages)} pages with their pattern, API and owners.</p>
{body}</main></div>""" + JS.replace("__PAGES__", all_pages_js)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(PAGE)
HUB.parent.mkdir(parents=True, exist_ok=True)
HUB.write_text('<!doctype html>\n<html lang="en">\n' + PAGE + "\n</html>\n")
print(f"wrote {OUT.relative_to(ROOT)} ({len(PAGE)//1024} KB): {len(SCREENS)} screens, {len(pages)} pages, {len(CONCEPTS)} concepts")
