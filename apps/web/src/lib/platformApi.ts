import { createApiClient } from "@meno/api-client";
import { env } from "@/config/env";
import { platformSession } from "@/features/platform/session";

/**
 * Client for /api/v1/platform/* (MENO staff, ADR-0020). Never refreshes: a tenant refresh cookie in the same browser
 * must not turn into this client's token. A 401 ends the staff session and the page sends them to sign in.
 */
export const platformApi = createApiClient({
  baseUrl: env.apiBaseUrl,
  getAccessToken: platformSession.accessToken,
  onSession: () => {},
  refreshOnUnauthorized: false,
  onUnauthorized: () => platformSession.set(null),
});
