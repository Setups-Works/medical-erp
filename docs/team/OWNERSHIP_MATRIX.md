# Ownership matrix (single source of truth)

Who builds what, per feature-ID prefix. **MENO Hub reads this table** to assign every feature task, so changing an owner here and running `npm run seed` in `project-management/` reassigns the tasks that haven't started yet. CODEOWNERS, member READMEs, PAGES.md and module AGENTS.md must agree with this table.

Rules of the split:

| Track | Who |
|---|---|
| **Backend** | Kamesh (core money and stock modules), Nitheesh (platform, finance, reporting, CRM, sync) |
| **Frontend** | Four people take all the screens: **Meyyarivu** (lead: design system, app shell, auth, POS, purchase, inventory, wholesale, desktop), **Nitheesh** (platform & admin, accounting & payments, licensing), **Ashok** (medicine master, suppliers/customers/doctors, returns, compliance), **Gokul** (pricing & schemes, GST screens, role dashboards, reports & analytics, CRM & engagement, delivery, online channels) |
| **QA** | Ashok (QA lead: core modules, critical scenarios, test strategy), Meyyarivu, Prakalya, Nitheesh: each tests areas they did **not** build |
| **DevOps** | Jeeva (also the desktop installer and integration infrastructure) |

- **Prakalya works part-time: about 40 tasks in total**: business analysis + QA. She builds no screens.
- **Nobody tests their own work.** The QA column names who runs the "QA: <area> · P<n>" task for each prefix; it is never the backend or frontend owner of that prefix.
- **Nitheesh manages everything** and gives the final QA sign-off on every release.

| Prefix | Area | Backend module(s) | Backend | Frontend | Web feature folder(s) | Extra | QA |
|---|---|---|---|---|---|---|---|
| PLT | Platform & administration | tenancy, identity, subscription, audit | nitheesh | nitheesh | company, branches, users, settings, admin | | ashok |
| SEC | Security | identity, audit, platform | nitheesh | meyyarivu | admin/security | jeeva | ashok |
| AUT | Authentication & onboarding | auth, tenancy | nitheesh | meyyarivu | auth | | ashok |
| NAV | Navigation & command search | identity | nitheesh | meyyarivu | (app shell) | | ashok |
| DSH | Role dashboards | reporting | nitheesh | gokul | dashboard | | meyyarivu |
| CAT | Medicine master | catalog | kamesh | ashok | catalog | | prakalya |
| PTY | Suppliers, customers, doctors | party | kamesh | ashok | parties | | prakalya |
| PRC | Pricing, schemes, discounts | pricing | kamesh | gokul | pricing | | ashok |
| PUR | Purchase | purchase | kamesh | meyyarivu | purchase | | ashok |
| INV | Inventory | inventory | kamesh | meyyarivu | inventory | | ashok |
| IJX | Inventory journals | inventory | kamesh | meyyarivu | inventory | | ashok |
| MKT | Pharmacy operations (short book, ordering, warehouses) | purchase, inventory, sales | kamesh | meyyarivu | purchase, inventory | | ashok |
| POS | Retail POS & invoices | sales | kamesh | meyyarivu | pos | | ashok |
| WHS | Wholesale | sales | kamesh | meyyarivu | wholesale | | ashok |
| DOC | Sales & purchase document cycle | sales, purchase | kamesh | meyyarivu | wholesale, purchase | | ashok |
| RET | Returns | returns | kamesh | ashok | returns | | prakalya |
| CMP | Pharmacy compliance | compliance | kamesh | ashok | compliance | | prakalya |
| GST | GST & statutory | taxation | kamesh | gokul | gst | | ashok |
| ACC | Payments & accounting | payment, accounting | nitheesh | nitheesh | payments, accounting | | ashok |
| ACX | Full books & finance | accounting | nitheesh | nitheesh | accounting | | ashok |
| RPT | Reports | reporting | nitheesh | gokul | reports | | meyyarivu |
| ANX | Analytics | reporting | nitheesh | gokul | reports | | meyyarivu |
| CRM | CRM & customer care | party, sales, notification | nitheesh | gokul | crm | | prakalya |
| ENG | Engagement (campaigns) | notification | nitheesh | gokul | crm | | prakalya |
| NTF | Notifications | notification | nitheesh | meyyarivu | (app shell) | | ashok |
| ADM | Administration settings | integrations, identity | nitheesh | nitheesh | admin | | meyyarivu |
| INT | Integrations (GSP, WhatsApp, SMS, Tally) | integrations | nitheesh | | admin | jeeva | ashok |
| DSK | Desktop app & offline | sync | nitheesh | meyyarivu | (desktop renderer) | jeeva | ashok |
| MOB | Mobile (P7) | fieldsales | nitheesh | meyyarivu | apps/mobile | | ashok |
| LIC | Licensing: plans, license keys, entitlements | subscription | nitheesh | nitheesh | platform, admin | | ashok |
| DLV | Home delivery & fleet | delivery | nitheesh | gokul | delivery | | ashok |
| OMN | Online channels (store page, customer app, marketplaces) | channels, integrations | nitheesh | gokul | channels | jeeva | meyyarivu |

## Feature overrides

A few features are built by someone other than their prefix's owners. MENO Hub assigns these rows instead of the prefix row; QA still follows the prefix's QA column (so the builder never tests their own work).

