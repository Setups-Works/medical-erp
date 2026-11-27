"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NewRoleRequest, RenameRoleRequest, RolePermissionsRequest } from "@meno/api-client";
import { api } from "@/lib/api";
import { keys } from "@/lib/query/keys";

// ---------------------------------------------------------------- roles and permissions (identity /admin, PLT-07)

const r = keys.roles;

export const useRoles = () => useQuery({ queryKey: r.list, queryFn: () => api.get("/api/v1/admin/roles") });

export const useRole = (code: string | null) =>
  useQuery({ queryKey: r.detail(code ?? ""), queryFn: () => api.get("/api/v1/admin/roles/{code}", { params: { code: code ?? "" } }), enabled: Boolean(code) });

/** Every permission by module with the roles holding it: the role editor's checklist and the permission matrix. */
export const usePermissionCatalogue = () => useQuery({ queryKey: r.catalogue, queryFn: () => api.get("/api/v1/admin/permissions") });

/**
 * Any role change can move counts, permission lists and the signed-in person's own permissions (and the user
 * screen's role names), so everything role-related is refetched.
 */
function useRoleMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: r.all }), qc.invalidateQueries({ queryKey: keys.me }), qc.invalidateQueries({ queryKey: keys.users.all })]),
  });
}

export const useCreateRole = () => useRoleMutation((body: NewRoleRequest) => api.post("/api/v1/admin/roles", { body }));

export const useRenameRole = () =>
  useRoleMutation(({ code, body }: { code: string; body: RenameRoleRequest }) => api.put("/api/v1/admin/roles/{code}", { params: { code }, body }));

export const useSetRolePermissions = () =>
  useRoleMutation(({ code, body }: { code: string; body: RolePermissionsRequest }) => api.put("/api/v1/admin/roles/{code}/permissions", { params: { code }, body }));

export const useResetRole = () => useRoleMutation((code: string) => api.post("/api/v1/admin/roles/{code}/reset", { params: { code } }));

export const useArchiveRole = () => useRoleMutation((code: string) => api.delete("/api/v1/admin/roles/{code}", { params: { code } }));

/** One matrix cell: give or take one permission from one role. Idempotent on the API, so repeated clicks are safe. */
export const useSetGrant = () =>
  useRoleMutation(({ permission, role, granted }: { permission: string; role: string; granted: boolean }) =>
    granted
      ? api.put("/api/v1/admin/permissions/{permission}/roles/{role}", { params: { permission, role } })
      : api.delete("/api/v1/admin/permissions/{permission}/roles/{role}", { params: { permission, role } }),
  );
