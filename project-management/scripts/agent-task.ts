/**
 * Lets a developer's AI agent work a MENO Hub task by its number (#123), the same way a person would in the UI.
 * The workflow is in docs/team/AGENT_TASK_WORKFLOW.md.
 *
 *   npm run agent-task -- show    <n>
 *   npm run agent-task -- start   <n>
 *   npm run agent-task -- check   <n> <item…|all>      (1-based checklist numbers)
 *   npm run agent-task -- comment <n> "<text>"
 *   npm run agent-task -- review  <n> "<summary + PR link>" [--allow-open]
 *   npm run agent-task -- page       "<page name or route>"   (read-only brief: docs to read, features, tasks)
 *   npm run agent-task -- start-page "<page name or route>"   (take the page: BE + FE cards, both In progress, + brief)
 *   npm run agent-task -- complete-page "<page name or route>" (Nitheesh only, after merge: BE + FE ready, cards Done,
 *                                                               page Completed, then its finished features → Done)
 *   npm run agent-task -- sync-features                       (Nitheesh only: every feature whose pages are all
 *                                                               Completed → Done; safe to re-run)
 *
 * Acts as the hub user named in HUB_AGENT_AS (first name or email) in .env.local.
 * There is deliberately no "done" for a single task: only Nitheesh moves tasks to Done, after review. complete-page and
 * sync-features do it for him and refuse anyone else.
 * Writes go straight to MongoDB; open hub tabs update live through the change stream (src/lib/realtime.ts).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import mongoose from "mongoose";
import { findMentions, logActivity, notify } from "../src/lib/actions";
import { Board, Comment, PageCheck, Task, User } from "../src/lib/models";
import { completeIfBuilt, syncFeatures } from "../src/lib/feature-sync";
import { ensurePageTasks, findPages, pageKey, pageTasks } from "../src/lib/page-tasks";

for (const f of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(f);
  } catch {
    /* file is optional */
  }
}

const REVIEWER = "nitheesh"; // first name of the person who moves reviewed tasks to Done
const STARTABLE = ["backlog", "todo", "in_progress"];

class Stop extends Error {}
const stop = (msg: string): never => {
  throw new Stop(msg);
};

const findTask = (number: number) => Task.findOne({ number }).exec();
type TaskDoc = NonNullable<Awaited<ReturnType<typeof findTask>>>;
type UserLean = { _id: mongoose.Types.ObjectId; name: string; email: string };

async function actor(): Promise<UserLean> {
  const who = process.env.HUB_AGENT_AS?.trim();
  if (!who) stop("Set HUB_AGENT_AS in .env.local to your hub first name or email (the agent acts as you).");
  const users = (await User.find({ active: true }).select("name email").lean()) as UserLean[];
  const me = users.find((u) => u.email.toLowerCase() === who!.toLowerCase() || u.name.split(" ")[0].toLowerCase() === who!.toLowerCase());
  return me ?? stop(`No active hub user matches HUB_AGENT_AS="${who}".`);
}

