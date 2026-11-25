import { type DecimalString, ZERO, d, fixed, max, min, sum } from "./decimal";

/** §13 Allocate a receipt to open invoices, oldest first (tenant setting `order`); the rest stays on account. */
export function allocatePayment(i: { invoices: { id: string; outstanding: DecimalString }[]; amount: DecimalString; options?: { order?: "fifo" } }) {
  let left = d(i.amount);
  const allocations: { id: string; amount: DecimalString }[] = [];
  for (const inv of i.invoices) {
    const take = min(left, d(inv.outstanding));
    if (take.greaterThan(0)) allocations.push({ id: inv.id, amount: fixed(take, 2) });
    left = left.minus(take);
  }
  return { allocations, onAccount: fixed(left, 2) };
}

/** §13 Change to return for cash tendered; never negative. */
export function changeDue(i: { tenderedCash: DecimalString[]; billTotal: DecimalString }) {
  return { change: fixed(max(ZERO, sum(i.tenderedCash.map(d)).minus(i.billTotal)), 2) };
}

/** §14 Credit exposure = outstanding + unposted (held / ordered) + this bill, compared with the limit. */
export function creditCheck(i: { outstanding: DecimalString; unposted: DecimalString; bill: DecimalString; limit: DecimalString }) {
  const exposure = d(i.outstanding).plus(i.unposted).plus(i.bill);
  return { exposure: fixed(exposure, 2), withinLimit: exposure.lessThanOrEqualTo(i.limit) };
}

/** §15 Simple interest on an overdue amount: amount × rate % × days ÷ basis days (365 or 360, a party setting). */
export function interestSimple(i: { amount: DecimalString; ratePct: DecimalString; days: DecimalString; basisDays: DecimalString }) {
  return { interest: fixed(d(i.amount).times(i.ratePct).div(100).times(i.days).div(i.basisDays), 2) };
}

/** §15 Compound monthly interest: P × ((1 + r/12)^months − 1). */
export function interestCompoundMonthly(i: { amount: DecimalString; ratePct: DecimalString; months: DecimalString }) {
  const r = d(i.ratePct).div(100).div(12);
  return { interest: fixed(d(i.amount).times(r.plus(1).pow(i.months).minus(1)), 2) };
}

/**
 * §16 TDS on the part of this payment that takes the year's cumulative total above the threshold.
 * Section, rate and threshold come from `tds_section` for the date (RESEARCHED_ANSWERS R-11 / R-12), never code.
 */
export function tds(i: { cumulativeBefore: DecimalString; amount: DecimalString; threshold: DecimalString; ratePct: DecimalString }) {
  const before = d(i.cumulativeBefore);
  const above = max(ZERO, before.plus(i.amount).minus(max(d(i.threshold), before)));
  return { taxableAboveThreshold: fixed(above, 2), tds: fixed(above.times(i.ratePct).div(100), 2) };
}
