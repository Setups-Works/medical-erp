"""Writes draft test vectors for CALCULATIONS.md §7–§22 into contracts/test-vectors/ (format: contracts/AGENTS.md).
Run: python3 scripts/vectors/generate_extended_vectors.py

Expected values come from THIS independent Python implementation (decimal, ROUND_HALF_UP), written from
CALCULATIONS.md and not from any engine, so the TypeScript and Java engines are checked against numbers they did
not produce. Every case is "draft" until Prakalya recomputes it by hand and Nitheesh approves (contracts/AGENTS.md).
Options that are tenant settings (split rounding, tie-break) are passed in `input.options`, never assumed.
"""
import json
import math
import pathlib
from datetime import date
from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal as D, getcontext

getcontext().prec = 40
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "contracts/test-vectors"
SRC = "Independent Python implementation (scripts/vectors/generate_extended_vectors.py) of CALCULATIONS.md; NOT yet confirmed by Prakalya / CA"


def q(x: D, dp: int) -> D:
    return x.quantize(D(1).scaleb(-dp), ROUND_HALF_UP)


def s(x: D, dp: int) -> str:
    return str(q(x, dp))


# ---------- §2–§4 line (same rules as gst-core vectors) ----------
def line(mode, rate, qty, disc="0", gst="5", scheme="0", intra=True):
    rate, qty, disc, gst, scheme = D(rate), D(qty), D(disc), D(gst), D(scheme)
    gross = q(rate * qty, 4)
    sch = q(gross * scheme / 100, 4)
    dsc = q((gross - sch) * disc / 100, 4)
    amount = gross - sch - dsc
    if mode == "MRP_INCLUSIVE":
        t4 = q(amount * 100 / (100 + gst), 4)
        g = q(amount - t4, 2)
        taxable = amount - g
    else:
        taxable = amount
        g = q(taxable * gst / 100, 2)
    c = q(g / 2, 2) if intra else D(0)
    return {"gross": gross, "scheme": sch, "discount": dsc, "taxable": taxable, "gst": g, "cgst": c, "sgst": (g - c) if intra else D(0), "igst": D(0) if intra else g, "total": taxable + g}


def largest_remainder(total: D, weights: list[D]) -> list[D]:
    """Split `total` (2 dp) over weights; floor to paisa, give left-over paise to the largest fractions (ties: earlier line)."""
    w = sum(weights)
    raw = [total * x / w for x in weights]
    base = [r.quantize(D("0.01"), ROUND_DOWN) for r in raw]
    left = int(((total - sum(base)) * 100).to_integral_value())
    order = sorted(range(len(raw)), key=lambda i: (-(raw[i] - base[i]), i))
    for i in order[:left]:
        base[i] += D("0.01")
    return base


files: dict[str, list] = {}


def add(file, name, fid, inp, exp):
    files.setdefault(file, []).append({"name": name, "featureId": fid, "status": "draft", "source": SRC, "input": inp, "expected": exp})


# ---------- §7 loose sale ----------
for mrp, units, loose, disc, gst in [("33.60", "15", "5", "0", "5"), ("118.00", "10", "3", "10", "5"), ("95.50", "15", "4", "0", "5"), ("249.00", "1", "1", "0", "18")]:
    lm = q(D(mrp) / D(units), 4)
    ln = line("MRP_INCLUSIVE", lm, loose, disc, gst)
    add("pricing/loose-sale.json", f"loose sale: MRP {mrp} / {units} units, {loose} loose, {disc}% off, GST {gst}%", "CAT-05",
        {"fn": "looseSale", "mrp": mrp, "unitsPerPack": units, "looseQty": loose, "discountPct": disc, "gstRate": gst, "intraState": True},
        {"looseMrp": s(lm, 4), "stockOutPacks": s(D(loose) / D(units), 4), "gross": s(ln["gross"], 4), "taxable": s(ln["taxable"], 4), "gst": s(ln["gst"], 2), "cgst": s(ln["cgst"], 2), "sgst": s(ln["sgst"], 2), "total": s(ln["total"], 4)})

