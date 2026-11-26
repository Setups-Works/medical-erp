"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, Callout, Field, PasswordInput, Skeleton } from "@meno/ui";
import { resetPasswordForm, type ResetPasswordForm } from "@meno/validation";
import { applyApiError, problemMessage } from "@/lib/problem";
import { useResetPassword, useSignupOptions } from "../queries";
import { AuthHeading, AuthShell } from "./AuthShell";
import { PasswordMeter } from "./PasswordMeter";

/** /reset-password?token=… (AUT-01). The password minimum comes from the API like on sign-up. */
export function ResetPasswordScreen() {
  const token = useSearchParams().get("token");
  const options = useSignupOptions();
  return (
    <AuthShell>
      <AuthHeading title="Choose a new password" description="After this, you'll be signed out everywhere and can sign in with the new password." />
      {!token ? (
        <Callout tone="critical" title="This link is incomplete">
          Open the link from the email again, or{" "}
          <Link href="/forgot-password/" className="underline">
            ask for a new one
          </Link>
          .
        </Callout>
      ) : options.data ? (
        <ResetForm token={token} minLength={options.data.minPasswordLength} />
      ) : options.isError ? (
        <Callout tone="critical">{problemMessage(options.error, "Couldn't load the page.")}</Callout>
      ) : (
        <Skeleton className="h-40" />
      )}
    </AuthShell>
  );
}

function ResetForm({ token, minLength }: { token: string; minLength: number }) {
  const router = useRouter();
  const reset = useResetPassword();
  const [formError, setFormError] = useState<string | null>(null);
  const schema = useMemo(() => resetPasswordForm(minLength), [minLength]);
  const form = useForm<ResetPasswordForm>({ resolver: zodResolver(schema), defaultValues: { password: "", confirmPassword: "" } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setFormError(null);
    try {
      await reset.mutateAsync({ token, password });
    } catch (e) {
      setFormError(applyApiError(e, form.setError, { IDENTITY_PASSWORD_TOO_SHORT: "password" }));
      return;
    }
    toast.success("Password changed. Sign in with the new one.");
    router.replace("/login/");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="reset-form">
      {formError && (
        <Callout tone="critical">
          {formError}{" "}
          <Link href="/forgot-password/" className="underline">
            Ask for a new link
          </Link>
        </Callout>
      )}
      <Field label="New password" error={errors.password?.message} hint={`At least ${minLength} characters.`} required>
        <PasswordInput autoComplete="new-password" autoFocus {...form.register("password")} />
      </Field>
      <PasswordMeter password={form.watch("password")} minLength={minLength} />
      <Field label="Type it again" error={errors.confirmPassword?.message} required>
        <PasswordInput autoComplete="new-password" {...form.register("confirmPassword")} />
      </Field>
      <Button type="submit" size="lg" loading={isSubmitting}>
        Save new password
      </Button>
    </form>
  );
}
