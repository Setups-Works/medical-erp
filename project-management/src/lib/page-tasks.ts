import { Types } from "mongoose";
import { logActivity, notify } from "./actions";
import { Board, PageCheck, ProductItem, Task, nextTaskNumber } from "./models";

/**
 * A page from docs/product/PAGES.md is built by one developer, frontend and backend together (root AGENTS.md §8).
 * It gets two Hub cards, Backend and Frontend, created when someone starts the page, both assigned to them.
 * Shared by the Pages list (/api/pages/task) and `npm run agent-task -- start-page`.
 */

export type Side = "be" | "fe";
export const SIDES: Side[] = ["be", "fe"];
const LABEL: Record<Side, string> = { be: "Backend", fe: "Frontend" };

const CHECKLIST: Record<Side, string[]> = {
  be: [
    "Flyway migration if the data model changes, plus DATA_MODEL.md (or comment: no schema change)",
    "Endpoints with Bean Validation and Problem Details",
    "Integration tests incl. cross-tenant",
    "OpenAPI spec + api-client regenerated",
    "./mvnw verify green",
    "PR opened to develop",
  ],
  fe: [
    "Screen built from packages/ui per DESIGN_LANGUAGE.md",
    "Wired to meno-api via api-client and TanStack Query",
    "Zod form validation",
    "Keyboard, 1280 px and 375 px checked, Light / Dark",
    "pnpm typecheck && pnpm test && pnpm check:design green",
    "PR opened to develop",
  ],
};

type PageDoc = { _id: unknown; group: string; name: string; route: string; notes: string; featureIds: string[]; meta?: Record<string, unknown> | null };

export const pageKey = (p: { group: string; name: string }) => `${p.group}|${p.name}`;
const sourceKey = (side: Side, key: string) => `page:${side}:${key}`;

function description(p: PageDoc, side: Side) {
  return [
    `**Page:** ${p.name} \`${p.route}\``,
    `**What it does:** ${p.notes}`,
    `**Features:** ${p.featureIds.join(", ") || "none"}`,
    "",
    side === "be"
      ? "Build every endpoint this page calls in `backend/meno-api`: Flyway migration if the data model changes, service + controller, integration test with a cross-tenant case, OpenAPI regenerated. If the page needs no backend work, comment that and tick the items."
      : "Build the screen in `apps/web` wired to the real endpoints through `packages/api-client` (MSW mocks only for local dev), Zod validation, keyboard + 1280 / 375 px checks.",
    "",
    "Playbook: docs/team/BUILD_A_PAGE.md. One developer builds frontend + backend (+ SQL) on one branch from `develop`, one PR. Nitheesh reviews and merges.",
  ].join("\n");
}

/** Finds a page by exact route, exact name, or a unique partial name / route match (case-insensitive). */
export async function findPages(query: string) {
  const q = query.trim().toLowerCase().replace(/\s+page$/, "");
  const pages = (await ProductItem.find({ kind: "page" }).sort({ order: 1 }).lean()) as unknown as PageDoc[];
  const exact = pages.filter((p) => p.route.toLowerCase() === q || p.name.toLowerCase() === q || p.route.toLowerCase() === `/${q}`);
  if (exact.length) return exact;
  return pages.filter((p) => p.name.toLowerCase().includes(q) || p.route.toLowerCase().includes(q));
}

export async function pageTasks(p: PageDoc) {
  const key = pageKey(p);
  const check = await PageCheck.findOne({ key }).lean();
  const out: Partial<Record<Side, NonNullable<Awaited<ReturnType<typeof findTask>>>>> = {};
  for (const side of SIDES) {
    const linked = check?.[`${side}Task`];
    const t = (linked ? await findTask({ _id: linked }) : null) ?? (await findTask({ sourceKey: sourceKey(side, key) }));
    if (t) out[side] = t;
  }
  return out;
}
const findTask = (filter: Record<string, unknown>) => Task.findOne({ ...filter, archived: false }).exec();

/**
 * Returns the page's Backend and Frontend cards, creating the missing ones (assigned to `assignee`) and
 * linking them to the page. Never duplicates a card. Unassigned existing cards are given to `assignee`.
 */
export async function ensurePageTasks(p: PageDoc, opts: { actor: string; assignee: string; actorName: string }) {
  const key = pageKey(p);
  const found = await pageTasks(p);
  const phase = String(p.meta?.phase ?? "");
  const board = (await Board.findOne({ kind: "phase", phase, archived: false }).lean()) ?? (await Board.findOne({ kind: "backlog" }).lean());
  if (!board) throw new Error("No board to put the page tasks on.");
  const column = board.columns.some((c) => c.key === "todo") ? "todo" : board.columns[0].key;
  const created: Side[] = [];

  for (const side of SIDES) {
    let t = found[side];
    if (!t) {
      const last = await Task.findOne({ boardId: board._id, column }).sort({ order: -1 }).lean();
      t = await Task.create({
        boardId: board._id,
        column,
        order: (last?.order ?? 0) + 1000,
        number: await nextTaskNumber(),
        title: `${LABEL[side]} · ${p.name} ${p.route}`,
        description: description(p, side),
        phase,
        area: side === "be" ? "backend" : "frontend",
        labels: ["page", side === "be" ? "backend" : "frontend"],
        assignees: [new Types.ObjectId(opts.assignee)],
        checklist: CHECKLIST[side].map((text) => ({ text, done: false })),
        sourceKey: sourceKey(side, key),
        createdBy: opts.actor,
      });
      created.push(side);
      const id = String(t._id);
      await logActivity({ boardId: String(board._id), taskId: id, actor: opts.actor, action: "created task", detail: `#${t.number} ${t.title}` });
      if (opts.assignee !== opts.actor)
        await notify({ users: [opts.assignee], actor: opts.actor, type: "assigned", text: `${opts.actorName} assigned you #${t.number} ${t.title}`, boardId: String(board._id), taskId: id });
    } else if (!t.assignees.length) {
      t.assignees = [new Types.ObjectId(opts.assignee)] as never;
      await t.save();
    }
    found[side] = t;
  }
  await PageCheck.findOneAndUpdate({ key }, { beTask: found.be!._id, feTask: found.fe!._id }, { upsert: true });
  return { be: found.be!, fe: found.fe!, created };
}
