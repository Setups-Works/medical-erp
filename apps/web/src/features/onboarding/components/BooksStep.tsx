"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Books, OnboardingOptions } from "@meno/api-client";
import { Callout, ChoiceCards, DatePicker, Field, formatFinancialYear } from "@meno/ui";
import { booksStep, financialYearChoices, financialYearEnd, type BooksForm } from "@meno/validation";
import { applyApiError } from "@/lib/problem";
import { useBooks, useOnboardingOptions, useSaveBooks } from "../queries";
import { useGoNext } from "../useGoNext";
import { fyInWords, todayIso } from "../utils";
import { StepFrame } from "./StepFrame";

const FORM_ID = "books-form";
const CODE_FIELDS = { TENANCY_FY_START_INVALID: "financialYearStart", TENANCY_BOOKS_START_OUTSIDE_FY: "booksStartDate" } as const;

/** /onboarding/books (ACX-11): financial year + books start date. Bank accounts and openings come with P5. */
export function BooksStep() {
  const options = useOnboardingOptions();
  const books = useBooks();
  const save = useSaveBooks();
  const [formError, setFormError] = useState<string | null>(null);
  return (
    <StepFrame
      code="BOOKS"
      formId={FORM_ID}
      saving={save.isPending}
      formError={formError}
      loading={options.isPending || books.isPending}
      loadError={options.error ?? books.error}
      onRetry={() => void Promise.all([options.refetch(), books.refetch()])}
    >
      {options.data && books.isSuccess && <BooksFormView options={options.data} saved={books.data} save={save} onError={setFormError} />}
    </StepFrame>
  );
}

function BooksFormView({ options, saved, save, onError }: { options: OnboardingOptions; saved: Books | null; save: ReturnType<typeof useSaveBooks>; onError: (m: string | null) => void }) {
  const goNext = useGoNext("BOOKS");
  const month = options.financialYearStartMonth ?? 4;
  const schema = useMemo(() => booksStep(month), [month]);
  const choices = useMemo(() => {
    const starts = financialYearChoices(todayIso(), month);
    if (saved?.financialYearStart && !starts.includes(saved.financialYearStart)) starts.push(saved.financialYearStart);
    return starts.map((start) => {
      const end = financialYearEnd(start);
      return { value: start, label: formatFinancialYear(start, end), description: fyInWords(start, end) };
    });
  }, [month, saved?.financialYearStart]);

  const form = useForm<BooksForm>({
    resolver: zodResolver(schema),
    defaultValues: { financialYearStart: saved?.financialYearStart ?? choices[0]?.value ?? "", booksStartDate: saved?.booksStartDate ?? choices[0]?.value ?? "" },
  });
  const { errors } = form.formState;
  const fyStart = form.watch("financialYearStart");
  const fyEnd = fyStart ? financialYearEnd(fyStart) : "";

  const onSubmit = form.handleSubmit(async (v) => {
    onError(null);
    try {
      await save.mutateAsync(v);
    } catch (e) {
      onError(applyApiError(e, form.setError, CODE_FIELDS));
      return;
    }
    await goNext();
  });

  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Field label="Financial year" error={errors.financialYearStart?.message} hint="A wrong financial year is the most common set-up mistake. Check the dates." required>
        <Controller
          control={form.control}
          name="financialYearStart"
          render={({ field }) => (
            <ChoiceCards
              ref={field.ref}
              value={field.value}
              onValueChange={(v) => {
                field.onChange(v);
                // Keep the books start inside the chosen year.
                const b = form.getValues("booksStartDate");
                if (b < v || b > financialYearEnd(v)) form.setValue("booksStartDate", v);
              }}
              options={choices}
              aria-label="Financial year"
            />
          )}
        />
      </Field>
      <Field label="Books start date" error={errors.booksStartDate?.message} hint="The day your opening balances are counted from. Mid-year starts are fine." required>
        <Controller control={form.control} name="booksStartDate" render={({ field }) => <DatePicker ref={field.ref} value={field.value} onChange={field.onChange} min={fyStart} max={fyEnd} />} />
      </Field>
      {fyStart && <Callout tone="info">Your books will run from {fyInWords(form.watch("booksStartDate") || fyStart, fyEnd)}.</Callout>}
      <p className="text-[12.5px] text-ink-3">The chart of accounts is created for you. Bank accounts, opening cash and opening balances are added in Accounts later; go-live checks that they balance.</p>
    </form>
  );
}
