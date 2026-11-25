# Compliance notes (India)

> Owner: Nitheesh confirms each rule with qualified professionals; Prakalya researches and drafts. **This is a research checklist, not legal advice.** Every item must be confirmed with a qualified pharmacist, CA and/or lawyer before it becomes a business rule; record the source and date next to each confirmed item. MENO supports a licensed pharmacy's record-keeping; it does not replace the pharmacist's legal responsibility.

Researched answers with sources for the ⚠ rows: [RESEARCHED_ANSWERS.md](RESEARCHED_ANSWERS.md); every open rule with its status: [RULES_TO_CONFIRM.md](RULES_TO_CONFIRM.md).

| Area | What MENO must support | Status |
|---|---|---|
| Drugs and Cosmetics Act 1940 & Rules 1945 | Retail (Form 20/21) and wholesale (20B/21B) licence numbers on bills; licence expiry tracking | ⚠ VERIFY exact print requirements |
| Schedule H | Rx required; label/warning; record of sale | ⚠ VERIFY |
| Schedule H1 | Separate register at the time of supply: prescriber name & address, patient name, drug name & quantity; retain 3 years, open to inspection (G.S.R. 588(E), 2013) — researched R-18 | ⚠ pharmacist to confirm |
| Schedule X | Duplicate Rx retention, stricter register, separate storage | ⚠ VERIFY |
| NDPS | Narcotic records, state rules | ⚠ VERIFY scope for MVP (likely block sale in MVP) |
| Pharmacist | Registered pharmacist supervising sale; name/reg no. on bill | ⚠ VERIFY |
| Banned FDCs / recalls | CDSCO notifications; block sale | ⚠ source & update process |
| GST invoice rules | Mandatory fields (GSTIN, HSN, place of supply, tax breakup, invoice no. series ≤ 16 chars, unique per FY) | ⚠ VERIFY |
| E-invoice | Mandatory when AATO exceeded ₹5 cr in any FY since 2017-18 (N 10/2023, from 01-08-2023); AATO ≥ ₹10 cr must report to IRP within 30 days (GSTN advisory, from 01-04-2025) — researched R-02 | ⚠ CA to confirm |
| E-way bill | Movement of goods above ₹50,000 (Rule 138), intra-state thresholds per state, annexure items exempt — researched R-03 | ⚠ CA to confirm |
| GST returns | GSTR-1, 3B data exports; composition dealers file differently | ⚠ VERIFY |
| Record retention | Accounts & invoices retained ~6–8 years | ⚠ VERIFY |
| Default chart of accounts | Groups, system ledgers and posting rules in `docs/architecture/CHART_OF_ACCOUNTS.md` (incl. stock write-off entry and free-goods cost) reviewed by a CA | ⚠ VERIFY with CA before P5 |
| DPDP Act 2023 | Notice, consent, purpose limitation, data principal rights, breach notification | ⚠ VERIFY with lawyer |
| State rules | State drug controller specifics | ⚠ per pilot state (Tamil Nadu first) |
| NPPA / DPCO ceiling prices | Source, update frequency and enforcement (warn vs block) of ceiling prices for scheduled formulations (CMP-12, CALCULATIONS §19) | ⚠ VERIFY with pharmacist / CA |
| MSME payments | Payment limit for micro/small suppliers and its income-tax effect (PTY-23) | ⚠ VERIFY with CA |
| TDS / TCS on goods | Sections, thresholds, rates and turnover conditions (e.g. 194Q) for purchases and sales (PTY-22, ACX-06, CALCULATIONS §16) | ⚠ VERIFY with CA |
| Interest on overdue | Whether an interest debit note carries GST and how it is posted (PTY-29) | ⚠ VERIFY with CA |
| Reverse charge and IMS | RCM cases for a pharmacy; current IMS / GSTR-2B process (GST-12, GST-14) | ⚠ VERIFY with CA |
| Inter-branch transfers | Transfers between branches with different GSTINs: tax invoice vs delivery challan (DOCUMENT_FIELDS §7) | ⚠ VERIFY with CA |
| Expired-stock destruction | Records, witnesses and method required for destroying expired / damaged medicines (CMP-14) | ⚠ VERIFY with drug inspector guidance |
| GST rate list for medicines | Current GST rate per HSN after the September 2025 rationalisation (12 % slab reportedly removed; Nil / 5 % / 18 %) before seeding `hsn_tax` (GST-15) | ⚠ VERIFY with CA and CBIC notification |
| Patient-data retention | How long prescriptions and H1 patient details must be kept and when they must be deleted (SEC-17) | ⚠ VERIFY with pharmacist and lawyer |
| CERT-In directions | Incident reporting time, log retention period and location for a SaaS provider (PLT-44) | ⚠ VERIFY with lawyer |
| TDS on commission | Section, rate and threshold for TDS on salesman / agent commission (RPT-21) | ⚠ VERIFY with CA |
| Doctor incentives | Confirm MENO must not offer per-medicine doctor commissions (medical council ethics, pharma marketing code) | ⚠ VERIFY with lawyer |
| Marketing messages | Consent, opt-out and DLT rules for greetings, offers and "notify when available" messages (CRM-11, CRM-12) | ⚠ VERIFY with lawyer |
| Sign-up consent | DPDP notice and consent text at sign-up and for support access during onboarding (AUT-04, AUT-14) | ⚠ VERIFY with lawyer |
| Dosage label wording | Required and allowed text on dispensing labels (INV-21) | ⚠ VERIFY with pharmacist |
| Combined bill with returns | Netting sales returns and breakage / expiry returns on the same printed document as a tax invoice: returns as separate linked credit notes, replacement as invoice lines (WHS-15) | ⚠ VERIFY with CA |
| GST on charges | GST rate on freight, insurance and packing charged on the invoice (follows the goods, highest rate, or separate supply) (DOC-06) | ⚠ VERIFY with CA |
| Returns without bill | Whether medicines may be taken back without the original bill and at what value (RET-09) | ⚠ VERIFY with pharmacist |
| Patient data | Allergy and chronic-condition fields, ABHA no.: consent and access rules under DPDP (PTY-30); walk-in name and mobile stored on bills (POS-30): notice, consent and retention | ⚠ VERIFY with lawyer |

Rules confirmed here are copied into the relevant FRS and referenced by feature ID.
