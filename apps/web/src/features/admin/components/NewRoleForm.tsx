"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { RoleSummary } from "@meno/api-client";
import { Button, Callout, Card, Field, Input, Select, Textarea } from "@meno/ui";
import { roleForm, type RoleForm } from "@meno/validation";
import { applyApiError } from "@/lib/problem";
import { useCreateRole } from "../queries";

const EMPTY = "__empty__";

/** New role: a name, an optional description, and the role whose permissions it starts with (or none). */
export function NewRoleForm({ roles, onCreated, onCancel }: { roles: RoleSummary[]; onCreated: (code: string) => void; onCancel: () => void }) {
  const create = useCreateRole();
  const [formError, setFormError] = useState<string | null>(null);
  const [copyFrom, setCopyFrom] = useState(EMPTY);
  const form = useForm<RoleForm>({ resolver: zodResolver(roleForm), defaultValues: { label: "", description: "" } });
  const { errors, isSubmitting } = form.formState;
  const startOptions = [{ value: EMPTY, label: "No permissions (choose them next)" }, ...roles.map((r) => ({ value: r.code ?? "", label: `Same as ${r.label}` }))];

  const onSubmit = form.handleSubmit(async (v) => {
    setFormError(null);
    try {
      const role = await create.mutateAsync({ label: v.label, description: v.description || undefined, copyFrom: copyFrom === EMPTY ? undefined : copyFrom });
      onCreated(role.code ?? "");
    } catch (e) {
      setFormError(applyApiError(e, form.setError, { IDENTITY_ROLE_NAME_TAKEN: "label" }));
    }
  });

  return (
    <Card className="p-4">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="role-new-form">
        <h2 className="text-[15px] font-medium text-ink">New role</h2>
        {formError && <Callout tone="critical">{formError}</Callout>}
        <Field label="Name" error={errors.label?.message} hint="What your staff call this job, e.g. Night pharmacist." required>
          <Input autoComplete="off" autoFocus {...form.register("label")} />
        </Field>
        <Field label="Description" error={errors.description?.message} optional>
          <Textarea rows={2} {...form.register("description")} />
        </Field>
        <Field label="Start with" hint="You can change every permission after creating it.">
          <Select value={copyFrom} onValueChange={setCopyFrom} options={startOptions} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} data-testid="role-create">
            Create role
          </Button>
        </div>
      </form>
    </Card>
  );
}
