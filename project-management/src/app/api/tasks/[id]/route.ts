import { HttpError, assertId, body, route } from "@/lib/api";
import { logActivity, notify } from "@/lib/actions";
import { publish } from "@/lib/events";
import { Board, Task, User } from "@/lib/models";
import { toJSON } from "@/lib/serialize";
import { updateTask } from "@/lib/validators";

type P = { id: string };

export const GET = route<P>(async (_req, { params }) => {
  assertId(params.id, "task");
  const task = await Task.findById(params.id).lean();
  if (!task) throw new HttpError(404, "That task doesn’t exist.");
  return toJSON(task);
});

const LABEL: Record<string, string> = {
  title: "renamed", description: "edited the description", priority: "changed priority", size: "changed size",
  dueDate: "changed due date", labels: "changed labels", phase: "changed phase", featureId: "changed feature id",
  checklist: "updated the checklist", archived: "archived",
};

export const PATCH = route<P>(async (req, { params, session }) => {
  assertId(params.id, "task");
  const input = await body(req, updateTask);
  const task = await Task.findById(params.id);
  if (!task) throw new HttpError(404, "That task doesn’t exist.");
  const boardId = String(task.boardId);
  const before = { column: task.column, assignees: task.assignees.map(String) };

  if (input.column && input.column !== task.column) {
    const board = await Board.findById(boardId).lean();
    if (!board?.columns.some((c) => c.key === input.column)) throw new HttpError(400, "Unknown column.");
  }
  const { dueDate, ...rest } = input;
  task.set(rest);
  if ("description" in input || "checklist" in input) task.set("autoContent", false);
  if ("assignees" in input) task.set("autoAssign", false);
  if (dueDate !== undefined) task.set("dueDate", dueDate ? new Date(dueDate) : null);
  await task.save();

  const id = String(task._id);
  const tag = `#${task.number} ${task.title}`;
  if (input.column && input.column !== before.column) {
    const board = await Board.findById(boardId).lean();
    const name = (k: string) => board?.columns.find((c) => c.key === k)?.name ?? k;
    await logActivity({ boardId, taskId: id, actor: session.uid, action: "moved", detail: `${tag}: ${name(before.column)} → ${name(input.column)}` });
    // Admins are the reviewers who move tasks to Done (agents reach them via the @mention in `agent-task review`).
    if (input.column === "review") {
      const admins = (await User.find({ role: "admin", active: true }).select("_id").lean()).map((u) => String(u._id));
      await notify({ users: admins, actor: session.uid, type: "review", text: `${session.name} sent ${tag} to review`, boardId, taskId: id });
    }
  }
  if (input.assignees) {
    const added = input.assignees.filter((a) => !before.assignees.includes(a));
    if (added.length || input.assignees.length !== before.assignees.length) {
      const names = (await User.find({ _id: { $in: input.assignees } }).select("name").lean()).map((u) => u.name);
      await logActivity({ boardId, taskId: id, actor: session.uid, action: "assigned", detail: `${tag} → ${names.join(", ") || "nobody"}` });
    }
    await notify({ users: added, actor: session.uid, type: "assigned", text: `${session.name} assigned you ${tag}`, boardId, taskId: id });
  }
  for (const k of Object.keys(LABEL)) {
    if (k in input) await logActivity({ boardId, taskId: id, actor: session.uid, action: LABEL[k], detail: tag });
  }
  publish({ type: input.archived ? "task.deleted" : "task.changed", boardId, taskId: id, actor: session.uid });
  return toJSON(task.toObject());
});

export const DELETE = route<P>(async (_req, { params, session }) => {
  assertId(params.id, "task");
  const task = await Task.findByIdAndUpdate(params.id, { archived: true }, { new: true }).lean();
  if (!task) throw new HttpError(404, "That task doesn’t exist.");
  await logActivity({ boardId: String(task.boardId), taskId: params.id, actor: session.uid, action: "archived", detail: `#${task.number} ${task.title}` });
  publish({ type: "task.deleted", boardId: String(task.boardId), taskId: params.id, actor: session.uid });
  return { ok: true };
});
