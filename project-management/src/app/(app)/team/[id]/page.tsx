"use client";

import { isPast, isToday } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { ActivityFeed, TaskRows } from "@/components/feeds";
import { Markdown } from "@/components/markdown";
import { Avatar, Badge, Progress, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { api, useActivity, useTasks } from "@/lib/client";
import { useLookups } from "@/lib/maps";
import { withSteps } from "@/lib/steps";
import type { TaskT } from "@/lib/types";

const TABS = [
  { key: "now", label: "Working on", match: (t: TaskT) => ["todo", "in_progress", "review", "qa"].includes(t.column) },
  { key: "backlog", label: "Backlog", match: (t: TaskT) => t.column === "backlog" },
  { key: "done", label: "Done", match: (t: TaskT) => t.column === "done" },
  { key: "all", label: "All", match: () => true },
];
const PHASES = ["P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7"];

export default function MemberPage() {
  const { id } = useParams<{ id: string }>();
  const { users, userMap, boardMap } = useLookups();
  const user = users?.find((u) => u.id === id);
  const { data: tasks } = useTasks(`assignee=${id}&limit=500`);
  const { data: activity } = useActivity(`actor=${id}&limit=25`);
  const { data: guide } = useSWR<{ markdown: string; source: string }>(`/api/users/${id}/guide`, (u: string) => api<{ markdown: string; source: string }>(u));
  const [tab, setTab] = useState("now");
  const [view, setView] = useState<"tasks" | "role">("tasks");

  const stats = useMemo(() => {
    const t = tasks ?? [];
    const count = (cols: string[]) => t.filter((x) => cols.includes(x.column)).length;
    return {
      total: t.length,
      done: count(["done"]),
      progress: count(["in_progress"]),
      review: count(["review", "qa"]),
      todo: count(["todo"]),
      overdue: t.filter((x) => x.dueDate && x.column !== "done" && isPast(new Date(x.dueDate)) && !isToday(new Date(x.dueDate))).length,
      byPhase: PHASES.map((p) => {
        const inPhase = t.filter((x) => x.phase === p);
        return { phase: p, total: inPhase.length, done: inPhase.filter((x) => x.column === "done").length };
      }).filter((p) => p.total),
    };
  }, [tasks]);

  const active = TABS.find((x) => x.key === tab)!;
  const { sorted, step } = withSteps(tasks);
  const list = sorted.filter(active.match);
  const grouped = PHASES.map((p) => ({ phase: p, items: list.filter((t) => t.phase === p) })).filter((g) => g.items.length);
  const other = list.filter((t) => !PHASES.includes(t.phase));

  if (!user) return <Skeleton className="mx-auto h-40 max-w-[1180px]" />;

  return (
    <div className="mx-auto max-w-[1180px]">
      <Link href="/team" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
        <ArrowLeft className="size-3.5" /> Team
      </Link>
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <Avatar user={user} size={56} />
        <div className="min-w-[200px] flex-1">
          <h1 className="flex items-center gap-2 font-display text-[clamp(24px,3vw,30px)] font-semibold tracking-[-0.022em]">
            {user.name}
            {user.role === "admin" && <Badge tint="violet">Admin</Badge>}
          </h1>
          <p className="text-[14px] text-ink-3">
            {user.title} · {user.email}
          </p>
        </div>
        <div className="w-full sm:w-64">
          <div className="mb-1.5 flex justify-between text-[12.5px] text-ink-3">
            <span>Overall</span>
            <span className="font-mono tabular-nums">
              {stats.done}/{stats.total}
            </span>
          </div>
          <Progress value={stats.total ? (stats.done / stats.total) * 100 : 0} />
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "To do", value: stats.todo },
          { label: "In progress", value: stats.progress },
          { label: "In review + QA", value: stats.review },
          { label: "Done", value: stats.done },
          { label: "Overdue", value: stats.overdue, warn: stats.overdue > 0 },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-[12.5px] text-ink-3">{s.label}</p>
            <p className={cn("mt-1 font-display text-[26px] font-semibold tabular-nums tracking-[-0.02em]", s.warn && "text-critical")}>{tasks ? s.value : "–"}</p>
          </div>
        ))}
      </section>

      <div className="mb-4 flex gap-4 border-b border-line" role="tablist">
        {(["tasks", "role"] as const).map((v) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn("-mb-px border-b-2 pb-2 text-[13.5px] font-medium", view === v ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink")}>
            {v === "tasks" ? "Tasks" : "Role & responsibilities"}
          </button>
        ))}
      </div>

      {view === "role" ? (
        <section className="card p-6">
          {guide?.markdown ? <Markdown text={guide.markdown} /> : <p className="text-[13.5px] text-ink-3">No role guide found for {user.name}.</p>}
          {guide?.source && <p className="mt-4 font-mono text-[11.5px] text-ink-4">{guide.source}</p>}
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <section className="card min-w-0 p-4">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {TABS.map((x) => {
                const n = (tasks ?? []).filter(x.match).length;
                return (
                  <button key={x.key} onClick={() => setTab(x.key)} className={cn("h-7 rounded-pill px-3 text-[12.5px] font-medium", tab === x.key ? "bg-ink text-paper" : "text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover")}>
                    {x.label} <span className="font-mono opacity-70">{n}</span>
                  </button>
                );
              })}
            </div>
            {!tasks && <Skeleton className="h-64" />}
            {tasks && !list.length && <p className="py-8 text-center text-[13.5px] text-ink-3">Nothing here.</p>}
            {grouped.map((g) => (
              <div key={g.phase} className="mt-3">
                <p className="px-2 py-1 text-[11.5px] font-medium uppercase tracking-wide text-ink-4">
                  {g.phase} · {g.items.length}
                </p>
                <TaskRows tasks={g.items} users={userMap} boards={boardMap} steps={step} />
              </div>
            ))}
            {other.length > 0 && <TaskRows tasks={other} users={userMap} boards={boardMap} steps={step} />}
          </section>
          <div className="min-w-0 space-y-6">
            <section className="card p-5">
              <h2 className="mb-3 text-[15px] font-semibold">Progress by phase</h2>
              <ul className="space-y-3">
                {stats.byPhase.map((p) => (
                  <li key={p.phase}>
                    <div className="mb-1 flex justify-between text-[12.5px]">
                      <span className="font-mono text-ink-2">{p.phase}</span>
                      <span className="font-mono tabular-nums text-ink-3">
                        {p.done}/{p.total}
                      </span>
                    </div>
                    <Progress value={(p.done / p.total) * 100} />
                  </li>
                ))}
              </ul>
            </section>
            <section className="card p-4">
              <h2 className="mb-1 px-1 text-[15px] font-semibold">Recent activity</h2>
              <ActivityFeed items={activity} users={userMap} boards={boardMap} />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
