"use client";

import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckBox } from "@/components/check";
import { Filters } from "@/components/filters";
import { PageHeader } from "@/components/page";
import { Progress, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { api, refresh } from "@/lib/client";
import { useLookups } from "@/lib/maps";
import { type MapFeature, type MapItem, useProductMap } from "@/lib/product";

function chip(f: MapFeature) {
  return f.column === "done" ? "at-green tint" : ["in_progress", "review", "qa"].includes(f.column) ? "at-amber tint" : f.column === "missing" ? "at-red tint" : "bg-sunken text-ink-3";
}

export default function PagesPage() {
  const { data } = useProductMap();
  const { users } = useLookups();
  const [q, setQ] = useState("");
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

  async function toggle(p: MapItem, done: boolean) {
    setBusy(p.id);
    try {
      await api("/api/pages/check", { method: "POST", json: { group: p.group, name: p.name, done } });
      refresh("/api/product-map");
      toast.success(done ? `“${p.name}” marked completed` : `“${p.name}” reopened`);
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
        subtitle="Every MENO screen from PAGES.md. Tick a page when it is built, tested and accepted. The chips show the status of the features behind it."
      />
      <div className="card mb-4 flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-48 flex-1">
          <Progress value={pages.length ? (checked / pages.length) * 100 : 0} />
        </div>
        <span className="font-mono text-[12.5px] tabular-nums text-ink-3">
          {checked}/{pages.length} pages completed
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
                      <CheckBox checked={!!p.checked} disabled={busy === p.id} label={`Mark page ${p.name} completed`} onChange={(v) => toggle(p, v)} />
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
