# Gokul — phase plan

Frontend engineer (joined 25-11-2026). Feature tasks for PRC, GST, DSH, RPT, ANX, CRM, ENG, DLV, OMN screens come from FEATURES.md in MENO Hub; this list is the groundwork around them. Several items were handed over from Meyyarivu, Nitheesh and Ashok when you joined. Do tasks in the **Step** order shown in MENO Hub and in [TASK_ORDER.md](TASK_ORDER.md).

## P0 Foundation
- [ ] Onboarding day 1–3 (`docs/team/ONBOARDING.md`): GitHub with 2FA, MENO Hub account (change the first password), local setup, first small docs PR through the normal review flow
- [ ] Read AGENTS.md, `apps/web/AGENTS.md`, `docs/design/DESIGN_LANGUAGE.md`, `docs/design/NAVIGATION.md`, `docs/architecture/VALIDATION_AND_BUSINESS_RULES.md`, GLOSSARY.md and HOW_A_PHARMACY_WORKS.md
- [ ] Learn the frontend stack (Next.js App Router static export, TanStack Query, RHF + Zod, shadcn/ui, Tailwind v4, decimal.js); pair sessions with Meyyarivu
- [ ] Learn the money and tax rules your screens show: CALCULATIONS.md (GST, MRP-inclusive pricing, schemes, rounding) and the GST section of COMPLIANCE.md; run `pnpm --filter @meno/billing-engine test`
- [ ] MENO Hub → Learn: learning guide and developer guide; write `NOTES.md` in your folder with questions for Nitheesh

## P1 Platform core
- [ ] First screen on Meyyarivu's patterns: report filter bar + ReportPage skeleton (web `reports/`)
- [ ] Your query-key sections in `lib/query/keys.ts` and MSW mock handlers for the first report and dashboard API contracts

## P2 Masters
- [ ] Dashboard widget building blocks inside `features/dashboard/` on `packages/ui` (KPI tile, trend, top-N list, empty and loading states); ask Meyyarivu before anything moves to `packages/ui`

## P3 Purchase & inventory
- [ ] Inventory dashboard screens (web `dashboard/`)
- [ ] Reports centre screens: stock, batch, expiry, purchase reports with export (web `reports/`)

## P4 Retail POS & returns
- [ ] Role-based landing + retail dashboard + widget library (web `dashboard/`)

## P5 Wholesale, finance, offline
- [ ] Price lists and schemes screens (web `pricing/`)
- [ ] GST e-invoice screens (web `gst/`)
- [ ] Financial and wholesale dashboards; customer history screens (web `dashboard/`, `crm/`)
- [ ] Outstanding, ageing, GST and wholesale reports; analytics screens (web `reports/`)

## P6 Pilot
- [ ] GST returns screens (web `gst/`)
- [ ] UX fixes from pilot on your screens; report and dashboard speed tuning

## P7 Growth
- [ ] Reuse dashboard widgets in the owner mobile app with Meyyarivu
