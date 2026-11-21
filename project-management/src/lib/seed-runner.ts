import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import type { AnyBulkWriteOperation } from "mongoose";
import { Board, Counter, DEFAULT_COLUMNS, PHASES, ProductItem, Task, User } from "./models";
import {
  AREA_OF,
  type Content,
  applyOwnershipMatrix,
  qaTask,
  type PhaseInfo,
  type Slug,
  complianceTask,
  featureOwners,
  qaOwner,
  featureTask,
  gateTask,
  parsePhases,
  planTask,
  runbookTask,
  scenarioTask,
} from "./plan-content";

/**
 * Imports the whole MENO plan from ../docs into the hub. When every imported task is Done, MENO is in production.
 *   - member plan items      docs/team/members/<name>/PHASE_PLAN.md
 *   - production readiness   docs/planning/PRODUCTION_READINESS.md
 *   - product features       docs/product/FEATURES.md (placed on their phase board)
 *   - critical scenarios     docs/testing/TEST_STRATEGY.md
 *   - compliance checks      docs/compliance/COMPLIANCE.md (rows marked ⚠)
 *   - runbooks               docs/runbooks/README.md
 *   - one phase-gate task per phase
 * Every task gets a description and checklist. Safe to re-run: new items are added; generated text is refreshed
 * only on tasks nobody has edited (autoContent = true); progress and human edits are never overwritten.
 */

export const TEAM = [
  { slug: "nitheesh", name: "Nitheesh", title: "Tech Lead & Full-stack Engineer", role: "admin", tint: "violet" },
  { slug: "prakalya", name: "Prakalya", title: "Business Analyst + QA (part-time)", role: "member", tint: "pink" },
  { slug: "kamesh", name: "Kamesh", title: "Backend Engineer", role: "member", tint: "blue" },
  { slug: "meyyarivu", name: "Meyyarivu", title: "Frontend Lead + QA", role: "member", tint: "green" },
  { slug: "ashok", name: "Ashok", title: "QA Lead + Frontend", role: "member", tint: "amber" },
  { slug: "jeeva", name: "Jeeva", title: "DevOps Engineer", role: "member", tint: "red" },
] as const;

const EMAIL_DOMAIN = process.env.HUB_EMAIL_DOMAIN || "meno.team";

export function docsDir() {
  const candidates = [process.env.MENO_DOCS_PATH, path.resolve(process.cwd(), "../docs"), path.resolve(process.cwd(), "docs")];
  return candidates.find((p) => p && fs.existsSync(path.join(p, "planning"))) ?? null;
}

const read = (dir: string, rel: string) => (fs.existsSync(path.join(dir, rel)) ? fs.readFileSync(path.join(dir, rel), "utf8") : "");
const clean = (s: string) => s.replace(/\*\*/g, "").trim();

/** `## P1` sections with `- [ ] text` or `- [ ] [owner+owner] text` items. */
function parseChecklistDoc(md: string) {
  const items: { phase: string; title: string; done: boolean; owners: Slug[]; tag?: string }[] = [];
  let phase = "";
  for (const line of md.split("\n")) {
    const h = line.match(/^##\s+(P\d)\b/);
    if (h) {
      phase = h[1];
      continue;
    }
    const m = line.match(/^- \[( |x)\]\s+(.*)$/i);
    if (!m || !phase) continue;
    let title = m[2].trim();
    let owners: Slug[] = [];
    let tag: string | undefined;
    const o = title.match(/^\[([a-z+]+)\]\s*/);
    if (o) {
      owners = o[1].split("+") as Slug[];
      title = title.slice(o[0].length);
    }
    const t = title.match(/^\[(BA|FE|QA)\]\s*/);
    if (t) {
      tag = t[1] === "BA" ? "business-analysis" : t[1] === "QA" ? "qa" : "frontend";
      title = title.slice(t[0].length);
    }
    items.push({ phase, title: clean(title), done: m[1].toLowerCase() === "x", owners, tag });
  }
  return items;
}

type Feature = { id: string; title: string; edition: string; phase: string; priority: string; section: string };

function parseFeatures(md: string): Feature[] {
  const out: Feature[] = [];
  let section = "";
  for (const line of md.split("\n")) {
    const h = line.match(/^#{2,3}\s+(.+)$/);
    if (h) section = h[1].replace(/\(`.*?`\)/g, "").trim();
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 4 || !/^[A-Z]{3}-\d{2}$/.test(cells[1] ?? "")) continue;
    const id = cells[1];
    const title = cells[2].replace(/\*\*/g, "").replace(/⚠/g, "(verify)").trim();
    const rest = cells.slice(3, -1);
    const [edition, phase, priority] = rest.length >= 3 ? rest : ["B", rest[0], rest[1]];
    out.push({ id, title, edition, phase, priority, section });
  }
  return out;
}

/** Rows of the first markdown table after a heading that matches `heading`. */
function tableAfter(md: string, heading: RegExp): string[][] {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => heading.test(l));
  if (start < 0) return [];
  const rows: string[][] = [];
  let inTable = false;
  for (const l of lines.slice(start + 1)) {
    if (l.startsWith("|")) {
      inTable = true;
      const cells = l.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^-+$/.test(c))) continue;
      rows.push(cells);
    } else if (inTable) break;
  }
  return rows.slice(1); // drop header
}

