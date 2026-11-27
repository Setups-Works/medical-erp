import { format, parseISO } from "date-fns";

/** 21 Nov 2026 (DESIGN_LANGUAGE §8). Accepts yyyy-MM-dd or an ISO timestamp. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return format(parseISO(value), "dd MMM yyyy");
}

/** "FY 2026-27" from the FY start date (yyyy-MM-dd). The dates themselves come from the API. */
export function formatFinancialYear(startDate: string, endDate: string): string {
  const start = parseISO(startDate).getFullYear();
  const end = parseISO(endDate).getFullYear();
  return `FY ${start}-${String(end).slice(-2)}`;
}

/**
 * ₹1,23,456.50 from an API money string ("123456.5000"). Works on the string so no float ever touches money
 * (AGENTS.md rule 5). Rounds half-up to 2 dp for display only.
 */
export function formatMoney(amount: string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "";
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(amount.trim());
  if (!m) return amount;
  const [, sign, intPart = "0", frac = ""] = m;
  let cents = (frac + "000").slice(0, 3);
  let whole = intPart.replace(/^0+(?=\d)/, "");
  // half-up on the third decimal
  let two = Number.parseInt(cents.slice(0, 2), 10);
  if (Number.parseInt(cents[2]!, 10) >= 5) {
    two += 1;
    if (two === 100) {
      two = 0;
      whole = addOne(whole);
    }
  }
  cents = String(two).padStart(2, "0");
  const grouped = groupIndian(whole);
  const negative = sign === "-" && (whole !== "0" || cents !== "00");
  return `${negative ? "−" : ""}₹${grouped}.${cents}`;
}

function addOne(digits: string): string {
  const arr = digits.split("");
  let i = arr.length - 1;
  while (i >= 0) {
    if (arr[i] === "9") {
      arr[i] = "0";
      i -= 1;
    } else {
      arr[i] = String(Number.parseInt(arr[i]!, 10) + 1);
      return arr.join("");
    }
  }
  return "1" + arr.join("");
}

/** en-IN grouping: last three digits, then pairs (1,23,45,678). */
function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  let rest = digits.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `${parts.join(",")},${last3}`;
}
