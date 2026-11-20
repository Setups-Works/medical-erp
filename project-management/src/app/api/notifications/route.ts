import { z } from "zod";
import { body, route } from "@/lib/api";
import { publish } from "@/lib/events";
import { Notification } from "@/lib/models";
import { toJSON } from "@/lib/serialize";

export const GET = route(async (_req, { session }) => {
  const items = await Notification.find({ user: session.uid }).sort({ createdAt: -1 }).limit(40).lean();
  const unread = await Notification.countDocuments({ user: session.uid, read: false });
  return { items: toJSON(items), unread };
});

const schema = z.object({ ids: z.array(z.string()).optional(), all: z.boolean().optional() });

export const POST = route(async (req, { session }) => {
  const { ids, all } = await body(req, schema);
  const filter = all ? { user: session.uid } : { user: session.uid, _id: { $in: ids ?? [] } };
  await Notification.updateMany(filter, { read: true });
  publish({ type: "notification", userId: session.uid });
  return { ok: true };
});
