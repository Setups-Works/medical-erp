/**
 * Turns plan items from ../docs into tasks a developer can pick up without asking:
 * a description (what · why · read first · done when) and a checklist of concrete steps.
 * Pure functions: no database access.
 */

export type Slug = "nitheesh" | "prakalya" | "kamesh" | "meyyarivu" | "ashok" | "jeeva";
export type Area = "lead" | "ba" | "backend" | "frontend" | "qa" | "devops";

export const AREA_OF: Record<Slug, Area> = {
  nitheesh: "lead",
  prakalya: "ba",
  kamesh: "backend",
  meyyarivu: "frontend",
  ashok: "qa",
  jeeva: "devops",
};

export const ROLE_OF: Record<Slug, string> = {
  nitheesh: "Tech Lead & Full-stack Engineer",
  prakalya: "Business Analyst + QA (part-time)",
  kamesh: "Backend Engineer",
  meyyarivu: "Frontend Lead + QA",
  ashok: "QA Lead + Frontend",
  jeeva: "DevOps Engineer",
};

export type PhaseInfo = { key: string; name: string; goal: string; exit: string };

/** Reads "## P1 — Platform core" sections from PHASES.md and their **Goal:** / **Exit:** lines. */
export function parsePhases(md: string): Record<string, PhaseInfo> {
  const out: Record<string, PhaseInfo> = {};
  let cur: PhaseInfo | null = null;
  for (const line of md.split("\n")) {
    const h = line.match(/^## (P\d) — ([^(]+)/);
    if (h) {
      cur = { key: h[1], name: h[2].trim(), goal: "", exit: "" };
      out[h[1]] = cur;
      continue;
    }
    if (!cur) continue;
    const goal = line.match(/^\*\*Goal:\*\*\s*(.+)/);
    if (goal) cur.goal = goal[1].trim();
    const exit = line.match(/^\*\*Exit(?: criteria)?:\*\*\s*(.+)/);
    if (exit) cur.exit = exit[1].replace(/\*\*/g, "").trim();
    const features = line.match(/^\*\*Features:\*\*\s*(.+)/);
    if (features && !cur.goal) cur.goal = `Deliver ${features[1].replace(/\*\*/g, "").trim()}`;
  }
  return out;
}

/** Docs a developer should open first, picked from keywords in the task title. */
const DOC_HINTS: [RegExp, string][] = [
  [/\b(brd|frs|stor(y|ies)|requirement|uat)\b/i, "docs/business-requirements/README.md"],
  [/\b(brd|frs|stor(y|ies)|uat)\b/i, "docs/business-requirements/templates/"],
  [/\b(gst|tax|vector|pricing|scheme|discount|rounding|mrp|billing-engine|calculat)/i, "docs/architecture/CALCULATIONS.md"],
  [/\b(vector|parity)/i, "contracts/AGENTS.md"],
  [/\b(offline|sync|sqlite|device)/i, "docs/architecture/OFFLINE_SYNC.md"],
  [/\b(tenan|rls|cross-tenant)/i, "docs/architecture/MULTI_TENANCY.md"],
  [/\b(module|modulith|skeleton|scaffold|boundar)/i, "docs/architecture/MODULES.md"],
  [/\b(architecture|adr)\b/i, "docs/architecture/ARCHITECTURE.md"],
  [/\b(adr|decision)/i, "docs/decisions/README.md"],
  [/\b(er diagram|data model|migration|schema|table)/i, "docs/database/DATA_MODEL.md"],
  [/\b(api|openapi|endpoint|contract)\b/i, "docs/api/API_GUIDELINES.md"],
  [/\b(security|owasp|pen|auth|jwt|password|2fa|harden)/i, "docs/security/SECURITY.md"],
  [/\b(test|qa|playwright|k6|regression|scenario|defect)/i, "docs/testing/TEST_STRATEGY.md"],
  [/\b(design|ui|screen|wireframe|token|shadcn|component|shell)/i, "docs/design/DESIGN_LANGUAGE.md"],
  [/\b(pos|keyboard|counter)/i, "docs/design/POS_KEYBOARD.md"],
  [/\b(azure|vm|deploy|prod|staging|backup|restore|monitor|grafana|alert|nginx|tls)/i, "docs/deployment/AZURE_DEPLOYMENT.md"],
  [/\b(env|secret|docker|compose|config)/i, "docs/deployment/ENVIRONMENTS.md"],
  [/\b(runbook|restore|incident|rollback)/i, "docs/runbooks/README.md"],
  [/\b(schedule|h1|prescription|licen[cs]e|compliance|dpdp|privacy|drug)/i, "docs/compliance/COMPLIANCE.md"],
  [/\b(glossary|pharmacy|workflow|interview)/i, "docs/product/GLOSSARY.md"],
  [/\b(workflow|interview|process)/i, "docs/workflows/README.md"],
  [/\b(feature|backlog|scope)/i, "docs/product/FEATURES.md"],
  [/\b(git|branch|pr|codeowners|repo)\b/i, "docs/team/WORKFLOW.md"],
  [/\b(electron|desktop|installer|printer|scanner)/i, "apps/desktop/AGENTS.md"],
];

const AREA_DOCS: Record<Area, string[]> = {
  lead: ["AGENTS.md", "docs/planning/PHASES.md"],
  ba: ["docs/product/FEATURES.md", "docs/product/PAGES.md", "docs/product/GLOSSARY.md"],
  backend: ["AGENTS.md", "backend/meno-api/AGENTS.md", "docs/architecture/VALIDATION_AND_BUSINESS_RULES.md"],
  frontend: ["AGENTS.md", "apps/web/AGENTS.md", "docs/design/DESIGN_LANGUAGE.md", "docs/architecture/VALIDATION_AND_BUSINESS_RULES.md"],
  qa: ["docs/testing/TEST_STRATEGY.md", "docs/architecture/VALIDATION_AND_BUSINESS_RULES.md"],
  devops: ["infrastructure/AGENTS.md", "docs/deployment/AZURE_DEPLOYMENT.md"],
};

export function docsFor(title: string, area: Area, extra: string[] = []) {
  const hits = DOC_HINTS.filter(([re]) => re.test(title)).map(([, d]) => d);
  return [...new Set([...extra, ...AREA_DOCS[area], ...hits])].slice(0, 7);
}

const STEPS: Record<Area, string[]> = {
  lead: [
    "Read the related docs and current state (docs/planning/CURRENT_STATE.md)",
    "Draft or build the change",
    "Review with the owners it affects (stand-up or a short call)",
    "Record the decision: ADR in docs/decisions or update the doc",
    "Update docs/planning/CURRENT_STATE.md",
    "Open a PR into develop (never push to main) and get it reviewed",
  ],
  ba: [
    "Gather input: pharmacy visit/call, existing docs, sample bills",
    "Draft using the template in docs/business-requirements/templates",
    "Write rules with exact numbers; mark unknowns ⚠ VERIFY with who confirms",
    "Review with Nitheesh and the engineer who will build it",
    "Confirm ⚠ rules with a pharmacist/CA; note source and date",
    "Save in the right docs folder, link feature IDs",
    "PR into develop; update related Hub tasks",
  ],
  backend: [
    "Read AGENTS.md, backend/meno-api/AGENTS.md and the module's AGENTS.md",
    "Contract PR first: endpoints, request/response records, OpenAPI export",
    "Flyway migration: tenant_id, RLS policy, indexes, audit columns, version",
    "Domain rules + service (@Transactional); other modules only via their api/",
    "Controller + mapper; Problem Details error codes",
    "Tests: unit, integration (Testcontainers), cross-tenant 404, permission denied",
    "./mvnw verify is green",
    "Update DATA_MODEL.md, module AGENTS.md, CURRENT_STATE.md",
    "PR into develop, reviewed by Nitheesh",
  ],
  frontend: [
    "Read docs/design/DESIGN_LANGUAGE.md and apps/web/AGENTS.md",
    "Regenerate api-client from the merged contract (MSW mock until the API is on staging)",
    "Query hooks in features/<area>/queries.ts (TanStack Query)",
    "Build the screen from @meno/ui and the page patterns (tokens only)",
    "Loading, empty and error states",
    "Keyboard and accessibility: labels, focus, shortcuts",
    "Check Light and Dark at 1280 px and 375 px",
    "data-testid on key elements; unit tests for pure logic",
    "pnpm typecheck && pnpm test && pnpm check:design are green",
    "PR into develop; UI review by Meyyarivu, approval by Nitheesh",
  ],
  qa: [
    "Read the story and its acceptance criteria",
    "Write test cases (docs/testing/test-cases/TEMPLATE.md)",
    "Cover negative, boundary, permission and cross-tenant cases (offline if relevant)",
    "Automate: Playwright, API collection or backend scenario test",
    "Run on staging; log defects with severity S1–S4",
    "Record results in the sprint test report",
  ],
  devops: [
    "Write the change as code (infrastructure/ or .github/workflows)",
    "No secrets in git: use GitHub Environments and .env on the server",
    "Add a rollback note and update the runbook in docs/runbooks",
    "Apply on staging first and verify",
    "Review with Nitheesh before anything touches production",
    "Update docs/deployment if behaviour changed",
  ],
};

export type Content = { description: string; checklist: { text: string; done: boolean }[] };

const cl = (items: string[]) => items.map((text) => ({ text, done: false }));

function phaseLine(p?: PhaseInfo) {
  return p ? `${p.key} · ${p.name}` : "";
}

export function planTask(o: { title: string; owners: Slug[]; phase?: PhaseInfo; done?: boolean; source: string; area?: Area }): Content {
  const lead = o.owners[0];
  const area = o.area ?? AREA_OF[lead];
  const steps = [...STEPS[area]];
  const desc = [
    `**What:** ${o.title}`,
    `**Owner:** ${o.owners.map((s) => `${cap(s)} (${ROLE_OF[s]})`).join(", ")}`,
    o.phase ? `**Phase:** ${phaseLine(o.phase)}` : "",
    "",
    "### Why",
    o.phase?.goal ? `${o.phase.goal.replace(/\.+$/, "")}.` : "Part of the MENO delivery plan.",
    o.phase?.exit ? `Phase ${o.phase.key} is finished when: ${o.phase.exit}` : "",
    "",
    "### Read first",
    ...docsFor(o.title, area).map((d) => `- \`${d}\``),
    "",
    "### Done when",
    "- Every checklist item is ticked",
    "- The work is merged into `develop` through a reviewed PR (or the document is approved)",
    "- The task is moved to **Done** and anything you learned is written in the docs",
    "",
    `_Source: \`${o.source}\`_`,
  ];
  return { description: desc.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n"), checklist: cl(steps) };
}

type FeatureMeta = { module: string; web: string; be: Slug; fe: Slug | null; extra?: Slug; qa?: Slug };

export const FEATURE_META: Record<string, FeatureMeta> = {
  PLT: { module: "identity · tenancy · auth", web: "users · company · settings", be: "nitheesh", fe: "prakalya" },
  CAT: { module: "catalog", web: "catalog", be: "kamesh", fe: "prakalya" },
  PTY: { module: "party", web: "parties", be: "kamesh", fe: "prakalya" },
  PRC: { module: "pricing", web: "pricing", be: "kamesh", fe: "prakalya" },
  PUR: { module: "purchase", web: "purchase", be: "kamesh", fe: "meyyarivu" },
  INV: { module: "inventory", web: "inventory", be: "kamesh", fe: "meyyarivu" },
  POS: { module: "sales", web: "pos", be: "kamesh", fe: "meyyarivu" },
  WHS: { module: "sales", web: "wholesale", be: "kamesh", fe: "meyyarivu" },
  RET: { module: "returns", web: "returns", be: "kamesh", fe: "meyyarivu" },
  CMP: { module: "compliance", web: "compliance", be: "kamesh", fe: "prakalya" },
  ACC: { module: "payment · accounting", web: "payments · accounting", be: "kamesh", fe: "prakalya" },
  GST: { module: "taxation", web: "gst", be: "kamesh", fe: "prakalya" },
  RPT: { module: "reporting", web: "reports · dashboard", be: "kamesh", fe: "prakalya" },
  NTF: { module: "notification", web: "shell notifications", be: "kamesh", fe: "meyyarivu" },
  DSK: { module: "sync", web: "desktop renderer", be: "nitheesh", fe: "meyyarivu", extra: "jeeva" },
  MOB: { module: "fieldsales", web: "apps/mobile", be: "nitheesh", fe: "meyyarivu" },
  INT: { module: "integrations", web: "settings", be: "kamesh", fe: null, extra: "jeeva" },
  MKT: { module: "purchase · inventory · sales", web: "purchase · inventory · pos", be: "kamesh", fe: "meyyarivu" },
  DOC: { module: "sales · purchase", web: "wholesale · purchase", be: "kamesh", fe: "meyyarivu" },
  ACX: { module: "accounting", web: "accounting", be: "kamesh", fe: "prakalya" },
  IJX: { module: "inventory", web: "inventory", be: "kamesh", fe: "meyyarivu" },
  ANX: { module: "reporting", web: "reports", be: "kamesh", fe: "prakalya" },
  ENG: { module: "notification", web: "settings", be: "kamesh", fe: "prakalya" },
  NAV: { module: "identity (permissions)", web: "app shell · config/nav.ts", be: "nitheesh", fe: "meyyarivu" },
  CRM: { module: "party · sales · notification", web: "crm", be: "kamesh", fe: "prakalya" },
  ADM: { module: "integrations", web: "admin/integrations", be: "kamesh", fe: "prakalya", extra: "jeeva" },
};

/** Per-feature exceptions to the prefix owners ("Feature overrides" table in OWNERSHIP_MATRIX.md). */
const FEATURE_OVERRIDE: Record<string, Pick<FeatureMeta, "be" | "fe" | "extra">> = {};

/** Owners and module info for one feature: its prefix row, with any per-feature override applied. */
function metaFor(id: string): FeatureMeta | undefined {
  const m = FEATURE_META[id.slice(0, 3)];
  const o = FEATURE_OVERRIDE[id];
  return m && o ? { ...m, ...o } : m;
}

/** Overrides FEATURE_META with docs/team/OWNERSHIP_MATRIX.md (the single source of truth). */
export function applyOwnershipMatrix(md: string) {
  for (const line of md.split("\n")) {
    const c = line.split("|").map((x) => x.trim());
    // Feature override row: | CAT-24 | backend | frontend | extra | reason |
    if (/^[A-Z]{3}-\d{2}$/.test(c[1] ?? "") && c.length >= 6) {
      const slug = (v?: string) => (v ? (v.toLowerCase() as Slug) : null);
      // An override replaces all builders, so an empty Extra clears the prefix's extra owner.
      FEATURE_OVERRIDE[c[1]] = { be: slug(c[2]) ?? "kamesh", fe: slug(c[3]), extra: slug(c[4]) ?? undefined };
      continue;
    }
    if (c.length < 8 || !/^[A-Z]{3}$/.test(c[1])) continue;
    const be = c[4].toLowerCase() as Slug;
    const fe = (c[5].toLowerCase() || null) as Slug | null;
    const extra = (c[7]?.toLowerCase() || undefined) as Slug | undefined;
    const qa = (c[8]?.toLowerCase() || undefined) as Slug | undefined;
    FEATURE_META[c[1]] = { module: c[3], web: c[6] || "—", be, fe, ...(extra ? { extra } : {}), ...(qa ? { qa } : {}) };
  }
}

/** Who runs QA for a feature prefix (QA column of the matrix); never the person who built it. */
export function qaOwner(prefix: string): Slug {
  return FEATURE_META[prefix]?.qa ?? "ashok";
}

export function featureOwners(id: string): Slug[] {
  const m = metaFor(id);
  if (!m) return ["kamesh"];
  return [...new Set([m.be, ...(m.fe ? [m.fe] : []), ...(m.extra ? [m.extra] : [])])];
}

const EDITION: Record<string, string> = { R: "Retail", W: "Wholesale", B: "Both editions" };
const PRIORITY: Record<string, string> = { M: "Must (MVP)", S: "Should", C: "Could (later)" };

export function featureTask(f: { id: string; title: string; edition: string; phase: string; priority: string; section: string }, phase?: PhaseInfo): Content {
  const m = metaFor(f.id);
  const verify = /\(verify\)/.test(f.title);
  const money = /GST|PRC|ACC|ACX|POS|PUR|RET|WHS|DOC/.test(f.id.slice(0, 3));
  const owners = featureOwners(f.id);
  const qa = cap(qaOwner(f.id.slice(0, 3)));
  const firstModule = m?.module.split(" · ")[0];
  const read = [
    `docs/product/FEATURES.md`,
    ...(firstModule ? [`backend/meno-api/src/main/java/com/setupsworks/meno/modules/${firstModule === "integrations" ? "taxation" : firstModule}/AGENTS.md`] : []),
    "apps/web/AGENTS.md",
    "docs/architecture/VALIDATION_AND_BUSINESS_RULES.md",
    "docs/product/PAGES.md",
    ...(/^(PTY|CAT|PRC)/.test(f.id) ? ["docs/product/MASTER_FIELDS.md"] : []),
    ...(money ? ["docs/architecture/CALCULATIONS.md"] : []),
    ...(verify || f.id.startsWith("CMP") ? ["docs/compliance/COMPLIANCE.md"] : []),
    ...(f.id.startsWith("DSK") || f.id === "POS-15" ? ["docs/architecture/OFFLINE_SYNC.md"] : []),
    "docs/product/GLOSSARY.md",
  ];
  const desc = [
    `**Feature:** ${f.id} — ${f.title.replace(" (verify)", "")}`,
    `**Edition:** ${EDITION[f.edition] ?? f.edition} · **Phase:** ${phaseLine(phase) || f.phase} · **Priority:** ${PRIORITY[f.priority] ?? f.priority}`,
    m ? `**Backend module:** \`${m.module}\` · **Web feature:** \`${m.web}\`` : "",
    `**Backend:** ${cap(m?.be ?? "kamesh")}${m?.fe ? ` · **Frontend:** ${cap(m.fe)}` : ""}${m?.extra ? ` · **Infra:** ${cap(m.extra)}` : ""} · **Story:** Prakalya · **QA:** ${qa}`,
    "",
    "### Why",
    `Part of "${f.section}" in the feature catalogue. ${f.priority === "M" ? "It is needed for the pilot release." : f.priority === "S" ? "Expected by customers; build it in this phase if time allows." : "Nice to have; build after the Must and Should items."}`,
    verify ? "\n⚠ **This feature has a rule that must be confirmed** (pharmacist, CA or lawyer) before it is built. Check COMPLIANCE.md / CALCULATIONS.md." : "",
    "",
    "### Read first",
    ...read.map((d) => `- \`${d}\`${d === "docs/product/FEATURES.md" ? ` (section "${f.section}")` : ""}`),
    "",
    "### Done when",
    "- The user story's acceptance criteria all pass on staging",
    "- API, screen and tests are merged through reviewed PRs into `develop`",
    `- ${qa} verified it (no open S1/S2) and Prakalya accepted it`,
  ];
  const steps = [
    "Story: user story + acceptance criteria written (Prakalya)",
    ...(verify ? ["Rules: ⚠ VERIFY items confirmed and source recorded (Prakalya)"] : []),
    `Test cases written from the acceptance criteria (${qa})`,
    `Contract PR: endpoints, DTOs, OpenAPI (${cap(m?.be ?? "kamesh")})`,
    "Backend: migration with constraints + RLS, domain rules, service, controller",
    "Validation in all 4 layers; no hard-coded rates, limits, states or option lists (read from configuration)",
    "Backend tests: unit, integration, cross-tenant, permission, validation (valid / invalid / boundary)",
    ...(money ? ["Calculation test vectors added and passing in Java and TS"] : []),
    ...(m?.fe
      ? [
          `Frontend: screen(s) from PAGES.md built with the design system (${cap(m.fe)})`,
          "Frontend: Zod schema mirrors API rules; API field errors shown inline",
          "Frontend: keyboard, accessibility, Light/Dark, 375 px and 1280 px",
        ]
      : []),
    `Automated tests (E2E/API) added (${qa})`,
    `Verified on staging, no open S1/S2 (${qa})`,
    "Docs updated: DATA_MODEL, CURRENT_STATE, module AGENTS.md",
    "Business acceptance (Prakalya)",
  ];
  return { description: tidy(desc), checklist: cl(steps) };
}

export function gateTask(phase: PhaseInfo, nextName?: string): Content {
  return {
    description: [
      `**What:** Close phase ${phase.key} · ${phase.name}${nextName ? ` and start ${nextName}` : ""}.`,
      "**Owner:** Nitheesh (with Ashok for QA sign-off and Prakalya for business acceptance)",
      "",
      "### Why",
      phase.goal ? `${phase.goal.replace(/\.+$/, "")}.` : "",
      phase.exit ? `Exit criteria: ${phase.exit}` : "",
      "",
      "### Read first",
      "- `docs/planning/PHASES.md` (phase gate checklist)",
      "- `docs/planning/CURRENT_STATE.md`",
      "- `docs/testing/TEST_STRATEGY.md` (release recommendation)",
      "",
      "### Done when",
      "- Every other task on this board is Done (or moved to a later phase with a reason)",
      "- The checklist below is complete",
    ]
      .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
      .join("\n"),
    checklist: cl([
      "All Must features of the phase merged to develop and deployed to staging",
      "Exit criteria demonstrated in the sprint demo",
      "QA sign-off with test report in docs/testing/reports/ (Ashok)",
      "Business acceptance against user stories (Prakalya)",
      "docs/planning/CURRENT_STATE.md updated",
      "Release branch tagged, notes written, main updated through a PR (Nitheesh)",
      "Retrospective held; actions added to the Hub",
    ]),
  };
}

export function scenarioTask(n: string, scenario: string, level: string, phase?: PhaseInfo): Content {
  return {
    description: [
      `**What:** Automate critical scenario #${n}: ${scenario}.`,
      `**Owner:** Ashok (QA); the backend owner of the module helps with data setup · **Test level:** ${level}`,
      phase ? `**Phase:** ${phaseLine(phase)}` : "",
      "",
      "### Why",
      "The 15 critical scenarios protect money, stock and tenant isolation. All of them must pass before the pilot goes live.",
      "",
      "### Read first",
      "- `docs/testing/TEST_STRATEGY.md` (critical scenarios)",
      "- `docs/architecture/CALCULATIONS.md`",
      "- `docs/database/DATA_MODEL.md` (integrity guarantees)",
      "",
      "### Done when",
      "- The scenario runs automatically in CI and passes",
      "- Expected values come from the story / test vectors, not from the code under test",
    ].join("\n").replace(/\n{3,}/g, "\n\n"),
    checklist: cl([
      "Write the scenario steps and exact expected values",
      "Seed synthetic data (fixed clock, no real data)",
      `Implement as ${level} test`,
      "Add negative variant (what must NOT happen)",
      "Runs in CI on every PR",
      "Linked from the test report",
    ]),
  };
}

export function complianceTask(area: string, need: string): Content {
  return {
    description: [
      `**What:** Confirm the rule for **${area}** before it is built.`,
      `**What MENO must support:** ${need}`,
      "**Owner:** Nitheesh confirms with a pharmacist, CA or lawyer; Prakalya provides the research",
      "",
      "### Why",
      "MENO helps licensed pharmacies keep legal records. A wrong rule here can cause legal trouble for customers, so engineers build it only after it is confirmed.",
      "",
      "### Read first",
      "- `docs/compliance/COMPLIANCE.md`",
      "- `docs/product/GLOSSARY.md`",
      "",
      "### Done when",
      "- The confirmed rule, its source and the date are written in COMPLIANCE.md (⚠ removed)",
      "- The rule is copied into the related FRS and the feature tasks are updated",
    ].join("\n"),
    checklist: cl([
      "Find the current official source (act, rule, notification, portal)",
      "Ask a qualified person to confirm (pharmacist / CA / lawyer)",
      "Write the exact rule with numbers and fields",
      "Record source and date in COMPLIANCE.md; remove ⚠",
      "Update the FRS and related feature tasks",
    ]),
  };
}

export function qaTask(area: string, phase: PhaseInfo | undefined, features: { id: string; title: string }[], owner: Slug = "ashok"): Content {
  return {
    description: tidy([
      `**What:** Test every ${area} feature planned for ${phase ? phaseLine(phase) : "this phase"} (${features.length} features).`,
      owner === "ashok" ? "**Owner:** Ashok (QA lead)" : `**Owner:** ${cap(owner)} (QA; you did not build this area). Ashok reviews your test cases.`,
      "",
      "### Why",
      "A feature is Done only after QA verifies it on staging. This task keeps one place to track QA for the module in this phase.",
      "",
      "### Read first",
      "- `docs/testing/TEST_STRATEGY.md`",
      "- `docs/architecture/VALIDATION_AND_BUSINESS_RULES.md` (test every rule: valid, invalid, boundary)",
      "- `docs/product/PAGES.md` (screens and roles to test)",
      "- `docs/product/ROLES_AND_DASHBOARDS.md` (permission matrix)",
      "",
      "### Features",
      ...features.map((f) => `- \`${f.id}\` ${f.title.replace(/^[A-Z]{3}-\d{2}\s*/, "")}`),
      "",
      "### Done when",
      "- Every feature below is ticked: test cases written, automated where possible, verified on staging",
      "- No open S1/S2 defects for this module in this phase; results in the sprint test report",
    ]),
    checklist: cl([
      "Test plan for the module in this phase",
      ...features.map((f) => `${f.id}: test cases, automation, verified on staging`),
      "Permission matrix tests for the module's roles",
      "Cross-tenant and validation tests for every new endpoint",
      "Regression run and test report",
    ]),
  };
}

export function runbookTask(name: string, when: string): Content {
  return {
    description: [
      `**What:** Write and test the runbook \`docs/runbooks/${name}\`.`,
      `**Used when:** ${when}`,
      "**Owner:** Jeeva",
      "",
      "### Why",
      "Anyone on call must be able to follow it at 2 a.m. without asking. Production go-live needs every runbook written and rehearsed.",
      "",
      "### Read first",
      "- `docs/runbooks/README.md`",
      "- `docs/deployment/AZURE_DEPLOYMENT.md`",
      "",
      "### Done when",
      "- Step-by-step commands, expected output and rollback are written",
      "- Someone other than Jeeva followed it on staging successfully",
    ].join("\n"),
    checklist: cl([
      "Write numbered steps with exact commands",
      "Add how to verify each step worked",
      "Add rollback / escalation section",
      "Rehearse on staging (another team member follows it)",
      "PR merged; linked from docs/runbooks/README.md",
    ]),
  };
}

/** Joins lines, dropping empty conditional lines that would leave double blank lines. */
function tidy(lines: string[]) {
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