async function load(arg: string | undefined): Promise<TaskDoc> {
  const n = Number(String(arg ?? "").replace(/^#/, ""));
  if (!Number.isInteger(n) || n <= 0) stop("Give the task number, e.g. 449 or #449.");
  const t = await findTask(n);
  if (!t || t.archived) stop(`Task #${n} doesn’t exist (or is archived).`);
  return t!;
}

async function columnName(t: TaskDoc, key: string) {
  const board = await Board.findById(t.boardId).lean();
  return board?.columns.find((c) => c.key === key)?.name ?? key;
}

const tag = (t: TaskDoc) => `#${t.number} ${t.title}`;

function mustOwn(t: TaskDoc, me: UserLean) {
  if (!t.assignees.map(String).includes(String(me._id)))
    stop(`${tag(t)} isn’t assigned to ${me.name}. Ask Nitheesh to assign it before working on it.`);
}

async function move(t: TaskDoc, me: UserLean, to: string) {
  const from = t.column;
  if (from === to) return;
  const board = await Board.findById(t.boardId).lean();
  const col = board?.columns.find((c) => c.key === to) ?? stop(`This board has no "${to}" column.`);
  if (col.wipLimit) {
    const busy = await Task.countDocuments({ boardId: t.boardId, column: to, archived: false });
    if (busy >= col.wipLimit) console.warn(`Note: "${col.name}" already holds ${busy} tasks (limit ${col.wipLimit}).`);
  }
  // Put it at the bottom of the target column, like a drag in the UI.
  const last = await Task.findOne({ boardId: t.boardId, column: to }).sort({ order: -1 }).select("order").lean();
  t.set({ column: to, order: (last?.order ?? 0) + 10 });
  await t.save();
  await logActivity({ boardId: String(t.boardId), taskId: String(t._id), actor: String(me._id), action: "moved", detail: `${tag(t)}: ${await columnName(t, from)} → ${col.name}` });
}

async function addComment(t: TaskDoc, me: UserLean, text: string) {
  const body = text.trim();
  if (!body) stop("Write the comment text in quotes.");
  if (body.length > 5000) stop("Comments are limited to 5000 characters.");
  const boardId = String(t.boardId);
  const taskId = String(t._id);
  const uid = String(me._id);
  const mentions = await findMentions(body);
  await Comment.create({ targetType: "task", targetId: t._id, boardId: t.boardId, author: me._id, body, mentions });
  t.commentCount = (t.commentCount ?? 0) + 1;
  await t.save();
  await logActivity({ boardId, taskId, actor: uid, action: "commented", detail: `${tag(t)}: ${body.slice(0, 120)}` });
  await notify({ users: mentions, actor: uid, type: "mentioned", text: `${me.name} mentioned you on ${tag(t)}`, boardId, taskId });
  const others = t.assignees.map(String).filter((u) => !mentions.includes(u));
  await notify({ users: others, actor: uid, type: "commented", text: `${me.name} commented on ${tag(t)}`, boardId, taskId });
}

async function show(t: TaskDoc) {
  const names = (await User.find({ _id: { $in: t.assignees } }).select("name").lean()).map((u) => u.name);
  const out = [
    `${tag(t)}`,
    `Column: ${await columnName(t, t.column)} · Phase: ${t.phase || "—"} · Priority: ${t.priority} · Feature: ${t.featureId || "—"}`,
    `Assignees: ${names.join(", ") || "nobody"}`,
    "",
    t.description || "(no description)",
    "",
    "Checklist:",
    ...(t.checklist.length ? t.checklist.map((c, i) => `  ${i + 1}. [${c.done ? "x" : " "}] ${c.text}`) : ["  (none)"]),
  ];
  const comments = await Comment.find({ targetType: "task", targetId: t._id }).sort({ createdAt: 1 }).populate<{ author: { name: string } }>("author", "name").lean();
  if (comments.length) {
    out.push("", "Comments:");
    for (const c of comments) out.push(`  - ${c.author?.name ?? "?"} (${c.createdAt.toISOString().slice(0, 16).replace("T", " ")}): ${c.body}`);
  }
  console.log(out.join("\n"));
}

// ---------- Page-wise work (docs/team/BUILD_A_PAGE.md) ----------

const REPO = join(process.cwd(), "..");
const readDoc = (rel: string) => (existsSync(join(REPO, rel)) ? readFileSync(join(REPO, rel), "utf8") : "");

/** FEATURES.md rows for the given IDs, with the section header (it names the backend module). */
function featureRows(ids: string[]) {
  const out: string[] = [];
  let section = "";
  for (const line of readDoc("docs/product/FEATURES.md").split("\n")) {
    if (line.startsWith("## ") || line.startsWith("### ")) section = line.replace(/^#+\s*/, "");
    const id = ids.find((i) => line.startsWith(`| ${i} `));
    if (id) out.push(`  ${id}  [${section}]\n      ${line.split("|").slice(2, -1).map((c) => c.trim()).join(" | ")}`);
  }
  return out;
}

/** Backend modules named in the FEATURES.md section headers of the page's features. */
function modulesFor(ids: string[]) {
  const mods = new Set<string>();
  for (const row of featureRows(ids)) for (const m of row.match(/`([a-z]+)`/g) ?? []) mods.add(m.replace(/`/g, ""));
  return [...mods].filter((m) => existsSync(join(REPO, "backend/meno-api/src/main/java/com/setupsworks/meno/modules", m)));
}

/** Other docs that mention the page's route or features (specs like ONBOARDING.md, MASTER_FIELDS.md). */
function relatedDocs(route: string, ids: string[]) {
  const skip = ["docs/product/PAGES.md", "docs/product/FEATURES.md"];
  const dirs = ["docs/product", "docs/architecture", "docs/design", "docs/compliance", "docs/workflows", "docs/business-requirements"];
  const hits: string[] = [];
  const base = route.split("[")[0].split("?")[0].replace(/\/$/, "");
  for (const d of dirs) {
    if (!existsSync(join(REPO, d))) continue;
    for (const f of readdirSync(join(REPO, d))) {
      const rel = `${d}/${f}`;
      if (!f.endsWith(".md") || skip.includes(rel)) continue;
      const txt = readDoc(rel);
      if ((base.length > 1 && txt.includes(`\`${base}`)) || ids.some((i) => txt.includes(i))) hits.push(rel);
    }
  }
  return hits;
}

