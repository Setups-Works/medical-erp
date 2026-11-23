import { z } from "zod";
import { HttpError, route } from "@/lib/api";

/*
 * Teaching-only proxy for the Learn lesson "Indian medicine data" (Day 19).
 * DrugDB sends no CORS headers, so the browser can't call it directly. This route also keeps the
 * key server-side, the same pattern MENO's INT-11 adapter will use. Signed-in users only, read-only,
 * nothing stored. Without DRUGDB_API_KEY, DrugDB applies its visitor limits (400 searches a day).
 */
const BASE = "https://drugdb.in/v1";

const query = z.object({
  q: z.string().trim().min(2, "Type at least 2 characters.").max(80, "Search is too long."),
});
const productId = z.string().regex(/^DDID[A-Z0-9]{4,20}$/, "Unknown product.");

async function call(path: string, signal: AbortSignal) {
  const key = process.env.DRUGDB_API_KEY;
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json", ...(key ? { "X-Api-Key": key } : {}) },
    signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
    cache: "no-store",
  }).catch(() => {
    throw new HttpError(502, "Couldn’t reach DrugDB. Try again.");
  });
  if (res.status === 429) throw new HttpError(429, "DrugDB limit reached for now. Try again later.");
  if (res.status === 403) throw new HttpError(403, "The DrugDB key's trial or plan has ended.");
  if (res.status === 404) throw new HttpError(404, "Not found in DrugDB.");
  if (!res.ok) throw new HttpError(502, `DrugDB answered ${res.status}.`);
  return (await res.json()) as unknown;
}

/** GET ?q=dolo → search (8 rows). GET ?id=DDID… → product details. */
export const GET = route(async (req) => {
  const params = new URL(req.url).searchParams;
  const id = params.get("id");
  if (id) return call(`/products/${productId.parse(id)}`, req.signal);
  const { q } = query.parse({ q: params.get("q") ?? "" });
  return call(`/search?q=${encodeURIComponent(q)}&limit=8`, req.signal);
});
