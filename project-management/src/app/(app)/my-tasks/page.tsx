"use client";

import { useState } from "react";
import { TaskRows } from "@/components/feeds";
import { PageHeader } from "@/components/page";
import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useTasks } from "@/lib/client";
import { useLookups } from "@/lib/maps";

const TABS = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "review", label: "In review" },
  { key: "done", label: "Done" },
];

export default function MyTasks() {
  const [tab, setTab] = useState("open");
  const { data } = useTasks(`assignee=me&column=${tab}&limit=500`);
  const { userMap, boardMap } = useLookups();
  const sorted = data && [...data].sort((a, b) => (a.phase || "P9").localeCompare(b.phase || "P9") || a.number - b.number);
  return (
    <div className="mx-auto max-w-[940px]">
      <PageHeader title="My tasks" subtitle="Everything assigned to you, across every board." />
      <div className="mb-3 flex gap-4 border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} className={cn("-mb-px border-b-2 pb-2 text-[13px] font-medium", tab === t.key ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink")}>
            {t.label}
          </button>
        ))}
        <span className="ml-auto pb-2 font-mono text-[12px] text-ink-4">{data?.length ?? ""}</span>
      </div>
      <div className="card p-3">{sorted ? <TaskRows tasks={sorted} users={userMap} boards={boardMap} /> : <Skeleton className="h-64" />}</div>
    </div>
  );
}
