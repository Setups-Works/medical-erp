"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Checklist, Readiness } from "@meno/api-client";
import { Badge, Button, Callout, Card, Checkbox, DatePicker, Field, Icon, PageHeader, Skeleton, formatDate } from "@meno/ui";
import { goLiveStep } from "@meno/validation";
import { applyApiError, problemMessage } from "@/lib/problem";
import { useChecklist, useGoLive, useReadiness } from "../queries";
import { stepCopy, withSlash } from "../utils";

/** Check code → the step that fixes it (codes from OnboardingService.readiness and GoLiveCheck beans). */
function fixLink(code: string | undefined, checklist: Checklist | undefined): { href: string; label: string } | null {
  if (!code) return null;
  if (code.startsWith("STEP_")) {
    const step = checklist?.steps?.find((s) => s.code === code.slice(5));
    return step?.route ? { href: withSlash(step.route), label: stepCopy(step.code).title } : null;
  }
  if (code === "LICENCES_VALID") return { href: "/onboarding/licences/", label: "Licences" };
  if (code === "OWNER_EMAIL_VERIFIED") return { href: "/verify/", label: "Verify email" };
  return null;
}

function checkLabel(code: string | undefined, checklist: Checklist | undefined, message: string | undefined) {
  if (code?.startsWith("STEP_")) return `${stepCopy(code.slice(5)).title} complete`;
  if (code === "LICENCES_VALID") return "Drug licences valid today";
  if (code === "OWNER_EMAIL_VERIFIED") return "Owner's email confirmed";
  void checklist;
  return message ?? code ?? "";
}

/** /onboarding/go-live (AUT-13): readiness checks, each linked to its fix, then the go-live date. */
export function GoLiveStep() {
  const readiness = useReadiness();
  const checklist = useChecklist();
  return (
    <>
      <PageHeader eyebrow="Last step" title="Go live" description="When every check passes, pick your first billing day. After this, set-up details change only in Settings." />
      {readiness.isError && (
        <Callout tone="critical" action={<Button variant="outline" size="sm" onClick={() => readiness.refetch()}>Try again</Button>}>
          {problemMessage(readiness.error, "Couldn't load the go-live checks.")}
        </Callout>
      )}
      {readiness.isPending && <Skeleton className="h-64" />}
      {readiness.data && (readiness.data.live ? <Live readiness={readiness.data} /> : <Checks readiness={readiness.data} checklist={checklist.data} />)}
    </>
  );
}

function Live({ readiness }: { readiness: Readiness }) {
  return (
    <Card className="flex flex-col items-start gap-3">
      <Badge tint="green">Live</Badge>
      <p className="text-[15px] text-ink">
        You went live on <span className="font-medium tabular-nums">{formatDate(readiness.goLiveDate)}</span>.
      </p>
      <Link href="/dashboard/" className="inline-flex h-10 items-center gap-1.5 rounded-ctl bg-ink px-4 text-[14px] font-medium text-paper hover:opacity-90">
        Open MENO
        <Icon name="arrow-right" />
      </Link>
    </Card>
  );
}

function Checks({ readiness, checklist }: { readiness: Readiness; checklist: Checklist | undefined }) {
  const checks = readiness.checks ?? [];
  const failing = checks.filter((c) => !c.passed).length;
  return (
    <div className="flex flex-col gap-5">
      <Card className="p-0 sm:p-0">
        <div className="flex items-center justify-between px-4 py-3 sm:px-5">
          <h2 className="text-[14px] font-medium text-ink">Readiness checks</h2>
          <span className="font-mono text-[12.5px] text-ink-3 tabular-nums">
            {checks.length - failing} of {checks.length} passed
          </span>
        </div>
        <ul className="divide-y divide-line border-t border-line" data-testid="go-live-checks">
          {checks.map((c) => {
            const fix = fixLink(c.code, checklist);
            return (
              <li key={c.code} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                {c.passed ? <Icon name="check-circle" className="text-success" label="Passed" /> : <Icon name="x" className="text-critical" label="Not yet" />}
                <span className="flex-1 text-[13.5px] text-ink">{checkLabel(c.code, checklist, c.message)}</span>
                {!c.passed && fix && (
                  <Link href={fix.href} className="text-[13px] font-medium text-ink underline-offset-4 hover:underline">
                    Fix
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
      {readiness.ready ? <GoLiveForm readiness={readiness} /> : <Callout tone="warning">Finish the items marked above, then come back here to go live.</Callout>}
    </div>
  );
}

function GoLiveForm({ readiness }: { readiness: Readiness }) {
  const goLive = useGoLive();
  const [formError, setFormError] = useState<string | null>(null);
  const earliest = readiness.earliestDate ?? "";
  const latest = readiness.latestDate ?? "";
  const window = { earliest, latest };
  const schema = useMemo(() => goLiveStep({ earliest, latest }), [earliest, latest]);
  const form = useForm<{ goLiveDate: string; confirm: boolean }>({
    resolver: zodResolver(schema),
    defaultValues: { goLiveDate: "", confirm: false },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ goLiveDate }) => {
    setFormError(null);
    try {
      await goLive.mutateAsync(goLiveDate);
    } catch (e) {
      setFormError(applyApiError(e, form.setError, { TENANCY_GO_LIVE_DATE_INVALID: "goLiveDate" }));
    }
  });

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="go-live-form">
        {formError && <Callout tone="critical">{formError}</Callout>}
        <Field label="First billing day" error={errors.goLiveDate?.message} hint={`Between ${formatDate(window.earliest)} and ${formatDate(window.latest)}.`} required>
          <Controller control={form.control} name="goLiveDate" render={({ field }) => <DatePicker ref={field.ref} value={field.value} onChange={field.onChange} min={window.earliest} max={window.latest} />} />
        </Field>
        <label className="flex items-start gap-2.5 text-[13.5px] text-ink-2">
          <Checkbox className="mt-0.5" {...form.register("confirm")} />
          <span>I've checked the company, licences and books. Document numbers will start from 1 on this day.</span>
        </label>
        {errors.confirm?.message && <p role="alert" className="text-[12.5px] text-critical">{errors.confirm.message}</p>}
        <Button type="submit" size="lg" loading={isSubmitting} className="self-start" data-testid="go-live-submit">
          <Icon name="rocket" />
          Go live
        </Button>
      </form>
    </Card>
  );
}
