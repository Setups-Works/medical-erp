"""Refreshes the DrugDB product snapshot used by the POS screen in docs/design/mockups/dashboard-demo.html.
Run: python3 scripts/design/drugdb_snapshot.py

DrugDB (drugdb.in) sends no CORS headers, so a static HTML page can't search it live; the Hub proxies it at
/api/learn/drugdb for that reason. This script calls the public search API (visitor limit 400 searches a day,
or set DRUGDB_API_KEY) for a fixed list of common medicines and writes the rows between the DRUGDB markers in
the demo. Only catalogue fields are kept; batches, expiry and stock in the demo are made up, because in MENO
they come from purchases, not from a drug database.
"""
import json
import os
import pathlib
import re
import time
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
DEMO = ROOT / "docs/design/mockups/dashboard-demo.html"
QUERIES = ["dolo 650", "crocin", "calpol", "augmentin 625", "azithral 500", "taxim o", "pan d", "pantocid", "shelcal",
           "electral", "cetirizine", "montair lc", "glycomet", "telma 40", "amlodac", "thyronorm", "ecosprin",
           "combiflam", "volini", "dettol"]
KEEP = ("product_id", "name", "composition", "manufacturer", "packaging", "dosage_form", "mrp", "rx_required", "kind")


def search(q: str) -> list[dict]:
    url = "https://drugdb.in/v1/search?" + urllib.parse.urlencode({"q": q, "limit": 4})
    headers = {"Accept": "application/json", "User-Agent": "meno-design-demo"}
    if os.environ.get("DRUGDB_API_KEY"):
        headers["X-Api-Key"] = os.environ["DRUGDB_API_KEY"]
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=15) as r:
        return json.load(r).get("results", [])


rows, seen = [], set()
for q in QUERIES:
    for r in search(q):
        if r.get("product_id") in seen or not r.get("mrp"):
            continue
        seen.add(r["product_id"])
        rows.append({k: r.get(k) for k in KEEP})
    time.sleep(0.3)

text = DEMO.read_text()
blob = "const DRUGDB = " + json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + ";"
new, n = re.subn(r"/\*DRUGDB:start\*/.*?/\*DRUGDB:end\*/", lambda m: f"/*DRUGDB:start*/{blob}/*DRUGDB:end*/", text, flags=re.S)
if n != 1:
    raise SystemExit("DRUGDB markers not found in the demo")
DEMO.write_text(new)
print(f"{len(rows)} DrugDB products written to {DEMO.relative_to(ROOT)} ({time.strftime('%Y-%m-%d')})")
