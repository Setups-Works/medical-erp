"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { TeamOptions } from "@meno/api-client";
import { Badge, Button, Callout, Checkbox, Field, Input, Select } from "@meno/ui";
import { teamInvite, type TeamInvite, type TeamInviteForm } from "@meno/validation";
import { applyApiError } from "@/lib/problem";
import { useInviteStaff } from "../queries";

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

/** Invite a person by email or mobile with a role and branches. Used by /onboarding/team and /admin/users. */
export function InviteForm({ options, onDone, onCancel }: { options: TeamOptions; onDone: () => void; onCancel?: () => void }) {
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
