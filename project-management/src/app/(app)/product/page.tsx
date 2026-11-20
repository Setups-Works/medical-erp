"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { PageHeader } from "@/components/page";
import { Badge, Progress, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { api } from "@/lib/client";

type Feature = { id: string; taskId: string | null; boardId: string | null; column: string; number: number | null; phase: string };
type Item = { id: string; group: string; name: string; route: string; edition: string; notes: string; features: Feature[]; done: number; started: number; total: number; phase: string };

function status(i: Item) {
  if (i.total && i.done === i.total) return { label: "Live", tint: "green" as const };
  if (i.done || i.started) return { label: "Building", tint: "amber" as const };
  return { label: `Planned ${i.phase}`, tint: "slate" as const };
}

function FeatureChip({ f }: { f: Feature }) {
  const tone = f.column === "done" ? "at-green tint" : ["in_progress", "review", "qa"].includes(f.column) ? "at-amber tint" : f.column === "missing" ? "at-red tint" : "bg-sunken text-ink-3";
  const chip = <span className={cn("rounded-xs px-1.5 py-px font-mono text-[11px]", tone)}>{f.id}</span>;
  return f.taskId ? (
    <Link href={`/boards/${f.boardId}?task=${f.taskId}`} title={`#${f.number} · ${f.column.replace("_", " ")}`} className="hover:opacity-80">
      {chip}
    </Link>
  ) : (
    chip
  );
}

export default function ProductMapPage() {
  const { data } = useSWR<{ menu: Item[]; capabilities: Item[] }>("/api/product-map", (u: string) => api<{ menu: Item[]; capabilities: Item[] }>(u));
  const [view, setView] = useState<"menu" | "capabilities">("menu");
  const all = data ? [...data.menu] : [];
  const live = all.filter((i) => i.total && i.done === i.total).length;
  const groups = data ? [...new Set(data.menu.map((i) => i.group))] : [];

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Product map"
        subtitle="MENO’s app sidebar and capabilities, with live delivery status. An item goes Live when every feature behind it is Done."
      />
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex gap-4 border-b border-line" role="tablist">
          {(["menu", "capabilities"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn("-mb-px border-b-2 pb-2 text-[13.5px] font-medium", view === v ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink")}>
              {v === "menu" ? "App sidebar" : "Capabilities"}
            </button>
          ))}
        </div>
        {data && (
          <span className="ml-auto font-mono text-[12.5px] text-ink-3">
            {live}/{all.length} menu items live
          </span>
        )}
      </div>
      <p className="mb-4 flex flex-wrap items-center gap-3 text-[12px] text-ink-3">
        <span className="at-green tint rounded-xs px-1.5 font-mono">ID</span> done
        <span className="at-amber tint rounded-xs px-1.5 font-mono">ID</span> in progress
        <span className="rounded-xs bg-sunken px-1.5 font-mono">ID</span> not started · click a feature to open its task
      </p>

      {!data && <Skeleton className="h-96" />}

      {data && view === "menu" && (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g) => {
            const items = data.menu.filter((i) => i.group === g);
            const done = items.reduce((s, i) => s + i.done, 0);
            const total = items.reduce((s, i) => s + i.total, 0);
            return (
              <section key={g} className="card p-4">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">{g}</h2>
                  <span className="font-mono text-[11.5px] text-ink-4">
                    {done}/{total} features
                  </span>
                </div>
                <ul className="divide-y divide-line">
                  {items.map((i) => {
                    const s = status(i);
                    return (
                      <li key={i.id} className="px-1 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13.5px] font-medium text-ink">{i.name}</span>
                          {i.edition !== "B" && <Badge tint={i.edition === "W" ? "blue" : "green"}>{i.edition === "W" ? "Wholesale" : "Retail"}</Badge>}
                          <Badge tint={s.tint} className="ml-auto">
                            {s.label}
                          </Badge>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          <span className="mr-1 font-mono text-[11px] text-ink-4">{i.route}</span>
                          {i.features.map((f) => (
                            <FeatureChip key={f.id} f={f} />
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {data && view === "capabilities" && (
        <section className="card divide-y divide-line">
          {data.capabilities.map((i) => {
            const s = status(i);
            return (
              <div key={i.id} className="grid gap-2 px-5 py-4 md:grid-cols-[220px_1fr_160px] md:items-center">
                <div>
                  <p className="text-[14px] font-medium">{i.name}</p>
                  <p className="text-[12px] text-ink-3">{i.notes}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {i.features.map((f) => (
                    <FeatureChip key={f.id} f={f} />
                  ))}
                </div>
                <div>
                  <div className="mb-1 flex justify-between">
                    <Badge tint={s.tint}>{s.label}</Badge>
                    <span className="font-mono text-[12px] text-ink-3">
                      {i.done}/{i.total}
                    </span>
                  </div>
                  <Progress value={i.total ? (i.done / i.total) * 100 : 0} />
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
