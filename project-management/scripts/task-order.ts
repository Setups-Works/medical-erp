/**
 * Writes docs/team/members/<name>/TASK_ORDER.md: every task for that person in the order to do it.
 * Same order as the "Step" numbers in MENO Hub (both come from the rank the seed computes).
 *   npm run task-order      (no database needed: reads ../docs only)
 */
import fs from "node:fs";
import path from "node:path";
import { PHASES } from "../src/lib/models";
import { TEAM, buildDrafts, docsDir } from "../src/lib/seed-runner";

const TYPE: Record<string, string> = {
  plan: "Groundwork",
  compliance: "Confirm rule",
  feature: "Feature",
  ready: "Readiness",
  runbook: "Runbook",
  scenario: "Critical scenario",
  qa: "QA",
  gate: "Phase gate",
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

const dir = docsDir();
if (!dir) throw new Error("docs folder not found (run from project-management/ or set MENO_DOCS_PATH)");
const drafts = buildDrafts(dir).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

for (const member of TEAM) {
  const mine = drafts.filter((d) => d.owners.includes(member.slug as never));
  const lines = [
    `# ${member.name} — task order`,
    "",
    "> **Generated** by `npm run task-order` in `project-management/` from the docs. Don't edit by hand: change the plan docs or `docs/team/OWNERSHIP_MATRIX.md`, then re-run it.",
    "> The Step numbers are the same as in MENO Hub → **My tasks**, where every task has its full description and checklist.",
    "",
    "**How to use it:** work from the lowest open step. Finish a step (merged, checklist ticked, card in Done) before starting the next. If you are blocked, take the next step and say so at stand-up. Tasks shared with someone show who in **With**.",
    "",
    `**${mine.length} tasks** · ` + PHASES.map((p) => [p.key, mine.filter((d) => d.phase === p.key).length] as const).filter(([, n]) => n).map(([k, n]) => `${k}: ${n}`).join(" · "),
    "",
  ];
  let step = 0;
  for (const p of PHASES) {
    const items = mine.filter((d) => d.phase === p.key);
    if (!items.length) continue;
    lines.push(`## ${p.key} · ${p.name} (${items.length})`, "", "| Step | Task | Type | With |", "|---|---|---|---|");
    for (const d of items) {
      step++;
      const done = d.column === "done";
      const others = d.owners.filter((o) => o !== member.slug).map(cap).join(", ") || "—";
      lines.push(`| ${step} | ${done ? "✅ " : ""}${cell(d.title)} | ${TYPE[d.sourceKey.split(":")[0]] ?? "Task"} | ${others} |`);
    }
    lines.push("");
  }
  const out = path.join(dir, "team/members", member.slug, "TASK_ORDER.md");
  fs.writeFileSync(out, lines.join("\n"));
  console.log(`${member.slug.padEnd(10)} ${String(mine.length).padStart(4)} tasks → ${path.relative(process.cwd(), out)}`);
}
