/**
 * Thin fetch wrapper over the generated types (packages/api-client AGENTS.md): base URL, bearer access token,
 * one silent refresh on 401, X-Branch-Id, Idempotency-Key, and Problem Details → ApiError.
 *
 * The access token lives in memory only. The refresh token is the HttpOnly `meno_refresh` cookie scoped to
 * /api/v1/auth, so JavaScript never sees it (SECURITY.md). On a page reload the app calls refresh() to get a new
 * access token from that cookie.
 */
import type { paths as BuiltPaths } from "./generated/meno-api";
import type { paths as ProposedPaths } from "./generated/proposed";
import type { ResponseOverrides } from "./overrides";

export type Paths = BuiltPaths & ProposedPaths;
type Method = "get" | "post" | "put" | "delete";

type Operation<P extends keyof Paths, M extends Method> = Paths[P] extends { [K in M]: infer O } ? (O extends undefined | never ? never : O) : never;
export type PathsWith<M extends Method> = { [P in keyof Paths]: Operation<P, M> extends never ? never : P }[keyof Paths];

type JsonContent<R> = R extends { content: { "application/json": infer B } } ? B : void;
type Responses<O> = O extends { responses: infer R } ? R : never;
export type SuccessBody<O> = Responses<O> extends infer R
  ? R extends { 200: infer S }
    ? JsonContent<S>
    : R extends { 201: infer S }
      ? JsonContent<S>
      : R extends { 202: infer S }
        ? JsonContent<S>
        : void
  : never;
export type RequestBody<O> = O extends { requestBody?: { content: { "application/json": infer B } } } ? B : undefined;
type PathParams<O> = O extends { parameters: { path: infer PP } } ? (PP extends Record<string, unknown> ? PP : undefined) : undefined;

export type Response<P extends keyof Paths, M extends Method> = `${M} ${P & string}` extends keyof ResponseOverrides
  ? ResponseOverrides[`${M} ${P & string}`]
  : SuccessBody<Operation<P, M>>;
export type Body<P extends keyof Paths, M extends Method> = RequestBody<Operation<P, M>>;

export type FieldError = { field: string; code: string; message?: string };

/** Problem Details (RFC 9457) as a typed error. `code` is MODULE_REASON; the UI maps it to friendly text. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string | undefined;
  readonly fieldErrors: FieldError[];
  readonly problem: Record<string, unknown>;

  constructor(status: number, problem: Record<string, unknown>) {
    const code = typeof problem.code === "string" ? problem.code : status === 0 ? "NETWORK_ERROR" : `HTTP_${status}`;
    super(code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.detail = typeof problem.detail === "string" ? problem.detail : undefined;
    this.problem = problem;
    this.fieldErrors = Array.isArray(problem.errors)
      ? (problem.errors as unknown[]).flatMap((e) => {
          if (e && typeof e === "object" && "field" in e && typeof (e as FieldError).field === "string") {
            const fe = e as FieldError;
            return [{ field: fe.field, code: String(fe.code ?? "INVALID"), message: typeof fe.message === "string" ? fe.message : undefined }];
          }
          return [];
        })
      : [];
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export type TokenResponse = Response<"/api/v1/auth/login", "post">;

export type ApiClientConfig = {
  /** "" for same origin (Nginx in production, Next dev rewrites locally). */
  baseUrl: string;
  getAccessToken: () => string | null;
  /** Called after login / refresh / signup with the new tokens, or null when the session ends. */
  onSession: (tokens: TokenResponse | null) => void;
  getBranchId?: () => string | null;
  fetch?: typeof fetch;
};

type RequestOptions<O> = {
  params?: PathParams<O>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: RequestBody<O>;
  formData?: FormData;
  idempotencyKey?: string;
  /** Optimistic concurrency: the version you loaded, sent as `If-Match: "3"` (API_GUIDELINES.md, ETag = version). */
  ifMatch?: number;
  signal?: AbortSignal;
};

const NO_REFRESH = new Set(["/api/v1/auth/login", "/api/v1/auth/refresh", "/api/v1/auth/logout", "/api/v1/auth/signup"]);

export function createApiClient(config: ApiClientConfig) {
  const doFetch = config.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  let refreshing: Promise<TokenResponse | null> | null = null;

  function buildUrl(path: string, params?: Record<string, unknown>, query?: RequestOptions<unknown>["query"]) {
    let url = path.replace(/\{(\w+)\}/g, (_, k: string) => encodeURIComponent(String(params?.[k] ?? "")));
    if (query) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) if (v !== undefined) qs.set(k, String(v));
      const s = qs.toString();
      if (s) url += `?${s}`;
    }
    return config.baseUrl + url;
  }

  async function send(method: Method, path: string, opts: RequestOptions<unknown>, retried: boolean): Promise<unknown> {
    const headers = new Headers({ Accept: "application/json, application/problem+json" });
    const token = config.getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const branch = config.getBranchId?.();
    if (branch) headers.set("X-Branch-Id", branch);
    if (opts.idempotencyKey) headers.set("Idempotency-Key", opts.idempotencyKey);
    if (opts.ifMatch !== undefined) headers.set("If-Match", `"${opts.ifMatch}"`);
    let body: BodyInit | undefined;
    if (opts.formData) body = opts.formData;
    else if (opts.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(opts.body);
    }

    let res: globalThis.Response;
    try {
      res = await doFetch(buildUrl(path, opts.params as Record<string, unknown> | undefined, opts.query), {
        method: method.toUpperCase(),
        headers,
        body,
        // The refresh cookie is path-scoped to /api/v1/auth; "include" also covers a separate API origin in dev.
        credentials: "include",
        signal: opts.signal,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") throw e;
      throw new ApiError(0, { title: "Network error" });
    }

    if (res.status === 401 && !retried && !NO_REFRESH.has(path) && token) {
      const renewed = await refresh();
      if (renewed) return send(method, path, opts, true);
    }
    if (res.status === 204 || (res.status === 202 && res.headers.get("content-length") === "0")) return undefined;
    const text = await res.text();
    const json: unknown = text ? safeJson(text) : undefined;
    if (!res.ok) throw new ApiError(res.status, (json && typeof json === "object" ? json : { title: res.statusText }) as Record<string, unknown>);
    return json;
  }

  /** Single-flight: parallel 401s share one refresh call (a second call would trip reuse detection). */
  function refresh(): Promise<TokenResponse | null> {
    refreshing ??= (async () => {
      try {
        const tokens = (await send("post", "/api/v1/auth/refresh", {}, true)) as TokenResponse;
        config.onSession(tokens);
        return tokens;
      } catch {
        config.onSession(null);
        return null;
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  }

  return {
    get<P extends PathsWith<"get">>(path: P, opts: RequestOptions<Operation<P, "get">> = {}) {
      return send("get", path as string, opts as RequestOptions<unknown>, false) as Promise<Response<P, "get">>;
    },
    post<P extends PathsWith<"post">>(path: P, opts: RequestOptions<Operation<P, "post">> = {}) {
      return send("post", path as string, opts as RequestOptions<unknown>, false) as Promise<Response<P, "post">>;
    },
    put<P extends PathsWith<"put">>(path: P, opts: RequestOptions<Operation<P, "put">> = {}) {
      return send("put", path as string, opts as RequestOptions<unknown>, false) as Promise<Response<P, "put">>;
    },
    delete<P extends PathsWith<"delete">>(path: P, opts: RequestOptions<Operation<P, "delete">> = {}) {
      return send("delete", path as string, opts as RequestOptions<unknown>, false) as Promise<Response<P, "delete">>;
    },
    refresh,
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