const AREA_BY_PREFIX: Record<string, string> = {
  PLT: "platform", CAT: "masters", PTY: "masters", PRC: "pricing", PUR: "purchase", INV: "inventory", POS: "pos",
  WHS: "wholesale", RET: "returns", CMP: "compliance", ACC: "accounting", GST: "gst", RPT: "reports", NTF: "notifications",
  DSK: "desktop", MOB: "mobile", INT: "integrations", MKT: "pharmacy-ops", DOC: "documents", ACX: "accounting",
  IJX: "inventory", ANX: "reports", ENG: "engagement", NAV: "navigation", CRM: "crm", ADM: "administration", AUT: "auth", DSH: "dashboards",
};

const SCENARIO_PHASE: Record<string, string> = { "1": "P3", "2": "P4", "3": "P4", "4": "P4", "5": "P3", "6": "P4", "7": "P3", "8": "P5", "9": "P1", "10": "P5", "11": "P4", "12": "P5", "13": "P4", "14": "P4", "15": "P5" };

function compliancePhase(area: string) {
  if (/DPDP/i.test(area)) return "P5";
  if (/e-invoice|e-way|returns/i.test(area)) return "P4";
  if (/retention/i.test(area)) return "P3";
  return "P2";
}

type Draft = {
  sourceKey: string;
  phase: string;
  title: string;
  column: string;
  owners: Slug[];
  labels: string[];
  priority: "high" | "medium" | "low";
  featureId?: string;
  area: string;
  content: Content;
  order: number;
  rank?: number;
};

