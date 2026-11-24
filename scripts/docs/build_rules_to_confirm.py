"""Generates docs/compliance/RULES_TO_CONFIRM.md: every rule marked ⚠ in docs/, grouped by who must confirm it.
Run: python3 scripts/docs/build_rules_to_confirm.py   (re-run whenever docs change; CI can fail if it is stale)

Grouping is keyword-based (EXPERTS below); a rule that matches no keyword goes to "Team decision".
When an expert confirms a rule, remove the ⚠ at its source (with a note of who confirmed and when) and re-run.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
OUT = DOCS / "compliance/RULES_TO_CONFIRM.md"
SKIP = {"product/PAGES.md", "compliance/RULES_TO_CONFIRM.md", "compliance/RESEARCHED_ANSWERS.md", "planning/PILOT_SCOPE.md"}

# Researched answers (docs/compliance/RESEARCHED_ANSWERS.md): | R-nn | Topic | kw1, kw2 | Expert |
ANSWERS = []
for _l in (DOCS / "compliance/RESEARCHED_ANSWERS.md").read_text().splitlines():
    _m = re.match(r"^\| (R-\d{2}) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$", _l)
    if _m:
        _kws = [k.strip() for k in _m.group(3).split(",") if k.strip()]
        ANSWERS.append((_m.group(1), _m.group(2).strip(), re.compile("|".join(_kws), re.I), _m.group(4).strip()))


def answer_for(text: str):
    return next(((aid, topic, expert) for aid, topic, rx, expert in ANSWERS if rx.search(text)), None)


EXPERT_GROUP = {"CA": "Chartered accountant", "Pharmacist": "Pharmacist / drug inspector", "Lawyer": "Lawyer", "Team": "Team decision"}

# Order matters: the first matching expert wins.
EXPERTS = [
    ("Lawyer", r"DPDP|consent|privacy|lawyer|CERT-In|patient data|health data|marketing|opt-out|doctor incentive|legal"),
    ("Pharmacist / drug inspector", r"Schedule|H1|NDPS|narcotic|pharmacist|drug licen|dosage|label|prescription|\bRx\b|ceiling|NPPA|DPCO|banned|recall|destruction|CDSCO|return.*without bill|allerg|interaction"),
    ("Chartered accountant", r"GST|GSTR|e-invoice|e-way|IRN|TDS|TCS|194|MSME|ITC|input tax|ledger|voucher|interest|rounding|round-off|CGST|cess|HSN|composition|reverse charge|RCM|IMS|charges|credit note|debit note|valuation|free goods|accounts|chart of accounts|CA\b|cash discount|cash_disc|claim basis|FREIGHT|written off|write-off|scheme|order of application|turnover|threshold"),
]

rows: dict[str, list[tuple[str, str, object]]] = {name: [] for name, _ in EXPERTS}
rows["Team decision"] = []
seen = set()
for path in sorted(DOCS.rglob("*.md")):
    rel = str(path.relative_to(DOCS))
    if rel in SKIP or "/members/" in rel:
        continue
    for n, line in enumerate(path.read_text().splitlines(), 1):
        if "⚠" not in line or line.startswith(">"):
            continue
        # Lines that explain the ⚠ convention are not rules.
        if re.search(r"marked ⚠|mark unknowns|⚠ = |⚠ rows|rules marked|Legend|stop and ask|RULES_TO_CONFIRM|Compliance rules \(⚠ items|confirm exact windows|Open questions \(⚠|^\s*- \[x\]", line, re.I):
            continue
        text = re.sub(r"\s+", " ", re.sub(r"[*`]", "", line.strip(" |-#"))).strip()
        cells = [c.strip() for c in line.split("|") if c.strip()]
        if len(cells) >= 2:
            text = " — ".join(cells[:3])
            text = re.sub(r"[*`]", "", text)
        text = text[:260]
        key = text[:120]
        if key in seen or len(text) < 12:
            continue
        seen.add(key)
        who = next((name for name, rx in EXPERTS if re.search(rx, text, re.I)), "Team decision")
        ans = answer_for(text)
        if ans and who == "Team decision":
            # A researched answer names its expert; move the rule out of "Team decision" accordingly.
            who = EXPERT_GROUP.get(ans[2].split()[0], who)
        rows[who].append((text, f"{rel}:{n}", ans))

total = sum(len(v) for v in rows.values())
researched = sum(1 for v in rows.values() for r in v if r[2])
md = [
    "# Rules to confirm",
    "",
    "> **Generated** by `scripts/docs/build_rules_to_confirm.py` from every ⚠ in `docs/`. Do not edit by hand: confirm the rule with the expert, remove the ⚠ at the source line (add who confirmed it and the date), then re-run.",
    "> Owners: Prakalya prepares the questions and evidence; Nitheesh signs off. A pilot feature cannot ship while a rule it depends on is still here.",
    "",
    f"**{total} rules open, {researched} with a researched answer (◐), {total - researched} with none yet (☐).** " + " · ".join(f"{k}: {len(v)}" for k, v in rows.items()),
    "",
    "◐ means desk research found an answer with sources, or (team items) a proposed decision ([RESEARCHED_ANSWERS.md](RESEARCHED_ANSWERS.md)); the expert or Nitheesh must still confirm it. Seed values: `contracts/reference-data/statutory-settings.v1.json`.",
    "",
    "How to run an expert session (60–90 min): print the section for that expert, bring one real bill per topic, record the answer and the source (notification, act, circular) next to each rule.",
    "",
]
for who, items in rows.items():
    if not items:
        continue
    md += [f"## {who} ({len(items)})", "", "| ✓ | Rule | Researched answer | Where |", "|---|---|---|---|"]
    md += [
        f"| {'◐' if a else '☐'} | {t.replace('|', '/')} | {f'[{a[0]}](RESEARCHED_ANSWERS.md) {a[1]}' if a else '—'} | [{src}](../{src.split(':')[0]}) |"
        for t, src, a in items
    ]
    md.append("")
OUT.write_text("\n".join(md))
print("rules", total, "researched", researched, {k: len(v) for k, v in rows.items()})


# ---------- Per-expert sign-off sheets (docs/compliance/signoff/*.md) ----------
# One row per researched answer, with how many open rules depend on it. The expert ticks Confirm or writes the change.
SIGN = DOCS / "compliance/signoff"
SIGN.mkdir(exist_ok=True)
ans_text = (DOCS / "compliance/RESEARCHED_ANSWERS.md").read_text()
uses: dict[str, int] = {}
for v in rows.values():
    for _t, _src, a in v:
        if a:
            uses[a[0]] = uses.get(a[0], 0) + 1
SHEETS = {"CA": "Chartered accountant", "Pharmacist": "Pharmacist / drug inspector", "Lawyer": "Lawyer", "Team": "Nitheesh (team decisions)"}
for key, title in SHEETS.items():
    lines = [
        f"# Sign-off sheet: {title}",
        "",
        "> **Generated** by `scripts/docs/build_rules_to_confirm.py`. Print it, go through each answer with the expert, tick Confirm or write the change, then record the result in RESEARCHED_ANSWERS.md and remove the ⚠ at the sources (who + date).",
        "",
        "| Answer | Topic | Confidence | Open rules | Proposed answer (first point) | Confirm | Change / note |",
        "|---|---|---|---|---|---|---|",
    ]
    n = 0
    for aid, topic, _rx, expert in ANSWERS:
        if not expert.startswith(key) and not (key == "Pharmacist" and "pharmacist" in expert.lower() and not expert.startswith("Pharmacist")) and not (key == "Lawyer" and "lawyer" in expert.lower() and not expert.startswith("Lawyer")):
            continue
        m = re.search(rf"### {aid} [^\n]*?(confidence [^\n]*|proposed[^\n]*|decided[^\n]*|to collect[^\n]*)\n(.*?)(?=\n### |\n## )", ans_text, re.S)
        conf = m.group(1) if m else "—"
        first = re.sub(r"[*`]", "", (m.group(2).strip().split("\n")[0] if m else "")).lstrip("- ").replace("|", "/")
        first = first[:220] + ("…" if len(first) > 220 else "")
        lines.append(f"| [{aid}](../RESEARCHED_ANSWERS.md) | {topic} | {conf} | {uses.get(aid, 0)} | {first} | ☐ | |")
        n += 1
    lines += ["", f"{n} answers. Expert: ____________________  Registration / membership no.: __________  Date: __________  Signature: __________", ""]
    (SIGN / f"{key.lower()}.md").write_text("\n".join(lines))
    print("sign-off", key, n)
