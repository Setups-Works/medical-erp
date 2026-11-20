"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "./ui";

const PHASES = ["P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7"];

export function Filters({
  q,
  setQ,
  phase,
  setPhase,
  owner,
  setOwner,
  status,
  setStatus,
  users,
}: {
  q: string;
  setQ: (v: string) => void;
  phase: string;
  setPhase: (v: string) => void;
  owner: string;
  setOwner: (v: string) => void;
  status: "all" | "open" | "done";
  setStatus: (v: "all" | "open" | "done") => void;
  users: { id: string; name: string }[];
}) {
  const pill = (active: boolean) => cn("h-7 rounded-pill px-3 text-[12.5px] font-medium", active ? "bg-ink text-paper" : "text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover");
  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-72">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-ink-4" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or ID" className="h-8 pl-8 text-[13px]" />
        </div>
        {(["all", "open", "done"] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={pill(status === s)}>
            {s === "all" ? "All" : s === "open" ? "Not done" : "Done"}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button onClick={() => setPhase("")} className={pill(!phase)}>
          All phases
        </button>
        {PHASES.map((p) => (
          <button key={p} onClick={() => setPhase(phase === p ? "" : p)} className={pill(phase === p)}>
            {p}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-line-2" />
        <button onClick={() => setOwner("")} className={pill(!owner)}>
          Everyone
        </button>
        {users.map((u) => (
          <button key={u.id} onClick={() => setOwner(owner === u.id ? "" : u.id)} className={pill(owner === u.id)}>
            {u.name}
          </button>
        ))}
      </div>
    </div>
  );
}
