/**
 * Lets a developer's AI agent work a MENO Hub task by its number (#123), the same way a person would in the UI.
 * The workflow is in docs/team/AGENT_TASK_WORKFLOW.md.
 *
 *   npm run agent-task -- show    <n>
 *   npm run agent-task -- start   <n>
 *   npm run agent-task -- check   <n> <item…|all>      (1-based checklist numbers)
 *   npm run agent-task -- comment <n> "<text>"
 *   npm run agent-task -- review  <n> "<summary + PR link>" [--allow-open]
 *
 * Acts as the hub user named in HUB_AGENT_AS (first name or email) in .env.local.
 * There is deliberately no "done": only Nitheesh moves a task to Done, in the hub, after review.
 * Writes go straight to MongoDB; open hub tabs update live through the change stream (src/lib/realtime.ts).
 */
import mongoose from "mongoose";
import { findMentions, logActivity, notify } from "../src/lib/actions";
import { Board, Comment, Task, User } from "../src/lib/models";

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

async function main() {
  const [cmd, num, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === "help") {
    console.log("Usage: npm run agent-task -- <show|start|check|comment|review> <task#> [...]  (see docs/team/AGENT_TASK_WORKFLOW.md)");
    return;
  }
  if (cmd === "done") stop("Agents never move tasks to Done. Use `review`; Nitheesh moves it to Done after checking.");
  const uri = process.env.MONGODB_URI ?? stop("Set MONGODB_URI in .env.local (the hub database).");
  await mongoose.connect(uri);
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
      stop(`Unknown command "${cmd}". Use show, start, check, comment or review.`);
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Stop ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
