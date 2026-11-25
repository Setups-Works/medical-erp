# Master fields: supplier, customer and product

> Live demo of these forms: MENO Hub → Learn → Day 21.
>
> Field-by-field specification of the three busiest master screens. Every field lists its tab, type, where its options come from, whether it is required, and the feature that builds it. Validation patterns: [VALIDATION_AND_BUSINESS_RULES.md](../architecture/VALIDATION_AND_BUSINESS_RULES.md) §4. Tables: [DATA_MODEL.md](../database/DATA_MODEL.md) § party, § catalog. Masters overview: [MASTERS.md](MASTERS.md).
>
> Origin: on 24-11-2026 the team compared MENO's plan with the vendor, customer and product screens of a general-purpose Indian ERP. Everything useful for a pharmacy was added here and to [FEATURES.md](FEATURES.md) §24; fields that only make sense for apparel or engineering goods are listed as "not for MENO" with the reason. Pharmacy fields that general ERPs lack (drug licences, schedule, salt, storage) are added on top.
> Owners: Kamesh (`party`, `catalog` backend), Ashok (master screens), Nitheesh (accounting, TDS/MSME), Prakalya (FRS + acceptance tests). ⚠ rows need CA or pharmacist confirmation before they ship.

**Legend.** Status: **Plan** = already in FEATURES.md (ID given) · **New** = added in §24 · **No** = not for MENO. Required: **Y** = always, **C** = conditional (rule in the notes), blank = optional. Options "API" = from a configuration table / master, never hard-coded (rule 13).

## 0. Screen layout (all three masters)

- Tabs across the top; `Ctrl+→` / `Ctrl+←` move between tabs; `Ctrl+S` saves from any tab; `Esc` cancels with an unsaved-changes prompt.
- A tab with an error shows a red dot; saving jumps to the first error.
- **Save** stays disabled until the required fields of every tab are valid; the server validates again (four layers).
- Lists (contacts, addresses, bank accounts) are repeatable cards with **+ Add**; exactly one is marked **Primary**.
- Tab order for parties: **Books · Licences · Bank · Income tax · GST · Others**. For products: **Details · Pharmacy · Pricing & tax · Stock & warehouse**.

## 1. Supplier (vendor) — `/masters/suppliers/new`

### 1.1 Books

| Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|
| GSTIN + **Fetch** button | 15 chars | C | Required when GST type = Regular / Composition. Fetch fills legal name, trade name, state, address and GST status from the GST verification service ⚠ (GSP/API provider and cost to confirm). Field map, checks and errors: [GSTIN_FETCH.md](GSTIN_FETCH.md) | Plan PTY-01 · **New PTY-15** (fetch) |
| Vendor name | text 1–200 | Y | Duplicate check, case-insensitive | Plan PTY-01 |
| Print name | text | | Printed on documents; defaults to vendor name | **New PTY-16** |
| Vendor code | text | | Auto from number series if blank; unique | **New PTY-16** |
| Vendor type | API: Manufacturer, Distributor, Stockist, C&F agent, Super stockist, Other | | Drives reports and default terms | **New PTY-16** |
| Vendor group | API (party group master) | | Group-level defaults (credit, discount) | Plan PTY-12 (extended to suppliers) |
| Contacts (repeatable) | type (Primary/Accounts/Orders/Sales rep), contact person, designation, email, mobile, office no. | Y (one) | One primary contact; mobile 10 digits 6–9; email RFC | **New PTY-17** |
| Addresses (repeatable) | type (Billing/Shipping/Godown), name, line 1, line 2, PIN, state, district, city | Y (one billing) | PIN (6 digits) auto-fills state, district, city from the PIN master; state must match GSTIN state | **New PTY-18** |

### 1.2 Licences (pharmacy, not in general ERPs)

| Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|
| Drug licence nos. (repeatable) | form (20B, 21B, 20, 21, 20C, 21C…) API, number, valid from, valid to, scan upload | Y for pharma suppliers | Expiry warnings 30/15/7 days; purchase from a supplier whose licence has expired is blocked ⚠ | Plan PTY-01, PTY-04 · **New PTY-19** (per-form rows + scan) |
| FSSAI licence no. + expiry | 14 digits | C | Only when the supplier sells food/nutraceuticals | **New PTY-19** |
| Narcotic (NDPS) licence no. | text | C | Only for NDPS items ⚠ | **New PTY-19** |

### 1.3 Bank

| Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|
| Add bank account? | toggle | | Recommended for suppliers | **New PTY-20** |
| Bank accounts (repeatable) | type (Primary/Other), bank name, account holder, account no. (twice to confirm), IFSC, branch, UPI ID | C | IFSC `^[A-Z]{4}0[A-Z0-9]{6}$`, bank/branch auto-filled from IFSC; account no. masked in lists and stored encrypted; change of bank details needs approval and is audited (fraud control) | Plan PTY-01 (single) · **New PTY-20** |
| Payment reminders | toggle; schedule: N days before due, on due date, custom; channels: email, WhatsApp, SMS | | For suppliers: reminds **us** to pay. Due date = bill date + credit days | **New PTY-21** |

### 1.4 Income tax

| Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|
| PAN | 10 chars | C | Must equal GSTIN chars 3–12 when both exist; required when TDS applies | Plan (validation) · **New PTY-22** |
| Related party? | toggle | | Related-party transaction report for audit | **New PTY-22** |
| MSME registered? | API: Not applicable, Micro, Small, Medium; Udyam no. `UDYAM-XX-00-0000000`; certificate upload | Y (choice) | Micro/small suppliers: payment due within the agreed days, at most the statutory limit; overdue MSME payables report ⚠ CA to confirm limit and tax effect | **New PTY-23** |
| TDS applicable? | toggle + section (API, e.g. 194Q purchase of goods) | | Section, rate and threshold come from `tds_section` (ACX-06), effective-dated; TDS is computed on the payment/purchase voucher ⚠ | Plan ACX-06 · **New PTY-22** (per-party flag) |

### 1.5 GST

| Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|
| GST registration type | API: Regular, Composition, Unregistered, SEZ, Overseas | Y | Composition/unregistered → no input tax credit on their bills; drives GSTR-2B matching | **New PTY-24** |
| GST status | Active / Cancelled / Suspended (read-only, from Fetch) | | Cancelled GSTIN warns at purchase entry | **New PTY-15** |
| Rates on their bills | API: Exclusive of GST (rate + tax), Inclusive | | Default for purchase entry; can be changed per bill | **New PTY-24** |
| Place of supply / state | from address | Y | CGST+SGST vs IGST | Plan GST-11 |

### 1.6 Others

| Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|
| Also a customer (used for sales and purchase) | toggle | | One party, one ledger, both roles (e.g. a distributor we also sell to); outstanding nets off ⚠ CA | **New PTY-25** |
| Transporter, transport mode, vehicle type | API (transporter master) | | Default for e-way bill and GRN | **New PTY-26** |
| Discount % / cash discount % / special discount % | 0–100 | | Defaults copied to purchase entry; order of application PRC-05 ⚠ | Plan PRC-05 · **New PTY-27** (party defaults) |
| Agent + commission % | API (agent master) | | Commission report | **New PTY-28** |
| Credit limit ₹, credit days | money, 0–365 | | Credit days default 30; warn above MSME limit for MSME suppliers ⚠ | Plan PTY-01, PTY-07 |
| Interest on overdue % + basis | %, API: simple 365 days / simple 360 / compound monthly | | Interest calculation report and optional interest debit note | **New PTY-29** |
| Default terms & conditions | API (terms master) | | Printed on purchase orders | Plan DOC-05 |
| Opening balance + Dr/Cr | money | | One line of the opening trial balance | Plan PTY-10 |
| Active | toggle | Y | Deactivate instead of delete once used | Plan (master rule) |
| Ledger (read-only) | auto under Sundry Creditors | | Created on save | Plan ACX-16 |

## 2. Customer — `/masters/customers/new`

Same tabs as the supplier. Differences only:

