# Gokul — task order

> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.
> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.

**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.

**115 tasks** · P0: 5 · P1: 2 · P2: 2 · P3: 15 · P4: 17 · P5: 28 · P6: 28 · P7: 18

## P0 · Foundation (5)

| Step | Task | Type | With |
|---|---|---|---|
| 1 | Onboarding day 1–3 (`docs/team/ONBOARDING.md`): GitHub with 2FA, MENO Hub account (change the first password), local setup, first small docs PR through the normal review flow | Groundwork | — |
| 2 | Read AGENTS.md, `apps/web/AGENTS.md`, `docs/design/DESIGN_LANGUAGE.md`, `docs/design/NAVIGATION.md`, `docs/architecture/VALIDATION_AND_BUSINESS_RULES.md`, GLOSSARY.md and HOW_A_PHARMACY_WORKS.md | Groundwork | — |
| 3 | Learn the frontend stack (Next.js App Router static export, TanStack Query, RHF + Zod, shadcn/ui, Tailwind v4, decimal.js); pair sessions with Meyyarivu | Groundwork | — |
| 4 | Learn the money and tax rules your screens show: CALCULATIONS.md (GST, MRP-inclusive pricing, schemes, rounding) and the GST section of COMPLIANCE.md; run `pnpm --filter @meno/billing-engine test` | Groundwork | — |
| 5 | MENO Hub → Learn: learning guide and developer guide; write `NOTES.md` in your folder with questions for Nitheesh | Groundwork | — |

## P1 · Platform core (2)

| Step | Task | Type | With |
|---|---|---|---|
| 6 | First screen on Meyyarivu's patterns: report filter bar + ReportPage skeleton (web `reports/`) | Groundwork | — |
| 7 | Your query-key sections in `lib/query/keys.ts` and MSW mock handlers for the first report and dashboard API contracts | Groundwork | — |

## P2 · Masters (2)

| Step | Task | Type | With |
|---|---|---|---|
| 8 | Dashboard widget building blocks inside `features/dashboard/` on `packages/ui` (KPI tile, trend, top-N list, empty and loading states); ask Meyyarivu before anything moves to `packages/ui` | Groundwork | — |
| 9 | GST-09 GST configuration: registrations per company, rate master, reverse-charge and composition settings (data, never hard-coded) | Feature | Kamesh |

## P3 · Purchase & inventory (15)

| Step | Task | Type | With |
|---|---|---|---|
| 10 | Inventory dashboard screens (web `dashboard/`) | Groundwork | — |
| 11 | Reports centre screens: stock, batch, expiry, purchase reports with export (web `reports/`) | Groundwork | — |
| 12 | PRC-01 Batch-wise MRP, PTR, PTS, purchase rate, selling rate | Feature | Kamesh |
| 13 | PRC-04 Free-quantity schemes (10+1, 20+3) on purchase and sale | Feature | Kamesh |
| 14 | PRC-05 Scheme discount %, trade discount, cash discount (verify) order of application | Feature | Kamesh |
| 15 | PRC-12 Product price defaults: discount received %, discount allowed %, maximum discount % per item (lower of item and role cap wins) | Feature | Kamesh |
| 16 | GST-01 Intra/inter-state determination, CGST/SGST/IGST, cess | Feature | Kamesh |
| 17 | GST-11 Invoice GST validation before posting (GSTIN format/state, place of supply, HSN, rate, totals) | Feature | Kamesh |
| 18 | GST-15 GST rate change roll-over: effective-dated bulk HSN rate change, drafts and open orders re-priced on the change date, MRP relabel prompts for old stock, before/after report (verify) confirm rates with CA | Feature | Kamesh |
| 19 | DSH-04 Inventory dashboard: stock value, low stock, near-expiry, expired, dead stock, pending GRNs | Feature | Nitheesh |
| 20 | RPT-03 Purchase register (supplier-wise, item-wise) | Feature | Nitheesh |
| 21 | RPT-04 Stock reports: current stock, batch-wise, valuation, movement history of an item | Feature | Nitheesh |
| 22 | RPT-05 Expiry report, expired stock, near-expiry by supplier (for returns) | Feature | Nitheesh |
| 23 | RPT-16 Report framework standard: every report has date range, filters, server pagination, export and permission control | Feature | Nitheesh |
| 24 | PRC-09 Price change history | Feature | Kamesh |

## P4 · Retail POS & returns (17)

