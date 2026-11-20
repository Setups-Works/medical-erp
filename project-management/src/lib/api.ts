import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { connectDb } from "./db";
import { SESSION_COOKIE, verifySession, type Session } from "./session";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export function requireAdmin(s: Session) {
  if (s.role !== "admin") throw new HttpError(403, "Only admins can do that.");
}

export async function body<T>(req: Request, schema: ZodType<T>): Promise<T> {
  const json: unknown = await req.json().catch(() => ({}));
  return schema.parse(json);
}

type Ctx = { params: Promise<unknown> };
type Handler<P> = (req: Request, ctx: { params: P; session: Session }) => Promise<unknown>;

/** Wraps a route handler: connects to MongoDB, checks the session, maps errors to JSON. */
export function route<P = Record<string, string>>(fn: Handler<P>, opts: { public?: boolean } = {}) {
  return async (req: Request, ctx: Ctx) => {
    try {
      await connectDb();
      let session = (await getSession()) as Session;
      if (!session && !opts.public) throw new HttpError(401, "Please sign in.");
      session ??= { uid: "", role: "member", name: "" };
      const params = ((await ctx?.params) ?? {}) as P;
      const out = await fn(req, { params, session });
      return out instanceof Response ? out : NextResponse.json(out ?? { ok: true });
    } catch (err) {
      if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
      if (err instanceof ZodError)
        return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
      console.error("[hub] api error", err);
      return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
    }
  };
}

export function assertId(v: string, what = "item") {
  if (!/^[a-f0-9]{24}$/i.test(v)) throw new HttpError(404, `That ${what} doesn’t exist.`);
}
