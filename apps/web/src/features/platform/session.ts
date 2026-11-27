"use client";

import { useSyncExternalStore } from "react";
import type { PlatformSession, PlatformStaff } from "@meno/api-client";

/**
 * MENO staff session (ADR-0020), separate from the tenant session in lib/session.ts. In memory only and with no
 * refresh cookie: a reload or the token's expiry (1 h) means signing in again, which suits a privileged realm.
 */
let current: PlatformSession | null = null;
const listeners = new Set<() => void>();

export const platformSession = {
  get: () => current,
  accessToken: () => current?.accessToken ?? null,
  set(next: PlatformSession | null) {
    current = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function usePlatformStaff(): PlatformStaff | null {
  return useSyncExternalStore(
    platformSession.subscribe,
    () => platformSession.get()?.staff ?? null,
    () => null,
  );
}
