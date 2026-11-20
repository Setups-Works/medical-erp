import type { FilterQuery } from "mongoose";
import { route } from "@/lib/api";
import { Activity } from "@/lib/models";
import { toJSON } from "@/lib/serialize";

/** GET /api/activity?board=<id>&task=<id>&limit=50 */
export const GET = route(async (req) => {
  const url = new URL(req.url);
  const q: FilterQuery<unknown> = {};
  if (url.searchParams.get("board")) q.boardId = url.searchParams.get("board");
  if (url.searchParams.get("task")) q.taskId = url.searchParams.get("task");
  if (url.searchParams.get("actor")) q.actor = url.searchParams.get("actor");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  return toJSON(await Activity.find(q).sort({ createdAt: -1 }).limit(limit).lean());
});
