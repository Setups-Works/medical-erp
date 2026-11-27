"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { keys } from "@/lib/query/keys";
import { useSessionUser } from "@/lib/session";

/**
 * What the signed-in person may do (`module.resource.action`, ADR-0014), from GET /auth/me. Only for hiding what they
 * can't use: the API checks every call again. Never check role names.
 */
export function usePermissions() {
  const user = useSessionUser();
  const me = useQuery({ queryKey: [...keys.me, user?.id ?? ""], queryFn: () => api.get("/api/v1/auth/me"), enabled: Boolean(user), staleTime: 5 * 60_000 });
  const granted = new Set(me.data?.permissions ?? []);
  return { isPending: me.isPending, isError: me.isError, has: (permission: string) => granted.has(permission) };
}
