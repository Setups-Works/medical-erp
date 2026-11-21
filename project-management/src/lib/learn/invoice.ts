import { type Money, add, div, m, mul, pct, round, sub } from "./money";

/**
 * Teaching copy of the line and invoice maths in docs/architecture/CALCULATIONS.md.
 * MENO's real engines are Java `taxation`/`pricing` and `packages/billing-engine`; this one only explains them.
 */
export type PriceMode = "EXCLUSIVE" | "MRP_INCLUSIVE";

export type LineIn = {
  item: string;
  hsn: string;
  batch?: string;
  expiry?: string;
  pack?: string;
  qty: string;
  /** Free quantity in packs (scheme "10 + 1"). */
  free?: string;
  /** Free quantity in loose units, e.g. 5 tablets for a "10 + ½" half scheme on a 1×10 strip. */
  freeLoose?: string;
  /** Loose units per pack (10 for a 1×10 strip), needed for loose free goods and per-unit cost. */
  unitsPerPack?: string;
  /** Scheme discount %, applied before trade discount (⚠ VERIFY order). */
  schemePct?: string;
  /** Rate per unit: PTR/purchase rate (EXCLUSIVE) or MRP (MRP_INCLUSIVE). */
  rate: string;
  mrp?: string;
  discPct?: string;
  gstPct: string;
};

export type LineOut = LineIn & {
  gross: Money;
  scheme: Money;
  disc: Money;
  amount: Money;
  taxable: Money;
  gst: Money;
  cgst: Money;
  sgst: Money;
  igst: Money;
  total: Money;
};

export type Party = { name: string; address: string; state: string; stateCode: string; gstin?: string; dl?: string; dlForms?: string; phone?: string };

export type InvoiceIn = {
  kind: "Tax invoice" | "Purchase invoice" | "Credit note";
  number: string;
  date: string;
  mode: PriceMode;
  seller: Party;
  buyer: Party;
  lines: LineIn[];
  payment?: string;
  doctor?: string;
  notes?: string[];
};

export type TaxRow = { rate: string; taxable: Money; cgst: Money; sgst: Money; igst: Money };

export type InvoiceOut = Omit<InvoiceIn, "lines"> & {
  intraState: boolean;
  lines: LineOut[];
  taxable: Money;
  disc: Money;
  cgst: Money;
  sgst: Money;
  igst: Money;
  gst: Money;
  total: Money;
  roundOff: Money;
  grandTotal: Money;
  taxRows: TaxRow[];
};

export function calcLine(l: LineIn, mode: PriceMode, intraState: boolean): LineOut {
  const qty = m(l.qty);
  const g = m(l.gstPct);
  const gross = mul(m(l.rate), qty);
  // Scheme discount first, then trade discount on what is left (CALCULATIONS.md §5, ⚠ VERIFY order).
  const scheme = pct(gross, m(l.schemePct ?? "0"));
  const disc = pct(sub(gross, scheme), m(l.discPct ?? "0"));
  const amount = sub(sub(gross, scheme), disc);
  let taxable: Money;
  let gst: Money;
  if (mode === "MRP_INCLUSIVE") {
    // Back-calculate: taxable = amount / (1 + rate); GST is what is left, rounded to 2 dp.
    const taxable4 = div(mul(amount, m("100")), add(m("100"), g));
    gst = round(sub(amount, taxable4), 2);
    taxable = sub(amount, gst);
  } else {
    taxable = amount;
    gst = round(pct(taxable, g), 2);
  }
  // CGST = half of the line GST rounded to 2 dp (odd paisa to CGST, ⚠ VERIFY); SGST = the rest.
  const cgst = intraState ? round(div(gst, m("2")), 2) : 0n;
  const sgst = intraState ? sub(gst, cgst) : 0n;
  const igst = intraState ? 0n : gst;
  return { ...l, gross, scheme, disc, amount, taxable, gst, cgst, sgst, igst, total: add(taxable, gst) };
}

