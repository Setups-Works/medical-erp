import { route } from "@/lib/api";
import { PageCheck, ProductItem, Task, User } from "@/lib/models";

/** Product map, page catalogue, feature list and roles, with live delivery status from the feature tasks. */
export const GET = route(async (req) => {
  const kind = new URL(req.url).searchParams.get("kind");
  const items = await ProductItem.find(kind ? { kind } : {}).sort({ kind: 1, order: 1 }).lean();
  const tasks = await Task.find({ featureId: { $ne: "" }, archived: false }).select("featureId column boardId number priority phase assignees").lean();
  const byFeature = new Map(tasks.map((t) => [t.featureId, t]));
  const shape = (i: (typeof items)[number]) => {
    const features = i.featureIds.map((id) => {
      const t = byFeature.get(id);
      return {
        id,
        taskId: t ? String(t._id) : null,
        boardId: t ? String(t.boardId) : null,
        column: t?.column ?? "missing",
        number: t?.number ?? null,
        priority: t?.priority ?? null,
        phase: t?.phase ?? "",
        assignees: (t?.assignees ?? []).map(String),
      };
    });
    const done = features.filter((f) => f.column === "done").length;
    const started = features.filter((f) => !["backlog", "todo", "missing", "done"].includes(f.column)).length;
    const phase = features.map((f) => f.phase).filter(Boolean).sort().at(-1) ?? "";
    return { id: String(i._id), kind: i.kind, group: i.group, name: i.name, route: i.route, edition: i.edition, notes: i.notes, meta: i.meta ?? {}, features, done, started, total: features.length, phase };
  };
  const checks = new Map((await PageCheck.find().lean()).map((c) => [c.key, c]));
  const names = new Map((await User.find().select("name").lean()).map((u) => [String(u._id), u.name]));
  const all = items.map((i) => {
    const x = shape(i);
    if (i.kind !== "page") return x;
    const c = checks.get(`${i.group}|${i.name}`);
    return { ...x, checked: !!c?.done, checkedBy: c?.done && c.by ? names.get(String(c.by)) : null, checkedAt: c?.done ? c.updatedAt : null };
  });
  return {
    menu: all.filter((i) => i.kind === "menu"),
    capabilities: all.filter((i) => i.kind === "capability"),
    pages: all.filter((i) => i.kind === "page"),
    roles: all.filter((i) => i.kind === "role"),
    features: all.filter((i) => i.kind === "feature"),
  };
});