# ---------- §8 bill discount allocation ----------
for amounts, discount in [(["100.00", "200.00", "300.00"], "50.00"), (["33.60", "118.00", "95.00"], "10.00"), (["10.00", "10.00", "10.00"], "1.00"), (["999.99", "0.01"], "100.00")]:
    shares = largest_remainder(D(discount), [D(a) for a in amounts])
    add("pricing/bill-discount.json", f"bill discount {discount} over {amounts}", "PRC-07",
        {"fn": "allocateBillDiscount", "amounts": amounts, "discount": discount, "options": {"tieBreak": "earlier_line"}},
        {"shares": [s(x, 2) for x in shares], "sum": s(sum(shares), 2)})

# ---------- §9 landed cost and suggested PTR ----------
for lines_in, freight in [
    ([{"taxable": "240.0000", "billedQty": "10", "freeQty": "1", "nonClaimableTax": "0"}, {"taxable": "421.5000", "billedQty": "5", "freeQty": "0", "nonClaimableTax": "0"}], "50.00"),
    ([{"taxable": "1000.0000", "billedQty": "100", "freeQty": "10", "nonClaimableTax": "50.0000"}], "0.00"),
    ([{"taxable": "100.0000", "billedQty": "3", "freeQty": "0", "nonClaimableTax": "0"}, {"taxable": "200.0000", "billedQty": "7", "freeQty": "0", "nonClaimableTax": "0"}, {"taxable": "300.0000", "billedQty": "1", "freeQty": "1", "nonClaimableTax": "0"}], "10.00"),
]:
    shares = largest_remainder(D(freight), [D(x["taxable"]) for x in lines_in]) if D(freight) else [D(0)] * len(lines_in)
    exp = []
    for x, sh in zip(lines_in, shares):
        value = D(x["taxable"]) + sh + D(x["nonClaimableTax"])
        exp.append({"freightShare": s(sh, 2), "landedValue": s(value, 4), "landedCostPerUnit": s(value / (D(x["billedQty"]) + D(x["freeQty"])), 4)})
    add("schemes/landed-cost.json", f"landed cost, freight {freight}, {len(lines_in)} line(s)", "PUR-06", {"fn": "landedCost", "lines": lines_in, "freight": freight, "options": {"tieBreak": "earlier_line"}}, {"lines": exp})

for mrp, gst, margin in [("33.60", "5", "20"), ("249.00", "18", "20"), ("100.00", "5", "30"), ("22.00", "5", "20")]:
    ptr = q(D(mrp) * 100 / (100 + D(gst)) * (100 - D(margin)) / 100, 2)
    add("schemes/landed-cost.json", f"suggested PTR: MRP {mrp}, GST {gst}%, margin {margin}%", "PRC-12", {"fn": "suggestedPtr", "mrp": mrp, "gstRate": gst, "marginPct": margin}, {"ptr": s(ptr, 2)})

# ---------- §10 margin / mark-up and §11 weighted average ----------
for sale, cost in [("100.0000", "80.0000"), ("57.6000", "48.0000"), ("211.0200", "172.0000"), ("50.0000", "55.0000")]:
    S, C = D(sale), D(cost)
    add("pricing/margin.json", f"margin and mark-up: sale {sale}, cost {cost}", "PRC-13", {"fn": "margin", "saleExGst": sale, "cost": cost}, {"marginPct": s((S - C) / S * 100, 2), "markupPct": s((S - C) / C * 100, 2)})
for oq, oa, iq, ic in [("10", "24.0000", "11", "21.8182"), ("0", "0", "5", "84.3000"), ("40", "10.5000", "60", "9.7500"), ("3", "100.0000", "1", "0")]:
    new = q((D(oq) * D(oa) + D(iq) * D(ic)) / (D(oq) + D(iq)), 4)
    add("pricing/margin.json", f"weighted average: {oq} @ {oa} + {iq} @ {ic}", "INV-10", {"fn": "weightedAverage", "oldQty": oq, "oldAvg": oa, "inQty": iq, "inCost": ic}, {"newAvg": s(new, 4)})

# ---------- §13 payments, §14 credit check ----------
for invs, amount in [
    ([{"id": "A", "outstanding": "500.00"}, {"id": "B", "outstanding": "300.00"}], "650.00"),
    ([{"id": "A", "outstanding": "100.00"}], "250.00"),
    ([{"id": "A", "outstanding": "120.50"}, {"id": "B", "outstanding": "79.50"}, {"id": "C", "outstanding": "10.00"}], "200.00"),
]:
    left = D(amount)
    alloc = []
    for i in invs:
        take = min(left, D(i["outstanding"]))
        if take > 0:
            alloc.append({"id": i["id"], "amount": s(take, 2)})
        left -= take
    add("accounting/payments.json", f"FIFO allocation of {amount}", "ACC-01", {"fn": "allocatePayment", "invoices": invs, "amount": amount, "options": {"order": "fifo"}}, {"allocations": alloc, "onAccount": s(left, 2)})
