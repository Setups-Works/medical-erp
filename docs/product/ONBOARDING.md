# Onboarding and account setup

> From "I want to try MENO" to the first real bill, in one guided flow the owner can pause and resume. Owner: Nitheesh (backend `auth`, `tenancy`) · Meyyarivu (screens) · QA: Ashok · BA: Prakalya. Features: PLT-01, AUT-02 … AUT-15, LIC-03, PLT-16, PLT-26, PLT-28, ACX-11. Pages: [PAGES.md](PAGES.md) §A. Fields reuse [MASTER_FIELDS.md](MASTER_FIELDS.md) and [VALIDATION_AND_BUSINESS_RULES.md](../architecture/VALIDATION_AND_BUSINESS_RULES.md).

## 0. What we learnt from leading Indian products (24-11-2026)

| Product | What they do at set-up | What MENO takes from it |
|---|---|---|
| Marg Books / Marg ERP 9+ | Company creation asks address, **GSTIN and state (state picked from GSTIN)**, then drug licence no. + expiry and "working style" (batch-wise inventory). A third-party Q&A lists the usual mistakes: wrong financial year, wrong GSTIN, unnecessary features switched on, opening balances not verified. | GSTIN-first step; state locked to GSTIN; licences at set-up; only edition-relevant features on; opening balances must balance before go-live. |
| Vyapar | Business profile (name, phone, address) printed on bills; GST switched on in settings; **wrong state is the most common GST mistake**; invoice settings for logo, terms, bank details, UPI, signature; "Bill of Supply" for composition dealers. | Invoice look step with live preview; composition → Bill of Supply; state validation. |
| eVitalRx | Account sign-up, free demo and 7-day trial, guided onboarding with optional on-site expert (staff do not operate the shop's account). | Trial + practice mode; assisted onboarding that is consented and time-boxed, never "we do it for you". |
| GoFrugal | Set-up by standard procedures, hands-on training, master import tool; **customer verifies and approves data before migration**. | Data step with dry run, review and approve before anything is written. |
| VarthagamSoft | Free trial, data migration help from old software, training. | Migration importers (PLT-26) in the data step. |

Sources: Marg care article on company creation (care.margcompusoft.com), third-party Marg Q&A (geekchamp.com), Vyapar guides (vyaparapp.in), eVitalRx listings (Techjockey, App Store), GoFrugal "assure product delivery" page (gofrugal.com), VarthagamSoft pages. Vendor material; flows may differ in current versions.

## 1. Rules for the whole flow

1. **Resume anywhere.** Each step saves on Next; closing the browser loses nothing. The checklist (`/onboarding`) shows progress and stays on the dashboard until go-live (AUT-15).
2. **Required vs optional.** Required: account, company & GST, licences (pharmacy editions), first branch, financial year, billing preferences. Optional: team, data import, devices, practice. Optional steps can be skipped and done later from Settings.
3. **Nothing hard-coded.** Every list (business types, states, registration types, document series formats, roles) comes from the API; defaults come from configuration seeds (rule 13).
4. **One tenant, created once.** Sign-up creates the tenant + owner in one transaction; re-submitting returns the same tenant (idempotency key from the device).
5. **Practice never mixes with real data.** Practice bills live in a separate practice company that go-live deletes (AUT-12, AUT-13).
6. **Everything audited**, including support access during assisted onboarding (AUT-14).
7. Works at 375 px (owners often sign up on a phone) and fully by keyboard.

## 2. The flow

```
/signup → /verify → /onboarding/business → /onboarding/pharmacy → /onboarding/licences → /onboarding/branches
       → /onboarding/books → /onboarding/configuration → /onboarding/team → /onboarding/data → /onboarding/devices
       → /onboarding/plan | /onboarding/license → /onboarding/practice → /onboarding/go-live → /dashboard
                                   (any time: /onboarding = checklist · /onboarding/help = assisted set-up)
```

### Step 1 — Sign up (`/signup`, AUT-04, PLT-01)

| Field | Req. | Rule |
|---|---|---|
| Owner name | Y | 1–100 chars |
| Mobile | Y | 10 digits starting 6–9; OTP on the next screen |
| Email | Y | Valid; verification link; unique across MENO |
| Password | Y | Policy from SECURITY.md (length, breached-password check) |
| Business name | Y | Used until GSTIN fetch replaces it with the legal name |
| State | Y | From the API; pre-checks the GSTIN later |
| How did you hear / partner code | | Partner code links an implementation partner (AUT-14) |
| Start with | Y | Free trial · Book a demo · I have a license key |
| Terms and privacy (DPDP notice) | Y | Acceptance stored with version and time |

Anti-abuse: rate limit per IP and mobile, CAPTCHA-free bot checks (honeypot, timing), disposable-email block list from configuration.

### Step 2 — Verify (`/verify`, AUT-04)

6-digit mobile OTP (5 min, 3 tries, resend after 30 s) and email link (24 h). The account works after mobile OTP; email must be verified before go-live.

### Step 3 — Business profile (`/onboarding/business`, AUT-05)

| Field | Options | Effect |
|---|---|---|
| Business type | Retail pharmacy · Wholesale / distributor · Both · Hospital pharmacy · Chain (2+ shops) | Edition, menus, which later steps are required |
| Number of branches | 1, 2–5, 6+ | Shows multi-branch set-up and transfers |
| Approx. number of medicines | < 2,000 · 2,000–10,000 · 10,000+ | Suggests import over typing |
| Software used today | Marg · Tally · Busy · Vyapar · GoFrugal · Other · Paper / none | Pre-selects the migration importer (PLT-26) in the data step |
| Language | From the API (English first) | UI language (PLT-18) |

### Step 4 — Company & GST (`/onboarding/pharmacy`, AUT-06, PLT-02, GST-09)

| Field | Req. | Rule |
|---|---|---|
| GSTIN + **Fetch** | C | Required unless "Not registered". Fetch fills legal name, trade name, address, state, registration type and status (PTY-15 service ⚠). Cancelled GSTIN blocks; suspended warns. |
| Registration type | Y | Regular · Composition · Not registered. Composition → documents print **Bill of Supply** and no tax lines (GST-07 ⚠) |
| Legal name | Y | Exactly as on the GST registration (a common Marg mistake); read-only after fetch unless edited with a reason |
| Trade name / print name | | Printed on bills |
| PAN | Y | Equals GSTIN chars 3–12 when registered |
| Address, PIN | Y | PIN auto-fills district and city (PLT-22); **state must equal the GSTIN state** — the field locks after fetch (the most common Vyapar mistake) |
| Phone, email, website | | Printed on bills |
| Logo | | PNG/JPG ≤ 1 MB, shown in the invoice preview |
| E-invoice applicable? | | Turnover band answer; MENO explains and stores; threshold from configuration ⚠ |

### Step 5 — Licences & pharmacist (`/onboarding/licences`, AUT-07)

| Field | Req. | Rule |
|---|---|---|
| Retail drug licence (Form 20 / 21) no. + valid to + scan | Y for retail | Expiry in the future; reminders 30/15/7 days |
| Wholesale drug licence (Form 20B / 21B) no. + valid to + scan | Y for wholesale | Same |
| FSSAI no. | | 14 digits, when selling food / nutraceuticals |
| Narcotic licence | | Only if NDPS items are sold ⚠ |
| Pharmacist in charge: name, registration no., state council | Y for pharmacy types | Printed on bills where required (CMP-04 ⚠) |

### Step 6 — Branches, godowns and counters (`/onboarding/branches`, PLT-03, MKT-06)

First branch pre-filled from the company address (editable); its own licences if different; godowns (main store, cold room, display); counters (name, default printer, cash drawer). Chains add more branches here or later.

### Step 7 — Books (`/onboarding/books`, ACX-11, ACX-15)

| Field | Req. | Rule |
|---|---|---|
| Financial year | Y | April–March default; shown as "FY 2026-27" with dates; **a wrong FY is the most common set-up mistake** so the screen states the dates in words |
| Books start date | Y | Within the FY; mid-year start allowed (opening balances on this date) |
| Bank accounts | | IFSC auto-fill, account no. twice, UPI ID; becomes bank ledgers |
| Opening cash | | Cash ledger opening |
| Default chart of accounts | auto | Seeded (CHART_OF_ACCOUNTS.md); shown read-only with "edit later" |
| Opening balances | | Can be entered now or in the data step; **go-live is blocked until Dr = Cr** (Marg: opening balances not verified) |

### Step 8 — Billing preferences and invoice look (`/onboarding/configuration`, AUT-02, AUT-08)

| Group | Fields (all write tenant settings) |
|---|---|
| Numbering | Series per document type and branch (prefix, FY format, padding), preview "AM/26-27/000001"; ≤ 16 chars ⚠ |
| Pricing | Retail rates MRP-inclusive, rounding of grand total, loose sale on/off, discount cap per role, never above MRP (fixed) |
| Stock | Negative stock (block / warn), FEFO default, near-expiry days, low-stock alerts |
| Invoice look | Paper (thermal 2"/3", A5, A4, dot-matrix), logo, header lines, terms (from a starter set), bank details, UPI ID → QR, signature image, declaration; **live preview** of a sample bill |
| Sharing | WhatsApp / SMS / email sender set-up can be postponed (ADM-01) |

### Step 9 — Team (`/onboarding/team`, AUT-09)

Invite by mobile or email with a role from the API (pharmacist, billing operator, inventory manager, accountant, branch manager), branch access, counter PIN set on first login (PLT-10). Owner can skip and work alone.

### Step 10 — Data (`/onboarding/data`, AUT-10, PLT-16, PLT-26, CAT-10)

Choose a path: **Start fresh** (add medicines as you purchase, with the medicine database search CAT-23/24) · **Excel / CSV templates** · **Migrate from <software chosen in step 3>**. For imports: upload → dry run (row errors, duplicates, unknown HSN, expired batches, unbalanced openings) → **review and approve** (GoFrugal-style) → commit as one job. Order: masters (items, suppliers, customers, doctors) → opening stock by batch (batch, expiry, MRP, cost) → outstanding bills → ledger openings.

### Step 11 — Devices and printers (`/onboarding/devices`, AUT-11, DSK-01, DSK-03)

Download the desktop app (Windows / macOS), register this device to a branch and counter (counts against the plan's device limit), print a **test page** on each printer profile, scan a **test barcode**, open the cash drawer. Each check shows pass / fail and help.

### Step 12 — Plan or license (`/onboarding/plan`, `/onboarding/license`, PLT-14, LIC-03)

Trial users pick a plan (trial length from the plan catalogue) or enter a license key (LIC-03). Edition chosen in step 3 must match the plan's edition.

### Step 13 — Practice (`/onboarding/practice`, AUT-12)

A **practice company** with sample medicines, a supplier and a customer. Guided tour: make a purchase, bill at POS with F2/F9/F10, return an item, see the day book. Practice bills say "PRACTICE — NOT A TAX INVOICE" and never reach GST reports.

### Step 14 — Go-live (`/onboarding/go-live`, AUT-13)

Readiness checks (each a link back to its step): company & GST complete · licences valid · first branch · FY and books · opening balances balanced · billing preferences · at least one printer tested (if desktop) · stock imported or "start fresh" chosen · plan / license active · email verified. Then: pick the go-live date (books start date ≤ go-live ≤ today + 7), confirm → practice company deleted, opening balances locked (edit later needs permission + audit), document series start at 1, owner daily digest switched on (NTF-07), welcome message with the first-week checklist.

### Help at any step (`/onboarding/help`, AUT-14)

Book a set-up call (slot picker), chat, or grant **support access**: the owner chooses scope (view only / assist), duration (default 24 h) and can revoke anytime; every action by support is audited and shown to the owner. Partner code from sign-up links an implementation partner with the same consent rules.

## 3. Platform side (`/platform/onboarding`, PLT-28)

Super-admin pipeline: tenants by step, days stuck, trial days left, last activity, assigned helper; nudges (WhatsApp / email templates) for stuck owners; conversion funnel sign-up → verified → go-live → first 100 bills.

## 4. Acceptance (summary for the FRS)

- A retail owner on a phone reaches go-live in under 30 minutes with "start fresh".
- Wrong GSTIN state, unbalanced openings, expired licence and unverified email each block go-live with a clear link to fix.
- Closing the tab at any step and signing in again lands on the same step with data kept.
- Practice data never appears in reports after go-live.
- Support access without the owner's grant is impossible; granted access expires on time.
