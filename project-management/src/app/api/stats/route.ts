import { Types } from "mongoose";
import { route } from "@/lib/api";
import { PHASES, Task } from "@/lib/models";

export const GET = route(async (_req, { session }) => {
  const [byPhase, byColumn, mine] = await Promise.all([
    Task.aggregate([
      { $match: { archived: false } },
      { $group: { _id: "$phase", total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ["$column", "done"] }, 1, 0] } } } },
    ]),
    Task.aggregate([{ $match: { archived: false } }, { $group: { _id: "$column", n: { $sum: 1 } } }]),
    Task.aggregate([
      { $match: { archived: false, assignees: { $in: [new Types.ObjectId(session.uid)] } } },
      { $group: { _id: "$column", n: { $sum: 1 } } },
    ]),
  ]);
  const features = await Task.aggregate([
    { $match: { archived: false, sourceKey: /^feature:/ } },
    { $group: { _id: "$phase", total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ["$column", "done"] }, 1, 0] } } } },
  ]);
  const total = await Task.countDocuments({ archived: false });
  const done = await Task.countDocuments({ archived: false, column: "done" });
  return {
    overall: { total, done, open: total - done },
    phases: PHASES.map((p) => {
      const t = byPhase.find((x) => x._id === p.key);
      const f = features.find((x) => x._id === p.key);
      return { ...p, total: t?.total ?? 0, done: t?.done ?? 0, features: f?.total ?? 0, featuresDone: f?.done ?? 0 };
    }),
    columns: Object.fromEntries(byColumn.map((c) => [c._id, c.n])),
    mine: Object.fromEntries(mine.map((c) => [c._id, c.n])),
  };
});
