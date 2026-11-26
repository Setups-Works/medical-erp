import { useCallback, useRef } from "react";

/**
 * One Idempotency-Key per user intent (apps/web AGENTS.md rule 2): retries of the same submit reuse it, so a
 * network retry can't create a second tenant. Call `reset()` after success or when the input changes meaningfully.
 */
export function useIdempotencyKey() {
  const ref = useRef<string | null>(null);
  const get = useCallback(() => (ref.current ??= crypto.randomUUID()), []);
  const reset = useCallback(() => {
    ref.current = null;
  }, []);
  return { get, reset };
}
