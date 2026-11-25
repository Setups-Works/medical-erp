"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { PartyStep } from "./erp-demo-masters";
import { box } from "./erp-demo-kit";

/*
 * Day 22 live demo (PTY-15 / INT-17): the full supplier and customer forms from the Day 21 walkthrough, in live
 * mode. Fetch calls the real GST verify service through the Hub proxy (/api/learn/gst), never directly.
 */

const SAMPLES = [
  { gstin: "33AAJCN0778N1ZZ", note: "real GSTIN, Tamil Nadu" },
  { gstin: "33AAJCN0778N1ZA", note: "wrong check character: stopped before any API call" },
  { gstin: "99AAJCN0778N1ZZ", note: "unknown state code" },
];

export function GstFetchDemo() {
  const [role, setRole] = useState<"supplier" | "customer">("supplier");
  return (
    <div className="space-y-3">
      <div className={cn(box, "flex flex-wrap items-center gap-3")}>
        <span className="text-[12.5px] font-medium text-ink-3">Form</span>
        <div className="flex gap-1" role="tablist">
          {(["supplier", "customer"] as const).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={role === r}
              onClick={() => setRole(r)}
              className={cn("h-8 rounded-ctl px-3 text-[12.5px] capitalize", role === r ? "bg-ink text-paper" : "bg-raised text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover")}
            >
              New {r}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-ink-4">Type a GSTIN in the GSTIN field and press Fetch. Try:</span>
        <ul className="flex flex-wrap gap-1.5">
          {SAMPLES.map((s) => (
            <li key={s.gstin} className="rounded-pill bg-raised px-2 py-0.5 text-[11.5px] text-ink-3 shadow-[inset_0_0_0_1px_var(--line)]">
              <span className="font-mono text-ink">{s.gstin}</span> · {s.note}
            </li>
          ))}
        </ul>
      </div>
      {/* key: switching the form starts it empty again */}
      <PartyStep key={role} role={role} live />
    </div>
  );
}
