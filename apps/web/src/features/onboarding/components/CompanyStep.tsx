"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { isApiError, type CompanyDetails, type GstinView, type OnboardingOptions } from "@meno/api-client";
import { Badge, Button, Callout, Field, FieldGroup, Input, Segmented, Select } from "@meno/ui";
import { checkGstin, companyStep, type CompanyForm, type CompanyStep as Values } from "@meno/validation";
import { applyApiError, problemMessage } from "@/lib/problem";
import { useSessionUser } from "@/lib/session";
import { useCompany, useGstinLookup, useOnboardingOptions, useSaveCompany } from "../queries";
import { useGoNext } from "../useGoNext";
import { applyGstin, companyFormFrom, gstStatusTone, toSelect } from "../utils";
import { StepFrame } from "./StepFrame";

const FORM_ID = "company-form";

/** TENANCY_* codes from PUT /onboarding/company that belong to one field (tenancy AGENTS.md). */
const CODE_FIELDS = {
  TENANCY_GSTIN_REQUIRED: "gstin",
  TENANCY_GSTIN_NOT_ALLOWED: "gstin",
  TENANCY_GSTIN_INVALID: "gstin",
  TENANCY_GSTIN_STATE_MISMATCH: "stateCode",
  TENANCY_PAN_GSTIN_MISMATCH: "pan",
  TENANCY_STATE_UNKNOWN: "stateCode",
  TENANCY_OPTION_INVALID: "registrationType",
} as const;

/** /onboarding/pharmacy (AUT-06, PLT-02, GST-09): GSTIN first, state locked to the GSTIN. */
export function CompanyStep() {
  const options = useOnboardingOptions();
  const company = useCompany();
  const save = useSaveCompany();
  const [formError, setFormError] = useState<string | null>(null);
  return (
    <StepFrame
      code="COMPANY"
      formId={FORM_ID}
      saving={save.isPending}
      formError={formError}
      loading={options.isPending || company.isPending}
      loadError={options.error ?? company.error}
      onRetry={() => void Promise.all([options.refetch(), company.refetch()])}
    >
      {options.data && company.isSuccess && <CompanyFormView options={options.data} saved={company.data} save={save} onError={setFormError} />}
    </StepFrame>
  );
}

