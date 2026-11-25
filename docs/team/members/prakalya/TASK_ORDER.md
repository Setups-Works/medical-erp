# Prakalya — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**50 tasks** · P0: 5 · P1: 5 · P2: 11 · P3: 4 · P4: 6 · P5: 7 · P6: 7 · P7: 5

## P0 · Foundation (5)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | ✅ Interview 1 retail + 1 wholesale pharmacy (notes in `docs/workflows/`) | Groundwork | — |
| 2 | ✅ BRD for Platform, Masters, Purchase, Inventory, POS (`docs/business-requirements/brd/`) | Groundwork | — |
| 3 | ✅ Review GLOSSARY, FEATURES and PAGES; permission matrix role × action (`frs/PERMISSIONS.md`) | Groundwork | — |
| 4 | ✅ 40 test vectors with Ashok | Groundwork | — |
| 5 | ✅ List every ⚠ VERIFY rule from CALCULATIONS.md and COMPLIANCE.md with who will confirm it and by when | Readiness | — |

## P1 · Platform core (5)

| Step | Task | Type | With |
|---|---|---|---|
| 6 | User stories P1 (signup, users, roles, login) + FRS for Masters with every field's validation rule | Groundwork | — |
| 7 | Validation catalogue for masters (GSTIN, DL, phone, PAN, pin code, HSN) in FRS | Groundwork | — |
| 8 | FRS for onboarding from `docs/product/ONBOARDING.md`: every step, field, block-go-live rule; time a real owner through it on a phone | Groundwork | — |
| 9 | FRS for the supplier, customer and product forms from `docs/product/MASTER_FIELDS.md`: acceptance criteria per tab and field (required, options source, validation message, audit) | Groundwork | — |
| 10 | UAT P1 on staging | Groundwork | — |

## P2 · Masters (11)

| Step | Task | Type | With |
|---|---|---|---|
| 11 | FRS Purchase + Inventory + Schemes; confirm ⚠ rules in CALCULATIONS.md with a CA/pharmacist | Groundwork | — |
| 12 | FRS for every transaction document from `docs/product/DOCUMENT_FIELDS.md` (purchase, POS, wholesale invoice, returns, receipts, transfers, adjustments): header/line fields, pre-save checks, what posting writes | Groundwork | — |
| 13 | Research the ⚠ rows added on 24-11-2026 to COMPLIANCE.md (NPPA ceiling prices, MSME payments, TDS on goods, IMS/RCM, inter-branch transfers, stock destruction, returns without bill, patient data) and brief Nitheesh with sources | Groundwork | — |
| 14 | Two field visits (one retail, one distributor) using `docs/business-requirements/PHARMACY_VISIT_GUIDE.md`; notes in `docs/workflows/` | Groundwork | — |
| 15 | Recompute the 72 draft vectors in `contracts/test-vectors/` by hand (spreadsheet) and record the result in each case's `source` | Groundwork | — |
| 16 | Expert sessions with the printed sign-off sheets in `docs/compliance/signoff/` (ca.md, pharmacist.md, lawyer.md; team.md with Nitheesh) on `docs/compliance/RULES_TO_CONFIRM.md`: CA (GST, TDS, MSME, accounts), pharmacist (Schedule H/H1/X, labels, NPPA), lawyer (DPDP, CERT-In, consent); remove each ⚠ at its source with who confirmed it | Groundwork | — |
| 17 | Validate COMPETITOR_AUDIT.md with 2 pharmacies using Marg / Varthagam: which §27 features they really use, and anything missing | Groundwork | — |
| 18 | Check shortlisted Indian medicine data sources against 100 items from a pharmacy's real bills (found by name? by barcode? salts, strength, pack correct?); report the hit rate to Nitheesh | Groundwork | — |
| 19 | Collect real (anonymised) distributor purchase files and sample bills for testing | Readiness | — |
| 20 | QA: Medicine master · P2 (11 features) | QA | — |
| 21 | QA: Suppliers, customers, doctors · P2 (8 features) | QA | — |

## P3 · Purchase & inventory (4)

| Step | Task | Type | With |
|---|---|---|---|
| 22 | FRS POS, returns, Schedule H1 register fields, print formats; workflow diagrams | Groundwork | — |
| 23 | UAT P3 with a real pharmacy's purchase bills | Groundwork | — |
| 24 | QA: Medicine master · P3 (11 features) | QA | — |
| 25 | QA: Suppliers, customers, doctors · P3 (5 features) | QA | — |

## P4 · Retail POS & returns (6)

| Step | Task | Type | With |
|---|---|---|---|
| 26 | FRS Wholesale + Accounting; retail UAT scripts, training notes | Groundwork | — |
| 27 | Retail UAT with a real pharmacist, signed off | Readiness | — |
| 28 | QA: Medicine master · P4 (4 features) | QA | — |
| 29 | QA: Suppliers, customers, doctors · P4 (3 features) | QA | — |
| 30 | QA: Returns · P4 (7 features) | QA | — |
| 31 | QA: Pharmacy compliance · P4 (7 features) | QA | — |

## P5 · Wholesale, finance, offline (7)

| Step | Task | Type | With |
|---|---|---|---|
| 32 | UAT wholesale, accounting, offline; pilot customer selection, onboarding + data-migration templates; DPDP notice draft | Groundwork | — |
| 33 | Pilot customer agreements, onboarding checklist and data-migration templates ready | Readiness | — |
| 34 | QA: Medicine master · P5 (1 feature) | QA | — |
| 35 | QA: Suppliers, customers, doctors · P5 (14 features) | QA | — |
| 36 | QA: Returns · P5 (2 features) | QA | — |
| 37 | QA: Pharmacy compliance · P5 (3 features) | QA | — |
| 38 | QA: CRM & customer care · P5 (2 features) | QA | — |

## P6 · Pilot & GST returns (7)

| Step | Task | Type | With |
|---|---|---|---|
| 39 | Pilot onboarding, weekly feedback calls, triage into Hub tasks; GSTR validation with pilot's CA | Groundwork | — |
| 40 | Validate GSTR-1/3B exports with each pilot's accountant | Readiness | — |
| 41 | QA: Medicine master · P6 (2 features) | QA | — |
| 42 | QA: Suppliers, customers, doctors · P6 (4 features) | QA | — |
| 43 | QA: Pharmacy compliance · P6 (4 features) | QA | — |
| 44 | QA: CRM & customer care · P6 (7 features) | QA | — |
| 45 | QA: Engagement (campaigns) · P6 (1 feature) | QA | — |

## P7 · Growth (5)

| Step | Task | Type | With |
|---|---|---|---|
| 46 | AI assistant question catalogue: 30 real questions from owners, branch managers and accountants with expected answers on demo data (acceptance criteria for AIA-01 … AIA-07) | Groundwork | — |
| 47 | AI assistant privacy review with the lawyer: notice and consent text, what may be sent to the provider, retention (R-52) | Groundwork | — |
| 48 | Business acceptance of the AI assistant against the question catalogue | Groundwork | — |
| 49 | QA: CRM & customer care · P7 (3 features) | QA | — |
| 50 | QA: Engagement (campaigns) · P7 (1 feature) | QA | — |
