import { z } from "zod";
import { HttpError, body, route } from "@/lib/api";
import { publish } from "@/lib/events";
import { ProductItem } from "@/lib/models";
import { ensurePageTasks } from "@/lib/page-tasks";

const schema = z.object({ group: z.string().min(1).max(200), name: z.string().min(1).max(200) });

/**
 * "Start page" on the Pages list: the person clicking takes the page, frontend and backend together.
 * Creates (or returns) its Backend and Frontend cards, assigned to them. Never duplicates a card.
 */
export const POST = route(async (req, { session }) => {
  const { group, name } = await body(req, schema);
  const page = await ProductItem.findOne({ kind: "page", group, name }).lean();
  if (!page) throw new HttpError(404, "That page isn’t in the catalogue.");
  const { be, fe, created } = await ensurePageTasks(page as never, { actor: session.uid, assignee: session.uid, actorName: session.name });
  for (const t of [be, fe]) if (created.length) publish({ type: "task.created", boardId: String(t.boardId), taskId: String(t._id), actor: session.uid });
  publish({ type: "product.changed", actor: session.uid });
  return { be: be.number, fe: fe.number, created };
});
