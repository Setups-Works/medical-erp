"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { isApiError, type StaffUser, type UserAdminOptions } from "@meno/api-client";
import { Badge, Button, Callout, Card, Checkbox, formatDate, Icon } from "@meno/ui";
import { userAccess, type UserAccess } from "@meno/validation";
import { applyApiError, problemMessage } from "@/lib/problem";
import { keys } from "@/lib/query/keys";
import { useChangeAccess, useSetUserActive } from "../queries";
import { allBranchRoleCodes, coversAllBranches, formatMobile, lockedRoles, userStatus } from "../utils";

/** Business errors that belong to one field (UserAdminController error codes). */
const CODE_FIELDS = {
  IDENTITY_ROLE_INVALID: "roleCodes",
  IDENTITY_ROLE_REQUIRED: "roleCodes",
  IDENTITY_USER_BRANCH_INVALID: "branchIds",
} as const;

/**
 * One person: contact details, roles and branches (editable with identity.user.manage), deactivate / reactivate.
 * The parent keys this by id; the form inside is keyed by version, so a saved or reloaded user starts a fresh form
 * while the "Saved" notice stays.
 */
export function UserPanel({ user, options, canManage, onClose }: { user: StaffUser; options: UserAdminOptions; canManage: boolean; onClose: () => void }) {
  const status = userStatus(user.status);
  const [savedVersion, setSavedVersion] = useState<number | null>(null);
  return (
    <Card className="flex flex-col gap-4 p-4 lg:sticky lg:top-[72px]" aria-labelledby="user-panel-title" data-testid="user-panel">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 id="user-panel-title" className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
            {user.fullName}
            {user.you && <Badge tint="blue">You</Badge>}
            <Badge tint={status.tint}>{status.label}</Badge>
          </h2>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12.5px]">
            <dt className="text-ink-4">Email</dt>
            <dd className="truncate text-ink-2">{user.email}</dd>
            {user.mobile && (
              <>
                <dt className="text-ink-4">Mobile</dt>
                <dd className="font-mono text-ink-2">{formatMobile(user.mobile)}</dd>
              </>
            )}
            <dt className="text-ink-4">Last sign-in</dt>
            <dd className="text-ink-2">{user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}</dd>
            <dt className="text-ink-4">Added</dt>
            <dd className="text-ink-2">{formatDate(user.createdAt)}</dd>
          </dl>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close (Esc)">
          <Icon name="x" />
        </Button>
      </div>
      {savedVersion !== null && savedVersion === user.version && (
        <Callout tone="success">Saved. It applies the next time their session refreshes (within 15 minutes).</Callout>
      )}
      {canManage && user.status === "ACTIVE" ? (
        <AccessForm key={user.version} user={user} options={options} onSaved={setSavedVersion} />
      ) : (
        <AccessSummary user={user} />
      )}
      {canManage && !user.you && <StatusAction user={user} />}
    </Card>
  );
}