for tendered, total in [(["500.00"], "452.00"), (["200.00", "100.00"], "300.00")]:
    add("accounting/payments.json", f"change due: tendered {tendered} for {total}", "POS-07", {"fn": "changeDue", "tenderedCash": tendered, "billTotal": total}, {"change": s(max(D(0), sum(D(t) for t in tendered) - D(total)), 2)})
for out, unposted, bill, limit in [("40000.00", "5000.00", "4000.00", "50000.00"), ("40000.00", "5000.00", "6000.00", "50000.00"), ("0.00", "0.00", "152.00", "0.00")]:
    exposure = D(out) + D(unposted) + D(bill)
    add("accounting/payments.json", f"credit check: exposure vs limit {limit}", "PTY-07", {"fn": "creditCheck", "outstanding": out, "unposted": unposted, "bill": bill, "limit": limit}, {"exposure": s(exposure, 2), "withinLimit": exposure <= D(limit)})

# ---------- §15 interest, §16 TDS ----------
for amt, rate, days, basis in [("10000.00", "18", "30", "365"), ("4006.00", "24", "45", "360"), ("152.00", "18", "1", "365")]:
    add("accounting/interest-tds.json", f"simple interest {rate}% on {amt} for {days} days / {basis}", "PTY-29", {"fn": "interestSimple", "amount": amt, "ratePct": rate, "days": days, "basisDays": basis}, {"interest": s(D(amt) * D(rate) / 100 * D(days) / D(basis), 2)})
for amt, rate, months in [("10000.00", "18", "1"), ("10000.00", "18", "3"), ("50000.00", "12", "12")]:
    r = D(rate) / 100 / 12
    add("accounting/interest-tds.json", f"compound monthly {rate}% on {amt} for {months} months", "PTY-29", {"fn": "interestCompoundMonthly", "amount": amt, "ratePct": rate, "months": months}, {"interest": s(D(amt) * ((1 + r) ** int(months) - 1), 2)})
for before, amount, thr, rate in [("4500000.00", "1000000.00", "5000000.00", "0.1"), ("6000000.00", "250000.00", "5000000.00", "0.1"), ("100000.00", "200000.00", "5000000.00", "0.1"), ("15000.00", "10000.00", "20000.00", "2")]:
    above = max(D(0), D(before) + D(amount) - max(D(thr), D(before)))
    add("accounting/interest-tds.json", f"TDS {rate}%: cumulative {before} + {amount}, threshold {thr}", "ACX-06", {"fn": "tds", "cumulativeBefore": before, "amount": amount, "threshold": thr, "ratePct": rate}, {"taxableAboveThreshold": s(above, 2), "tds": s(above * D(rate) / 100, 2)})

# ---------- §17 reorder, §18 expiry ----------
for sold, days, lead, safety, mx, on_hand, on_order, reserved in [("60", "30", "2", "5", "60", "10", "0", "0"), ("300", "30", "7", "20", "200", "150", "20", "10"), ("0", "30", "3", "0", "20", "25", "0", "0")]:
    avg = q(D(sold) / D(days), 4)
    rp = math.ceil(avg * D(lead) + D(safety))
    avail = D(on_hand) - D(reserved)
    sugg = max(D(0), D(mx) - (D(on_hand) + D(on_order) - D(reserved)))
    add("inventory/reorder-expiry.json", f"reorder: {sold} sold in {days} days, lead {lead}", "PUR-11", {"fn": "reorder", "soldUnits": sold, "days": days, "leadTimeDays": lead, "safetyStock": safety, "maxQty": mx, "onHand": on_hand, "onOrder": on_order, "reserved": reserved},
        {"avgDailySale": s(avg, 4), "reorderPoint": str(rp), "available": str(avail), "suggestedQty": str(sugg)})
