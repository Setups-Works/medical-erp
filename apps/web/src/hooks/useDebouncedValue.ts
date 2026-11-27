"use client";

import { useEffect, useState } from "react";

/** `value` after it has stopped changing for `delayMs` (search boxes: one request per pause, not per key). */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
