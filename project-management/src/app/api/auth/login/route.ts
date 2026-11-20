import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, body, route } from "@/lib/api";
import { User } from "@/lib/models";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

const schema = z.object({ email: z.string().email("Enter a valid email."), password: z.string().min(1, "Enter your password.") });

export const POST = route(
  async (req) => {
    const { email, password } = await body(req, schema);
    const user = await User.findOne({ email: email.toLowerCase(), active: true }).lean();
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !ok) throw new HttpError(401, "Email or password is incorrect.");
    const token = await signSession({ uid: String(user._id), role: user.role as "admin" | "member", name: user.name });
    const res = NextResponse.json({ ok: true, mustChangePassword: user.mustChangePassword });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  },
  { public: true },
);
