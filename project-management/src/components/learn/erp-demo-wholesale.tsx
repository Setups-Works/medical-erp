"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { RETAILER_KA, SHOP } from "@/lib/learn/examples";
import { calcLine, type LineOut, type Party, type VoucherLine } from "@/lib/learn/invoice";
import { type Money, add, fmt, inWords, m, pct, round, sub } from "@/lib/learn/money";
import { Kbd } from "../ui";
import { Chips, F, FieldGuide, type Guide, type Med, NextBar, RX, STATES, SaveButton, SavedNote, Screen, TODAY, box, cellInput } from "./erp-demo-kit";
import type { Customer } from "./erp-demo-masters";

/*
 * Wholesale tax invoice for the walkthrough (DOCUMENT_FIELDS.md §3, §3a; CALCULATIONS.md §22).
 * One printed document can carry four sections like a distributor's bill: sales, less sales return, less
 * breakage / expiry return, add replacement. Under GST the two return sections are issued as linked credit notes
 * with their own numbers; only the settlement is netted (⚠ CA to confirm). Charges' GST rate is a setting (⚠).
 */

export type Section = "SALE" | "SALES_RETURN" | "BRK_EXP_RETURN" | "REPLACEMENT";
const SECTIONS: { v: Section; l: string; sign: 1 | -1; print: string }[] = [
  { v: "SALE", l: "Sale", sign: 1, print: "Sales" },
  { v: "SALES_RETURN", l: "Sales return", sign: -1, print: "Less: sales return" },
  { v: "BRK_EXP_RETURN", l: "Breakage / expiry return", sign: -1, print: "Less: breakage / expiry return" },
  { v: "REPLACEMENT", l: "Replacement", sign: 1, print: "Add: replacement" },
];
const sectionOf = (s: Section) => SECTIONS.find((x) => x.v === s)!;

type WLine = { section: Section; medId: string; batch: string; qty: string; free: string; rate: string; disc: string; reason: string };
export type WStock = { medId: string; batch: string; expiry: string; mrp: string; qty: number };
export type WMove = { medId: string; batch: string; qtyIn: number; qtyOut: number; loc: string };

export type WholesaleResult = {
  number: string;
  creditNotes: string[];
  buyer: Party;
  grandTotal: Money;
  voucher: VoucherLine[];
  ledger: { particulars: string; type: string; no: string; dr?: Money; cr?: Money }[];
  moves: WMove[];
};

const GUIDE: Guide = {
  buyer: { label: "Retailer", what: "The pharmacy buying on credit.", rule: "Drug licence valid on the bill date (else block ⚠); GSTIN status active; credit limit and overdue check.", why: "A wholesaler may sell medicines only to a licensed buyer." },
  order: { label: "Order no. / date", what: "The retailer's order this bill fulfils.", rule: "From the sales order (WHS-01) or typed; printed on the bill.", why: "The retailer matches the bill with their order." },
  dispatch: { label: "Transport, LR no., cases", what: "Transporter, vehicle, lorry receipt (LR) no. and number of cases.", rule: "Transporter from the master; cases a whole number. Needed for the e-way bill above the threshold ⚠.", why: "Proof of dispatch and claims for short or damaged cases." },
  due: { label: "Due date", what: "Bill date + the retailer's credit days.", rule: "Computed, never typed. Drives ageing, reminders and interest.", why: "Printed so the retailer knows when to pay." },
  section: { label: "Section", what: "Sale, sales return, breakage/expiry return or replacement.", rule: "Returns are issued as credit notes with their own numbers, linked to this bill; replacement lines are invoice lines ⚠ CA.", why: "One document for the van driver, correct GST records behind it." },
  qty: { label: "Qty / Free", what: "Billed and free quantity (scheme 10 + 1).", rule: "Sale + replacement ≤ batch stock; free not charged but leaves stock.", why: "Free goods are real stock: the retailer's cost per unit drops." },
  rate: { label: "Rate (PTR)", what: "Price to retailer per pack, before GST.", rule: "> 0 and below MRP; from the retailer's price list in MENO.", why: "Wholesale bills are exclusive of GST." },
  disc: { label: "Item discount %", what: "Trade discount on the line.", rule: "0–100 and within the cap; shown as 'Item discount' in the totals.", why: "Retailers compare discount, not just rate." },
  reason: { label: "Return reason", what: "Why goods came back.", rule: "From the reason master; breakage / expiry go to the dump stock, sales returns back to saleable stock after inspection.", why: "Expired goods must never be resold." },
  charges: { label: "Freight / insurance", what: "Charges added to the bill.", rule: "Amounts ≥ 0; GST on charges from the setting `billing.charges_gst` ⚠ CA (commonly follows the goods).", why: "Charges are income; their GST is output tax." },
  print: { label: "Printed invoice", what: "What the retailer receives.", rule: "Both parties' DL nos. and GSTINs, HSN, batch, expiry, MRP, tax summary by rate, amount in words, terms, E.&O.E., signatory.", why: "Inspectors and the retailer's accountant check these." },
};

