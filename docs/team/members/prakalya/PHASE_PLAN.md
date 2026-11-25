# Prakalya — phase plan

Legend: **[BA]** business analysis · **[QA]** testing. You work **part-time: about 40 tasks in total** and build no screens. Your QA tasks ("QA: Medicine master", "QA: Suppliers, customers, doctors", "QA: Returns", "QA: Pharmacy compliance", "QA: CRM", "QA: Engagement") come from MENO Hub: you wrote those stories, so you test them against your own acceptance criteria. This list is the BA work and groundwork. Do tasks in the **Step** order shown in MENO Hub and in [TASK_ORDER.md](TASK_ORDER.md).

## P0 Foundation
- [x] [BA] Interview 1 retail + 1 wholesale pharmacy (notes in `docs/workflows/`)
- [x] [BA] BRD for Platform, Masters, Purchase, Inventory, POS (`docs/business-requirements/brd/`)
- [x] [BA] Review GLOSSARY, FEATURES and PAGES; permission matrix role × action (`frs/PERMISSIONS.md`)
- [x] [BA] 40 test vectors with Ashok

## P1 Platform core
- [ ] [BA] User stories P1 (signup, users, roles, login) + FRS for Masters with every field's validation rule
- [ ] [BA] Validation catalogue for masters (GSTIN, DL, phone, PAN, pin code, HSN) in FRS
- [ ] [BA] FRS for onboarding from `docs/product/ONBOARDING.md`: every step, field, block-go-live rule; time a real owner through it on a phone
- [ ] [BA] FRS for the supplier, customer and product forms from `docs/product/MASTER_FIELDS.md`: acceptance criteria per tab and field (required, options source, validation message, audit)
- [ ] [BA] UAT P1 on staging

## P2 Masters
- [ ] [BA] FRS Purchase + Inventory + Schemes; confirm ⚠ rules in CALCULATIONS.md with a CA/pharmacist
- [ ] [BA] FRS for every transaction document from `docs/product/DOCUMENT_FIELDS.md` (purchase, POS, wholesale invoice, returns, receipts, transfers, adjustments): header/line fields, pre-save checks, what posting writes
- [ ] [BA] Research the ⚠ rows added on 24-11-2026 to COMPLIANCE.md (NPPA ceiling prices, MSME payments, TDS on goods, IMS/RCM, inter-branch transfers, stock destruction, returns without bill, patient data) and brief Nitheesh with sources
- [ ] [BA] Two field visits (one retail, one distributor) using `docs/business-requirements/PHARMACY_VISIT_GUIDE.md`; notes in `docs/workflows/`
- [ ] [BA] Recompute the 72 draft vectors in `contracts/test-vectors/` by hand (spreadsheet) and record the result in each case's `source`
- [ ] [BA] Expert sessions with the printed sign-off sheets in `docs/compliance/signoff/` (ca.md, pharmacist.md, lawyer.md; team.md with Nitheesh) on `docs/compliance/RULES_TO_CONFIRM.md`: CA (GST, TDS, MSME, accounts), pharmacist (Schedule H/H1/X, labels, NPPA), lawyer (DPDP, CERT-In, consent); remove each ⚠ at its source with who confirmed it
- [ ] [BA] Validate COMPETITOR_AUDIT.md with 2 pharmacies using Marg / Varthagam: which §27 features they really use, and anything missing
- [ ] [BA] Check shortlisted Indian medicine data sources against 100 items from a pharmacy's real bills (found by name? by barcode? salts, strength, pack correct?); report the hit rate to Nitheesh

## P3 Purchase & inventory
- [ ] [BA] FRS POS, returns, Schedule H1 register fields, print formats; workflow diagrams
- [ ] [BA] UAT P3 with a real pharmacy's purchase bills

## P4 Retail POS & returns
- [ ] [BA] FRS Wholesale + Accounting; retail UAT scripts, training notes

## P5 Wholesale, finance, offline
- [ ] [BA] UAT wholesale, accounting, offline; pilot customer selection, onboarding + data-migration templates; DPDP notice draft

## P6 Pilot
- [ ] [BA] Pilot onboarding, weekly feedback calls, triage into Hub tasks; GSTR validation with pilot's CA

## P7 Growth

- [ ] [BA] AI assistant question catalogue: 30 real questions from owners, branch managers and accountants with expected answers on demo data (acceptance criteria for AIA-01 … AIA-07)
- [ ] [BA] AI assistant privacy review with the lawyer: notice and consent text, what may be sent to the provider, retention (R-52)
- [ ] [BA] Business acceptance of the AI assistant against the question catalogue
