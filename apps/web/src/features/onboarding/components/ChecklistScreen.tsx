"use client";

import Link from "next/link";
import { Badge, Button, Callout, Card, Icon, PageHeader, Progress, Skeleton, cn } from "@meno/ui";
import { landingPath } from "@/features/auth/utils";
import { problemMessage } from "@/lib/problem";
import { useChecklist } from "../queries";
import { progress, stepCopy, stepState, withSlash } from "../utils";
import { LaterBadge } from "./OnboardingShell";

/** /onboarding (AUT-03, AUT-15): every step with its status; resume lands on the next step. */
export function ChecklistScreen() {
  const checklist = useChecklist();
  const { done, total } = progress(checklist.data);

  return (
    <>
      <PageHeader
        eyebrow="Set-up"
        title={checklist.data?.live ? "You're live" : "Set up your pharmacy"}
        description="Each step saves when you press Save. Close the tab any time and continue later from here."
        actions={
          checklist.data && !checklist.data.live ? (
            <Link href={landingPath(checklist.data)} className="inline-flex h-8 items-center gap-1.5 rounded-ctl bg-ink px-3 text-[13px] font-medium text-paper hover:opacity-90 pointer-coarse:h-10" data-testid="checklist-resume">
              {done === 0 ? "Start" : "Continue"}
              <Icon name="arrow-right" />
            </Link>
          ) : undefined
        }
      />
      {checklist.isError && (
        <Callout tone="critical" action={<Button variant="outline" size="sm" onClick={() => checklist.refetch()}>Try again</Button>}>
          {problemMessage(checklist.error, "Couldn't load your set-up.")}
        </Callout>
      )}
      {checklist.isPending && <Skeleton className="h-80" />}
      {checklist.data && (
        <>
          <Card className="mb-4 flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[13.5px] font-medium text-ink">Required steps</span>
              <span className="font-mono text-[13px] text-ink-2 tabular-nums">
                {done} of {total} done
              </span>
            </div>
            <Progress value={done} max={Math.max(total, 1)} label="Required steps done" />
          </Card>
          <Card className="p-0 sm:p-0">
            <ol className="divide-y divide-line">
              {checklist.data.steps?.map((s, i) => {
                const state = stepState(s);
                const copy = stepCopy(s.code);
                return (
                  <li key={s.code}>
                    <Link
                      href={withSlash(s.route ?? "/onboarding")}
                      className={cn("flex items-center gap-3 px-4 py-3 hover:bg-hover sm:px-5", state === "later" && "opacity-70")}
                      data-testid={`checklist-step-${s.code}`}
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-tab bg-sunken text-ink-3">
                        <Icon name={copy.icon} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[14px] font-medium text-ink">
                          <span className="font-mono text-[11.5px] text-ink-4 tabular-nums">{i + 1}</span>
                          {copy.title}
                          {!s.required && <span className="text-[12px] font-normal text-ink-4">Optional</span>}
                        </span>
                        <span className="block truncate text-[12.5px] text-ink-3">{copy.description}</span>
                      </span>
                      {state === "done" && <Badge tint="green">Done</Badge>}
                      {state === "skipped" && <Badge tint="slate">Skipped</Badge>}
                      {state === "todo" && <Badge tint={s.required ? "amber" : "slate"}>To do</Badge>}
                      {state === "later" && <LaterBadge phase={s.phase} />}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link href="/onboarding/go-live/" className="flex items-center gap-3 px-4 py-3 hover:bg-hover sm:px-5" data-testid="checklist-go-live">
                  <span className="grid size-8 shrink-0 place-items-center rounded-tab bg-sunken text-ink-3">
                    <Icon name="rocket" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-ink">Go live</span>
                    <span className="block text-[12.5px] text-ink-3">Final checks and your first billing day.</span>
                  </span>
                  {checklist.data.live ? <Badge tint="green">Live</Badge> : <Badge tint="slate">Last step</Badge>}
                </Link>
              </li>
            </ol>
          </Card>
        </>
      )}
    </>
  );
}
