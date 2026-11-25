"""Generates docs/planning/PILOT_SCOPE.md from FEATURES.md.
Run: python3 scripts/docs/build_pilot_scope.py   (re-run after changing FEATURES.md or the rules below)

The rules are data, so the team changes scope here, not by hand-editing the list:
  Pilot A = one retail shop with offline billing: priority Must, phase P1–P4, edition Retail or Both.
  Pilot B = wholesale and finance on top: every other Must feature up to P5.
  DEFER / FORCE_A let the team move single features after sprint planning.
MENO Hub reads this file and labels tasks `pilot-a` / `pilot-b`.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]

PILOT_A_PHASES = {"P1", "P2", "P3", "P4"}
PILOT_B_LAST_PHASE = "P5"
# Must features the team decided to move out of the pilot (reason in the comment).
DEFER: dict[str, str] = {}
# Features pulled into Pilot A even though the rule would not include them.
FORCE_A: dict[str, str] = {
    "LIC-03": "the shop must be able to activate its license",
}

features = []
section = ""
for line in (ROOT / "docs/product/FEATURES.md").read_text().splitlines():
    h = re.match(r"^#{2,3}\s+(.+)$", line)
    if h:
        section = re.sub(r"\(`.*?`\)", "", h.group(1)).strip()
    c = [x.strip() for x in line.split("|")]
    if len(c) > 4 and re.fullmatch(r"[A-Z]{3}-\d{2}", c[1]):
        rest = c[3:-1]
        ed, ph, pri = (rest[0], rest[1], rest[2]) if len(rest) >= 3 else ("B", rest[0], rest[1])
        title = re.sub(r"\*\*", "", c[2])
        title = title.split(":")[0] if len(title) > 90 else title
        features.append({"id": c[1], "title": title[:110], "ed": ed, "ph": ph, "pri": pri, "section": section})

a, b = [], []
for f in features:
    if f["id"] in DEFER:
        continue
    if f["id"] in FORCE_A or (f["pri"] == "M" and f["ph"] in PILOT_A_PHASES and f["ed"] in ("R", "B")):
        a.append(f)
    elif f["pri"] == "M" and f["ph"] <= PILOT_B_LAST_PHASE:
        b.append(f)


def table(rows):
    out = ["| ID | Feature | Ed. | Phase | Area |", "|---|---|---|---|---|"]
    out += [f"| {f['id']} | {f['title']} | {f['ed']} | {f['ph']} | {f['section'][:40]} |" for f in rows]
    return out


md = [
    "# Pilot scope",
    "",
    "> **Generated** by `scripts/docs/build_pilot_scope.py` from FEATURES.md. Change the rules or the DEFER / FORCE_A lists in that script, never this file. MENO Hub labels these tasks `pilot-a` and `pilot-b`.",
    "",
    f"Everything else ({len(features) - len(a) - len(b)} features: Should, Could, P6–P7) is **after the pilot**. Enterprise items (§31) are planned but not needed by a pilot shop.",
    "",
    "## Pilot A — one retail pharmacy, offline counter",
    "",
    "Goal: a single Tamil Nadu medical shop bills every sale in MENO for 30 days, online and offline, with correct GST, stock and Schedule H1 records, and closes the month without the old software.",
    "",
    f"**{len(a)} features.** Exit criteria: the 15 critical scenarios in TEST_STRATEGY.md pass; all test vectors pass in Java and the offline engine; the CA has confirmed the GST and rounding rules used; the pharmacist has confirmed the Schedule H/H1 workflow; one restore drill done.",
    "",
    *table(a),
    "",
    "## Pilot B — wholesale and finance",
    "",
    "Goal: one distributor runs orders, credit billing, e-invoice, collections and books in MENO; the retail pilot keeps running.",
    "",
    f"**{len(b)} features.**",
    "",
    *table(b),
    "",
]
if DEFER:
    md += ["## Deferred by decision", "", "| ID | Why |", "|---|---|", *[f"| {k} | {v} |" for k, v in DEFER.items()], ""]
if FORCE_A:
    md += ["## Pulled into Pilot A", "", "| ID | Why |", "|---|---|", *[f"| {k} | {v} |" for k, v in FORCE_A.items()], ""]
(ROOT / "docs/planning/PILOT_SCOPE.md").write_text("\n".join(md))
print("pilot A", len(a), "pilot B", len(b), "after pilot", len(features) - len(a) - len(b))
