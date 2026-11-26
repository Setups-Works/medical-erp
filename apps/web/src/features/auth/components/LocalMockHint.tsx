"use client";

import { Callout } from "@meno/ui";
import { env } from "@/config/env";

/** Shows demo codes when local mocks are on. Renders nothing in staging / production (mocks are local only). */
export function LocalMockHint({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development" || env.apiMocking === "off") return null;
  return (
    <Callout tone="info" title="Local mock mode" className="mt-4" >
      {children}
    </Callout>
  );
}