| Step | Task | Type | With |
|---|---|---|---|
| 25 | Role-based landing + retail dashboard + widget library (web `dashboard/`) | Groundwork | — |
| 26 | PRC-06 Item/category/party-wise discount rules, max discount per role | Feature | Kamesh |
| 27 | PRC-07 Bill-level discount and round-off | Feature | Kamesh |
| 28 | PRC-08 Never sell above MRP (hard rule) | Feature | Kamesh |
| 29 | PRC-14 Totals breakdown on every invoice: sub total, item discount, bill discount, returns, taxable value, CGST / SGST / IGST / cess, charges, round off, grand total, each shown separately and never merged | Feature | Kamesh |
| 30 | GST-02 HSN summary on invoices and reports | Feature | Kamesh |
| 31 | DSH-01 Role-based landing: each role opens its own dashboard and menu (see ROLES_AND_DASHBOARDS.md); dashboards are configuration, not code branches | Feature | Nitheesh |
| 32 | DSH-02 Retail dashboard: counter sales, bills today, collections by mode, returns, top items | Feature | Nitheesh |
| 33 | DSH-08 Dashboard widget library: today's sales, purchases, gross margin, net sales, invoices, cash collection, credit sales, receivables, payables, low stock, near-expiry, expired, fast-moving, slow-moving, branch performance; each widget permission-aware | Feature | Nitheesh |
| 34 | RPT-01 Owner dashboard: today's sales, collections, purchases, margin, low stock, near expiry, outstanding | Feature | Nitheesh |
| 35 | RPT-02 Sales register (day/month, bill-wise, item-wise, customer-wise, doctor-wise, user-wise, branch-wise) | Feature | Nitheesh |
| 36 | RPT-09 Schedule H1 / narcotic registers | Feature | Nitheesh |
| 37 | RPT-13 Reports centre: catalogue, favourites, saved filters, recent | Feature | Nitheesh |
| 38 | RPT-14 Batch-wise sales and traceability: who received batch X (recalls) | Feature | Nitheesh |
| 39 | ANX-06 POS register (counter/shift-wise), sales & sales-return registers, compliance register | Feature | Nitheesh |
| 40 | DSH-07 Activity timeline: recent user activity (from audit log) filtered by branch/user/module | Feature | Nitheesh |
| 41 | RPT-15 Discount report by user, item, reason | Feature | Nitheesh |

## P5 · Wholesale, finance, offline (28)

| Step | Task | Type | With |
|---|---|---|---|
| 42 | Price lists and schemes screens (web `pricing/`) | Groundwork | — |
| 43 | GST e-invoice screens (web `gst/`) | Groundwork | — |
| 44 | Financial and wholesale dashboards; customer history screens (web `dashboard/`, `crm/`) | Groundwork | — |
| 45 | Outstanding, ageing, GST and wholesale reports; analytics screens (web `reports/`) | Groundwork | — |
| 46 | PRC-02 Price lists / rate levels (A/B/C retailers, institutions, hospitals) | Feature | Kamesh |
| 47 | PRC-15 Offer engine: bill value, item, item group, category, manufacturer, combo, buy-X-get-Y, accumulated purchase, time-bound (hours / days), customer segment and near-expiry batch offers; priority and stacking rules; usage report | Feature | Kamesh |
| 48 | GST-06 E-invoice and e-way bill (see WHS-06/07) | Feature | Kamesh |
| 49 | DSH-03 Wholesale dashboard: orders by status, dispatch, receivables, credit-limit breaches, salesman performance | Feature | Nitheesh |
| 50 | DSH-05 Financial dashboard: cash, bank, receivables, payables, expenses, GST liability | Feature | Nitheesh |
| 51 | RPT-06 Profit reports (bill-wise, item-wise, category-wise) on landed cost | Feature | Nitheesh |
| 52 | RPT-07 Outstanding & ageing reports | Feature | Nitheesh |
| 53 | RPT-17 Outstanding by area, route, salesman and as-on-date / age-wise for receivables and payables, shareable as PDF / WhatsApp | Feature | Nitheesh |
| 54 | RPT-18 Exception (bill audit) report: edited drafts, cancelled, back-dated, reprinted, below-cost, above-cap discount, FEFO overrides, negative-stock attempts, by user and day | Feature | Nitheesh |
| 55 | PRC-03 Margin-based selling price rules (e.g. PTR = MRP − 20 %) | Feature | Kamesh |
| 56 | PRC-10 Value-based schemes (spend ₹X, get Y % or free goods) | Feature | Kamesh |
| 57 | PRC-11 Company-wise (manufacturer-wise) discount rules for wholesale | Feature | Kamesh |
| 58 | PRC-13 Minimum / maximum mark-up % per item (warn below cost + min mark-up, block below cost (verify) policy) and product commission % | Feature | Kamesh |
| 59 | RPT-11 Export every report to Excel/PDF, schedule by email | Feature | Nitheesh |
| 60 | RPT-19 Customer payment behaviour: average payment days, delay trend, bills paid after due date per customer and area | Feature | Nitheesh |
| 61 | RPT-20 Manufacturer-wise reports: sales, stock, expiry and returns by manufacturer / company | Feature | Nitheesh |
| 62 | RPT-22 Group register: net sales quantity and amount, profit and growth % vs the previous period by product group, category, brand or manufacturer | Feature | Nitheesh |
| 63 | ANX-01 Bill-wise profit and rate / quantity difference analysis (purchase vs sale price drift) | Feature | Nitheesh |
| 64 | ANX-02 ABC ranking of items by value/volume; stock-flow card (opening → in → out → closing) | Feature | Nitheesh |
| 65 | ANX-07 Sales vs payment and sales vs purchase trend charts | Feature | Nitheesh |
| 66 | ANX-08 Staff performance: sales, bills, average bill value, discounts given, returns, cancellations by user, salesman, counter and outlet | Feature | Nitheesh |
| 67 | ANX-10 Risk flags: customers approaching their credit limit and declining customers; dead and declining stock; each with drill-down to bills and items (extends ANX-04) | Feature | Nitheesh |
| 68 | CRM-01 Customer history (customer 360): all bills, returns, prescriptions, doctors, outstanding, refill pattern on one page | Feature | Nitheesh |
| 69 | CRM-11 Notify when available: record a customer's request for an out-of-stock medicine; message them automatically when stock arrives; feeds the short book | Feature | Nitheesh |

