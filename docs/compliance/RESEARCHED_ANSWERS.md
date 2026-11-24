# Researched answers to open rules

> Desk research of 24-11-2026 on the questions behind [RULES_TO_CONFIRM.md](RULES_TO_CONFIRM.md). **This is not expert sign-off.** Each answer says how strong its source is; the ⚠ stays at the source line until the named expert confirms, but the generated list now shows which rules have a researched answer (◐) and which are still open (☐).
> Confidence: **A** = primary text or government source read · **B** = several consistent professional sources (CA firms, law firms, GSTN advisories quoted) · **C** = single or conflicting secondary source, or our own knowledge — treat as a lead only.
> Every value below is **configuration** (`statutory_setting`, `hsn_tax`, `tds_section`, `schedule_rule`, retention policies), never code: the seed file is [`contracts/reference-data/statutory-settings.v1.json`](../../contracts/reference-data/statutory-settings.v1.json).
> "Other software" notes come from the five-product audit (COMPETITOR_AUDIT.md §6) and vendor pages; they show common practice, not law.

## How rules link to answers

The generator matches each open rule to an answer by the **Applies to** keywords (comma-separated, each a case-insensitive regular expression; the first answer that matches wins). Keep keywords specific.

| ID | Topic | Applies to | Expert |
|---|---|---|---|
| R-01 | GST rates on medicines | GST rate list, 12 ?%, 12% slab, rate per HSN, illustrative rate | CA |
| R-02 | E-invoice applicability and IRP time limit | e-invoice, IRN, turnover threshold, E-invoice applicable | CA |
| R-03 | E-way bill threshold | e-way, eway, E-Way | CA |
| R-04 | Invoice numbering and HSN digits | 16 char, invoice no\., Numbering, serial, HSN digits, GST invoice rules, Mandatory fields | CA |
| R-05 | Discounts in the value of supply | cash discount, cash_disc, scheme.*trade, discount_order, order of application, trade discount | CA |
| R-06 | Interest and late fees | Interest on overdue, interest debit note, interest basis, PTY-29 | CA |
| R-07 | Freight, insurance and packing charged with goods | freight, charges_gst, GST on charges, insurance | CA |
| R-08 | Returns, credit and debit notes | credit note, debit note, Combined bill, rate-difference, Rate-difference, returns as separate | CA |
| R-09 | Record retention | retention, Record retention, retain, ADM-09 | CA + pharmacist |
| R-10 | Rounding and the odd paisa | odd paisa, rounded to 2, round-off, Rounding | CA |
| R-11 | TDS 194Q / TCS 206C(1H) and the new Income Tax Act | 194Q, TCS, TDS / TCS, TDS/TCS, tds_section, TDS_PAYABLE, TCS_PAYABLE, ACX-06, GST-08 | CA |
| R-12 | TDS on commission | TDS on commission, commission and TDS, RPT-21 | CA |
| R-13 | MSME payments | MSME | CA |
| R-14 | Composition dealers | Composition, composition, Bill of Supply, bill of supply | CA |
| R-15 | Inter-branch transfers | Inter-branch, inter-state invoice, branch-to-branch, Branch-to-branch, different GSTINs | CA |
| R-16 | Invoice Management System | IMS, Reverse charge, RCM | CA |
| R-17 | Gift vouchers | voucher | CA |
| R-18 | Schedule H / H1 / X sale and register | Schedule H, H1, Schedule X, schedule_register, schedule_rule, Rx required | Pharmacist |
| R-19 | Cash memo, pharmacist and licence on bills | Pharmacist, pharmacist, Drug licence, drug licence, Drugs and Cosmetics Act, licence numbers, Form 20 | Pharmacist |
| R-20 | Expired and damaged stock | Expired-stock, destruction, write-off, written off, Not for Sale, expiry return | Pharmacist |
| R-21 | NPPA / DPCO ceiling prices | NPPA, DPCO, ceiling | Pharmacist + CA |
| R-22 | Online sale of medicines | online sale, e-pharmacy, OMN-0, Marketplace channels, White-label customer app | Lawyer |
| R-23 | DPDP Act and Rules | DPDP, consent, Patient data, patient data, privacy, Sign-up consent, opt-in | Lawyer |
| R-24 | CERT-In directions | CERT-In, Incidents, incident, 180-day, log retention | Lawyer |
| R-25 | SMS and WhatsApp messaging rules | DLT, SMS, WhatsApp, Marketing messages, template approval | Lawyer |
| R-26 | Doctor incentives | Doctor incentive, doctor commission, Doctor commission | Lawyer |
| R-27 | NDPS / narcotic drugs at retail | NDPS, narcotic, Narcotic, Controlled stock | Pharmacist + lawyer |
| R-28 | Banned FDCs and recalls | Banned, banned, recall, CDSCO | Pharmacist |
| R-29 | Fixed-asset depreciation rates | depreciation, ACX-04 | CA |
| R-30 | Licences of public reference data | PLT-22, PIN code, IFSC, licence check, licensing of data source, CAT-10, medicine database | Lawyer |
| R-31 | GSTIN verification service | GSTIN fetch, GSTIN verification, GSTIN \+ Fetch, PTY-15 | CA |
| R-32 | ABHA / ABDM integration | ABHA, ABDM | Lawyer |
| R-33 | GSTR-9 annual return | GSTR-9 | CA |
| R-34 | Service items at the counter | POS-26, Service billing, SAC | CA |
| R-35 | One party as customer and supplier | both roles, Also a customer, PTY-25 | CA |
| R-36 | GST on licence (software) sales | LIC-11, License sale, licence sale | CA |
| R-37 | Advance tax reminders | advance-tax, ACX-10, Income-tax overview | CA |
| R-38 | Licensing lifecycle | LIC-06, LIC-10, Restricted mode, invoicesPerMonth, grace length, exp \(certificate\), Expiring, How MENO is sold | Team |
| R-39 | Below-cost and mark-up policy | mark-up, markup, below cost, PRC-13 | Team |
| R-40 | Suggested purchase rate (PTR) | suggested_ptr, Suggested =, trade convention | Team |
| R-41 | Expiry claim basis per distributor | claim basis | Team |
| R-42 | Counter returns without a bill | without bill, RET-09 | Pharmacist |
| R-43 | Security certification timing | ISO 27001, Certification path | Team |
| R-44 | Hosting for the pilot | PostgreSQL Flexible, student subscription | Team |
| R-45 | Accessibility target | WCAG | Team |
| R-46 | Drug reference and medicine data | CAT-21, CAT-23, INT-12, DrugDB, Drug reference | Team |
| R-47 | Pilot-state drug rules (Tamil Nadu) | State rules, Tamil Nadu | Pharmacist |
| R-48 | Drug inspection pack | CMP-11, Regulatory audit, inspection pack | Pharmacist |
| R-49 | Distributor marketplace | PUR-18, Distributor marketplace | Team |
| R-50 | Rolling out a GST rate change | GST-15, rate change roll-over | CA |
| R-51 | Default chart of accounts | chart of accounts, CHART_OF_ACCOUNTS | CA |

