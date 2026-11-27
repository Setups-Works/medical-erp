import type { Checklist, CompanyDetails, GstinView, Option, StepStatus } from "@meno/api-client";
import type { SelectOption } from "@meno/ui";
import type { CompanyForm } from "@meno/validation";
import type { IconName } from "@meno/ui";

/** Screen copy per step code (the API sends codes, routes and status; words are the UI's job). */
export const STEP_COPY: Record<string, { title: string; description: string; icon: IconName }> = {
  BUSINESS: { title: "Business profile", description: "What kind of pharmacy you run.", icon: "store" },
  COMPANY: { title: "Company & GST", description: "GSTIN, legal name and address.", icon: "building" },
  LICENCES: { title: "Licences & pharmacist", description: "Drug licences and the pharmacist in charge.", icon: "licence" },
  BRANCHES: { title: "Branches", description: "Your shops and their addresses.", icon: "warehouse" },
  BOOKS: { title: "Books", description: "Financial year and books start date.", icon: "books" },
  CONFIGURATION: { title: "Billing preferences", description: "Stock rules, rounding and bill paper.", icon: "settings" },
  TEAM: { title: "Team", description: "Invite staff with roles.", icon: "users" },
  DATA: { title: "Data import", description: "Start fresh, Excel, or move from old software.", icon: "database" },
  DEVICES: { title: "Devices & printers", description: "Desktop app, printers and scanners.", icon: "printer" },
  PLAN: { title: "Plan", description: "Choose a plan or enter a license key.", icon: "credit-card" },
  PRACTICE: { title: "Practice", description: "Try a bill with sample data.", icon: "scan" },
};

export const stepCopy = (code: string | undefined) =>
  STEP_COPY[code ?? ""] ?? { title: code ?? "", description: "", icon: "circle" as IconName };

export const withSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);

/** The step after `code` that can be worked on now; go-live when none is left. */
export function nextRoute(checklist: Checklist | undefined, code: string): string {
  const steps = checklist?.steps ?? [];
  const i = steps.findIndex((s) => s.code === code);
  const next = steps.slice(i + 1).find((s) => s.available && s.status === "TODO") ?? steps.find((s) => s.available && s.status === "TODO" && s.code !== code);
  return next?.route ? withSlash(next.route) : "/onboarding/go-live/";
}

export function previousRoute(checklist: Checklist | undefined, code: string): string {
  const steps = checklist?.steps ?? [];
  const i = steps.findIndex((s) => s.code === code);
  const prev = steps.slice(0, Math.max(0, i)).reverse().find((s) => s.available);
  return prev?.route ? withSlash(prev.route) : "/onboarding/";
}

export function progress(checklist: Checklist | undefined) {
  const required = (checklist?.steps ?? []).filter((s) => s.required && s.available);
  const done = required.filter((s) => s.status === "DONE").length;
  return { done, total: required.length };
}

export type StepState = "done" | "skipped" | "todo" | "later";
export function stepState(s: StepStatus): StepState {
  if (!s.available || s.status === "NOT_AVAILABLE") return "later";
  if (s.status === "DONE") return "done";
  if (s.status === "SKIPPED") return "skipped";
  return "todo";
}

export const toSelect = (options: readonly Option[] | undefined): SelectOption[] =>
  (options ?? []).map((o) => ({ value: o.code ?? "", label: o.label ?? o.code ?? "" }));

/** Company form values from the saved company (phone comes back as +91XXXXXXXXXX; the form shows 10 digits). */
export function companyFormFrom(d: CompanyDetails | null | undefined, prefill: { stateCode?: string; legalName?: string }): CompanyForm {
  return {
    registrationType: d?.registrationType ?? "",
    gstin: d?.gstin ?? "",
    legalName: d?.legalName ?? prefill.legalName ?? "",
    tradeName: d?.tradeName ?? "",
    pan: d?.pan ?? "",
    addressLine1: d?.addressLine1 ?? "",
    addressLine2: d?.addressLine2 ?? "",
    pin: d?.pin ?? "",
    city: d?.city ?? "",
    district: d?.district ?? "",
    stateCode: d?.stateCode ?? prefill.stateCode ?? "",
    phone: d?.phone?.replace(/^\+91/, "") ?? "",
    email: d?.email ?? "",
  };
}

/**
 * GST portal details → company fields (GSTIN_FETCH.md §3). Only fields the portal knows are replaced; the state
 * and PAN always follow the GSTIN. Registration type is used only if it is one of the configured codes.
 */
export function applyGstin(current: CompanyForm, g: GstinView, registrationCodes: readonly string[]): { values: CompanyForm; filled: string[] } {
  const filled: string[] = [];
  const set = <K extends keyof CompanyForm>(key: K, value: CompanyForm[K] | undefined) => {
    if (value !== undefined && value !== "") {
      current = { ...current, [key]: value };
      filled.push(key);
    }
  };
  set("legalName", g.legalName);
  set("tradeName", g.tradeName);
  set("pan", g.pan ?? g.gstin?.slice(2, 12));
  set("stateCode", g.stateCode ?? g.gstin?.slice(0, 2));
  set("addressLine1", g.address?.line1);
  set("addressLine2", g.address?.line2);
  set("city", g.address?.city);
  set("pin", g.address?.pin);
  if (g.registrationType && registrationCodes.includes(g.registrationType)) set("registrationType", g.registrationType);
  return { values: current, filled };
}

export type GstStatusTone = "ok" | "warning" | "blocked";
/** Cancelled blocks, suspended warns (ONBOARDING.md step 4). */
export function gstStatusTone(status: string | undefined): GstStatusTone {
  const s = (status ?? "").toUpperCase();
  if (s === "CANCELLED") return "blocked";
  if (s === "SUSPENDED") return "warning";
  return "ok";
}

/** "1 April 2026 to 31 March 2027": a wrong FY is the most common set-up mistake, so the dates are said in words. */
export function fyInWords(start: string, end: string): string {
  const fmt = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return `${fmt(start)} to ${fmt(end)}`;
}

/** Today in the browser's time zone as yyyy-MM-dd (dates are rendered client-side only). */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
