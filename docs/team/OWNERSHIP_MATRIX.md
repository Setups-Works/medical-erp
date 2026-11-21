# Ownership matrix (single source of truth)

Who builds what, per feature-ID prefix. **MENO Hub reads this table** to assign every feature task, so changing an owner here and running `npm run seed` in `project-management/` reassigns the tasks that haven't started yet. CODEOWNERS, member READMEs, PAGES.md and module AGENTS.md must agree with this table.

Rules of the split:
- **Kamesh**: backend only (core money and stock modules).
- **Nitheesh**: backend and frontend (platform, finance, dashboards, reports, CRM) and backend for the platform plumbing. Also manages everything.
- **Meyyarivu**: frontend lead; most screens, the design system and the app shell.
- **Ashok**: QA for every feature **plus frontend** for returns, compliance and reports / analytics screens.
- **Prakalya**: business analysis plus supplier / customer / doctor screens; **40 tasks in total**.
- **Jeeva**: DevOps; also the desktop installer and integration infrastructure.

| Prefix | Area | Backend module(s) | Backend | Frontend | Web feature folder(s) | Extra |
|---|---|---|---|---|---|---|
| PLT | Platform & administration | tenancy, identity, subscription, audit | nitheesh | nitheesh | company, branches, users, settings, admin | |
| AUT | Authentication & onboarding | auth, tenancy | nitheesh | meyyarivu | auth | |
| NAV | Navigation & command search | identity | nitheesh | meyyarivu | (app shell) | |
| DSH | Role dashboards | reporting | nitheesh | nitheesh | dashboard | |
| CAT | Medicine master | catalog | kamesh | meyyarivu | catalog | |
| PTY | Suppliers, customers, doctors | party | kamesh | prakalya | parties | |
| PRC | Pricing, schemes, discounts | pricing | kamesh | meyyarivu | pricing | |
| PUR | Purchase | purchase | kamesh | meyyarivu | purchase | |
| INV | Inventory | inventory | kamesh | meyyarivu | inventory | |
| IJX | Inventory journals | inventory | kamesh | meyyarivu | inventory | |
| MKT | Pharmacy operations (short book, ordering, warehouses) | purchase, inventory, sales | kamesh | meyyarivu | purchase, inventory | |
| POS | Retail POS & invoices | sales | kamesh | meyyarivu | pos | |
| WHS | Wholesale | sales | kamesh | meyyarivu | wholesale | |
| DOC | Sales & purchase document cycle | sales, purchase | kamesh | meyyarivu | wholesale, purchase | |
| RET | Returns | returns | kamesh | ashok | returns | |
| CMP | Pharmacy compliance | compliance | kamesh | ashok | compliance | |
| GST | GST & statutory | taxation | kamesh | meyyarivu | gst | |
| ACC | Payments & accounting | payment, accounting | nitheesh | nitheesh | payments, accounting | |
| ACX | Full books & finance | accounting | nitheesh | nitheesh | accounting | |
| RPT | Reports | reporting | nitheesh | ashok | reports | |
| ANX | Analytics | reporting | nitheesh | ashok | reports | |
| CRM | CRM & customer care | party, sales, notification | nitheesh | nitheesh | crm | |
| ENG | Engagement (campaigns) | notification | nitheesh | nitheesh | crm | |
| NTF | Notifications | notification | nitheesh | meyyarivu | (app shell) | |
| ADM | Administration settings | integrations, identity | nitheesh | nitheesh | admin | |
| INT | Integrations (GSP, WhatsApp, SMS, Tally) | integrations | nitheesh | | admin | jeeva |
| DSK | Desktop app & offline | sync | nitheesh | meyyarivu | (desktop renderer) | jeeva |
| MOB | Mobile (P7) | fieldsales | nitheesh | meyyarivu | apps/mobile | |

Compliance rules (⚠ items in COMPLIANCE.md) are confirmed by **Nitheesh** with qualified professionals; Prakalya does the research.

QA: **Ashok** tests every prefix. The Hub creates one QA task per prefix per phase ("QA: Purchase · P3") listing every feature to test.

**Nobody signs off their own screens:** returns, compliance and reports screens that Ashok builds are tested by Meyyarivu (UI and E2E review) and accepted by Prakalya; Nitheesh gives the final QA sign-off for them.

## Backend modules by owner

| Owner | Modules (`backend/meno-api/.../modules/`) |
|---|---|
| Kamesh | catalog, party, pricing, purchase, inventory, sales, returns, compliance, taxation |
| Nitheesh | auth, tenancy, identity, subscription, audit, files, sync, notification, payment, accounting, reporting, fieldsales + `config/ security/ common/ tenancy/ integrations/` |

## Web feature folders by owner

| Owner | `apps/web/src/features/` |
|---|---|
| Meyyarivu | auth, catalog, purchase, inventory, pos, wholesale, pricing, gst + app shell, `packages/ui`, page patterns |
| Prakalya | parties |
| Nitheesh | company, branches, users, settings, admin, dashboard, accounting, payments, crm |
| Ashok | returns, compliance, reports |
