import { z } from "zod";
import { body, route } from "@/lib/api";
import { logActivity } from "@/lib/actions";
import { publish } from "@/lib/events";
import { Board, DEFAULT_COLUMNS, Task } from "@/lib/models";
import { toJSON } from "@/lib/serialize";

export const GET = route(async () => {
  const boards = await Board.find({ archived: false }).sort({ order: 1, createdAt: 1 }).lean();
  const counts = await Task.aggregate([
    { $match: { archived: false } },
    { $group: { _id: { b: "$boardId", c: "$column" }, n: { $sum: 1 } } },
  ]);
  return boards.map((b) => {
    const mine = counts.filter((c) => String(c._id.b) === String(b._id));
    const total = mine.reduce((s, c) => s + c.n, 0);
    const done = mine.find((c) => c._id.c === "done")?.n ?? 0;
    return { ...toJSON<Record<string, unknown>>(b), total, done };
  });
});

const schema = z.object({
  name: z.string().min(2, "Give the board a name."),
  description: z.string().default(""),
});

export const POST = route(async (req, { session }) => {
  const input = await body(req, schema);
  const key = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}-${Date.now().toString(36)}`;
  const board = await Board.create({ ...input, key, kind: "custom", columns: DEFAULT_COLUMNS, createdBy: session.uid });
  await logActivity({ boardId: String(board._id), actor: session.uid, action: "created board", detail: board.name });
  publish({ type: "board.changed", boardId: String(board._id), actor: session.uid });
  return toJSON(board.toObject());
});
