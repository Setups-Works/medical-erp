"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Callout, Icon } from "@meno/ui";
import { problemMessage } from "@/lib/problem";
import { InvitationRow } from "@/features/users/components/InvitationRow";
import { InviteForm } from "@/features/users/components/InviteForm";
import { useChecklist, useInvitations, useSkipStep, useTeamOptions } from "../queries";
import { useGoNext } from "../useGoNext";
import { nextRoute } from "../utils";
import { StepFrame } from "./StepFrame";

/** /onboarding/team (AUT-09): invite staff by email or mobile with a role and branches. Optional: skip and work alone. */
export function TeamStep() {
  const options = useTeamOptions();
  const invitations = useInvitations();
  const checklist = useChecklist();
  const skip = useSkipStep();
  const goNext = useGoNext("TEAM");
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const list = invitations.data?.items ?? [];
  const branches = options.data?.branches ?? [];
  const step = checklist.data?.steps?.find((s) => s.code === "TEAM");
  const canSkip = list.length === 0 && step?.status === "TODO" && !checklist.data?.live;
  const showForm = branches.length > 0 && (adding || (invitations.isSuccess && list.length === 0));

  return (
    <StepFrame
      code="TEAM"
      loading={options.isPending || invitations.isPending}
      loadError={options.error ?? invitations.error}
      onRetry={() => void Promise.all([options.refetch(), invitations.refetch()])}
    >
      <div className="flex flex-col gap-5">
        {branches.length === 0 ? (
          <Callout tone="warning">
            Add a branch first: each person works at one or more branches.{" "}
            <Link href="/onboarding/branches" className="underline underline-offset-2">
              Go to branches
            </Link>
          </Callout>
        ) : (
          <p className="text-[13.5px] text-ink-2">
            Each person gets a link to set their own password and join. You can also do this later from Settings, or work alone for now.
          </p>
        )}

        {list.length > 0 && (
          <ul className="flex flex-col divide-y divide-line rounded-tile shadow-[inset_0_0_0_1px_var(--line)]" data-testid="invitation-list">
            {list.map((i) => (
              <InvitationRow key={i.id} invitation={i} />
            ))}
          </ul>
        )}

        {showForm && options.data ? (
          <InviteForm key={list.length} options={options.data} onDone={() => setAdding(false)} onCancel={list.length > 0 ? () => setAdding(false) : undefined} />
        ) : null}

        {skip.isError && <Callout tone="critical">{problemMessage(skip.error, "Couldn't skip this step.")}</Callout>}
        {!showForm || list.length === 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
            {!showForm && branches.length > 0 && (
              <Button variant="outline" onClick={() => setAdding(true)}>
                <Icon name="users" />
                Invite another person
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2">
              {canSkip && (
                <Button variant="ghost" loading={skip.isPending} onClick={() => skip.mutate("TEAM", { onSuccess: (cl) => router.push(nextRoute(cl, "TEAM")) })} data-testid="team-skip">
                  Skip for now
                </Button>
              )}
              {list.length > 0 && (
                <Button onClick={() => void goNext()} data-testid="step-save">
                  Continue
                  <Icon name="arrow-right" />
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </StepFrame>
  );
}