/** What exists already: the web screen (or placeholder) and backend controllers serving the route's first segment. */
function existingCode(route: string) {
  const out: string[] = [];
  const segs = route.split("?")[0].split("/").filter(Boolean);
  for (const g of ["", "(auth)", "(app)"]) {
    const file = join("apps/web/src/app", g, ...segs, "page.tsx");
    if (!existsSync(join(REPO, file))) continue;
    const placeholder = /LaterStep|Placeholder/.test(readDoc(file));
    out.push(`  web: ${file}${placeholder ? "  (placeholder only, build the real screen)" : ""}`);
  }
  if (!out.length) out.push("  web: no screen yet (create it under apps/web/src/app/...)");
  const modsRoot = "backend/meno-api/src/main/java/com/setupsworks/meno/modules";
  const seg = segs[0] ?? "";
  for (const m of existsSync(join(REPO, modsRoot)) ? readdirSync(join(REPO, modsRoot)) : []) {
    const web = join(modsRoot, m, "web");
    if (!existsSync(join(REPO, web))) continue;
    for (const f of readdirSync(join(REPO, web))) {
      if (seg && readDoc(join(web, f)).includes(`"/api/v1/${seg}`)) out.push(`  backend: ${web}/${f}  (module ${m})`);
    }
  }
  return out;
}

async function pageBrief(query: string) {
  const found = await findPages(query);
  if (!found.length) stop(`No page matches "${query}". See docs/product/PAGES.md or Hub → Pages.`);
  if (found.length > 1) stop(`"${query}" matches ${found.length} pages; be more specific (use the route):\n  ${found.slice(0, 15).map((p) => `${p.name}  ${p.route}  (${p.group})`).join("\n  ")}`);
  return found[0];
}

async function printBrief(p: Awaited<ReturnType<typeof pageBrief>>) {
  const tasks = await pageTasks(p);
  const ids = p.featureIds;
  const mods = modulesFor(ids);
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const be = tasks.be ? `#${tasks.be.number}` : "(none yet: run start-page)";
  const fe = tasks.fe ? `#${tasks.fe.number}` : "(none yet: run start-page)";
  const meta = (p.meta ?? {}) as Record<string, string>;
  const out = [
    `PAGE  ${p.name}  ${p.route}`,
    `      ${p.notes}`,
    `      Section: ${p.group} · Phase ${meta.phase} · Roles ${meta.roles} · QA ${meta.qa || "—"}`,
    `      Hub tasks: BE ${be} · FE ${fe}`,
    "",
    "FEATURES (docs/product/FEATURES.md)",
    ...(featureRows(ids).length ? featureRows(ids) : ["  (none listed)"]),
    "",
    "READ BEFORE CODING (in this order)",
    "  AGENTS.md (root) · docs/team/BUILD_A_PAGE.md",
    "  docs/product/GLOSSARY.md (once) · docs/architecture/VALIDATION_AND_BUSINESS_RULES.md",
    "  docs/api/API_GUIDELINES.md · docs/database/DATA_MODEL.md · docs/architecture/MULTI_TENANCY.md",
    "  docs/design/DESIGN_LANGUAGE.md · docs/design/NAVIGATION.md",
    "  backend/meno-api/AGENTS.md · apps/web/AGENTS.md · packages/ui/AGENTS.md · packages/api-client/AGENTS.md",
    ...mods.map((m) => `  backend/meno-api/src/main/java/com/setupsworks/meno/modules/${m}/AGENTS.md`),
    ...relatedDocs(p.route, ids).map((d) => `  ${d}   (mentions this page / its features)`),
    "",
    "WHAT EXISTS",
    ...existingCode(p.route),
    mods.length ? `  feature modules: ${mods.join(", ")}` : "  feature module: see docs/architecture/MODULES.md",
    "",
    "DO",
    `  1. git switch develop && git pull && git switch -c feature/${tasks.be?.number ?? "<BE#>"}-${slug}`,
    "  2. SQL (if needed): new Flyway file V<yyyyMMddHHmm>__<what>.sql + DATA_MODEL.md",
    "  3. Backend: endpoints + Bean Validation + service rules + integration tests (incl. cross-tenant); regenerate OpenAPI + api-client",
    "  4. Frontend: screen in apps/web from packages/ui, TanStack Query hooks in features/<name>/queries.ts, Zod forms",
    "  5. ./mvnw verify  ·  pnpm typecheck && pnpm test && pnpm check:design",
    `  6. Tick checklists as items finish: npm run agent-task -- check <n> <items>`,
    `  7. One PR into develop (both task numbers, screenshots light + dark, no AI attribution)`,
    `  8. npm run agent-task -- review ${tasks.be?.number ?? "<BE#>"} "…PR link…"  and  review ${tasks.fe?.number ?? "<FE#>"} "…"`,
    "  9. Stop. Nitheesh reviews and merges.",
    "",
    "Unclear rule? Comment on the task, mention the owner (@prakalya for business / tax rules), and stop. Never invent rules.",
  ];
  console.log(out.join("\n"));
}

