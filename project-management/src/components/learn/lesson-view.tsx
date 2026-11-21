"use client";

import { ArrowLeft, ArrowRight, Check, Clock, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { LESSONS, type LessonMeta } from "@/lib/learn/course";
import { Button } from "../ui";
import { FeatureCatalogue } from "./lessons/catalogue";
import { Architecture, DataRules, TenancySecurity } from "./lessons/build";
import { HowWeWork, OfflineSync } from "./lessons/delivery";
import { Accounting, GstCompliance } from "./lessons/finance";
import { Masters } from "./lessons/masters";
import { GstCalculations } from "./lessons/maths";
import { Inventory, Purchase, RetailBilling, Returns, WholesaleBilling } from "./lessons/operations";
import { PharmacyBasics, WhatIsMeno } from "./lessons/product";

const BODIES: Record<string, () => React.ReactNode> = {
  "what-is-meno": WhatIsMeno,
  "pharmacy-basics": PharmacyBasics,
  architecture: Architecture,
  "tenancy-security": TenancySecurity,
  "data-rules": DataRules,
  masters: Masters,
  "gst-calculations": GstCalculations,
  purchase: Purchase,
  inventory: Inventory,
  "retail-billing": RetailBilling,
  "wholesale-billing": WholesaleBilling,
  returns: Returns,
  accounting: Accounting,
  "gst-compliance": GstCompliance,
  "offline-sync": OfflineSync,
  "how-we-work": HowWeWork,
  "feature-catalogue": FeatureCatalogue,
};

/* "Taught" ticks are a per-viewer convenience, so browser storage is enough (and optional). */
const KEY = "hub-learn-taught";
export function readTaught(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}
function writeTaught(v: Record<string, string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* storage unavailable: ticks just won't persist */
  }
}

export function useTaught() {
  const [taught, setTaught] = useState<Record<string, string>>({});
  useEffect(() => setTaught(readTaught()), []);
  const toggle = (slug: string) =>
    setTaught((t) => {
      const next = { ...t };
      if (next[slug]) delete next[slug];
      else next[slug] = new Date().toISOString().slice(0, 10);
      writeTaught(next);
      return next;
    });
  return { taught, toggle };
}

/** Title block + goals + body; used on the lesson page and in the full-course print. */
export function LessonContent({ lesson, printMode }: { lesson: LessonMeta; printMode?: boolean }) {
  const Body = BODIES[lesson.slug];
  return (
    <article className={cn("mx-auto max-w-[880px]", printMode && "lesson-break")}>
      <header className="mb-7 border-b border-line pb-6">
        <p className="mb-2 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
          <span className="at-violet tint rounded-xs px-1.5 py-px font-medium">Day {lesson.day}</span>
          <span>Module {lesson.module}</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {lesson.minutes} min
          </span>
        </p>
        <h1 className="font-display text-[clamp(26px,3vw,34px)] font-semibold leading-[1.1] tracking-[-0.022em]">{lesson.title}</h1>
        <p className="mt-2 text-[15px] text-ink-2">{lesson.summary}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-tile bg-side px-4 py-3">
            <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-4">By the end you can</p>
            <ul className="space-y-1 text-[13.5px] text-ink-2">
              {lesson.goals.map((g) => (
                <li key={g} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-tile bg-side px-4 py-3">
            <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-4">Based on (read before class)</p>
            <ul className="space-y-1 text-[13px] text-ink-2">
              {lesson.sources.map((s) => (
                <li key={s} className="flex gap-2">
                  <FileText className="mt-0.5 size-3.5 shrink-0 text-ink-4" />
                  <span className="font-mono text-[12px]">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>
      {Body ? <Body /> : <p className="text-ink-3">This lesson is being written.</p>}
    </article>
  );
}

export function LessonView({ lesson }: { lesson: LessonMeta }) {
  const { taught, toggle } = useTaught();
  const i = LESSONS.findIndex((l) => l.slug === lesson.slug);
  const prev = LESSONS[i - 1];
  const next = LESSONS[i + 1];
  return (
    <div>
      <div className="mx-auto mb-5 flex max-w-[880px] flex-wrap items-center gap-2 print:hidden">
        <Link href="/learn" className="flex items-center gap-1 text-[13px] text-ink-3 hover:text-ink">
          <ArrowLeft className="size-3.5" />
          All lessons
        </Link>
        <div className="flex-1" />
        <Button variant={taught[lesson.slug] ? "secondary" : "ghost"} onClick={() => toggle(lesson.slug)}>
          <Check className="size-3.5" />
          {taught[lesson.slug] ? `Taught ${taught[lesson.slug]}` : "Mark as taught"}
        </Button>
        <Button variant="primary" onClick={() => window.print()}>
          <Download className="size-3.5" />
          Download PDF
        </Button>
      </div>
      <LessonContent lesson={lesson} />
      <nav className="mx-auto mt-12 grid max-w-[880px] gap-3 border-t border-line pt-5 sm:grid-cols-2 print:hidden">
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="rounded-tile px-4 py-3 shadow-[inset_0_0_0_1px_var(--line)] hover:bg-hover">
            <p className="text-[12px] text-ink-4">← Day {prev.day}</p>
            <p className="text-[14px] font-medium">{prev.title}</p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/learn/${next.slug}`} className="rounded-tile px-4 py-3 text-right shadow-[inset_0_0_0_1px_var(--line)] hover:bg-hover">
            <p className="flex items-center justify-end gap-1 text-[12px] text-ink-4">
              Day {next.day} <ArrowRight className="size-3" />
            </p>
            <p className="text-[14px] font-medium">{next.title}</p>
          </Link>
        )}
      </nav>
    </div>
  );
}