## P6 · Pilot & GST returns (28)

| Step | Task | Type | With |
|---|---|---|---|
| 70 | GST returns screens (web `gst/`) | Groundwork | — |
| 71 | UX fixes from pilot on your screens; report and dashboard speed tuning | Groundwork | — |
| 72 | GST-03 GSTR-1 data export (B2B, B2C large/small, CDNR, HSN summary) in portal JSON/Excel format | Feature | Kamesh |
| 73 | GST-04 GSTR-3B summary | Feature | Kamesh |
| 74 | GST-10 Input tax credit register from purchases | Feature | Kamesh |
| 75 | RPT-08 GST reports (see §12) | Feature | Nitheesh |
| 76 | GST-05 GSTR-2B reconciliation with purchases (import 2B JSON) | Feature | Kamesh |
| 77 | GST-07 Composition-scheme dealer support (bill of supply) (verify) | Feature | Kamesh |
| 78 | GST-12 Reverse charge (RCM) on applicable inward supplies (e.g. some services) with self-invoice and liability posting (verify) | Feature | Kamesh |
| 79 | GST-13 GSTR-9 annual summary data from posted documents (verify) | Feature | Kamesh |
| 80 | GST-14 Invoice Management System (IMS) workflow on inward invoices (accept / reject / pending) feeding GSTR-2B matching (verify) current GSTN process | Feature | Kamesh |
| 81 | DSH-06 Branch dashboard: branch-to-branch comparison of sales, margin, stock, expiry | Feature | Nitheesh |
| 82 | DSH-09 Super-admin platform analytics: tenants, plans, usage, health, revenue | Feature | Nitheesh |
| 83 | RPT-10 Branch comparison | Feature | Nitheesh |
| 84 | RPT-21 Commission and TDS register: salesman / agent commission vouchers with sales amount, commission %, commission, TDS section, TDS % and TDS amount by period (verify) CA (TDS on commission) | Feature | Nitheesh |
| 85 | ANX-03 Customer, product and vendor performance reports (top, declining, dormant) | Feature | Nitheesh |
| 86 | ANX-09 Customer retention: new vs repeat, lapsed customers, refill adherence by month and branch | Feature | Nitheesh |
| 87 | CRM-02 Complaints: log customer/retailer complaints (wrong item, short supply, damaged, billing error) with status, owner, due date, resolution and link to the bill/return | Feature | Nitheesh |
| 88 | CRM-10 Customer segments by rules (chronic, regular, walk-in, lapsed, high value, by medicine class) used for offers, reminders and campaigns | Feature | Nitheesh |
| 89 | ENG-01 WhatsApp connection settings, broadcast campaigns (offers, refill reminders) with delivery reports (verify) opt-in | Feature | Nitheesh |
| 90 | DLV-01 Home-delivery orders with rider assignment, status, cash-on-delivery collection and rider settlement (extends POS-18) | Feature | Nitheesh |
| 91 | OMN-04 WhatsApp ordering: customer sends an order or prescription on WhatsApp, it lands as a draft bill at the counter | Feature | Nitheesh, Jeeva |
| 92 | ANX-05 Smart insights card on dashboard (plain-language highlights: "Sales of X down 30 % vs last month") | Feature | Nitheesh |
| 93 | CRM-03 CRM dashboard: active customers, refills due, complaints, loyalty | Feature | Nitheesh |
| 94 | CRM-04 Loyalty transactions: points earned / redeemed ledger | Feature | Nitheesh |
| 95 | CRM-06 Follow-up reminders for staff (call customer, collect payment) | Feature | Nitheesh |
| 96 | CRM-08 Paid membership plans: fee, validity, benefits (discount %, free delivery), renewal reminders | Feature | Nitheesh |
| 97 | CRM-12 Greetings automation: birthday, anniversary and festival messages with templates, consent and opt-out | Feature | Nitheesh |