## Answers

### R-01 GST rates on medicines — confidence B
- From **22-09-2025** most drugs and medicines moved from 12 % to **5 %**; 33 life-saving drugs moved from 12 % to **Nil** and 3 from 5 % to Nil (36 in total), per Notification 9/2025 and 10/2025-Central Tax (Rate) as reported. Some medical goods remain at 18 %. The 12 % slab no longer applies to medicines.
- MENO: seed `hsn_tax` with effective-dated rows from the notification annexures (not from blogs); the GST-15 roll-out handles the change for stock bought at the old rate. Test vectors using 12 % stay as maths examples only.
- Other software: Accountune and Vyapar pharmacy pages show Nil / 5 % / 18 %; VarthagamSoft advertises "GST 2.0".
- Sources: EY tax alert on GST reduction for medicines (Sept 2025); Accountune medicine GST rate list; RegisterKaro, TaxGarden. **CA to confirm against the CBIC notification text.**

### R-02 E-invoice — confidence B
- Mandatory when aggregate turnover exceeded **₹5 crore** in any financial year from 2017-18 (Notification 10/2023-CT, from 01-08-2023).
- Taxpayers with AATO **≥ ₹10 crore** must report each invoice to the IRP within **30 days** of its date (GSTN advisory 05-11-2024, from 01-04-2025); older invoices are rejected.
- MENO settings: `einvoice.aato_threshold = 50000000`, `einvoice.report_within_days = 30` with `einvoice.time_limit_aato = 100000000`, both effective-dated. Warn at day 20.
- Sources: Maharashtra GST copy of GSTN advisory; Tally, ClearTax, Taxmann explainers.

