import type { FilterQuery } from "mongoose";
import { HttpError, body, route } from "@/lib/api";
import { logActivity, notify } from "@/lib/actions";
import { publish } from "@/lib/events";
import { Board, Task, nextTaskNumber } from "@/lib/models";
import { toJSON } from "@/lib/serialize";
import { createTask } from "@/lib/validators";

/** GET /api/tasks?assignee=me|<id>&board=<id>&column=<key>&phase=P1&q=text&limit=200 */
export const GET = route(async (req, { session }) => {
  const url = new URL(req.url);
  const q: FilterQuery<unknown> = { archived: false };
  const assignee = url.searchParams.get("assignee");
  if (assignee) q.assignees = assignee === "me" ? session.uid : assignee;
  const board = url.searchParams.get("board");
  if (board) q.boardId = board;
  const column = url.searchParams.get("column");
  if (column) q.column = column === "open" ? { $ne: "done" } : column;
  const phase = url.searchParams.get("phase");
  if (phase) q.phase = phase;
  const text = url.searchParams.get("q");
  if (text) q.$text = { $search: text };
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 200), 500);
  const tasks = await Task.find(q).sort({ updatedAt: -1 }).limit(limit).lean();
  return toJSON(tasks);
});

export const POST = route(async (req, { session }) => {
  const input = await body(req, createTask);
  const board = await Board.findById(input.boardId).lean();
  if (!board) throw new HttpError(404, "That board doesn’t exist.");
  if (!board.columns.some((c) => c.key === input.column)) throw new HttpError(400, "Unknown column.");
  const last = await Task.findOne({ boardId: input.boardId, column: input.column }).sort({ order: -1 }).lean();
  const task = await Task.create({
    ...input,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    phase: input.phase || board.phase || "",
    order: (last?.order ?? 0) + 1000,
    number: await nextTaskNumber(),
    createdBy: session.uid,
  });
  const id = String(task._id);
  await logActivity({ boardId: input.boardId, taskId: id, actor: session.uid, action: "created task", detail: `#${task.number} ${task.title}` });
  await notify({ users: input.assignees ?? [], actor: session.uid, type: "assigned", text: `${session.name} assigned you #${task.number} ${task.title}`, boardId: input.boardId, taskId: id });
  publish({ type: "task.created", boardId: input.boardId, taskId: id, actor: session.uid });
  return toJSON(task.toObject());
});
