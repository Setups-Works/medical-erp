"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { InvitationView } from "@meno/api-client";
import { Button, Callout, Card, Field, Input, PasswordInput, Skeleton, formatDate } from "@meno/ui";
import { acceptInvitationForm, type AcceptInvitationForm } from "@meno/validation";
import { applyApiError, problemMessage } from "@/lib/problem";
import { useAcceptInvitation, useInvitation } from "../queries";
import { AuthHeading, AuthShell } from "./AuthShell";
import { LocalMockHint } from "./LocalMockHint";
import { PasswordMeter } from "./PasswordMeter";

/**
 * Accept invitation (PLT-06). Route is /invite?token=… rather than /invite/[token] because the web app is a static
 * export (ADR-0003): dynamic segments would need every token at build time.
 */
export function InviteScreen() {
  const token = useSearchParams().get("token");
  const invitation = useInvitation(token);
  return (
    <AuthShell>
      {!token ? (
        <>
          <AuthHeading title="Join your team on MENO" />
          <Callout tone="critical">This invitation link is incomplete. Open it again from the SMS or email.</Callout>
          {process.env.NODE_ENV === "development" && (
            <LocalMockHint>
              <a className="underline" href="/invite/?token=demo-invite">
                Open the demo invitation
              </a>
            </LocalMockHint>
          )}
        </>
      ) : invitation.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24" />
        </div>
      ) : invitation.isError ? (
        <>
          <AuthHeading title="This invitation can't be used" />
          <Callout tone="critical">{problemMessage(invitation.error, "This invitation has expired or was already used. Ask the owner to send a new one.")}</Callout>
          <p className="mt-6 text-center text-[13.5px] text-ink-3">
            Already joined?{" "}
            <Link href="/login/" className="font-medium text-ink underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <AcceptForm token={token} invitation={invitation.data} />
      )}
    </AuthShell>
  );
}

function AcceptForm({ token, invitation }: { token: string; invitation: InvitationView }) {
  const router = useRouter();
  const accept = useAcceptInvitation(token);
  const [formError, setFormError] = useState<string | null>(null);
  const min = invitation.minPasswordLength;
  const schema = useMemo(() => acceptInvitationForm(min), [min]);
  const form = useForm<AcceptInvitationForm>({ resolver: zodResolver(schema), defaultValues: { fullName: "", mobile: "", password: "", confirmPassword: "" } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ fullName, mobile, password }) => {
    setFormError(null);
    try {
      await accept.mutateAsync({ fullName, mobile, password });
    } catch (e) {
      setFormError(applyApiError(e, form.setError, { IDENTITY_PASSWORD_TOO_SHORT: "password", IDENTITY_MOBILE_TAKEN: "mobile" }));
      return;
    }
    router.replace("/dashboard/");
  });

  return (
    <>
      <AuthHeading title={`Join ${invitation.businessName}`} description={`${invitation.invitedByName} invited you to MENO.`} />
      <Card className="mb-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13.5px]">
        <span className="text-ink-3">Role</span>
        <span className="font-medium text-ink">{invitation.roleName}</span>
        {invitation.branchNames && invitation.branchNames.length > 0 && (
          <>
            <span className="text-ink-3">Branches</span>
            <span className="text-ink">{invitation.branchNames.join(", ")}</span>
          </>
        )}
        <span className="text-ink-3">Sent to</span>
        <span className="text-ink">{invitation.contactMasked}</span>
        <span className="text-ink-3">Valid until</span>
        <span className="text-ink tabular-nums">{formatDate(invitation.expiresAt)}</span>
      </Card>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="invite-form">
        {formError && <Callout tone="critical">{formError}</Callout>}
        <Field label="Your name" error={errors.fullName?.message} required>
          <Input autoComplete="name" autoFocus {...form.register("fullName")} />
        </Field>
        <Field label="Mobile" error={errors.mobile?.message} required>
          <Input prefix="+91" type="tel" inputMode="numeric" autoComplete="tel-national" {...form.register("mobile")} />
        </Field>
        <Field label="Password" error={errors.password?.message} hint={`At least ${min} characters.`} required>
          <PasswordInput autoComplete="new-password" {...form.register("password")} />
        </Field>
        <PasswordMeter password={form.watch("password")} minLength={min} />
        <Field label="Type it again" error={errors.confirmPassword?.message} required>
          <PasswordInput autoComplete="new-password" {...form.register("confirmPassword")} />
        </Field>
        <Button type="submit" size="lg" loading={isSubmitting}>
          Join and sign in
        </Button>
      </form>
    </>
  );
}
