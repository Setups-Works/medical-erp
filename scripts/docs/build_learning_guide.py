"""Builds docs/guide/meno-learning-guide.html: a complete, simple-English learning guide to pharmacy billing and MENO.
Run: python3 scripts/docs/build_learning_guide.py   (re-run after changing FEATURES.md, PAGES.md or GLOSSARY.md)

Chapters are written here in plain English; the glossary, the full feature list and the full page list are read from
docs/ so the guide never goes stale. Worked numbers match contracts/test-vectors (proved by packages/billing-engine).
The output is one self-contained file (no build step); it opens from disk, is published as a page, and a copy is
written to project-management/public/guide/ so MENO Hub serves it at Learn → Learning guide.
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/guide/meno-learning-guide.html"


def clean(s: str) -> str:
    s = re.sub(r"\*\*|`", "", s)
    s = s.replace("⚠", "(to confirm)")
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
    return re.sub(r"\s+", " ", s).strip()


# ---------- data from docs ----------
features, section = [], ""
for line in (ROOT / "docs/product/FEATURES.md").read_text().splitlines():
    h = re.match(r"^#{2,3}\s+(.+)$", line)
    if h:
        section = clean(re.sub(r"\(`.*?`\)", "", h.group(1)))
    c = [x.strip() for x in line.split("|")]
    if len(c) > 4 and re.fullmatch(r"[A-Z]{3}-\d{2}", c[1]):
        rest = c[3:-1]
        ed, ph, pri = (rest[0], rest[1], rest[2]) if len(rest) >= 3 else ("B", rest[0], rest[1])
        t = clean(c[2])
        features.append([c[1], t[:240], {"R": "Retail", "W": "Wholesale"}.get(ed, "Both"), ph, {"M": "Must", "S": "Should"}.get(pri, "Could"), section[:60]])

pages, psec = [], ""
for line in (ROOT / "docs/product/PAGES.md").read_text().splitlines():
    h = re.match(r"^## (.+)$", line)
    if h:
        psec = clean(h.group(1))
    c = [x.strip() for x in line.split("|")]
    if len(c) > 9 and c[2].startswith("`") and psec:
        pages.append([clean(c[1]), clean(c[2]), clean(c[3])[:200], c[5], psec[:50]])

pilot = {}
wave = ""
for line in (ROOT / "docs/planning/PILOT_SCOPE.md").read_text().splitlines():
    m = re.match(r"^## Pilot ([AB])", line)
    if m:
        wave = m.group(1)
    elif line.startswith("## "):
        wave = ""
    m = re.match(r"^\| ([A-Z]{3}-\d{2}) \|", line)
    if m and wave:
        pilot[m.group(1)] = wave
for f in features:
    f.append(pilot.get(f[0], "-"))

glossary = []
for line in (ROOT / "docs/product/GLOSSARY.md").read_text().splitlines():
    c = [x.strip() for x in line.split("|")]
    if len(c) > 3 and c[1].startswith("**"):
        glossary.append([clean(c[1]), clean(c[2]), "Core"])

# Extra terms in simple English (business, money, tax, law, software).
EXTRA = [
    ("Pharmacy / chemist / medical store", "A shop that sells medicines to patients. Needs a retail drug licence and a registered pharmacist.", "Business"),
    ("Distributor / wholesaler", "A business that buys medicines from companies and sells them to pharmacies, usually on credit.", "Business"),
    ("C&F agent / stockist", "Carrying and Forwarding agent: holds a company's stock in a region and supplies distributors.", "Business"),
    ("Retailer", "In MENO's wholesale edition, a pharmacy that buys from you.", "Business"),
    ("Edition (Retail / Wholesale)", "The set of MENO features a company uses: Retail for counter billing, Wholesale for selling to shops. A business can have both.", "MENO"),
    ("Counter / POS", "The billing desk and the fast billing screen (Point of Sale).", "MENO"),
    ("Strip / pack", "How medicines are packed and sold, e.g. a strip of 15 tablets. The pack is the normal selling unit.", "Stock"),
    ("Base unit", "The smallest unit MENO keeps stock in (tablet, ml, piece). Packs are shown on top of it.", "Stock"),
    ("Rack / shelf location", "Where a medicine sits in the shop, so staff find it fast.", "Stock"),
    ("Godown / warehouse", "A store room or building that holds stock separately from the shop counter.", "Stock"),
    ("Short book", "A list of items customers asked for that were out of stock; used to reorder.", "Stock"),
    ("Reorder level / reorder point", "When stock falls to this number, it is time to order more.", "Stock"),
    ("Dead stock / slow-moving", "Items that have not sold for a long time. They tie up money and may expire.", "Stock"),
    ("Physical stock count / cycle count", "Counting what is really on the shelf and comparing it with MENO's stock.", "Stock"),
    ("Dump stock", "Damaged or expired stock kept apart so it is never sold by mistake.", "Stock"),
    ("Recall", "A company or regulator asks to withdraw a batch. MENO blocks the batch and shows who bought it.", "Stock"),
    ("Discontinued item", "A medicine you no longer buy or sell. MENO blocks new purchases and sales.", "Stock"),
    ("Substitute / generic", "Another medicine with the same salt and strength. The pharmacist decides if it can be given.", "Stock"),
    ("Cold chain", "Medicines that must stay between 2 and 8 °C, like insulin and vaccines.", "Stock"),
    ("Scheme", "A supplier offer, like '10 + 1 free' or 5 % off on 50 strips.", "Price"),
    ("Half scheme", "A scheme where the free part is less than a pack, e.g. 10 strips + 5 tablets free.", "Price"),
    ("Price list / rate level", "Different selling prices for different customer groups (A, B, C retailers, hospitals).", "Price"),
    ("Margin", "Profit as a share of the selling price: (sale − cost) ÷ sale.", "Price"),
    ("Mark-up", "Profit as a share of the cost: (sale − cost) ÷ cost.", "Price"),
    ("Round off", "The small amount added or removed so the bill ends in whole rupees.", "Price"),
    ("Bill discount", "A discount on the whole bill. MENO shares it across the lines so GST stays right.", "Price"),
    ("Ceiling price (NPPA / DPCO)", "The government's maximum price for some essential medicines. Price can never be above it plus GST.", "Law"),
    ("NPPA", "National Pharmaceutical Pricing Authority: sets ceiling prices under DPCO 2013.", "Law"),
    ("Banned FDC", "A fixed-dose combination medicine banned by the government. It must never be sold.", "Law"),
    ("CDSCO", "Central Drugs Standard Control Organisation: India's drug regulator. Publishes banned lists and alerts.", "Law"),
    ("Drugs and Cosmetics Act / Rules", "The 1940 law and 1945 rules for making and selling medicines in India (licences, schedules, registers).", "Law"),
    ("Pharmacist on duty", "A registered pharmacist who must supervise the sale of prescription medicines.", "Law"),
    ("H1 register", "A legal register written at the time of sale for Schedule H1 medicines: prescriber, patient, medicine, quantity. Kept 3 years.", "Law"),
    ("Composition dealer", "A small business that pays GST on turnover at a low rate. It issues a 'bill of supply' and cannot charge GST separately.", "Tax"),
    ("Bill of supply", "The bill a composition dealer issues instead of a tax invoice.", "Tax"),
    ("Input tax credit (ITC)", "GST you paid on purchases that you can subtract from GST you collect on sales.", "Tax"),
    ("Output tax", "GST you collect on your sales.", "Tax"),
    ("Reverse charge (RCM)", "Some purchases where the buyer pays the GST instead of the seller.", "Tax"),
    ("IMS", "Invoice Management System on the GST portal: you accept, reject or keep pending each purchase bill before claiming ITC.", "Tax"),
    ("GSTR-9", "Yearly GST return. Not required up to ₹2 crore turnover.", "Tax"),
    ("AATO", "Annual aggregate turnover; decides if e-invoice applies (above ₹5 crore).", "Tax"),
    ("SAC", "Service code, like HSN but for services (e.g. delivery charges).", "Tax"),
    ("Cess", "An extra tax on some goods, on top of GST.", "Tax"),
    ("TDS", "Tax Deducted at Source: the payer keeps back a small % of a payment and pays it to the government.", "Tax"),
    ("194Q", "TDS a large buyer deducts (0.1 %) on purchases above ₹50 lakh a year from one seller.", "Tax"),
    ("TCS", "Tax Collected at Source: the seller collects a small % on some sales. TCS on goods (206C(1H)) stopped from 1 April 2025.", "Tax"),
    ("PAN", "Permanent Account Number for income tax. Characters 3–12 of a GSTIN are the PAN.", "Tax"),
    ("MSME / Udyam", "Micro, small or medium enterprise, registered on the Udyam portal. Micro and small suppliers must be paid within 15 days (45 with an agreement).", "Tax"),
    ("Advance tax", "Income tax paid in instalments during the year (15 June, 15 Sept, 15 Dec, 15 March).", "Tax"),
    ("Debit (Dr) / Credit (Cr)", "The two sides of every accounting entry. Every voucher has equal debits and credits.", "Accounts"),
    ("Chart of accounts", "The full list of ledgers (Cash, Sales, GST, each customer...) grouped into assets, liabilities, income and expenses.", "Accounts"),
    ("Sundry debtors / creditors", "Customers who owe you / suppliers you owe.", "Accounts"),
    ("Day book", "All vouchers of a day in order.", "Accounts"),
    ("Trial balance", "A list of all ledger balances. Total debits must equal total credits.", "Accounts"),
    ("Profit & loss (P&L)", "Income minus expenses for a period.", "Accounts"),
    ("Balance sheet", "What the business owns and owes on a date.", "Accounts"),
    ("Bank reconciliation", "Matching your bank book with the bank statement.", "Accounts"),
    ("PDC", "Post-dated cheque: a cheque with a future date.", "Accounts"),
    ("Cheque bounce", "A cheque the bank refused. MENO reverses the receipt and re-opens the bill.", "Accounts"),
    ("Opening balance", "What was owed or held on the day you start using MENO.", "Accounts"),
    ("Period lock", "Closing a month so nobody can post or back-date into it.", "Accounts"),
    ("Draft", "A document still being prepared. It changes nothing until posted.", "MENO"),
    ("Tamper-evident record", "Each posted bill is linked by a fingerprint (hash) to the one before, so any later change shows up.", "MENO"),
    ("Offline billing", "The desktop app keeps billing without internet and sends bills to the server later (sync).", "MENO"),
    ("Sync", "Sending offline bills to the server and getting new masters back.", "MENO"),
    ("Test vector", "A worked example with the exact right answer. MENO's maths must match all of them.", "MENO"),
    ("Effective date", "The date a setting or rate starts. Old bills keep the old rate; new ones use the new rate.", "MENO"),
    ("Role / permission", "A role is a bundle of permissions. MENO checks the permission, never the role name.", "MENO"),
    ("Maker-checker", "A sensitive change needs a second person to approve it.", "MENO"),
    ("Audit log", "The record of who changed what and when.", "MENO"),
    ("Tenant isolation", "One business can never see another business's data.", "MENO"),
    ("DPDP Act", "India's personal data law (2023). Patient data needs consent and protection.", "Law"),
    ("CERT-In", "India's cyber-security agency. Incidents must be reported within 6 hours.", "Law"),
    ("DLT", "Registration for business SMS in India: sender ID and templates must be registered.", "Law"),
    ("ABHA / ABDM", "Ayushman Bharat health ID and digital mission; links health records with consent.", "Law"),
    ("e-pharmacy", "Online sale of medicines. Rules were drafted in 2018 but never notified.", "Law"),
]
for t, m, cat in EXTRA:
    glossary.append([t, m, cat])
glossary.sort(key=lambda g: g[0].lower())

DATA = json.dumps({"features": features, "pages": pages, "glossary": glossary}, ensure_ascii=False, separators=(",", ":"))

# ---------- page ----------
CSS = r"""
<title>MENO Learning Guide</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* Layout: prescription-paper reading column with a sticky chapter rail; worked examples printed as bill slips. */
:root{
  --bg:#f4f7f6; --surface:#ffffff; --ink:#13211e; --muted:#566661; --line:#d9e2df;
  --accent:#0b7566; --accent-soft:#e2f1ed; --warn:#9a4a07; --warn-soft:#fbefdf; --bad:#a8261b; --slip:#fffdf8; --code:#edf2f0;
  --display:"Plus Jakarta Sans",ui-sans-serif,system-ui,sans-serif;
  --text:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#0e1513; --surface:#141c1a; --ink:#e3ece9; --muted:#9bb0aa; --line:#25332f;
  --accent:#3fc2ac; --accent-soft:#13302a; --warn:#f0a95a; --warn-soft:#30230f; --bad:#f0826f; --slip:#1a2220; --code:#1b2523; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#0e1513; --surface:#141c1a; --ink:#e3ece9; --muted:#9bb0aa; --line:#25332f;
  --accent:#3fc2ac; --accent-soft:#13302a; --warn:#f0a95a; --warn-soft:#30230f; --bad:#f0826f; --slip:#1a2220; --code:#1b2523; color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 var(--text);-webkit-font-smoothing:antialiased}
a{color:var(--accent)} a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wrap{display:grid;grid-template-columns:260px minmax(0,1fr);gap:40px;max-width:1180px;margin:0 auto;padding-block:28px 80px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
nav.rail{position:sticky;top:calc(env(safe-area-inset-top,0px) + 20px);align-self:start;max-height:calc(100vh - 40px);overflow:auto;font-size:14px}
nav.rail .brand{font:800 20px/1.2 var(--display);letter-spacing:-.01em;margin:0 0 4px}
nav.rail .sub{color:var(--muted);font-size:13px;margin:0 0 16px}
nav.rail ol{list-style:none;margin:0;padding:0;display:grid;gap:1px;counter-reset:ch}
nav.rail li a{display:flex;gap:10px;padding:6px 8px;border-radius:6px;color:var(--ink);text-decoration:none}
nav.rail li a:hover{background:var(--accent-soft)}
nav.rail li a .n{color:var(--muted);font:600 12px/1.9 var(--mono);min-width:22px}
nav.rail li a.on{background:var(--accent-soft);color:var(--accent);font-weight:600}
main{min-width:0;max-width:780px}
header.hero{padding:8px 0 28px;border-bottom:1px solid var(--line);margin-bottom:8px}
.eyebrow{font:600 12px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
h1{font:800 clamp(30px,5vw,44px)/1.08 var(--display);letter-spacing:-.02em;margin:10px 0 12px;text-wrap:balance}
h2{font:700 26px/1.2 var(--display);letter-spacing:-.01em;margin:0 0 10px;text-wrap:balance}
h3{font:700 18px/1.3 var(--display);margin:26px 0 6px}
section.ch{padding:44px 0 8px;border-bottom:1px solid var(--line);scroll-margin-top:16px}
.lead{font-size:18px;color:var(--muted);max-width:62ch}
p,li{max-width:66ch}
.chno{font:600 12px/1 var(--mono);color:var(--muted);letter-spacing:.06em}
.note{border-left:3px solid var(--accent);background:var(--accent-soft);padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0}
.warn{border-left:3px solid var(--warn);background:var(--warn-soft);padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0}
.flow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:16px 0}
.flow span{background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:6px 12px;font-size:14px}
.flow i{color:var(--muted);font-style:normal}
table{border-collapse:collapse;width:100%;font-size:14.5px}
.tbl{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--surface);margin:14px 0}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-weight:600;color:var(--muted);font-size:13px;background:var(--code)}
tr:last-child td{border-bottom:0}
code,.mono{font-family:var(--mono);font-size:.9em}
code{background:var(--code);padding:1px 5px;border-radius:4px}
.slip{background:var(--slip);border:1px dashed var(--muted);border-radius:6px;padding:14px 16px;font:14px/1.55 var(--mono);max-width:460px;margin:14px 0;font-variant-numeric:tabular-nums}
.slip .row{display:flex;justify-content:space-between;gap:16px}
.slip .tot{border-top:1px dashed var(--muted);margin-top:6px;padding-top:6px;font-weight:600}
.slip .cap{font-family:var(--text);font-size:12px;color:var(--muted);margin-bottom:6px;letter-spacing:.04em;text-transform:uppercase}
.calc{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;margin:18px 0;display:grid;gap:12px}
.calc h4{margin:0;font:700 15px/1.3 var(--display)}
.fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}
.fields label{display:grid;gap:4px;font-size:12.5px;color:var(--muted)}
input,select{font:15px var(--mono);padding:7px 9px;border:1px solid var(--line);border-radius:7px;background:var(--bg);color:var(--ink);width:100%}
.steps{counter-reset:s;list-style:none;padding:0;margin:14px 0;display:grid;gap:10px}
.steps>li{counter-increment:s;display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px}
.steps>li::before{content:counter(s);font:700 13px/28px var(--mono);text-align:center;width:28px;height:28px;border-radius:50%;background:var(--accent-soft);color:var(--accent)}
.search{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.search input{flex:1 1 220px}.search select{flex:0 1 180px}
.count{font-size:13px;color:var(--muted)}
.pill{display:inline-block;font:600 11px/1.6 var(--mono);padding:0 7px;border-radius:999px;background:var(--code);color:var(--muted);white-space:nowrap}
.pill.must{background:var(--accent-soft);color:var(--accent)}
.pill.a{background:var(--warn-soft);color:var(--warn)}
details.q{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin:8px 0}
details.q summary{cursor:pointer;font-weight:600}
.kbd{font:600 12px var(--mono);border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;padding:1px 6px;background:var(--surface)}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin:14px 0}
.card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px}
.card b{display:block;font-family:var(--display);margin-bottom:4px}
.menu-btn{display:none}
@media (max-width:900px){
  .wrap{grid-template-columns:minmax(0,1fr);gap:0}
  nav.rail{position:static;max-height:none;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:8px}
  nav.rail ol{display:none} nav.rail.open ol{display:grid}
  .menu-btn{display:inline-block;margin-top:4px;font:600 13px var(--text);padding:6px 12px;border-radius:7px;border:1px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer}
}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>
"""

def slip(cap, rows, total=None):
    r = "".join(f'<div class="row"><span>{html.escape(a)}</span><span>{html.escape(b)}</span></div>' for a, b in rows)
    t = f'<div class="row tot"><span>{html.escape(total[0])}</span><span>{html.escape(total[1])}</span></div>' if total else ""
    return f'<div class="slip"><div class="cap">{html.escape(cap)}</div>{r}{t}</div>'


def flow(*steps):
    return '<div class="flow">' + '<i>→</i>'.join(f"<span>{html.escape(s)}</span>" for s in steps) + "</div>"


def table(head, rows):
    h = "".join(f"<th>{x}</th>" for x in head)
    b = "".join("<tr>" + "".join(f"<td>{x}</td>" for x in r) + "</tr>" for r in rows)
    return f'<div class="tbl"><table><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table></div>'


def quiz(items):
    return "".join(f'<details class="q"><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>' for q, a in items)


CH = []

CH.append(("start", "Start here", f"""
<p class="lead">This guide teaches pharmacy billing and the MENO software from zero. No pharmacy or accounting knowledge is needed. Every chapter uses simple words and real numbers.</p>
<h3>How to use this guide</h3>
<ol class="steps">
<li><div><b>Read chapters 1–3 first.</b> They explain the business and the ten ideas everything else is built on.</div></li>
<li><div><b>Then follow the daily work</b>: setting up, buying, selling, returns, money, accounts, GST.</div></li>
<li><div><b>Try the calculators.</b> Change the numbers and watch the bill change. They use the same rules as MENO.</div></li>
<li><div><b>Look words up</b> in the Glossary ({len(glossary)} terms) whenever something is new.</div></li>
<li><div><b>Browse the full lists</b> of all {len(features)} features and {len(pages)} screens, and test yourself with the quiz.</div></li>
</ol>
<h3>A 7-day learning plan</h3>
{table(["Day","Read","Practise"],[
["1","Chapters 1–3: the business, ten key ideas, the MENO tour","Learn 20 glossary words"],
["2","Chapters 4–5: setting up and masters","MENO Hub → Learn → Day 21 demo: add a vendor and a customer"],
["3","Chapter 6: buying stock","Purchase calculator: try free goods"],
["4","Chapters 7–8: counter billing and restricted medicines","Counter calculator and loose-sale calculator"],
["5","Chapters 9–10: wholesale, returns, expiry","Demo: wholesale invoice with returns"],
["6","Chapters 11–13: money, accounts, GST","Interest calculator; read a voucher"],
["7","Chapters 14–15, then the feature and page lists","Quiz: aim for 15 out of 15"]])}
<div class="note">Numbers in this guide match MENO's test cases (<code>contracts/test-vectors</code>), and MENO's billing engine passes all of them. Rules marked "to confirm" are researched but still waiting for a chartered accountant, pharmacist or lawyer to sign off.</div>
"""))

CH.append(("business", "The pharmacy business", f"""
<p class="lead">Medicines travel from the company that makes them to the patient through a few hands. Each step adds a margin and a bill.</p>
{flow("Manufacturer","C&F agent / stockist","Distributor (wholesale)","Pharmacy (retail)","Patient")}
{table(["Who","Buys at","Sells at","Pays"],[
["Distributor","PTS (price to stockist), without GST","PTR (price to retailer), without GST","Usually on credit, 15–45 days"],
["Pharmacy","PTR + GST","MRP or less (GST already inside MRP)","Patients pay cash, UPI or card; some regulars on credit"],
["Patient","MRP or less","—","On the spot"]])}
<h3>The five things that must always be right</h3>
<div class="grid2">
<div class="card"><b>Price</b>Never more than the MRP printed on the pack. Discounts within limits.</div>
<div class="card"><b>Tax</b>GST at the right rate for the medicine, split correctly by state.</div>
<div class="card"><b>Stock by batch</b>Which batch, how many, when it expires.</div>
<div class="card"><b>Legal records</b>Prescriptions and registers for restricted medicines.</div>
<div class="card"><b>Money owed</b>Who owes whom, how much, since when.</div>
</div>
<h3>Two editions of MENO</h3>
<p><b>Retail</b> is for the pharmacy counter: fast billing, offline desktop app, prescriptions. <b>Wholesale</b> is for distributors: orders, credit, schemes, dispatch, e-invoice. Masters, stock, GST, accounts and reports are shared.</p>
"""))

CH.append(("ideas", "Ten key ideas", """
<p class="lead">Learn these ten and the rest of MENO makes sense.</p>
<ol class="steps">
<li><div><b>MRP already includes GST.</b> At the counter MENO works backwards: price ÷ (1 + GST%) = taxable value; the rest is GST.</div></li>
<li><div><b>PTR does not include GST.</b> Wholesale bills add GST on top of the PTR.</div></li>
<li><div><b>Every medicine is sold by batch.</b> A batch has a number, an expiry month and its own MRP and cost.</div></li>
<li><div><b>First expiry, first out (FEFO).</b> MENO picks the batch that expires first. Expired batches can never be sold.</div></li>
<li><div><b>The GST rate comes from the HSN code and the date.</b> Nobody types the rate on a bill. Most medicines are 5 % from 22 Sept 2025, some are Nil, some 18 %.</div></li>
<li><div><b>Same state → CGST + SGST. Different state → IGST.</b> The total tax is the same; it is split differently.</div></li>
<li><div><b>Restricted medicines need a prescription.</b> Schedule H, H1, X and narcotics. H1 sales are written into a legal register.</div></li>
<li><div><b>A saved (posted) bill never changes.</b> Mistakes are fixed with a new document: a credit note, a debit note or a reversal.</div></li>
<li><div><b>Stock is a list of movements.</b> Every in and out is a row. The stock number is just the sum, so it can always be checked.</div></li>
<li><div><b>Every bill creates accounting entries by itself.</b> Debits equal credits, always. Nobody types the books.</div></li>
</ol>
"""))

CH.append(("tour", "A tour of MENO", f"""
<p class="lead">Who uses MENO, what they see, and how the menu is arranged.</p>
{table(["Role","Opens on","Does all day"],[
["Business owner","Dashboard","Sales, profit, approvals, settings"],
["Branch manager","Dashboard (own branches)","Stock, staff, approvals"],
["Pharmacist","POS","Prescriptions, restricted medicines, billing"],
["Billing operator","POS","Bills, held bills, returns within limits"],
["Inventory manager","Inventory dashboard","Purchases, batches, expiry, counts, transfers"],
["Accountant","Finance dashboard","Receipts, payments, GST, reports"],
["Wholesale manager","Wholesale dashboard","Orders, schemes, credit, dispatch"],
["Sales representative","Salesman orders","Visits, orders, collections"],
["Auditor","Reports","Read-only checks"]])}
<p>MENO checks <b>permissions</b> (like "post a sales invoice"), not role names. An owner can give any permission to any role.</p>
<h3>Menu groups</h3>
{flow("Dashboard","Sales","Purchase","Inventory","Wholesale","Masters","Finance","GST","Compliance","CRM","Reports","Admin")}
<h3>Keyboard at the counter</h3>
{table(["Key","Does"],[
['<span class="kbd">F2</span>',"Search item or scan barcode"],
['<span class="kbd">F3</span>',"Choose or add customer"],
['<span class="kbd">F4</span>',"Doctor and prescription"],
['<span class="kbd">F6</span> / <span class="kbd">F7</span>',"Hold bill / recall held bill"],
['<span class="kbd">F9</span>',"Payment"],
['<span class="kbd">F10</span>',"Save and print (pressing twice never makes two bills)"],
['<span class="kbd">F12</span>',"Return mode"]])}
"""))

CH.append(("setup", "Setting up a shop", f"""
<p class="lead">Done once, in about 30 minutes for a small shop. MENO saves every step, so you can stop and come back.</p>
<ol class="steps">
<li><div><b>Sign up and verify</b> your mobile (OTP) and email.</div></li>
<li><div><b>Business profile</b>: retail, wholesale or both; how many branches; which software you use today.</div></li>
<li><div><b>Company and GST</b>: type the GSTIN and press Fetch. Name, address and state fill in. The state is locked to the GSTIN, because a wrong state is the most common GST mistake.</div></li>
<li><div><b>Licences and pharmacist</b>: drug licence numbers with expiry, and the pharmacist in charge.</div></li>
<li><div><b>Branches and counters</b>, then <b>books</b>: financial year (April–March), bank accounts, opening balances. Debits must equal credits.</div></li>
<li><div><b>Billing preferences</b>: bill number pattern, rounding, discount limits, invoice look with a live preview.</div></li>
<li><div><b>Team</b>: invite staff with roles.</div></li>
<li><div><b>Data</b>: start fresh, import Excel, or move data from Marg, Tally, Busy or Vyapar. MENO shows errors first and imports only after you approve.</div></li>
<li><div><b>Devices</b>: install the desktop app, test the printer and scanner.</div></li>
<li><div><b>Practice</b> on a sample company, then <b>go live</b>. MENO checks everything is ready first.</div></li>
</ol>
"""))

CH.append(("masters", "Masters: the lists everything uses", f"""
<p class="lead">Masters are the reference lists: who you buy from, who you sell to, what you sell. Bills copy from them.</p>
{table(["Master","Key fields","Why it matters"],[
["Supplier (vendor)","GSTIN, drug licence and expiry, contacts, addresses, bank, PAN, MSME, credit days","Purchases, payments, input tax, MSME 15/45-day rule"],
["Customer","Phone, type (person or pharmacy), GSTIN, licence, credit limit and days; patient details for a person","Billing, credit, reminders, H1 register"],
["Medicine (product)","Name, salt and strength, pack, schedule, HSN (gives GST), storage, rack, min / max / reorder, price caps","Search, prescription check, tax, stock alerts"],
["Doctor","Name, registration no. and state council","Prescriptions and H1 register"],
["Ledger","Name and group (asset, liability, income, expense)","Where money is recorded"]])}
<div class="note">Batch, expiry and MRP are <b>not</b> on the medicine master. They come with each purchase, because each batch can differ.</div>
<p>Try it: MENO Hub → Learn → Day 21 has a click-through demo of these forms with every field explained.</p>
"""))

CH.append(("purchase", "Buying stock", f"""
<p class="lead">A supplier sends a bill. You enter it (or import it). Stock goes up by batch, and you now owe the supplier.</p>
{flow("Supplier bill arrives","Enter or import","MENO checks","Totals match the paper bill","Post","Stock in + supplier owed + input GST")}
<h3>What MENO checks</h3>
<ul><li>The same supplier bill number cannot be entered twice.</li><li>Expired batches are blocked; near-expiry ones warn.</li><li>Rates or MRP different from last time are highlighted.</li><li>Your total must match the supplier's printed total within ₹1.</li></ul>
<h3>Worked example: free goods</h3>
{slip("Purchase line (PTR excludes GST)",[("Paracip 650, 10 strips × ₹24.00","240.00"),("Free","1 strip"),("Taxable value","240.00"),("GST 5 % (CGST 6.00 + SGST 6.00)","12.00")],("Line total","₹252.00"))}
<p>Stock goes up by <b>11</b> strips, not 10. The free strip makes each strip cheaper.</p>
<h3>Landed cost: what one unit really cost</h3>
<p>Landed cost = (taxable value + share of freight + any GST you cannot claim back) ÷ (billed + free units).</p>
{slip("Landed cost",[("Taxable value","240.00"),("Freight share (₹50 split by value)","18.14"),("Units (10 billed + 1 free)","11")],("Cost per strip","₹23.4673"))}
<div class="calc" id="calc-ptr"><h4>Purchase line calculator</h4>
<div class="fields">
<label>PTR (₹)<input id="p-rate" value="24.00" inputmode="decimal"></label>
<label>Qty<input id="p-qty" value="10" inputmode="numeric"></label>
<label>Free<input id="p-free" value="1" inputmode="numeric"></label>
<label>Scheme %<input id="p-sch" value="0" inputmode="decimal"></label>
<label>Trade disc %<input id="p-td" value="0" inputmode="decimal"></label>
<label>GST %<select id="p-gst"><option>0</option><option selected>5</option><option>18</option></select></label>
<label>Same state?<select id="p-intra"><option value="1" selected>Yes</option><option value="0">No</option></select></label>
</div><div class="slip" id="p-out"></div></div>
"""))

CH.append(("pos", "Selling at the counter", f"""
<p class="lead">The busiest screen. Scan, check, take payment, print. It must be fast and must never break a rule.</p>
{flow("Scan or search (F2)","MENO picks first-expiry batch","Checks","Payment (F9)","Save and print (F10)")}
<h3>Checks on every line</h3>
<ul><li>Expired or banned medicine → blocked.</li><li>Schedule H / H1 / X → doctor and prescription before saving (F4).</li><li>Allergy listed for this patient → warning the pharmacist must acknowledge.</li><li>Discount above your limit → manager PIN.</li><li>Price above MRP → never allowed.</li></ul>
<h3>Worked example: MRP already includes GST</h3>
{slip("Counter bill",[("Paracip 650, 2 strips × MRP 33.60","67.20"),("Discount 10 %","−6.72"),("Amount paid (incl. GST)","60.48"),("Taxable value = 60.48 ÷ 1.05","57.60"),("CGST 2.5 % + SGST 2.5 %","1.44 + 1.44"),("Round off","−0.48")],("To pay","₹60.00"))}
<div class="calc" id="calc-mrp"><h4>Counter bill calculator</h4>
<div class="fields">
<label>MRP (₹)<input id="m-rate" value="33.60" inputmode="decimal"></label>
<label>Qty<input id="m-qty" value="2" inputmode="numeric"></label>
<label>Discount %<input id="m-disc" value="10" inputmode="decimal"></label>
<label>GST %<select id="m-gst"><option>0</option><option selected>5</option><option>18</option></select></label>
<label>Same state?<select id="m-intra"><option value="1" selected>Yes</option><option value="0">No</option></select></label>
</div><div class="slip" id="m-out"></div></div>
<h3>Loose tablets</h3>
<p>Price of one tablet = MRP of the strip ÷ tablets in the strip. Stock goes down by a part of a strip.</p>
<div class="calc" id="calc-loose"><h4>Loose sale calculator</h4>
<div class="fields">
<label>Strip MRP (₹)<input id="l-mrp" value="33.60" inputmode="decimal"></label>
<label>Tablets per strip<input id="l-units" value="15" inputmode="numeric"></label>
<label>Tablets sold<input id="l-qty" value="5" inputmode="numeric"></label>
<label>GST %<select id="l-gst"><option>0</option><option selected>5</option><option>18</option></select></label>
</div><div class="slip" id="l-out"></div></div>
<h3>Payment</h3>
<p>Cash, UPI, card, credit, or a mix. MENO shows change for cash. Credit is only for a saved customer within their limit. Pressing F10 twice still makes one bill.</p>
<h3>No internet?</h3>
<p>The desktop app keeps billing with the same maths and sends the bills later. Each offline bill is signed by the counter PC so it cannot be faked.</p>
"""))

CH.append(("restricted", "Restricted medicines and registers", f"""
<p class="lead">Some medicines can only be sold on a doctor's prescription. The law also asks for records.</p>
{table(["Group","Rule","What MENO does"],[
["OTC","No prescription needed","Normal billing"],
["Schedule H","Prescription required","Blocks saving until doctor and prescription are entered"],
["Schedule H1","Prescription + separate register: prescriber name and address, patient name, medicine, quantity; kept 3 years","Writes the register automatically from the bill"],
["Schedule X","Stricter records and prescription copy","Separate register (to confirm with pharmacist)"],
["Narcotics (NDPS)","Separate state licence","Blocked in the pilot until set up"],
["Banned combinations","Never sell","Blocked at purchase and sale"]])}
<div class="note">A registered pharmacist must supervise the sale of prescription medicines. Expired stock must be kept apart, marked not for sale, and returned or destroyed properly.</div>
<p>Price control: for essential medicines the government sets a <b>ceiling price</b>. You can never charge more than the lower of the price-list price and the label price.</p>
"""))

CH.append(("wholesale", "Selling to pharmacies (wholesale)", f"""
<p class="lead">A distributor sells to many pharmacies on credit. The day runs from orders to collections.</p>
{flow("Order (rep app, phone, portal)","Checks: licence, credit","Invoice at PTR + schemes","Dispatch check by scan","e-invoice / e-way bill","Delivery","Collection by due date")}
<h3>Terms you will see</h3>
<ul><li><b>Credit days</b>: due date = bill date + credit days.</li><li><b>Schemes</b>: "10 + 1" free goods, scheme %, trade discount, cash discount. On the bill they all lower the taxable value before GST.</li><li><b>E-invoice</b>: needed when yearly turnover is above ₹5 crore. <b>E-way bill</b>: needed when goods worth more than ₹50,000 move.</li></ul>
<h3>Worked example: one printed bill with returns</h3>
<p>A distributor's bill can show sales, minus returns, minus broken or expired goods, plus replacements, plus freight. Underneath, each return is a separate credit note.</p>
{slip("Combined bill, other state (IGST)",[("Sales + replacement (after discount)","484.47"),("Less returns (credit notes)","−115.50"),("Freight + insurance","125.00"),("IGST (sales − returns + 18 % on charges)","83.96"),("Round off","0.07")],("Grand total","₹578.00"))}
"""))

CH.append(("returns", "Returns, expiry and claims", f"""
{table(["Situation","What happens in MENO"],[
["A patient returns a strip","Sales return against the original bill: same batch, same price and GST. Stock goes back only if it passes inspection. Refund or credit note."],
["Stock is near expiry","Shown at 30 / 60 / 90 days. Return to supplier, discount it, or move it to a branch where it sells."],
["Stock expired or broken","Kept apart. Returned to the supplier as a claim; the supplier's credit note settles it. Or destroyed with a record."],
["A wrong rate on an old bill","A money-only credit or debit note. No stock changes."],
["A return with no bill","Off by default. If the shop allows it: only sealed, unexpired, non-prescription items, with manager approval."]])}
<div class="warn">GST on a credit note can only be reduced if it is reported by 30 November after the financial year ends.</div>
"""))

CH.append(("money", "Money: who owes whom", f"""
<p class="lead">Every supplier and customer has an account (a ledger). Bills add to it; payments take from it.</p>
<h3>Matching a payment to bills</h3>
<p>MENO pays the oldest bills first unless you choose. Extra money stays "on account".</p>
{slip("Customer pays ₹650",[("Bill A (oldest)","500.00 paid"),("Bill B","150.00 of 300.00 paid")],("Left on account","₹0.00"))}
<h3>Credit control</h3>
<p>Before a credit sale MENO adds: what they owe now + unposted orders + this bill. If that is above the limit, the owner must approve.</p>
<h3>Interest on late payment</h3>
<p>Simple interest = amount × rate % × days ÷ 365. GST also applies to interest you charge for late payment.</p>
<div class="calc" id="calc-int"><h4>Interest calculator</h4>
<div class="fields">
<label>Overdue (₹)<input id="i-amt" value="10000.00" inputmode="decimal"></label>
<label>Rate % a year<input id="i-rate" value="18" inputmode="decimal"></label>
<label>Days late<input id="i-days" value="30" inputmode="numeric"></label>
<label>Days in year<select id="i-basis"><option>365</option><option>360</option></select></label>
</div><div class="slip" id="i-out"></div></div>
<h3>Tax deducted from payments (TDS)</h3>
<p>Big buyers (turnover above ₹10 crore) keep back 0.1 % when their purchases from one seller cross ₹50 lakh in a year. MENO reads these numbers from settings, because the law changes (the new Income Tax Act applies from 1 April 2026).</p>
<h3>Paying small suppliers on time</h3>
<p>Micro and small (MSME) suppliers must be paid within 15 days, or up to 45 days with a written agreement. Otherwise the expense is only allowed for income tax when it is paid.</p>
"""))

CH.append(("accounts", "Accounts happen by themselves", f"""
<p class="lead">Every saved bill creates a voucher with equal debits and credits. From vouchers come all the books.</p>
<h3>Debit and credit in plain words</h3>
<p>Think of each account as a box. <b>Debit</b> means value goes into a box you own or a cost you paid (cash, stock, expenses, customers who owe you). <b>Credit</b> means where it came from (sales, suppliers you owe, your capital). Both sides always add up to the same amount.</p>
{table(["Event","Debit","Credit"],[
["Cash sale ₹60 (GST ₹2.88)","Cash 60.00","Sales 57.60 · Output CGST 1.44 · Output SGST 1.44 · Round off"],
["Credit sale to a pharmacy","That pharmacy","Sales · Output GST"],
["Purchase on credit","Purchase · Input GST","Supplier"],
["Customer pays","Cash or bank","Customer"],
["Expired stock written off","Expiry loss","Stock"]])}
<p>Reports you get without typing: day book, cash book, bank book, ledgers, trial balance, profit and loss, balance sheet, outstanding and ageing.</p>
"""))

CH.append(("gst", "GST month end and year end", f"""
{table(["When","What","In MENO"],[
["Every day","Count cash, close the counter, owner gets a summary","Counter closing, daily digest"],
["Every night","Stock checked against movements, record chains verified, backup","Automatic"],
["Every month","GSTR-1 (sales) and GSTR-3B (tax summary) prepared and exported; purchases matched with GSTR-2B and accepted / rejected in IMS; expiry returns sent; month locked","GST screens, period lock"],
["Every year","Year closing; GSTR-9 if turnover is above ₹2 crore; keep records 72 months after the yearly return's due date","Year closing, retention policy"]])}
<div class="note">MENO prepares, checks and exports GST data. You or your accountant file it on the GST portal.</div>
"""))

CH.append(("stock", "Stock control", f"""
<ul>
<li><b>FEFO</b>: the earliest-expiry batch goes first. Changing it needs permission and a reason.</li>
<li><b>Reorder</b>: average daily sale × supplier lead time + safety stock = reorder point. Suggested order = maximum − (in hand + on order − reserved).</li>
<li><b>Counts</b>: count the shelf, compare, post the difference with a reason.</li>
<li><b>Transfers</b>: out of one branch, in transit, into another. Between different GSTINs it is a taxable sale with a tax invoice.</li>
<li><b>Expiry status</b>: a batch expires on the last day of its printed month. "11/2026" means 30 Nov 2026.</li>
<li><b>Average cost</b>: after each purchase, cost = (old stock × old cost + new units × new cost) ÷ all units.</li>
</ul>
{slip("Reorder example",[("Sold in last 30 days","60 strips"),("Average per day","2.0000"),("Lead time 2 days + safety 5","2 × 2 + 5 = 9"),("Max 60, in hand 10","order 50")],("Reorder point","9 strips"))}
"""))

CH.append(("safety", "Safety, security and data", f"""
<div class="grid2">
<div class="card"><b>Your data only</b>One business can never see another's data.</div>
<div class="card"><b>No double bills</b>A repeated save returns the same bill.</div>
<div class="card"><b>Proof nothing changed</b>Saved bills and registers are linked by fingerprints; any change is detected.</div>
<div class="card"><b>Who did what</b>Every change is in the audit log.</div>
<div class="card"><b>Safer sign-in</b>Two-step login for owners, passkeys, alerts for new devices.</div>
<div class="card"><b>Fraud alerts</b>Too many voids, discounts, returns or after-hours bills are flagged to the owner.</div>
<div class="card"><b>Backups</b>Encrypted copies in a second region; restores are practised.</div>
<div class="card"><b>Rules as settings</b>Tax rates and limits are dated settings, so law changes need no new code.</div>
</div>
"""))

CH.append(("glossary", "Glossary", """
<p class="lead">Every term in simple English. Type to search.</p>
<div class="search"><input id="g-q" type="search" placeholder="Search terms, e.g. PTR, batch, H1" aria-label="Search glossary"><select id="g-cat" aria-label="Category"><option value="">All categories</option></select></div>
<div class="count" id="g-count"></div>
<div class="tbl"><table><thead><tr><th>Term</th><th>Meaning</th><th>Area</th></tr></thead><tbody id="g-body"></tbody></table></div>
"""))

CH.append(("features", "Every feature", """
<p class="lead">The full list from MENO's plan. Search by word or ID, filter by area, phase or pilot wave.</p>
<div class="search"><input id="f-q" type="search" placeholder="Search features, e.g. expiry, GST, POS-06" aria-label="Search features"><select id="f-sec" aria-label="Area"><option value="">All areas</option></select><select id="f-ph" aria-label="Phase"><option value="">All phases</option></select><select id="f-pilot" aria-label="Pilot"><option value="">Any wave</option><option value="A">Pilot A (one retail shop)</option><option value="B">Pilot B (wholesale, finance)</option><option value="-">After pilot</option></select></div>
<div class="count" id="f-count"></div>
<div class="tbl"><table><thead><tr><th>ID</th><th>Feature</th><th>For</th><th>Phase</th><th>Priority</th></tr></thead><tbody id="f-body"></tbody></table></div>
"""))

CH.append(("pages", "Every screen", """
<p class="lead">All screens MENO will have, with their address and what they do.</p>
<div class="search"><input id="s-q" type="search" placeholder="Search screens, e.g. expiry, ledger, /sales" aria-label="Search screens"><select id="s-sec" aria-label="Section"><option value="">All sections</option></select></div>
<div class="count" id="s-count"></div>
<div class="tbl"><table><thead><tr><th>Screen</th><th>Address</th><th>What it does</th><th>Phase</th></tr></thead><tbody id="s-body"></tbody></table></div>
"""))

CH.append(("quiz", "Test yourself", quiz([
    ("Does MRP include GST?", "Yes. At the counter MENO divides by (1 + GST %) to find the taxable value."),
    ("Does PTR include GST?", "No. GST is added on top of PTR on a wholesale bill."),
    ("A customer in the same state buys medicine with 5 % GST. Which taxes?", "CGST 2.5 % + SGST 2.5 %. For another state it would be IGST 5 %."),
    ("Which batch does MENO sell first?", "The one that expires first (FEFO)."),
    ("Can you sell a batch that expired yesterday?", "No. MENO blocks it."),
    ("What does Schedule H1 need at the counter?", "A prescription, and a register entry with prescriber, patient, medicine and quantity, kept 3 years."),
    ("You entered a bill with a mistake and saved it. Can you edit it?", "No. Make a credit note, debit note or reversal. Saved bills never change."),
    ("10 strips + 1 free. How much does stock go up?", "11 strips."),
    ("What is landed cost?", "What one unit really cost after discounts, free goods and freight."),
    ("A strip of 15 tablets has MRP ₹33.60. Price of one tablet?", "₹2.24."),
    ("Customer pays ₹650; bills of ₹500 and ₹300 are open. What happens?", "₹500 clears the older bill, ₹150 goes to the second; ₹150 is still due on it."),
    ("Who files GST returns?", "You or your accountant on the GST portal. MENO prepares and exports the data."),
    ("When is e-invoice needed?", "When yearly turnover is above ₹5 crore."),
    ("What is a credit note?", "A document that reduces what a party owes, for example after a return."),
    ("Why are tax rates settings, not code?", "Because laws change. A dated setting changes new bills without touching old ones or the software."),
])))

CH.append(("next", "Where to go next", """
<p>All of these are in the MENO repository.</p>
<div class="tbl"><table><tbody>
<tr><td>How a pharmacy works (detailed)</td><td><code>docs/product/HOW_A_PHARMACY_WORKS.md</code></td></tr>
<tr><td>All features / all screens</td><td><code>docs/product/FEATURES.md</code> · <code>docs/product/PAGES.md</code></td></tr>
<tr><td>Fields on every form and document</td><td><code>docs/product/MASTER_FIELDS.md</code> · <code>docs/product/DOCUMENT_FIELDS.md</code></td></tr>
<tr><td>Formulas</td><td><code>docs/architecture/CALCULATIONS.md</code></td></tr>
<tr><td>Proof of the maths</td><td><code>contracts/test-vectors/</code> and <code>packages/billing-engine</code></td></tr>
<tr><td>Law and tax answers with sources</td><td><code>docs/compliance/RESEARCHED_ANSWERS.md</code></td></tr>
<tr><td>Backend design</td><td><code>docs/architecture/BACKEND_IMPLEMENTATION.md</code></td></tr>
<tr><td>Hands-on demo</td><td>MENO Hub → Learn → Day 21</td></tr>
</tbody></table></div>
"""))

nav = "".join(f'<li><a href="#{cid}" data-id="{cid}"><span class="n">{i:02d}</span><span>{html.escape(t)}</span></a></li>' for i, (cid, t, _) in enumerate(CH))
body = "".join(f'<section class="ch" id="{cid}"><div class="chno">CHAPTER {i:02d}</div><h2>{html.escape(t)}</h2>{c}</section>' for i, (cid, t, c) in enumerate(CH))

JS = r"""
<script>
// Host pages (MENO Hub) pass their theme as ?theme=dark|light; the guide follows it.
try { const th=new URLSearchParams(location.search).get('theme'); if(th==='dark'||th==='light') document.documentElement.dataset.theme=th; } catch(e) {}
const DATA = __DATA__;
const SCALE = 10000n;
function m(v){ v=String(v).trim(); if(!/^-?\d*(\.\d*)?$/.test(v)||v===''||v==='.'||v==='-') return null; const neg=v.startsWith('-'); if(neg) v=v.slice(1); const [i,f='']=v.split('.'); const x=BigInt(i||'0')*SCALE+BigInt((f+'0000').slice(0,4)); return neg?-x:x; }
function divR(a,b){ const neg=(a<0n)!==(b<0n); const x=a<0n?-a:a, y=b<0n?-b:b; const q=(x*2n+y)/(2n*y); return neg?-q:q; }
const mul=(a,b)=>divR(a*b,SCALE), pct=(a,p)=>divR(a*p,SCALE*100n), div=(a,b)=>divR(a*SCALE,b);
function rnd(a,dp){ const u=10n**BigInt(4-dp); return divR(a,u)*u; }
function f(a,dp=2){ const r=rnd(a,dp); const neg=r<0n; const x=neg?-r:r; const s=(x/SCALE).toString()+(dp?'.'+(x%SCALE).toString().padStart(4,'0').slice(0,dp):''); return (neg&&r!==0n?'−':'')+s; }
const minus=x=>x>0n?'−'+f(x):f(0n);
function rows(cap, list, tot){ return '<div class="cap">'+cap+'</div>'+list.map(([a,b])=>'<div class="row"><span>'+a+'</span><span>'+b+'</span></div>').join('')+(tot?'<div class="row tot"><span>'+tot[0]+'</span><span>'+tot[1]+'</span></div>':''); }
const val=id=>document.getElementById(id).value;
function line(mode, rate, qty, sch, disc, g, intra){
  const gross=mul(rate,qty), s=pct(gross,sch), d=pct(gross-s,disc), amt=gross-s-d; let tax, gst;
  if(mode==='MRP'){ const t4=div(amt*100n, (100n*SCALE)+g); gst=rnd(amt-t4,2); tax=amt-gst; } else { tax=amt; gst=rnd(pct(tax,g),2); }
  const c=intra?rnd(div(gst,2n*SCALE),2):0n; return {gross,s,d,amt,tax,gst,cgst:c,sgst:intra?gst-c:0n,igst:intra?0n:gst,total:tax+gst};
}
function calcMrp(){ const r=m(val('m-rate')),q=m(val('m-qty')),d=m(val('m-disc')),g=m(val('m-gst')),intra=val('m-intra')==='1'; const o=document.getElementById('m-out');
  if([r,q,d,g].some(x=>x===null)){o.innerHTML='<div class="cap">Enter numbers like 33.60</div>';return;}
  const L=line('MRP',r,q,0n,d,g,intra), grand=rnd(L.total,0);
  o.innerHTML=rows('Counter bill',[['Gross (MRP × qty)',f(L.gross)],['Discount',minus(L.d)],['Amount (incl. GST)',f(L.amt)],['Taxable value',f(L.tax)],intra?['CGST + SGST',f(L.cgst)+' + '+f(L.sgst)]:['IGST',f(L.igst)],['Round off',f(grand-L.total)]],['To pay','₹'+f(grand)]); }
