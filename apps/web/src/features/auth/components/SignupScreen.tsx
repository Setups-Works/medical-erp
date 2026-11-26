"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { SignupOptions } from "@meno/api-client";
import { Button, Callout, Checkbox, ChoiceCards, Field, FieldGroup, Input, PasswordInput, Select, Skeleton } from "@meno/ui";
import { signupForm, toSignupRequest, type SignupForm, type SignupValues } from "@meno/validation";
import { useIdempotencyKey } from "@/hooks/useIdempotencyKey";
import { applyApiError, problemMessage } from "@/lib/problem";
import { useSignup, useSignupOptions } from "../queries";
import { startOption } from "../utils";
import { AuthHeading, AuthShell } from "./AuthShell";
import { PasswordMeter } from "./PasswordMeter";

/** ONBOARDING.md step 1 (PLT-01, AUT-04). Error codes from SignupController that belong to one field: */
const CODE_FIELDS = {
  IDENTITY_EMAIL_TAKEN: "email",
  IDENTITY_PASSWORD_TOO_SHORT: "password",
  IDENTITY_START_OPTION_INVALID: "startWith",
  IDENTITY_TERMS_NOT_ACCEPTED: "acceptTerms",
  TENANCY_STATE_UNKNOWN: "stateCode",
} as const;

export function SignupScreen() {
  const options = useSignupOptions();
  return (
    <AuthShell wide>
      <AuthHeading title="Create your MENO account" description="Takes about two minutes. You can finish setting up your pharmacy later." />
      {options.isPending && (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      )}
      {options.isError && <Callout tone="critical" action={<Button variant="outline" size="sm" onClick={() => options.refetch()}>Try again</Button>}>{problemMessage(options.error, "Couldn't load the sign-up form.")}</Callout>}
      {options.data && !options.data.open && <Callout tone="warning" title="Sign-up is closed right now">Ask us for an invitation, or try again later.</Callout>}
      {options.data?.open && <SignupFormView options={options.data} />}
      <p className="mt-6 text-center text-[13.5px] text-ink-3">
        Already have an account?{" "}
        <Link href="/login/" className="font-medium text-ink underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

function SignupFormView({ options }: { options: SignupOptions }) {
  const router = useRouter();
  const signup = useSignup();
  const idem = useIdempotencyKey();
  const [formError, setFormError] = useState<string | null>(null);
  const schema = useMemo(() => signupForm(options.minPasswordLength), [options.minPasswordLength]);
  const form = useForm<SignupForm, unknown, SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: { ownerName: "", mobile: "", email: "", password: "", businessName: "", stateCode: "", partnerCode: "", startWith: options.startOptions[0] ?? "", acceptTerms: false, website: "" },
  });
  const { errors, isSubmitting } = form.formState;
  const stateOptions = options.states.map((s) => ({ value: s.code, label: s.name }));
  const startOptions = options.startOptions.map((code) => ({ value: code, ...startOption(code) }));

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signup.mutateAsync({ body: toSignupRequest(values, options.termsVersion), idempotencyKey: idem.get() });
    } catch (e) {
      setFormError(applyApiError(e, form.setError, CODE_FIELDS));
      return;
    }
    idem.reset();
    router.replace("/verify/");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7" data-testid="signup-form">
      {formError && <Callout tone="critical">{formError}</Callout>}
      <FieldGroup title="About you">
        <Field label="Your name" error={errors.ownerName?.message} required>
          <Input autoComplete="name" autoFocus {...form.register("ownerName")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mobile" error={errors.mobile?.message} hint="We'll send a code to confirm it." required>
            <Input prefix="+91" type="tel" inputMode="numeric" autoComplete="tel-national" {...form.register("mobile")} />
          </Field>
          <Field label="Email" error={errors.email?.message} hint="You'll sign in with this." required>
            <Input type="email" inputMode="email" autoComplete="email" {...form.register("email")} />
          </Field>
        </div>
        <Field label="Password" error={errors.password?.message} hint={`At least ${options.minPasswordLength} characters.`} required>
          <PasswordInput autoComplete="new-password" {...form.register("password")} />
        </Field>
        <PasswordMeter password={form.watch("password")} minLength={options.minPasswordLength} />
      </FieldGroup>

      <FieldGroup title="Your business" description="The legal name is filled from your GSTIN in the next steps.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" error={errors.businessName?.message} required>
            <Input autoComplete="organization" {...form.register("businessName")} />
          </Field>
          <Field label="State" error={errors.stateCode?.message} required>
            <Controller control={form.control} name="stateCode" render={({ field }) => <Select ref={field.ref} value={field.value} onValueChange={field.onChange} options={stateOptions} placeholder="Choose your state" />} />
          </Field>
        </div>
      </FieldGroup>

      <FieldGroup title="How would you like to start?">
        <Controller
          control={form.control}
          name="startWith"
          render={({ field }) => <ChoiceCards ref={field.ref} value={field.value} onValueChange={field.onChange} options={startOptions} columns={startOptions.length >= 3 ? 3 : 2} aria-label="How would you like to start?" />}
        />
        {errors.startWith?.message && <p role="alert" className="text-[12.5px] text-critical">{errors.startWith.message}</p>}
        <Field label="Partner code" error={errors.partnerCode?.message} hint="If an implementation partner referred you." optional>
          <Input autoCapitalize="characters" {...form.register("partnerCode")} className="sm:max-w-[240px]" />
        </Field>
      </FieldGroup>

      {/* Bot trap (ONBOARDING.md anti-abuse): hidden from people and screen readers; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" {...form.register("website")} />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-2.5 text-[13.5px] text-ink-2">
          <Checkbox className="mt-0.5" {...form.register("acceptTerms")} aria-invalid={errors.acceptTerms ? true : undefined} />
          <span>
            I accept the MENO terms of service and privacy notice <span className="text-ink-4">(version {options.termsVersion})</span>. My details are used to run my account, as the DPDP Act 2023 requires.
          </span>
        </label>
        {errors.acceptTerms?.message && <p role="alert" className="text-[12.5px] text-critical">{errors.acceptTerms.message}</p>}
      </div>

      <Button type="submit" size="lg" loading={isSubmitting} data-testid="signup-submit">
        Create account
      </Button>
    </form>
  );
}
