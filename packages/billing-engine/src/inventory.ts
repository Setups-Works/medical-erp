import { type DecimalString, ZERO, d, fixed, max, round } from "./decimal";

/** §17 Reorder point and suggested quantity. Lead time, safety stock and max come from item / branch settings. */
export function reorder(i: { soldUnits: DecimalString; days: DecimalString; leadTimeDays: DecimalString; safetyStock: DecimalString; maxQty: DecimalString; onHand: DecimalString; onOrder: DecimalString; reserved: DecimalString }) {
  const avg = round(d(i.soldUnits).div(i.days), 4);
  const point = avg.times(i.leadTimeDays).plus(i.safetyStock).ceil();
  const available = d(i.onHand).minus(i.reserved);
  const suggested = max(ZERO, d(i.maxQty).minus(d(i.onHand).plus(i.onOrder).minus(i.reserved)));
  return { avgDailySale: fixed(avg, 4), reorderPoint: point.toFixed(0), available: available.toFixed(0), suggestedQty: suggested.toFixed(0) };
}

const DAY_MS = 86_400_000;

/**
 * §18 A batch expires on the last day of its printed month (MM/YYYY). Near-expiry window is a branch setting.
 * Dates are calendar dates in IST; computed in UTC to avoid daylight-saving and time-zone drift.
 */
export function expiryStatus(i: { expiry: string; today: string; nearExpiryDays: DecimalString }) {
  const m = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(i.expiry);
  if (!m) throw new Error(`Expiry must be MM/YYYY, got ${i.expiry}`);
  const month = Number(m[1]);
  const year = Number(m[2]);
  const last = Date.UTC(year, month, 0); // day 0 of next month = last day of this month
  const today = Date.parse(`${i.today}T00:00:00Z`);
  const daysLeft = Math.round((last - today) / DAY_MS);
  const status = daysLeft < 0 ? "expired" : d(daysLeft).lessThanOrEqualTo(i.nearExpiryDays) ? "near_expiry" : "ok";
  return { expiryDate: new Date(last).toISOString().slice(0, 10), daysLeft: String(daysLeft), status };
}
