import { type DecimalString, ZERO, d, fixed, round, sum } from "./decimal";
import { type CalcOptions, calcLine } from "./invoice";

/** Sections of a distributor's combined bill (WHS-15). Returns are credit notes underneath; replacement is invoiced. */
export type BillSection = "SALE" | "SALES_RETURN" | "BRK_EXP_RETURN" | "REPLACEMENT";

export type CombinedLine = { section: BillSection; rate: DecimalString; qty: DecimalString; discountPct?: DecimalString; schemePct?: DecimalString; gstRate: DecimalString };

/**
 * §22 Combined distributor bill: sale and replacement add, returns subtract, charges carry GST at the rate the
 * tenant setting `billing.charges_gst` resolves to (passed in as `chargesGstRate`), grand total rounded once.
 */
export function combinedBill(
  i: { lines: CombinedLine[]; freight: DecimalString; insurance: DecimalString; chargesGstRate: DecimalString; intraState: boolean; options?: { chargesGst?: "fixed-rate" } & CalcOptions },
) {
  const out = i.lines.map((l) => ({ sign: l.section === "SALE" || l.section === "REPLACEMENT" ? 1 : -1, r: calcLine(l, "EXCLUSIVE", i.intraState, i.options) }));
  const taxOut = sum(out.filter((o) => o.sign > 0).map((o) => o.r.taxable));
  const taxRet = sum(out.filter((o) => o.sign < 0).map((o) => o.r.taxable));
  const charges = d(i.freight).plus(i.insurance);
  const chGst = round(charges.times(i.chargesGstRate).div(100), 2);
  const chC = i.intraState ? round(chGst.div(2), 2) : ZERO;
  const signed = (f: (r: (typeof out)[number]["r"]) => ReturnType<typeof d>) => sum(out.map((o) => f(o.r).times(o.sign)));
  const cgst = signed((r) => r.cgst).plus(chC);
  const sgst = signed((r) => r.sgst).plus(i.intraState ? chGst.minus(chC) : ZERO);
  const igst = signed((r) => r.igst).plus(i.intraState ? ZERO : chGst);
  const total = taxOut.minus(taxRet).plus(charges).plus(cgst).plus(sgst).plus(igst);
  const grand = round(total, 0);
  return {
    taxableOut: fixed(taxOut, 4),
    taxableReturns: fixed(taxRet, 4),
    charges: fixed(charges, 2),
    chargesGst: fixed(chGst, 2),
    cgst: fixed(cgst, 2),
    sgst: fixed(sgst, 2),
    igst: fixed(igst, 2),
    total: fixed(total, 4),
    roundOff: fixed(grand.minus(total), 2),
    grandTotal: fixed(grand, 2),
  };
}
