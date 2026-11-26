"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { OnboardingOptions, SettingInfo } from "@meno/api-client";
import { Field, Input, Segmented, Select } from "@meno/ui";
import { configurationStep, type SettingDefinition } from "@meno/validation";
import { applyApiError } from "@/lib/problem";
import { useConfiguration, useOnboardingOptions, useSaveConfiguration } from "../queries";
import { useGoNext } from "../useGoNext";
import { toSelect } from "../utils";
import { StepFrame } from "./StepFrame";

const FORM_ID = "configuration-form";

/**
 * Labels for the setting keys the API defines (setting_definition). A new key from the API still renders, with
 * a label made from the key, so adding a setting never needs a frontend release.
 */
const LABELS: Record<string, { label: string; hint?: string }> = {
  "stock.negative_policy": { label: "When stock runs out", hint: "Block the sale, or warn and allow it." },
  "stock.fefo_default": { label: "Sell the earliest-expiring batch first (FEFO)" },
  "stock.near_expiry_days": { label: "Near-expiry warning (days)", hint: "Batches expiring within this many days are shown in amber." },
  "pricing.round_grand_total": { label: "Round the bill total to the nearest rupee" },
  "invoice.paper_size": { label: "Bill paper" },
};
/** react-hook-form reads "." as nesting, so setting keys (stock.near_expiry_days) become flat field names. */
const toField = (key: string) => key.replaceAll(".", "__");
const toKey = (field: string) => field.replaceAll("__", ".");

const labelFor = (key: string) => LABELS[key] ?? { label: key.split(".").pop()!.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) };

/** /onboarding/configuration (AUT-02 subset, AUT-08): a form built from the setting definitions. */
export function ConfigurationStep() {
  const options = useOnboardingOptions();
  const current = useConfiguration();
  const save = useSaveConfiguration();
  const [formError, setFormError] = useState<string | null>(null);
  return (
    <StepFrame
      code="CONFIGURATION"
      formId={FORM_ID}
      saving={save.isPending}
      formError={formError}
      loading={options.isPending || current.isPending}
      loadError={options.error ?? current.error}
      onRetry={() => void Promise.all([options.refetch(), current.refetch()])}
    >
      {options.data && current.data && <ConfigurationFormView options={options.data} current={current.data} save={save} onError={setFormError} />}
    </StepFrame>
  );
}

function ConfigurationFormView({ options, current, save, onError }: { options: OnboardingOptions; current: Record<string, string>; save: ReturnType<typeof useSaveConfiguration>; onError: (m: string | null) => void }) {
  const goNext = useGoNext("CONFIGURATION");
  const defs = (options.settings ?? []).filter((d): d is SettingInfo & { key: string } => Boolean(d.key));
  const lists = options.lists ?? {};
  const schema = useMemo(() => configurationStep(defs.map((d) => ({ ...d, key: toField(d.key) })) as SettingDefinition[], lists), [defs, lists]);
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(defs.map((d) => [toField(d.key), current[d.key] ?? d.defaultValue ?? ""])),
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    onError(null);
    try {
      await save.mutateAsync(Object.fromEntries(Object.entries(values).map(([f, v]) => [toKey(f), v])));
    } catch (e) {
      onError(applyApiError(e, form.setError));
      return;
    }
    await goNext();
  });

  const yesNo = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ];

  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {defs.map((d) => {
        const { label, hint } = labelFor(d.key);
        const name = toField(d.key);
        const error = errors[name]?.message;
        if (d.type === "BOOLEAN")
          return (
            <Field key={d.key} label={label} hint={hint} error={error}>
              <Controller control={form.control} name={name} render={({ field }) => <Segmented ref={field.ref} value={field.value} onValueChange={field.onChange} options={yesNo} aria-label={label} />} />
            </Field>
          );
        if (d.type === "INTEGER")
          return (
            <Field key={d.key} label={label} hint={hint ?? (d.min !== undefined && d.max !== undefined ? `${d.min} to ${d.max}.` : undefined)} error={error}>
              <Input inputMode="numeric" className="font-mono sm:max-w-[140px]" {...form.register(name)} />
            </Field>
          );
        if (d.type === "LIST") {
          const opts = toSelect(lists[d.listCode ?? ""]);
          return (
            <Field key={d.key} label={label} hint={hint} error={error}>
              <Controller
                control={form.control}
                name={name}
                render={({ field }) =>
                  opts.length <= 3 ? (
                    <Segmented ref={field.ref} value={field.value} onValueChange={field.onChange} options={opts} aria-label={label} />
                  ) : (
                    <Select ref={field.ref} value={field.value} onValueChange={field.onChange} options={opts} className="sm:max-w-[280px]" />
                  )
                }
              />
            </Field>
          );
        }
        return (
          <Field key={d.key} label={label} hint={hint} error={error}>
            <Input {...form.register(name)} />
          </Field>
        );
      })}
      <p className="text-[12.5px] text-ink-3">Document numbering, invoice look with preview, and discount limits arrive in a later release; the defaults above can be changed in Settings at any time.</p>
    </form>
  );
}
