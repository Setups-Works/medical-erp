/**
 * Exact fixed-point money for the teaching examples (4 decimals, HALF_UP), mirroring
 * docs/architecture/CALCULATIONS.md. Values are BigInt "ten-thousandths" so no float ever touches money,
 * the same rule MENO itself follows (BigDecimal / decimal.js).
 */
export type Money = bigint;

const SCALE = 10000n;

/** Parse "112.50" → 1125000n. Accepts up to 4 decimals. */
export function m(v: string | number): Money {
  const s = String(v).trim();
  const neg = s.startsWith("-");
  const [int, frac = ""] = (neg ? s.slice(1) : s).split(".");
  const out = BigInt(int || "0") * SCALE + BigInt((frac + "0000").slice(0, 4));
  return neg ? -out : out;
}

/** Divide with HALF_UP (away from zero on .5). */
function divRound(a: bigint, b: bigint): bigint {
  const neg = a < 0n !== b < 0n;
  const x = a < 0n ? -a : a;
  const y = b < 0n ? -b : b;
  const q = (x * 2n + y) / (2n * y);
  return neg ? -q : q;
}

export const add = (...xs: Money[]) => xs.reduce((a, b) => a + b, 0n);
export const sub = (a: Money, b: Money) => a - b;
/** a × b, both money-scaled, result rounded to 4 dp. */
export const mul = (a: Money, b: Money) => divRound(a * b, SCALE);
/** a ÷ b, result rounded to 4 dp. */
export const div = (a: Money, b: Money) => divRound(a * SCALE, b);
/** a × p %, rounded to 4 dp. */
export const pct = (a: Money, p: Money) => divRound(a * p, SCALE * 100n);

/** Round to `dp` decimals (0–4), HALF_UP. */
export function round(a: Money, dp: number): Money {
  const unit = 10n ** BigInt(4 - dp);
  return divRound(a, unit) * unit;
}

/** "1,23,456.70": Indian digit grouping, fixed decimals. */
export function fmt(a: Money, dp = 2): string {
  const r = round(a, dp);
  const neg = r < 0n;
  const abs = neg ? -r : r;
  const int = (abs / SCALE).toString();
  const frac = (abs % SCALE).toString().padStart(4, "0").slice(0, dp);
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const grouped = rest ? `${rest},${last3}` : last3;
  return `${neg ? "−" : ""}${grouped}${dp ? `.${frac}` : ""}`;
}

export const rupees = (a: Money, dp = 2) => `₹${fmt(a, dp)}`;
export const isZero = (a: Money) => a === 0n;

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
function words99(n: number): string {
  return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`;
}
function words999(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? `${ONES[h]} Hundred` : "", r ? words99(r) : ""].filter(Boolean).join(" ");
}

/** Whole-rupee amount in Indian words, as printed on an invoice. */
export function inWords(a: Money): string {
  let n = Number(round(a, 0) / SCALE);
  if (n === 0) return "Rupees Zero Only";
  const parts: string[] = [];
  for (const [size, name] of [[10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"]] as const) {
    if (n >= size) {
      parts.push(`${words999(Math.floor(n / size))} ${name}`);
      n %= size;
    }
  }
  if (n) parts.push(words999(n));
  return `Rupees ${parts.join(" ")} Only`;
}
