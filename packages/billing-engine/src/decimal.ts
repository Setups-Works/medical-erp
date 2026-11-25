import Decimal from "decimal.js";

/**
 * Money and quantity maths for MENO (AGENTS.md rule 5): decimal.js only, never JS numbers.
 * 40 significant digits, HALF_UP everywhere, as in docs/architecture/CALCULATIONS.md §3.
 */
export const Dec = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export type Dec = InstanceType<typeof Dec>;

/** A decimal written as a string: "112.50". All public inputs and outputs use it. */
export type DecimalString = string;

export const d = (v: DecimalString | number | Dec): Dec => new Dec(v);
export const ZERO = d(0);

/** Round to `dp` places, HALF_UP. */
export const round = (x: Dec, dp: number): Dec => x.toDecimalPlaces(dp, Dec.ROUND_HALF_UP);

/** Fixed-point string with `dp` places; never "-0.00". */
export function fixed(x: Dec, dp: number): DecimalString {
  const r = round(x, dp);
  return (r.isZero() ? r.abs() : r).toFixed(dp);
}

export const sum = (xs: Dec[]): Dec => xs.reduce((a, b) => a.plus(b), ZERO);
export const max = (a: Dec, b: Dec): Dec => (a.greaterThan(b) ? a : b);
export const min = (a: Dec, b: Dec): Dec => (a.lessThan(b) ? a : b);