for exp, today, near in [("11/2026", "2026-11-24", "90"), ("10/2026", "2026-11-24", "90"), ("02/2027", "2026-11-24", "90"), ("08/2027", "2026-11-24", "90"), ("02/2028", "2027-12-31", "30")]:
    m, y = int(exp[:2]), int(exp[3:])
    last = date(y + (m == 12), (m % 12) + 1, 1).toordinal() - 1
    last_d = date.fromordinal(last)
    left = last - date.fromisoformat(today).toordinal()
    status = "expired" if left < 0 else ("near_expiry" if left <= int(near) else "ok")
    add("inventory/reorder-expiry.json", f"expiry {exp} on {today}, near window {near} days", "INV-04", {"fn": "expiryStatus", "expiry": exp, "today": today, "nearExpiryDays": near}, {"expiryDate": last_d.isoformat(), "daysLeft": str(left), "status": status})

# ---------- §22 combined distributor bill ----------
def combined(lines_in, freight, insurance, charge_gst, intra):
    out = [(l, line("EXCLUSIVE", l["rate"], l["qty"], l.get("discountPct", "0"), l["gstRate"], intra=intra)) for l in lines_in]
    sign = lambda l: 1 if l["section"] in ("SALE", "REPLACEMENT") else -1
    tax_out = sum((o["taxable"] for l, o in out if sign(l) > 0), D(0))
    tax_ret = sum((o["taxable"] for l, o in out if sign(l) < 0), D(0))
    charges = D(freight) + D(insurance)
    ch_gst = q(charges * D(charge_gst) / 100, 2)
    ch_c = q(ch_gst / 2, 2) if intra else D(0)
    heads = {
        "cgst": sum((sign(l) * o["cgst"] for l, o in out), D(0)) + ch_c,
        "sgst": sum((sign(l) * o["sgst"] for l, o in out), D(0)) + ((ch_gst - ch_c) if intra else D(0)),
        "igst": sum((sign(l) * o["igst"] for l, o in out), D(0)) + (D(0) if intra else ch_gst),
    }
    total = tax_out - tax_ret + charges + heads["cgst"] + heads["sgst"] + heads["igst"]
    grand = q(total, 0)
    return {"taxableOut": s(tax_out, 4), "taxableReturns": s(tax_ret, 4), "charges": s(charges, 2), "chargesGst": s(ch_gst, 2), "cgst": s(heads["cgst"], 2), "sgst": s(heads["sgst"], 2), "igst": s(heads["igst"], 2), "total": s(total, 4), "roundOff": s(grand - total, 2), "grandTotal": s(grand, 2)}


demo = [
    {"section": "SALE", "rate": "25.60", "qty": "5", "gstRate": "5"},
    {"section": "SALE", "rate": "168.81", "qty": "2", "discountPct": "2", "gstRate": "18"},
    {"section": "SALES_RETURN", "rate": "89.90", "qty": "1", "gstRate": "5"},
    {"section": "BRK_EXP_RETURN", "rate": "25.60", "qty": "1", "gstRate": "5"},
    {"section": "REPLACEMENT", "rate": "25.60", "qty": "1", "gstRate": "5"},
]
add("documents/combined-bill.json", "combined bill, inter-state (Hub demo: grand total 578.00)", "WHS-15", {"fn": "combinedBill", "lines": demo, "freight": "100.00", "insurance": "25.00", "chargesGstRate": "18", "intraState": False, "options": {"chargesGst": "fixed-rate"}}, combined(demo, "100.00", "25.00", "18", False))
add("documents/combined-bill.json", "combined bill, same lines intra-state", "WHS-15", {"fn": "combinedBill", "lines": demo, "freight": "100.00", "insurance": "25.00", "chargesGstRate": "18", "intraState": True, "options": {"chargesGst": "fixed-rate"}}, combined(demo, "100.00", "25.00", "18", True))
add("documents/combined-bill.json", "combined bill, no returns, no charges", "WHS-15", {"fn": "combinedBill", "lines": demo[:2], "freight": "0.00", "insurance": "0.00", "chargesGstRate": "18", "intraState": True, "options": {"chargesGst": "fixed-rate"}}, combined(demo[:2], "0.00", "0.00", "18", True))

n = 0
for rel, cases in files.items():
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(cases, indent=2) + "\n")
    n += len(cases)
    print(f"{len(cases):3} cases → contracts/test-vectors/{rel}")
print(n, "draft vectors written")
