import mongoose from "mongoose";
import type { HubEvent } from "./events";

/**
 * Cross-instance live updates. On a MongoDB replica set (Atlas), every server instance — including Vercel
 * serverless functions — watches the database with a change stream, so a change made in one instance reaches
 * every open tab. Without a replica set (local in-memory MongoDB) we fall back to the in-process bus.
 */
let mode: Promise<"changestream" | "memory"> | null = null;

export function realtimeMode() {
  mode ??= (async () => {
    if (process.env.HUB_REALTIME === "memory") return "memory";
    try {
      const hello = await mongoose.connection.db!.admin().command({ hello: 1 });
      return hello.setName ? "changestream" : "memory";
    } catch {
      return "memory";
    }
  })();
  return mode;
}

const WATCHED = ["tasks", "comments", "boards", "notifications", "pagechecks", "productitems"];

type Change = {
  operationType: string;
  ns?: { coll?: string };
  fullDocument?: Record<string, unknown>;
};

function toEvent(c: Change): HubEvent | null {
  const coll = c.ns?.coll;
  const d = c.fullDocument ?? {};
  const id = (v: unknown) => (v ? String(v) : "");
  switch (coll) {
    case "tasks":
      return { type: c.operationType === "insert" ? "task.created" : "task.changed", boardId: id(d.boardId), taskId: id(d._id), actor: "" };
    case "comments":
      return { type: "comment.created", boardId: id(d.boardId), targetType: d.targetType as "task" | "board", targetId: id(d.targetId), actor: id(d.author) };
    case "boards":
      return { type: "board.changed", boardId: id(d._id), actor: "" };
    case "notifications":
      return { type: "notification", userId: id(d.user) };
    case "pagechecks":
    case "productitems":
      return { type: "product.changed", actor: "" };
    default:
      return null;
  }
}

/** Opens a change stream and calls `fn` for each mapped event. Returns a close function. */
export function watchChanges(fn: (e: HubEvent) => void) {
  const stream = mongoose.connection.db!.watch(
    [{ $match: { operationType: { $in: ["insert", "update", "replace"] }, "ns.coll": { $in: WATCHED } } }],
    { fullDocument: "updateLookup" },
  );
  let last = "";
  stream.on("change", (c: Change) => {
    const e = toEvent(c);
    if (!e) return;
    // Bulk imports touch hundreds of rows: collapse identical consecutive events.
    const key = JSON.stringify(e);
    if (key === last && e.type === "product.changed") return;
    last = key;
    fn(e);
  });
  stream.on("error", (err) => {
    console.error("[hub] change stream error", err?.message);
  });
  return () => {
    stream.close().catch(() => {});
  };
}

/** Presence shared across instances: one row per open connection, refreshed on every ping. */
const presenceSchema = new mongoose.Schema({ _id: String, user: String, expiresAt: Date });
presenceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Presence = (mongoose.models.Presence as mongoose.Model<{ _id: string; user: string; expiresAt: Date }>) ?? mongoose.model("Presence", presenceSchema);

export async function touchPresence(connId: string, user: string) {
  await Presence.updateOne({ _id: connId }, { user, expiresAt: new Date(Date.now() + 60_000) }, { upsert: true });
}
export async function dropPresence(connId: string) {
  await Presence.deleteOne({ _id: connId });
}
export async function onlineFromDb(): Promise<string[]> {
  return (await Presence.distinct("user", { expiresAt: { $gt: new Date() } })) as string[];
}
