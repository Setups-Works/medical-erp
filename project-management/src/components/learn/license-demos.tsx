"use client";

import { Check, Copy, KeyRound, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { checkKey, generateKey } from "@/lib/learn/license-key";

const box = "space-y-3 rounded-tile bg-side p-4 print:hidden";
const input =
  "h-10 w-full rounded-ctl bg-raised px-3 font-mono text-[13.5px] tracking-wide shadow-[inset_0_0_0_1px_var(--line-2)] outline-none focus:shadow-[inset_0_0_0_1px_var(--line-3)]";

/** Super-admin side: generate a key. Buyer side: type it and see the instant check. */
export function LicenseKeyDemo() {
  const [key, setKey] = useState("");
  const [typed, setTyped] = useState("");
  const [copied, setCopied] = useState(false);
  const result = typed ? checkKey(typed) : null;

  return (
    <div className={box}>
      <div>
        <p className="mb-1.5 text-[12px] font-medium text-ink-3">1 · Super admin creates a license (the key is shown once)</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setKey(generateKey());
              setCopied(false);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-ctl bg-ink px-3.5 text-[13px] font-medium text-paper"
          >
            <KeyRound className="size-4" /> Generate key
          </button>
          {key && (
            <>
              <code className="inline-flex h-9 items-center rounded-ctl bg-raised px-3 font-mono text-[14px] tracking-wide text-ink shadow-[inset_0_0_0_1px_var(--line-2)]">{key}</code>
              <button
                onClick={() => {
                  void navigator.clipboard?.writeText(key).then(() => setCopied(true), () => setCopied(false));
                  setTyped(key);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-ctl px-3 text-[12.5px] text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover"
              >
                <Copy className="size-3.5" /> {copied ? "Copied, and pasted below" : "Give to buyer"}
              </button>
            </>
          )}
        </div>
        {key && <p className="mt-1.5 text-[12px] text-ink-3">The database stores only HMAC-SHA256(pepper, key) and “…{key.slice(-4)}”.</p>}
      </div>

      <div>
        <p className="mb-1.5 text-[12px] font-medium text-ink-3">2 · Buyer types the key (try a typo: change one character, or swap I for 1)</p>
        <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="MENO-XXXXX-XXXXX-XXXXX-XXXXX" aria-label="License key" className={input} />
        {result && (
          <p className={cn("mt-1.5 flex items-center gap-1.5 text-[13px]", result.ok ? "text-ink" : "text-critical")}>
            {result.ok ? <Check className="size-4" /> : <X className="size-4" />}
            {result.ok ? `Format and check character OK → send ${result.normalised} to POST /api/v1/license/activate` : result.reason}
          </p>
        )}
      </div>
    </div>
  );
}

const STATES = [
  { key: "valid", label: "Valid", tint: "at-green" },
  { key: "expiring", label: "Expiring", tint: "at-amber" },
  { key: "grace", label: "Grace", tint: "at-red" },
  { key: "expired", label: "Expired: restricted mode", tint: "at-red" },
] as const;

/** Move "today" relative to the expiry date and watch the computed state and what is allowed. */
export function LicenseLifecycleDemo() {
  const [daysLeft, setDaysLeft] = useState(20);
  const [grace, setGrace] = useState(15);
  // Same rule as the server: computed from dates, never stored. 30 = first reminder (a setting in MENO).
  const state = daysLeft > 30 ? "valid" : daysLeft >= 0 ? "expiring" : -daysLeft <= grace ? "grace" : "expired";
  const s = STATES.find((x) => x.key === state)!;
  const restricted = state === "expired";
  const rows: [string, boolean][] = [
    ["Sign in, view, reports", true],
    ["Export all data", true],
    ["Record payments received", true],
    ["Sync bills already made offline", true],
    ["New sales and purchases", !restricted],
    ["Add users, branches, devices", !restricted],
  ];

  return (
    <div className={box}>
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-ink-3">
          Today is {daysLeft >= 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} before` : `${-daysLeft} day${daysLeft === -1 ? "" : "s"} after`} the expiry date
        </span>
        <input type="range" min={-40} max={60} value={daysLeft} onChange={(e) => setDaysLeft(Number(e.target.value))} className="w-full accent-[var(--ink)]" aria-label="Days until expiry" />
      </label>
      <label className="flex items-center gap-2 text-[12.5px] text-ink-2">
        Grace days on this plan
        <input
          inputMode="numeric"
          value={grace}
          onChange={(e) => setGrace(Math.max(0, Math.min(60, Number(e.target.value.replace(/\D/g, "")) || 0)))}
          className="h-8 w-16 rounded-ctl bg-raised px-2 font-mono text-[13px] shadow-[inset_0_0_0_1px_var(--line-2)] outline-none"
          aria-label="Grace days"
        />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {STATES.map((x) => (
          <span key={x.key} className={cn("rounded-pill px-2.5 py-1 text-[12px] font-semibold", x.key === state ? `tint ${x.tint}` : "text-ink-4 shadow-[inset_0_0_0_1px_var(--line)]")}>
            {x.label}
          </span>
        ))}
      </div>
      <p className="text-[13px] text-ink-2">
        {state === "valid" && "Normal. No banner."}
        {state === "expiring" && `Banner: “Your MENO license ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.” Reminder emails at 30 / 15 / 7 / 1 days.`}
        {state === "grace" && `Red banner: “Your license has ended. Renew within ${grace + daysLeft} day${grace + daysLeft === 1 ? "" : "s"} to keep billing.” Everything still works.`}
        {state === "expired" && `${s.label}. Computed from dates: nothing in the database changed.`}
      </p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {rows.map(([label, ok]) => (
          <p key={label} className="flex items-center gap-1.5 text-[13px]">
            {ok ? <Check className="size-4 text-ink" /> : <X className="size-4 text-critical" />}
            <span className={ok ? "text-ink-2" : "text-critical"}>{label}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
