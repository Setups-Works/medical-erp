/**
 * The "Start here" page: what the team builds first, in which order, and how the daily meeting runs.
 * Mirrors docs/team/WHAT_TO_BUILD_FIRST.md; change both together.
 * Layer items point at real Hub tasks by the start of their title, so their status is live.
 */

export type LayerItem = { label: string; match: string };
export type Layer = { key: string; name: string; why: string; items: LayerItem[] };

export const LAYERS: Layer[] = [
  {
    key: "ground",
    name: "Layer 0 · Ground",
    why: "Nobody waits for anybody here: everyone starts at the same time.",
    items: [
      { label: "Gokul onboarded", match: "Onboarding day 1–3" },
      { label: "P0 phase gate", match: "P0 phase gate" },
      { label: "Local stack: postgres, redis, minio, mailpit", match: "`docker-compose.yml`" },
      { label: "Backend skeleton", match: "Backend skeleton:" },
      { label: "Web scaffold + tokens", match: "Next.js scaffold" },
      { label: "UI kit (shadcn components)", match: "shadcn new-york" },
      { label: "P1 user stories", match: "User stories P1" },
      { label: "Playwright setup", match: "Playwright setup" },
    ],
  },
  {
    key: "pipes",
    name: "Layer 1 · Pipes",
    why: "Security, contracts and page patterns. Every feature after this reuses them.",
    items: [
      { label: "Security: JWT, refresh, permissions", match: "`security/`:" },
      { label: "Tenancy + RLS", match: "`tenancy/`:" },
      { label: "Identity + audit modules", match: "`identity` + `audit`" },
      { label: "Settings framework (nothing hard-coded)", match: "Configuration framework" },
      { label: "OpenAPI → generated api-client", match: "OpenAPI export" },
      { label: "App shell + sidebar", match: "App shell + sidebar" },
      { label: "Page patterns: List, Form, Report, Grid", match: "Page patterns:" },
      { label: "Form validation kit", match: "Form validation kit" },
      { label: "Dockerfiles", match: "Dockerfiles:" },
      { label: "CI on every PR", match: "CI: backend verify" },
      { label: "Staging server", match: "Staging VM" },
    ],
  },
  {
    key: "login",
    name: "Layer 2 · First slice: login",
    why: "Small, but it touches every layer. When login works on staging, the whole pipeline is proven.",
    items: [
      { label: "PLT-08 Login API", match: "PLT-08 " },
      { label: "AUT-01 Forgot / reset password", match: "AUT-01 " },
      { label: "Login and auth pages", match: "Auth pages:" },
      { label: "Auth, role and tenant test cases", match: "Auth, roles, tenant isolation test cases" },
      { label: "Tenant A can't see tenant B", match: "Critical scenario #9" },
      { label: "Staging on HTTPS", match: "Staging reachable over HTTPS" },
    ],
  },
  {
    key: "p1",
    name: "Layer 3 · Rest of P1",
    why: "Same recipe as login, again: sign-up, users, roles, sidebar.",
    items: [
      { label: "PLT-01 Tenant sign-up", match: "PLT-01 " },
      { label: "AUT-04 Sign-up and verification", match: "AUT-04 " },
      { label: "PLT-06 Users and invitations", match: "PLT-06 " },
      { label: "PLT-07 Roles and permissions", match: "PLT-07 " },
      { label: "Users & roles screens", match: "Users & roles screens" },
      { label: "NAV-01 Sidebar navigation", match: "NAV-01 " },
      { label: "Cross-tenant test base in every endpoint test", match: "Cross-tenant test base class" },
      { label: "UAT P1 on staging", match: "UAT P1" },
      { label: "P1 phase gate", match: "P1 phase gate" },
    ],
  },
];

/** After P1 the order follows how a pharmacy works: you can't sell what you never bought. */
export const AFTER_P1: { phase: string; build: string; because: string }[] = [
  { phase: "P2", build: "Company, branch, medicines, suppliers, customers", because: "Every bill needs an item and a party" },
  { phase: "P3", build: "Purchase entry → batch stock → expiry", because: "Stock only comes from purchases" },
  { phase: "P4", build: "Counter billing, returns, H1 register", because: "A sale takes stock that already exists" },
  { phase: "P5", build: "Credit sales, payments, accounts, offline sync", because: "Built on top of sales and stock" },
  { phase: "P6", build: "Real pharmacies, GST returns", because: "Only when money and stock are proven right" },
];

