import type { TaskT } from "./types";

/**
 * A person's tasks in work order. Planned tasks carry a global `rank` from the seed (docs order);
 * hand-made tasks (rank 0) go after them. Step N is the position in that list, so it stays stable
 * when tasks move between columns.
 */
export function withSteps(tasks: TaskT[] | undefined) {
  const sorted = [...(tasks ?? [])].sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity) || a.number - b.number);
  const step = new Map(sorted.map((t, i) => [t.id, i + 1]));
  const next = sorted.find((t) => t.column !== "done");
  return { sorted, step, next, total: sorted.length };
}
