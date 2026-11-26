"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Callout, Field, Input } from "@meno/ui";
import { forgotPasswordRequest, type ForgotPasswordRequest } from "@meno/validation";
import { problemMessage } from "@/lib/problem";
import { useForgotPassword } from "../queries";
import { AuthHeading, AuthShell } from "./AuthShell";
import { LocalMockHint } from "./LocalMockHint";

/** /forgot-password (AUT-01). Same answer whether or not the email exists (auth module rule 2). */
export function ForgotPasswordScreen() {
  const forgot = useForgotPassword();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<ForgotPasswordRequest>({ resolver: zodResolver(forgotPasswordRequest), defaultValues: { email: "" } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ email }) => {
    await forgot.mutateAsync(email).then(
      () => setSentTo(email),
      () => undefined,
    );
  });

  return (
    <AuthShell>
      <AuthHeading title="Reset your password" description="Enter the email you sign in with. We'll send a link to choose a new password." />
      {sentTo ? (
        <>
          <Callout tone="success" title="Check your email">
            If {sentTo} has a MENO account, a reset link is on its way. It works once.
          </Callout>
          <Button variant="outline" className="mt-4 w-full" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
          {process.env.NODE_ENV === "development" && (
            <LocalMockHint>
              <a className="underline" href="/reset-password/?token=demo-reset">
                Open the demo reset link
              </a>
            </LocalMockHint>
          )}
        </>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="forgot-form">
          {forgot.isError && <Callout tone="critical">{problemMessage(forgot.error, "Couldn't send the link. Try again.")}</Callout>}
          <Field label="Email" error={errors.email?.message} required>
            <Input type="email" autoComplete="username" autoFocus inputMode="email" {...form.register("email")} />
          </Field>
          <Button type="submit" size="lg" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-[13.5px] text-ink-3">
        <Link href="/login/" className="font-medium text-ink underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
