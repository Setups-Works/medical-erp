import { z } from "zod";
import { body, route } from "@/lib/api";
import { logActivity } from "@/lib/actions";
import { publish } from "@/lib/events";
import { PageCheck } from "@/lib/models";

const schema = z.object({ group: z.string().min(1).max(200), name: z.string().min(1).max(200), done: z.boolean() });

/** Marks a page from docs/product/PAGES.md as completed (or not). Everyone sees it live. */
export const POST = route(async (req, { session }) => {
  const { group, name, done } = await body(req, schema);
  await PageCheck.findOneAndUpdate({ key: `${group}|${name}` }, { done, by: session.uid }, { upsert: true });
  await logActivity({ actor: session.uid, action: done ? "marked page completed" : "reopened page", detail: `${name} (${group.split(".")[0]})` });
  publish({ type: "product.changed", actor: session.uid });
  return { ok: true };
});
