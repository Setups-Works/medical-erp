"""Refreshes the GSTIN snapshot used by the supplier / customer Fetch in docs/design/mockups/dashboard-demo.html.
Run: python3 scripts/design/gstin_snapshot.py [GSTIN ...]

The GST verify API (api.gstverify.dubey.app) sends no CORS headers, so a page opened from a file can't call it.
The demo tries the live call first and falls back to these saved responses. Basic details only (full=false, no
key). GSTINs are public business registrations; never add a person's details here. Spec: docs/product/GSTIN_FETCH.md.
"""
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
DEMO = ROOT / "docs/design/mockups/dashboard-demo.html"
GSTINS = sys.argv[1:] or ["33AAJCN0778N1ZZ"]
URL = "https://api.gstverify.dubey.app/api/v1/gst/details?"


def lookup(gstin: str) -> dict | None:
    url = URL + urllib.parse.urlencode({"gstin": gstin, "full": "false"})
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "meno-design-demo"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            body = json.load(r)
    except urllib.error.HTTPError as e:
        print(f"{gstin}: HTTP {e.code}, skipped")
        return None
    return body.get("data") if body.get("success") else None


snap = {}
for g in GSTINS:
    d = lookup(g.strip().upper())
    if d:
        snap[d["gstin"]] = d
    time.sleep(0.3)

text = DEMO.read_text()
blob = "const GSTSNAP = " + json.dumps(snap, ensure_ascii=False, separators=(",", ":")) + ";"
new, n = re.subn(r"/\*GSTSNAP:start\*/.*?/\*GSTSNAP:end\*/", lambda m: f"/*GSTSNAP:start*/{blob}/*GSTSNAP:end*/", text, flags=re.S)
if n != 1:
    raise SystemExit("GSTSNAP markers not found in the demo")
DEMO.write_text(new)
print(f"{len(snap)} GSTIN record(s) written to {DEMO.relative_to(ROOT)} ({time.strftime('%Y-%m-%d')})")
