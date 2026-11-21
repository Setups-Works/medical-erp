"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { calcInvoice, type PriceMode } from "@/lib/learn/invoice";
import { fmt } from "@/lib/learn/money";
import { SHOP, WALK_IN } from "@/lib/learn/examples";
import { LineSteps } from "./kit";

const NUM = /^\d{1,7}(\.\d{1,4})?$/;

/** Live line calculator: change rate, qty, discount, GST and state, and watch every step. */
export function GstPlayground() {
  const [mode, setMode] = useState<PriceMode>("MRP_INCLUSIVE");
  const [intra, setIntra] = useState(true);
  const [f, setF] = useState({ rate: "112.00", qty: "2", disc: "10", gst: "12" });
  const bad = Object.entries(f).filter(([, v]) => !NUM.test(v)).map(([k]) => k);
  const inv = useMemo(() => {
    if (bad.length || Number(f.disc) > 100) return null;
    return calcInvoice({
      kind: "Tax invoice",
      number: "TRY",
      date: "—",
      mode,
      seller: SHOP,
      buyer: intra ? WALK_IN : { ...WALK_IN, state: "Karnataka", stateCode: "29" },
      lines: [{ item: "Try item", hsn: "3004", qty: f.qty, rate: f.rate, discPct: f.disc, gstPct: f.gst }],
    });
  }, [f, mode, intra, bad.length]);

  const field = (k: keyof typeof f, label: string) => (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-ink-3">{label}</span>
      <input
        inputMode="decimal"
        value={f[k]}
        onChange={(e) => setF((s) => ({ ...s, [k]: e.target.value.trim() }))}
        className={cn("h-9 w-full rounded-ctl bg-raised px-2.5 font-mono text-[13px] shadow-[inset_0_0_0_1px_var(--line-2)] outline-none focus:shadow-[inset_0_0_0_1px_var(--line-3)]", bad.includes(k) && "shadow-[inset_0_0_0_1px_var(--critical)]")}
      />
    </label>
  );
  const toggle = (on: boolean, label: string, onClick: () => void) => (
    <button onClick={onClick} className={cn("h-8 rounded-pill px-3 text-[12.5px] shadow-[inset_0_0_0_1px_var(--line-2)]", on ? "bg-ink text-paper" : "text-ink-2 hover:bg-hover")}>
      {label}
    </button>
  );

  return (
    <div className="space-y-3 rounded-tile bg-side p-4 print:hidden">
      <div className="flex flex-wrap gap-1.5">
        {toggle(mode === "MRP_INCLUSIVE", "Retail · MRP incl. GST", () => setMode("MRP_INCLUSIVE"))}
        {toggle(mode === "EXCLUSIVE", "Wholesale · rate excl. GST", () => setMode("EXCLUSIVE"))}
        <span className="mx-1 w-px self-stretch bg-line-2" />
        {toggle(intra, "Same state", () => setIntra(true))}
        {toggle(!intra, "Other state", () => setIntra(false))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {field("rate", mode === "MRP_INCLUSIVE" ? "MRP per unit (₹)" : "Rate per unit (₹)")}
        {field("qty", "Quantity")}
        {field("disc", "Discount %")}
        {field("gst", "GST % (example)")}
      </div>
      {inv ? (
        <>
          <LineSteps line={inv.lines[0]} mode={mode} intraState={inv.intraState} />
          <p className="font-mono text-[13px] text-ink">
            Total {fmt(inv.total)} → round off {fmt(inv.roundOff)} → <span className="font-semibold">Grand total ₹{fmt(inv.grandTotal)}</span>
          </p>
        </>
      ) : (
        <p className="text-[13px] text-critical">Enter numbers only (up to 4 decimals), discount 0–100.</p>
      )}
    </div>
  );
}
