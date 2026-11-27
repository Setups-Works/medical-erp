import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient, type TokenResponse } from "../src";

const tokens = (t: string): TokenResponse => ({
  accessToken: t,
  tokenType: "Bearer",
  expiresIn: 900,
  user: { id: "u", tenantId: "t", email: "a@b.in", fullName: "A", roles: [] },
});

function json(status: number, body: unknown, type = "application/json") {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": type } });
}

describe("api client", () => {
  it("maps Problem Details to ApiError with field errors", async () => {
    const fetch = vi.fn().mockResolvedValue(
      json(422, { status: 422, code: "TENANCY_GSTIN_STATE_MISMATCH", errors: [{ field: "address.stateCode", code: "MISMATCH" }] }, "application/problem+json"),
    );
    const api = createApiClient({ baseUrl: "", getAccessToken: () => "a", onSession: () => {}, fetch });
    const err = await api.put("/api/v1/onboarding/company", { body: undefined as never }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe("TENANCY_GSTIN_STATE_MISMATCH");
    expect((err as ApiError).fieldErrors[0]?.field).toBe("address.stateCode");
  });

  it("refreshes once on 401 and retries with the new token", async () => {
    let token: string | null = "old";
    const seen: string[] = [];
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      const auth = new Headers(init?.headers).get("Authorization") ?? "";
      seen.push(`${url} ${auth}`);
      if (url.endsWith("/auth/refresh")) return json(200, tokens("new"));
      return auth === "Bearer new" ? json(200, { steps: [], nextStep: "BUSINESS", live: false }) : json(401, { code: "UNAUTHORIZED" });
    });
    const api = createApiClient({ baseUrl: "", getAccessToken: () => token, onSession: (t) => (token = t?.accessToken ?? null), fetch: fetch as never });
    const [a, b] = await Promise.all([api.get("/api/v1/onboarding"), api.get("/api/v1/onboarding")]);
    expect(a.steps).toEqual([]);
    expect(b.nextStep).toBe("BUSINESS");
    expect(seen.filter((s) => s.includes("/auth/refresh"))).toHaveLength(1);
  });

  it("never refreshes for the platform client: a 401 ends its session instead (ADR-0020)", async () => {
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) => json(401, { code: "UNAUTHORIZED" }));
    const onSession = vi.fn();
    const onUnauthorized = vi.fn();
    const api = createApiClient({ baseUrl: "", getAccessToken: () => "staff", onSession, refreshOnUnauthorized: false, onUnauthorized, fetch: fetch as never });
    const err = await api.get("/api/v1/platform/reference-data").catch((e: unknown) => e);
    expect((err as ApiError).status).toBe(401);
    expect(fetch.mock.calls.some(([url]) => String(url).includes("/auth/refresh"))).toBe(false);
    expect(onUnauthorized).toHaveBeenCalledOnce();
    expect(onSession).not.toHaveBeenCalled();
  });

  it("sends Idempotency-Key and fills path params", async () => {
    const fetch = vi.fn(async (_url: string, _init: RequestInit) => json(200, { ready: true, live: true }));
    const api = createApiClient({ baseUrl: "http://x", getAccessToken: () => null, onSession: () => {}, fetch: fetch as never });
    await api.post("/api/v1/onboarding/go-live", { body: { goLiveDate: "2026-12-01" }, idempotencyKey: "k-1" });
    await api.get("/api/v1/invitations/{token}", { params: { token: "a b" } });
    expect(new Headers(fetch.mock.calls[0]![1].headers).get("Idempotency-Key")).toBe("k-1");
    expect(fetch.mock.calls[1]![0]).toBe("http://x/api/v1/invitations/a%20b");
  });

  it("sends the loaded version as a quoted If-Match", async () => {
    const fetch = vi.fn(async (_url: string, _init: RequestInit) => json(200, {}));
    const api = createApiClient({ baseUrl: "", getAccessToken: () => null, onSession: () => {}, fetch: fetch as never });
    await api.put("/api/v1/admin/users/{id}/access", { params: { id: "u1" }, body: { roleCodes: ["PHARMACIST"], branchIds: [] }, ifMatch: 3 });
    expect(new Headers(fetch.mock.calls[0]![1].headers).get("If-Match")).toBe('"3"');
  });

  it("turns a network failure into NETWORK_ERROR", async () => {
    const api = createApiClient({ baseUrl: "", getAccessToken: () => null, onSession: () => {}, fetch: vi.fn().mockRejectedValue(new TypeError("offline")) });
    await expect(api.get("/api/v1/auth/signup/options")).rejects.toMatchObject({ code: "NETWORK_ERROR", status: 0 });
  });
});