function calcPtr(){ const r=m(val('p-rate')),q=m(val('p-qty')),fr=m(val('p-free')),s=m(val('p-sch')),d=m(val('p-td')),g=m(val('p-gst')),intra=val('p-intra')==='1'; const o=document.getElementById('p-out');
  if([r,q,fr,s,d,g].some(x=>x===null)||q+fr===0n){o.innerHTML='<div class="cap">Enter numbers like 24.00</div>';return;}
  const L=line('EXC',r,q,s,d,g,intra), units=q+fr;
  o.innerHTML=rows('Purchase line',[['Gross (PTR × qty)',f(L.gross)],['Scheme discount',minus(L.s)],['Trade discount',minus(L.d)],['Taxable value',f(L.tax)],intra?['CGST + SGST',f(L.cgst)+' + '+f(L.sgst)]:['IGST',f(L.igst)],['Stock in (billed + free)',f(units,0)],['Cost per unit (no freight)',f(div(L.tax,units),4)]],['Line total','₹'+f(L.total)]); }
function calcLoose(){ const mr=m(val('l-mrp')),u=m(val('l-units')),q=m(val('l-qty')),g=m(val('l-gst')); const o=document.getElementById('l-out');
  if([mr,u,q,g].some(x=>x===null)||u===0n){o.innerHTML='<div class="cap">Enter numbers like 33.60</div>';return;}
  const per=div(mr,u), L=line('MRP',per,q,0n,0n,g,true);
  o.innerHTML=rows('Loose sale',[['Price per tablet',f(per,4)],['Amount (incl. GST)',f(L.amt)],['Taxable value',f(L.tax)],['GST',f(L.gst)],['Stock out (strips)',f(div(q,u),4)]],['To pay','₹'+f(rnd(L.total,0))]); }
