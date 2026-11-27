"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { keys } from "@/lib/query/keys";
import { nextRoute } from "./utils";

/** After a step saves: read the fresh checklist and open the next step that still needs doing. */
export function useGoNext(code: string) {
  const qc = useQueryClient();
  const router = useRouter();
  return async () => {
    const checklist = await qc.fetchQuery({ queryKey: keys.onboarding.checklist, queryFn: () => api.get("/api/v1/onboarding"), staleTime: 0 });
    router.push(nextRoute(checklist, code));
  };
}
