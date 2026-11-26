import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const SIGNED_OUT_PAGES = new Set(["/login", "/forgot-password", "/reset-password"]);

/** Sends signed-out visitors to /login for every page (API routes check the session themselves). */
export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = SIGNED_OUT_PAGES.has(req.nextUrl.pathname);
  if (!session && !isPublic) return NextResponse.redirect(new URL("/login", req.url));
  if (session && isPublic) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next|favicon.ico|.*\\.svg$).*)"] };
