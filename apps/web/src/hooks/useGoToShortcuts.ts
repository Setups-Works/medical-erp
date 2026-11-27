"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { canOpen, goToKeys } from "@/config/nav";
import { usePermissions } from "./usePermissions";

const WINDOW_MS = 1000; // "press G, then the key, within 1 second" (KEYBOARD_SHORTCUTS.md)

/** Typing in a field must never trigger single-letter shortcuts (KEYBOARD_SHORTCUTS.md rule 3). */
export function isTyping(target: EventTarget | null): boolean {
  const el = target as { tagName?: unknown; isContentEditable?: unknown; getAttribute?: (name: string) => string | null } | null;
  if (!el || typeof el.tagName !== "string") return false;
  return el.isContentEditable === true || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.getAttribute?.("role") === "combobox";
}

/**
 * `G` go-to sequences for the menu items that have one in NAVIGATION.md. The full registry (N create keys, list and
 * form keys, the `Ctrl+/` sheet) is NAV-04; this covers the sidebar's part of it.
 */
export function useGoToShortcuts() {
  const router = useRouter();
  const permissions = usePermissions();
  // A ref, so a new permission set doesn't re-bind the listener and lose a pressed G.
  const has = useRef(permissions.has);
  has.current = permissions.has;

  useEffect(() => {
    const keys = goToKeys();
    let armedAt = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      const key = e.key.toLowerCase();
      if (armedAt && Date.now() - armedAt <= WINDOW_MS) {
        armedAt = 0;
        const item = keys.get(key);
        if (!item) return;
        e.preventDefault();
        if (canOpen(item, has.current)) router.push(`${item.route}/`);
        else if (!item.live) toast(`${item.label} isn’t available yet.`, { id: "goto" });
        else toast("You don’t have access to that page.", { id: "goto" });
        return;
      }
      armedAt = key === "g" && !e.shiftKey ? Date.now() : 0;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}