## P7 · Growth (18)

| Step | Task | Type | With |
|---|---|---|---|
| 98 | Reuse dashboard widgets in the owner mobile app with Meyyarivu | Groundwork | — |
| 99 | Assistant chat UI design (answer text, data cards, data-used line, suggested questions, offline state) reviewed with Meyyarivu before AIA-01 | Groundwork | — |
| 100 | AIA-01 Assistant screen (`/assistant` + Ask in Ctrl+K, formerly PLT-21): chat with answer text and data cards (tables from tool results), "data used" line with branch and period, suggested questions per role, feedback, keyboard-first, 1280 / 375 px, disabled offline on desktop | Feature | Nitheesh |
| 101 | AIA-08 Privacy and consent: `Redactor` strips phone, email, Aadhaar / ABHA-like numbers and patient names; never sends customer, prescription, doctor, register, GSTIN, PAN or bank data; party names only on owner opt-in; owner enables the assistant per tenant after a notice, audited (verify) DPDP notice and consent wording (R-52) | Feature | Nitheesh |
| 102 | AIA-10 Usage limits and cost: questions per user per day from plan entitlements, per-tenant rate limit (429 `ASSISTANT_QUOTA_EXCEEDED`), token metering per tenant, usage shown in Settings → Assistant (verify) quota numbers per plan | Feature | Nitheesh |
| 103 | GST-08 TCS/TDS fields where applicable (verify) | Feature | Kamesh |
| 104 | RPT-12 Sales forecasting & smart reorder (ML) | Feature | Nitheesh |
| 105 | ANX-04 Customer & product intelligence: purchase frequency, refill prediction, churn risk | Feature | Nitheesh |
| 106 | CRM-05 Offers and coupons | Feature | Nitheesh |
| 107 | CRM-07 Support tickets for customer issues beyond complaints | Feature | Nitheesh |
| 108 | CRM-09 Gift vouchers (issue, redeem, balance, expiry) and time-boxed flash-sale prices (verify) voucher accounting / GST | Feature | Nitheesh |
| 109 | ENG-02 Customer feedback after purchase (link in WhatsApp invoice) | Feature | Nitheesh |
| 110 | DLV-02 Live order tracking link for the customer (rider location from the delivery app, MOB-04) | Feature | Nitheesh |
| 111 | DLV-03 Fleet management: riders, vehicles, shifts, delivery zones and charges, rider performance | Feature | Nitheesh |
| 112 | OMN-01 Store web page per branch: address, hours, contact, order via WhatsApp | Feature | Nitheesh, Jeeva |
| 113 | OMN-02 White-label customer app: order with prescription upload, reorder, track (verify) online sale of medicines rules | Feature | Nitheesh, Jeeva |
| 114 | OMN-03 Marketplace channels: ONDC, Amazon, Flipkart order intake with stock sync (extends INT-06) (verify) online sale of medicines rules | Feature | Nitheesh, Jeeva |
| 115 | AIA-12 Store documents (RAG, optional): owner uploads SOPs, policies and supplier terms; chunked and embedded into PostgreSQL pgvector with tenant RLS; `search_store_documents` returns snippets with document and page; content treated as untrusted (verify) embedding provider | Feature | Nitheesh, Jeeva |