### R-03 E-way bill — confidence B
- Required for movement of goods with consignment value above **₹50,000** (Rule 138), including movement that is not a sale (e.g. branch transfer); states may set their own intra-state thresholds; goods in the Rule 138 annexure are exempt.
- MENO: `eway.threshold` per state, effective-dated; exempt list as reference data.
- Sources: GST Council e-way bill flyer; ClearTax state-wise thresholds; Busy state-wise list.

### R-04 Invoice number and HSN digits — confidence A
- Rule 46(b): consecutive serial number, **≤ 16 characters**, letters, numerals, hyphen or slash, one or more series, unique for a financial year.
- HSN on invoices (Notification 78/2020-CT, from 01-04-2021): **4 digits** if prior-year aggregate turnover ≤ ₹5 crore, **6 digits** above ₹5 crore; GSTR-1 Table 12 follows the same.
- MENO: number-series validation enforces 16 characters; HSN digit rule as a setting by turnover band.
- Sources: CBIC tax information portal (Rule 46); GST Council copy of Notification 78/2020.

### R-05 Discounts — confidence B
- Section 15(3): a discount given **before or at the time of supply and recorded on the invoice** is excluded from the taxable value. So trade discount, scheme discount and a **cash discount shown on the bill** all reduce taxable value **before** GST.
- A discount given **after** supply reduces value only if it was agreed before the supply, is linked to specific invoices and the buyer reverses the input tax credit; then it is a credit note with GST. Otherwise it is a financial credit note without GST.
- The **order of scheme vs trade discount** is a commercial convention, not law: keep it a tenant setting, default "scheme first" (as most distributors print).
- Sources: GST Council valuation flyer; ClearTax on post-sale discounts; Grant Thornton note (Jan 2023). One source reports the Finance Act 2026 amended s.15(3)(b) and s.34 for post-sale discounts — **CA to confirm current text.**

### R-06 Interest and late fees — confidence A
- **Section 15(2)(d)** (CBIC text): the value of supply **includes interest, late fee or penalty for delayed payment** of any consideration; **section 13(6)**: time of supply for such an addition is the date the supplier receives it. So an interest debit note carries GST at the rate of the underlying supply, raised when the interest is received.
- Interest on a separate loan is a different (exempt) service, as a Gujarat AAR held — not relevant to trade credit.
- MENO: interest debit note is GST-bearing at the goods' rate, issued on receipt (PTY-29).
- Sources: CBIC section 15 text; GST Council valuation flyer; Telangana AAAR (Continental Engineering, 2022); Gujarat AAR (Shell Energy, 2022).

### R-07 Freight, insurance, packing — confidence B
- When the supplier arranges transport and charges it on the same invoice, it is generally a **composite supply** taxed at the rate of the principal supply (the goods) — Section 8(a); a Gujarat AAR held that showing freight separately does not change this.
- With goods at **several rates** on one bill there is no settled rule: options seen are proportionate allocation by taxable value, or the highest rate. Keep `billing.charges_gst` with values `principal-proportionate | highest-rate | fixed-rate`, default proportionate, CA to choose.
- Sources: GST Council composite/mixed supply flyer; Gujarat AAR (Grasim, 2019); TaxTMI and Taxguru discussions.

### R-08 Returns, credit and debit notes — confidence A/B
- Section 34: credit note for goods returned or excess value / tax; it must be declared by **30 November** after the end of the financial year of supply or the annual-return date, whichever is earlier; the supplier's tax reduction depends on the buyer reversing ITC.
- So returns must be **separate credit notes** linked to the original invoice. MENO's combined distributor print (WHS-15) is a print layout over a tax invoice plus credit notes — consistent with this.
- MENO: block GST reduction on credit notes after `credit_note.last_date(fy)`; allow a financial note instead.
- Sources: CBIC section 34 text; Tally and Taxguru explainers.

