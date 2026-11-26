"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { env } from "@/config/env";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: (count, error) => count < 2 && !(error && typeof error === "object" && "status" in error && Number(error.status) < 500), refetchOnWindowFocus: false },
      // Never retry writes automatically: posting must happen once per user intent (AGENTS.md rule 7).
      mutations: { retry: false },
    },
  });
}

/**
 * Starts MSW before the first request — LOCAL DEV ONLY. The literal NODE_ENV check lets the production build drop
 * the mock code completely, so staging and production always use the real meno-api.
 */
function useLocalMocks() {
  const wanted = process.env.NODE_ENV === "development" && env.apiMocking !== "off";
  const [ready, setReady] = useState(!wanted);
  useEffect(() => {
    // Written as an `if` on the literal so webpack prunes the import (and the MSW chunks) from production builds.
    if (process.env.NODE_ENV === "development") {
      const mode = env.apiMocking;
      if (mode === "off") return;
      import("@/lib/mocks/browser")
        .then((m) => m.startMocking(mode))
        .catch((e: unknown) => console.error("MSW failed to start", e))
        .finally(() => setReady(true));
    }
  }, []);
  return ready;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(makeQueryClient);
  const ready = useLocalMocks();
  return (
    <QueryClientProvider client={client}>
      {ready ? children : null}
      <Toaster position="bottom-right" toastOptions={{ className: "!bg-raised !text-ink !shadow-pop !rounded-tile !border-0 !font-sans" }} />
    </QueryClientProvider>
  );
}
