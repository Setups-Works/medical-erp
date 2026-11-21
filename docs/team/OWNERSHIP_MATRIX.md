# Ownership matrix (single source of truth)

Who builds what, per feature-ID prefix. **MENO Hub reads this table** to assign every feature task, so changing an owner here and running `npm run seed` in `project-management/` reassigns the tasks that haven't started yet. CODEOWNERS, member READMEs, PAGES.md and module AGENTS.md must agree with this table.

Rules of the split:

| Track | Who |
|---|---|
| **Backend** | Kamesh (core money and stock modules), Nitheesh (platform, finance, reporting, CRM, sync) |
| **Frontend** | Three people take all the screens: **Meyyarivu** (lead: design system, app shell, auth, POS, purchase, inventory, pricing, wholesale, GST, desktop), **Nitheesh** (platform & admin, dashboards, accounting & payments, CRM), **Ashok** (medicine master, suppliers/customers/doctors, returns, compliance, reports & analytics) |
| **QA** | Ashok (QA lead: core modules, critical scenarios, test strategy), Meyyarivu, Prakalya, Nitheesh: each tests areas they did **not** build |
| **DevOps** | Jeeva (also the desktop installer and integration infrastructure) |

- **Prakalya works part-time: about 40 tasks in total**: business analysis + QA. She builds no screens.
- **Nobody tests their own work.** The QA column names who runs the "QA: <area> · P<n>" task for each prefix; it is never the backend or frontend owner of that prefix.
- **Nitheesh manages everything** and gives the final QA sign-off on every release.

| Prefix | Area | Backend module(s) | Backend | Frontend | Web feature folder(s) | Extra | QA |
|---|---|---|---|---|---|---|---|
| PLT | Platform & administration | tenancy, identity, subscription, audit | nitheesh | nitheesh | company, branches, users, settings, admin | | ashok |
| AUT | Authentication & onboarding | auth, tenancy | nitheesh | meyyarivu | auth | | ashok |
| NAV | Navigation & command search | identity | nitheesh | meyyarivu | (app shell) | | ashok |
| DSH | Role dashboards | reporting | nitheesh | nitheesh | dashboard | | meyyarivu |
| CAT | Medicine master | catalog | kamesh | ashok | catalog | | prakalya |
| PTY | Suppliers, customers, doctors | party | kamesh | ashok | parties | | prakalya |
| PRC | Pricing, schemes, discounts | pricing | kamesh | meyyarivu | pricing | | ashok |
| PUR | Purchase | purchase | kamesh | meyyarivu | purchase | | ashok |
| INV | Inventory | inventory | kamesh | meyyarivu | inventory | | ashok |
| IJX | Inventory journals | inventory | kamesh | meyyarivu | inventory | | ashok |
| MKT | Pharmacy operations (short book, ordering, warehouses) | purchase, inventory, sales | kamesh | meyyarivu | purchase, inventory | | ashok |
| POS | Retail POS & invoices | sales | kamesh | meyyarivu | pos | | ashok |
| WHS | Wholesale | sales | kamesh | meyyarivu | wholesale | | ashok |
| DOC | Sales & purchase document cycle | sales, purchase | kamesh | meyyarivu | wholesale, purchase | | ashok |
| RET | Returns | returns | kamesh | ashok | returns | | prakalya |
| CMP | Pharmacy compliance | compliance | kamesh | ashok | compliance | | prakalya |
| GST | GST & statutory | taxation | kamesh | meyyarivu | gst | | ashok |
| ACC | Payments & accounting | payment, accounting | nitheesh | nitheesh | payments, accounting | | ashok |
| ACX | Full books & finance | accounting | nitheesh | nitheesh | accounting | | ashok |
| RPT | Reports | reporting | nitheesh | ashok | reports | | meyyarivu |
| ANX | Analytics | reporting | nitheesh | ashok | reports | | meyyarivu |
| CRM | CRM & customer care | party, sales, notification | nitheesh | nitheesh | crm | | prakalya |
| ENG | Engagement (campaigns) | notification | nitheesh | nitheesh | crm | | prakalya |
| NTF | Notifications | notification | nitheesh | meyyarivu | (app shell) | | ashok |
| ADM | Administration settings | integrations, identity | nitheesh | nitheesh | admin | | meyyarivu |
| INT | Integrations (GSP, WhatsApp, SMS, Tally) | integrations | nitheesh | | admin | jeeva | ashok |
| DSK | Desktop app & offline | sync | nitheesh | meyyarivu | (desktop renderer) | jeeva | ashok |
| MOB | Mobile (P7) | fieldsales | nitheesh | meyyarivu | apps/mobile | | ashok |

Compliance rules (⚠ items in COMPLIANCE.md) are confirmed by **Nitheesh** with qualified professionals; Prakalya does the research.

QA: the Hub creates one QA task per prefix per phase ("QA: Purchase · P3") listing every feature to test, owned by the **QA** column above. Ashok also owns the 15 critical scenarios, the test strategy and the release QA report.

## QA areas by owner

| QA owner | Prefixes they test |
|---|---|
| Ashok (QA lead) | PRC, PUR, INV, IJX, MKT, POS, WHS, DOC, GST, ACC, ACX, AUT, NAV, NTF, INT, DSK, MOB, PLT + 15 critical scenarios |
| Meyyarivu | DSH, ADM (Nitheesh's screens) and RPT, ANX (Ashok's screens) |
| Prakalya | CAT, PTY, RET, CMP (Ashok's screens; she wrote their stories) and CRM, ENG (Nitheesh's screens) |
| Nitheesh | Final QA sign-off on every release |

## Backend modules by owner

| Owner | Modules (`backend/meno-api/.../modules/`) |
|---|---|
| Kamesh | catalog, party, pricing, purchase, inventory, sales, returns, compliance, taxation |
| Nitheesh | auth, tenancy, identity, subscription, audit, files, sync, notification, payment, accounting, reporting, fieldsales + `config/ security/ common/ tenancy/ integrations/` |

## Web feature folders by owner

| Owner | `apps/web/src/features/` |
|---|---|
| Meyyarivu | auth, purchase, inventory, pos, wholesale, pricing, gst + app shell, `packages/ui`, page patterns |
| Nitheesh | company, branches, users, settings, admin, dashboard, accounting, payments, crm |
| Ashok | catalog, parties, returns, compliance, reports |
