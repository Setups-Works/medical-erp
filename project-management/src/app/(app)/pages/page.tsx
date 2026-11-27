"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { Check, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckBox } from "@/components/check";
import { Filters } from "@/components/filters";
import { PageHeader } from "@/components/page";
import { Progress, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { api, refresh } from "@/lib/client";
import { useLookups } from "@/lib/maps";
import { COLUMN_LABEL, type MapFeature, type MapItem, type PageStage, useProductMap } from "@/lib/product";

const STAGES: { key: PageStage; label: string; long: string }[] = [
  { key: "be", label: "BE ready", long: "Backend endpoints ready" },
  { key: "fe", label: "FE ready", long: "Frontend screen ready" },
  { key: "qa", label: "QA passed", long: "QA passed" },
];

function chip(f: Pick<MapFeature, "column">) {
  return f.column === "done" ? "at-green tint" : ["in_progress", "review", "qa"].includes(f.column) ? "at-amber tint" : f.column === "missing" ? "at-red tint" : "bg-sunken text-ink-3";
}

export default function PagesPage() {
  const { data } = useProductMap();
  const { users } = useLookups();
  const [q, setQ] = useState("");
  // Task badges link here with ?q=<feature id or route>; read it after mount (static export, no Suspense needed).
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQ(initial);
  }, []);
  const [phase, setPhase] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<"all" | "open" | "done">("all");
  const [busy, setBusy] = useState<string | null>(null);

  const pages = useMemo(() => data?.pages ?? [], [data]);
  const ownerName = users?.find((u) => u.id === owner)?.name;
  const filtered = useMemo(
    () =>
      pages.filter((p) => {
        const text = q.trim().toLowerCase();
        return (
          (!text || p.name.toLowerCase().includes(text) || p.route.toLowerCase().includes(text) || p.notes.toLowerCase().includes(text)) &&
          (!phase || p.meta.phase === phase) &&
          (!ownerName || p.meta.backend === ownerName || p.meta.frontend === ownerName) &&
          (status === "all" || (status === "done" ? p.checked : !p.checked))
        );
      }),
    [pages, q, phase, ownerName, status],
  );
  const groups = [...new Set(filtered.map((p) => p.group))];
  const checked = pages.filter((p) => p.checked).length;

  const stageCount = (k: PageStage) => pages.filter((p) => p.stages?.[k]?.done).length;

  async function toggle(p: MapItem, done: boolean, stage: "done" | PageStage = "done") {
    setBusy(`${p.id}:${stage}`);
    try {
      await api("/api/pages/check", { method: "POST", json: { group: p.group, name: p.name, stage, done } });
      refresh("/api/product-map");
      const what = stage === "done" ? "completed" : STAGES.find((x) => x.key === stage)!.long.toLowerCase();
      toast.success(done ? `“${p.name}”: ${what}` : `“${p.name}”: ${stage === "done" ? "reopened" : `${what} unticked`}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function startPage(p: MapItem) {
    setBusy(`${p.id}:start`);
    try {
      const t = await api<{ be: number; fe: number }>("/api/pages/task", { method: "POST", json: { group: p.group, name: p.name } });
      refresh("/api/product-map", "/api/tasks", "/api/boards");
      toast.success(`“${p.name}” is yours: BE #${t.be} · FE #${t.fe}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Pages"
        subtitle="Every MENO screen from PAGES.md. Tick BE when its endpoints are in meno-api, FE when the screen is wired to them, QA when it passes test. Tick the page when it is accepted. The chips show the status of the features behind it."
      />
      <div className="card mb-4 flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-48 flex-1">
          <Progress value={pages.length ? (checked / pages.length) * 100 : 0} />
        </div>
        <span className="font-mono text-[12.5px] tabular-nums text-ink-3">
          {checked}/{pages.length} pages completed
        </span>
        <span className="w-full font-mono text-[12px] tabular-nums text-ink-3">
          {STAGES.map((st) => `${st.label} ${stageCount(st.key)}/${pages.length}`).join(" · ")}
        </span>
      </div>
      <Filters q={q} setQ={setQ} phase={phase} setPhase={setPhase} owner={owner} setOwner={setOwner} status={status} setStatus={setStatus} users={users ?? []} />
      {!data && <Skeleton className="h-96" />}
      {data && !filtered.length && <p className="py-10 text-center text-[13.5px] text-ink-3">No pages match these filters.</p>}
      <div className="space-y-4">
        {groups.map((g) => {
          const rows = filtered.filter((p) => p.group === g);
          const done = rows.filter((p) => p.checked).length;
          return (
            <section key={g} className="card overflow-hidden">
              <header className="flex items-center gap-3 border-b border-line bg-side px-4 py-2.5">
                <h2 className="flex-1 text-[13px] font-semibold">{g}</h2>
                <span className="font-mono text-[12px] tabular-nums text-ink-3">
                  {done}/{rows.length}
                </span>
              </header>
              <ul className="divide-y divide-line">
                {rows.map((p) => (
                  <li key={p.id} className={cn("flex items-start gap-3 px-4 py-3", p.checked && "bg-[color-mix(in_srgb,var(--success)_5%,transparent)]")}>
                    <span className="pt-0.5">
                      <CheckBox checked={!!p.checked} disabled={busy === `${p.id}:done`} label={`Mark page ${p.name} completed`} onChange={(v) => toggle(p, v)} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className={cn("text-[13.5px] font-medium", p.checked && "text-ink-3 line-through decoration-ink-4")}>{p.name}</span>
                        <code className="font-mono text-[11.5px] text-ink-4">{p.route}</code>
                      </div>
                      <p className="mt-0.5 text-[12.5px] text-ink-3">{p.notes}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {p.features.map((f) =>
                          f.taskId ? (
                            <Link key={f.id} href={`/boards/${f.boardId}?task=${f.taskId}`} className={cn("rounded-xs px-1.5 py-px font-mono text-[11px] hover:opacity-80", chip(f))} title={f.column}>
                              {f.id}
                            </Link>
                          ) : (
                            <span key={f.id} className={cn("rounded-xs px-1.5 py-px font-mono text-[11px]", chip(f))}>
                              {f.id}
                            </span>
                          ),
                        )}
                        <span className="ml-1 font-mono text-[11px] text-ink-4">
                          {p.done}/{p.total} features done
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {STAGES.map((st) => {
                          const t = p.stages?.[st.key];
                          const on = !!t?.done;
                          return (
                            <button
                              key={st.key}
                              type="button"
                              role="checkbox"
                              aria-checked={on}
                              aria-label={`${st.long}: ${p.name}`}
                              disabled={busy === `${p.id}:${st.key}`}
                              onClick={() => toggle(p, !on, st.key)}
                              title={on ? `${st.long}${t?.by ? ` · ${t.by}` : ""}${t?.at ? ` · ${formatDistanceToNowStrict(new Date(t.at))} ago` : ""}` : `Mark: ${st.long.toLowerCase()}`}
                              className={cn(
                                "inline-flex h-6 items-center gap-1.5 rounded-pill pl-1.5 pr-2.5 text-[11.5px] font-medium transition-colors duration-150 disabled:opacity-50",
                                on ? "at-green tint" : "text-ink-3 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover",
                              )}
                            >
                              <span className={cn("grid size-3.5 place-items-center rounded-xs", on ? "bg-success text-paper" : "shadow-[inset_0_0_0_1.5px_var(--line-3)]")}>
                                {on && <Check className="size-2.5" strokeWidth={3.5} />}
                              </span>
                              {st.label}
                            </button>
                          );
                        })}
                        <span className="mx-1 h-4 w-px bg-line-2" />
                        {(["be", "fe"] as const).map((side) => {
                          const t = p.tasks?.[side];
                          if (!t) return null;
                          return (
                            <Link
                              key={side}
                              href={`/boards/${t.boardId}?task=${t.taskId}`}
                              title={`${side === "be" ? "Backend" : "Frontend"} task · ${COLUMN_LABEL[t.column] ?? t.column}${t.assignee ? ` · ${t.assignee}` : ""}`}
                              className={cn("inline-flex h-6 items-center gap-1 rounded-pill px-2.5 font-mono text-[11.5px] hover:opacity-80", chip(t))}
                            >
                              {side === "be" ? "BE" : "FE"} #{t.number}
                              <span className="font-sans text-[11px] opacity-80">
                                · {COLUMN_LABEL[t.column] ?? t.column}
                                {t.assignee ? ` · ${t.assignee}` : ""}
                              </span>
                            </Link>
                          );
                        })}
                        {(!p.tasks?.be || !p.tasks?.fe) && (
                          <button
                            type="button"
                            disabled={busy === `${p.id}:start`}
                            onClick={() => startPage(p)}
                            title="Take this page: creates its Backend and Frontend tasks, assigned to you"
                            aria-label={`Start page ${p.name}`}
                            className="inline-flex h-6 items-center gap-1 rounded-pill px-2.5 text-[11.5px] font-medium text-ink-3 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover disabled:opacity-50"
                          >
                            <Play className="size-3" />
                            {p.tasks?.be || p.tasks?.fe ? "Create missing task" : "Start page"}
                          </button>
                        )}
                      </div>
                      {p.checked && p.checkedBy && (
                        <p className="mt-1 text-[11.5px] text-success">
                          Completed by {p.checkedBy}
                          {p.checkedAt ? ` · ${formatDistanceToNowStrict(new Date(p.checkedAt))} ago` : ""}
                        </p>
                      )}
                    </div>
                    <div className="hidden w-44 shrink-0 text-right text-[12px] text-ink-3 md:block">
                      <p className="font-mono">{String(p.meta.phase)}</p>
                      <p>
                        BE {String(p.meta.backend)} · FE {String(p.meta.frontend)}
                        {p.meta.qa ? ` · QA ${String(p.meta.qa)}` : ""}
                      </p>
                      <p className="truncate text-ink-4" title={String(p.meta.roles)}>
                        {String(p.meta.roles)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
