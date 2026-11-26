import { createApiClient } from "@meno/api-client";
import { env } from "@/config/env";
import { sessionStore } from "./session";

/** The one configured client (apps/web AGENTS.md). Branch header comes with the app shell (useBranch). */
export const api = createApiClient({
  baseUrl: env.apiBaseUrl,
  getAccessToken: sessionStore.accessToken,
  onSession: sessionStore.set,
});
