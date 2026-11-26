"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { BranchDetails, BranchView, OnboardingOptions } from "@meno/api-client";
import { Badge, Button, Callout, Field, Icon, Input, Select } from "@meno/ui";
import { branchStep, type BranchForm, type BranchStep as Values } from "@meno/validation";
import { applyApiError } from "@/lib/problem";
import { useBranches, useCompany, useOnboardingOptions, useSaveBranch } from "../queries";
import { useGoNext } from "../useGoNext";
import { StepFrame } from "./StepFrame";

const CODE_FIELDS = { TENANCY_BRANCH_CODE_TAKEN: "code", TENANCY_BRANCH_STATE_MISMATCH: "stateCode", TENANCY_STATE_UNKNOWN: "stateCode" } as const;

/** /onboarding/branches (PLT-03): first branch pre-filled from the company address; it becomes the head office. */
export function BranchesStep() {
  const options = useOnboardingOptions();
  const branches = useBranches();
  const company = useCompany();
  const goNext = useGoNext("BRANCHES");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const list = branches.data?.branches ?? [];
  const noCompany = company.isSuccess && !company.data;
  const showForm = editing !== null || (branches.isSuccess && list.length === 0);

  return (
    <StepFrame
      code="BRANCHES"
      loading={options.isPending || branches.isPending || company.isPending}
      loadError={options.error ?? branches.error ?? company.error}
      onRetry={() => void Promise.all([options.refetch(), branches.refetch()])}
    >
      {noCompany ? (
        <Callout tone="warning">Complete the company & GST step first: branches use its state.</Callout>
      ) : (
        options.data && (
          <div className="flex flex-col gap-5">
            {list.length > 0 && (
              <ul className="flex flex-col divide-y divide-line rounded-tile shadow-[inset_0_0_0_1px_var(--line)]" data-testid="branch-list">
                {list.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                    <Icon name="store" className="text-ink-3" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[14px] font-medium text-ink">
                        {b.details?.name}
                        <span className="font-mono text-[12px] text-ink-3">{b.details?.code}</span>
                        {b.headOffice && <Badge tint="blue">Head office</Badge>}
                      </p>
                      <p className="truncate text-[12.5px] text-ink-3">{[b.details?.addressLine1, b.details?.city, b.details?.pin].filter(Boolean).join(", ")}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(b.id ?? null)} aria-label={`Edit ${b.details?.name ?? "branch"}`}>
                      Edit
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {showForm ? (
              <BranchFormView
                key={editing ?? "first"}
                options={options.data}
                branch={list.find((b) => b.id === editing)}
                suggestion={list.length === 0 ? (branches.data?.suggestion ?? undefined) : undefined}
                companyState={company.data?.stateCode}
                onDone={() => setEditing(null)}
                onCancel={list.length > 0 ? () => setEditing(null) : undefined}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => setEditing("new")}>
                  Add another branch
                </Button>
                <span className="text-[12.5px] text-ink-3">Chains can add more branches now or later from Settings.</span>
                <Button className="ml-auto" onClick={() => void goNext()} data-testid="step-save">
                  Continue
                  <Icon name="arrow-right" />
                </Button>
              </div>
            )}
          </div>
        )
      )}
    </StepFrame>
  );
}

function BranchFormView({
  options,
  branch,
  suggestion,
  companyState,
  onDone,
  onCancel,
}: {
  options: OnboardingOptions;
  branch?: BranchView;
  suggestion?: BranchDetails;
  companyState?: string;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const save = useSaveBranch();
  const [formError, setFormError] = useState<string | null>(null);
  const d = branch?.details ?? suggestion;
  const states = (options.states ?? []).map((s) => ({ value: s.code ?? "", label: s.name ?? "" }));
  const form = useForm<BranchForm, unknown, Values>({
    resolver: zodResolver(branchStep),
    defaultValues: {
      name: d?.name ?? "",
      code: d?.code ?? "",
      addressLine1: d?.addressLine1 ?? "",
      addressLine2: d?.addressLine2 ?? "",
      pin: d?.pin ?? "",
      city: d?.city ?? "",
      district: d?.district ?? "",
      stateCode: d?.stateCode ?? companyState ?? "",
    },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (v) => {
    setFormError(null);
    try {
      await save.mutateAsync({ id: branch?.id, body: v });
    } catch (e) {
      setFormError(applyApiError(e, form.setError, CODE_FIELDS));
      return;
    }
    onDone();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="branch-form">
      <h2 className="text-[14px] font-medium text-ink">{branch ? "Edit branch" : suggestion ? "Your first branch" : "New branch"}</h2>
      {suggestion && !branch && <Callout tone="info">Filled from your company address. Change anything that differs.</Callout>}
      {formError && <Callout tone="critical">{formError}</Callout>}
      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
        <Field label="Branch name" error={errors.name?.message} required>
          <Input {...form.register("name")} />
        </Field>
        <Field label="Code" error={errors.code?.message} hint="Used in bill numbers." required>
          <Input className="font-mono uppercase" maxLength={10} {...form.register("code", { setValueAs: (v: string) => v.toUpperCase() })} />
        </Field>
      </div>
      <Field label="Address line 1" error={errors.addressLine1?.message} required>
        <Input {...form.register("addressLine1")} />
      </Field>
      <Field label="Address line 2" error={errors.addressLine2?.message} optional>
        <Input {...form.register("addressLine2")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="PIN code" error={errors.pin?.message} required>
          <Input inputMode="numeric" maxLength={6} className="font-mono" {...form.register("pin")} />
        </Field>
        <Field label="City" error={errors.city?.message} required>
          <Input {...form.register("city")} />
        </Field>
        <Field label="District" error={errors.district?.message} optional>
          <Input {...form.register("district")} />
        </Field>
      </div>
      <Field label="State" error={errors.stateCode?.message} hint="A branch must be in the company's state." required>
        <Controller control={form.control} name="stateCode" render={({ field }) => <Select ref={field.ref} value={field.value} onValueChange={field.onChange} options={states} />} />
      </Field>
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} data-testid="branch-save">
          {branch ? "Save branch" : "Add branch"}
        </Button>
      </div>
    </form>
  );
}
