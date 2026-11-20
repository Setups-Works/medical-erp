/** Turns lean mongoose docs into JSON-safe objects: ObjectIds → strings, `_id` → `id`, secrets removed. */
export function toJSON<T = Record<string, unknown>>(doc: unknown): T {
  return JSON.parse(
    JSON.stringify(doc, (k, v) => (k === "__v" || k === "passwordHash" ? undefined : v)),
    function (k, v) {
      if (v && typeof v === "object" && !Array.isArray(v) && "_id" in v) {
        const { _id, ...rest } = v as Record<string, unknown>;
        return { id: _id, ...rest };
      }
      return v;
    },
  ) as T;
}
