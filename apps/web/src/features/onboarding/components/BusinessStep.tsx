"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { BusinessProfile, OnboardingOptions } from "@meno/api-client";
import { ChoiceCards, Field, Select, Segmented } from "@meno/ui";
import { businessStep, type BusinessStep as Values } from "@meno/validation";
import { applyApiError } from "@/lib/problem";
import { useBusiness, useOnboardingOptions, useSaveBusiness } from "../queries";
import { useGoNext } from "../useGoNext";
import { toSelect } from "../utils";
import { StepFrame } from "./StepFrame";

const FORM_ID = "business-form";

/** /onboarding/business (AUT-05). Every value is a code from GET /onboarding/options. */
export function BusinessStep() {
  const options = useOnboardingOptions();
  const business = useBusiness();
  const [formError, setFormError] = useState<string | null>(null);
  const save = useSaveBusiness();
  return (
    <StepFrame
      code="BUSINESS"
      formId={FORM_ID}
      saving={save.isPending}
      formError={formError}
      loading={options.isPending || business.isPending}
      loadError={options.error ?? business.error}
      onRetry={() => void Promise.all([options.refetch(), business.refetch()])}
    >
      {options.data && business.data && <BusinessForm options={options.data} saved={business.data} onError={setFormError} save={save} />}
    </StepFrame>
  );
}

function BusinessForm({ options, saved, onError, save }: { options: OnboardingOptions; saved: BusinessProfile; onError: (m: string | null) => void; save: ReturnType<typeof useSaveBusiness> }) {
  const goNext = useGoNext("BUSINESS");
  const lists = options.lists ?? {};
  const form = useForm<Values>({
    resolver: zodResolver(businessStep),
    defaultValues: {
      businessType: saved.businessType ?? "",
      branchCount: saved.branchCount ?? "",
      catalogueSize: saved.catalogueSize ?? "",
      currentSoftware: saved.currentSoftware ?? "",
      language: saved.language ?? lists.language?.[0]?.code ?? "",
    },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    onError(null);
    try {
      await save.mutateAsync(values);
    } catch (e) {
      onError(applyApiError(e, form.setError));
      return;
    }
    await goNext();
  });

  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Field label="Type of business" error={errors.businessType?.message} hint="Decides which licences and screens you need." required>
        <Controller control={form.control} name="businessType" render={({ field }) => <ChoiceCards ref={field.ref} value={field.value} onValueChange={field.onChange} options={toSelect(lists.business_type)} aria-label="Type of business" />} />
      </Field>
      <Field label="How many shops?" error={errors.branchCount?.message} required>
        <Controller control={form.control} name="branchCount" render={({ field }) => <Segmented ref={field.ref} value={field.value} onValueChange={field.onChange} options={toSelect(lists.branch_count)} aria-label="How many shops" />} />
      </Field>
      <Field label="Roughly how many medicines do you stock?" error={errors.catalogueSize?.message} hint="With many medicines, importing is faster than typing." required>
        <Controller control={form.control} name="catalogueSize" render={({ field }) => <ChoiceCards ref={field.ref} value={field.value} onValueChange={field.onChange} options={toSelect(lists.catalogue_size)} columns={3} aria-label="Catalogue size" />} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Software you use today" error={errors.currentSoftware?.message} hint="We'll suggest the right importer later." required>
          <Controller control={form.control} name="currentSoftware" render={({ field }) => <Select ref={field.ref} value={field.value} onValueChange={field.onChange} options={toSelect(lists.current_software)} />} />
        </Field>
        <Field label="Language" error={errors.language?.message} required>
          <Controller control={form.control} name="language" render={({ field }) => <Select ref={field.ref} value={field.value} onValueChange={field.onChange} options={toSelect(lists.language)} />} />
        </Field>
      </div>
    </form>
  );
}
