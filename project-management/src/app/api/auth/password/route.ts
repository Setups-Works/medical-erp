import bcrypt from "bcryptjs";
import { z } from "zod";
import { HttpError, body, route } from "@/lib/api";
import { User } from "@/lib/models";

const schema = z.object({
  current: z.string().min(1, "Enter your current password."),
  next: z.string().min(10, "Use at least 10 characters."),
});

export const POST = route(async (req, { session }) => {
  const { current, next } = await body(req, schema);
  const user = await User.findById(session.uid);
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) throw new HttpError(400, "Current password is incorrect.");
  user.passwordHash = await bcrypt.hash(next, 10);
  user.mustChangePassword = false;
  await user.save();
  return { ok: true };
});
