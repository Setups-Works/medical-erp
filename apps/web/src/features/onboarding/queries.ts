"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BooksRequest, BranchRequest, BusinessRequest, CompanyRequest, LicencesRequest, TeamInvitationRequest } from "@meno/api-client";
import { api } from "@/lib/api";
import { keys } from "@/lib/query/keys";

const k = keys.onboarding;

export function useChecklist() {
  return useQuery({ queryKey: k.checklist, queryFn: () => api.get("/api/v1/onboarding") });
}

/** Option lists, setting definitions, states, FY start month: rarely change, cached for the session. */
export function useOnboardingOptions() {
  return useQuery({ queryKey: k.options, queryFn: () => api.get("/api/v1/onboarding/options"), staleTime: 30 * 60_000 });
}

export const useBusiness = () => useQuery({ queryKey: k.step("business"), queryFn: () => api.get("/api/v1/onboarding/business") });
export const useCompany = () => useQuery({ queryKey: k.step("company"), queryFn: async () => (await api.get("/api/v1/onboarding/company")) ?? null });
export const useLicences = () => useQuery({ queryKey: k.step("licences"), queryFn: () => api.get("/api/v1/onboarding/licences") });
export const useBranches = () => useQuery({ queryKey: k.step("branches"), queryFn: () => api.get("/api/v1/onboarding/branches") });
export const useBooks = () => useQuery({ queryKey: k.step("books"), queryFn: async () => (await api.get("/api/v1/onboarding/books")) ?? null });
export const useConfiguration = () => useQuery({ queryKey: k.step("configuration"), queryFn: () => api.get("/api/v1/onboarding/configuration") });
export const useReadiness = () => useQuery({ queryKey: k.readiness, queryFn: () => api.get("/api/v1/onboarding/go-live") });

/** Every step write changes the checklist and the go-live checks; the saved step's cache gets the API's answer. */
function useStepMutation<TBody, TResult>(step: string, fn: (body: TBody) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (data) => {
      qc.setQueryData(k.step(step), data);
      await Promise.all([qc.invalidateQueries({ queryKey: k.checklist }), qc.invalidateQueries({ queryKey: k.readiness })]);
    },
  });
}

export const useSaveBusiness = () => useStepMutation("business", (body: BusinessRequest) => api.put("/api/v1/onboarding/business", { body }));
export const useSaveCompany = () => useStepMutation("company", (body: CompanyRequest) => api.put("/api/v1/onboarding/company", { body }));
export const useSaveLicences = () => useStepMutation("licences", (body: LicencesRequest) => api.put("/api/v1/onboarding/licences", { body }));
export const useSaveBooks = () => useStepMutation("books", (body: BooksRequest) => api.put("/api/v1/onboarding/books", { body }));
export const useSaveConfiguration = () =>
  useStepMutation("configuration", (settings: Record<string, string>) => api.put("/api/v1/onboarding/configuration", { body: { settings } }));

export function useSaveBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: BranchRequest }) =>
      id ? api.put("/api/v1/onboarding/branches/{id}", { params: { id }, body }) : api.post("/api/v1/onboarding/branches", { body }),
    onSuccess: () =>
      Promise.all([qc.invalidateQueries({ queryKey: k.step("branches") }), qc.invalidateQueries({ queryKey: k.checklist }), qc.invalidateQueries({ queryKey: k.readiness })]),
  });
}

export function useSkipStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (step: string) => api.post("/api/v1/onboarding/steps/{step}/skip", { params: { step } }),
    onSuccess: (checklist) => {
      qc.setQueryData(k.checklist, checklist);
      return qc.invalidateQueries({ queryKey: k.readiness });
    },
  });
}

export function useGoLive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goLiveDate: string) => api.post("/api/v1/onboarding/go-live", { body: { goLiveDate } }),
    onSuccess: (readiness) => {
      qc.setQueryData(k.readiness, readiness);
      return qc.invalidateQueries({ queryKey: k.checklist });
    },
  });
}

/** GSTIN Fetch (PTY-15): a user-triggered lookup, so a mutation rather than a cached query. */
export function useGstinLookup() {
  return useMutation({ mutationFn: (gstin: string) => api.get("/api/v1/gstin-verifications/{gstin}", { params: { gstin } }) });
}

// ---------------------------------------------------------------- team step (identity /api/v1/team, AUT-09)

const t = keys.team;

/** Invitable roles, the tenant's branches and whether SMS delivery exists; branches change on the branches step. */
export const useTeamOptions = () => useQuery({ queryKey: t.options, queryFn: () => api.get("/api/v1/team/options") });
export const useInvitations = () => useQuery({ queryKey: t.invitations, queryFn: () => api.get("/api/v1/team/invitations", { query: { page: 0, size: 200 } }) });

/** An invite also marks the Team step done, so the checklist is refreshed with the list. */
export function useInviteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TeamInvitationRequest) => api.post("/api/v1/team/invitations", { body }),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: t.invitations }), qc.invalidateQueries({ queryKey: k.checklist })]),
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
