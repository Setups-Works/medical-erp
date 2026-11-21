"use client";

import { AlertTriangle, ArrowDown, ArrowRight, BookOpen, CheckCircle2, Lightbulb, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { type InvoiceOut, type LedgerEntry, type LineOut, runLedger, type VoucherLine, voucherBalanced } from "@/lib/learn/invoice";
import { type Money, fmt, inWords } from "@/lib/learn/money";

/* ---------- Text blocks ---------- */

export function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="learn-section mt-9 first:mt-0">
      <h2 className="mb-3 font-display text-[20px] font-semibold tracking-[-0.015em]">{title}</h2>
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

export function Sub({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 text-[15px] font-semibold text-ink">{children}</h3>;
}

export function B({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-ink">{children}</strong>;
}

export function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded-xs bg-sunken px-1 font-mono text-[0.9em] text-ink">{children}</code>;
}

export function List({ items, ordered }: { items: React.ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={cn("space-y-1.5 pl-5", ordered ? "list-decimal" : "list-disc", "marker:text-ink-4")}>
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </Tag>
  );
}

const TONES = {
  note: { tint: "at-blue", icon: Lightbulb, label: "Remember" },
  rule: { tint: "at-red", icon: ShieldAlert, label: "Rule" },
  verify: { tint: "at-amber", icon: AlertTriangle, label: "⚠ Needs confirmation" },
  teach: { tint: "at-violet", icon: BookOpen, label: "Teaching tip" },
  ok: { tint: "at-green", icon: CheckCircle2, label: "Check" },
} as const;

export function Callout({ tone = "note", title, children }: { tone?: keyof typeof TONES; title?: string; children: React.ReactNode }) {
  const t = TONES[tone];
  return (
    <div className={cn(t.tint, "tint avoid-break rounded-tile px-4 py-3 text-[13.5px] leading-relaxed")}>
      <p className="mb-1 flex items-center gap-1.5 font-semibold">
        <t.icon className="size-4" />
        {title ?? t.label}
      </p>
      <div className="text-ink-2 [&_strong]:text-ink">{children}</div>
    </div>
  );
}

/* ---------- Tables ---------- */

export function Table({ head, rows, mono, compact }: { head: React.ReactNode[]; rows: React.ReactNode[][]; mono?: number[]; compact?: boolean }) {
  return (
    <div className="avoid-break overflow-x-auto rounded-tile shadow-[inset_0_0_0_1px_var(--line)]">
      <table className={cn("w-full border-collapse text-left", compact ? "text-[12.5px]" : "text-[13px]")}>
        <thead>
          <tr className="bg-side">
            {head.map((h, i) => (
              <th key={i} className="border-b border-line px-3 py-2 font-medium text-ink-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0 align-top">
              {r.map((c, j) => (
                <td key={j} className={cn("px-3 py-2 text-ink-2", mono?.includes(j) && "font-mono text-[12px] text-ink")}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Diagrams ---------- */

export type FlowStep = { title: string; sub?: string; tone?: "blue" | "green" | "amber" | "violet" | "red" | "slate" };

/** Left-to-right chain of boxes (wraps; stacks vertically on phones). */
export function Flow({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="avoid-break flex flex-col items-stretch gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
      {steps.map((s, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 sm:flex-row">
          <div className={cn(`at-${s.tone ?? "slate"}`, "tint w-full rounded-ctl px-3 py-2 sm:w-auto sm:max-w-[190px]")}>
            <p className="text-[13px] font-semibold leading-tight">{s.title}</p>
            {s.sub && <p className="mt-0.5 text-[11.5px] leading-snug opacity-85">{s.sub}</p>}
          </div>
          {i < steps.length - 1 && (
            <>
              <ArrowRight className="hidden size-4 shrink-0 text-ink-4 sm:block" />
              <ArrowDown className="size-4 shrink-0 text-ink-4 sm:hidden" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/** Stacked layers / groups of boxes, e.g. system containers or module groups. */
export function Layers({ layers }: { layers: { name: string; note?: string; tone?: FlowStep["tone"]; items: { title: string; sub?: string }[] }[] }) {
  return (
    <div className="avoid-break space-y-2">
      {layers.map((l, i) => (
        <div key={i} className={cn(`at-${l.tone ?? "slate"}`, "rounded-tile p-3 shadow-[inset_0_0_0_1px_var(--abl)]")}>
          <p className="mb-2 flex flex-wrap items-baseline gap-2 text-[12.5px] font-semibold text-[var(--abf)]">
            {l.name}
            {l.note && <span className="font-normal text-ink-3">{l.note}</span>}
          </p>
          <div className="grid gap-1.5 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
            {l.items.map((it) => (
              <div key={it.title} className="rounded-ctl bg-raised px-2.5 py-1.5 shadow-[inset_0_0_0_1px_var(--line)]">
                <p className="font-mono text-[12px] font-medium text-ink">{it.title}</p>
                {it.sub && <p className="text-[11.5px] leading-snug text-ink-3">{it.sub}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Money views ---------- */

const amt = (v: Money, dp = 2) => <span className="font-mono tabular-nums">{fmt(v, dp)}</span>;

/** "3", "5 loose", or "" — free goods as printed. */
export function freeText(l: { free?: string; freeLoose?: string }) {
  return l.free ?? (l.freeLoose ? `${l.freeLoose} loose` : "");
}

/** Step-by-step maths for one invoice line. */
export function LineSteps({ line, mode, intraState }: { line: LineOut; mode: InvoiceOut["mode"]; intraState: boolean }) {
  const d = line.discPct ?? "0";
  const rows: [string, string, Money, number?][] =
    mode === "MRP_INCLUSIVE"
      ? [
          ["Gross", `MRP ${line.rate} × qty ${line.qty}`, line.gross, 4],
          ["Discount", `gross × ${d}%`, line.disc, 4],
          ["Amount paid (incl. GST)", "gross − discount", line.amount, 4],
          ["Taxable value", `amount ÷ (1 + ${line.gstPct}%) → GST is the rest`, line.taxable, 4],
          ["GST", `amount − taxable, rounded to 2 dp`, line.gst],
        ]
      : [
          ["Gross", `rate ${line.rate} × billed qty ${line.qty}${freeText(line) ? ` (free ${freeText(line)} not charged)` : ""}`, line.gross, 4],
          ...(line.schemePct && line.schemePct !== "0" ? ([["Scheme discount", `gross × ${line.schemePct}% (before trade discount ⚠)`, line.scheme, 4]] as [string, string, Money, number][]) : []),
          ["Trade discount", line.schemePct && line.schemePct !== "0" ? `(gross − scheme) × ${d}%` : `gross × ${d}%`, line.disc, 4],
          ["Taxable value", line.schemePct && line.schemePct !== "0" ? "gross − scheme − trade discount" : "gross − trade discount", line.taxable, 4],
          ["GST", `taxable × ${line.gstPct}%, rounded to 2 dp`, line.gst],
        ];
  if (intraState) {
    rows.push(["CGST", "half of GST, rounded (odd paisa → CGST)", line.cgst]);
    rows.push(["SGST", "GST − CGST", line.sgst]);
  } else rows.push(["IGST", "whole GST (inter-state)", line.igst]);
  rows.push(["Line total", "taxable + GST", line.total, 4]);
  return (
    <Table
      compact
      head={["Step", "How", "Value (₹)"]}
      rows={rows.map(([a, b, v, dp]) => [<span key="a" className="font-medium text-ink">{a}</span>, b, amt(v, dp ?? 2)])}
    />
  );
}

/** A printed-style GST invoice / purchase bill / credit note. */
export function InvoiceView({ inv, showBatch = true }: { inv: InvoiceOut; showBatch?: boolean }) {
  // B2B pharma bills (wholesale → retailer) must carry both parties' drug licence numbers (WHS-03, CMP-05).
  const b2b = !!inv.buyer.gstin;
  const hasScheme = inv.lines.some((l) => l.schemePct && l.schemePct !== "0");
  const party = (label: string, p: InvoiceOut["seller"], needsDl: boolean) => (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-4">{label}</p>
      <p className="font-semibold text-ink">{p.name}</p>
      <p className="text-ink-3">{p.address}</p>
      <p className="text-ink-3">
        State: {p.state} ({p.stateCode})
      </p>
      {p.gstin && <p className="font-mono text-[11.5px] text-ink-2">GSTIN {p.gstin}</p>}
      {p.dl ? (
        <div className="at-blue tint mt-1.5 inline-block rounded-xs px-2 py-1">
          <p className="text-[10.5px] font-medium uppercase tracking-wide">Drug licence no.{p.dlForms ? ` · ${p.dlForms}` : ""}</p>
          <p className="font-mono text-[12px] font-semibold">{p.dl}</p>
        </div>
      ) : (
        needsDl && <p className="at-red tint mt-1.5 inline-block rounded-xs px-2 py-1 text-[11.5px]">Drug licence no. missing: required on a B2B pharma bill</p>
      )}
    </div>
  );
  return (
    <div className="avoid-break overflow-hidden rounded-tile bg-raised text-[12.5px] shadow-[inset_0_0_0_1px_var(--line-2)]">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line bg-side px-4 py-3">
        <div>
          <p className="font-display text-[16px] font-semibold text-ink">{inv.kind}</p>
          <p className="text-ink-3">{inv.mode === "MRP_INCLUSIVE" ? "Rates are MRP (GST included)" : "Rates are exclusive of GST"}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[13px] font-medium text-ink">{inv.number}</p>
          <p className="text-ink-3">Date {inv.date}</p>
          <p className="text-ink-3">
            Place of supply: {inv.buyer.state} ({inv.buyer.stateCode}) · {inv.intraState ? "CGST + SGST" : "IGST"}
          </p>
        </div>
      </div>
      <div className="grid gap-4 border-b border-line px-4 py-3 sm:grid-cols-2">
        {party(inv.kind === "Purchase invoice" ? "Supplier" : "Seller", inv.seller, true)}
        {party(inv.kind === "Purchase invoice" ? "Bill to (us)" : "Buyer", inv.buyer, b2b)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line text-left text-[11.5px] text-ink-3">
              <th className="px-3 py-1.5 font-medium">#</th>
              <th className="px-2 py-1.5 font-medium">Item</th>
              <th className="px-2 py-1.5 font-medium">HSN</th>
              {showBatch && <th className="px-2 py-1.5 font-medium">Batch · Exp</th>}
              <th className="px-2 py-1.5 text-right font-medium">Qty</th>
              <th className="px-2 py-1.5 text-right font-medium">Free</th>
              <th className="px-2 py-1.5 text-right font-medium">MRP</th>
              {inv.mode === "EXCLUSIVE" && <th className="px-2 py-1.5 text-right font-medium">PTR / Rate</th>}
              {hasScheme && <th className="px-2 py-1.5 text-right font-medium">Sch%</th>}
              <th className="px-2 py-1.5 text-right font-medium">{inv.mode === "EXCLUSIVE" ? "TD%" : "Disc%"}</th>
              <th className="px-2 py-1.5 text-right font-medium">Taxable</th>
              <th className="px-2 py-1.5 text-right font-medium">GST%</th>
              <th className="px-2 py-1.5 text-right font-medium">GST</th>
              <th className="px-3 py-1.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[12px] tabular-nums text-ink">
            {inv.lines.map((l, i) => (
              <tr key={i} className="border-b border-line align-top">
                <td className="px-3 py-1.5 text-ink-4">{i + 1}</td>
                <td className="px-2 py-1.5 font-sans text-[12.5px]">
                  {l.item}
                  {l.pack && <span className="text-ink-4"> · {l.pack}</span>}
                </td>
                <td className="px-2 py-1.5">{l.hsn}</td>
                {showBatch && (
                  <td className="whitespace-nowrap px-2 py-1.5 text-ink-2">
                    {l.batch ?? "—"} · {l.expiry ?? "—"}
                  </td>
                )}
                <td className="px-2 py-1.5 text-right">{l.qty}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-right">{freeText(l) || <span className="text-ink-4">—</span>}</td>
                <td className="px-2 py-1.5 text-right">{l.mrp ?? (inv.mode === "MRP_INCLUSIVE" ? l.rate : <span className="text-ink-4">—</span>)}</td>
                {inv.mode === "EXCLUSIVE" && <td className="px-2 py-1.5 text-right">{l.rate}</td>}
                {hasScheme && <td className="px-2 py-1.5 text-right">{l.schemePct ?? "0"}</td>}
                <td className="px-2 py-1.5 text-right">{l.discPct ?? "0"}</td>
                <td className="px-2 py-1.5 text-right">{fmt(l.taxable)}</td>
                <td className="px-2 py-1.5 text-right">{l.gstPct}</td>
                <td className="px-2 py-1.5 text-right">{fmt(l.gst)}</td>
                <td className="px-3 py-1.5 text-right">{fmt(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 px-4 py-3 sm:grid-cols-[1fr_260px]">
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-4">Tax summary</p>
          <table className="w-full max-w-[420px] border-collapse font-mono text-[11.5px] tabular-nums">
            <thead>
              <tr className="text-left text-ink-3">
                <th className="py-0.5 pr-2 font-sans font-medium">GST%</th>
                <th className="py-0.5 pr-2 text-right font-sans font-medium">Taxable</th>
                {inv.intraState ? (
                  <>
                    <th className="py-0.5 pr-2 text-right font-sans font-medium">CGST</th>
                    <th className="py-0.5 text-right font-sans font-medium">SGST</th>
                  </>
                ) : (
                  <th className="py-0.5 text-right font-sans font-medium">IGST</th>
                )}
              </tr>
            </thead>
            <tbody className="text-ink">
              {inv.taxRows.map((r) => (
                <tr key={r.rate}>
                  <td className="py-0.5 pr-2">{r.rate}%</td>
                  <td className="py-0.5 pr-2 text-right">{fmt(r.taxable)}</td>
                  {inv.intraState ? (
                    <>
                      <td className="py-0.5 pr-2 text-right">{fmt(r.cgst)}</td>
                      <td className="py-0.5 text-right">{fmt(r.sgst)}</td>
                    </>
                  ) : (
                    <td className="py-0.5 text-right">{fmt(r.igst)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-ink-3">{inWords(inv.grandTotal)}</p>
          {inv.payment && <p className="text-ink-3">Payment: {inv.payment}</p>}
          {inv.doctor && <p className="text-ink-3">Prescribed by: {inv.doctor}</p>}
          {inv.notes?.map((n) => (
            <p key={n} className="text-[11.5px] text-ink-4">
              {n}
            </p>
          ))}
        </div>
        <dl className="space-y-1 font-mono text-[12px] tabular-nums">
          {(
            [
              ["Taxable value", inv.taxable],
              ...(inv.intraState
                ? ([
                    ["CGST", inv.cgst],
                    ["SGST", inv.sgst],
                  ] as const)
                : ([["IGST", inv.igst]] as const)),
              ["Total", inv.total],
              ["Round off", inv.roundOff],
            ] as [string, Money][]
          ).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="font-sans text-ink-3">{k}</dt>
              <dd className="text-ink">{fmt(v)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-3 border-t border-line-2 pt-1.5 text-[14px] font-semibold">
            <dt className="font-sans text-ink">{inv.kind === "Credit note" ? "Credit amount" : "Grand total"}</dt>
            <dd className="text-ink">₹{fmt(inv.grandTotal)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/** Double-entry voucher with a balance check. */
export function VoucherView({ title, lines }: { title: string; lines: VoucherLine[] }) {
  const b = voucherBalanced(lines);
  return (
    <div className="avoid-break space-y-1.5">
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      <Table
        compact
        head={["Ledger", "Debit (₹)", "Credit (₹)", "Why"]}
        mono={[1, 2]}
        rows={[
          ...lines.map((l) => [
            l.dr ? (
              <span key="l" className="text-ink">Dr {l.ledger}</span>
            ) : (
              <span key="l" className="pl-6 text-ink">Cr {l.ledger}</span>
            ),
            l.dr ? fmt(l.dr) : "",
            l.cr ? fmt(l.cr) : "",
            l.note ?? "",
          ]),
          [<span key="t" className="font-semibold text-ink">Total</span>, fmt(b.dr), fmt(b.cr), b.ok ? "✓ Debit = Credit" : "✗ Not balanced"],
        ]}
      />
    </div>
  );
}

/** Party ledger with running balance. */
export function LedgerView({ title, opening, entries, creditNormal }: { title: string; opening: Money; entries: LedgerEntry[]; creditNormal?: boolean }) {
  const rows = runLedger(creditNormal ? -opening : opening, entries);
  const side = (v: Money) => (v === 0n ? "0.00" : v > 0n ? `${fmt(v)} Dr` : `${fmt(-v)} Cr`);
  return (
    <div className="avoid-break space-y-1.5">
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      <Table
        compact
        head={["Date", "Particulars", "Voucher", "Debit (₹)", "Credit (₹)", "Balance (₹)"]}
        mono={[2, 3, 4, 5]}
        rows={[
          ["", <span key="o" className="font-medium text-ink">Opening balance</span>, "", "", "", side(creditNormal ? -opening : opening)],
          ...rows.map((r) => [r.date, r.particulars, `${r.type} ${r.no}`, r.dr ? fmt(r.dr) : "", r.cr ? fmt(r.cr) : "", side(r.balance)]),
        ]}
      />
    </div>
  );
}

/* ---------- Class activities ---------- */

export function Quiz({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number[]>([]);
  return (
    <ol className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="avoid-break rounded-tile bg-side px-4 py-2.5">
          <p className="text-[13.5px] font-medium text-ink">
            {i + 1}. {it.q}
          </p>
          <button
            className="mt-1 text-[12.5px] text-ink-3 underline decoration-line-3 underline-offset-2 hover:text-ink print:hidden"
            onClick={() => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]))}
          >
            {open.includes(i) ? "Hide answer" : "Show answer"}
          </button>
          <div className={cn("mt-1 text-[13px] text-ink-2", open.includes(i) ? "block" : "hidden", "print:block")}>
            <span className="font-medium text-ink">Answer: </span>
            {it.a}
          </div>
        </li>
      ))}
    </ol>
  );
}
