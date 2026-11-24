# Sign-off sheet: Nitheesh (team decisions)

> **Generated** by `scripts/docs/build_rules_to_confirm.py`. Print it, go through each answer with the expert, tick Confirm or write the change, then record the result in RESEARCHED_ANSWERS.md and remove the ⚠ at the sources (who + date).

| Answer | Topic | Confidence | Open rules | Proposed answer (first point) | Confirm | Change / note |
|---|---|---|---|---|---|---|
| [R-38](../RESEARCHED_ANSWERS.md) | Licensing lifecycle | proposed | 8 | Grace: 15 days after expiry. Restricted mode after grace: block new invoices, purchases, users, branches and devices; always allow sign-in, viewing, reports, exports, receipts of money, and sync of bills made before grac… | ☐ | |
| [R-39](../RESEARCHED_ANSWERS.md) | Below-cost and mark-up policy | proposed | 3 | Warn when a line's mark-up is below the item's minimum; block a sale below landed cost unless the user holds sales.below_cost and enters a reason (near-expiry clearance is the common legitimate case). Every override appe… | ☐ | |
| [R-40](../RESEARCHED_ANSWERS.md) | Suggested purchase rate (PTR) | proposed | 2 | Suggested PTR = MRP ÷ (1 + GST %) × (1 − retailer margin %); default margin 20 % for branded ethical medicines, a separate default for generics and OTC, all per category in configuration. The supplier's bill always wins;… | ☐ | |
| [R-41](../RESEARCHED_ANSWERS.md) | Expiry claim basis per distributor | proposed | 1 | A per-supplier term (PTY-14) with options: % of PTR (default 100 %), replacement in kind, or credit note at the supplier's rate; claim window in months before / after expiry. Commercial, so no default beyond "100 % PTR, … | ☐ | |
| [R-43](../RESEARCHED_ANSWERS.md) | Security certification timing | proposed | 1 | ISO 27001 readiness (policies, risk register, controls evidence) by the end of P6; certification audit when the first enterprise customer contract requires it; VAPT by a CERT-In empanelled auditor before the Standard tie… | ☐ | |
| [R-44](../RESEARCHED_ANSWERS.md) | Hosting for the pilot | proposed | 1 | Pilot on the current Azure student plan (single VM) with offline billing as the safety net; an ADR for paid managed PostgreSQL with PITR and a second-region backup before the first paying customer. | ☐ | |
| [R-45](../RESEARCHED_ANSWERS.md) | Accessibility target | decided | 1 | WCAG 2.1 AA for web and desktop (ENTERPRISE_READINESS §9). | ☐ | |
| [R-46](../RESEARCHED_ANSWERS.md) | Drug reference and medicine data | proposed | 3 | openFDA stays reference only (salt-level, US label disclaimer). The Indian product source (CAT-10 / INT-11) is chosen in P2 after Prakalya's 100-bill hit-rate test; until a written licence exists, MENO ships without a bu… | ☐ | |
| [R-49](../RESEARCHED_ANSWERS.md) | Distributor marketplace | proposed | 1 | Post-pilot (P7), only after MKT-03 ERP-to-ERP ordering works with real distributors; needs commercial agreements, not just software. | ☐ | |

9 answers. Expert: ____________________  Registration / membership no.: __________  Date: __________  Signature: __________
