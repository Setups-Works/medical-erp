import bcrypt from "bcryptjs";
import { z } from "zod";
import { HttpError, body, requireAdmin, route } from "@/lib/api";
import { Task, User } from "@/lib/models";
import { toJSON } from "@/lib/serialize";

export const GET = route(async () => {
  const users = await User.find({ active: true }).sort({ createdAt: 1 }).lean();
  const counts = await Task.aggregate([
    { $match: { archived: false } },
    { $unwind: "$assignees" },
    { $group: { _id: { u: "$assignees", c: "$column" }, n: { $sum: 1 } } },
  ]);
  return users.map((u) => {
    const mine = counts.filter((c) => String(c._id.u) === String(u._id));
    const n = (cols: string[]) => mine.filter((c) => cols.includes(c._id.c)).reduce((s, c) => s + c.n, 0);
    const done = n(["done"]);
    const pending = n(["backlog", "todo"]);
    const active = n(["in_progress"]);
    const review = n(["review", "qa"]);
    const total = mine.reduce((s, c) => s + c.n, 0);
    return { ...toJSON<Record<string, unknown>>(u), total, pending, active, review, done, open: total - done };
  });
});

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  title: z.string().default(""),
  role: z.enum(["admin", "member"]).default("member"),
  tint: z.enum(["blue", "green", "amber", "red", "violet", "pink", "slate"]).default("slate"),
  password: z.string().min(10, "Temporary password needs 10+ characters."),
});

export const POST = route(async (req, { session }) => {
  requireAdmin(session);
  const input = await body(req, schema);
  if (await User.exists({ email: input.email.toLowerCase() })) throw new HttpError(409, "Someone already uses that email.");
  const user = await User.create({ ...input, passwordHash: await bcrypt.hash(input.password, 10), mustChangePassword: true });
  return toJSON(user.toObject());
});
