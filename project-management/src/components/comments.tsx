"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { api, refresh } from "@/lib/client";
import type { CommentT, UserT } from "@/lib/types";
import { Avatar, Button, Empty, Kbd, Textarea } from "./ui";

/** Comment thread for a task or a board. Supports @firstname mentions (they get a notification). */
export function Comments({ url, users, placeholder }: { url: string; users: Map<string, UserT>; placeholder?: string }) {
  const { data } = useSWR<CommentT[]>(url, (u: string) => api<CommentT[]>(u));
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await api(url, { method: "POST", json: { body: text } });
      setText("");
      refresh(url);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {!data?.length && <Empty>No comments yet. Start the conversation.</Empty>}
      <ol className="space-y-4">
        {data?.map((c) => {
          const u = users.get(c.author);
          return (
            <li key={c.id} className="flex gap-2.5">
              <Avatar user={u} size={26} />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px]">
                  <span className="font-medium text-ink">{u?.name ?? "Someone"}</span>{" "}
                  <span className="text-ink-4">{formatDistanceToNowStrict(new Date(c.createdAt))} ago</span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-ink-2">
                  {c.body.split(/(@[a-z][a-z0-9_-]+)/gi).map((part, i) =>
                    part.startsWith("@") ? (
                      <span key={i} className="font-medium text-data">
                        {part}
                      </span>
                    ) : (
                      part
                    ),
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder ?? "Write a comment… use @name to mention someone"}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
          className="min-h-[72px]"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] text-ink-4">
            <Kbd>⌘</Kbd> <Kbd>Enter</Kbd> to send
          </span>
          <Button variant="primary" onClick={send} disabled={busy || !text.trim()}>
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
