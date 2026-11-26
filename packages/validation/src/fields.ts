/**
 * Field rules from docs/architecture/VALIDATION_AND_BUSINESS_RULES.md §4 and docs/product/GSTIN_FETCH.md §4.
 * These mirror the backend Bean Validation annotations; when they differ the backend wins and this file is fixed.
 * Messages are friendly sentences (DESIGN_LANGUAGE §10); codes for API errors are mapped in the app.
 */
import { z } from "zod";

export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const UPI_PATTERN = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
export const INDIAN_MOBILE_PATTERN = /^[6-9][0-9]{9}$/;
export const PIN_PATTERN = /^[1-9][0-9]{5}$/;
export const FSSAI_PATTERN = /^[0-9]{14}$/;
export const MONEY_INPUT_PATTERN = /^\d{1,14}(\.\d{1,2})?$/;

const BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** GSTIN check character (GSTIN_FETCH.md §4 step 4). Expects the first 14 characters, upper case. */
export function gstinCheckChar(first14: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = BASE36.indexOf(first14[i]!);
    if (value < 0) return "";
    const product = value * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return BASE36[(36 - (sum % 36)) % 36]!;
}

export type GstinProblem = "PATTERN" | "PAN" | "CHECK_DIGIT";

/** Steps 1, 3 and 4 of GSTIN_FETCH.md §4. Step 2 (state exists) needs the state list from the API: see gstinStateCode. */
export function checkGstin(value: string): GstinProblem | null {
  const v = value.trim().toUpperCase();
  if (!GSTIN_PATTERN.test(v)) return "PATTERN";
  if (!PAN_PATTERN.test(v.slice(2, 12))) return "PAN";
  if (gstinCheckChar(v.slice(0, 14)) !== v[14]) return "CHECK_DIGIT";
  return null;
}

export const gstinStateCode = (gstin: string) => gstin.trim().slice(0, 2);
export const panFromGstin = (gstin: string) => gstin.trim().toUpperCase().slice(2, 12);

const GSTIN_MESSAGES: Record<GstinProblem, string> = {
  PATTERN: "Enter the 15-character GSTIN, for example 33AAJCN0778N1ZZ.",
  PAN: "Characters 3–12 of a GSTIN must be a PAN.",
  CHECK_DIGIT: "This GSTIN has a typing mistake: the last character doesn't match.",
};

const upper = (s: string) => s.trim().toUpperCase();

export const gstin = z
  .string()
  .transform(upper)
  .superRefine((v, ctx) => {
    const problem = checkGstin(v);
    if (problem) ctx.addIssue({ code: z.ZodIssueCode.custom, message: GSTIN_MESSAGES[problem] });
  });

export const pan = z.string().transform(upper).refine((v) => PAN_PATTERN.test(v), "Enter a 10-character PAN, for example AAAAA0000A.");

export const personName = z
  .string()
  .trim()
  .min(1, "Enter a name.")
  .max(100, "Keep it under 100 characters.")
  // eslint-disable-next-line no-control-regex
  .refine((v) => !/[\u0000-\u001f]/.test(v), "Remove special characters.");

export const businessName = z.string().trim().min(1, "Enter the business name.").max(200, "Keep it under 200 characters.");

/** 10 digits starting 6–9. The API stores E.164 (+91…); the UI shows +91 as a prefix. */
export const indianMobile = z
  .string()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|0)/, ""))
  .refine((v) => INDIAN_MOBILE_PATTERN.test(v), "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.");

export const email = z.string().trim().toLowerCase().min(1, "Enter your email.").max(254, "Keep it under 254 characters.").email("Enter a valid email address.");

export const pin = z.string().trim().refine((v) => PIN_PATTERN.test(v), "Enter a 6-digit PIN code.");
export const ifsc = z.string().transform(upper).refine((v) => IFSC_PATTERN.test(v), "Enter an 11-character IFSC, for example SBIN0001234.");
export const upiId = z.string().trim().refine((v) => UPI_PATTERN.test(v), "Enter a UPI ID like name@bank.");
export const fssai = z.string().trim().refine((v) => FSSAI_PATTERN.test(v), "FSSAI licence numbers have 14 digits.");
export const bankAccountNo = z.string().trim().refine((v) => /^[0-9]{9,18}$/.test(v), "Account numbers have 9 to 18 digits.");
export const drugLicenceNo = z.string().trim().min(3, "Enter the licence number.").max(40, "Keep it under 40 characters.");
export const otpCode = z.string().refine((v) => /^[0-9]{6}$/.test(v), "Enter the 6-digit code.");
/** Money typed by a person: up to 2 decimals, never negative. Stays a string (AGENTS.md rule 5). */
export const moneyInput = z.string().trim().refine((v) => MONEY_INPUT_PATTERN.test(v), "Enter an amount like 2500 or 2500.50.");
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.");
/** Option value that came from the API (never a hard-coded enum, rule 13). */
export const optionValue = (message = "Choose one.") => z.string({ required_error: message }).min(1, message);
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Optional field that is validated only when filled. */
export function optional<T extends z.ZodTypeAny>(schema: T) {
  return z.union([z.literal("").transform(() => undefined), schema]).optional();
}