const blankLine = (section: Section, med: Med, stock: WStock[]): WLine => {
  const b = stock.filter((s) => s.medId === med.id).sort((a, z) => a.expiry.slice(3).localeCompare(z.expiry.slice(3)) || a.expiry.localeCompare(z.expiry))[0];
  return { section, medId: med.id, batch: b?.batch ?? "", qty: "1", free: "0", rate: ptrOf(b?.mrp ?? med.mrp ?? "0", med.gstPct), disc: "0", reason: section === "SALES_RETURN" ? "Wrong item" : section === "BRK_EXP_RETURN" ? "Breakage" : "" };
};

/** Demo PTR: MRP ex-GST less 20 % (in MENO this comes from the price list). */
function ptrOf(mrp: string, gstPct: string): string {
  if (!RX.amount.test(mrp)) return "0";
  const ex = (m(mrp) * 1000000n) / (1000000n + m(gstPct));
  return fmt(round((ex * 8000n) / 10000n, 2)).replace(/,/g, "");
}

export function WholesaleStep({
  meds,
  stock,
  customer,
  posted,
  onPost,
  onGoPurchase,
  onBack,
  onNext,
}: {
  meds: Med[];
  stock: WStock[];
  customer: Customer | null;
  posted: WholesaleResult | null;
  onPost: (r: WholesaleResult) => void;
  onGoPurchase: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const med = (id: string) => meds.find((x) => x.id === id)!;
  const useSaved = customer?.kind === "retailer";
  const buyer: Party = useSaved
    ? { name: customer!.name, address: customer!.address, state: STATES.find((s) => s.code === customer!.state)?.name ?? "", stateCode: customer!.state, gstin: customer!.gstin || undefined, dl: customer!.dl, dlForms: "Form 20 / 21 (retail)" }
    : RETAILER_KA;
  const creditDays = Number(useSaved ? customer!.creditDays : "30");
  const intra = buyer.stateCode === SHOP.stateCode;
  const number = "WS/26-27/000001";

  const [active, setActive] = useState("buyer");
  const [hdr, setHdr] = useState({ order: "SO/26-27/000045", orderDate: "23-11-2026", transporter: "ABC Transport (demo)", vehicle: "TN-01-AB-1234", lr: "LR-131345", cases: "3", salesman: "S. Kumar (demo)" });
  const [lines, setLines] = useState<WLine[]>(() => {
    const has = (id: string) => stock.some((s) => s.medId === id && s.qty > 0);
    const out: WLine[] = [];
    if (has("m1")) out.push({ ...blankLine("SALE", med("m1"), stock), qty: "5", free: "1" });
    if (has("m3")) out.push({ ...blankLine("SALE", med("m3"), stock), qty: "2", disc: "2" });
    if (has("m2")) out.push({ ...blankLine("SALES_RETURN", med("m2"), stock), qty: "1" });
    if (has("m1")) out.push({ ...blankLine("BRK_EXP_RETURN", med("m1"), stock), qty: "1" });
    if (has("m1")) out.push({ ...blankLine("REPLACEMENT", med("m1"), stock), qty: "1" });
    return out;
  });
  const [freight, setFreight] = useState("100.00");
  const [insurance, setInsurance] = useState("25.00");
  const [chargeGst, setChargeGst] = useState("18");
  const [addSection, setAddSection] = useState<Section>("SALE");
  const [tried, setTried] = useState(false);
  const setLine = (i: number, patch: Partial<WLine>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  // Stock check: sale + replacement (billed + free) per batch must fit what is on hand.
  const outByBatch = new Map<string, number>();
  for (const l of lines) if (sectionOf(l.section).sign > 0) outByBatch.set(l.medId + l.batch, (outByBatch.get(l.medId + l.batch) ?? 0) + Number(l.qty || 0) + Number(l.free || 0));
  // Re-posting replaces the earlier demo invoice, so its stock effect is added back before checking.
  const avail = (medId: string, batch: string) =>
    (stock.find((s) => s.medId === medId && s.batch === batch)?.qty ?? 0) +
    (posted?.moves ?? []).filter((mv) => mv.medId === medId && mv.batch === batch && !mv.loc.startsWith("Dump")).reduce((a, mv) => a + mv.qtyOut - mv.qtyIn, 0);
  const lineErr = (l: WLine): string | undefined => {
    const b = stock.find((s) => s.medId === l.medId && s.batch === l.batch);
    if (!b) return "Pick a batch.";
    if (!/^\d{1,5}$/.test(l.qty) || Number(l.qty) < 1) return "Qty ≥ 1";
    if (!/^\d{0,5}$/.test(l.free)) return "Free: whole number";
    if (!RX.amount.test(l.rate) || m(l.rate) <= 0n || m(l.rate) >= m(b.mrp)) return "Rate above 0 and below MRP";
    if (!RX.pct.test(l.disc || "0") || Number(l.disc) > 100) return "Disc 0–100";
    if (sectionOf(l.section).sign > 0 && (outByBatch.get(l.medId + l.batch) ?? 0) > avail(l.medId, l.batch)) return `Only ${avail(l.medId, l.batch)} in stock for this batch`;
    if (sectionOf(l.section).sign < 0 && !l.reason.trim()) return "Reason required";
    return undefined;
  };
  const hdrErr = {
    cases: /^\d{1,4}$/.test(hdr.cases) ? undefined : "Whole number",
    dl: buyer.dl ? undefined : "Retailer has no drug licence: sale blocked",
  };
  const chargeErr = !RX.amount.test(freight || "0") || !RX.amount.test(insurance || "0") ? "Charges as amounts like 100.00" : undefined;

  const calc = useMemo<Calc | null>(() => {
    if (lines.some(lineErr) || chargeErr) return null;
    const out = lines.map((l) => {
      const x = med(l.medId);
      const b = stock.find((s) => s.medId === l.medId && s.batch === l.batch)!;
      const lo: LineOut = calcLine(
        { item: x.name, pack: x.pack, hsn: x.hsn, batch: l.batch, expiry: b.expiry, qty: l.qty, free: l.free !== "0" && l.free ? l.free : undefined, rate: l.rate, mrp: b.mrp, discPct: l.disc || "0", gstPct: x.gstPct },
        "EXCLUSIVE",
        intra,
      );
      return { l, x, lo, sign: BigInt(sectionOf(l.section).sign) };
    });
    const sum = (f: (o: (typeof out)[number]) => Money, pred: (o: (typeof out)[number]) => boolean = () => true) => add(...out.filter(pred).map(f));
    const isOut = (o: (typeof out)[number]) => o.sign > 0n;
    const isRet = (o: (typeof out)[number]) => o.sign < 0n;
    const grossOut = sum((o) => o.lo.gross, isOut);
    const itemDisc = sum((o) => o.lo.disc, isOut);
    const taxOut = sum((o) => o.lo.taxable, isOut);
    const taxRet = sum((o) => o.lo.taxable, isRet);
    const charges = add(m(freight || "0"), m(insurance || "0"));
    const chGst = round(pct(charges, m(chargeGst)), 2);
    const chC = intra ? round(chGst / 2n, 2) : 0n;
    const heads = {
      cgst: sum((o) => o.sign * o.lo.cgst) + chC,
      sgst: sum((o) => o.sign * o.lo.sgst) + (intra ? chGst - chC : 0n),
      igst: sum((o) => o.sign * o.lo.igst) + (intra ? 0n : chGst),
    };
    // Tax summary by rate (signed: returns reduce the rate's taxable and tax).
    const rates = [...new Set(out.map((o) => o.x.gstPct))];
    const taxRows = rates.map((r) => {
      const os = out.filter((o) => o.x.gstPct === r);
      return { rate: r, taxable: add(...os.map((o) => o.sign * o.lo.taxable)), gst: add(...os.map((o) => o.sign * o.lo.gst)) };
    });
    if (charges) taxRows.push({ rate: `${chargeGst}% on charges`, taxable: charges, gst: chGst });
    const total = add(taxOut, -taxRet, charges, heads.cgst, heads.sgst, heads.igst);
    const grand = round(total, 0);
    return { out, grossOut, itemDisc, taxOut, taxRet, charges, chGst, heads, taxRows, total, roundOff: sub(grand, total), grand };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, freight, insurance, chargeGst, intra, stock, posted]);

  const hasSR = lines.some((l) => l.section === "SALES_RETURN");
  const hasBE = lines.some((l) => l.section === "BRK_EXP_RETURN");
  const creditNotes = [...(hasSR ? ["CN/26-27/000001"] : []), ...(hasBE ? [`CN/26-27/00000${hasSR ? 2 : 1}`] : [])];
  const due = (() => {
    const [d, mo, y] = TODAY.split("-").map(Number);
    const dt = new Date(Date.UTC(y, mo - 1, d + creditDays));
    return `${String(dt.getUTCDate()).padStart(2, "0")}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${dt.getUTCFullYear()}`;
  })();
  // ⚠ The e-way bill threshold is a statutory value read from settings; the demo shows ₹50,000.
  const ewayNeeded = calc ? calc.grand > m("50000") : false;

  const post = () => {
    setTried(true);
    if (!calc || hdrErr.cases || hdrErr.dl || !lines.some((l) => l.section === "SALE")) return;
    const v: VoucherLine[] = [{ ledger: buyer.name, dr: calc.grand, note: "Net receivable on this document" }];
    if (calc.taxRet) v.push({ ledger: "Sales Return", dr: calc.taxRet, note: `Credit note${creditNotes.length > 1 ? "s" : ""} ${creditNotes.join(", ")}` });
    v.push({ ledger: "Sales", cr: calc.taxOut, note: "Sale + replacement, after item discount" });
    for (const [k, label] of [["cgst", "Output CGST"], ["sgst", "Output SGST"], ["igst", "Output IGST"]] as const) {
      const val = calc.heads[k];
      if (val > 0n) v.push({ ledger: label, cr: val, note: "Net of returns, incl. tax on charges" });
      if (val < 0n) v.push({ ledger: label, dr: -val });
    }
    if (calc.charges) v.push({ ledger: "Freight & Insurance Recovered", cr: calc.charges, note: "Indirect income ⚠ CA" });
    if (calc.roundOff > 0n) v.push({ ledger: "Round Off", cr: calc.roundOff });
    if (calc.roundOff < 0n) v.push({ ledger: "Round Off", dr: -calc.roundOff });
    const moves: WMove[] = lines.map((l) => {
      const n = Number(l.qty) + Number(l.free || 0);
      if (l.section === "SALES_RETURN") return { medId: l.medId, batch: l.batch, qtyIn: n, qtyOut: 0, loc: "Saleable (after inspection)" };
      if (l.section === "BRK_EXP_RETURN") return { medId: l.medId, batch: l.batch, qtyIn: n, qtyOut: 0, loc: "Dump (not saleable)" };
      return { medId: l.medId, batch: l.batch, qtyIn: 0, qtyOut: n, loc: "Saleable" };
    });
    const saleTotal = add(...calc.out.filter((o) => o.sign > 0n).map((o) => o.lo.total), calc.charges, calc.chGst);
    const ledger = [
      { particulars: `Tax invoice ${number} (incl. charges)`, type: "INV", no: number.split("/").pop()!, dr: saleTotal },
      ...creditNotes.map((cn, i) => {
        const sec: Section = i === 0 && hasSR ? "SALES_RETURN" : "BRK_EXP_RETURN";
        return { particulars: `Credit note ${cn} (${sectionOf(sec).l.toLowerCase()})`, type: "CN", no: cn.split("/").pop()!, cr: add(...calc.out.filter((o) => o.l.section === sec).map((o) => o.lo.total)) };
      }),
      ...(calc.roundOff ? [{ particulars: "Round off", type: "JV", no: "—", ...(calc.roundOff > 0n ? { dr: calc.roundOff } : { cr: -calc.roundOff }) }] : []),
    ];
    onPost({ number, creditNotes, buyer, grandTotal: calc.grand, voucher: v, ledger, moves });
  };

  if (!stock.length)
    return (
      <div className={cn(box, "space-y-2 text-[13.5px]")}>
        <p className="font-semibold text-ink">No stock yet</p>
        <p className="text-ink-2">Post the purchase first: the wholesale invoice sells from the same batches.</p>
        <button onClick={onGoPurchase} className="inline-flex h-9 items-center gap-1.5 rounded-ctl bg-ink px-3.5 text-[13px] font-medium text-paper">
          Enter the purchase
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Screen route="/sales/invoices/new?type=wholesale" title={`Wholesale tax invoice · ${number}`} actions={<Kbd>G I</Kbd>}>
          {/* Header */}
          <div className="grid gap-3 sm:grid-cols-3">
            <button onFocus={() => setActive("buyer")} onClick={() => setActive("buyer")} className="rounded-ctl bg-side px-3 py-2 text-left sm:col-span-3">
              <span className="block text-[12px] font-medium text-ink-3">
                Retailer <Kbd>F3</Kbd> {!useSaved && <span className="text-ink-4">· demo retailer (save a Retailer customer to bill them instead)</span>}
              </span>
              <span className="block text-[13.5px] font-semibold text-ink">{buyer.name}</span>
              <span className="block font-mono text-[11.5px] text-ink-3">
                {buyer.gstin ?? "Unregistered"} · DL {buyer.dl ?? "—"} · {buyer.state} ({buyer.stateCode}) → {intra ? "CGST + SGST" : "IGST"}
              </span>
              {tried && hdrErr.dl && <span className="block text-[11.5px] text-critical">{hdrErr.dl}</span>}
            </button>
            <F k="order" label="Order no." value={hdr.order} onChange={(v) => setHdr((h) => ({ ...h, order: v }))} setActive={setActive} mono />
            <F k="order" label="Order date" value={hdr.orderDate} onChange={(v) => setHdr((h) => ({ ...h, orderDate: v }))} setActive={setActive} mono />
            <F k="due" label={`Due date (${creditDays} days)`} value={due} readOnly setActive={setActive} mono />
            <F k="dispatch" label="Transporter" value={hdr.transporter} onChange={(v) => setHdr((h) => ({ ...h, transporter: v }))} setActive={setActive} />
            <F k="dispatch" label="Vehicle no." value={hdr.vehicle} onChange={(v) => setHdr((h) => ({ ...h, vehicle: v.toUpperCase() }))} setActive={setActive} mono />
            <F k="dispatch" label="L.R. no." value={hdr.lr} onChange={(v) => setHdr((h) => ({ ...h, lr: v }))} setActive={setActive} mono />
            <F k="dispatch" label="Cases" value={hdr.cases} onChange={(v) => setHdr((h) => ({ ...h, cases: v }))} setActive={setActive} error={tried ? hdrErr.cases : undefined} mono />
            <F k="order" label="Salesman" value={hdr.salesman} onChange={(v) => setHdr((h) => ({ ...h, salesman: v }))} setActive={setActive} />
          </div>

          {/* Lines */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-line text-left text-[11.5px] text-ink-3">
                  {["Section", "Product · packing · mfr", "Batch · Exp", "Qty", "Free", "Rate", "MRP", "Disc%", "GST%", "Amount", "Reason", ""].map((h) => (
                    <th key={h} className={cn("px-1 py-1 font-medium", ["MRP", "Amount", "GST%"].includes(h) && "text-right")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => {
                  const x = med(l.medId);
                  const b = stock.find((s) => s.medId === l.medId && s.batch === l.batch);
                  const lo = calc?.out[i]?.lo;
                  const err = lineErr(l);
                  const sec = sectionOf(l.section);
                  return (
                    <tr key={i} className="border-b border-line align-top">
                      <td className="px-1 py-1.5">
                        <span className={cn("tint rounded-xs px-1.5 py-0.5 text-[11px] font-medium", sec.sign > 0 ? "at-green" : "at-amber")}>{sec.l}</span>
                      </td>
                      <td className="px-1 py-1.5">
                        <p className="font-medium text-ink">{x.name}</p>
                        <p className="text-[11px] text-ink-4">
                          {x.pack} · {x.mfr} · HSN {x.hsn}
                        </p>
                        {tried && err && <p className="text-[11px] text-critical">{err}</p>}
                      </td>
                      <td className="px-1 py-1.5 font-mono text-[11.5px] text-ink-3">
                        {l.batch} · {b?.expiry}
                      </td>
                      {(["qty", "free", "rate"] as const).map((k) => (
                        <td key={k} className="px-1 py-1">
                          <input value={l[k]} onFocus={() => setActive(k === "free" ? "qty" : k)} onChange={(e) => setLine(i, { [k]: e.target.value })} className={cn(cellInput, k === "rate" ? "w-20" : "w-12")} aria-label={`${x.name} ${k}`} />
                        </td>
                      ))}
                      <td className="px-1 py-1.5 text-right font-mono text-ink-2">{b?.mrp}</td>
                      <td className="px-1 py-1">
                        <input value={l.disc} onFocus={() => setActive("disc")} onChange={(e) => setLine(i, { disc: e.target.value })} className={cn(cellInput, "w-12")} aria-label={`${x.name} discount`} />
                      </td>
                      <td className="px-1 py-1.5 text-right font-mono text-ink-2">{x.gstPct}</td>
                      <td className="px-1 py-1.5 text-right font-mono text-ink">{lo ? `${sec.sign < 0 ? "−" : ""}${fmt(lo.taxable)}` : "—"}</td>
                      <td className="px-1 py-1">
                        {sec.sign < 0 ? <input value={l.reason} onFocus={() => setActive("reason")} onChange={(e) => setLine(i, { reason: e.target.value })} className={cn(cellInput, "w-24 font-sans")} aria-label={`${x.name} reason`} /> : <span className="text-ink-4">—</span>}
                      </td>
                      <td className="px-1 py-1 text-right">
                        <button onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} aria-label={`Remove ${x.name}`} className="rounded-ctl p-1 text-ink-4 hover:bg-hover hover:text-ink">
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <Chips k="section" label="Add a line to" value={addSection} onChange={setAddSection} setActive={setActive} options={SECTIONS.map((s) => ({ v: s.v, l: s.l }))} />
            {meds
              .filter((x) => stock.some((s) => s.medId === x.id))
              .map((x) => (
                <button key={x.id} onClick={() => setLines((ls) => [...ls, blankLine(addSection, x, stock)])} className="inline-flex h-8 items-center gap-1 rounded-ctl px-2.5 text-[12px] text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover">
                  <Plus className="size-3.5" /> {x.name}
                </button>
              ))}
          </div>

          {/* Charges */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <F k="charges" label="Freight (₹)" value={freight} onChange={setFreight} setActive={setActive} error={tried ? chargeErr : undefined} mono />
            <F k="charges" label="Insurance (₹)" value={insurance} onChange={setInsurance} setActive={setActive} mono />
            <Chips k="charges" label="GST on charges (setting ⚠)" value={chargeGst} onChange={setChargeGst} setActive={setActive} options={["0", "5", "12", "18"].map((v) => ({ v, l: `${v}%` }))} />
          </div>

          {ewayNeeded && <p className="at-amber tint mt-3 rounded-ctl px-3 py-2 text-[12px]">⚠ Value above the e-way bill threshold in settings: vehicle and transporter are required and the e-way bill job is queued on post.</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SaveButton label={posted ? "Post again (replaces demo invoice)" : "Save & post"} kbd="F10" onClick={post} />
            {calc && <span className="font-mono text-[13px] text-ink">Net payable ₹{fmt(calc.grand)}</span>}
            {tried && !lines.some((l) => l.section === "SALE") && <span className="text-[12.5px] text-critical">Add at least one Sale line.</span>}
          </div>
        </Screen>
        <FieldGuide guide={GUIDE} active={active} onPick={setActive} />
      </div>

      {calc && <PrintedInvoice number={number} creditNotes={creditNotes} buyer={buyer} intra={intra} hdr={hdr} due={due} calc={calc} chargeGst={chargeGst} freight={freight} insurance={insurance} onFocus={() => setActive("print")} />}

      {posted && (
        <SavedNote>
          Posted <b className="text-ink">{posted.number}</b>
          {posted.creditNotes.length > 0 && <> with credit note{posted.creditNotes.length > 1 ? "s" : ""} <b className="text-ink">{posted.creditNotes.join(", ")}</b></>}. Net ₹{fmt(posted.grandTotal)} is on {posted.buyer.name}&apos;s ledger. Sale and replacement stock went out, the sales return came back to saleable stock after inspection, and the breakage went to the dump bucket (never resold).
        </SavedNote>
      )}
      <NextBar onBack={onBack} onNext={onNext} canNext={!!posted} nextLabel="See what happened" note={posted ? "Open the results: stock movements, vouchers and party ledgers from the whole day." : "Check the printed invoice below, then Save & post. Try selling more than the stock, removing a return reason, or a rate above MRP."} />
    </div>
  );
}

type Calc = {
  out: { l: WLine; x: Med; lo: LineOut; sign: bigint }[];
  grossOut: Money;
  itemDisc: Money;
  taxOut: Money;
  taxRet: Money;
  charges: Money;
  chGst: Money;
  heads: { cgst: Money; sgst: Money; igst: Money };
  taxRows: { rate: string; taxable: Money; gst: Money }[];
  total: Money;
  roundOff: Money;
  grand: Money;
};

/** Printed distributor bill: header, four sections, tax summary, totals, words, terms, signatory. */
function PrintedInvoice({
  number,
  creditNotes,
  buyer,
  intra,
  hdr,
  due,
  calc,
  chargeGst,
  freight,
  insurance,
  onFocus,
}: {
  number: string;
  creditNotes: string[];
  buyer: Party;
  intra: boolean;
  hdr: { order: string; orderDate: string; transporter: string; vehicle: string; lr: string; cases: string; salesman: string };
  due: string;
  calc: Calc;
  chargeGst: string;
  freight: string;
  insurance: string;
  onFocus: () => void;
}) {
  const sign = (o: { sign: bigint }, v: Money) => `${o.sign < 0n ? "−" : ""}${fmt(v)}`;
  const row = (k: string, v: string, strong?: boolean) => (
    <div className={cn("flex justify-between gap-3", strong && "border-t border-line-2 pt-1.5 text-[14px] font-semibold")}>
      <dt className="font-sans text-ink-3">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
  // Serial numbers follow the printed order: sales, returns, replacement.
  const serial = new Map(SECTIONS.flatMap((sec) => calc.out.filter((o) => o.l.section === sec.v)).map((o, i) => [o, i + 1]));
  return (
    <div onMouseEnter={onFocus} className="avoid-break overflow-hidden rounded-tile bg-raised text-[12.5px] shadow-[inset_0_0_0_1px_var(--line-2)]">
      <div className="border-b border-line bg-side px-4 py-3 text-center">
        <p className="font-display text-[18px] font-semibold text-ink">{SHOP.name}</p>
        <p className="text-ink-3">{SHOP.address} · {SHOP.phone}</p>
        <p className="mt-1 font-display text-[14px] font-semibold tracking-wide text-ink">TAX INVOICE</p>
        {creditNotes.length > 0 && <p className="text-[11.5px] text-ink-3">with credit note{creditNotes.length > 1 ? "s" : ""} {creditNotes.join(", ")} (returns) · one settlement</p>}
      </div>
      <div className="grid gap-x-6 gap-y-1 border-b border-line px-4 py-2 font-mono text-[11.5px] text-ink-2 sm:grid-cols-3">
        <span>DL No. {SHOP.dl}</span>
        <span>GSTIN {SHOP.gstin} · State 33</span>
        <span>Place of supply {buyer.state} ({buyer.stateCode})</span>
      </div>
      <div className="grid gap-4 border-b border-line px-4 py-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-4">Bill to</p>
          <p className="font-semibold text-ink">M/s {buyer.name}</p>
          <p className="text-ink-3">{buyer.address}</p>
          <p className="font-mono text-[11.5px] text-ink-2">GSTIN {buyer.gstin ?? "Unregistered"}</p>
          <p className="font-mono text-[11.5px] text-ink-2">DL No. {buyer.dl}</p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-[11.5px]">
          {[
            ["Invoice no.", number],
            ["Date", TODAY],
            ["Order no.", `${hdr.order} · ${hdr.orderDate}`],
            ["L.R. no.", hdr.lr],
            ["Cases", hdr.cases],
            ["Transport", `${hdr.transporter} · ${hdr.vehicle}`],
            ["Salesman", hdr.salesman],
            ["Due date", due],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-sans text-ink-3">{k}</dt>
              <dd className={cn("text-ink", k === "Due date" && "font-semibold")}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-line text-left text-[11px] text-ink-3">
              {["S.", "Product", "Packing", "Mfr.", "HSN", "Batch", "Exp.", "Qty", "Free", "M.R.P.", "Rate", "Disc%", "GST%", "Amount"].map((h) => (
                <th key={h} className={cn("px-2 py-1.5 font-medium", ["Qty", "Free", "M.R.P.", "Rate", "Disc%", "GST%", "Amount"].includes(h) && "text-right")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-[11.5px] tabular-nums text-ink">
            {SECTIONS.map((sec) => {
              const os = calc.out.filter((o) => o.l.section === sec.v);
              if (!os.length) return null;
              return [
                sec.v !== "SALE" && (
                  <tr key={sec.v}>
                    <td colSpan={14} className="px-2 pt-2 font-sans text-[12px] font-semibold italic text-ink">
                      {sec.print.toUpperCase()}
                    </td>
                  </tr>
                ),
                ...os.map((o) => (
                  <tr key={serial.get(o)} className="align-top">
                    <td className="px-2 py-1 text-ink-4">{serial.get(o)}</td>
                    <td className="px-2 py-1 font-sans text-[12px]">{o.x.name}</td>
                    <td className="px-2 py-1">{o.x.pack}</td>
                    <td className="px-2 py-1 font-sans text-[11px]">{o.x.mfr}</td>
                    <td className="px-2 py-1">{o.x.hsn}</td>
                    <td className="px-2 py-1">{o.l.batch}</td>
                    <td className="px-2 py-1">{o.lo.expiry}</td>
                    <td className="px-2 py-1 text-right">{o.l.qty}</td>
                    <td className="px-2 py-1 text-right">{o.l.free !== "0" ? o.l.free : ""}</td>
                    <td className="px-2 py-1 text-right">{o.lo.mrp}</td>
                    <td className="px-2 py-1 text-right">{o.l.rate}</td>
                    <td className="px-2 py-1 text-right">{o.l.disc !== "0" ? o.l.disc : ""}</td>
                    <td className="px-2 py-1 text-right">{o.x.gstPct}</td>
                    <td className="px-2 py-1 text-right">{sign(o, o.lo.taxable)}</td>
                  </tr>
                )),
              ];
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 border-t border-line px-4 py-3 sm:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-4">Tax summary (returns netted)</p>
          <table className="w-full max-w-[420px] border-collapse font-mono text-[11.5px] tabular-nums">
            <thead>
              <tr className="text-left text-ink-3">
                <th className="py-0.5 pr-2 font-sans font-medium">GST%</th>
                <th className="py-0.5 pr-2 text-right font-sans font-medium">Taxable</th>
                <th className="py-0.5 text-right font-sans font-medium">{intra ? "CGST + SGST" : "IGST"}</th>
              </tr>
            </thead>
            <tbody className="text-ink">
              {calc.taxRows.map((r) => (
                <tr key={r.rate}>
                  <td className="py-0.5 pr-2">{r.rate.includes("%") ? r.rate : `${r.rate}%`}</td>
                  <td className="py-0.5 pr-2 text-right">{fmt(r.taxable)}</td>
                  <td className="py-0.5 text-right">{fmt(r.gst)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-ink-2">{inWords(calc.grand)}</p>
          <div className="pt-1">
            <p className="text-[12px] font-semibold text-ink underline">Terms &amp; conditions</p>
            <ol className="list-decimal pl-4 text-[11.5px] text-ink-3">
              <li>Goods once sold are taken back only as per our return policy.</li>
              <li>Interest as per the terms master is charged on bills not paid by the due date.</li>
              <li>Subject to Chennai jurisdiction only.</li>
            </ol>
            <p className="mt-1 text-[11px] text-ink-4">Terms come from the terms &amp; conditions master; the interest rate from the party (illustrative).</p>
          </div>
        </div>
        <dl className="space-y-1 font-mono text-[12px] tabular-nums">
          {row("Sub total (sale + repl.)", fmt(calc.grossOut))}
          {row("Item discount", `−${fmt(calc.itemDisc)}`)}
          {row("Less returns (credit notes)", `−${fmt(calc.taxRet)}`)}
          {row("Taxable value", fmt(calc.taxOut - calc.taxRet))}
          {intra ? (
            <>
              {row("CGST", fmt(calc.heads.cgst))}
              {row("SGST", fmt(calc.heads.sgst))}
            </>
          ) : (
            row("IGST", fmt(calc.heads.igst))
          )}
          {row("Freight", fmt(m(freight || "0")))}
          {row("Insurance", fmt(m(insurance || "0")))}
          {row(`(GST on charges @ ${chargeGst}% incl. above)`, fmt(calc.chGst))}
          {row("Round off", fmt(calc.roundOff))}
          {row("Grand total", `₹${fmt(calc.grand)}`, true)}
        </dl>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line px-4 py-3 text-[11.5px] text-ink-3">
        <p className="max-w-[420px]">Certified that the particulars given above are true and correct and the amount indicated represents the price actually charged. E.&amp;O.E.</p>
        <p>Checked by ________</p>
        <p className="text-right">
          For <b className="text-ink">{SHOP.name}</b>
          <br />
          <br />
          Authorised signatory
        </p>
      </div>
    </div>
  );
}