> **Walk-in customers are not master records.** A walk-in bill keeps the buyer's name and phone (if given) on the bill itself (POS-30, DOCUMENT_FIELDS §2). The cashier can tick "Save as customer" to create a Retail (person) customer from those details; the customer list can show repeat walk-in mobiles to convert. The POS can also add or edit a retail customer directly (POS-31); it writes to this same master, with the Books, Patient and Others fields it shows, and the rest is completed here.

| Tab | Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|---|
| Books | Customer type | API: Retail (person), Retailer (pharmacy), Hospital, Clinic, Institution, Doctor | Y | Type decides required fields: a retailer needs GSTIN (if registered) and drug licence; a person needs only a phone | Plan PTY-02, PTY-03 · **New PTY-16** |
| Books | Customer group | API | | Price list, discount and credit defaults | Plan PTY-12 |
| **Patient** (retail only) | age or date of birth, gender, allergies, chronic conditions, regular doctor, ABHA no. ⚠ | | Health data: shown only to roles with the permission, never in logs; consent recorded | Plan PTY-02 · **New PTY-30** |
| Licences | Drug licence nos. + expiry | C | Required for Retailer type; sale blocked after expiry ⚠ | Plan PTY-03, PTY-04 |
| Bank | Bank account | | Optional (refunds, cheque collection) | **New PTY-20** |
| Bank | Payment reminders | schedule + channels | | Reminds the **customer** to pay; uses notification templates (NTF) | Plan ACC-09 · **New PTY-21** |
| Income tax | TCS applicable? | toggle + section | | Only if a TCS section applies ⚠ | Plan ACX-06 |
| Others | Salesman + commission %, route | API | | Wholesale field sales | Plan PTY-03, WHS-09 · **New PTY-28** |
| Others | Price list | API | | Rate level A/B/C | Plan PRC-02 |
| Others | Credit limit, credit days, interest on overdue | | | Enforced at billing with approval (PTY-07) | Plan PTY-07 · **New PTY-29** |
| Others | Loyalty / membership no. | | | | Plan PTY-08 |
| Ledger | auto under Sundry Debtors | | | | Plan ACX-16 |

## 3. Product (medicine) — `/masters/items/new`

### 3.1 Details

| Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|
| Product code | text | | Auto from series if blank; unique | **New CAT-25** |
| Product name | text 1–200 | Y | Duplicate check | Plan CAT-01 |
| Print name | text | | Defaults to product name; shorter name for thermal bills | **New CAT-25** |
| Image | jpg/png ≤ 1 MB | | | Plan CAT-13 |
| Department | API: Pharma, OTC, Surgical, FMCG, Cosmetics, Ayurveda, Veterinary | | Non-pharma items keep their own GST | Plan CAT-14 · **New CAT-25** |
| Brand, manufacturer, marketed by | API | Y (manufacturer for pharma) | | Plan CAT-01, CAT-16 |
| Category / sub-category, therapeutic class / sub-class | API (tree) | | Category drives reports and discount rules | Plan CAT-06 · **New CAT-25** (2-level tree) |
| Unit of measure + conversion | API: box → strip → tablet | Y | Loose sale uses the conversion | Plan CAT-17, CAT-05 |
| Bundle / kit | API | | Kits (e.g. dressing kit) sold as one line, stock from components | **New CAT-26** |
| Nature of product | API: Finished goods, Consumable, Service, Asset | Y | Services have no stock | **New CAT-25** |
| Expiry tracked + shelf life (months) | toggle + number | Y for pharma | Batch expiry is entered at purchase; shelf life helps check it | Plan (batch) · **New CAT-25** |
| Warranty period | number + unit | | Only for devices (BP monitors, glucometers) | **New CAT-25** |
| Barcode enabled, batch enabled, active | toggles | | Pharma items are always batch-enabled (cannot be switched off) | Plan CAT-04 · **New CAT-25** |
| Remarks | text | | | **New CAT-25** |
| Size group, colour | | | **No**: apparel variants; a pharmacy uses pack size (Pharmacy tab) instead | No |

### 3.2 Pharmacy (not in general ERPs)

| Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|
| Composition (salts + strength) | API (salt master), repeatable | Y for pharma | Enables substitutes | Plan CAT-01, CAT-15 |
| Dosage form, pack (1×10, 100 ml) | API | Y | | Plan CAT-01 |
| Schedule + Rx required | API: OTC, H, H1, X, G, NDPS | Y | Drives F4 prescription check | Plan CAT-03 |
| Storage condition / cold chain | API | | Cold-chain items flagged at GRN | Plan CAT-06 |
| Banned / recalled flag | read-only from list | | Blocks sale and purchase ⚠ | Plan CAT-12 |
| Rack location (per branch) | text | | | Plan CAT-07 |
| Substitutes | auto by composition | | | Plan CAT-09 |

### 3.3 Pricing & tax

| Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|
| HSN code → GST % | API (`hsn_tax`, effective-dated) | Y | GST % is shown, never typed | Plan CAT-02 |
| Cess % | from HSN | | | Plan CAT-02 |
| Price-slab GST | toggle | | **No** for medicines (one rate per HSN); kept off; only if a non-pharma HSN needs it ⚠ | No |
| MRP (default) | money | C | MRP per batch is set at purchase; this is the default for new batches | Plan PRC-01 |
| Discount received % | 0–100 | | Usual supplier discount | **New PRC-12** |
| Purchase rate / PTR / PTS | money | | Suggested = MRP ÷ (1 + GST %) × (1 − discount received %) ⚠ trade convention; the supplier's bill always wins | Plan PRC-01 |
| Landing cost | read-only | | Purchase rate + non-claimable tax + freight share − free goods (CALCULATIONS.md) | Plan PUR-06 |
| Sales price | money ≤ MRP | | | Plan PRC-01, PRC-08 |
| Discount allowed % / maximum discount % | 0–100 | | Item cap on top of the role cap; the lower one wins | Plan PRC-06 · **New PRC-12** |
| Minimum / maximum mark-up % | % | | Warn when a sale goes below cost + min mark-up; block below cost ⚠ policy | **New PRC-13** |
| Product commission % | % | | Salesman incentive per item | **New PRC-13** |

### 3.4 Stock & warehouse

| Field | Type / options | Req. | Notes and rule | Status |
|---|---|---|---|---|
| Min / max / reorder quantity (per branch) | number | | Low-stock alerts, purchase suggestions | Plan CAT-08 |
| Lead time (days) | number | | Used by reorder suggestions | Plan PUR-11 · **New CAT-27** (field on item) |
| Default in-warehouse (purchase, sales return) / out-warehouse (sale, purchase return) | API (warehouse) | | Only when multi-warehouse is on | Plan MKT-06 · **New CAT-27** |
| Preferred vendor(s) | API (supplier), ranked | | First choice in purchase orders and reorder | **New CAT-27** |

## 4. Shared reference data needed

| Data | Used by | Source | Feature |
|---|---|---|---|
| PIN code → state, district, city | addresses | India Post PIN directory (open data) loaded as reference data, yearly refresh ⚠ licence check | **New PLT-22** |
| IFSC → bank, branch | bank accounts | RBI IFSC list (open data), monthly refresh ⚠ | **New PLT-22** |
| GSTIN verification | Fetch button | GSP / GST API provider ⚠ cost and terms; candidate and spec in [GSTIN_FETCH.md](GSTIN_FETCH.md) | **New PTY-15**, INT-17 |
| Party type, group, transporter, agent, terms, MSME category, GST registration type | parties | configuration masters | **New PTY-16, PTY-26, PTY-28** |

## 5. Rules that apply to every new field

1. Options come from the API (rule 13); no enums in the UI.
2. Bank account numbers, PAN and health data are sensitive: masked in lists, never logged, export needs a permission.
3. Every field change is audited with before/after (rule 10). Bank-detail changes need approval (maker-checker).
4. Documents **snapshot** the party and product values they use (rule 6); editing a master never changes a posted bill.
5. Import/export (PLT-16, PLT-17) gains a column for each new field.
