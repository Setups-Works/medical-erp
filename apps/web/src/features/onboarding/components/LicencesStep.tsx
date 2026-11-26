"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Licences, OnboardingOptions } from "@meno/api-client";
import { Badge, DatePicker, Field, FieldGroup, Input, Select } from "@meno/ui";
import { LICENCE_FIELD, LICENCE_KINDS, licencesStep, toLicencesRequest, type LicenceKind, type LicencesForm } from "@meno/validation";
import { applyApiError } from "@/lib/problem";
import { useLicences, useOnboardingOptions, useSaveLicences } from "../queries";
import { useGoNext } from "../useGoNext";
import { todayIso } from "../utils";
import { StepFrame } from "./StepFrame";

const FORM_ID = "licences-form";

const COPY: Record<LicenceKind, { title: string; hint: string; expiry: boolean }> = {
  DRUG_RETAIL: { title: "Retail drug licence (Form 20 / 21)", hint: "Licence number and the date it is valid to.", expiry: true },
  DRUG_WHOLESALE: { title: "Wholesale drug licence (Form 20B / 21B)", hint: "Licence number and the date it is valid to.", expiry: true },
  FSSAI: { title: "FSSAI licence", hint: "Only if you sell food or nutraceuticals. 14 digits.", expiry: true },
  NARCOTIC: { title: "Narcotic licence", hint: "Only if you sell NDPS items.", expiry: true },
};

/** /onboarding/licences (AUT-07). Which licences are required comes from the API (business_type_licence). */
export function LicencesStep() {
  const options = useOnboardingOptions();
  const licences = useLicences();
  const save = useSaveLicences();
  const [formError, setFormError] = useState<string | null>(null);
  return (
    <StepFrame
      code="LICENCES"
      formId={FORM_ID}
      saving={save.isPending}
      formError={formError}
      loading={options.isPending || licences.isPending}
      loadError={options.error ?? licences.error}
      onRetry={() => void Promise.all([options.refetch(), licences.refetch()])}
    >
      {options.data && licences.data && <LicencesFormView options={options.data} saved={licences.data} save={save} onError={setFormError} />}
    </StepFrame>
  );
}

function LicencesFormView({ options, saved, save, onError }: { options: OnboardingOptions; saved: Licences; save: ReturnType<typeof useSaveLicences>; onError: (m: string | null) => void }) {
  const goNext = useGoNext("LICENCES");
  const required = saved.required ?? [];
  const today = todayIso();
  const schema = useMemo(() => licencesStep(required, today), [required, today]);
  const held = saved.licences ?? {};
  const entry = (kind: LicenceKind) => ({ number: held[kind]?.number ?? "", validTo: held[kind]?.validTo ?? "" });
  const form = useForm<LicencesForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      drugRetail: entry("DRUG_RETAIL"),
      drugWholesale: entry("DRUG_WHOLESALE"),
      fssai: entry("FSSAI"),
      narcotic: entry("NARCOTIC"),
      pharmacistName: saved.pharmacistName ?? "",
      pharmacistRegNo: saved.pharmacistRegNo ?? "",
      pharmacistCouncilState: saved.pharmacistCouncilState ?? "",
    },
  });
  const { errors } = form.formState;
  const states = (options.states ?? []).map((s) => ({ value: s.code ?? "", label: s.name ?? "" }));
  // Required licences first, then the optional ones.
  const order = [...LICENCE_KINDS].sort((a, b) => Number(required.includes(b)) - Number(required.includes(a)));
  const notNeeded = (k: LicenceKind) => (k === "DRUG_RETAIL" || k === "DRUG_WHOLESALE") && !required.includes(k);

  const onSubmit = form.handleSubmit(async (values) => {
    onError(null);
    try {
      await save.mutateAsync(toLicencesRequest(values));
    } catch (e) {
      onError(applyApiError(e, form.setError));
      return;
    }
    await goNext();
  });

  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
      {order
        .filter((k) => !notNeeded(k))
        .map((kind) => {
          const f = LICENCE_FIELD[kind];
          const isRequired = required.includes(kind);
          const err = errors[f];
          return (
            <FieldGroup key={kind} title={COPY[kind].title} description={COPY[kind].hint}>
              <div className="flex items-center gap-2">{isRequired ? <Badge tint="amber">Required for your business type</Badge> : <Badge tint="slate">Optional</Badge>}</div>
              <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
                <Field label="Licence number" error={err?.number?.message} required={isRequired}>
                  <Input className="font-mono" {...form.register(`${f}.number`)} data-testid={`licence-${kind}-number`} />
                </Field>
                <Field label="Valid to" error={err?.validTo?.message} required={isRequired && COPY[kind].expiry}>
                  <Controller control={form.control} name={`${f}.validTo`} render={({ field }) => <DatePicker ref={field.ref} value={field.value} onChange={field.onChange} placeholder="Pick a date" />} />
                </Field>
              </div>
            </FieldGroup>
          );
        })}
      <p className="-mt-3 text-[12.5px] text-ink-3">We'll remind you 30, 15 and 7 days before a licence expires. Licence scans can be added once file uploads are available.</p>

      <FieldGroup title="Pharmacist in charge" description="Printed on bills where the law requires it.">
        <Field label="Name" error={errors.pharmacistName?.message} required>
          <Input autoComplete="off" {...form.register("pharmacistName")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Registration number" error={errors.pharmacistRegNo?.message} required>
            <Input className="font-mono" {...form.register("pharmacistRegNo")} />
          </Field>
          <Field label="State pharmacy council" error={errors.pharmacistCouncilState?.message} required>
            <Controller control={form.control} name="pharmacistCouncilState" render={({ field }) => <Select ref={field.ref} value={field.value} onValueChange={field.onChange} options={states} placeholder="Choose the state" />} />
          </Field>
        </div>
      </FieldGroup>
    </form>
  );
}