function CompanyFormView({ options, saved, save, onError }: { options: OnboardingOptions; saved: CompanyDetails | null; save: ReturnType<typeof useSaveCompany>; onError: (m: string | null) => void }) {
  const goNext = useGoNext("COMPANY");
  const lookup = useGstinLookup();
  const user = useSessionUser();
  const [fetched, setFetched] = useState<GstinView | null>(null);
  const [filled, setFilled] = useState<string[]>([]);
  const registrationTypes = toSelect(options.lists?.registration_type);
  const states = (options.states ?? []).map((s) => ({ value: s.code ?? "", label: s.name ?? "" }));

  const form = useForm<CompanyForm, unknown, Values>({
    resolver: zodResolver(companyStep),
    defaultValues: companyFormFrom(saved, {}),
  });
  const { errors } = form.formState;
  const gstin = form.watch("gstin");
  const gstinOk = gstin.length === 15 && checkGstin(gstin) === null;
  // State follows the GSTIN (the most common GST set-up mistake is a wrong state, ONBOARDING.md §0).
  const stateLocked = gstinOk;
  const tone = gstStatusTone(fetched?.status);
  useEffect(() => {
    if (gstinOk && form.getValues("stateCode") !== gstin.slice(0, 2)) form.setValue("stateCode", gstin.slice(0, 2), { shouldValidate: form.formState.isSubmitted });
  }, [gstinOk, gstin, form]);

  const onFetch = async () => {
    const value = form.getValues("gstin").trim().toUpperCase();
    const ok = await form.trigger("gstin");
    if (!ok || !value) {
      if (!value) form.setError("gstin", { type: "manual", message: "Enter the GSTIN to fetch details." });
      return;
    }
    try {
      const g = await lookup.mutateAsync(value);
      const result = applyGstin(form.getValues(), g, registrationTypes.map((r) => r.value));
      form.reset(result.values, { keepDefaultValues: true });
      form.clearErrors();
      setFetched(g);
      setFilled(result.filled);
    } catch {
      /* shown below from lookup.error */
    }
  };

  const onSubmit = form.handleSubmit(async (v) => {
    onError(null);
    if (tone === "blocked") {
      onError("This GSTIN is cancelled on the GST portal. Use an active GSTIN or choose “Not registered”.");
      return;
    }
    try {
      await save.mutateAsync({
        registrationType: v.registrationType,
        gstin: v.gstin || "",
        legalName: v.legalName,
        tradeName: v.tradeName,
        pan: v.pan,
        addressLine1: v.addressLine1,
        addressLine2: v.addressLine2,
        pin: v.pin,
        city: v.city,
        district: v.district,
        stateCode: v.stateCode,
        phone: v.phone ?? "",
        email: v.email,
      });
    } catch (e) {
      onError(applyApiError(e, form.setError, CODE_FIELDS));
      return;
    }
    await goNext();
  });

  const fromPortal = (key: string) => (filled.includes(key) ? <Badge tint="blue">From GST portal</Badge> : null);
  const lookupMessage = (() => {
    if (!lookup.isError) return null;
    const code = isApiError(lookup.error) ? lookup.error.code : "";
    if (code === "PARTY_GSTIN_SERVICE_UNAVAILABLE") return "Couldn't verify now. Enter the details by hand; you can save without it.";
    if (code === "PARTY_GSTIN_NOT_FOUND") return "The GST portal doesn't know this GSTIN. Check it on the GST certificate.";
    return problemMessage(lookup.error, "Couldn't fetch the GSTIN details.");
  })();

  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
      <FieldGroup title="GST registration">
        <Field label="Registration type" error={errors.registrationType?.message} hint="Composition dealers print a Bill of Supply instead of a tax invoice." required>
          <Controller control={form.control} name="registrationType" render={({ field }) => <Segmented ref={field.ref} value={field.value} onValueChange={field.onChange} options={registrationTypes} aria-label="Registration type" />} />
        </Field>
        <Field label="GSTIN" error={errors.gstin?.message} hint="Leave empty only if the business is not registered for GST.">
          <Input
            autoCapitalize="characters"
            maxLength={15}
            className="font-mono uppercase tracking-wide"
            {...form.register("gstin", { setValueAs: (v: string) => v.toUpperCase() })}
            suffix={
              <Button size="sm" variant="outline" onClick={onFetch} loading={lookup.isPending} data-testid="gstin-fetch">
                Fetch
              </Button>
            }
            data-testid="gstin-input"
          />
        </Field>
        {lookupMessage && <Callout tone="warning">{lookupMessage}</Callout>}
        {fetched && tone === "blocked" && <Callout tone="critical" title="GSTIN cancelled">The GST portal shows this GSTIN as cancelled{fetched.cancelledOn ? ` on ${fetched.cancelledOn}` : ""}. It can't be used for billing.</Callout>}
        {fetched && tone === "warning" && <Callout tone="warning" title="GSTIN suspended">You can save, but check the status with your tax consultant before billing.</Callout>}
        {fetched && tone === "ok" && <Callout tone="success">Details filled from the GST portal. Check them before saving.</Callout>}
      </FieldGroup>

      <FieldGroup title="Business details">
        <Field label={<span className="inline-flex items-center gap-2">Legal name {fromPortal("legalName")}</span>} error={errors.legalName?.message} hint="Exactly as on the GST registration." required>
          <Input autoComplete="organization" {...form.register("legalName")} />
        </Field>
        <Field label={<span className="inline-flex items-center gap-2">Trade name {fromPortal("tradeName")}</span>} error={errors.tradeName?.message} hint="Printed on bills." optional>
          <Input {...form.register("tradeName")} />
        </Field>
        <Field label={<span className="inline-flex items-center gap-2">PAN {fromPortal("pan")}</span>} error={errors.pan?.message} hint={gstinOk ? "Characters 3–12 of the GSTIN." : undefined} required>
          <Input className="font-mono uppercase sm:max-w-[220px]" maxLength={10} {...form.register("pan", { setValueAs: (v: string) => v.toUpperCase() })} />
        </Field>
      </FieldGroup>

      <FieldGroup title="Address">
        <Field label="Address line 1" error={errors.addressLine1?.message} required>
          <Input autoComplete="address-line1" {...form.register("addressLine1")} />
        </Field>
        <Field label="Address line 2" error={errors.addressLine2?.message} optional>
          <Input autoComplete="address-line2" {...form.register("addressLine2")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="PIN code" error={errors.pin?.message} required>
            <Input inputMode="numeric" maxLength={6} autoComplete="postal-code" className="font-mono" {...form.register("pin")} />
          </Field>
          <Field label="City" error={errors.city?.message} required>
            <Input autoComplete="address-level2" {...form.register("city")} />
          </Field>
          <Field label="District" error={errors.district?.message} optional>
            <Input {...form.register("district")} />
          </Field>
        </div>
        <Field label="State" error={errors.stateCode?.message} hint={stateLocked ? "Set by the GSTIN's first two digits." : undefined} required>
          <Controller
            control={form.control}
            name="stateCode"
            render={({ field }) => (
              <Select
                ref={field.ref}
                value={field.value}
                onValueChange={field.onChange}
                options={states}
                disabled={stateLocked}
                placeholder="Choose the state"
              />
            )}
          />
        </Field>
      </FieldGroup>

      <FieldGroup title="Contact on bills" description="Optional. Shown on printed bills.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" error={errors.phone?.message} optional>
            <Input prefix="+91" type="tel" inputMode="numeric" {...form.register("phone")} />
          </Field>
          <Field label="Email" error={errors.email?.message} optional>
            <Input type="email" inputMode="email" placeholder={user?.email} {...form.register("email")} />
          </Field>
        </div>
      </FieldGroup>
    </form>
  );
}
