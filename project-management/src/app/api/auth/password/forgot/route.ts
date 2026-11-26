import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { body, route } from "@/lib/api";
import { hubUrl, sendMail } from "@/lib/mail";
import { PasswordReset, User } from "@/lib/models";

const TTL_MS = 30 * 60 * 1000; // link lifetime
const COOLDOWN_MS = 60 * 1000; // one email per user per minute

const schema = z.object({ email: z.string().email("Enter a valid email.") });

/** Always answers the same way, so the form can't be used to find out who has an account. */
export const POST = route(
  async (req) => {
    const { email } = await body(req, schema);
    const user = await User.findOne({ email: email.toLowerCase(), active: true }).select("_id email name").lean();
    if (user) {
      const recent = await PasswordReset.exists({ user: user._id, createdAt: { $gt: new Date(Date.now() - COOLDOWN_MS) } });
      if (!recent) {
        const token = randomBytes(32).toString("hex");
        await PasswordReset.create({
          user: user._id,
          tokenHash: createHash("sha256").update(token).digest("hex"),
          expiresAt: new Date(Date.now() + TTL_MS),
        });
        const link = hubUrl(`/reset-password?token=${token}`);
        await sendMail({
          to: user.email,
          subject: "[MENO Hub] Reset your password",
          text: `Hi ${user.name.split(" ")[0]},\n\nSomeone asked to reset your MENO Hub password. Open this link within 30 minutes to choose a new one:\n\n${link}\n\nIf it wasn't you, ignore this email; your password stays the same.\n\n— MENO Hub`,
        });
      }
    }
    return { ok: true };
  },
  { public: true },
);
