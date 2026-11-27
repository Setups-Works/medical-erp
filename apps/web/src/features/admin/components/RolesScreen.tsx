"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Callout, Icon, PageHeader, Skeleton, cn } from "@meno/ui";
import { usePermissions } from "@/hooks/usePermissions";
import { problemMessage } from "@/lib/problem";
import { usePermissionCatalogue, useRoles } from "../queries";
import { peopleCount, roleBadges } from "../utils";
import { NewRoleForm } from "./NewRoleForm";
import { RoleEditor } from "./RoleEditor";

/**
 * /admin/roles (PLT-07): MENO's default roles and the business's own, what each may do, who holds it. Keyboard: Tab
 * through the list, Enter opens a role, Esc closes the panel. Changes need identity.role.manage; the API checks too.
 */
export function RolesScreen() {
  const permissions = usePermissions();
  const canManage = permissions.has("identity.role.manage");
  const roles = useRoles();
  const catalogue = usePermissionCatalogue();
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const panelOpen = creating || selected !== null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setCreating(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const list = roles.data ?? [];
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Administration"
        title="Roles"
        description="A role is a set of permissions. Use MENO's roles as they are, change what they allow, or make your own."
        actions={
          canManage && (
            <Button
              onClick={() => {
                setSelected(null);
                setCreating(true);
              }}
              data-testid="role-new"
            >
              <Icon name="shield" />
              New role
            </Button>
          )
        }
        className="mb-0"
      />

      {roles.isError || catalogue.isError ? (
        <Callout
          tone="critical"
          action={
            <Button variant="outline" size="sm" onClick={() => void Promise.all([roles.refetch(), catalogue.refetch()])}>
              Try again
            </Button>
          }
        >
          {problemMessage(roles.error ?? catalogue.error, "Couldn't load the roles.")}
        </Callout>
      ) : (
        <div className={cn("grid items-start gap-4", panelOpen && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]")}>
          {roles.isPending ? (
            <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-tile shadow-[inset_0_0_0_1px_var(--line)]" data-testid="role-list">
              {list.map((r) => (
                <li key={r.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setCreating(false);
                      setSelected(r.code ?? null);
                    }}
                    aria-current={selected === r.code ? "true" : undefined}
                    className={cn("flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-hover", selected === r.code && "bg-accent-wash")}
                  >
                    <span className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-ink">
                      {r.label}
                      {roleBadges(r).map((b) => (
                        <Badge key={b.label} tint={b.tint}>
                          {b.label}
                        </Badge>
                      ))}
                    </span>
                    {r.description && <span className="line-clamp-2 text-[12.5px] text-ink-3">{r.description}</span>}
                    <span className="text-[12px] text-ink-4">
                      {peopleCount(r.activeUsers, r.totalUsers)} · {r.locked ? "all permissions" : `${r.permissionCount} ${r.permissionCount === 1 ? "permission" : "permissions"}`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {panelOpen && catalogue.data && roles.data && (
            <div className="order-first lg:order-none">
              {creating ? (
                <NewRoleForm
                  roles={list}
                  onCreated={(code) => {
                    setCreating(false);
                    setSelected(code);
                  }}
                  onCancel={() => setCreating(false)}
                />
              ) : selected ? (
                <RoleEditor key={selected} code={selected} catalogue={catalogue.data} canManage={canManage} onClose={() => setSelected(null)} />
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
