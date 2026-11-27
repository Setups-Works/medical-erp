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

  // team (identity invitations) — Nitheesh
  team: {
    options: ["team", "options"] as const,
    invitations: ["team", "invitations"] as const,
  },

  // users, roles, permissions (identity /admin) — Nitheesh
  me: ["auth", "me"] as const,
  users: {
    all: ["users"] as const,
    options: ["users", "options"] as const,
    list: (q: string, status: string) => ["users", "list", q, status] as const,
  },
  roles: {
    all: ["roles"] as const,
    list: ["roles", "list"] as const,
    detail: (code: string) => ["roles", "detail", code] as const,
    catalogue: ["roles", "catalogue"] as const,
  },
};
