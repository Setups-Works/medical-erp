import { HttpError, assertId, route } from "@/lib/api";
import { User } from "@/lib/models";
import guides from "@/generated/guides.json";

/** The member's role guide, bundled at build time from docs/team/members/<firstname>/README.md. */
export const GET = route<{ id: string }>(async (_req, { params }) => {
  assertId(params.id, "member");
  const user = await User.findById(params.id).select("name").lean();
  if (!user) throw new HttpError(404, "That member doesn’t exist.");
  const slug = user.name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
  return { markdown: (guides as Record<string, string>)[slug] ?? "", source: `docs/team/members/${slug}/README.md` };
});
