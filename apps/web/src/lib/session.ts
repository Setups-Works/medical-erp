/**
 * In-memory session. The access token never touches localStorage (XSS would read it); the refresh token is the
 * HttpOnly meno_refresh cookie, so a reload restores the session with POST /auth/refresh (SECURITY.md).
 */
import { useSyncExternalStore } from "react";
import type { TokenResponse } from "@meno/api-client";

export type SessionUser = TokenResponse["user"];

let tokens: TokenResponse | null = null;
const listeners = new Set<() => void>();

export const sessionStore = {
  get: () => tokens,
  accessToken: () => tokens?.accessToken ?? null,
  set(next: TokenResponse | null) {
    tokens = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useSessionUser(): SessionUser | null {
  return useSyncExternalStore(
    sessionStore.subscribe,
    () => sessionStore.get()?.user ?? null,
    () => null,
  );
}