### R-09 Record retention — confidence A/B
- **GST (section 36, CBIC text)**: keep books and records until **72 months from the due date of the annual return** for that year; GSTR-9 is due **31 December** after the year (Rule 80), so FY 2025-26 records are kept until 31-12-2032. If an appeal, revision, proceeding or investigation is pending: one year after final disposal or the 72 months, whichever is later.
- **Drugs Rules**: registers and records ≥ **2 years** from the last entry unless otherwise provided; **Schedule H1 register 3 years**.
- MENO: retention policy per record type = the longest applicable period, plus a legal-hold flag per tenant; patient data deleted after its period unless a longer hold applies (SEC-17).
- Sources: CBIC section 36 text; CBIC Rule 80; Drugs Rules (R-18).

### R-10 Rounding and odd paisa — confidence B (no law exists)
- **No GST provision** prescribes how to split an odd paisa between CGST and SGST on an invoice; section 170 rounds **tax payable or refundable** to the nearest rupee in returns. Invoice-level rounding is an accounting convention, so this can never be "researched" further — the CA simply picks the convention.
- MENO: `gst.split_rounding = cgst_first | sgst_first | half_each_round` and the grand-total round-off are settings; the test vector "odd paisa" uses `cgst_first` and must be updated if the CA picks another.

### R-11 TDS 194Q, TCS 206C(1H), new Income Tax Act — confidence A/B
- **194Q**: a buyer whose turnover exceeded ₹10 crore in the previous year deducts **0.1 %** on purchases from one seller above **₹50 lakh** in the year (5 % without PAN).
- **206C(1H)** seller-side TCS on goods **does not apply from 01-04-2025** — the Finance Act 2025 inserts that proviso (Income Tax Department text), and removes the 206C(1H) carve-out from 194Q(5)(b).
- The **Income Tax Act 2025** applies from 01-04-2026 and renumbers TDS / TCS provisions. MENO's `tds_section` master stores the **act version and section code** with effective dates.
- Sources: Income Tax Department, Finance Act 2025 sections 69–94; Taxguru on 194Q; Taxmann on section 393 of the Income Tax Act 2025.

### R-12 TDS on commission — confidence B
- 194H rate **2 %** from 01-10-2024 (Deloitte Budget 2024 note); threshold **₹20,000** a year from 01-04-2025 (Finance Bill 2025 text substitutes "twenty thousand" for "fifteen thousand"; enacted text to be checked). Map to the new Act's section from 01-04-2026.
- Sources: Deloitte Budget 2024 TDS note; India Budget Finance Bill 2025; Taxguru on the 194H amendment.

### R-13 MSME payments — confidence B
- Section 43B(h) (from FY 2024-25): a payment due to a **micro or small** enterprise is deductible in the year it is due only if paid within the MSMED Act section 15 time limit: **15 days** without a written agreement, agreed period **up to 45 days** with one; otherwise deductible only when paid. Medium enterprises are not covered. Late payment interest under MSMED s.16 is compound at three times the bank rate.
- Whether **traders** registered on Udyam are covered is disputed between sources — CA to decide; MENO stores a per-supplier flag `msme_43bh_applicable`.
- Sources: KPMG note on 43B(h); Tally, Zoho, ClearTax explainers.

### R-14 Composition dealers — confidence B
- Traders with turnover up to **₹1.5 crore** (₹75 lakh in special-category states) may opt in; they issue a **bill of supply** with "composition taxable person, not eligible to collect tax on supplies", cannot make inter-state supplies, claim ITC or sell through e-commerce operators; tax on turnover at the notified rate (1 % for traders as commonly reported).
- Sources: GST Council composition flyer; Zoho, Busy explainers.

### R-15 Inter-branch transfers — confidence A/B
- **Section 25(4)**: all registrations under one PAN, in the same or different states, are **distinct persons**. **Schedule I entry 2**: supply between distinct persons in the course of business is a supply **even without consideration** — so a transfer between branches with different GSTINs is taxable (IGST if inter-state) and needs a **tax invoice**; within the same GSTIN a **delivery challan** is used.
- **Value (Rule 28)**: open market value, else like goods; where the receiving branch can take **full ITC**, the invoice value is deemed the open market value.
- Sources: CBIC Schedule I text; GST Council "Meaning and scope of supply" flyer; CBIC FAQ (food processing).

