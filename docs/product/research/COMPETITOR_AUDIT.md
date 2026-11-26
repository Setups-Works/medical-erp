# Competitor feature audit: Marg ERP, VarthagamSoft and others (24-11-2026)

> Owner: Nitheesh · Research: Prakalya to confirm with pharmacy visits · Result: [FEATURES.md](../FEATURES.md) §27 (21 new features), §29 (19 more after the five-product pass) and §30 (6 from the Ekagraha codebase review), new pages in [PAGES.md](../PAGES.md), tasks in MENO Hub.

## 1. What was compared

| Product | Edition(s) looked at | Source quality |
|---|---|---|
| **VarthagamSoft** | Retail pharmacy; pharma wholesale & distribution; add-on apps (Smart Rep, Web Order, Smart Retailer, Item Checker, Business Now) | Vendor product and pricing pages (marketing) |
| **Marg ERP 9+** | Pharmacy retail; pharma distribution (Basic / Silver / Gold) | Third-party listing (SoftwareSuggest) and a competitor comparison; Marg's own pages could not be fetched (certificate error) — treat as indicative |
| eVitalRx, GoFrugal, Medeil, Vyapar, Accountune | Retail pharmacy | One competitor-written comparison (Accountune) |
| eVitalRx (earlier, 22-11-2026) | Retail pharmacy | Already audited → FEATURES §22 |

Vendor claims are not verified. Before a feature is built, Prakalya checks it with at least one pharmacy that uses the product.

## 2. Coverage summary

| Area | Their features | MENO before this audit | Gap closed by |
|---|---|---|---|
| Counter billing (barcode, FEFO, split payment, shift close, WhatsApp bill, offline) | All | Planned (POS-01…POS-28, DSK-02) | — |
| Batch / expiry (30/60/90 reports, expiry returns, replacement, credit notes) | All | Planned (INV-03…05, RET-04/05/07) | — |
| Schemes, buy-X-get-Y, loyalty, offers | All | Planned (PRC-04/10, CRM-04/05) | — |
| Multi-branch, branch transfer, uniform pricing | All | Planned (PLT-03, INV-08, PRC-02) | — |
| Accounts (vouchers, day book, BRS auto from statement, final accounts) | All | Planned (ACC, ACX) | — |
| GST, e-invoice auto upload, e-way bill | All | Planned (GST, WHS-06/07) | — |
| **Cheque book, cheque leaf printing, cheque number tracking** | Varthagam Standard | Only PDC tracking | ACC-16 |
| **Discontinued item blocking** across purchase / sale / returns | Varthagam | Missing | CAT-28 |
| **Master bulk update** | Varthagam Standard | Missing (import only) | PLT-25 |
| **Merge several POs into one purchase / challan** | Varthagam | Missing | PUR-19 |
| **Stock & sales statement (secondary sales) to companies** | Marg ("secondary stock") | Missing | WHS-17 |
| **Sub-stockist accounting** | Marg | Missing | WHS-18 |
| **Item checker / dispatch checking by scan** | Varthagam Item Checker | Missing | WHS-19 |
| **Packing slip, parcel register, LR update, acknowledgement report** | Varthagam Standard | Partly (WHS-05, WHS-16) | WHS-20 |
| **Collection tagging (bills assigned to collectors)** | Marg | Missing | WHS-21 |
| **Area / route / salesman-wise and age-wise outstanding** | Both | Partly (RPT-07) | RPT-17 |
| **Exception / bill-audit report** (edited, cancelled, back-dated, reprinted, below cost) | Varthagam "audit transaction report", Marg "bill audit" | Only the raw audit log (PLT-12) | RPT-18 |
| **Staff performance** (sales, bills, discounts, returns by user / salesman / outlet) | Varthagam Business Now | Partly (DSH-03) | ANX-08 |
| **Print formats: laser, dot-matrix pre-printed, thermal** | Varthagam | Partly (POS-10, DOC-05) | DOC-08 |
| **Dosage / prescription labels** | Varthagam (label printing) | Only barcode labels (INV-15) | INV-21 |
| **Migration from Marg, Tally, Busy, Vyapar exports** | Accountune, Varthagam (offered) | Generic import only (PLT-16) | PLT-26 |
| **Read-only CA access** | Accountune | Auditor role exists, no invite flow | PLT-27 |
| **Multi-firm billing at one counter** | Marg Silver, Varthagam Standard | Multi-company exists (PLT-02), no per-bill firm choice | POS-29 |
| **GST rate change roll-over** | All vendors re-released for "GST 2.0" (Sept 2025) | Rates are effective-dated, but no roll-out tool | GST-15 |
| **Quick-billing Android app with Bluetooth printer** | Varthagam | Mobile deferred | MOB-06 |
| **Hospital / IP pharmacy (ward indent and supply)** | Medeil, Varthagam clinical edition | Only HMIS integration (INT-09) | INT-14 |
| **Owner daily digest** (bills, stock, sales auto-mailed) | Varthagam Starter | Scheduled reports only (RPT-11) | NTF-07 |
| **Retailer app usable by non-customers of the software** | Varthagam Smart Retailer | Planned as MKT-03 / WHS-10 | — |

