"use client";

import Link from "next/link";
import { useState } from "react";
import { TaskRows } from "@/components/feeds";
import { Inline } from "@/components/inline";
import { PageHeader } from "@/components/page";
import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useTasks } from "@/lib/client";
import { useLookups } from "@/lib/maps";
import { withSteps } from "@/lib/steps";
import type { TaskT } from "@/lib/types";

const TABS: { key: string; label: string; match: (t: TaskT) => boolean }[] = [
  { key: "open", label: "Open", match: (t) => t.column !== "done" },
  { key: "in_progress", label: "In progress", match: (t) => t.column === "in_progress" },
  { key: "review", label: "In review", match: (t) => t.column === "review" || t.column === "qa" },
  { key: "done", label: "Done", match: (t) => t.column === "done" },
];

export default function MyTasks() {
  const [tab, setTab] = useState("open");
  // All of my tasks, so Step numbers are the same whichever tab is open.
  const { data } = useTasks("assignee=me&limit=500");
  const { userMap, boardMap } = useLookups();
  const { sorted, step, next, total } = withSteps(data);
  const active = TABS.find((t) => t.key === tab)!;
  const list = sorted.filter(active.match);
  return (
    <div className="mx-auto max-w-[940px]">
      <PageHeader title="My tasks" subtitle="Everything assigned to you, in the order to do it. Step 1 first." />
      {next && (
        <Link href={`/boards/${next.boardId}?task=${next.id}`} className="card mb-5 flex items-center gap-4 p-4 hover:bg-hover">
          <span className="shrink-0">
            <span className="block text-[11.5px] font-medium uppercase tracking-wide text-ink-4">Next up</span>
            <span className="font-mono text-[13px] text-ink-2">
              Step {step.get(next.id)} of {total}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-medium text-ink">
              <Inline text={next.title} />
            </span>
            <span className="text-[12px] text-ink-4">
              #{next.number} · {boardMap.get(next.boardId)?.name}
            </span>
          </span>
        </Link>
      )}
      <div className="mb-3 flex gap-4 border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} className={cn("-mb-px border-b-2 pb-2 text-[13px] font-medium", tab === t.key ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink")}>
            {t.label} <span className="font-mono opacity-60">{data ? sorted.filter(t.match).length : ""}</span>
          </button>
        ))}
      </div>
      <div className="card p-3">{data ? <TaskRows tasks={list} users={userMap} boards={boardMap} steps={step} /> : <Skeleton className="h-64" />}</div>
    </div>
  );
}
