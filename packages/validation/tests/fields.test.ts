import { describe, expect, it } from "vitest";
import {
  acceptInvitationForm,
  booksStep,
  branchStep,
  checkGstin,
  companyStep,
  configurationStep,
  financialYearChoices,
  financialYearEnd,
  gstinCheckChar,
  indianMobile,
  licencesStep,
  loginRequest,
  moneyInput,
  passwordStrength,
  signupForm,
  toLicencesRequest,
  toSignupRequest,
} from "../src";

describe("GSTIN (GSTIN_FETCH.md §7 samples)", () => {
  it.each(["33AAJCN0778N1ZZ", "27AAPFU0939F1ZV"])("accepts %s", (g) => {
    expect(checkGstin(g)).toBeNull();
    expect(gstinCheckChar(g.slice(0, 14))).toBe(g[14]);
  });
  it("rejects a wrong check character", () => expect(checkGstin("33AAJCN0778N1ZA")).toBe("CHECK_DIGIT"));
  it("rejects a bad pattern", () => expect(checkGstin("33AAJCN0778N1Z")).toBe("PATTERN"));
  it("is case-insensitive", () => expect(checkGstin("33aajcn0778n1zz")).toBeNull());
});

describe("mobile", () => {
  it.each(["9876543210", "+91 98765 43210", "09876543210"])("accepts %s", (m) => expect(indianMobile.parse(m)).toBe("9876543210"));
  it.each(["5876543210", "98765", "98765432101"])("rejects %s", (m) => expect(indianMobile.safeParse(m).success).toBe(false));
});

describe("money input stays a string", () => {
  it("accepts 2 decimals", () => expect(moneyInput.parse("2500.50")).toBe("2500.50"));
  it("rejects 3 decimals and negatives", () => {
    expect(moneyInput.safeParse("1.005").success).toBe(false);
    expect(moneyInput.safeParse("-1").success).toBe(false);
  });
});

describe("login mirrors LoginRequest", () => {
  it("lower-cases and trims the email", () => expect(loginRequest.parse({ email: " Owner@Shop.IN ", password: "x" }).email).toBe("owner@shop.in"));
  it("rejects a 129-char password", () => expect(loginRequest.safeParse({ email: "a@b.in", password: "x".repeat(129) }).success).toBe(false));
});

describe("signup mirrors SignupRequest", () => {
  const schema = signupForm(10);
  const base = {
    ownerName: "Test Owner",
    mobile: "98765 43210",
    email: "owner@example.test",
    password: "a-long-pass-123",
    businessName: "Test Medicals",
    stateCode: "33",
    partnerCode: "",
    startWith: "TRIAL",
    acceptTerms: true,
    website: "",
  };
  it("accepts a complete form and maps to the request", () => {
    const v = schema.parse(base);
    expect(toSignupRequest(v, "draft-2026-11")).toMatchObject({ mobile: "9876543210", acceptedTermsVersion: "draft-2026-11", partnerCode: undefined });
  });
  it("needs the terms", () => expect(schema.safeParse({ ...base, acceptTerms: false }).success).toBe(false));
  it("uses the minimum from the API (boundary 9/10)", () => {
    expect(schema.safeParse({ ...base, password: "123456789" }).success).toBe(false);
    expect(schema.safeParse({ ...base, password: "1234567890" }).success).toBe(true);
    expect(signupForm(12).safeParse({ ...base, password: "1234567890" }).success).toBe(false);
  });
  it("rejects a filled bot trap", () => expect(schema.safeParse({ ...base, website: "spam" }).success).toBe(false));
  it("rejects partner codes with spaces", () => expect(schema.safeParse({ ...base, partnerCode: "AB 12" }).success).toBe(false));
});

