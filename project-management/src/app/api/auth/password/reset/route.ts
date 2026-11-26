import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { HttpError, body, route } from "@/lib/api";
import { logActivity } from "@/lib/actions";
import { PasswordReset, User } from "@/lib/models";

const schema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/, "This reset link is not valid."),
  password: z.string().min(10, "Use at least 10 characters."),
});

export const POST = route(
  async (req) => {
    const { token, password } = await body(req, schema);
    const tokenHash = createHash("sha256").update(token).digest("hex");
    // Claim the token atomically so the same link can't be used twice in parallel.
    const reset = await PasswordReset.findOneAndUpdate(
      { tokenHash, usedAt: null, expiresAt: { $gt: new Date() } },
      { usedAt: new Date() },
    ).lean();
    if (!reset) throw new HttpError(400, "This reset link has expired or was already used. Ask for a new one.");
    const user = await User.findOne({ _id: reset.user, active: true });
    if (!user) throw new HttpError(400, "This reset link has expired or was already used. Ask for a new one.");
    user.passwordHash = await bcrypt.hash(password, 10);
    user.mustChangePassword = false;
    await user.save();
    await PasswordReset.deleteMany({ user: user._id, usedAt: null });
    await logActivity({ actor: String(user._id), action: "reset their password" });
    return { ok: true };
  },
  { public: true },
);
