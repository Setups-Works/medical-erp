"use client";

import { useSyncExternalStore } from "react";

type Scheme = "light" | "dark";
const listeners = new Set<() => void>();

function current(): Scheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Light / Dark switch (DESIGN_LANGUAGE §2). The choice is a per-browser convenience, so localStorage is fine. */
export function useTheme() {
  const scheme = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    current,
    () => "light" as Scheme,
  );
  const toggle = () => {
    const next: Scheme = scheme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("meno-theme", next);
    } catch {
      /* private mode: the choice lasts for this tab */
    }
    listeners.forEach((l) => l());
  };
  return { scheme, toggle };
}