function calcInt(){ const a=m(val('i-amt')),r=m(val('i-rate')),d=m(val('i-days')),b=m(val('i-basis')); const o=document.getElementById('i-out');
  if([a,r,d,b].some(x=>x===null)||b===0n){o.innerHTML='<div class="cap">Enter numbers like 10000.00</div>';return;}
  const i=div(mul(pct(a,r),d),b); o.innerHTML=rows('Simple interest',[['Overdue',f(a)],['Rate a year',f(r)+' %'],['Days',f(d,0)+' of '+f(b,0)]],['Interest','₹'+f(rnd(i,2))]); }
[['m-',calcMrp],['p-',calcPtr],['l-',calcLoose],['i-',calcInt]].forEach(([p,fn])=>{ document.querySelectorAll('[id^="'+p+'"]').forEach(el=>el.addEventListener('input',fn)); fn(); });

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function fill(sel, values){ const s=document.getElementById(sel); [...new Set(values)].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; s.appendChild(o); }); }
fill('g-cat', DATA.glossary.map(g=>g[2]).sort());
fill('f-sec', DATA.features.map(x=>x[5]));
fill('f-ph', DATA.features.map(x=>x[3]).sort());
fill('s-sec', DATA.pages.map(x=>x[4]));
function render(){
  const gq=val('g-q').toLowerCase(), gc=val('g-cat');
  const g=DATA.glossary.filter(x=>(!gc||x[2]===gc)&&(x[0]+' '+x[1]).toLowerCase().includes(gq));
  document.getElementById('g-body').innerHTML=g.map(x=>'<tr><td><b>'+esc(x[0])+'</b></td><td>'+esc(x[1])+'</td><td><span class="pill">'+esc(x[2])+'</span></td></tr>').join('');
  document.getElementById('g-count').textContent=g.length+' of '+DATA.glossary.length+' terms';
  const fq=val('f-q').toLowerCase(), fs=val('f-sec'), fp=val('f-ph'), fw=val('f-pilot');
  const fl=DATA.features.filter(x=>(!fs||x[5]===fs)&&(!fp||x[3]===fp)&&(!fw||x[6]===fw)&&(x[0]+' '+x[1]+' '+x[5]).toLowerCase().includes(fq));
  document.getElementById('f-body').innerHTML=fl.map(x=>'<tr><td class="mono">'+esc(x[0])+'</td><td>'+esc(x[1])+'<div class="count">'+esc(x[5])+'</div></td><td>'+esc(x[2])+'</td><td class="mono">'+esc(x[3])+(x[6]!=='-'?' <span class="pill a">Pilot '+x[6]+'</span>':'')+'</td><td><span class="pill'+(x[4]==='Must'?' must':'')+'">'+esc(x[4])+'</span></td></tr>').join('');
  document.getElementById('f-count').textContent=fl.length+' of '+DATA.features.length+' features';
  const sq=val('s-q').toLowerCase(), ss=val('s-sec');
  const sl=DATA.pages.filter(x=>(!ss||x[4]===ss)&&(x[0]+' '+x[1]+' '+x[2]).toLowerCase().includes(sq));
  document.getElementById('s-body').innerHTML=sl.map(x=>'<tr><td><b>'+esc(x[0])+'</b></td><td class="mono">'+esc(x[1])+'</td><td>'+esc(x[2])+'</td><td class="mono">'+esc(x[3])+'</td></tr>').join('');
  document.getElementById('s-count').textContent=sl.length+' of '+DATA.pages.length+' screens';
}
['g-q','g-cat','f-q','f-sec','f-ph','f-pilot','s-q','s-sec'].forEach(id=>document.getElementById(id).addEventListener('input',render));
render();

