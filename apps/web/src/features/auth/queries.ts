"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AcceptInvitationRequest, SignupRequest } from "@meno/api-client";
import { api } from "@/lib/api";
import { keys } from "@/lib/query/keys";
import { sessionStore } from "@/lib/session";

/** Restores the session on load from the meno_refresh cookie (one refresh call per page load). */
export function useSession() {
  return useQuery({
    queryKey: keys.session,
    queryFn: async () => sessionStore.get() ?? (await api.refresh()),
    staleTime: Infinity,
    retry: false,
  });
}

function useSignedIn() {
  const qc = useQueryClient();
  return (tokens: Parameters<typeof sessionStore.set>[0]) => {
    sessionStore.set(tokens);
    qc.setQueryData(keys.session, tokens);
    qc.removeQueries({ queryKey: keys.onboarding.all });
  };
}

export function useLogin() {
  const signedIn = useSignedIn();
  return useMutation({
    mutationFn: (body: { identifier: string; password: string }) => api.post("/api/v1/auth/login", { body }),
    onSuccess: signedIn,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/v1/auth/logout"),
    onSettled: () => {
      sessionStore.set(null);
      qc.clear();
    },
  });
}

/** PLT-08: ends every session of this user (all browsers and counter PCs), then this one. */
export function useLogoutAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/v1/auth/logout-all"),
    onSettled: () => {
      sessionStore.set(null);
      qc.clear();
    },
  });
}

export function useSignupOptions() {
  return useQuery({ queryKey: keys.signupOptions, queryFn: () => api.get("/api/v1/auth/signup/options"), staleTime: 10 * 60_000 });
}

export function useSignup() {
  const signedIn = useSignedIn();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: SignupRequest; idempotencyKey: string }) => api.post("/api/v1/auth/signup", { body, idempotencyKey }),
    onSuccess: signedIn,
  });
}

export function useVerificationStatus(enabled = true) {
  return useQuery({ queryKey: keys.verification, queryFn: () => api.get("/api/v1/auth/verification"), enabled });
}

/**
 * Confirms the email link once per token. A query (not a mutation) so the single-use POST is de-duplicated across
 * re-renders and Strict Mode remounts; never retried or refetched.
 */
export function useConfirmEmail(token: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["auth", "verify-email", token],
    queryFn: async () => {
      await api.post("/api/v1/auth/verify-email", { body: { token } });
      await qc.invalidateQueries({ queryKey: keys.verification });
      return true;
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useResendEmail() {
  return useMutation({ mutationFn: () => api.post("/api/v1/auth/verify-email/resend") });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => api.post("/api/v1/auth/password/forgot", { body: { email } }) });
}

export function useResetPassword() {
  return useMutation({ mutationFn: (body: { token: string; password: string }) => api.post("/api/v1/auth/password/reset", { body }) });
}

export function useSendMobileOtp() {
  return useMutation({ mutationFn: () => api.post("/api/v1/auth/verify-mobile/send") });
}

export function useVerifyMobile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api.post("/api/v1/auth/verify-mobile", { body: { code } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.verification }),
  });
}

// Proposed endpoints (contracts/openapi/proposed/auth.yaml) — served by local MSW until meno-api builds them.
export function useInvitation(token: string | null) {
  return useQuery({
    queryKey: keys.invitation(token ?? ""),
    queryFn: () => api.get("/api/v1/invitations/{token}", { params: { token: token ?? "" } }),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useAcceptInvitation(token: string) {
  const signedIn = useSignedIn();
  return useMutation({
    mutationFn: (body: AcceptInvitationRequest) => api.post("/api/v1/invitations/{token}/accept", { params: { token }, body }),
    onSuccess: signedIn,
  });
}

/** Login / sign-up finish: read the checklist to know where to land. */
export function useFetchChecklist() {
  const qc = useQueryClient();
  return () => qc.fetchQuery({ queryKey: keys.onboarding.checklist, queryFn: () => api.get("/api/v1/onboarding") });
}