## 3. Things MENO already does that these products don't advertise

Offline desktop with safe sync and conflict handling (not just "works offline"), GST maths shared by server and offline client with test vectors, ledger-based stock (no direct edits), tenant isolation, effective-dated configuration (no hard-coded rates), maker-checker on bank-detail changes, NPPA ceiling check, patient safety warnings, statutory registers generated from sales.

## 4. Finding: GST rate rationalisation (Sept 2025)

A comparison source states that the 12 % slab was removed from 22-09-2025 and medicines now fall under Nil, 5 % or 18 % ⚠ (not yet checked against a CBIC notification). MENO never hard-codes rates (`hsn_tax`, effective-dated), so no design change is needed. Actions:
- Illustrative examples using 12 % in CALCULATIONS.md and the Hub lessons stay valid as maths examples but are marked "illustrative rate".
- GST-15 adds the operational roll-out (bulk effective-dated change, drafts re-priced, MRP relabel prompts).
- Compliance row added: confirm the current rate list per HSN with the CA before seeding `hsn_tax`.

## 5. Sources

- VarthagamSoft retail pharmacy: https://www.varthagamsoft.com/retail/pharmacy-billing-software-for-retail-pharmacy
- VarthagamSoft pharma distribution: https://www.varthagamsoft.com/webbin/Verticals/pharma-billing-software.html
- Marg ERP 9+ distribution listing: https://www.softwaresuggest.com/marg-pharma-distribution
- Medical-store software comparison (Accountune): https://accountune.com/best-billing-software-medical-store-india
- Marg pharmacy listings (search results): https://www.softwaresuggest.com/us/marg-pharmacy, https://slashdot.org/software/p/Marg-ERP-9/

## 6. Five-product audit (second pass, 24-11-2026)

Each product's own pages were read (Marg: help-centre menus of Marg Books and a listing, because margcompusoft.com fails with a certificate error). ✓ = advertised · — = not found on the pages read (may still exist). MENO column = feature IDs.