/** Keyed by first name in lower case (the Hub user's name). */
export const PERSON_NOTES: Record<string, { needs: string; unblocks: string; wait: string }> = {
  jeeva: { needs: "Nothing", unblocks: "Everyone: local DB, CI, staging", wait: "Azure PostgreSQL staging, secrets in GitHub Environments" },
  nitheesh: { needs: "Kamesh's skeleton + security + tenancy", unblocks: "All frontend (api-client); identity, audit, settings for every module", wait: "Review Kamesh's skeleton PRs; users & roles screen on mocks" },
  kamesh: { needs: "Jeeva's docker-compose (Postgres)", unblocks: "All backend: Nitheesh (identity, api-client), P2 catalog and party APIs", wait: "Draft P2 catalog / party contracts and migrations; Java twin of the billing engine" },
  meyyarivu: { needs: "Nothing to start", unblocks: "Ashok, Gokul, Nitheesh (screens)", wait: "Pair with Gokul; design-check script" },
  prakalya: { needs: "Nothing", unblocks: "Ashok (test cases), everyone (acceptance criteria)", wait: "Onboarding FRS, master-form FRS" },
  ashok: { needs: "Web scaffold (Meyyarivu), P1 stories (Prakalya)", unblocks: "QA of every P1 feature", wait: "Test vectors for CALCULATIONS.md §7–§22" },
  gokul: { needs: "Meyyarivu's page patterns", unblocks: "Dashboards and reports in P3–P5", wait: "Learn GST and pricing maths; dashboard widgets on mocks" },
};

export const WEEKS: { from: string; to: string; label: string; goal: string; highlights: string }[] = [
  { from: "2026-11-25", to: "2026-11-29", label: "Wed 25 – Fri 27 Nov", goal: "Gokul onboarded; everyone knows their first Step", highlights: "Gokul: Hub, setup, docs · Meyyarivu + Gokul pair · Prakalya: P1 stories · Ashok + Prakalya: hand-check 20 vectors" },
  { from: "2026-11-30", to: "2026-12-06", label: "Mon 30 Nov – Fri 4 Dec", goal: "P0 gate passed: every P1 task has acceptance criteria and an owner", highlights: "Prakalya: P1 stories done · Jeeva: docker-compose on every laptop · Nitheesh: P0 gate, Sprint 1 plan" },
  { from: "2026-12-07", to: "2026-12-13", label: "Mon 7 – Fri 11 Dec · Sprint 1", goal: "Layer 0 done: ./mvnw verify and pnpm dev work for everyone", highlights: "Kamesh: backend skeleton (#457) · Meyyarivu: scaffold + UI kit · Jeeva: Dockerfiles + CI · Ashok: Playwright" },
  { from: "2026-12-14", to: "2026-12-20", label: "Mon 14 – Fri 18 Dec · Sprint 1", goal: "Layer 1 done: security, tenancy, api-client, app shell + page patterns", highlights: "Kamesh: security (#458), tenancy (#7) · Nitheesh: identity, api-client · Meyyarivu: shell + patterns · Jeeva: staging · Gokul: ReportPage · Demo Fri" },
  { from: "2026-12-21", to: "2026-12-27", label: "Mon 21 – Thu 24 Dec · Sprint 2", goal: "Login works on staging (first slice)", highlights: "Nitheesh: login API · Meyyarivu: login, forgot/reset · Ashok: login E2E + scenario #9 · Jeeva: HTTPS" },
  { from: "2026-12-28", to: "2027-01-03", label: "Mon 28 Dec – Fri 1 Jan · Sprint 2", goal: "P1 exit: sign up a tenant, invite a user with a role, log in on staging", highlights: "Nitheesh: signup, users, roles · Kamesh: permission seed · Meyyarivu: signup, sidebar · Prakalya: UAT · Ashok: QA · P1 gate" },
];

export const AGENDA: { minutes: string; what: string; how: string }[] = [
  { minutes: "0–15", what: "Stand-up, 2 min each", how: "Finished · today (Step number) · blocked by · shared files I'll touch" },
  { minutes: "15–25", what: "Board walk", how: "Right to left: QA → In review → In progress. Finish before starting. Every blocked task gets a name and a time" },
  { minutes: "25–50", what: "Topic of the day", how: "One topic, one owner, prepared before the meeting" },
  { minutes: "50–60", what: "Pairs + decisions", how: "Who pairs with whom today; write decisions in the Hub task or an ADR" },
];

/** Index = Date.getDay() (0 Sunday). */
export const TOPICS: ({ topic: string; owner: string } | null)[] = [
  null,
  { topic: "Plan the week: pick this week's goal, check the two hand-offs", owner: "Nitheesh" },
  { topic: "Contract review: API shapes and OpenAPI PRs for the next features", owner: "Kamesh / Nitheesh" },
  { topic: "Show how: one person shows code they wrote", owner: "Rotates" },
  { topic: "Learn pharmacy: one concept from GLOSSARY / CALCULATIONS + next week's stories", owner: "Prakalya" },
  { topic: "Demo on staging + 10-min retro (keep / change / try)", owner: "Everyone" },
  null,
];

export const WAITING: { for: string; do: string }[] = [
  { for: "The backend API", do: "Contract merged? Build on MSW mocks. No contract? Bring it to Tuesday's contract review" },
  { for: "A shared UI component", do: "Build it in your feature folder; Hub task for Meyyarivu to move it to packages/ui" },
  { for: "A business rule", do: "Ask Prakalya in the Hub task. Never invent a pharmacy or tax rule" },
  { for: "A review", do: "Review someone else's PR meanwhile; say it at stand-up" },
  { for: "Staging / CI", do: "Run locally with docker-compose; tell Jeeva at stand-up" },
  { for: "Nothing to do", do: "Take your next Step. Still nothing? Ask Nitheesh for a pairing task" },
];