describe("invitation password confirm", () => {
  it("flags a mismatch on confirmPassword", () => {
    const r = acceptInvitationForm(10).safeParse({ fullName: "A", mobile: "9876543210", password: "1234567890", confirmPassword: "1234567891" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});

describe("company step mirrors CompanyRequest", () => {
  const company = {
    registrationType: "REGULAR",
    gstin: "33AAJCN0778N1ZZ",
    legalName: "Test Pharma Pvt Ltd",
    pan: "AAJCN0778N",
    addressLine1: "1 Main Road",
    pin: "600087",
    city: "Chennai",
    stateCode: "33",
  };
  const paths = (v: object) => companyStep.safeParse(v).error?.issues.map((i) => i.path.join(".")) ?? [];
  it("accepts matching GSTIN, PAN and state", () => expect(companyStep.safeParse(company).success).toBe(true));
  it("blocks a state that differs from the GSTIN", () => expect(paths({ ...company, stateCode: "29" })).toContain("stateCode"));
  it("blocks a PAN that differs from the GSTIN", () => expect(paths({ ...company, pan: "AAAAA0000A" })).toContain("pan"));
  it("blocks a GSTIN typo", () => expect(paths({ ...company, gstin: "33AAJCN0778N1ZA" })).toContain("gstin"));
  it("allows an empty GSTIN (the API decides if the registration type needs one)", () =>
    expect(companyStep.safeParse({ ...company, registrationType: "UNREGISTERED", gstin: "", stateCode: "29" }).success).toBe(true));
  it("blocks a PIN starting with 0", () => expect(paths({ ...company, pin: "060087" })).toContain("pin"));
});

describe("licences mirror LicencesRequest", () => {
  const schema = licencesStep(["DRUG_RETAIL"], "2026-11-26");
  const empty = { number: "", validTo: "" };
  const ok = {
    drugRetail: { number: "TN-01-20-12345", validTo: "2028-03-31" },
    drugWholesale: empty,
    fssai: empty,
    narcotic: empty,
    pharmacistName: "P Kumar",
    pharmacistRegNo: "TN-5678",
    pharmacistCouncilState: "33",
  };
  it("accepts a valid licence and drops empty ones", () => {
    expect(schema.safeParse(ok).success).toBe(true);
    expect(toLicencesRequest(ok)).toEqual({ ...ok, drugRetail: ok.drugRetail, drugWholesale: undefined, fssai: undefined, narcotic: undefined });
  });
  it("blocks an expired licence (boundary: today)", () => {
    expect(schema.safeParse({ ...ok, drugRetail: { number: "TN-01", validTo: "2026-11-26" } }).success).toBe(false);
    expect(schema.safeParse({ ...ok, drugRetail: { number: "TN-01", validTo: "2026-11-27" } }).success).toBe(true);
  });
  it("needs the required licence", () => expect(schema.safeParse({ ...ok, drugRetail: empty }).success).toBe(false));
  it("checks FSSAI when filled", () => expect(schema.safeParse({ ...ok, fssai: { number: "1234", validTo: "" } }).success).toBe(false));
});

describe("branch mirrors BranchRequest", () => {
  const b = { name: "Main", code: "ho", addressLine1: "1 Main Road", pin: "600087", city: "Chennai", stateCode: "33" };
  it("upper-cases the code", () => expect(branchStep.parse(b).code).toBe("HO"));
  it("rejects long codes", () => expect(branchStep.safeParse({ ...b, code: "ABCDEFGHIJK" }).success).toBe(false));
});

describe("books", () => {
  const schema = booksStep(4);
  it("FY end is start + 1 year − 1 day", () => {
    expect(financialYearEnd("2026-04-01")).toBe("2027-03-31");
    expect(financialYearEnd("2027-04-01")).toBe("2028-03-31");
  });
  it("offers the current and previous FY", () => {
    expect(financialYearChoices("2026-11-26", 4)).toEqual(["2026-04-01", "2025-04-01"]);
    expect(financialYearChoices("2027-02-10", 4)).toEqual(["2026-04-01", "2025-04-01"]);
  });
  it("books start must be inside the FY (boundaries)", () => {
    expect(schema.safeParse({ financialYearStart: "2026-04-01", booksStartDate: "2026-04-01" }).success).toBe(true);
    expect(schema.safeParse({ financialYearStart: "2026-04-01", booksStartDate: "2027-03-31" }).success).toBe(true);
    expect(schema.safeParse({ financialYearStart: "2026-04-01", booksStartDate: "2026-03-31" }).success).toBe(false);
    expect(schema.safeParse({ financialYearStart: "2026-05-01", booksStartDate: "2026-05-01" }).success).toBe(false);
  });
});

describe("configuration from setting definitions", () => {
  const schema = configurationStep(
    [
      { key: "stock.negative_policy", type: "LIST", listCode: "negative_stock_policy" },
      { key: "stock.near_expiry_days", type: "INTEGER", min: 1, max: 365 },
      { key: "pricing.round_grand_total", type: "BOOLEAN" },
    ],
    { negative_stock_policy: [{ code: "BLOCK" }, { code: "WARN" }] },
  );
  it("accepts values inside the definitions", () =>
    expect(schema.safeParse({ "stock.negative_policy": "WARN", "stock.near_expiry_days": "90", "pricing.round_grand_total": "true" }).success).toBe(true));
  it("rejects out-of-range and unknown list values", () => {
    expect(schema.safeParse({ "stock.negative_policy": "WARN", "stock.near_expiry_days": "366", "pricing.round_grand_total": "true" }).success).toBe(false);
    expect(schema.safeParse({ "stock.negative_policy": "ALLOW", "stock.near_expiry_days": "90", "pricing.round_grand_total": "true" }).success).toBe(false);
  });
});

describe("passwordStrength", () => {
  it("grades against the API minimum", () => {
    expect(passwordStrength("short", 10)).toBe(0);
    expect(passwordStrength("aaaaaaaaaa", 10)).toBe(1);
    expect(passwordStrength("aaaaaaaaa1", 10)).toBe(2);
    expect(passwordStrength("Aaaaaaaaaaaa1!", 10)).toBe(3);
  });
});
