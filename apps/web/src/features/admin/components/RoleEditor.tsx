"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { isApiError, type PermissionCatalogue, type RoleDetail } from "@meno/api-client";
import { Badge, Button, Callout, Card, Checkbox, Field, Icon, Input, Skeleton, Textarea } from "@meno/ui";
import { roleForm, type RoleForm } from "@meno/validation";
import { applyApiError, problemMessage } from "@/lib/problem";
import { keys } from "@/lib/query/keys";
import { useArchiveRole, useRenameRole, useResetRole, useRole, useSetRolePermissions } from "../queries";
import { peopleCount, roleBadges, sameSet, toggle } from "../utils";

/**
 * One role: name and description (own roles), its permissions by module, reset (changed defaults), remove (own
 * roles). The permission list is keyed by its version, so a save or a reload starts it fresh while the notice stays.
 */
export function RoleEditor({ code, catalogue, canManage, onClose }: { code: string; catalogue: PermissionCatalogue; canManage: boolean; onClose: () => void }) {
  const role = useRole(code);
  const [notice, setNotice] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);

  if (role.isPending) return <Skeleton className="h-96" />;
  if (role.isError || !role.data) return <Callout tone="critical">{problemMessage(role.error, "Couldn't load this role.")}</Callout>;
  const r = role.data;
  const editable = canManage && !r.locked;

  return (
    <Card className="flex flex-col gap-4 p-4 lg:sticky lg:top-[72px]" data-testid="role-editor">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
            {r.label}
            {roleBadges(r).map((b) => (
              <Badge key={b.label} tint={b.tint}>
                {b.label}
              </Badge>
            ))}
          </h2>
          {r.description && <p className="mt-1 text-[13px] text-ink-3">{r.description}</p>}
          <p className="mt-1 text-[12.5px] text-ink-4">
            {peopleCount(r.activeUsers, r.totalUsers)}
            {r.allBranches ? " · sees every branch" : " · works at the branches given to each person"}
          </p>
        </div>
        {r.custom && canManage && !renaming && (
          <Button variant="ghost" size="sm" onClick={() => setRenaming(true)}>
            Rename
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close (Esc)">
          <Icon name="x" />
        </Button>
      </div>

      {renaming && <RenameForm role={r} onDone={() => setRenaming(false)} />}
      {notice && <Callout tone="success">{notice}</Callout>}
      {r.locked && (
        <Callout tone="info">
          {r.label} always has every permission, including new ones as MENO adds features, so nobody can lock the business out.
        </Callout>
      )}

      <PermissionsForm key={r.permissionsVersion} role={r} catalogue={catalogue} editable={editable} onSaved={() => setNotice("Saved. People with this role get the change within 30 seconds.")} />

      {editable && !r.custom && r.customised && <ResetAction role={r} onReset={() => setNotice("Back to MENO's permissions for this role.")} />}
      {canManage && r.custom && <ArchiveAction role={r} onArchived={onClose} />}
    </Card>
  );
}

function PermissionsForm({ role, catalogue, editable, onSaved }: { role: RoleDetail; catalogue: PermissionCatalogue; editable: boolean; onSaved: () => void }) {
  const save = useSetRolePermissions();
  const qc = useQueryClient();
  const original = [...(role.permissionCodes ?? [])].sort();
  const [chosen, setChosen] = useState<string[]>(original);
  const dirty = !sameSet(chosen, original);
  const total = (catalogue.modules ?? []).reduce((n, m) => n + (m.permissions?.length ?? 0), 0);

  const submit = () =>
    save.mutate(
      { code: role.code ?? "", body: { permissionCodes: chosen, permissionsVersion: role.permissionsVersion ?? 0 } },
      {
        onSuccess: onSaved,
        onError: (e) => {
          if (isApiError(e) && e.code === "COMMON_VERSION_CONFLICT") void qc.invalidateQueries({ queryKey: keys.roles.all });
        },
      },
    );

  return (
    <div className="flex flex-col gap-4 border-t border-line pt-4" data-testid="role-permissions">
      <p className="text-[13px] font-medium text-ink">
        Permissions <span className="font-normal text-ink-3">· {role.locked ? "all" : `${chosen.length} of ${total}`}</span>
      </p>
      {save.isError && <Callout tone="critical">{problemMessage(save.error, "Couldn't save the permissions.")}</Callout>}
      {(catalogue.modules ?? []).map((m) => (
        <fieldset key={m.code} className="flex flex-col gap-1.5">
          <legend className="mb-1 text-[12.5px] font-medium text-ink-3">{m.label}</legend>
          {(m.permissions ?? []).map((p) => {
            const checked = role.locked || chosen.includes(p.code ?? "");
            return (
              <label key={p.code} className="flex min-h-8 cursor-pointer items-start gap-2 py-1 text-[13.5px] text-ink pointer-coarse:min-h-10">
                <Checkbox className="mt-0.5" checked={checked} disabled={!editable} onChange={(e) => setChosen((c) => toggle(c, p.code ?? "", e.target.checked))} />
                <span className="min-w-0">
                  <span className="block">{p.description}</span>
                  <span className="block font-mono text-[11.5px] text-ink-4">{p.code}</span>
                </span>
              </label>
            );
          })}
        </fieldset>
      ))}
      {editable && (
        <div className="flex items-center justify-end gap-2">
          {dirty && (
            <Button variant="ghost" onClick={() => setChosen(original)}>
              Undo changes
            </Button>
          )}
          <Button onClick={submit} loading={save.isPending} disabled={!dirty} data-testid="role-permissions-save">
            Save permissions
          </Button>
        </div>
      )}
    </div>
  );
}

function RenameForm({ role, onDone }: { role: RoleDetail; onDone: () => void }) {
  const rename = useRenameRole();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<RoleForm>({ resolver: zodResolver(roleForm), defaultValues: { label: role.label ?? "", description: role.description ?? "" } });
  const { errors, isSubmitting } = form.formState;
  const onSubmit = form.handleSubmit(async (v) => {
    setFormError(null);
    try {
      await rename.mutateAsync({ code: role.code ?? "", body: { label: v.label, description: v.description || undefined, version: role.version ?? 0 } });
      onDone();
    } catch (e) {
      setFormError(applyApiError(e, form.setError, { IDENTITY_ROLE_NAME_TAKEN: "label" }));
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 rounded-tile p-3 shadow-[inset_0_0_0_1px_var(--line)]">
      {formError && <Callout tone="critical">{formError}</Callout>}
      <Field label="Name" error={errors.label?.message} required>
        <Input autoComplete="off" autoFocus {...form.register("label")} />
      </Field>
      <Field label="Description" error={errors.description?.message} optional>
        <Textarea rows={2} {...form.register("description")} />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="outline" loading={isSubmitting}>
          Save name
        </Button>
      </div>
    </form>
  );
}

function ResetAction({ role, onReset }: { role: RoleDetail; onReset: () => void }) {
  const reset = useResetRole();
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      {reset.isError && <Callout tone="critical">{problemMessage(reset.error, "Couldn't reset the role.")}</Callout>}
      {confirming ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <p className="mr-auto text-[13px] text-ink-2">Your changes to {role.label} are dropped and MENO&apos;s list comes back.</p>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Keep my changes
          </Button>
          <Button variant="outline" loading={reset.isPending} onClick={() => reset.mutate(role.code ?? "", { onSuccess: onReset })} data-testid="role-reset-confirm">
            Reset permissions
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="self-start" onClick={() => setConfirming(true)} data-testid="role-reset">
          Reset to MENO&apos;s permissions…
        </Button>
      )}
    </div>
  );
}

function ArchiveAction({ role, onArchived }: { role: RoleDetail; onArchived: () => void }) {
  const archive = useArchiveRole();
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      {archive.isError && <Callout tone="critical">{problemMessage(archive.error, "Couldn't remove the role.")}</Callout>}
      {confirming ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <p className="mr-auto text-[13px] text-ink-2">{role.label} disappears from lists. Old records keep its name.</p>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Keep role
          </Button>
          <Button variant="destructive" loading={archive.isPending} onClick={() => archive.mutate(role.code ?? "", { onSuccess: onArchived })} data-testid="role-archive-confirm">
            Remove role
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="self-start" onClick={() => setConfirming(true)} data-testid="role-archive">
          <Icon name="trash" />
          Remove role…
        </Button>
      )}
    </div>
  );
}
