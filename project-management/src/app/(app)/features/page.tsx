"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckBox } from "@/components/check";
import { Filters } from "@/components/filters";
import { PageHeader } from "@/components/page";
import { AvatarStack, Badge, Progress, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { api, refresh } from "@/lib/client";
import { useLookups } from "@/lib/maps";
import { COLUMN_LABEL, COLUMN_TINT, useProductMap } from "@/lib/product";

const PRIORITY: Record<string, { label: string; tint: "red" | "amber" | "slate" }> = { M: { label: "Must", tint: "red" }, S: { label: "Should", tint: "amber" }, C: { label: "Could", tint: "slate" } };
const EDITION: Record<string, string> = { R: "Retail", W: "Wholesale", B: "Both" };

export default function FeaturesPage() {
  const { data } = useProductMap();
  const { users, userMap } = useLookups();
  const [q, setQ] = useState("");
  const [phase, setPhase] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<"all" | "open" | "done">("all");
  const [busy, setBusy] = useState<string | null>(null);

  const features = data?.features ?? [];
  const filtered = useMemo(
    () =>
      features.filter((f) => {
        const t = f.features[0];
        const text = q.trim().toLowerCase();
        return (
          (!text || f.name.toLowerCase().includes(text) || t?.id.toLowerCase().includes(text)) &&
          (!phase || f.meta.phase === phase) &&
          (!owner || t?.assignees.includes(owner)) &&
          (status === "all" || (status === "done" ? t?.column === "done" : t?.column !== "done"))
        );
      }),
    [features, q, phase, owner, status],
  );
  const groups = [...new Set(filtered.map((f) => f.group))];
  const doneAll = features.filter((f) => f.features[0]?.column === "done").length;

  async function toggle(taskId: string | null, done: boolean, label: string) {
    if (!taskId) return toast.error("This feature has no task yet. Run the import.");
    setBusy(taskId);
    try {
      await api(`/api/tasks/${taskId}`, { method: "PATCH", json: { column: done ? "done" : "todo", order: Date.now() } });
      refresh("/api/product-map", "/api/stats", "/api/users");
      toast.success(done ? `${label} marked done` : `${label} reopened`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader title="Features" subtitle="Every MENO feature from FEATURES.md. Tick a feature when it is built, tested and accepted: its task moves to Done for everyone." />
      <div className="card mb-4 flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-48 flex-1">
          <Progress value={features.length ? (doneAll / features.length) * 100 : 0} />
        </div>
        <span className="font-mono text-[12.5px] tabular-nums text-ink-3">
          {doneAll}/{features.length} features done
        </span>
      </div>
      <Filters q={q} setQ={setQ} phase={phase} setPhase={setPhase} owner={owner} setOwner={setOwner} status={status} setStatus={setStatus} users={users ?? []} />
      {!data && <Skeleton className="h-96" />}
      {data && !filtered.length && <p className="py-10 text-center text-[13.5px] text-ink-3">No features match these filters.</p>}
      <div className="space-y-4">
        {groups.map((g) => {
          const rows = filtered.filter((f) => f.group === g);
          const done = rows.filter((f) => f.features[0]?.column === "done").length;
          return (
            <section key={g} className="card overflow-hidden">
              <header className="flex items-center gap-3 border-b border-line bg-side px-4 py-2.5">
                <h2 className="flex-1 text-[13px] font-semibold">{g}</h2>
                <span className="font-mono text-[12px] tabular-nums text-ink-3">
                  {done}/{rows.length}
                </span>
              </header>
              <ul className="divide-y divide-line">
                {rows.map((f) => {
                  const t = f.features[0];
                  const isDone = t?.column === "done";
                  const pr = PRIORITY[String(f.meta.priority)] ?? PRIORITY.S;
                  return (
                    <li key={f.id} className={cn("flex items-center gap-3 px-4 py-2.5", isDone && "bg-[color-mix(in_srgb,var(--success)_5%,transparent)]")}>
                      <CheckBox checked={isDone} disabled={busy === t?.taskId} label={`Mark ${t?.id} done`} onChange={(v) => toggle(t?.taskId ?? null, v, t?.id ?? "")} />
                      <span className="w-14 shrink-0 font-mono text-[12px] text-ink-3">{t?.id}</span>
                      <span className={cn("min-w-0 flex-1 text-[13.5px]", isDone && "text-ink-3 line-through decoration-ink-4")}>
                        {f.name}
                        {f.meta.verify ? <Badge tint="amber" className="ml-2">Verify rule</Badge> : null}
                      </span>
                      <span className="hidden w-16 font-mono text-[12px] text-ink-3 sm:block">{String(f.meta.phase)}</span>
                      <span className="hidden w-20 md:block">
                        <Badge tint={pr.tint}>{pr.label}</Badge>
                      </span>
                      <span className="hidden w-20 text-[12px] text-ink-3 lg:block">{EDITION[f.edition] ?? f.edition}</span>
                      <span className="hidden w-24 lg:block">
                        <Badge tint={COLUMN_TINT[t?.column ?? "missing"]}>{COLUMN_LABEL[t?.column ?? "missing"]}</Badge>
                      </span>
                      <span className="w-20">
                        <AvatarStack users={(t?.assignees ?? []).map((a) => userMap.get(a))} size={20} max={3} />
                      </span>
                      {t?.taskId && (
                        <Link href={`/boards/${t.boardId}?task=${t.taskId}`} aria-label={`Open ${t.id} task`} className="text-ink-4 hover:text-ink">
                          <ExternalLink className="size-3.5" />
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
