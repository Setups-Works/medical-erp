"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Callout, Field, Input, PasswordInput } from "@meno/ui";
import { platformLogin, type PlatformLogin, type PlatformLoginForm } from "@meno/validation";
import { AuthHeading, AuthShell } from "@/features/auth/components/AuthShell";
import { safeNext } from "@/features/auth/utils";
import { applyApiError } from "@/lib/problem";
import { usePlatformLogin } from "../queries";

/** MENO staff sign-in (ADR-0020). Separate from the pharmacy sign-in: different accounts, different token. */
export function PlatformLoginScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const login = usePlatformLogin();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<PlatformLoginForm, unknown, PlatformLogin>({
    resolver: zodResolver(platformLogin),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync(values);
    } catch (e) {
      setFormError(applyApiError(e, form.setError));
      form.setFocus("password");
      return;
    }
    const next = safeNext(params.get("next"));
    router.replace(next?.startsWith("/platform/") ? next : "/platform/reference-data/");
  });

  return (
    <AuthShell>
      <AuthHeading title="MENO staff sign-in" description="For the MENO team only. Pharmacies sign in on the main sign-in page." />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="platform-login-form">
        {formError && <Callout tone="critical">{formError}</Callout>}
        <Field label="Work email" error={errors.email?.message} required>
          <Input type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} autoFocus {...form.register("email")} data-testid="platform-login-email" />
        </Field>
        <Field label="Password" error={errors.password?.message} required>
          <PasswordInput autoComplete="current-password" {...form.register("password")} data-testid="platform-login-password" />
        </Field>
        <Button type="submit" size="lg" loading={isSubmitting} data-testid="platform-login-submit">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