### R-16 IMS and reverse charge — confidence B
- **IMS** went live on the GST portal on **14-10-2024**: the buyer marks each inward invoice **accept, reject or pending**; accepted ones flow to GSTR-2B "ITC available", rejected ones to "ITC rejected"; GSTR-2B for October 2024 onwards reflects these actions.
- From the **October 2025** tax period, "pending" is limited to **one tax period** and credit-note handling changed (GSTN advisories Sept–Oct 2025); a wrongly rejected invoice is re-reported by the supplier in GSTR-1A or a later GSTR-1.
- MENO (GST-14): mirror accept / reject / pending on purchase bills, warn on pending older than one period, match with GSTR-2B.
- RCM cases for a pharmacy still to be listed by the CA.
- Sources: GSTN advisory on IMS (Maharashtra GST copy); Deloitte IMS note; EY alert (Sept 2025); ClearTax IMS timeline.

### R-17 Gift vouchers — confidence A
- Circular 243/37/2024-GST (31-12-2024): vouchers are **neither goods nor services**; GST arises on the underlying supply at redemption; unredeemed value (breakage) is not taxable; fees for voucher services are taxable.
- Source: GST Council copy of the circular.

### R-18 Schedule H / H1 / X — confidence B
- Rule 65(9)(a): Schedule H, H1 and X drugs are sold by retail **only on prescription**.
- H1 register (inserted by G.S.R. 588(E), 30-08-2013): a **separate register** written at the time of supply with **name and address of the prescriber, name of the patient, name of the drug and quantity supplied**, kept **3 years** and open to inspection. The patient's **address is not** in the listed particulars — MENO keeps it optional.
- Other software: Vyapar's register captures doctor, patient, date, quantity, batch, expiry; MENO stores the same plus prescriber address.
- Sources: G.S.R. 588(E) via Pharmexcil; Indian Kanoon copy of Rule 65; Laafon and Zivyaa H1 guides. **Pharmacist to confirm Schedule X specifics** (not found).

### R-19 Cash memo, pharmacist, licence — confidence B
- Rule 65(3): retail supply against a **cash or credit memo** with the dealer's name, address and sale licence number and a serial number (plus further particulars); carbon copy retained; the licensee declares to the licensing authority whether it keeps a prescription register or a memo book.
- Rule 65(2): prescription drugs sold under the **personal supervision of a registered pharmacist**. Printing the pharmacist's name on every bill is not shown as mandatory in the sources found — keep it a setting, default on.
- Sources: Indian Kanoon (Rule 65); Telangana Pharmacy Council guidelines; Tripura consolidated Rules. **Full list of memo particulars to be confirmed by the pharmacist.**

### R-20 Expired and damaged stock — confidence B
- Expired drugs must be kept **apart from saleable stock**, marked not for sale; disposal per the **CDSCO guidance document on disposal of expired / unused drugs (26-05-2025)** and the **Bio-Medical Waste Management Rules, 2016**; return to the manufacturer is the common route.
- No specific destruction-record rule for pharmacies was found — MENO's destruction record (CMP-14) is good practice; pharmacist to confirm.
- Sources: CDSCO guidance (cdsco.gov.in); Down To Earth; Cyril Amarchand blog (July 2025).

### R-21 NPPA / DPCO ceiling prices — confidence B
- DPCO 2013: no one may sell a formulation to a consumer above the price in the current price list **or** the label price, **whichever is less**; ceiling prices are **exclusive of GST** (MRP ≤ ceiling + applicable taxes); overcharged amounts are recoverable.
- Data: NPPA publishes ceiling-price notifications (no API found); MENO imports them as reference data with the notification number and date.
- Sources: Department of Pharmaceuticals DPCO notification; Vikaspedia FAQ on drug pricing; IndiaLaw analysis (2026).

### R-22 Online sale of medicines — confidence B
- The **2018 draft e-pharmacy rules were never notified**; online sale sits under the Drugs and Cosmetics Act and Rules and the Pharmacy Act, a legal grey zone with court cases. Keep OMN features (customer app, marketplaces) behind a legal sign-off and the licence + prescription checks.
- Sources: LSHTM report (July 2026); IJME articles (2025); Business Standard.

### R-23 DPDP Act and Rules — confidence B
- **DPDP Rules 2025 notified 13-11-2025**, phased; most obligations, including breach reporting, reported to apply from **13-05-2027** (computed date, unconfirmed).
- Breach: intimation to the Data Protection Board **without delay** and a detailed report **within 72 hours**; affected data principals informed without delay.
- MENO is the tenants' **processor**; tenants are fiduciaries. MENO must notify tenants fast enough for them to meet these timelines (contract and runbook).
- Sources: dpdprules.org (Rule 7); Mondaq / Legal500 breach-notification notes.

