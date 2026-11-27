"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlatformLogin } from "@meno/validation";
import { platformApi } from "@/lib/platformApi";
import { keys } from "@/lib/query/keys";
import { platformSession } from "./session";

const p = keys.platform;

export function usePlatformLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PlatformLogin) => platformApi.post("/api/v1/platform/auth/login", { body }),
    onSuccess: (session) => {
      // A different staff member may sign in on the same tab: drop the previous one's cached lists.
      qc.removeQueries({ queryKey: ["platform"] });
      platformSession.set(session);
    },
  });
}

export function usePlatformSignOut() {
  const qc = useQueryClient();
  return () => {
    platformSession.set(null);
    qc.removeQueries({ queryKey: ["platform"] });
  };
}

export const useReferenceDatasets = () =>
  useQuery({ queryKey: p.datasets, queryFn: () => platformApi.get("/api/v1/platform/reference-data") });

export const useReferenceLoads = (code: string, enabled: boolean) =>
  useQuery({
    queryKey: p.loads(code),
    queryFn: () => platformApi.get("/api/v1/platform/reference-data/{code}/loads", { params: { code } }),
    enabled,
  });

export type ReferenceUpload = { code: string; file: File; sourceDate: string; replaceAnyway: boolean };

/** Refused files are recorded too, so the history refreshes on error as well as on success. */
export function useLoadReferenceFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, file, sourceDate, replaceAnyway }: ReferenceUpload) => {
      const formData = new FormData();
      formData.append("file", file);
      return platformApi.post("/api/v1/platform/reference-data/{code}/loads", {
        params: { code },
        query: { sourceDate, replaceAnyway },
        formData,
      });
    },
    onSettled: (_data, _error, vars) =>
      Promise.all([qc.invalidateQueries({ queryKey: p.datasets }), qc.invalidateQueries({ queryKey: p.loads(vars.code) })]),
  });
}
