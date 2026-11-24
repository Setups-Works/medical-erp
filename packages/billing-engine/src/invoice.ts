import { type Dec, type DecimalString, ZERO, d, fixed, round, sum } from "./decimal";

/** How a line's rate is stated: MRP including GST (retail) or exclusive of GST (PTR / purchase). */
export type PriceMode = "MRP_INCLUSIVE" | "EXCLUSIVE";

/** Tenant setting `gst.split_rounding` (RESEARCHED_ANSWERS R-10): which head takes the odd paisa. */
export type SplitRounding = "cgst_first" | "sgst_first";

export type LineInput = {
  rate: DecimalString;
  qty: DecimalString;
  discountPct?: DecimalString;
  schemePct?: DecimalString;
  gstRate: DecimalString;
};

export type LineResult = { gross: Dec; scheme: Dec; discount: Dec; taxable: Dec; gst: Dec; cgst: Dec; sgst: Dec; igst: Dec; total: Dec };

export type CalcOptions = { splitRounding?: SplitRounding };

/**
 * One line, CALCULATIONS.md §2–§4: scheme % first, then trade discount on what is left (order is a tenant
 * setting applied by the caller), 4-dp intermediates, GST rounded to 2 dp per line, CGST/SGST split per setting.
 */
export function calcLine(l: LineInput, mode: PriceMode, intraState: boolean, opts: CalcOptions = {}): LineResult {
  const g = d(l.gstRate);
  const gross = round(d(l.rate).times(l.qty), 4);
  const scheme = round(gross.times(l.schemePct ?? "0").div(100), 4);
  const discount = round(gross.minus(scheme).times(l.discountPct ?? "0").div(100), 4);
  const amount = gross.minus(scheme).minus(discount);
  let taxable: Dec;
  let gst: Dec;
  if (mode === "MRP_INCLUSIVE") {
    // Back-calculate the taxable value; GST is the rest, rounded to 2 dp.
    const taxable4 = round(amount.times(100).div(g.plus(100)), 4);
    gst = round(amount.minus(taxable4), 2);
    taxable = amount.minus(gst);
  } else {
    taxable = amount;
    gst = round(taxable.times(g).div(100), 2);
  }
  const half = round(gst.div(2), 2);
  const first = (opts.splitRounding ?? "cgst_first") === "cgst_first" ? half : gst.minus(half);
  const cgst = intraState ? first : ZERO;
  const sgst = intraState ? gst.minus(first) : ZERO;
  const igst = intraState ? ZERO : gst;
  return { gross, scheme, discount, taxable, gst, cgst, sgst, igst, total: taxable.plus(gst) };
}

export type InvoiceInput = { mode: PriceMode; intraState: boolean; lines: LineInput[] };

/** Whole invoice: sum stored 4-dp values, then round the grand total once (tenant setting: nearest rupee). */
export function calcInvoice(inv: InvoiceInput, opts: CalcOptions & { roundToPlaces?: number } = {}) {
  const lines = inv.lines.map((l) => calcLine(l, inv.mode, inv.intraState, opts));
  const total = sum(lines.map((l) => l.total));
  const grand = round(total, opts.roundToPlaces ?? 0);
  return {
    lines,
    taxable: sum(lines.map((l) => l.taxable)),
    cgst: sum(lines.map((l) => l.cgst)),
    sgst: sum(lines.map((l) => l.sgst)),
    igst: sum(lines.map((l) => l.igst)),
    total,
    roundOff: grand.minus(total),
    grandTotal: grand,
  };
}

/** String view used by contracts/test-vectors (4 dp amounts, 2 dp taxes). */
export function invoiceToStrings(r: ReturnType<typeof calcInvoice>) {
  return {
    lines: r.lines.map((l) => ({
      gross: fixed(l.gross, 4),
      scheme: fixed(l.scheme, 4),
      discount: fixed(l.discount, 4),
      taxable: fixed(l.taxable, 4),
      gst: fixed(l.gst, 2),
      cgst: fixed(l.cgst, 2),
      sgst: fixed(l.sgst, 2),
      igst: fixed(l.igst, 2),
      total: fixed(l.total, 4),
    })),
    taxable: fixed(r.taxable, 4),
    cgst: fixed(r.cgst, 2),
    sgst: fixed(r.sgst, 2),
    igst: fixed(r.igst, 2),
    total: fixed(r.total, 4),
    roundOff: fixed(r.roundOff, 2),
    grandTotal: fixed(r.grandTotal, 2),
  };
}