export function buildDrafts(dir: string): Draft[] {
  applyOwnershipMatrix(read(dir, "team/OWNERSHIP_MATRIX.md"));
  const areaName = Object.fromEntries(
    read(dir, "team/OWNERSHIP_MATRIX.md")
      .split("\n")
      .map((l) => l.split("|").map((x) => x.trim()))
      .filter((c) => c.length > 7 && /^[A-Z]{3}$/.test(c[1]))
      .map((c) => [c[1], c[2]]),
  );
  const phases: Record<string, PhaseInfo> = parsePhases(read(dir, "planning/PHASES.md"));
  const drafts: Draft[] = [];
  const col = (phase: string, done?: boolean) => (done ? "done" : phase === "P0" ? "todo" : "backlog");

  // 1. Member plans
  for (const t of TEAM) {
    for (const [i, it] of parseChecklistDoc(read(dir, `team/members/${t.slug}/PHASE_PLAN.md`)).entries()) {
      const area = it.tag === "frontend" ? "frontend" : it.tag === "qa" ? "qa" : AREA_OF[t.slug];
      drafts.push({
        sourceKey: `plan:${t.slug}:${it.phase}:${it.title.slice(0, 120)}`,
        phase: it.phase,
        title: it.title,
        column: col(it.phase, it.done),
        owners: [t.slug],
        labels: [...new Set([area, ...(it.tag ? [it.tag] : [])])],
        priority: it.phase === "P0" ? "high" : "medium",
        area,
        content: planTask({ title: it.title, owners: [t.slug], phase: phases[it.phase], done: it.done, source: `docs/team/members/${t.slug}/PHASE_PLAN.md`, area }),
        order: 1000 + i,
      });
    }
  }

  // 2. Production readiness
  for (const [i, it] of parseChecklistDoc(read(dir, "planning/PRODUCTION_READINESS.md")).entries()) {
    const owners = it.owners.length ? it.owners : (["nitheesh"] as Slug[]);
    drafts.push({
      sourceKey: `ready:${it.phase}:${it.title.slice(0, 120)}`,
      phase: it.phase,
      title: it.title,
      column: col(it.phase, it.done),
      owners,
      labels: ["production-readiness", AREA_OF[owners[0]]],
      priority: "high",
      area: AREA_OF[owners[0]],
      content: planTask({ title: it.title, owners, phase: phases[it.phase], source: "docs/planning/PRODUCTION_READINESS.md" }),
      order: 3000 + i,
    });
  }

  // 3. Product features (each one is a full slice: story → API → screen → QA)
  for (const [i, f] of parseFeatures(read(dir, "product/FEATURES.md")).entries()) {
    const area = AREA_BY_PREFIX[f.id.slice(0, 3)] ?? "product";
    void areaName;
    const edition = f.edition === "R" ? "retail" : f.edition === "W" ? "wholesale" : "both";
    drafts.push({
      sourceKey: `feature:${f.id}`,
      phase: f.phase,
      title: `${f.id} ${f.title}`,
      column: "backlog",
      owners: featureOwners(f.id),
      labels: ["feature", area, edition],
      priority: f.priority === "M" ? "high" : f.priority === "S" ? "medium" : "low",
      featureId: f.id,
      area,
      content: featureTask(f, phases[f.phase]),
      order: 5000 + i,
    });
  }

  // 3b. One QA task per feature prefix per phase, owned by the QA column of the matrix
  const featureList = parseFeatures(read(dir, "product/FEATURES.md"));
  const qaGroups = new Map<string, Feature[]>();
  for (const f of featureList) {
    const k = `${f.id.slice(0, 3)}:${f.phase}`;
    qaGroups.set(k, [...(qaGroups.get(k) ?? []), f]);
  }
  for (const [k, fs] of qaGroups) {
    const [prefix, phase] = k.split(":");
    const area = areaName[prefix] ?? prefix;
    drafts.push({
      sourceKey: `qa:${prefix}:${phase}`,
      phase,
      title: `QA: ${area} · ${phase} (${fs.length} feature${fs.length > 1 ? "s" : ""})`,
      column: col(phase),
      owners: [qaOwner(prefix)],
      labels: ["qa", AREA_BY_PREFIX[prefix] ?? "product"],
      priority: fs.some((f) => f.priority === "M") ? "high" : "medium",
      area: "qa",
      content: qaTask(area, phases[phase], fs.map((f) => ({ id: f.id, title: f.title })), qaOwner(prefix)),
      order: 8000,
    });
  }

  // 4. Critical test scenarios
  for (const [n, scenario, level] of tableAfter(read(dir, "testing/TEST_STRATEGY.md"), /^## Critical scenarios/)) {
    if (!/^\d+$/.test(n)) continue;
    const phase = SCENARIO_PHASE[n] ?? "P5";
    drafts.push({
      sourceKey: `scenario:${n}`,
      phase,
      title: `Critical scenario #${n}: ${clean(scenario)}`,
      column: "backlog",
      owners: ["ashok"],
      labels: ["qa", "critical-scenario"],
      priority: "high",
      area: "qa",
      content: scenarioTask(n, clean(scenario), clean(level), phases[phase]),
      order: 4000 + Number(n),
    });
  }

  // 5. Compliance rules to confirm
  for (const [areaName, need, status] of tableAfter(read(dir, "compliance/COMPLIANCE.md"), /^> Owner:/)) {
    if (!status?.includes("⚠")) continue;
    const phase = compliancePhase(areaName);
    drafts.push({
      sourceKey: `compliance:${areaName}`,
      phase,
      title: `Confirm compliance rule: ${clean(areaName)}`,
      column: col(phase),
      owners: ["nitheesh"],
      labels: ["compliance", "business-analysis"],
      priority: "high",
      area: "ba",
      content: complianceTask(clean(areaName), clean(need)),
      order: 2000 + drafts.length,
    });
  }

  // 6. Runbooks
  for (const [name, when] of tableAfter(read(dir, "runbooks/README.md"), /^# Runbooks/)) {
    if (!name.endsWith(".md")) continue;
    drafts.push({
      sourceKey: `runbook:${name}`,
      phase: "P5",
      title: `Write and rehearse runbook: ${name}`,
      column: "backlog",
      owners: ["jeeva"],
      labels: ["devops", "runbook"],
      priority: "high",
      area: "devops",
      content: runbookTask(name, clean(when)),
      order: 6000 + drafts.length,
    });
  }

  // 7. Phase gates (last card of every phase)
  PHASES.forEach((p, i) => {
    const info = phases[p.key] ?? { key: p.key, name: p.name, goal: "", exit: "" };
    const next = PHASES[i + 1];
    drafts.push({
      sourceKey: `gate:${p.key}`,
      phase: p.key,
      title: `${p.key} phase gate: ${p.name} complete${next ? `, start ${next.key}` : ""}`,
      column: col(p.key),
      owners: ["nitheesh"],
      labels: ["phase-gate", "lead"],
      priority: "high",
      area: "lead",
      content: gateTask(info, next ? `${next.key} · ${next.name}` : undefined),
      order: 9000,
    });
  });

  // de-duplicate by sourceKey (first wins)
  const seen = new Set<string>();
  return rankDrafts(drafts.filter((d) => (seen.has(d.sourceKey) ? false : (seen.add(d.sourceKey), true))));
}

/** Build order of feature areas: foundations first, then the money/stock flow, then finance, reports and extras. */
const PREFIX_ORDER = "PLT AUT NAV CAT PTY PRC PUR INV IJX MKT POS RET WHS DOC CMP GST ACC ACX DSH RPT ANX CRM ENG NTF ADM INT DSK MOB".split(" ");
/** Within a phase: groundwork → rules to confirm → features → readiness → critical scenarios → QA → phase gate. */
const STAGE: Record<string, number> = { plan: 1, compliance: 2, feature: 3, ready: 4, runbook: 4, scenario: 5, qa: 6, gate: 9 };
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

/**
 * Gives every task a global "rank": the order the work should happen in. A developer's own Step 1, 2, 3…
 * is their tasks sorted by rank, so everyone sees what to do first and what comes next.
 */
function rankDrafts(drafts: Draft[]): Draft[] {
  const phaseIdx = (p: string) => {
    const i = PHASES.findIndex((x) => x.key === p);
    return i < 0 ? 99 : i;
  };
  const prefixIdx = (d: Draft) => {
    const p = d.featureId ? d.featureId.slice(0, 3) : d.sourceKey.startsWith("qa:") ? d.sourceKey.split(":")[1] : "";
    const i = PREFIX_ORDER.indexOf(p);
    return i < 0 ? 99 : i;
  };
  const sorted = drafts
    .map((d, i) => ({ d, i }))
    .sort((a, b) => {
      const x = a.d;
      const y = b.d;
      const stage = (d: Draft) => STAGE[d.sourceKey.split(":")[0]] ?? 5;
      return (
        phaseIdx(x.phase) - phaseIdx(y.phase) ||
        stage(x) - stage(y) ||
        (stage(x) === STAGE.feature ? PRIORITY_ORDER[x.priority] - PRIORITY_ORDER[y.priority] : 0) ||
        prefixIdx(x) - prefixIdx(y) ||
        (x.featureId && y.featureId ? x.featureId.localeCompare(y.featureId) : 0) ||
        x.order - y.order ||
        a.i - b.i
      );
    });
  return sorted.map(({ d }, i) => ({ ...d, rank: i + 1 }));
}

export async function seedAll(log: (s: string) => void = () => {}) {
  const password = process.env.SEED_DEFAULT_PASSWORD;
  if (!password) throw new Error("SEED_DEFAULT_PASSWORD is not set (see .env.example)");
  const hash = await bcrypt.hash(password, 10);

  const configured = Object.fromEntries(
    (process.env.HUB_TEAM_EMAILS ?? "")
      .split(",")
      .map((pair) => pair.split(":").map((x) => x.trim().toLowerCase()))
      .filter(([slug, email]) => slug && email && email.includes("@")),
  );
  const users: Record<string, string> = {};
  for (const t of TEAM) {
    const fallback = `${t.slug}@${EMAIL_DOMAIN}`;
    const email = configured[t.slug] ?? fallback;
    if (email !== fallback && !(await User.exists({ email }))) await User.updateOne({ email: fallback }, { $set: { email } });
    const u = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { name: t.name, email, passwordHash: hash, role: t.role, title: t.title, tint: t.tint, mustChangePassword: true } },
      { upsert: true, new: true },
    ).lean();
    users[t.slug] = String(u!._id);
  }
  log(`users: ${Object.keys(users).length}`);

  const dir = docsDir();
  if (!dir) {
    log("docs folder not found: skipped importing the plan (set MENO_DOCS_PATH)");
    return;
  }

  for (const [i, p] of PHASES.entries()) {
    await Board.updateOne(
      { key: p.key.toLowerCase() },
      { $setOnInsert: { key: p.key.toLowerCase(), name: `${p.key} · ${p.name}`, kind: "phase", phase: p.key, columns: DEFAULT_COLUMNS, order: i } },
      { upsert: true },
    );
    await Board.updateOne(
      { key: p.key.toLowerCase() },
      { $set: { description: `Everything for ${p.key} (${p.name}): member plans, features, tests, compliance, readiness and the phase gate.` } },
    );
  }
  await Board.updateOne(
    { key: "backlog" },
    { $setOnInsert: { key: "backlog", columns: DEFAULT_COLUMNS, order: 50, kind: "backlog" } },
    { upsert: true },
  );
  await Board.updateOne({ key: "backlog" }, { $set: { name: "Ideas & later", description: "New ideas and requests not planned into a phase yet. Planned features live on their phase board." } });
  const boards = Object.fromEntries((await Board.find().lean()).map((b) => [b.key, String(b._id)]));

  const drafts = buildDrafts(dir);
  const existing = new Map(
    (await Task.find({ sourceKey: { $in: drafts.map((d) => d.sourceKey) } }).select("sourceKey boardId column description checklist autoContent autoAssign assignees rank archived order").lean()).map((t) => [t.sourceKey!, t]),
  );

  // New tasks
  const fresh = drafts.filter((d) => !existing.has(d.sourceKey));
  if (fresh.length) {
    const c = await Counter.findByIdAndUpdate("task", { $inc: { seq: fresh.length } }, { upsert: true, new: true }).lean();
    const first = c!.seq - fresh.length + 1;
    await Task.insertMany(
      fresh.map((d, i) => ({
        boardId: boards[d.phase.toLowerCase()] ?? boards.backlog,
        column: d.column,
        order: (d.rank ?? d.order) * 10,
        rank: d.rank ?? 0,
        number: first + i,
        title: d.title,
        description: d.content.description,
        checklist: d.content.checklist,
        autoContent: true,
        autoAssign: true,
        featureId: d.featureId ?? "",
        phase: d.phase,
        area: d.area,
        labels: d.labels,
        assignees: d.owners.map((s) => users[s]).filter(Boolean),
        priority: d.priority,
        sourceKey: d.sourceKey,
        createdBy: users.nitheesh,
      })),
    );
  }

  // Existing tasks: add/refresh generated content where nobody edited it; move planned features onto their phase board.
  const ops: AnyBulkWriteOperation[] = [];
  for (const d of drafts) {
    const t = existing.get(d.sourceKey);
    if (!t) continue;
    const set: Record<string, unknown> = {};
    if (t.rank !== d.rank) set.rank = d.rank ?? 0;
    // Backlog and To do columns follow the planned work order (re-running the seed restores it there).
    if (["backlog", "todo"].includes(t.column) && t.order !== (d.rank ?? 0) * 10 && d.rank) set.order = d.rank * 10;
    // Back in the docs after being archived as stale (and never touched by hand): bring it back.
    if (t.archived && t.autoContent) set.archived = false;
    const legacy = !t.description || t.description.startsWith("From FEATURES.md");
    const untouched = t.autoContent === true || (legacy && !t.checklist?.length);
    if (untouched) {
      // Generated titles can change too (e.g. "QA: … (9 features)" when features are added).
      set.title = d.title;
      set.description = d.content.description;
      if (!t.checklist?.some((c) => c.done)) set.checklist = d.content.checklist;
      set.autoContent = true;
      set.labels = d.labels;
    }
    if (d.featureId && String(t.boardId) === boards.backlog && t.column === "backlog" && boards[d.phase.toLowerCase()]) {
      set.boardId = boards[d.phase.toLowerCase()];
      set.order = (d.rank ?? d.order) * 10;
    }
    // Owners follow OWNERSHIP_MATRIX.md until someone reassigns the task by hand or work starts.
    const wanted = d.owners.map((s) => users[s]).filter(Boolean);
    const notStarted = ["backlog", "todo"].includes(t.column);
    const same = wanted.length === (t.assignees?.length ?? 0) && wanted.every((w) => t.assignees!.map(String).includes(w));
    if (!t.assignees?.length || (t.autoAssign !== false && notStarted && !same)) {
      set.assignees = wanted;
      set.autoAssign = true;
    }
    if (Object.keys(set).length) ops.push({ updateOne: { filter: { _id: t._id }, update: { $set: set } } });
  }
  // Plan items that disappeared from the docs: archive them if nobody touched them.
  const planned = new Set(drafts.map((d) => d.sourceKey));
  const stale = await Task.find({
    archived: false,
    sourceKey: { $regex: /^(plan|ready|feature|qa|scenario|compliance|runbook|gate):/ },
    autoContent: true,
    commentCount: 0,
    column: { $in: ["backlog", "todo"] },
  })
    .select("sourceKey")
    .lean();
  for (const t of stale) if (!planned.has(t.sourceKey!)) ops.push({ updateOne: { filter: { _id: t._id }, update: { $set: { archived: true } } } });
  if (ops.length) await Task.bulkWrite(ops as never);

  // Product map: replace with the current docs (it is reference data, never edited in the hub).
  const ids = (s: string) => s.match(/\b[A-Z]{3}-\d{2}\b/g) ?? [];
  const menu = tableAfter(read(dir, "design/NAVIGATION.md"), /^- Adding or renaming/);
  const caps = tableAfter(read(dir, "product/COVERAGE.md"), /^# Capability coverage/);
  const pages: Record<string, unknown>[] = [];
  let section = "";
  let po = 0;
  for (const line of read(dir, "product/PAGES.md").split("\n")) {
    const h = line.match(/^## (.+)$/);
    if (h) section = h[1].trim();
    const c = line.split("|").map((x) => x.trim());
    if (c.length > 9 && c[2].startsWith("`/")) {
      pages.push({
        kind: "page",
        group: section,
        name: c[1],
        route: c[2].replace(/`/g, ""),
        notes: c[3],
        featureIds: ids(c[4]),
        meta: { phase: c[5], backend: c[6], frontend: c[7], roles: c[8], qa: c[9] ?? "" },
        order: po++,
      });
    }
  }
  const roles = tableAfter(read(dir, "product/ROLES_AND_DASHBOARDS.md"), /^## Default roles/).map(([code, name, lands, screens, widgets, perms, never], i) => ({
    kind: "role",
    group: code,
    name: clean(name),
    route: lands.replace(/`/g, "").split(" ")[0],
    notes: clean(screens),
    featureIds: ["DSH-01"],
    meta: { widgets: clean(widgets), permissions: clean(perms ?? ""), never: clean(never ?? "") },
    order: i,
  }));
  const features = parseFeatures(read(dir, "product/FEATURES.md")).map((f, i) => ({
    kind: "feature",
    group: f.section.replace(/\(`.*?`\)/g, "").replace(/`/g, ""),
    name: f.title.replace(" (verify)", ""),
    edition: f.edition,
    featureIds: [f.id],
    meta: { phase: f.phase, priority: f.priority, verify: f.title.includes("(verify)") },
    order: i,
  }));
  const items = [
    ...pages,
    ...roles,
    ...features,
    ...menu.map(([group, name, route, edition, f], i) => ({ kind: "menu", group, name, route, edition, featureIds: ids(f), order: i })),
    ...caps.map(([name, f, notes], i) => ({ kind: "capability", group: "", name, featureIds: ids(f), notes: clean(notes ?? ""), order: i })),
  ].filter((x) => x.name && (x.featureIds as string[]).length);
  if (items.length) {
    await ProductItem.deleteMany({});
    await ProductItem.insertMany(items);
  }
  log(`tasks added: ${fresh.length}, updated: ${ops.length}, total in plan: ${drafts.length}, product map items: ${items.length}`);
}

export async function autoSeedIfEmpty() {
  if ((await User.estimatedDocumentCount()) > 0) return;
  if (!process.env.SEED_DEFAULT_PASSWORD) {
    console.warn("[hub] Empty database and SEED_DEFAULT_PASSWORD not set: skipping first-run seed.");
    return;
  }
  await seedAll((s) => console.log(`[hub] seed ${s}`));
}