async function startPage(query: string, me: UserLean) {
  const p = await pageBrief(query);
  const { be, fe, created } = await ensurePageTasks(p as never, { actor: String(me._id), assignee: String(me._id), actorName: me.name });
  for (const t of [be, fe]) {
    mustOwn(t, me);
    if (t.column === "in_progress") continue;
    if (!STARTABLE.includes(t.column)) {
      console.warn(`Note: ${tag(t)} is in "${await columnName(t, t.column)}"; left where it is.`);
      continue;
    }
    await move(t, me, "in_progress");
    await addComment(t, me, `Started page ${p.name} ${p.route} (AI agent). Frontend + backend on one branch.`);
  }
  if (created.length) console.log(`Created ${created.map((s) => (s === "be" ? `BE #${be.number}` : `FE #${fe.number}`)).join(" and ")} for ${me.name}.`);
  console.log(`BE #${be.number} and FE #${fe.number} are In progress.\n`);
  await printBrief(p);
}

function mustReview(me: UserLean) {
  if (me.name.split(" ")[0].toLowerCase() !== REVIEWER) stop(`Only ${REVIEWER} completes pages and features (after the PR is merged).`);
}

function printMoved(moved: { number: number; featureId: string }[]) {
  console.log(moved.length ? `Features → Done: ${moved.map((m) => `#${m.number} ${m.featureId}`).join(", ")}` : "No feature has all its pages completed yet.");
}

/** After the page's PR is merged: tick BE + FE ready, move both cards to Done, complete the page, sync its features. */
async function completePage(query: string, me: UserLean) {
  mustReview(me);
  const p = await pageBrief(query);
  const tasks = await pageTasks(p);
  const now = new Date();
  await PageCheck.findOneAndUpdate({ key: pageKey(p) }, { be: { done: true, by: me._id, at: now }, fe: { done: true, by: me._id, at: now } }, { upsert: true });
  for (const t of [tasks.be, tasks.fe]) if (t && t.column !== "done") await move(t, me, "done");
  const completed = await completeIfBuilt(pageKey(p), String(me._id));
  console.log(`${p.name} ${p.route}: BE + FE ready${tasks.be ? `, BE #${tasks.be.number}` : ""}${tasks.fe ? `, FE #${tasks.fe.number}` : ""} Done, page ${completed ? "Completed" : "was already Completed"}.`);
  printMoved(await syncFeatures(String(me._id), p.featureIds));
}

async function main() {
  const [cmd, num, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === "help") {
    console.log('Usage: npm run agent-task -- <show|start|check|comment|review> <task#> [...]\n       npm run agent-task -- <page|start-page|complete-page> "<page name or route>"  (see docs/team/BUILD_A_PAGE.md)\n       npm run agent-task -- sync-features');
    return;
  }
  if (cmd === "done") stop("Agents never move tasks to Done. Use `review`; Nitheesh moves it to Done after checking.");
  const uri = process.env.MONGODB_URI ?? stop("Set MONGODB_URI in .env.local (the hub database).");
  await mongoose.connect(uri);
  if (cmd === "sync-features") {
    const me = await actor();
    mustReview(me);
    return printMoved(await syncFeatures(String(me._id)));
  }
  if (cmd === "page" || cmd === "start-page" || cmd === "complete-page") {
    const query = [num, ...rest].filter(Boolean).join(" ");
    if (!query) stop('Give the page name or route, e.g. "Team" or /onboarding/team.');
    if (cmd === "page") return printBrief(await pageBrief(query));
    if (cmd === "complete-page") return completePage(query, await actor());
    return startPage(query, await actor());
  }
  const t = await load(num);
  // Reading needs no identity; every write is done as HUB_AGENT_AS.
  if (cmd === "show") return show(t);
  const me = await actor();

  switch (cmd) {
    case "start": {
      mustOwn(t, me);
      if (!STARTABLE.includes(t.column)) stop(`${tag(t)} is in "${await columnName(t, t.column)}"; only Backlog / To do tasks can be started.`);
      const open = await Task.find({ assignees: me._id, column: "in_progress", archived: false, _id: { $ne: t._id } }).select("number title").lean();
      if (open.length) console.warn(`Note: ${me.name} already has in progress: ${open.map((o) => `#${o.number}`).join(", ")}. Finish one step before the next.`);
      const was = t.column;
      await move(t, me, "in_progress");
      if (was !== "in_progress") await addComment(t, me, "Started (AI agent).");
      await show(t);
      break;
    }

    case "check": {
      mustOwn(t, me);
      if (!t.checklist.length) stop(`${tag(t)} has no checklist.`);
      const picks = rest.includes("all") ? t.checklist.map((_, i) => i + 1) : rest.map(Number);
      if (!picks.length || picks.some((i) => !Number.isInteger(i) || i < 1 || i > t.checklist.length))
        stop(`Give checklist numbers between 1 and ${t.checklist.length}, or "all".`);
      for (const i of picks) t.checklist[i - 1].done = true;
      t.set("autoContent", false); // the checklist now has real progress; the seed must not regenerate it
      await t.save();
      await logActivity({ boardId: String(t.boardId), taskId: String(t._id), actor: String(me._id), action: "updated the checklist", detail: tag(t) });
      console.log(`Ticked ${picks.join(", ")} on ${tag(t)} (${t.checklist.filter((c) => c.done).length}/${t.checklist.length} done).`);
      break;
    }

    case "comment":
      mustOwn(t, me);
      await addComment(t, me, rest.join(" "));
      console.log(`Commented on ${tag(t)}.`);
      break;

    case "review": {
      mustOwn(t, me);
      if (t.column !== "in_progress") stop(`${tag(t)} is in "${await columnName(t, t.column)}"; start it first (only In progress tasks go to review).`);
      const allowOpen = rest.includes("--allow-open");
      const summary = rest.filter((r) => r !== "--allow-open").join(" ").trim();
      if (!summary) stop('Give a summary: what changed, the PR link and how it was verified, in quotes.');
      const open = t.checklist.map((c, i) => (c.done ? null : `${i + 1}. ${c.text}`)).filter(Boolean);
      if (open.length && !allowOpen)
        stop(`Checklist items still open:\n  ${open.join("\n  ")}\nTick them with \`check\`, or pass --allow-open and explain why in the summary.`);
      const mention = new RegExp(`@${REVIEWER}\\b`, "i").test(summary) ? "" : `@${REVIEWER} `;
      await move(t, me, "review");
      await addComment(t, me, `${mention}Ready for review.\n\n${summary}${open.length ? `\n\nStill open:\n- ${open.join("\n- ")}` : ""}`);
      console.log(`${tag(t)} → In review. ${REVIEWER} was notified.`);
      break;
    }

    default:
      stop(`Unknown command "${cmd}". Use show, start, check, comment, review, page, start-page, complete-page or sync-features.`);
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Stop ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
