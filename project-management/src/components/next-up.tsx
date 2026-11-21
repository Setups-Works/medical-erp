"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { TaskT, UserT } from "@/lib/types";
import { Inline } from "./inline";
import { Avatar } from "./ui";

/**
 * "Who does what next" for one board: each person's open tasks here in work order (rank),
 * so anyone opening the board sees what to pick up now and what follows.
 */
export function NextUp({ tasks, users, meId, onOpen }: { tasks: TaskT[]; users: Map<string, UserT>; meId?: string; onOpen: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  const byRank = [...tasks].filter((t) => t.column !== "done").sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity) || a.number - b.number);
  const people = [...users.values()]
    .map((u) => ({ u, mine: byRank.filter((t) => t.assignees.includes(u.id)) }))
    .filter((p) => p.mine.length)
    // Me first, then whoever has the most left on this board.
    .sort((a, b) => Number(b.u.id === meId) - Number(a.u.id === meId) || b.mine.length - a.mine.length);
  if (!people.length) return null;

  return (
    <section className="card mb-4 p-3">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-1 text-left" aria-expanded={open}>
        <h2 className="text-[13.5px] font-semibold">What to do next</h2>
        <span className="text-[12px] text-ink-4">each person’s next tasks on this board, in order</span>
        <ChevronDown className={cn("ml-auto size-4 text-ink-4 transition-transform", !open && "-rotate-90")} />
      </button>
      {open && (
        <ul className="mt-2 grid min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {people.map(({ u, mine }) => (
            <li key={u.id} className="min-w-0 rounded-ctl p-2 shadow-[inset_0_0_0_1px_var(--line)]">
              <div className="mb-1.5 flex items-center gap-2">
                <Avatar user={u} size={20} />
                <span className="text-[13px] font-medium">{u.id === meId ? `${u.name} (you)` : u.name}</span>
                <span className="truncate text-[11.5px] text-ink-4">{u.title}</span>
                <span className="ml-auto shrink-0 font-mono text-[11.5px] text-ink-4">{mine.length} open</span>
              </div>
              <ol className="space-y-0.5">
                {mine.slice(0, 3).map((t, i) => (
                  <li key={t.id}>
                    <button onClick={() => onOpen(t.id)} className="flex w-full items-baseline gap-2 rounded px-1 py-0.5 text-left hover:bg-hover">
                      <span className={cn("w-10 shrink-0 font-mono text-[11px]", i === 0 ? "text-ink" : "text-ink-4")}>{i === 0 ? "Now" : `Then`}</span>
                      <span className={cn("min-w-0 flex-1 truncate text-[12.5px]", i === 0 ? "font-medium text-ink" : "text-ink-3")}>
                        <Inline text={t.title} />
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-ink-4">#{t.number}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
