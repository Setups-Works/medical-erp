import { z } from "zod";
import { HttpError, route } from "@/lib/api";

/*
 * Teaching-only proxy for the Learn lesson "GSTIN fetch" (Day 22, PTY-15).
 * The public GST verify service sends no CORS headers, so the browser can't call it directly. MENO will
 * call its chosen provider from meno-api the same way (provider and cost still to be decided).
 * Signed-in users only, read-only, nothing stored. Basic details only (`full=false`): full details need
 * a paid key.
 */
const BASE = "https://api.gstverify.dubey.app/api/v1/gst/details";

const query = z.object({
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "That isn't a valid GSTIN format."),
});

/** GET ?gstin=33AAJCN0778N1ZZ → the service's JSON ({ success, data: { lgnm, tradeNam, sts, … } }). */
export const GET = route(async (req) => {
  const { gstin } = query.parse({ gstin: new URL(req.url).searchParams.get("gstin") ?? "" });
  const res = await fetch(`${BASE}?gstin=${encodeURIComponent(gstin)}&full=false`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.any([req.signal, AbortSignal.timeout(8000)]),
    cache: "no-store",
  }).catch(() => {
    throw new HttpError(502, "Couldn’t reach the GST verify service. Try again, or type the details by hand.");
  });
  if (res.status === 400) throw new HttpError(404, "The GST portal doesn’t know this GSTIN. Check the number.");
  if (res.status === 429) throw new HttpError(429, "Too many lookups for now. Wait a minute and try again.");
  if (!res.ok) throw new HttpError(502, `The GST verify service answered ${res.status}. Type the details by hand for now.`);
  const json = (await res.json()) as { success?: boolean; data?: unknown };
  if (!json.success || !json.data) throw new HttpError(404, "The GST portal doesn’t know this GSTIN. Check the number.");
  return json;
});