function AccessSummary({ user }: { user: StaffUser }) {
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4 text-[13px]">
      <div>
        <p className="mb-1.5 text-ink-4">Roles</p>
        <div className="flex flex-wrap gap-1.5">
          {(user.roles ?? []).map((r) => (
            <Badge key={r.code}>{r.label}</Badge>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-ink-4">Branches</p>
        <p className="text-ink-2">{user.allBranches ? "Every branch" : (user.branches ?? []).map((b) => b.name).join(", ") || "None"}</p>
      </div>
      {user.status === "DISABLED" && <p className="text-[12.5px] text-ink-3">Reactivate the account to change its access.</p>}
    </div>
  );
}

function AccessForm({ user, options, onSaved }: { user: StaffUser; options: UserAdminOptions; onSaved: (version: number) => void }) {
  const change = useChangeAccess();
  const qc = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const roles = options.roles ?? [];
  const locked = lockedRoles(user, roles);
  const form = useForm<UserAccess>({
    resolver: zodResolver(userAccess({ allBranchRoles: allBranchRoleCodes(roles) })),
    defaultValues: { roleCodes: (user.roles ?? []).map((r) => r.code ?? ""), branchIds: (user.branches ?? []).map((b) => b.id ?? "") },
  });
  const { errors, isSubmitting, isDirty } = form.formState;
  const roleCodes = form.watch("roleCodes");
  const everyBranch = coversAllBranches(roleCodes, roles);

  const onSubmit = form.handleSubmit(async (v) => {
    setFormError(null);
    try {
      const saved = await change.mutateAsync({ id: user.id ?? "", body: { roleCodes: v.roleCodes, branchIds: everyBranch ? [] : v.branchIds }, version: user.version ?? 0 });
      onSaved(saved.version ?? 0);
    } catch (e) {
      if (isApiError(e) && e.code === "COMMON_VERSION_CONFLICT") void qc.invalidateQueries({ queryKey: keys.users.all });
      setFormError(applyApiError(e, form.setError, CODE_FIELDS));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 border-t border-line pt-4" data-testid="access-form">
      {formError && <Callout tone="critical">{formError}</Callout>}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[13px] font-medium text-ink">
          Roles <span className="font-normal text-ink-3">· what they can see and do</span>
        </legend>
        {locked.map((r) => (
          <p key={r.code} className="flex min-h-8 items-center gap-2 text-[13.5px] text-ink-2">
            <Icon name="lock" className="text-ink-4" />
            {r.label}
            <span className="text-[12px] text-ink-4">can&apos;t be changed here</span>
          </p>
        ))}
        <Controller
          control={form.control}
          name="roleCodes"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5" role="group" aria-label="Roles" aria-invalid={errors.roleCodes ? true : undefined}>
              {roles
                .filter((r) => r.assignable)
                .map((r) => (
                  <label key={r.code} className="flex min-h-8 cursor-pointer items-center gap-2 text-[13.5px] text-ink pointer-coarse:min-h-10">
                    <Checkbox
                      checked={field.value.includes(r.code ?? "")}
                      onChange={(e) => field.onChange(e.target.checked ? [...field.value, r.code ?? ""] : field.value.filter((c) => c !== r.code))}
                      onBlur={field.onBlur}
                    />
                    {r.label}
                  </label>
                ))}
            </div>
          )}
        />
        {errors.roleCodes && <p className="text-[12.5px] text-critical">{errors.roleCodes.message ?? errors.roleCodes.root?.message}</p>}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[13px] font-medium text-ink">
          Branches <span className="font-normal text-ink-3">· where they can work</span>
        </legend>
        {everyBranch ? (
          <p className="text-[13px] text-ink-3">Works at every branch because of their role.</p>
        ) : (
          <Controller
            control={form.control}
            name="branchIds"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5" role="group" aria-label="Branches" aria-invalid={errors.branchIds ? true : undefined}>
                {(options.branches ?? []).map((b) => (
                  <label key={b.id} className="flex min-h-8 cursor-pointer items-center gap-2 text-[13.5px] text-ink pointer-coarse:min-h-10">
                    <Checkbox
                      checked={field.value.includes(b.id ?? "")}
                      onChange={(e) => field.onChange(e.target.checked ? [...field.value, b.id ?? ""] : field.value.filter((id) => id !== b.id))}
                      onBlur={field.onBlur}
                    />
                    {b.name}
                    <span className="font-mono text-[12px] text-ink-3">{b.code}</span>
                    {b.headOffice && <Badge tint="blue">Head office</Badge>}
                  </label>
                ))}
              </div>
            )}
          />
        )}
        {errors.branchIds && !everyBranch && <p className="text-[12.5px] text-critical">{errors.branchIds.message ?? errors.branchIds.root?.message}</p>}
      </fieldset>

      <div className="flex items-center justify-end gap-2">
        {isDirty && (
          <Button variant="ghost" onClick={() => form.reset()}>
            Undo changes
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} disabled={!isDirty} data-testid="access-save">
          Save access
        </Button>
      </div>
    </form>
  );
}

function StatusAction({ user }: { user: StaffUser }) {
  const setActive = useSetUserActive();
  const [confirming, setConfirming] = useState(false);
  const active = user.status === "ACTIVE";
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      {setActive.isError && <Callout tone="critical">{problemMessage(setActive.error, "Couldn't update the account.")}</Callout>}
      {active ? (
        confirming ? (
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-ink-2">
              {user.fullName} won&apos;t be able to sign in. Bills and records they made stay as they are. You can reactivate the account later.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Keep active
              </Button>
              <Button variant="destructive" loading={setActive.isPending} onClick={() => setActive.mutate({ id: user.id ?? "", active: false })} data-testid="deactivate-confirm">
                Deactivate account
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="self-start" onClick={() => setConfirming(true)} data-testid="deactivate">
            <Icon name="user-x" />
            Deactivate…
          </Button>
        )
      ) : (
        <Button variant="outline" className="self-start" loading={setActive.isPending} onClick={() => setActive.mutate({ id: user.id ?? "", active: true })} data-testid="reactivate">
          <Icon name="user-check" />
          Reactivate account
        </Button>
      )}
    </div>
  );
}
