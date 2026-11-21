"use client";

import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { LessonContent } from "@/components/learn/lesson-view";
import { Button } from "@/components/ui";
import { LESSONS, MODULES } from "@/lib/learn/course";

/** Whole course on one page so the browser's "Save as PDF" produces a single handbook. */
export default function LearnPrintPage() {
  return (
    <div>
      <div className="mx-auto mb-6 flex max-w-[880px] flex-wrap items-center gap-2 print:hidden">
        <Link href="/learn" className="flex items-center gap-1 text-[13px] text-ink-3 hover:text-ink">
          <ArrowLeft className="size-3.5" />
          All lessons
        </Link>
        <div className="flex-1" />
        <p className="text-[12.5px] text-ink-3">In the print dialog choose “Save as PDF”, A4, and turn on background graphics.</p>
        <Button variant="primary" onClick={() => window.print()}>
          <Download className="size-3.5" />
          Download PDF
        </Button>
      </div>

      <div className="mx-auto max-w-[880px]">
        <p className="font-brand text-[44px] leading-none tracking-[-0.02em]">MENO</p>
        <h1 className="mt-3 font-display text-[30px] font-semibold tracking-[-0.022em]">Developer course: pharmacy ERP from the counter to the books</h1>
        <p className="mt-2 text-[15px] text-ink-2">
          {LESSONS.length} lessons · one per day · worked invoices, ledgers and GST calculations. Examples use a made-up shop and illustrative GST rates; the rules come from the MENO docs.
        </p>
        <h2 className="mt-8 mb-3 text-[13px] font-medium uppercase tracking-wide text-ink-4">Contents</h2>
        <ol className="space-y-3">
          {MODULES.map((mod) => (
            <li key={mod}>
              <p className="text-[13.5px] font-semibold">Module {mod}</p>
              <ul className="mt-1 space-y-0.5">
                {LESSONS.filter((l) => l.module === mod).map((l) => (
                  <li key={l.slug} className="flex gap-3 text-[13.5px] text-ink-2">
                    <span className="w-12 shrink-0 font-mono text-ink-4">Day {l.day}</span>
                    {l.title}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      {LESSONS.map((l) => (
        <div key={l.slug} className="mt-16 border-t border-line pt-10 print:mt-0 print:border-0 print:pt-0">
          <LessonContent lesson={l} printMode />
        </div>
      ))}
    </div>
  );
}