| Feature | Backend | Frontend | Extra | Why |
|---|---|---|---|---|
| INT-12 | nitheesh | | | DrugDB adapter: Nitheesh built the Learn prototype (Day 19) and owns the source decision |
| INT-17 | nitheesh | | | GSTIN verification adapter: Learn prototype (Day 22) and the provider decision are Nitheesh's; the PTY-15 endpoint and Fetch screens stay with Kamesh and Ashok |
| CAT-24 | nitheesh | nitheesh | | Medicine search-as-you-type on the item form, from the same prototype |
| LIC-07 | nitheesh | meyyarivu | jeeva | Desktop offline license: certificate check in the desktop renderer (Meyyarivu), public-key bundling in the build (Jeeva) |
| PTY-22 | nitheesh | ashok | | Party TDS/TCS and related-party fields feed the accounting module (ACX-06) |
| PTY-23 | nitheesh | ashok | | MSME payables tracking is an accounting/compliance rule |
| PTY-25 | nitheesh | ashok | | One party in both roles changes ledger and outstanding logic |
| PTY-29 | nitheesh | ashok | | Interest on overdue is computed from ledger ageing |
| PLT-26 | kamesh | ashok | jeeva | Migration importers: parsers in `party`/`catalog` (Kamesh), import screens (Ashok), file storage and jobs (Jeeva) |
| ACC-16 | nitheesh | nitheesh | | Cheque management belongs to accounting |
| NTF-07 | nitheesh | meyyarivu | | Owner digest reads reporting numbers; template on the notification screens |
| AUT-10 | kamesh | meyyarivu | | Data step reuses the import and migration jobs in `party` / `catalog` (Kamesh); onboarding screens stay with Meyyarivu |
| AUT-11 | nitheesh | meyyarivu | jeeva | Devices step: device registration (Nitheesh), screens (Meyyarivu), installer download links (Jeeva) |
| PLT-29 | nitheesh | nitheesh | kamesh | Head-office push touches every module's masters (Kamesh for catalog / pricing payloads) |
| PUR-21 | kamesh | ashok | jeeva | Purchase inbox: parsers (Kamesh), review screen (Ashok), mailbox and storage (Jeeva) |
| ACX-18 | nitheesh | nitheesh | | Cash-flow forecast reads ledgers |
| PLT-39 | jeeva | nitheesh | | Feature flags and staged rollout are release engineering |
| PLT-41 | jeeva | nitheesh | | HA, PITR and restore drills are infrastructure |
| PLT-43 | ashok | nitheesh | jeeva | Performance budgets: k6 and Playwright tests (Ashok), CI gate (Jeeva) |
| PLT-44 | jeeva | nitheesh | ashok | Scans, VAPT and incident process (Jeeva), ASVS checks in tests (Ashok) |
| ADM-16 | jeeva | meyyarivu | | Status page fed by monitoring |
| SEC-04 | jeeva | | nitheesh | Secrets and Key Vault are infrastructure |
| SEC-08 | jeeva | | | Supply chain lives in CI |
| SEC-10 | jeeva | | nitheesh | WAF and edge limits at Nginx / gateway; app limits by Nitheesh |
| SEC-14 | jeeva | | ashok | CI security gates (Jeeva), abuse-case tests (Ashok) |
| SEC-15 | jeeva | | | Backups are infrastructure |
| SEC-09 | nitheesh | meyyarivu | jeeva | Desktop hardening: keystore and signing (Nitheesh), renderer (Meyyarivu), code-signing certificate and update feed (Jeeva) |
| SEC-02 | nitheesh | meyyarivu | | Device keys and sync verification |
| PLT-22 | kamesh | | jeeva | PIN and IFSC reference data: loader in `party` (Kamesh), scheduled refresh job (Jeeva) |

Compliance rules (⚠ items in COMPLIANCE.md) are confirmed by **Nitheesh** with qualified professionals; Prakalya does the research.

QA: the Hub creates one QA task per prefix per phase ("QA: Purchase · P3") listing every feature to test, owned by the **QA** column above. Ashok also owns the 15 critical scenarios, the test strategy and the release QA report.

## QA areas by owner

| QA owner | Prefixes they test |
|---|---|
| Ashok (QA lead) | PRC, PUR, INV, IJX, MKT, POS, WHS, DOC, GST, ACC, ACX, AUT, NAV, NTF, INT, DSK, MOB, PLT, DLV, LIC + 15 critical scenarios |
| Meyyarivu | ADM (Nitheesh's screens) and DSH, RPT, ANX, OMN (Gokul's screens) |
| Prakalya | CAT, PTY, RET, CMP (Ashok's screens; she wrote their stories) and CRM, ENG (Gokul's screens) |
| Nitheesh | Final QA sign-off on every release |

## Backend modules by owner

| Owner | Modules (`backend/meno-api/.../modules/`) |
|---|---|
| Kamesh | catalog, party, pricing, purchase, inventory, sales, returns, compliance, taxation |
| Nitheesh | auth, tenancy, identity, subscription, audit, files, sync, notification, payment, accounting, reporting, fieldsales, delivery, channels + `config/ security/ common/ tenancy/ integrations/` |

## Web feature folders by owner

| Owner | `apps/web/src/features/` |
|---|---|
| Meyyarivu | auth, purchase, inventory, pos, wholesale + app shell, `packages/ui`, page patterns |
| Nitheesh | company, branches, users, settings, admin, accounting, payments, platform |
| Ashok | catalog, parties, returns, compliance |
| Gokul | pricing, gst, dashboard, reports, crm, delivery, channels |
