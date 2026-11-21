# Meyyarivu — phase plan

Frontend lead. Feature tasks for POS, PUR, INV, IJX, MKT, WHS, DOC, PRC, GST, AUT, NAV, NTF, DSK, MOB screens come from FEATURES.md in MENO Hub; this list is the foundation work around them. You also run the QA tasks for DSH, ADM (Nitheesh's screens) and RPT, ANX (Ashok's screens). Do tasks in the **Step** order shown in MENO Hub and in [TASK_ORDER.md](TASK_ORDER.md).

## P0 Foundation
- [ ] Learn/refresh: Next.js App Router (client-side), TanStack Query, RHF + Zod, shadcn/ui, Tailwind v4
- [ ] Read `docs/design/DESIGN_LANGUAGE.md`; wireframes: app shell, POS, purchase grid, list/form/report patterns
- [ ] POS keyboard map proposal (`docs/design/POS_KEYBOARD.md`)
- [ ] Pair sessions with Ashok and Nitheesh on the frontend stack

## P1 Platform core
- [ ] Next.js scaffold (static export), Tailwind v4, tokens in `packages/ui/src/tokens`
- [ ] shadcn new-york in `packages/ui`: Button, Input, Select, Dialog, Menu, DataTable, Tabs, Toast, Confirm, DatePicker, Combobox, Badge, EmptyState
- [ ] App shell + sidebar from `docs/design/NAVIGATION.md` (edition and permission aware)
- [ ] **Page patterns**: ListPage, FormPage, ReportPage, DocumentGrid; documented in `apps/web/AGENTS.md`
- [ ] Form validation kit: Zod schemas in `packages/validation`, field errors from Problem Details, no hard-coded option lists
- [ ] Auth pages: login, forgot/reset password, accept invitation, signup wizard; TanStack Query, error handling, MSW mocks

## P2 Masters
- [ ] Barcode input, item/party search combobox (used by POS and purchase)
- [ ] Onboarding configuration wizard and checklist screens

## P3 Purchase & inventory
- [ ] Purchase entry grid (batch/expiry/MRP/free qty, live totals from `billing-engine`), GRN and verification
- [ ] Import mapping wizard
- [ ] Stock & batch views, expiry dashboard actions, stock adjustments

## P4 Retail POS & returns
- [ ] POS: barcode-first, search by name/salt/manufacturer, batch picker, payments, hold/recall, discount approval
- [ ] Prescription capture and restricted-medicine alerts
- [ ] Print templates (thermal 2"/3", A4/A5)
- [ ] Notification centre

## P5 Wholesale, finance, offline
- [ ] Wholesale order entry, pick list, invoice, credit warnings, price lists and schemes screens
- [ ] Transfers, stock count, GST e-invoice screens
- [ ] Desktop: data-source switch online/offline, sync status bar, "Sync issues" screen, device registration

## P6 Pilot
- [ ] UX fixes from pilot; POS speed tuning; GST returns screens

## P7 Growth
- [ ] Share `packages/ui` primitives with mobile (Expo)
