"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { api, refresh } from "@/lib/client";
import type { CommentT, UserT } from "@/lib/types";
import { Avatar, Button, Empty, Kbd, Textarea } from "./ui";

/** Comment thread for a task or a board. Typing @ opens a teammate picker; @firstname mentions notify that person. */
export function Comments({ url, users, placeholder }: { url: string; users: Map<string, UserT>; placeholder?: string }) {
  const { data } = useSWR<CommentT[]>(url, (u: string) => api<CommentT[]>(u));
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);
  // Active "@query" right before the caret; null when the picker is closed.
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const [pick, setPick] = useState(0);
  // Open the picker on whichever side of the box has more room, so it is never cut off.
  const [below, setBelow] = useState(false);
  const people = useMemo(() => [...users.values()].sort((a, b) => a.name.localeCompare(b.name)), [users]);
  const matches = mention
    ? people.filter((u) => {
        const q = mention.query.toLowerCase();
        return u.name.toLowerCase().split(" ").some((w) => w.startsWith(q)) || (q.length > 1 && u.title.toLowerCase().includes(q));
      })
    : [];

  function track(value: string, caret: number) {
    const m = value.slice(0, caret).match(/(^|\s)@([a-z0-9_-]*)$/i);
    if (m) {
      setMention({ start: caret - m[2].length - 1, query: m[2] });
      setPick(0);
      const r = box.current?.getBoundingClientRect();
      if (r) setBelow(window.innerHeight - r.bottom > r.top);
    } else setMention(null);
  }

  function choose(u: UserT) {
    if (!mention) return;
    const handle = `@${u.name.split(" ")[0].toLowerCase()} `;
    const end = mention.start + 1 + mention.query.length;
    const next = text.slice(0, mention.start) + handle + text.slice(end);
    setText(next);
    setMention(null);
    const caret = mention.start + handle.length;
    requestAnimationFrame(() => {
      box.current?.focus();
      box.current?.setSelectionRange(caret, caret);
    });
  }

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
        <div className="relative">
          <Textarea
            ref={box}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              track(e.target.value, e.target.selectionStart);
            }}
            onClick={(e) => track(e.currentTarget.value, e.currentTarget.selectionStart)}
            onBlur={() => setTimeout(() => setMention(null), 120)}
            placeholder={placeholder ?? "Write a comment… type @ to mention someone"}
            onKeyDown={(e) => {
              if (mention && matches.length) {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setPick((i) => (i + (e.key === "ArrowDown" ? 1 : matches.length - 1)) % matches.length);
                  return;
                }
                if ((e.key === "Enter" && !e.metaKey && !e.ctrlKey) || e.key === "Tab") {
                  e.preventDefault();
                  choose(matches[Math.min(pick, matches.length - 1)]);
                  return;
                }
              }
              if (mention && e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setMention(null);
                return;
              }
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
            aria-autocomplete="list"
            aria-expanded={!!mention && matches.length > 0}
            className="min-h-[72px]"
          />
          {mention && matches.length > 0 && (
            <ul
              role="listbox"
              aria-label="Mention a teammate"
              className={`absolute left-0 z-50 max-h-64 w-72 ${below ? "top-full mt-1" : "bottom-full mb-1"} overflow-auto rounded-md border border-line-2 bg-raised p-1 shadow-[var(--shadow-pop)]`}
            >
              {matches.map((u, i) => (
                <li
                  key={u.id}
                  role="option"
                  aria-selected={i === pick}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(u);
                  }}
                  onMouseEnter={() => setPick(i)}
                  className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 ${i === pick ? "bg-hover" : ""}`}
                >
                  <Avatar user={u} size={22} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{u.name}</span>
                    <span className="block truncate text-[11.5px] text-ink-4">{u.title}</span>
                  </span>
                  <span className="font-mono text-[11px] text-ink-4">@{u.name.split(" ")[0].toLowerCase()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
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
