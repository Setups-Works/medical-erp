/** Query key factory (append-only, sectioned by owner; apps/web AGENTS.md). */
export const keys = {
  // auth — Meyyarivu / Nitheesh
  session: ["session"] as const,
  signupOptions: ["auth", "signup-options"] as const,
  verification: ["auth", "verification"] as const,
  invitation: (token: string) => ["auth", "invitation", token] as const,

  // onboarding — Nitheesh (backend) / Meyyarivu
  onboarding: {
    all: ["onboarding"] as const,
    checklist: ["onboarding", "checklist"] as const,
    options: ["onboarding", "options"] as const,
    step: (step: string) => ["onboarding", "step", step] as const,
    readiness: ["onboarding", "go-live"] as const,
  },
};