export function calcInvoice(inv: InvoiceIn): InvoiceOut {
  const intraState = inv.seller.stateCode === inv.buyer.stateCode;
  const lines = inv.lines.map((l) => calcLine(l, inv.mode, intraState));
  const sum = (f: (l: LineOut) => Money) => add(...lines.map(f));
  // Sum the stored values, then round once (never add up rounded displays).
  const total = sum((l) => l.total);
  const grandTotal = round(total, 0);
  const rates = [...new Set(lines.map((l) => l.gstPct))];
  const taxRows = rates.map((rate) => {
    const ls = lines.filter((l) => l.gstPct === rate);
    const s = (f: (l: LineOut) => Money) => add(...ls.map(f));
    return { rate, taxable: s((l) => l.taxable), cgst: s((l) => l.cgst), sgst: s((l) => l.sgst), igst: s((l) => l.igst) };
  });
  return {
    ...inv,
    intraState,
    lines,
    taxable: sum((l) => l.taxable),
    disc: sum((l) => l.disc),
    cgst: sum((l) => l.cgst),
    sgst: sum((l) => l.sgst),
    igst: sum((l) => l.igst),
    gst: sum((l) => l.gst),
    total,
    roundOff: sub(grandTotal, total),
    grandTotal,
    taxRows,
  };
}

/**
 * Effective cost of one unit after free goods and discounts (GST excluded: it comes back as input credit).
 * Free packs or loose free units dilute the cost; result is per pack, or per loose unit when the scheme is loose.
 */
export function landedCost(l: LineOut): { per: Money; units: Money; unit: "pack" | "loose" } {
  if (l.freeLoose) {
    const units = add(mul(m(l.qty), m(l.unitsPerPack ?? "1")), m(l.freeLoose));
    return { per: div(l.taxable, units), units, unit: "loose" };
  }
  const units = add(m(l.qty), m(l.free ?? "0"));
  return { per: div(l.taxable, units), units, unit: "pack" };
}

/* ---------- Ledgers and vouchers ---------- */

export type VoucherLine = { ledger: string; dr?: Money; cr?: Money; note?: string };

export function voucherBalanced(lines: VoucherLine[]) {
  const dr = add(...lines.map((l) => l.dr ?? 0n));
  const cr = add(...lines.map((l) => l.cr ?? 0n));
  return { dr, cr, ok: dr === cr };
}

export type LedgerEntry = { date: string; particulars: string; type: string; no: string; dr?: Money; cr?: Money };
export type LedgerRow = LedgerEntry & { balance: Money };

/** Running balance; positive = Dr (they owe us / asset), negative = Cr. */
export function runLedger(opening: Money, entries: LedgerEntry[]): LedgerRow[] {
  let bal = opening;
  return entries.map((e) => {
    bal = add(bal, e.dr ?? 0n, -(e.cr ?? 0n));
    return { ...e, balance: bal };
  });
}

/** Sales invoice → voucher using the default posting rules (CHART_OF_ACCOUNTS.md). */
export function salesVoucher(inv: InvoiceOut, debitLedger: string): VoucherLine[] {
  const v: VoucherLine[] = [{ ledger: debitLedger, dr: inv.grandTotal, note: "What the customer pays" }];
  v.push({ ledger: "Sales", cr: inv.taxable, note: "Taxable value" });
  if (inv.cgst) v.push({ ledger: "Output CGST", cr: inv.cgst });
  if (inv.sgst) v.push({ ledger: "Output SGST", cr: inv.sgst });
  if (inv.igst) v.push({ ledger: "Output IGST", cr: inv.igst });
  if (inv.roundOff > 0n) v.push({ ledger: "Round Off", cr: inv.roundOff, note: "Rounded up" });
  if (inv.roundOff < 0n) v.push({ ledger: "Round Off", dr: -inv.roundOff, note: "Rounded down" });
  return v;
}

/** Purchase invoice → voucher. */
export function purchaseVoucher(inv: InvoiceOut, supplierLedger: string): VoucherLine[] {
  const v: VoucherLine[] = [{ ledger: "Purchase", dr: inv.taxable, note: "Taxable value of goods" }];
  if (inv.cgst) v.push({ ledger: "Input CGST", dr: inv.cgst, note: "Tax we can claim back (ITC)" });
  if (inv.sgst) v.push({ ledger: "Input SGST", dr: inv.sgst });
  if (inv.igst) v.push({ ledger: "Input IGST", dr: inv.igst });
  if (inv.roundOff < 0n) v.push({ ledger: "Round Off", cr: -inv.roundOff });
  if (inv.roundOff > 0n) v.push({ ledger: "Round Off", dr: inv.roundOff });
  v.push({ ledger: supplierLedger, cr: inv.grandTotal, note: "What we owe the supplier" });
  return v;
}
