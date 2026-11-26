#!/usr/bin/env node
/**
 * Design-language guard (docs/design/DESIGN_LANGUAGE.md §13). Scans UI source for things the "paper and ink" rules
 * forbid: raw hex colours, Tailwind default palette, default shadows / radii, text under 11 px, bg-white/black,
 * hand-set fonts, native alert/confirm/prompt, native date inputs and `any`.
 * A real exception: put `design-ok: <reason>` in a comment on the same line.
 *
 * Usage: node scripts/design/check-design.mjs [paths…]   (default: apps/web/src packages/ui/src)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../..", import.meta.url).pathname;
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ["apps/web/src", "packages/ui/src"];
// The token files are the one place colour values live.
const SKIP_FILES = [/packages\/ui\/src\/tokens\//, /\/generated\//, /\/lib\/mocks\//];
const EXT = /\.(tsx?|css)$/;

const PALETTE = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const RULES = [
  { id: "hex-colour", re: /#[0-9a-fA-F]{3,8}\b(?![-\w])/, why: "Use a token (bg-paper, text-ink-2, …), not a hex colour." },
  { id: "tailwind-palette", re: new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|divide|shadow)-(?:${PALETTE})-\\d{2,3}\\b`), why: "Tailwind's default palette is not ours; use tokens." },
  { id: "white-black", re: /\b(?:bg|text|border)-(?:white|black)\b/, why: "Use bg-paper / text-ink (works in Dark too)." },
  { id: "default-shadow", re: /\bshadow-(?:sm|md|lg|xl|2xl)\b/, why: "Cards have no shadow; floating layers use shadow-pop." },
  { id: "default-radius", re: /\brounded-(?:sm|md|lg|xl|2xl|3xl)\b/, why: "Use rounded-xs / tab / ctl / tile / card / dlg / pill." },
  { id: "tiny-text", re: /\btext-\[(?:[0-9]|10)(?:\.\d+)?px\]/, why: "Never below 11 px." },
  { id: "font-family", re: /font-family\s*:|fontFamily\s*:/, why: "Fonts come from the theme (font-sans, font-mono, font-display, font-brand)." },
  { id: "native-dialog", re: /\b(?:window\.)?(?:alert|confirm|prompt)\s*\(/, why: "Use toast / useConfirm from @meno/ui." },
  { id: "native-date", re: /type=["'](?:date|time|datetime-local|month)["']/, why: "Use <DatePicker> from @meno/ui." },
  { id: "any", re: /(?::\s*any\b|\bas\s+any\b|<any>)/, why: "No any: use unknown and narrow." },
];

function* files(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (EXT.test(name)) yield p;
  }
}

let problems = 0;
for (const t of targets) {
  const abs = join(ROOT, t);
  for (const file of files(abs)) {
    const rel = relative(ROOT, file);
    if (SKIP_FILES.some((r) => r.test(rel))) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (line.includes("design-ok:")) return;
      // Skip comment-only lines: docs may mention the rules they follow.
      const code = line.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "");
      if (/^\s*(\*|\/\*)/.test(line)) return;
      for (const rule of RULES) {
        if (rule.re.test(code)) {
          problems += 1;
          console.log(`${rel}:${i + 1}  [${rule.id}] ${rule.why}\n    ${line.trim()}`);
        }
      }
    });
  }
}

if (problems > 0) {
  console.log(`\n✗ check:design found ${problems} problem(s).`);
  process.exit(1);
}
console.log(`✓ check:design: no problems in ${targets.join(", ")}`);
