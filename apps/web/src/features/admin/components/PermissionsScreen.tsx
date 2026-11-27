"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Callout, Checkbox, Icon, Input, PageHeader, Skeleton, cn } from "@meno/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { problemMessage } from "@/lib/problem";
import { usePermissionCatalogue, useSetGrant } from "../queries";
import { filterCatalogue } from "../utils";

/**
 * /admin/permissions (PLT-07): every permission (rows, grouped by module) against every role (columns). Ticking a
 * box gives that role the permission straight away; nothing is shown as saved before the API says so. The
 * Business owner column is locked on. Keyboard: Tab moves through the boxes, Space toggles.
 */
export function PermissionsScreen() {
  const permissions = usePermissions();
  const canManage = permissions.has("identity.role.manage");
  const catalogue = usePermissionCatalogue();
  const grant = useSetGrant();
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState("");

  const roles = catalogue.data?.roles ?? [];
  const modules = catalogue.data ? filterCatalogue(catalogue.data, q) : [];

  const toggle = (permission: string, description: string, role: string, roleLabel: string, granted: boolean) => {
    const key = `${permission}|${role}`;
    setPending((p) => new Set(p).add(key));
    grant.mutate(
      { permission, role, granted },
      {
        onSuccess: () => setAnnouncement(`${roleLabel}: ${granted ? "can now" : "can no longer"} ${description.charAt(0).toLowerCase()}${description.slice(1)}.`),
        onSettled: () =>
          setPending((p) => {
            const next = new Set(p);
            next.delete(key);
            return next;
          }),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Administration"
        title="Permissions"
        description="Who can do what, one permission at a time. A tick gives that role the permission; changes apply within 30 seconds."
        className="mb-0"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex items-center sm:w-[320px]">
          <Icon name="search" className="pointer-events-none absolute left-3 text-ink-3" />
          <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search permissions" aria-label="Search permissions" className="pl-9" />
        </div>
        <p className="text-[12.5px] text-ink-3 sm:ml-auto">
          Change a whole role at once on{" "}
          <Link href="/admin/roles/" className="underline underline-offset-2 hover:text-ink">
            Roles
          </Link>
          , where you can also reset a role to MENO&apos;s list.
        </p>
      </div>

      {!canManage && permissions.has("identity.role.view") && <Callout tone="info">You can see permissions but not change them.</Callout>}
      {grant.isError && <Callout tone="critical">{problemMessage(grant.error, "Couldn't change the permission.")}</Callout>}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {catalogue.isError ? (
        <Callout
          tone="critical"
          action={
            <Button variant="outline" size="sm" onClick={() => void catalogue.refetch()}>
              Try again
            </Button>
          }
        >
          {problemMessage(catalogue.error, "Couldn't load the permissions.")}
        </Callout>
      ) : catalogue.isPending ? (
        <Skeleton className="h-96" />
      ) : modules.length === 0 ? (
        <p className="rounded-tile py-10 text-center text-[13.5px] text-ink-3 shadow-[inset_0_0_0_1px_var(--line)]">No permission matches. Try another word.</p>
      ) : (
        <>
          <p className="text-[12px] text-ink-4 md:hidden">Scroll sideways to see every role.</p>
          <div className="overflow-x-auto rounded-tile shadow-[inset_0_0_0_1px_var(--line)]">
            <table className="w-full border-collapse text-[13px]" data-testid="permission-matrix">
              <thead>
                <tr className="bg-side text-[12.5px] font-medium text-ink-3">
                  <th scope="col" className="sticky left-0 z-[1] min-w-[170px] bg-side sm:min-w-[220px] px-4 py-2 text-left font-medium">
                    Permission
                  </th>
                  {roles.map((r) => (
                    <th key={r.code} scope="col" className="min-w-[92px] px-2 py-2 text-center align-bottom font-medium">
                      <span className="flex flex-col items-center gap-0.5">
                        {r.locked && <Icon name="lock" className="size-3 text-ink-4" label="Locked" />}
                        <span className={cn(r.custom && "text-ink-2")}>{r.label}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              {modules.map((m) => (
                <tbody key={m.code} className="border-t border-line">
                  <tr>
                    <th scope="colgroup" colSpan={roles.length + 1} className="sticky left-0 bg-paper px-4 pt-3 pb-1 text-left text-[12px] font-medium text-ink-4">
                      {m.label}
                    </th>
                  </tr>
                  {(m.permissions ?? []).map((p) => (
                    <tr key={p.code} className="border-t border-line hover:bg-hover">
                      <th scope="row" className="sticky left-0 z-[1] bg-paper px-4 py-2 text-left font-normal">
                        <span className="block text-ink">{p.description}</span>
                        <span className="block font-mono text-[11.5px] text-ink-4">{p.code}</span>
                      </th>
                      {roles.map((r) => {
                        const held = Boolean(r.locked) || (p.roleCodes ?? []).includes(r.code ?? "");
                        const busy = pending.has(`${p.code}|${r.code}`);
                        return (
                          <td key={r.code} className="px-2 py-2 text-center">
                            <Checkbox
                              checked={held}
                              disabled={!canManage || Boolean(r.locked) || busy}
                              aria-busy={busy || undefined}
                              aria-label={`${r.label}: ${p.description}`}
                              onChange={(e) => toggle(p.code ?? "", p.description ?? "", r.code ?? "", r.label ?? "", e.target.checked)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </>
      )}
    </div>
  );
}
