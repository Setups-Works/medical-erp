"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { refresh } from "@/lib/client";

type Live = { online: string[]; connected: boolean };
const LiveCtx = createContext<Live>({ online: [], connected: false });
export const useLive = () => useContext(LiveCtx);

/**
 * One EventSource per tab. Every change anyone makes arrives here and revalidates the affected data,
 * so all screens update for everyone without reloading.
 */
export function LiveProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Live>({ online: [], connected: false });

  useEffect(() => {
    let es: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout>;
    const open = () => {
      es = new EventSource("/api/events");
      es.onopen = () => setState((s) => ({ ...s, connected: true }));
      es.onerror = () => {
        // The server closes each stream after ~55 s (serverless time limit); reconnect quickly without flicker.
        es?.close();
        retry = setTimeout(() => {
          open();
          const current = es;
          setTimeout(() => {
            if (current && current.readyState !== EventSource.OPEN) setState((s) => ({ ...s, connected: false }));
          }, 2500);
        }, 500);
      };
      es.onmessage = (m) => {
        const e = JSON.parse(m.data) as { type: string; boardId?: string; taskId?: string; targetId?: string; targetType?: string; online?: string[] };
        switch (e.type) {
          case "hello":
          case "presence":
            setState({ online: e.online ?? [], connected: true });
            break;
          case "task.created":
          case "task.changed":
          case "task.deleted":
            refresh(`/api/tasks`, "/api/product-map", `/api/boards/${e.boardId}`, `/api/tasks`, "/api/boards", "/api/stats", "/api/activity", "/api/users", "/api/product-map");
            break;
          case "comment.created":
            refresh(e.targetType === "board" ? `/api/boards/${e.targetId}/comments` : `/api/tasks/${e.targetId}/comments`, "/api/activity");
            break;
          case "product.changed":
            refresh("/api/product-map", "/api/activity");
            break;
          case "board.changed":
            refresh("/api/boards", "/api/activity");
            break;
          case "notification":
            refresh("/api/notifications");
            break;
        }
      };
    };
    open();
    return () => {
      clearTimeout(retry);
      es?.close();
    };
  }, []);

  return <LiveCtx.Provider value={state}>{children}</LiveCtx.Provider>;
}
