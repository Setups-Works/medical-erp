/** Typed public env (NEXT_PUBLIC_* only; the SPA holds no secrets). */
export type MockingMode = "all" | "missing" | "off";

/**
 * MSW mocks are for LOCAL development only. Staging and production builds (`next build` runs with
 * NODE_ENV=production) always talk to the real meno-api and its database, whatever NEXT_PUBLIC_API_MOCKING says.
 */
export const IS_LOCAL_DEV = process.env.NODE_ENV === "development";

function mockingMode(): MockingMode {
  if (!IS_LOCAL_DEV) return "off";
  const v = process.env.NEXT_PUBLIC_API_MOCKING;
  return v === "all" || v === "missing" ? v : "off";
}

export const env = {
  apiMocking: mockingMode(),
  /** "" = same origin (Nginx in production, the dev proxy in next.config.ts). */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
} as const;
