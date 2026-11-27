"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StaffUser, TeamInvitationRequest, UserAccessRequest } from "@meno/api-client";
import { api } from "@/lib/api";
import { keys } from "@/lib/query/keys";

// ---------------------------------------------------------------- invitations (identity /api/v1/team)

const t = keys.team;

/** Invitable roles, the tenant's branches and whether SMS delivery exists; branches change on the branches step. */
export const useTeamOptions = (enabled = true) => useQuery({ queryKey: t.options, queryFn: () => api.get("/api/v1/team/options"), enabled });
export const useInvitations = (enabled = true) =>
  useQuery({ queryKey: t.invitations, queryFn: () => api.get("/api/v1/team/invitations", { query: { page: 0, size: 200 } }), enabled });

/** An invite also marks the onboarding Team step done, so the checklist is refreshed with the list. */
export function useInviteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TeamInvitationRequest) => api.post("/api/v1/team/invitations", { body }),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: t.invitations }), qc.invalidateQueries({ queryKey: keys.onboarding.checklist })]),
  });
}

export function useInvitationAction(action: "resend" | "revoke") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      action === "resend"
        ? api.post("/api/v1/team/invitations/{id}/resend", { params: { id } })
        : api.post("/api/v1/team/invitations/{id}/revoke", { params: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: t.invitations }),
  });
}

// ---------------------------------------------------------------- staff accounts (identity /api/v1/admin/users)

const u = keys.users;
export type UserStatusFilter = "ACTIVE" | "DISABLED" | "ALL";

/** Roles (assignable or not, every-branch or not) and the branches the signed-in person can hand out. */
export const useUserOptions = () => useQuery({ queryKey: u.options, queryFn: () => api.get("/api/v1/admin/users/options") });

/** Staff are a short list (tens), so one page of 200 covers a pharmacy; the search runs on the server. */
export function useStaffUsers(q: string, status: UserStatusFilter) {
  return useQuery({
    queryKey: u.list(q, status),
    queryFn: () => api.get("/api/v1/admin/users", { query: { q: q || undefined, status, page: 0, size: 200 } }),
    placeholderData: keepPreviousData,
  });
}

/** Lists refetch after a change: a status change can move the person out of the current filter. */
function useUserMutation<TVars>(fn: (vars: TVars) => Promise<StaffUser>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: u.all }) });
}

export const useChangeAccess = () =>
  useUserMutation(({ id, body, version }: { id: string; body: UserAccessRequest; version: number }) =>
    api.put("/api/v1/admin/users/{id}/access", { params: { id }, body, ifMatch: version }),
  );

export const useSetUserActive = () =>
  useUserMutation(({ id, active }: { id: string; active: boolean }) =>
    active ? api.post("/api/v1/admin/users/{id}/reactivate", { params: { id } }) : api.post("/api/v1/admin/users/{id}/deactivate", { params: { id } }),
  );
