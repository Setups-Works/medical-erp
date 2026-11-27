import { z } from "zod";
import { body, route } from "@/lib/api";
import { logActivity } from "@/lib/actions";
import { publish } from "@/lib/events";
import { completeIfBuilt, syncFeatures } from "@/lib/feature-sync";
import { PageCheck, ProductItem } from "@/lib/models";

const STAGES = ["done", "be", "fe", "qa"] as const;
const LABEL: Record<(typeof STAGES)[number], [string, string]> = {
  done: ["marked page completed", "reopened page"],
  be: ["marked page backend ready", "unmarked page backend ready"],
  fe: ["marked page frontend ready", "unmarked page frontend ready"],
  qa: ["marked page QA passed", "unmarked page QA passed"],
};

const schema = z.object({
  group: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  // Older clients only send `done`, which is the final "completed" tick.
  stage: z.enum(STAGES).default("done"),
  done: z.boolean(),
});

/** Ticks a page from docs/product/PAGES.md: completed, or one of its BE / FE / QA steps. Everyone sees it live. */
export const POST = route(async (req, { session }) => {
  const { group, name, done, ...rest } = await body(req, schema);
  const stage = rest.stage ?? "done";
  const update = stage === "done" ? { done, by: session.uid, doneAt: new Date() } : { [stage]: { done, by: session.uid, at: new Date() } };
  await PageCheck.findOneAndUpdate({ key: `${group}|${name}` }, update, { upsert: true });
  await logActivity({ actor: session.uid, action: LABEL[stage][done ? 0 : 1], detail: `${name} (${group.split(".")[0]})` });
  // BE + FE ready completes the page; a completed page can complete its features (lib/feature-sync.ts).
  let features: number[] = [];
  if (done) {
    const completed = stage === "done" || (await completeIfBuilt(`${group}|${name}`, session.uid));
    if (completed) {
      const page = (await ProductItem.findOne({ kind: "page", group, name }).select("featureIds").lean()) as { featureIds?: string[] } | null;
      features = (await syncFeatures(session.uid, page?.featureIds ?? [])).map((m) => m.number);
    }
  }
  publish({ type: "product.changed", actor: session.uid });
  return { ok: true, features };
});
