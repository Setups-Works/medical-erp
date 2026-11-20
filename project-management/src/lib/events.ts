import { EventEmitter } from "node:events";

/**
 * In-process event bus for live updates (Server-Sent Events).
 * Fine for one server instance. For several instances, back publish/subscribe with
 * MongoDB change streams (Atlas is a replica set) — callers don't change.
 */
export type HubEvent =
  | { type: "task.changed" | "task.created" | "task.deleted"; boardId: string; taskId: string; actor: string }
  | { type: "comment.created"; boardId: string; targetType: "task" | "board"; targetId: string; actor: string }
  | { type: "board.changed"; boardId: string; actor: string }
  | { type: "product.changed"; actor: string }
  | { type: "notification"; userId: string }
  | { type: "presence"; online: string[] };

type Bus = { emitter: EventEmitter; online: Map<string, number> };
const g = globalThis as unknown as { __hubBus?: Bus };
const bus: Bus = g.__hubBus ?? (g.__hubBus = { emitter: new EventEmitter(), online: new Map() });
bus.emitter.setMaxListeners(500);

export function publish(e: HubEvent) {
  bus.emitter.emit("event", e);
}

export function subscribe(fn: (e: HubEvent) => void) {
  bus.emitter.on("event", fn);
  return () => {
    bus.emitter.off("event", fn);
  };
}

export function onlineUsers() {
  return [...bus.online.keys()];
}

/** Registers a live connection for presence; returns the disconnect function. */
export function connect(userId: string) {
  bus.online.set(userId, (bus.online.get(userId) ?? 0) + 1);
  publish({ type: "presence", online: onlineUsers() });
  return () => {
    const n = (bus.online.get(userId) ?? 1) - 1;
    if (n <= 0) bus.online.delete(userId);
    else bus.online.set(userId, n);
    publish({ type: "presence", online: onlineUsers() });
  };
}