### R-24 CERT-In directions — confidence B
- Directions of 28-04-2022 (in force 27-06-2022): report specified incidents **within 6 hours** of noticing; keep logs of all ICT systems for a rolling **180 days within India**; produce them to CERT-In on request.
- Sources: Linklaters, Khaitan & Co, Nishith Desai, KPMG notes.

### R-25 SMS and WhatsApp — confidence B
- **SMS (TRAI TCCCPR 2018)**: the sender registers as a **Principal Entity** on DLT, registers **headers** (up to 11 characters) per message category and a **content template** for each message, passes PE ID, header and template ID to the telecom provider, and for promotional messages registers a **consent template** and collects consent (Digital Consent Acquisition, short code 127xxx). Unregistered messages are blocked.
- **WhatsApp**: Meta business policy requires opt-in and approved templates for business-initiated messages; costs vary by message category (NTF-08).
- MENO: per-tenant DLT IDs and template IDs in settings; consent stored with source and time; opt-out honoured on every channel.
- Sources: TRAI "advice to senders"; TRAI Direction 20-08-2024; Infobip DLT guide.

### R-26 Doctor incentives — confidence B
- **NMC Registered Medical Practitioner (Professional Conduct) Regulations, 2023** (02-08-2023): doctors and their families may not receive gifts, travel, hospitality, cash, consultancy fees or honoraria from pharmaceutical or medical-device companies, or endorse drug brands.
- **UCPMP 2024** (Department of Pharmaceuticals, March 2024, extended to devices Sept 2024): no gift for the personal benefit of a healthcare professional by a pharma company or its agent.
- MENO therefore does **not** build doctor commissions per medicine; doctor-wise sales reports stay for clinical and stock reasons only.
- Sources: Business Standard and Mondaq on the 2023 regulations; Medical Dialogues on UCPMP 2024.

### R-27 NDPS — confidence B
- **NDPS Rules 1985**: a "licensed chemist" needs a **separate state licence** to possess and sell essential narcotic drugs by retail; sale **only on prescription** and subject to the Drugs Rules. Psychotropic substances may be sold only in the circumstances in NDPS Rules 65-A, 66, 67 — a Drugs and Cosmetics licence is a recognised exception. Register formats differ by state.
- Enforcement shows the stakes: the Punjab & Haryana High Court upheld cancelling a chemist's licences for missing sale records, no separate H1 register and non-chronological purchase records.
- MENO: NDPS sale **blocked** in the pilot (`ndps.retail_sale_enabled = false`); enabled per tenant only with the NDPS licence on file and a state-specific register template.
- Sources: NDPS Rules 1985 (Indian Kanoon / Casemine mirrors); LiveLaw (P&H HC licence cancellation); Telangana Pharmacy Council guidelines.

### R-28 Banned FDCs and recalls — confidence A
- Banned FDCs are prohibited under **section 26A** of the Drugs and Cosmetics Act by gazette notification; CDSCO keeps the list on its FDC page — latest entries seen: **16 FDCs banned 11-06-2026**, 156 FDCs (02-08-2024), 2 restricted (12-08-2024), 14 FDCs (02-06-2023), and a consolidated list of section 26A prohibitions (status 22-11-2021). No machine-readable feed: MENO imports each notification as reference data (`banned_drug`, with gazette reference and date) and blocks matching items (CAT-12).
- Sources: CDSCO FDC page and consolidated banned-drugs list; e-Gazette notifications; Goa FDA copy of the 2026 list.

### R-29 Depreciation — confidence C
- Income-tax depreciation uses block rates (WDV) and Companies Act uses useful lives (Schedule II); MENO keeps rates per asset class as configuration. CA to supply the default table.

