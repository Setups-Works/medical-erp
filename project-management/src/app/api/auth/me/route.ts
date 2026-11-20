import { HttpError, route } from "@/lib/api";
import { User } from "@/lib/models";
import { toJSON } from "@/lib/serialize";

export const GET = route(async (_req, { session }) => {
  const user = await User.findById(session.uid).lean();
  if (!user) throw new HttpError(401, "Please sign in.");
  return toJSON(user);
});
