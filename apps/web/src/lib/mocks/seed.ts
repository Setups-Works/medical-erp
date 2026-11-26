/**
 * Mock reference data, copied from the meno-api seed migrations on feature/7-tenancy-onboarding
 * (V202611262000 state, V202611262300 lookup_option / setting_definition / onboarding_step). Mocks only: the app
 * itself always reads these from the API. Keep in sync when the migrations change.
 */
export const STATES = [
  ["01", "Jammu and Kashmir", "UNION_TERRITORY"], ["02", "Himachal Pradesh", "STATE"], ["03", "Punjab", "STATE"],
  ["04", "Chandigarh", "UNION_TERRITORY"], ["05", "Uttarakhand", "STATE"], ["06", "Haryana", "STATE"],
  ["07", "Delhi", "UNION_TERRITORY"], ["08", "Rajasthan", "STATE"], ["09", "Uttar Pradesh", "STATE"],
  ["10", "Bihar", "STATE"], ["11", "Sikkim", "STATE"], ["12", "Arunachal Pradesh", "STATE"], ["13", "Nagaland", "STATE"],
  ["14", "Manipur", "STATE"], ["15", "Mizoram", "STATE"], ["16", "Tripura", "STATE"], ["17", "Meghalaya", "STATE"],
  ["18", "Assam", "STATE"], ["19", "West Bengal", "STATE"], ["20", "Jharkhand", "STATE"], ["21", "Odisha", "STATE"],
  ["22", "Chhattisgarh", "STATE"], ["23", "Madhya Pradesh", "STATE"], ["24", "Gujarat", "STATE"],
  ["26", "Dadra and Nagar Haveli and Daman and Diu", "UNION_TERRITORY"], ["27", "Maharashtra", "STATE"],
  ["29", "Karnataka", "STATE"], ["30", "Goa", "STATE"], ["31", "Lakshadweep", "UNION_TERRITORY"], ["32", "Kerala", "STATE"],
  ["33", "Tamil Nadu", "STATE"], ["34", "Puducherry", "UNION_TERRITORY"], ["35", "Andaman and Nicobar Islands", "UNION_TERRITORY"],
  ["36", "Telangana", "STATE"], ["37", "Andhra Pradesh", "STATE"], ["38", "Ladakh", "UNION_TERRITORY"], ["97", "Other Territory", "OTHER"],
].map(([code, name, kind]) => ({ code: code!, name: name!, kind: kind! }));

const list = (rows: [string, string][]) => rows.map(([code, label]) => ({ code, label }));

export const LISTS = {
  business_type: list([["RETAIL", "Retail pharmacy"], ["WHOLESALE", "Wholesale / distributor"], ["BOTH", "Both retail and wholesale"], ["HOSPITAL", "Hospital pharmacy"], ["CHAIN", "Chain (2+ shops)"]]),
  branch_count: list([["ONE", "1"], ["TWO_TO_FIVE", "2–5"], ["SIX_PLUS", "6+"]]),
  catalogue_size: list([["UNDER_2000", "Fewer than 2,000 medicines"], ["FROM_2000_TO_10000", "2,000–10,000 medicines"], ["OVER_10000", "More than 10,000 medicines"]]),
  current_software: list([["MARG", "Marg"], ["TALLY", "Tally"], ["BUSY", "Busy"], ["VYAPAR", "Vyapar"], ["GOFRUGAL", "GoFrugal"], ["OTHER", "Other"], ["NONE", "Paper / none"]]),
  language: list([["EN", "English"]]),
  registration_type: list([["REGULAR", "Regular"], ["COMPOSITION", "Composition"], ["UNREGISTERED", "Not registered"]]),
  negative_stock_policy: list([["BLOCK", "Block the sale"], ["WARN", "Warn and allow"]]),
  paper_size: list([["THERMAL_2IN", "Thermal 2 inch"], ["THERMAL_3IN", "Thermal 3 inch"], ["A5", "A5"], ["A4", "A4"], ["DOT_MATRIX", "Dot-matrix"]]),
};

export const GSTIN_REQUIRED: Record<string, boolean> = { REGULAR: true, COMPOSITION: true, UNREGISTERED: false };

export const BUSINESS_TYPE_LICENCES: Record<string, string[]> = {
  RETAIL: ["DRUG_RETAIL"],
  WHOLESALE: ["DRUG_WHOLESALE"],
  BOTH: ["DRUG_RETAIL", "DRUG_WHOLESALE"],
  HOSPITAL: ["DRUG_RETAIL"],
  CHAIN: ["DRUG_RETAIL"],
};

export const SETTINGS = [
  { key: "stock.negative_policy", type: "LIST", listCode: "negative_stock_policy", defaultValue: "BLOCK" },
  { key: "stock.fefo_default", type: "BOOLEAN", defaultValue: "true" },
  { key: "stock.near_expiry_days", type: "INTEGER", defaultValue: "90", min: 1, max: 365 },
  { key: "pricing.round_grand_total", type: "BOOLEAN", defaultValue: "true" },
  { key: "invoice.paper_size", type: "LIST", listCode: "paper_size", defaultValue: "A4" },
];

export const STEPS = [
  { code: "BUSINESS", required: true, available: true, phase: "P2", route: "/onboarding/business" },
  { code: "COMPANY", required: true, available: true, phase: "P2", route: "/onboarding/pharmacy" },
  { code: "LICENCES", required: true, available: true, phase: "P2", route: "/onboarding/licences" },
  { code: "BRANCHES", required: true, available: true, phase: "P2", route: "/onboarding/branches" },
  { code: "BOOKS", required: true, available: true, phase: "P2", route: "/onboarding/books" },
  { code: "CONFIGURATION", required: true, available: true, phase: "P2", route: "/onboarding/configuration" },
  { code: "TEAM", required: false, available: false, phase: "P2", route: "/onboarding/team" },
  { code: "DATA", required: false, available: false, phase: "P3", route: "/onboarding/data" },
  { code: "DEVICES", required: false, available: false, phase: "P4", route: "/onboarding/devices" },
  { code: "PLAN", required: false, available: false, phase: "P5", route: "/onboarding/plan" },
  { code: "PRACTICE", required: false, available: false, phase: "P4", route: "/onboarding/practice" },
];

export const FY_START_MONTH = 4;
export const GO_LIVE_MAX_DAYS_AHEAD = 7;
export const MIN_PASSWORD_LENGTH = 10;
export const TERMS_VERSION = "draft-2026-11";
export const START_OPTIONS = ["TRIAL", "DEMO", "LICENSE_KEY"];

/** Fixed codes the mock accepts, shown in the mock-mode hints. */
export const MOCK_OTP = "123456";
export const MOCK_INVITE_TOKEN = "demo-invite";
export const MOCK_RESET_TOKEN = "demo-reset";
