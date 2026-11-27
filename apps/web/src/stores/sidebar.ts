"use client";

import { useSyncExternalStore } from "react";

/**
 * Sidebar UI preferences (NAV-01: collapsible rail, remembers open groups). Per-browser convenience, not server data,
 * so localStorage is the right place. `drawer` (the phone overlay) is never remembered.
 */
export type SidebarState = { expanded: boolean; openGroups: string[]; drawer: boolean };

const KEY = "meno-sidebar";
const DEFAULT: SidebarState = { expanded: true, openGroups: ["Dashboard"], drawer: false };
const listeners = new Set<() => void>();
let state: SidebarState | null = null;

function load(): SidebarState {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (raw && typeof raw === "object") {
      const r = raw as Partial<SidebarState>;
      return {
        expanded: typeof r.expanded === "boolean" ? r.expanded : DEFAULT.expanded,
        openGroups: Array.isArray(r.openGroups) ? r.openGroups.filter((g): g is string => typeof g === "string") : DEFAULT.openGroups,
        drawer: false,
      };
    }
  } catch {
    /* unreadable or private mode: defaults */
  }
  return DEFAULT;
}

function get(): SidebarState {
  state ??= load();
  return state;
}

function set(next: SidebarState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify({ expanded: next.expanded, openGroups: next.openGroups }));
  } catch {
    /* the choice lasts for this tab */
  }
  listeners.forEach((l) => l());
}

export const sidebarStore = {
  toggleExpanded: () => set({ ...get(), expanded: !get().expanded }),
  setDrawer: (drawer: boolean) => set({ ...get(), drawer }),
  toggleGroup: (name: string) => {
    const s = get();
    set({ ...s, openGroups: s.openGroups.includes(name) ? s.openGroups.filter((g) => g !== name) : [...s.openGroups, name] });
  },
  /** From the rail: widen the sidebar and open that group. */
  reveal: (name: string) => {
    const s = get();
    set({ ...s, expanded: true, openGroups: s.openGroups.includes(name) ? s.openGroups : [...s.openGroups, name] });
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export function useSidebar(): SidebarState {
  return useSyncExternalStore(sidebarStore.subscribe, get, () => DEFAULT);
}
