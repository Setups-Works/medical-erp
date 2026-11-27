"use client";

import { useSyncExternalStore } from "react";

/** Live `matchMedia` result. `false` during the static pre-render. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const m = matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

/** Counter PCs are 1280 px and wider (DESIGN_LANGUAGE §5): there the open sidebar pushes the page instead of covering it. */
export const WIDE = "(min-width: 1280px)";
