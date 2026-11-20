import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { connect, onlineUsers, subscribe, type HubEvent } from "@/lib/events";
import { dropPresence, onlineFromDb, realtimeMode, touchPresence, watchChanges } from "@/lib/realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Serverless functions have a time limit: close a little before it; the browser reconnects automatically.
export const maxDuration = 60;
const STREAM_MS = 55_000;

/** Server-Sent Events stream: everyone sees board, task, comment, page and presence changes live. */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  await connectDb();
  const mode = await realtimeMode();
  const connId = randomUUID();

  const enc = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const write = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(chunk));
        } catch {
          cleanup();
        }
      };
      const send = (e: HubEvent | { type: "hello"; online: string[] }) => {
        if (e.type === "notification" && e.userId !== session.uid) return; // only to its owner
        write(`data: ${JSON.stringify(e)}\n\n`);
      };
      const sendPresence = async () => {
        const online = mode === "changestream" ? await onlineFromDb().catch(() => []) : onlineUsers();
        send({ type: "presence", online });
      };

      let stopWatching: () => void;
      let disconnect: () => void = () => {};
      if (mode === "changestream") {
        await touchPresence(connId, session.uid).catch(() => {});
        stopWatching = watchChanges(send);
      } else {
        stopWatching = subscribe(send);
        disconnect = connect(session.uid);
      }
      send({ type: "hello", online: mode === "changestream" ? await onlineFromDb().catch(() => []) : onlineUsers() });

      const ping = setInterval(async () => {
        write(`: ping\n\n`);
        if (mode === "changestream") {
          await touchPresence(connId, session.uid).catch(() => {});
          await sendPresence();
        }
      }, 20_000);
      const end = setTimeout(() => cleanup(), STREAM_MS);

      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(ping);
        clearTimeout(end);
        stopWatching();
        disconnect();
        if (mode === "changestream") dropPresence(connId).catch(() => {});
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
      req.signal.addEventListener("abort", () => cleanup());
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" },
  });
}
