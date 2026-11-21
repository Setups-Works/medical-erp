"use client";

import { Check, Clock, Download } from "lucide-react";
import Link from "next/link";
import { useTaught } from "@/components/learn/lesson-view";
import { PageHeader } from "@/components/page";
import { Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import { LESSONS, MODULES } from "@/lib/learn/course";

export default function LearnPage() {
  const { taught } = useTaught();
  const count = LESSONS.filter((l) => taught[l.slug]).length;
  const next = LESSONS.find((l) => !taught[l.slug]);
  return (
    <div className="mx-auto max-w-[1040px]">
      <PageHeader
        title="Learn MENO"
        subtitle="A daily course on the product, pharmacy billing, architecture, calculations and workflows, with worked invoices and ledgers. One lesson per day."
        actions={
          <Link href="/learn/print" className="flex h-8 items-center gap-1.5 rounded-ctl bg-ink px-3 text-[13px] font-medium text-paper hover:opacity-90">
            <Download className="size-3.5" />
            Full course PDF
          </Link>
        }
      />

      <div className="card mb-7 flex flex-wrap items-center gap-4 px-5 py-4">
        <div className="min-w-[200px] flex-1">
          <p className="mb-1.5 text-[13px] text-ink-3">
            <span className="font-mono tabular-nums text-ink">
              {count}/{LESSONS.length}
            </span>{" "}
            lessons taught (on this browser)
          </p>
          <Progress value={(count / LESSONS.length) * 100} />
        </div>
        {next && (
          <Link href={`/learn/${next.slug}`} className="rounded-ctl px-3 py-2 text-[13px] shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover">
            Next: <span className="font-medium">Day {next.day} · {next.title}</span>
          </Link>
        )}
      </div>

      <div className="space-y-8">
        {MODULES.map((mod) => (
          <section key={mod}>
            <h2 className="mb-3 text-[12px] font-medium uppercase tracking-wide text-ink-4">Module {mod}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {LESSONS.filter((l) => l.module === mod).map((l) => (
                <Link key={l.slug} href={`/learn/${l.slug}`} className="card group flex flex-col gap-1.5 px-4 py-3.5 transition-shadow hover:shadow-[inset_0_0_0_1px_var(--line-3)]">
                  <div className="flex items-center gap-2 text-[12px] text-ink-3">
                    <span className={cn("rounded-xs px-1.5 py-px font-medium", taught[l.slug] ? "at-green tint" : "at-violet tint")}>Day {l.day}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {l.minutes} min
                    </span>
                    {taught[l.slug] && (
                      <span className="ml-auto flex items-center gap-1 text-success">
                        <Check className="size-3.5" />
                        Taught {taught[l.slug]}
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] font-semibold leading-snug group-hover:underline">{l.title}</p>
                  <p className="text-[13px] leading-snug text-ink-3">{l.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
