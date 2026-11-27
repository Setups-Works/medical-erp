"use client";

import Link from "next/link";
import { Badge, Button, Callout, Card, Icon, PageHeader, Skeleton } from "@meno/ui";
import { problemMessage } from "@/lib/problem";
import { useChecklist } from "../queries";
import { previousRoute, stepCopy } from "../utils";

type StepFrameProps = {
  code: string;
  children: React.ReactNode;
  /** Shown above the form when the save failed with an error not tied to one field. */
  formError?: string | null;
  loading?: boolean;
  loadError?: unknown;
  onRetry?: () => void;
  /** Sticky footer actions; the primary "Save and continue" submits the form with this id. */
  formId?: string;
  saving?: boolean;
  saveLabel?: string;
  extraActions?: React.ReactNode;
};

/** One wizard step: header with step number and status, the form, and a sticky save bar (FormPage pattern). */
export function StepFrame({ code, children, formError, loading, loadError, onRetry, formId, saving, saveLabel = "Save and continue", extraActions }: StepFrameProps) {
  const checklist = useChecklist();
  const steps = checklist.data?.steps ?? [];
  const index = steps.findIndex((s) => s.code === code);
  const status = steps[index];
  const copy = stepCopy(code);
  const live = Boolean(checklist.data?.live);

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow={index >= 0 ? `Step ${index + 1} of ${steps.length}${status?.required ? " · Required" : " · Optional"}` : undefined}
        title={copy.title}
        description={copy.description}
        actions={status?.status === "DONE" ? <Badge tint="green">Saved</Badge> : status?.status === "SKIPPED" ? <Badge tint="slate">Skipped</Badge> : undefined}
      />
      {loadError ? (
        <Callout tone="critical" action={onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}>
          {problemMessage(loadError, "Couldn't load this step.")}
        </Callout>
      ) : loading ? (
        <Card className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9 w-2/3" />
        </Card>
      ) : (
        <>
          {formError && <Callout tone="critical" className="mb-4">{formError}</Callout>}
          <Card>{children}</Card>
          {formId && (
            <div className="sticky bottom-0 -mx-4 mt-6 flex flex-wrap items-center gap-2 border-t border-line bg-paper px-4 py-3 sm:mx-0 sm:rounded-card sm:border sm:px-4">
              <Link href={previousRoute(checklist.data, code)} className="inline-flex h-8 items-center gap-1.5 rounded-ctl px-3 text-[13px] text-ink-2 hover:bg-hover hover:text-ink pointer-coarse:h-10">
                <Icon name="arrow-left" />
                Back
              </Link>
              <div className="ml-auto flex items-center gap-2">
                {extraActions}
                <Button type="submit" form={formId} loading={saving} disabled={live} data-testid="step-save">
                  {saveLabel}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
