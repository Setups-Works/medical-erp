/**
 * Onboarding step schemas (docs/product/ONBOARDING.md §2). Each mirrors a request record in meno-api
 * OnboardingController (BusinessRequest, CompanyRequest, LicencesRequest, BranchRequest, BooksRequest,
 * ConfigurationRequest, GoLiveRequest). Rules that depend on configuration (required licences, setting
 * definitions, FY start month, go-live window) are passed in from the API, never hard-coded here.
 */
import { z } from "zod";
import { checkGstin, email, fssai, indianMobile, isoDate, optional, optionValue, PAN_PATTERN, panFromGstin, pin } from "./fields";

// Backend patterns (OnboardingController): NO_CONTROL = "[^\p{Cntrl}]*", STATE = "[0-9]{2}".
const noControl = (s: string) => !/\p{Cc}/u.test(s);
const text = (max: number, requiredMessage?: string) => {
  const base = z.string().trim().max(max, `Keep it under ${max} characters.`).refine(noControl, "Remove special characters.");
  return requiredMessage ? base.pipe(z.string().min(1, requiredMessage)) : base;
};
const optionalText = (max: number) => text(max).optional().transform((v) => (v ? v : undefined));
const stateCode = (message: string) => z.string({ required_error: message }).regex(/^[0-9]{2}$/, message);

// Step 3 — business profile (BusinessRequest; each value is a code from GET /onboarding/options lists)
export const businessStep = z.object({
  businessType: optionValue("Choose your type of business."),
  branchCount: optionValue("Choose how many shops you have."),
  catalogueSize: optionValue("Choose roughly how many medicines you stock."),
  currentSoftware: optionValue("Choose what you use today."),
  language: optionValue("Choose a language."),
});
export type BusinessStep = z.infer<typeof businessStep>;

// Step 4 — company & GST (CompanyRequest). Which registration type needs a GSTIN is decided by the API
// (registration_type_rule → TENANCY_GSTIN_REQUIRED / TENANCY_GSTIN_NOT_ALLOWED); the UI checks the GSTIN itself.
export const companyStep = z
  .object({
    registrationType: optionValue("Choose the GST registration type."),
    gstin: z.string().transform((v) => v.trim().toUpperCase()),
    legalName: text(200, "Enter the legal name exactly as on the GST registration."),
    tradeName: optionalText(200),
    pan: z.string().transform((v) => v.trim().toUpperCase()).refine((v) => PAN_PATTERN.test(v), "Enter a 10-character PAN, for example AAAAA0000A."),
    addressLine1: text(200, "Enter the address."),
    addressLine2: optionalText(200),
    pin,
    city: text(100, "Enter the city."),
    district: optionalText(100),
    stateCode: stateCode("Choose the state."),
    phone: optional(indianMobile),
    email: optional(email),
  })
  .superRefine((v, ctx) => {
    if (!v.gstin) return;
    const problem = checkGstin(v.gstin);
    if (problem) {
      const message =
        problem === "CHECK_DIGIT" ? "This GSTIN has a typing mistake: the last character doesn't match." : "Enter the 15-character GSTIN, for example 33AAJCN0778N1ZZ.";
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["gstin"], message });
      return;
    }
    if (v.pan && v.pan !== panFromGstin(v.gstin)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pan"], message: "PAN must match characters 3–12 of the GSTIN." });
    if (v.stateCode && v.stateCode !== v.gstin.slice(0, 2))
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["stateCode"], message: "The state must match the GSTIN (its first two digits)." });
  });
export type CompanyStep = z.infer<typeof companyStep>;
export type CompanyForm = z.input<typeof companyStep>;

// Step 5 — licences & pharmacist (LicencesRequest)
export const LICENCE_KINDS = ["DRUG_RETAIL", "DRUG_WHOLESALE", "FSSAI", "NARCOTIC"] as const;
export type LicenceKind = (typeof LICENCE_KINDS)[number];
/** Form field name for each licence kind (structural mapping to the request record, not a business list). */
export const LICENCE_FIELD = { DRUG_RETAIL: "drugRetail", DRUG_WHOLESALE: "drugWholesale", FSSAI: "fssai", NARCOTIC: "narcotic" } as const;

const licenceEntry = z.object({ number: z.string().trim(), validTo: z.string() });

/** `required` comes from GET /onboarding/licences (business_type_licence table); `today` is the server date. */
export function licencesStep(required: readonly string[], today: string) {
  return z
    .object({
      drugRetail: licenceEntry,
      drugWholesale: licenceEntry,
      fssai: licenceEntry,
      narcotic: licenceEntry,
      pharmacistName: text(200, "Enter the pharmacist's name."),
      pharmacistRegNo: text(40, "Enter the registration number.").pipe(z.string().min(3, "Use at least 3 characters.")),
      pharmacistCouncilState: stateCode("Choose the state pharmacy council."),
    })
    .superRefine((v, ctx) => {
      for (const kind of LICENCE_KINDS) {
        const field = LICENCE_FIELD[kind];
        const l = v[field];
        const isRequired = required.includes(kind);
        const filled = Boolean(l.number || l.validTo);
        if (!isRequired && !filled) continue;
        if (l.number.length < 3 || l.number.length > 40)
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field, "number"], message: l.number ? "Use 3 to 40 characters." : "Enter the licence number." });
        if (kind === "FSSAI" && l.number && !fssai.safeParse(l.number).success)
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field, "number"], message: "FSSAI licence numbers have 14 digits." });
        const isDrug = kind === "DRUG_RETAIL" || kind === "DRUG_WHOLESALE";
        if (isDrug && !l.validTo) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field, "validTo"], message: "Pick the date the licence is valid to." });
        if (l.validTo && l.validTo <= today)
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field, "validTo"], message: "This licence has expired. Renew it before billing." });
      }
    });
}
export type LicencesForm = z.input<ReturnType<typeof licencesStep>>;