| Area | Marg | Vyapar | eVitalRx | GoFrugal | Varthagam | MENO |
|---|---|---|---|---|---|---|
| Onboarding: trial, guided set-up, migration | ✓ demo, training | ✓ 15–30 min set-up, Excel import | ✓ 7-day trial, paid migration, remote set-up | ✓ consultant, approve data, HyperCare | ✓ 10-day trial, migration | AUT-04…15, PLT-26 |
| Clone company set-up | ✓ Clone Setup | — | — | — | — | **PLT-31** |
| Custom fields | — | ✓ item / party additional fields | — | — | — | **PLT-30** |
| Party self-registration link | — | ✓ invite parties | — | — | — | **PTY-33** |
| Head-office central masters | — | — | ✓ HO module | ✓ pushed to outlets | ✓ multi-chain | **PLT-29** |
| Indents consolidated into POs | — | — | — | ✓ | ✓ central purchase | **PUR-20** |
| Purchase bills from email | — | — | ✓ Gmail CSV | — | ✓ Gmail client | **PUR-21** |
| Inter-branch reallocation | — | — | ✓ auto reallocation | ✓ short-expiry to warehouse | — | **INV-22** |
| Offer engine (combo, time-bound, accumulated) | ✓ sales promotion | ✓ buy-X-get-Y | ✓ slabs, vouchers | ✓ 70+ offer types | ✓ offer management | **PRC-15** |
| Customer segments | — | — | ✓ Segments | ✓ categories | — | **CRM-10** |
| Notify when available | — | — | ✓ | — | — | **CRM-11** |
| Greetings | — | ✓ | ✓ | ✓ birthday / anniversary | — | **CRM-12** |
| Sales targets and incentives | — | — | ✓ staff incentive | ✓ EarnSmart targets | — | **WHS-22** |
| Credit limit by bills / age, phone approval | — | — | — | ✓ | ✓ alerts | **PTY-34** |
| Cash-flow projection | — | ✓ cash flow report | — | ✓ | — | **ACX-18** |
| Data health check | ✓ error checking, rebuild | ✓ Verify my data | — | — | — | **ADM-14** |
| Payment behaviour (avg. days) | — | — | — | ✓ | — | **RPT-19** |
| Manufacturer-wise reports | ✓ company-wise stock | — | — | ✓ manufacturer expiry | — | **RPT-20** |
| Retention (new vs repeat) | — | — | ✓ | — | — | **ANX-09** |
| Zoho Books | — | — | ✓ | — | — | **INT-15** |
| Batch / expiry / FEFO / near-expiry | ✓ | ✓ | ✓ | ✓ | ✓ | INV-01…05 |
| Loose / strip sale | — | ✓ | — | ✓ | — | CAT-05, POS-04 |
| Schedule H / H1 / NDPS registers | ✓ alerts | ✓ registers | — | ✓ NDPS report | ✓ schedule register | CMP-01…02, CMP-10 |
| Estimate, sale order, challan, proforma | ✓ | ✓ | — | — | — | DOC-01 |
| Price-difference credit / debit notes | ✓ | — | — | ✓ | — | ACC-15 |
| Breakage / expiry receive and issue, replacement | ✓ | — | ✓ | ✓ claims | ✓ | RET-04/05/07, WHS-15 |
| Cheque book and printing, PDC | ✓ PDC, cheque mgmt | ✓ cheques | ✓ PDC report | — | ✓ | ACC-02, ACC-16 |
| Auto bank reconciliation | ✓ | — | ✓ ZERO | ✓ | ✓ | ACC-07, ACC-13 |
| GSTR-1/3B/9, e-invoice, e-way | ✓ | ✓ | ✓ pay-per-use | ✓ e-invoice | ✓ auto upload | GST-03…13, WHS-06/07 |
| Tally export | ✓ | ✓ | ✓ | — | — | ACC-10 |
| Sales-rep app, routes, collections | ✓ | — | — | ✓ EarnSmart | ✓ Smart Rep | MOB-02/03, WHS-11/21 |
| Retailer ordering app / portal, ERP-to-ERP | ✓ | — | — | ✓ web order | ✓ Smart Retailer | WHS-10, MKT-03 |
| Customer app, delivery tracking | ✓ e-commerce, delivery | ✓ online store | ✓ white-label, VitRun | ✓ OrderEasy | ✓ e-commerce | OMN-02, DLV-01…03 |
| Warehouse picking by scan | — | — | ✓ TrackRx | ✓ | ✓ Item Checker | WHS-02, WHS-19 |
| Stock audit app | ✓ physical stock | — | — | ✓ GoSure | — | INV-09, MOB-05 |
| Owner app / phone queries | ✓ | — | ✓ SahaAI | ✓ WhatsNow | ✓ Business Now | MOB-01, AIA-01, NTF-07 |
| Multi-firm / multi-company | ✓ | ✓ 3–unlimited firms | — | ✓ multi-company invoicing | ✓ | PLT-02, POS-29 |
| Roles, approvals, audit log, MFA | ✓ | ✓ passcode for edits | ✓ | ✓ MFA, approvals | ✓ | PLT-07/09/12/19 |
| Backup | ✓ | ✓ Google Drive, local | ✓ cloud | ✓ OTP restore | ✓ | ADM-08, DSK-06 |
| Printing: themes, thermal 2/3/4", dot-matrix | ✓ invoice designer | ✓ 12 themes | ✓ custom layout | ✓ print profiles | ✓ | DOC-05/07/08 |
| Doctor commission per medicine | — | — | — | ✓ | — | **not adopted** ⚠ legal |
| Self-checkout kiosk / price checker | — | — | — | ✓ | — | **not adopted** (Rx needs pharmacist) |

Sources (second pass): Marg Books help (care.margcompusoft.com, company creation, POS, sale return, home delivery, loyalty menus), SoftwareSuggest Marg pharmacy listing; Vyapar pharmacy, medical shop, inventory, POS, pharmaceutical ERP pages, feature list blog, GST guide (vyaparapp.in); eVitalRx home, products, solutions, pharmacy types, FAQs, training, pricing, VitRun, TrackRx pages (evitalrx.in); GoFrugal pharmacy, chemist POS, medical store, chain, wholesale pharma, supply chain, OrderEasy, scheme, CRM, credit pages and implementation page (gofrugal.com); VarthagamSoft pricing, pharma distribution, retail pharmacy, distribution, home and POS pages (varthagamsoft.com). All vendor material, read 24-11-2026; claims unverified.
