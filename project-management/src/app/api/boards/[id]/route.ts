import { z } from "zod";
import { HttpError, assertId, body, requireAdmin, route } from "@/lib/api";
import { logActivity } from "@/lib/actions";
import { publish } from "@/lib/events";
import { Board, Task } from "@/lib/models";
import { toJSON } from "@/lib/serialize";

type P = { id: string };

export const GET = route<P>(async (_req, { params }) => {
  assertId(params.id, "board");
  const board = await Board.findById(params.id).lean();
  if (!board) throw new HttpError(404, "That board doesn’t exist.");
  const tasks = await Task.find({ boardId: params.id, archived: false }).sort({ order: 1 }).lean();
  return { board: toJSON(board), tasks: toJSON(tasks) };
});

const schema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  columns: z.array(z.object({ key: z.string().min(1), name: z.string().min(1), wipLimit: z.number().int().min(0) })).min(1).optional(),
  archived: z.boolean().optional(),
});

export const PATCH = route<P>(async (req, { params, session }) => {
  assertId(params.id, "board");
  const input = await body(req, schema);
  if (input.archived) requireAdmin(session);
  const board = await Board.findByIdAndUpdate(params.id, input, { new: true }).lean();
  if (!board) throw new HttpError(404, "That board doesn’t exist.");
  await logActivity({ boardId: params.id, actor: session.uid, action: input.archived ? "archived board" : "updated board", detail: board.name });
  publish({ type: "board.changed", boardId: params.id, actor: session.uid });
  return toJSON(board);
});