/** Drops empty optional licences so the API only receives the ones that were filled in. */
export function toLicencesRequest(v: LicencesForm) {
  const entry = (l: { number: string; validTo: string }) => (l.number.trim() ? { number: l.number.trim(), ...(l.validTo ? { validTo: l.validTo } : {}) } : undefined);
  return {
    drugRetail: entry(v.drugRetail),
    drugWholesale: entry(v.drugWholesale),
    fssai: entry(v.fssai),
    narcotic: entry(v.narcotic),
    pharmacistName: v.pharmacistName.trim(),
    pharmacistRegNo: v.pharmacistRegNo.trim(),
    pharmacistCouncilState: v.pharmacistCouncilState,
  };
}

// Step 6 — branches (BranchRequest, one per POST / PUT)
export const branchStep = z.object({
  name: text(100, "Enter the branch name."),
  code: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => /^[A-Z0-9]{1,10}$/.test(v), "Use 1 to 10 capital letters or digits, for example HO or MAIN1."),
  addressLine1: text(200, "Enter the address."),
  addressLine2: optionalText(200),
  pin,
  city: text(100, "Enter the city."),
  district: optionalText(100),
  stateCode: stateCode("Choose the state."),
});
export type BranchStep = z.infer<typeof branchStep>;
export type BranchForm = z.input<typeof branchStep>;

// Step 7 — books (BooksRequest). The FY starts on day 1 of the configured month (options.financialYearStartMonth).
export function booksStep(fyStartMonth: number) {
  return z
    .object({ financialYearStart: isoDate, booksStartDate: isoDate })
    .superRefine((v, ctx) => {
      const [y, m, d] = v.financialYearStart.split("-").map(Number);
      if (m !== fyStartMonth || d !== 1) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["financialYearStart"], message: "Choose a financial year." });
      const end = financialYearEnd(v.financialYearStart);
      if (y && (v.booksStartDate < v.financialYearStart || v.booksStartDate > end))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["booksStartDate"], message: "The books start date must be inside the financial year." });
    });
}
export type BooksForm = z.infer<ReturnType<typeof booksStep>>;

/** Last day of the FY that starts on `start` (yyyy-MM-dd): start + 1 year − 1 day, as in OnboardingService. */
export function financialYearEnd(start: string): string {
  const [y, m] = start.split("-").map(Number) as [number, number];
  const lastDay = new Date(Date.UTC(y + 1, m - 1, 0));
  return lastDay.toISOString().slice(0, 10);
}

/** FY starts to offer: the current FY and the previous one (for a mid-year switch from older software). */
export function financialYearChoices(today: string, fyStartMonth: number): string[] {
  const [y, m] = today.split("-").map(Number) as [number, number];
  const currentStartYear = m >= fyStartMonth ? y : y - 1;
  const mm = String(fyStartMonth).padStart(2, "0");
  return [`${currentStartYear}-${mm}-01`, `${currentStartYear - 1}-${mm}-01`];
}

// Step 8 — billing preferences (ConfigurationRequest: settings map, keys and types from options.settings)
export type SettingDefinition = { key: string; type: string; listCode?: string; defaultValue?: string; min?: number; max?: number };

export function configurationStep(definitions: readonly SettingDefinition[], lists: Record<string, readonly { code?: string }[]>) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const d of definitions) {
    if (d.type === "BOOLEAN") shape[d.key] = z.enum(["true", "false"]);
    else if (d.type === "INTEGER")
      shape[d.key] = z
        .string()
        .trim()
        .regex(/^\d+$/, "Enter a whole number.")
        .refine((v) => d.min === undefined || Number(v) >= d.min, `Use ${d.min} or more.`)
        .refine((v) => d.max === undefined || Number(v) <= d.max, `Use ${d.max} or less.`);
    else if (d.type === "LIST") {
      const allowed = (lists[d.listCode ?? ""] ?? []).map((o) => o.code);
      shape[d.key] = z.string().refine((v) => allowed.includes(v), "Choose one.");
    } else shape[d.key] = z.string().max(100);
  }
  return z.object(shape);
}

// Step 14 — go-live (GoLiveRequest); the window comes from GET /onboarding/go-live
export function goLiveStep(window: { earliest: string; latest: string }) {
  return z.object({
    goLiveDate: isoDate.refine((d) => d >= window.earliest && d <= window.latest, "Pick a date inside the allowed range."),
    confirm: z.boolean().refine((v) => v, "Confirm that you are ready to go live."),
  });
}
