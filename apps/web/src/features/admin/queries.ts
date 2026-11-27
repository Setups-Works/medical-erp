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
  useRoleMutation(({ code, body, version }: { code: string; body: RenameRoleRequest; version: number }) =>
    api.put("/api/v1/admin/roles/{code}", { params: { code }, body, ifMatch: version }),
  );

export const useSetRolePermissions = () =>
  useRoleMutation(({ code, body, version }: { code: string; body: RolePermissionsRequest; version: number }) =>
    api.put("/api/v1/admin/roles/{code}/permissions", { params: { code }, body, ifMatch: version }),
  );

export const useResetRole = () => useRoleMutation((code: string) => api.post("/api/v1/admin/roles/{code}/reset", { params: { code } }));

export const useArchiveRole = () => useRoleMutation((code: string) => api.delete("/api/v1/admin/roles/{code}", { params: { code } }));
