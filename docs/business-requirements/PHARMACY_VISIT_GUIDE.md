# Pharmacy visit guide

> For Prakalya (lead) and one developer. Goal: watch real work in one **retail pharmacy** and one **distributor** that use Marg, VarthagamSoft, GoFrugal, Vyapar or eVitalRx, and turn what you see into confirmed rules, corrected specs and Hub tasks. Two visits of 2–3 hours each, ideally at the busiest hour (evening for retail, morning dispatch for wholesale).
> Bring: this guide printed, a phone for photos (screens and blank forms only — **never** photograph patient names, prescriptions or real customer data, AGENTS.md §9), the CA / pharmacist questions from [RULES_TO_CONFIRM.md](../compliance/RULES_TO_CONFIRM.md), and MENO's demo (Hub → Learn → Day 21) on a laptop for the last 20 minutes.

## 1. Before the visit (30 min)

- Ask which software and edition they use, how many counters, users and bills a day, and whether the internet ever fails.
- Ask permission to observe and take notes; promise not to record patient data.
- Pick from RULES_TO_CONFIRM.md the 10 rules most relevant to this shop.

## 2. Watch these flows (note keystrokes, time, workarounds)

| # | Flow | What to time / count | What to ask |
|---|---|---|---|
| 1 | Counter bill with 3–5 items, one Schedule H | Seconds from first scan to printed bill; keys pressed; mouse used? | How do you pick the batch? What if the strip is cut? What does the H1 register need? |
| 2 | Loose tablets from a strip | How the price is worked out | Do you round loose prices? How? |
| 3 | Customer return | Steps; who approves | Do you take back without a bill? At what price? |
| 4 | Purchase entry from a distributor bill | Minutes per bill; typing vs import | Which distributors send CSV/PDF? What goes wrong (rate, MRP, expiry)? |
| 5 | Expiry / breakage handling | How near-expiry is found and returned | Claim basis with each distributor (PTR or %)? How long until credit? |
| 6 | Day end | Cash count, reports printed, backup | What do you check before closing? |
| 7 | Month end with the accountant | What the CA asks for | GSTR-1 / 3B: how prepared? What breaks? |
| 8 | (Wholesale) order to dispatch | Order source (phone, rep, app); picking; checking; LR | How are cases counted? How are short supplies handled? |
| 9 | (Wholesale) collections | Who collects; how receipts are matched | Credit limit: by amount, bills or days? Who can override? |
| 10 | (Wholesale) schemes and claims | How schemes are entered and claimed from companies | Stock & sales statement: format, frequency? |

## 3. Questions on MENO's open rules (pick the 10 most relevant)

Examples (full list in RULES_TO_CONFIRM.md): GST rate per medicine HSN after Sept 2025 · odd-paisa CGST/SGST split · scheme before or after trade discount · cash discount before or after tax · netting returns on a tax invoice · GST on freight · Schedule H1 register fields and retention · pharmacist name on bills · dosage-label wording · NPPA ceiling price handling · interest on overdue.

Write each answer as: **rule · answer · who said it · their source (circular, notification, practice)**. Practice answers still need the CA or pharmacist to confirm.

## 4. Show MENO (last 20 min)

Run Hub → Learn → Day 21 on the laptop: vendor (tabs), POS bill, wholesale invoice print. Ask: what is missing, what is confusing, what would stop you switching? Note exact words.

## 5. After the visit (same day)

1. Write notes in `docs/workflows/visit-<yyyy-mm-dd>-<retail|wholesale>.md` (no personal data).
2. Update RULES_TO_CONFIRM sources: answered rules get the answer and source next to the ⚠; expert-confirmed ones lose the ⚠.
3. Corrections to MASTER_FIELDS, DOCUMENT_FIELDS, CALCULATIONS or ONBOARDING go in one PR, with the visit note linked.
4. New needs become Hub tasks (comment on the closest feature, or ask Nitheesh to add a feature ID).
5. Update the five-product matrix in COMPETITOR_AUDIT.md for the product you saw ("✓ seen in use").