### R-30 Public reference data licences — confidence B
- **PIN directory**: "All India Pincode Directory" on data.gov.in (India Post), published under the **Government Open Data License – India** (reuse with attribution). **IFSC**: RBI publishes NEFT / RTGS branch lists as Excel files; community mirrors (e.g. Razorpay's) track them. Store the source and download date; check RBI's terms before redistributing.
- A commercial medicine database (CAT-10) needs a written licence from its provider.
- Sources: data.gov.in pincode catalogue; RBI IFSC pages and RTGS member list; Razorpay IFSC repository.

### R-31 GSTIN verification — confidence B
- The GST portal's public taxpayer search is interactive; programmatic GSTIN verification is offered by **GSPs and verification vendors** as paid APIs (e.g. bank / payment providers' verification suites). Pick one provider with the e-invoice GSP (INT-01) to keep one contract; cache results with the check date; never store the vendor's credentials outside Key Vault.
- Sources: Cashfree GST verification page; GST portal public search.

### R-32 ABHA / ABDM — confidence B
- ABDM integration: build in the **ABDM sandbox**, pass the **milestone test cases** (M1 ABHA, M2 consent workflows, M3 health-data exchange as HIP / HIU), then a **web-application security audit by a CERT-In empanelled auditor** and an **NHA exit review** to receive production credentials. Health-record sharing needs the patient's consent artefact.
- Sources: ABDM HIP/HIU guidelines and sandbox guidelines (abdm.gov.in); ABDM developer forum on mandatory M1/M2 features.

### R-33 GSTR-9 — confidence B
- **Aggregate turnover up to ₹2 crore**: GSTR-9 not required (optional) — made permanent from FY 2024-25 by Notification 15/2025-CT (17-09-2025), as reported.
- **Above ₹2 crore**: GSTR-9 mandatory. **Above ₹5 crore**: GSTR-9C reconciliation also required (self-certified since FY 2020-21). Due 31 December after the year.
- MENO settings: `gstr9.mandatory_above = 20000000`, `gstr9c.mandatory_above = 50000000`.
- Sources: Taxmann on CBIC exemption; CA Club India (FY 2024-25 limits); Taxguru insights on GSTR-9 / 9C.

### R-34 Service items at the counter — confidence B
- **Entry 74 of Notification 12/2017-CT (Rate)** exempts **health care services** by a clinical establishment, an authorised medical practitioner or para-medics (and ambulance transport). A retail pharmacy is not a clinical establishment by default, so services like **home-delivery charges** are taxable (generally at the rate applicable to the delivered goods if part of a composite supply, see R-07, or 18 % if billed as a separate service); consultation by a doctor attached to the shop may be exempt.
- MENO: each service item has its own SAC, rate and "exempt under entry 74" flag in configuration; the CA classifies the shop's services.
- Sources: Taxguru / Taxmann analyses of entry 74; Gujarat AAAR (Baroda Medicare, 2022).

### R-35 One party as customer and supplier — confidence C
- Netting receivables against payables of the same party is an accounting set-off that needs the party's agreement (contra entry); GST invoices and credit notes stay separate in each direction. Keep one ledger with a contra voucher, CA to confirm.

### R-36 GST on licence sales — confidence B
- Software licences and SaaS subscriptions are taxed at **18 %** (unchanged by the September 2025 rationalisation). The SAC is disputed between sources (**997331** licensing services, 998434 downloads, 9983xx IT services); the CA picks one for MENO's licence invoices (LIC-11).
- Sources: India Briefing on GST for SaaS; Busy SAC 997331 / 998434 pages.

### R-37 Advance tax — confidence B
- Advance-tax instalments (non-presumptive taxpayers): 15 % by 15 June, 45 % by 15 September, 75 % by 15 December, 100 % by 15 March; presumptive (44AD) taxpayers pay 100 % by 15 March. Store as reminder schedule configuration; CA to confirm under the Income Tax Act 2025 numbering.

## Proposed team decisions (Nitheesh accepts or changes; no outside source can decide these)

Each proposal follows common practice seen in the five products and MENO's own rules. Accepting one = remove the ⚠ at the source and record "decided by Nitheesh, <date>".

### R-38 Licensing lifecycle — proposed
- **Grace**: 15 days after expiry. **Restricted mode** after grace: block new invoices, purchases, users, branches and devices; always allow sign-in, viewing, reports, exports, receipts of money, and sync of bills made before grace ended (never strand data — matches LIC-06).
- **Invoice limit**: **soft** — warn the owner at 80 % and 100 %, never block a counter mid-sale; upsell instead.
- **Certificate lifetime**: 7 days, renewed on every online sign-in / sync (offline shops keep working a week).
- **Reminders**: 30 / 15 / 7 / 1 days before expiry, in-app + email + WhatsApp.
- **Renewal / upgrade**: a renewal starts the day after the current licence ends (no lost days); an upgrade starts immediately with pro-rata credit of the unused part of the old plan; no stacking beyond one future licence.
- Practice seen: Marg and VarthagamSoft sell yearly AMC renewals; eVitalRx annual plans with upgrades.

