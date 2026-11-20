// Bundles docs/team/members/<name>/README.md into src/generated/guides.json so the role guides work on
// serverless hosts (Vercel) where ../docs is not available at runtime. Runs before dev and build.
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(process.cwd(), "../docs/team/members");
const out = path.resolve(process.cwd(), "src/generated/guides.json");
if (!fs.existsSync(dir)) {
  console.log("[guides] ../docs not found; keeping the committed guides.json");
  process.exit(0);
}
const guides = {};
for (const slug of fs.readdirSync(dir)) {
  const file = path.join(dir, slug, "README.md");
  if (!fs.existsSync(file)) continue;
  guides[slug] = fs.readFileSync(file, "utf8").replace(/^# .*\n/, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(guides, null, 2) + "\n");
console.log(`[guides] ${Object.keys(guides).length} role guides bundled`);
