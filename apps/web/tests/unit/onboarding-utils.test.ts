import { describe, expect, it } from "vitest";
import type { Checklist } from "@meno/api-client";
import { landingPath, maskEmail, safeNext, startOption } from "@/features/auth/utils";
import { applyGstin, companyFormFrom, fyInWords, gstStatusTone, nextRoute, previousRoute, progress, stepState } from "@/features/onboarding/utils";

const checklist = (overrides: Partial<Record<string, string>> = {}, live = false): Checklist => {
  const steps = [
    { code: "BUSINESS", route: "/onboarding/business", required: true, available: true, phase: "P2" },
    { code: "COMPANY", route: "/onboarding/pharmacy", required: true, available: true, phase: "P2" },
    { code: "LICENCES", route: "/onboarding/licences", required: true, available: true, phase: "P2" },
    { code: "TEAM", route: "/onboarding/team", required: false, available: false, phase: "P2" },
  ].map((s) => ({ ...s, status: !s.available ? "NOT_AVAILABLE" : (overrides[s.code] ?? "TODO") }));
  const next = live ? undefined : (steps.find((s) => s.available && s.status === "TODO")?.code ?? "GO_LIVE");
  return { steps, nextStep: next, live };
};

describe("safeNext blocks open redirects", () => {
  it.each([
    ["/onboarding/books/", "/onboarding/books/"],
    ["//evil.example", null],
    ["https://evil.example", null],
    ["/\\evil", null],
    [null, null],
  ])("%s → %s", (input, expected) => expect(safeNext(input)).toBe(expected));
});

describe("landingPath (resume anywhere, AUT-15)", () => {
  it("resumes on the next TODO step", () => expect(landingPath(checklist({ BUSINESS: "DONE" }))).toBe("/onboarding/pharmacy/"));
  it("goes to go-live when all available steps are done", () => expect(landingPath(checklist({ BUSINESS: "DONE", COMPANY: "DONE", LICENCES: "DONE" }))).toBe("/onboarding/go-live/"));
  it("goes to the dashboard once live", () => expect(landingPath(checklist({}, true))).toBe("/dashboard/"));
});

describe("step navigation", () => {
  it("next skips done and unavailable steps", () => {
    expect(nextRoute(checklist({ BUSINESS: "DONE", COMPANY: "DONE" }), "BUSINESS")).toBe("/onboarding/licences/");
    expect(nextRoute(checklist({ BUSINESS: "DONE", COMPANY: "DONE", LICENCES: "DONE" }), "LICENCES")).toBe("/onboarding/go-live/");
  });
  it("next wraps back to an earlier TODO step", () => expect(nextRoute(checklist({ COMPANY: "DONE", LICENCES: "DONE" }), "LICENCES")).toBe("/onboarding/business/"));
  it("previous goes to the earlier available step or the checklist", () => {
    expect(previousRoute(checklist(), "COMPANY")).toBe("/onboarding/business/");
    expect(previousRoute(checklist(), "BUSINESS")).toBe("/onboarding/");
  });
  it("progress counts required available steps only", () => expect(progress(checklist({ BUSINESS: "DONE" }))).toEqual({ done: 1, total: 3 }));
  it("maps step status", () => {
    const steps = checklist({ BUSINESS: "DONE", COMPANY: "SKIPPED" }).steps!;
    expect(steps.map(stepState)).toEqual(["done", "skipped", "todo", "later"]);
  });
});

describe("GSTIN fetch fills the company form", () => {
  const empty = companyFormFrom(null, { stateCode: "29" });
  it("fills portal fields and follows the GSTIN for state and PAN", () => {
    const { values, filled } = applyGstin(
      empty,
      { gstin: "33AAJCN0778N1ZZ", legalName: "Test Pharma Pvt Ltd", registrationType: "REGULAR", address: { line1: "1 Road", city: "Chennai", pin: "600087" } },
      ["REGULAR", "COMPOSITION", "UNREGISTERED"],
    );
    expect(values).toMatchObject({ legalName: "Test Pharma Pvt Ltd", stateCode: "33", pan: "AAJCN0778N", city: "Chennai", registrationType: "REGULAR" });
    expect(filled).toContain("legalName");
  });
  it("ignores a registration type that isn't configured", () => {
    const { values } = applyGstin(empty, { gstin: "33AAJCN0778N1ZZ", registrationType: "SEZ" }, ["REGULAR"]);
    expect(values.registrationType).toBe("");
  });
  it("strips +91 from the saved phone", () => expect(companyFormFrom({ phone: "+919876543210" }, {}).phone).toBe("9876543210"));
  it("tones the GST status", () => {
    expect(gstStatusTone("CANCELLED")).toBe("blocked");
    expect(gstStatusTone("Suspended")).toBe("warning");
    expect(gstStatusTone("ACTIVE")).toBe("ok");
  });
});

describe("copy helpers", () => {
  it("says the FY in words", () => expect(fyInWords("2026-04-01", "2027-03-31")).toBe("1 April 2026 to 31 March 2027"));
  it("labels known and unknown start options", () => {
    expect(startOption("TRIAL").label).toBe("Free trial");
    expect(startOption("PARTNER_ONBOARDING").label).toBe("Partner onboarding");
  });
  it("masks emails", () => expect(maskEmail("owner@example.in")).toBe("ow•••@example.in"));
});
