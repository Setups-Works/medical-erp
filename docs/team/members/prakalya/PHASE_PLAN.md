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
- [ ] [BA] UAT P1 on staging

## P2 Masters
- [ ] [BA] FRS Purchase + Inventory + Schemes; confirm ⚠ rules in CALCULATIONS.md with a CA/pharmacist

## P3 Purchase & inventory
- [ ] [BA] FRS POS, returns, Schedule H1 register fields, print formats; workflow diagrams
- [ ] [BA] UAT P3 with a real pharmacy's purchase bills

## P4 Retail POS & returns
- [ ] [BA] FRS Wholesale + Accounting; retail UAT scripts, training notes

## P5 Wholesale, finance, offline
- [ ] [BA] UAT wholesale, accounting, offline; pilot customer selection, onboarding + data-migration templates; DPDP notice draft

## P6 Pilot
- [ ] [BA] Pilot onboarding, weekly feedback calls, triage into Hub tasks; GSTR validation with pilot's CA

