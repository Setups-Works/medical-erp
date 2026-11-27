import type { Checklist } from "@meno/api-client";

/** Only same-app relative paths may be used as ?next= targets (no open redirects to other sites). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  return next;
}

/** Where a signed-in person lands: the dashboard once live, else the step to resume (AUT-15). */
export function landingPath(checklist: Checklist | undefined): string {
  if (!checklist) return "/onboarding/";
  if (checklist.live) return "/dashboard/";
  const next = checklist.steps?.find((s) => s.code === checklist.nextStep);
  if (checklist.nextStep === "GO_LIVE") return "/onboarding/go-live/";
  return withSlash(next?.route ?? "/onboarding");
}

export const withSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);

/**
 * GET /auth/signup/options returns start options as codes only. Until the API sends labels (backend follow-up),
 * known codes get a friendly label and unknown ones are shown humanised, so a new option still appears.
 */
const START_LABELS: Record<string, { label: string; description: string }> = {
  TRIAL: { label: "Free trial", description: "Start now and set up at your own pace." },
  DEMO: { label: "Book a demo", description: "We walk you through MENO first." },
  LICENSE_KEY: { label: "I have a license key", description: "You bought MENO from us or a partner." },
};

export function startOption(code: string) {
  return START_LABELS[code] ?? { label: humanise(code), description: "" };
}

export function humanise(code: string): string {
  const s = code.toLowerCase().replace(/[_-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Masks an email for "we sent a link to …": ow•••@example.in */
export function maskEmail(email: string): string {
  const [user = "", domain = ""] = email.split("@");
  return `${user.slice(0, 2)}•••@${domain}`;
}
