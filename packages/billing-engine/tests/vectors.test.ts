import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as engine from "../src";

/**
 * Runs every case in contracts/test-vectors/** (contracts/AGENTS.md). Cases without `input.fn` are whole invoices;
 * others name the engine function. Draft cases run too and are reported as draft in the test name.
 */
const ROOT = path.resolve(__dirname, "../../../contracts/test-vectors");

type Case = { name: string; featureId: string; status?: string; input: Record<string, unknown> & { fn?: string }; expected: unknown };

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return e.name.endsWith(".json") ? [p] : [];
  });
}

const FNS: Record<string, (input: never) => unknown> = {
  looseSale: engine.looseSale,
  allocateBillDiscount: engine.allocateBillDiscount,
  landedCost: engine.landedCost,
  suggestedPtr: engine.suggestedPtr,
  margin: engine.margin,
  weightedAverage: engine.weightedAverage,
  allocatePayment: engine.allocatePayment,
  changeDue: engine.changeDue,
  creditCheck: engine.creditCheck,
  interestSimple: engine.interestSimple,
  interestCompoundMonthly: engine.interestCompoundMonthly,
  tds: engine.tds,
  reorder: engine.reorder,
  expiryStatus: engine.expiryStatus,
  combinedBill: engine.combinedBill,
};

function run(c: Case): unknown {
  const { fn, ...input } = c.input;
  if (!fn) {
    const inv = input as unknown as engine.InvoiceInput & { lines: (engine.LineInput & { gstRate: string })[] };
    return engine.invoiceToStrings(engine.calcInvoice({ mode: inv.mode, intraState: inv.intraState, lines: inv.lines }));
  }
  const f = FNS[fn];
  if (!f) throw new Error(`No engine function for "${fn}"`);
  return f(input as never);
}

const all = files(ROOT);

describe("contracts/test-vectors", () => {
  it("has vector files", () => expect(all.length).toBeGreaterThan(0));
  for (const file of all) {
    const cases = JSON.parse(fs.readFileSync(file, "utf8")) as Case[];
    describe(path.relative(ROOT, file), () => {
      for (const c of cases) {
        it(`${c.featureId} · ${c.name}${c.status === "draft" ? " [draft]" : ""}`, () => {
          expect(run(c)).toEqual(c.expected);
        });
      }
    });
  }
});
