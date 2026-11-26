"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Callout, Field, Input, PasswordInput } from "@meno/ui";
import { loginRequest, type LoginRequest } from "@meno/validation";
import { applyApiError } from "@/lib/problem";
import { useFetchChecklist, useLogin } from "../queries";
import { landingPath, safeNext } from "../utils";
import { AuthHeading, AuthShell } from "./AuthShell";
import { LocalMockHint } from "./LocalMockHint";

export function LoginScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();
  const fetchChecklist = useFetchChecklist();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginRequest>({ resolver: zodResolver(loginRequest), defaultValues: { email: "", password: "" } });
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
    // Staff without onboarding permission get 403 here: they go straight to the dashboard.
    const checklist = await fetchChecklist().catch(() => null);
    router.replace(next ?? (checklist ? landingPath(checklist) : "/dashboard/"));
  });

  return (
    <AuthShell>
      <AuthHeading title="Sign in" description="Welcome back. Sign in to your pharmacy." />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="login-form">
        {formError && <Callout tone="critical">{formError}</Callout>}
        <Field label="Email" error={errors.email?.message} required>
          <Input type="email" autoComplete="username" autoFocus inputMode="email" {...form.register("email")} data-testid="login-email" />
        </Field>
        <Field label="Password" error={errors.password?.message} required>
          <PasswordInput autoComplete="current-password" {...form.register("password")} data-testid="login-password" />
        </Field>
        <div className="-mt-1 flex justify-end">
          <Link href="/forgot-password/" className="text-[13px] text-ink-2 underline-offset-4 hover:text-ink hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} data-testid="login-submit">
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-[13.5px] text-ink-3">
        New to MENO?{" "}
        <Link href="/signup/" className="font-medium text-ink underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
      {process.env.NODE_ENV === "development" && (
        <LocalMockHint>Sign up first (data stays in this tab), then sign in with the same email and password.</LocalMockHint>
      )}
    </AuthShell>
  );
}
