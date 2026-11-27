"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { isApiError, type ReferenceDataset, type ReferenceLoad } from "@meno/api-client";
import { Button, Callout, Checkbox, DatePicker, Field, controlClass, cn } from "@meno/ui";
import { referenceLoad, type ReferenceLoadForm, type ReferenceLoadValues } from "@meno/validation";
import { applyApiError } from "@/lib/problem";
import { useLoadReferenceFile } from "../queries";
import { count, indiaToday } from "../utils";

/** Errors that are about the file or its date go next to that field; the rest show above the buttons. */
const CODE_FIELDS = {
  REFERENCE_FILE_COLUMNS_MISSING: "file",
  REFERENCE_FILE_NO_ROWS: "file",
  REFERENCE_FILE_EMPTY: "file",
  REFERENCE_FILE_UNREADABLE: "file",
  REFERENCE_SOURCE_DATE_FUTURE: "sourceDate",
} as const;

/**
 * Upload the official CSV for one list. A file much smaller than today's list is refused once; the admin can then
 * tick "Replace anyway" (a truncated download would otherwise wipe most PIN codes from every address form).
 */
export function LoadFileForm({ dataset, onDone, onCancel }: { dataset: ReferenceDataset; onDone: (load: ReferenceLoad) => void; onCancel: () => void }) {
  const today = useMemo(() => indiaToday(), []);
  const load = useLoadReferenceFile();
  const [formError, setFormError] = useState<string | null>(null);
  const [shrinks, setShrinks] = useState<string | null>(null);
  const form = useForm<ReferenceLoadForm, unknown, ReferenceLoadValues>({
    resolver: zodResolver(referenceLoad({ today })),
    defaultValues: { file: null, sourceDate: "", replaceAnyway: false },
  });
  const { errors, isSubmitting } = form.formState;
  const code = dataset.code ?? "";

  const onSubmit = form.handleSubmit(async (v) => {
    setFormError(null);
    try {
      onDone(await load.mutateAsync({ code, file: v.file, sourceDate: v.sourceDate, replaceAnyway: v.replaceAnyway }));
    } catch (e) {
      if (isApiError(e) && e.code === "REFERENCE_LOAD_SHRINKS") {
        setShrinks(e.detail ?? "This file is much smaller than today's list.");
        return;
      }
      setFormError(applyApiError(e, form.setError, CODE_FIELDS));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 border-t border-line pt-4" data-testid={`load-form-${code}`}>
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <Field label="CSV file" error={errors.file?.message} hint={`As ${dataset.sourceName} publishes it, saved as CSV. Up to 100 MB.`} required>
          <Controller
            control={form.control}
            name="file"
            render={({ field }) => (
              <input
                type="file"
                accept=".csv,text/csv"
                ref={field.ref}
                onBlur={field.onBlur}
                onChange={(e) => {
                  setShrinks(null);
                  form.setValue("replaceAnyway", false);
                  field.onChange(e.target.files?.[0] ?? null);
                }}
                className={cn(controlClass, "h-9 px-1.5 py-1 text-[13px] file:mr-3 file:h-7 file:rounded-tab file:border-0 file:bg-sunken file:px-2.5 file:text-[12.5px] file:font-medium file:text-ink")}
                data-testid={`load-file-${code}`}
              />
            )}
          />
        </Field>
        <Field label="File dated" error={errors.sourceDate?.message} hint="The date the source published it." required>
          <Controller
            control={form.control}
            name="sourceDate"
            render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} max={today} placeholder="Pick a date" />}
          />
        </Field>
      </div>

      {shrinks && (
        <Callout tone="warning" title="Check this is the full file">
          <p>{shrinks}</p>
          <label className="mt-2 flex items-center gap-2 text-[13px] text-ink">
            <Checkbox {...form.register("replaceAnyway")} data-testid={`load-anyway-${code}`} />
            Replace anyway: this file is the complete, current list
          </label>
        </Callout>
      )}
      {formError && <Callout tone="critical">{formError}</Callout>}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <p className="mr-auto text-[12.5px] text-ink-3">
          {dataset.rowCount ? `Replaces all ${count(dataset.rowCount)} rows at once. Lookups keep working while it loads.` : "Lookups start working as soon as it loads."}
        </p>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} data-testid={`load-submit-${code}`}>
          Load file
        </Button>
      </div>
    </form>
  );
}
