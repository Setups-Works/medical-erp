# Prakalya — phase plan

Legend: **[BA]** business analysis · **[FE]** frontend. Your frontend feature tasks are the PTY features in MENO Hub (supplier, customer, doctor screens). **You carry 40 tasks in total**; this list is the BA work and frontend groundwork.

## P0 Foundation
- [ ] [BA] Interview 1 retail + 1 wholesale pharmacy (notes in `docs/workflows/`)
- [ ] [BA] Study 2 existing products: features, flows, pain points
- [ ] [BA] BRD for Platform, Masters, Purchase, Inventory, POS (`docs/business-requirements/brd/`)
- [ ] [BA] Review GLOSSARY, FEATURES and PAGES; permission matrix role × action (`frs/PERMISSIONS.md`)
- [ ] [BA] 40 test vectors with Ashok
- [ ] [FE] Learn: React, TypeScript, Next.js App Router, Tailwind, shadcn/ui, TanStack Query, React Hook Form + Zod (pair with Meyyarivu)

## P1 Platform core
- [ ] [BA] User stories P1 (signup, users, roles, login) + FRS for Masters with every field's validation rule
- [ ] [BA] Validation catalogue for masters (GSTIN, DL, phone, PAN, pin code, HSN) in FRS
- [ ] [BA] UAT P1 on staging

## P2 Masters
- [ ] [BA] FRS Purchase + Inventory + Schemes; confirm ⚠ rules in CALCULATIONS.md with a CA/pharmacist
- [ ] [BA] Collect 3 anonymised distributor CSV samples
- [ ] [FE] Suppliers, customers, doctors: list, add/edit, details

## P3 Purchase & inventory
- [ ] [BA] FRS POS, returns, Schedule H1 register fields, print formats; workflow diagrams
- [ ] [FE] Supplier price list screen
- [ ] [BA] UAT P3 with a real pharmacy's purchase bills

## P4 Retail POS & returns
- [ ] [BA] FRS Wholesale + Accounting; retail UAT scripts, training notes
- [ ] [BA] Compare GSP/IRP providers with Jeeva

## P5 Wholesale, finance, offline
- [ ] [FE] Customer groups and account statements screens
- [ ] [BA] UAT wholesale, accounting, offline; pilot customer selection, onboarding + data-migration templates; DPDP notice draft

## P6 Pilot
- [ ] [BA] Pilot onboarding, weekly feedback calls, triage into Hub tasks; GSTR validation with pilot's CA

## P7 Growth
- [ ] [BA] Field-sales and mobile owner app requirements
