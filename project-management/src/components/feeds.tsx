"use client";

import { format, formatDistanceToNowStrict, isPast, isToday } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ActivityT, BoardT, TaskT, UserT } from "@/lib/types";
import { Inline } from "./inline";
import { Avatar, AvatarStack, Badge, Empty, PRIORITY } from "./ui";

export function ActivityFeed({ items, users, boards }: { items?: ActivityT[]; users: Map<string, UserT>; boards?: Map<string, BoardT> }) {
  if (!items) return null;
  if (!items.length) return <Empty>Nothing has happened yet.</Empty>;
  return (
    <ol className="divide-y divide-line">
      {items.map((a) => {
        const u = users.get(a.actor);
        const b = a.boardId ? boards?.get(a.boardId) : undefined;
        const href = a.boardId ? `/boards/${a.boardId}${a.taskId ? `?task=${a.taskId}` : ""}` : undefined;
        const body = (
          <>
            <Avatar user={u} size={24} />
            <span className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink-2">
              <span className="font-medium text-ink">{u?.name ?? "Someone"}</span> {a.action} <span className="text-ink"><Inline text={a.detail} /></span>
              {b && <span className="text-ink-4"> · {b.name}</span>}
            </span>
            <span className="shrink-0 text-[11.5px] text-ink-4">{formatDistanceToNowStrict(new Date(a.createdAt))}</span>
          </>
        );
        return (
          <li key={a.id}>
            {href ? (
              <Link href={href} className="flex gap-2.5 rounded-ctl px-2 py-2.5 hover:bg-hover">
                {body}
              </Link>
            ) : (
              <div className="flex gap-2.5 px-2 py-2.5">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function TaskRows({ tasks, users, boards, steps }: { tasks?: TaskT[]; users: Map<string, UserT>; boards: Map<string, BoardT>; steps?: Map<string, number> }) {
  if (!tasks) return null;
  if (!tasks.length) return <Empty>No tasks here.</Empty>;
  return (
    <ul className="divide-y divide-line">
      {tasks.map((t) => {
        const b = boards.get(t.boardId);
        const col = b?.columns.find((c) => c.key === t.column)?.name ?? t.column;
        const due = t.dueDate ? new Date(t.dueDate) : null;
        return (
          <li key={t.id}>
            <Link href={`/boards/${t.boardId}?task=${t.id}`} className="flex items-center gap-3 rounded-ctl px-2 py-2.5 hover:bg-hover">
              {steps ? (
                <span className="w-16 shrink-0 font-mono text-[12px] tabular-nums text-ink-3" title={`Task #${t.number}`}>
                  Step {steps.get(t.id) ?? "–"}
                </span>
              ) : (
                <span className="w-12 shrink-0 font-mono text-[12px] tabular-nums text-ink-4">#{t.number}</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] text-ink"><Inline text={t.title} /></span>
                <span className="text-[12px] text-ink-4">
                  {steps && <span className="font-mono">#{t.number} · </span>}
                  {b?.name} · {col}
                </span>
              </span>
              {due && <span className={cn("hidden font-mono text-[12px] sm:block", t.column !== "done" && isPast(due) && !isToday(due) ? "text-critical" : "text-ink-3")}>{format(due, "dd MMM")}</span>}
              <Badge tint={PRIORITY[t.priority].tint} className="hidden sm:inline-flex">
                {PRIORITY[t.priority].label}
              </Badge>
              <AvatarStack users={t.assignees.map((a) => users.get(a))} size={20} max={3} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
