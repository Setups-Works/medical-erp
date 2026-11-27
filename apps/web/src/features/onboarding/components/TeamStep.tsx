"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { TeamInvitation, TeamOptions } from "@meno/api-client";
import { Badge, Button, Callout, Checkbox, Field, formatDate, Icon, Input, Select, type Tint } from "@meno/ui";
import { teamInvite, type TeamInvite, type TeamInviteForm } from "@meno/validation";
import { applyApiError, problemMessage } from "@/lib/problem";
import { useChecklist, useInvitationAction, useInvitations, useInviteStaff, useSkipStep, useTeamOptions } from "../queries";
import { useGoNext } from "../useGoNext";
import { nextRoute } from "../utils";
import { StepFrame } from "./StepFrame";

/** Business errors that belong to one field (TeamController error codes). */
const CODE_FIELDS = {
  IDENTITY_INVITATION_CONTACT_REQUIRED: "email",
  IDENTITY_EMAIL_TAKEN: "email",
  IDENTITY_INVITATION_PENDING: "email",
  NOTIFICATION_CHANNEL_DISABLED: "email",
  IDENTITY_MOBILE_TAKEN: "mobile",
  IDENTITY_ROLE_INVALID: "roleCode",
  IDENTITY_INVITATION_BRANCH_INVALID: "branchIds",
} as const;

/** Status is always written out, never colour alone (DESIGN_LANGUAGE §4 status colours). */
const STATUS: Record<NonNullable<TeamInvitation["status"]>, { label: string; tint: Tint }> = {
  PENDING: { label: "Invited", tint: "slate" },
  EXPIRED: { label: "Link expired", tint: "red" },
  ACCEPTED: { label: "Joined", tint: "green" },
  REVOKED: { label: "Revoked", tint: "slate" },
};

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

function InvitationRow({ invitation: i }: { invitation: TeamInvitation }) {
  const resend = useInvitationAction("resend");
  const revoke = useInvitationAction("revoke");
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const status = STATUS[i.status ?? "PENDING"];
  const open = i.status === "PENDING" || i.status === "EXPIRED";
  const error = resend.error ?? revoke.error;

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
      <Icon name="users" className="hidden text-ink-3 sm:block" />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-ink">
          {i.fullName}
          <span className="text-[12.5px] font-normal text-ink-3">{i.roleLabel}</span>
          <Badge tint={status.tint}>{status.label}</Badge>
        </p>
        <p className="truncate text-[12.5px] text-ink-3">
          {[i.email, i.mobile].filter(Boolean).join(" · ")}
          {i.branches?.length ? ` · ${i.branches.map((b) => b.name).join(", ")}` : ""}
        </p>
        {i.status === "PENDING" && <p className="text-[12px] text-ink-4">Link works until {formatDate(i.expiresAt)}</p>}
        {error && <p className="text-[12.5px] text-critical">{problemMessage(error, "Couldn't update the invitation.")}</p>}
      </div>
      {open && (
        <div className="flex items-center gap-1">
          {confirmRevoke ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setConfirmRevoke(false)}>
                Keep
              </Button>
              <Button variant="outline" size="sm" loading={revoke.isPending} onClick={() => revoke.mutate(i.id ?? "")} aria-label={`Confirm revoking ${i.fullName}'s invitation`}>
                Revoke link
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" loading={resend.isPending} onClick={() => resend.mutate(i.id ?? "")} aria-label={`Resend ${i.fullName}'s invitation`}>
                Resend
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmRevoke(true)} aria-label={`Revoke ${i.fullName}'s invitation`}>
                Revoke
              </Button>
            </>
          )}
        </div>
      )}
    </li>
  );
}

function InviteForm({ options, onDone, onCancel }: { options: TeamOptions; onDone: () => void; onCancel?: () => void }) {
  const invite = useInviteStaff();
  const [formError, setFormError] = useState<string | null>(null);
  const smsAvailable = Boolean(options.smsAvailable);
  const branches = options.branches ?? [];
  const roles = (options.roles ?? []).map((r) => ({ value: r.code ?? "", label: r.label ?? "" }));
  const form = useForm<TeamInviteForm, unknown, TeamInvite>({
    resolver: zodResolver(teamInvite({ smsAvailable })),
    // One branch → it is the only sensible choice, so it starts ticked.
    defaultValues: { fullName: "", email: "", mobile: "", roleCode: "", branchIds: branches.length === 1 ? [branches[0]?.id ?? ""] : [] },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (v) => {
    setFormError(null);
    try {
      await invite.mutateAsync({ fullName: v.fullName, email: v.email, mobile: v.mobile, roleCode: v.roleCode, branchIds: v.branchIds });
    } catch (e) {
      setFormError(applyApiError(e, form.setError, CODE_FIELDS));
      return;
    }
    onDone();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="invite-form">
      <h2 className="text-[14px] font-medium text-ink">Invite a person</h2>
      {formError && <Callout tone="critical">{formError}</Callout>}
      <Field label="Full name" error={errors.fullName?.message} required>
        <Input autoComplete="off" {...form.register("fullName")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" error={errors.email?.message} hint={smsAvailable ? "Email or mobile, or both." : "The invitation link is sent here."} required={!smsAvailable}>
          <Input type="email" inputMode="email" autoComplete="off" {...form.register("email")} />
        </Field>
        <Field label="Mobile" error={errors.mobile?.message} hint={smsAvailable ? "The link is also sent by SMS." : "Saved now; SMS invitations come later."} optional>
          <Input inputMode="numeric" autoComplete="off" maxLength={14} className="font-mono" placeholder="98765 43210" {...form.register("mobile")} />
        </Field>
      </div>
      <Field label="Role" error={errors.roleCode?.message} hint="Decides what they can see and do." required>
        <Controller control={form.control} name="roleCode" render={({ field }) => <Select ref={field.ref} value={field.value} onValueChange={field.onChange} options={roles} placeholder="Choose a role" />} />
      </Field>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[13px] font-medium text-ink">
          Branches <span className="font-normal text-ink-3">· where they can work</span>
        </legend>
        <Controller
          control={form.control}
          name="branchIds"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5" role="group" aria-invalid={errors.branchIds ? true : undefined}>
              {branches.map((b) => {
                const checked = field.value.includes(b.id ?? "");
                return (
                  <label key={b.id} className="flex min-h-8 cursor-pointer items-center gap-2 text-[13.5px] text-ink pointer-coarse:min-h-10">
                    <Checkbox
                      checked={checked}
                      onChange={(e) => field.onChange(e.target.checked ? [...field.value, b.id ?? ""] : field.value.filter((id) => id !== b.id))}
                      onBlur={field.onBlur}
                    />
                    {b.name}
                    <span className="font-mono text-[12px] text-ink-3">{b.code}</span>
                    {b.headOffice && <Badge tint="blue">Head office</Badge>}
                  </label>
                );
              })}
            </div>
          )}
        />
        {errors.branchIds && <p className="text-[12.5px] text-critical">{errors.branchIds.message ?? errors.branchIds.root?.message}</p>}
      </fieldset>
      <p className="text-[12.5px] text-ink-3">The link works for {options.invitationValidDays} days. You can resend or revoke it any time.</p>
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} data-testid="invite-send">
          Send invitation
        </Button>
      </div>
    </form>
  );
}