const links=[...document.querySelectorAll('nav.rail a')];
const obs=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ links.forEach(a=>a.classList.toggle('on',a.dataset.id===e.target.id)); } }); },{rootMargin:'-20% 0px -70% 0px'});
document.querySelectorAll('section.ch').forEach(s=>obs.observe(s));
document.getElementById('menu').addEventListener('click',()=>{ const n=document.querySelector('nav.rail'); n.classList.toggle('open'); document.getElementById('menu').setAttribute('aria-expanded', n.classList.contains('open')); });
links.forEach(a=>a.addEventListener('click',()=>document.querySelector('nav.rail').classList.remove('open')));
</script>
"""

PAGE = CSS + f"""
<div class="wrap">
<nav class="rail" aria-label="Chapters"><p class="brand">MENO Learning Guide</p><p class="sub">Pharmacy billing from zero</p><button class="menu-btn" id="menu" aria-expanded="false">Chapters</button><ol>{nav}</ol></nav>
<main>
<header class="hero"><div class="eyebrow">Retail + wholesale pharmacy ERP</div><h1>Learn pharmacy billing and MENO, step by step</h1>
<p class="lead">{len(CH)} chapters in simple English, {len(glossary)} terms, four calculators, and the full list of {len(features)} features and {len(pages)} screens.</p></header>
{body}
</main></div>
""" + JS.replace("__DATA__", DATA)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(PAGE)
# Copy served by MENO Hub at /guide/meno-learning-guide.html (signed-in users only, via the Hub middleware).
HUB = ROOT / "project-management/public/guide/meno-learning-guide.html"
HUB.parent.mkdir(parents=True, exist_ok=True)
HUB.write_text('<!doctype html>\n<html lang="en">\n' + PAGE + "\n</html>\n")
print(f"wrote {OUT.relative_to(ROOT)}: {len(PAGE)//1024} KB, {len(CH)} chapters, {len(glossary)} terms, {len(features)} features, {len(pages)} pages")
