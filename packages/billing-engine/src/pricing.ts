import { Dec, type DecimalString, ZERO, d, fixed, round, sum } from "./decimal";
import { calcLine } from "./invoice";

/** §7 Loose sale: per-unit MRP at 4 dp, billed MRP-inclusive; stock leaves in pack terms. */
export function looseSale(i: { mrp: DecimalString; unitsPerPack: DecimalString; looseQty: DecimalString; discountPct?: DecimalString; gstRate: DecimalString; intraState: boolean }) {
  const looseMrp = round(d(i.mrp).div(i.unitsPerPack), 4);
  const l = calcLine({ rate: looseMrp.toString(), qty: i.looseQty, discountPct: i.discountPct, gstRate: i.gstRate }, "MRP_INCLUSIVE", i.intraState);
  return {
    looseMrp: fixed(looseMrp, 4),
    stockOutPacks: fixed(d(i.looseQty).div(i.unitsPerPack), 4),
    gross: fixed(l.gross, 4),
    taxable: fixed(l.taxable, 4),
    gst: fixed(l.gst, 2),
    cgst: fixed(l.cgst, 2),
    sgst: fixed(l.sgst, 2),
    total: fixed(l.total, 4),
  };
}

/** Tie-break when two lines have the same left-over fraction (tenant setting; default: the earlier line). */
export type TieBreak = "earlier_line";

/**
 * §8 / §9 Split an amount (2 dp) across weights: floor every share to the paisa, then give the left-over paise to
 * the largest fractions. Shares always add up to the amount exactly.
 */
export function largestRemainder(total: Dec, weights: Dec[], _tie: TieBreak = "earlier_line"): Dec[] {
  const w = sum(weights);
  if (w.isZero()) return weights.map(() => ZERO);
  const raw = weights.map((x) => total.times(x).div(w));
  const base = raw.map((r) => r.toDecimalPlaces(2, Dec.ROUND_DOWN));
  let left = total.minus(sum(base)).times(100).toNumber(); // a small whole count of paise, safe as a number
  const order = raw.map((r, i) => ({ i, frac: r.minus(base[i]!) })).sort((a, b) => b.frac.comparedTo(a.frac) || a.i - b.i);
  for (const { i } of order) {
    if (left <= 0) break;
    base[i] = base[i]!.plus("0.01");
    left -= 1;
  }
  return base;
}

/** §8 Bill-level discount allocated to lines in proportion to line amount before tax. */
export function allocateBillDiscount(i: { amounts: DecimalString[]; discount: DecimalString; options?: { tieBreak?: TieBreak } }) {
  const shares = largestRemainder(d(i.discount), i.amounts.map(d), i.options?.tieBreak);
  return { shares: shares.map((x) => fixed(x, 2)), sum: fixed(sum(shares), 2) };
}

/** §9 Landed cost: freight shared by taxable value, plus non-claimable tax, over billed + free units. */
export function landedCost(i: { lines: { taxable: DecimalString; billedQty: DecimalString; freeQty: DecimalString; nonClaimableTax: DecimalString }[]; freight: DecimalString; options?: { tieBreak?: TieBreak } }) {
  const freight = d(i.freight);
  const shares = freight.isZero() ? i.lines.map(() => ZERO) : largestRemainder(freight, i.lines.map((l) => d(l.taxable)), i.options?.tieBreak);
  return {
    lines: i.lines.map((l, k) => {
      const value = d(l.taxable).plus(shares[k]!).plus(l.nonClaimableTax);
      return { freightShare: fixed(shares[k]!, 2), landedValue: fixed(value, 4), landedCostPerUnit: fixed(value.div(d(l.billedQty).plus(l.freeQty)), 4) };
    }),
  };
}

/** §9 Suggested PTR = MRP ÷ (1 + GST %) × (1 − margin %), 2 dp. A suggestion only: the supplier's bill wins. */
export function suggestedPtr(i: { mrp: DecimalString; gstRate: DecimalString; marginPct: DecimalString }) {
  const ex = d(i.mrp).times(100).div(d(i.gstRate).plus(100));
  return { ptr: fixed(ex.times(d(100).minus(i.marginPct)).div(100), 2) };
}

/** §10 Margin on sale value and mark-up on cost, as percentages at 2 dp. */
export function margin(i: { saleExGst: DecimalString; cost: DecimalString }) {
  const s = d(i.saleExGst);
  const c = d(i.cost);
  return { marginPct: fixed(s.minus(c).div(s).times(100), 2), markupPct: fixed(s.minus(c).div(c).times(100), 2) };
}

/** §11 Weighted average cost after an inward movement, 4 dp. Free goods come in at zero cost. */
export function weightedAverage(i: { oldQty: DecimalString; oldAvg: DecimalString; inQty: DecimalString; inCost: DecimalString }) {
  const q = d(i.oldQty).plus(i.inQty);
  return { newAvg: fixed(d(i.oldQty).times(i.oldAvg).plus(d(i.inQty).times(i.inCost)).div(q), 4) };
}
