"use client";

import { useRouter } from "next/navigation";
import { Button, Callout, Card, Icon, PageHeader } from "@meno/ui";
import { problemMessage } from "@/lib/problem";
import { useChecklist, useSkipStep } from "../queries";
import { nextRoute, stepCopy } from "../utils";
import { LaterBadge } from "./OnboardingShell";

/** What each later step will cover (ONBOARDING.md §2), shown until the step's feature ships. */
const PLANNED: Record<string, string[]> = {
  TEAM: ["Invite staff by mobile or email with a role", "Choose which branches each person can use", "Counter PIN set on first sign-in"],
  DATA: ["Start fresh with the medicine database", "Excel / CSV templates", "Move from the software you use today, with a dry run you approve"],
  DEVICES: ["Download the desktop app for Windows / macOS", "Register this computer to a branch and counter", "Print a test page and scan a test barcode"],
  PLAN: ["Pick a plan for your edition", "Or enter a license key"],
  PRACTICE: ["A practice company with sample medicines", "Guided first purchase, bill and return", "Practice bills never reach GST reports"],
  LICENSE: ["Enter the license key you received", "We check the edition matches your business"],
  HELP: ["Book a set-up call", "Give our team time-boxed access (view only or assist) that you can revoke any time"],
};

/**
 * Steps whose API isn't built yet (checklist `available: false`). Optional steps can be skipped now
 * (POST /onboarding/steps/{step}/skip) and done later from Settings.
 */
export function LaterStep({ code, title, description }: { code: string; title?: string; description?: string }) {
  const checklist = useChecklist();
  const skip = useSkipStep();
  const router = useRouter();
  const step = checklist.data?.steps?.find((s) => s.code === code);
  const copy = stepCopy(code);
  const canSkip = step && !step.required && step.status !== "SKIPPED" && step.status !== "DONE" && !checklist.data?.live;

  return (
    <>
      <PageHeader eyebrow={step ? (step.required ? "Required" : "Optional") : "Set-up"} title={title ?? copy.title} description={description ?? copy.description} actions={<LaterBadge phase={step?.phase} />} />
      <Card className="flex flex-col gap-4">
        <p className="text-[14px] text-ink-2">This part of set-up isn't available yet. When it is, it will cover:</p>
        <ul className="flex flex-col gap-2">
          {(PLANNED[code] ?? []).map((item) => (
            <li key={item} className="flex items-start gap-2 text-[13.5px] text-ink-2">
              <Icon name="check" className="mt-0.5 text-ink-4" />
              {item}
            </li>
          ))}
        </ul>
        {skip.isError && <Callout tone="critical">{problemMessage(skip.error, "Couldn't skip this step.")}</Callout>}
        <div className="flex flex-wrap items-center gap-2">
          {canSkip && (
            <Button variant="outline" loading={skip.isPending} onClick={() => skip.mutate(code, { onSuccess: (cl) => router.push(nextRoute(cl, code)) })}>
              Skip for now
            </Button>
          )}
          <Button variant="ghost" onClick={() => router.push(nextRoute(checklist.data, code))}>
            Next step
            <Icon name="arrow-right" />
          </Button>
        </div>
      </Card>
    </>
  );
}
