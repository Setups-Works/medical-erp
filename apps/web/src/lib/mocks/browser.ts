import type { MockingMode } from "@/config/env";

/** Starts the MSW service worker. Loaded lazily so mock code never ships when mocking is off. */
export async function startMocking(mode: Exclude<MockingMode, "off">) {
  const [{ setupWorker }, { builtHandlers, proposedHandlers }] = await Promise.all([import("msw/browser"), import("./handlers")]);
  const handlers = mode === "all" ? [...proposedHandlers, ...builtHandlers] : proposedHandlers;
  await setupWorker(...handlers).start({ onUnhandledRequest: "bypass", quiet: true });
}
