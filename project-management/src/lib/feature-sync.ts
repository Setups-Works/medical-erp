import { logActivity } from "./actions";
import { Board, PageCheck, ProductItem, Task } from "./models";

/**
 * Pages and features stay in step (docs/team/BUILD_A_PAGE.md "Ticks"):
 *   BE ready + FE ready  → the page is Completed
 *   every page that lists a feature is Completed → that feature's card (sourceKey `feature:<ID>`) moves to Done
 * Only ever forwards: reopening a page never reopens a feature, someone does that by hand with a reason.
 * Shared by the Pages API (ticks in the hub) and `npm run agent-task -- complete-page | sync-features`.
 */

type PageLean = { group: string; name: string; route: string; featureIds: string[] };
const key = (p: { group: string; name: string }) => `${p.group}|${p.name}`;

/** Marks the page Completed when both its BE and FE ticks are on. Returns true when it did. */
export async function completeIfBuilt(pageKey: string, actor: string): Promise<boolean> {
  const check = await PageCheck.findOne({ key: pageKey });
  if (!check || check.done || !check.be?.done || !check.fe?.done) return false;
  check.done = true;
  check.by = actor as never;
  check.doneAt = new Date();
  await check.save();
  await logActivity({ actor, action: "marked page completed", detail: `${pageKey.split("|")[1]} (BE and FE ready)` });
  return true;
}

/**
 * Moves to Done every feature card whose pages are all Completed. `only` limits it to some feature IDs (the ones on
 * a page that was just completed). Returns the cards it moved.
 */
export async function syncFeatures(actor: string, only?: readonly string[]): Promise<{ number: number; featureId: string }[]> {
  const pages = (await ProductItem.find({ kind: "page" }).select("group name route featureIds").lean()) as unknown as PageLean[];
  const done = new Set(((await PageCheck.find({ done: true }).select("key").lean()) as { key: string }[]).map((c) => c.key));

  const pagesOf = new Map<string, PageLean[]>();
  for (const p of pages) for (const f of p.featureIds) pagesOf.set(f, [...(pagesOf.get(f) ?? []), p]);

  const candidates = (only ?? [...pagesOf.keys()]).filter((f) => {
    const ps = pagesOf.get(f) ?? [];
    return ps.length > 0 && ps.every((p) => done.has(key(p)));
  });
  if (!candidates.length) return [];

  const tasks = await Task.find({ sourceKey: { $in: candidates.map((f) => `feature:${f}`) }, archived: false, column: { $ne: "done" } });
  const moved: { number: number; featureId: string }[] = [];
  for (const t of tasks) {
    const board = await Board.findById(t.boardId).lean();
    if (!board?.columns.some((c) => c.key === "done")) continue;
    const from = board.columns.find((c) => c.key === t.column)?.name ?? t.column;
    t.column = "done";
    t.order = Date.now();
    await t.save();
    await logActivity({ boardId: String(t.boardId), taskId: String(t._id), actor, action: "moved", detail: `#${t.number}: ${from} → Done (all its pages completed)` });
    moved.push({ number: t.number, featureId: t.featureId ?? "" });
  }
  return moved;
}