### R-39 Below-cost and mark-up — proposed
- **Warn** when a line's mark-up is below the item's minimum; **block** a sale below landed cost unless the user holds `sales.below_cost` and enters a reason (near-expiry clearance is the common legitimate case). Every override appears in the exception report (RPT-18).

### R-40 Suggested PTR — proposed
- Suggested PTR = MRP ÷ (1 + GST %) × (1 − retailer margin %); default margin **20 %** for branded ethical medicines, a separate default for generics and OTC, all per category in configuration. The supplier's bill always wins; a deviation over a configurable % is highlighted (PUR-09).

### R-41 Expiry claim basis — proposed
- A per-supplier term (PTY-14) with options: % of PTR (default 100 %), replacement in kind, or credit note at the supplier's rate; claim window in months before / after expiry. Commercial, so no default beyond "100 % PTR, claim up to 3 months after expiry" until the pilot distributor confirms.

### R-42 Counter returns without a bill — proposed (pharmacist to confirm)
- **Off by default.** When a shop turns it on: OTC items only, sealed and unexpired, within N days (default 7), refund at the lower of last selling price and MRP, as a credit note with manager approval; never for Schedule H / H1 / X or cold-chain items.

### R-43 Security certification timing — proposed
- ISO 27001 **readiness** (policies, risk register, controls evidence) by the end of P6; **certification audit** when the first enterprise customer contract requires it; VAPT by a CERT-In empanelled auditor before the Standard tier.

### R-44 Hosting — proposed
- Pilot on the current Azure student plan (single VM) with offline billing as the safety net; an ADR for paid managed PostgreSQL with PITR and a second-region backup **before the first paying customer**.

### R-45 Accessibility — decided
- WCAG 2.1 **AA** for web and desktop (ENTERPRISE_READINESS §9).

### R-46 Drug reference and medicine data — proposed
- openFDA stays **reference only** (salt-level, US label disclaimer). The Indian product source (CAT-10 / INT-11) is chosen in P2 after Prakalya's 100-bill hit-rate test; until a written licence exists, MENO ships without a bundled medicine database and relies on purchase imports.

### R-47 Tamil Nadu specifics — to collect (pharmacist)
- Pilot state is Tamil Nadu: ask the pharmacist / TN Drugs Control Department for the state's inspection checklist, register formats (H1, NDPS), licence renewal cycle and any state-specific bill print requirements; record them as a state profile in configuration.

### R-48 Drug inspection pack — proposed (pharmacist to confirm)
- One export (CMP-11): drug licences and expiry, pharmacist registration, H1 / X registers for the period, purchase bills of scheduled drugs, stock statement of scheduled drugs, expired-stock segregation and destruction records, chain-verification report (SEC-01).

### R-49 Distributor marketplace — proposed
- Post-pilot (P7), only after MKT-03 ERP-to-ERP ordering works with real distributors; needs commercial agreements, not just software.

### R-50 GST rate change roll-over — proposed (CA to confirm)
- Tax follows the **time of supply**: invoices dated on or after the effective date use the new rate, whatever the purchase rate was. Drafts and open orders are re-priced on that date; stock bought at the old rate keeps its cost; MRP re-stickering prompts are shown where the label MRP changes. This matches how the September 2025 change was applied.

### R-51 Default chart of accounts — proposed (CA to confirm)
- Keep CHART_OF_ACCOUNTS.md (Tally-style primary groups, 43 system ledgers) as the default; the CA reviews the stock write-off entry, free-goods cost and round-off group before P5.

## Still team decisions (no outside source can answer)

Licensing grace length and restricted mode, invoice-limit type, certificate lifetime, ISO 27001 timing, pricing of plans, mark-up block policy, suggested-PTR convention, expiry-claim basis per distributor (a commercial term), reminder days. Nitheesh decides; the rules list keeps them under "Team decision".
