"use client";

import { ArrowLeft, Check, Plus, RotateCcw, ScanBarcode, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { calcInvoice, type InvoiceOut, type Party, purchaseVoucher, salesVoucher } from "@/lib/learn/invoice";
import { SHOP, WALK_IN } from "@/lib/learn/examples";
import { type Money, add, fmt, m } from "@/lib/learn/money";
import { Kbd } from "../ui";
import { Chips, F, FieldGuide, type Guide, MEDS, type Med, NextBar, ROLE_DISC_CAP, RX, STATES, SaveButton, SavedNote, Screen, TODAY, box, cellInput, expiryError, inputCls } from "./erp-demo-kit";
import { type Customer, PartyStep, ProductStep, type Vendor } from "./erp-demo-masters";
import { WholesaleStep, type WholesaleResult } from "./erp-demo-wholesale";
import { InvoiceView, LedgerView, Table, VoucherView } from "./kit";

/*
 * A click-through rehearsal of MENO's first day: add a vendor, a customer and a ledger, stock up with a purchase,
 * bill at the POS, then see stock, vouchers and party ledgers. Everything lives in React state and resets on reload.
 * All names, GSTINs and licence numbers are made up. GST rates and option lists are illustrative: in MENO they come
 * from configuration and the API (AGENTS.md rule 13), never from the screen.
 */

type GroupDef = { name: string; nature: "Asset" | "Liability" | "Equity" | "Income" | "Expense" };
const GROUPS: GroupDef[] = [
  { name: "Capital Account", nature: "Equity" },
  { name: "Duties & Taxes", nature: "Liability" },
  { name: "Sundry Creditors", nature: "Liability" },
  { name: "Cash-in-hand", nature: "Asset" },
  { name: "Bank Accounts", nature: "Asset" },
  { name: "Sundry Debtors", nature: "Asset" },
  { name: "Input Tax Credit", nature: "Asset" },
  { name: "Sales Accounts", nature: "Income" },
  { name: "Indirect Incomes", nature: "Income" },
  { name: "Purchase Accounts", nature: "Expense" },
  { name: "Indirect Expenses", nature: "Expense" },
];

type Ledger = { name: string; group: string; opening: string; side: "Dr" | "Cr"; kind: "system" | "party" | "user" };
const SYSTEM_LEDGERS: Ledger[] = [
  ["Owner's Capital", "Capital Account"],
  ["Output CGST", "Duties & Taxes"],
  ["Output SGST", "Duties & Taxes"],
  ["Output IGST", "Duties & Taxes"],
  ["Cash", "Cash-in-hand"],
  ["Bank Account", "Bank Accounts"],
  ["Card / UPI Clearing", "Bank Accounts"],
  ["Input CGST", "Input Tax Credit"],
  ["Input SGST", "Input Tax Credit"],
  ["Input IGST", "Input Tax Credit"],
  ["Sales", "Sales Accounts"],
  ["Round Off", "Indirect Incomes"],
  ["Purchase", "Purchase Accounts"],
].map(([name, group]) => ({ name, group, opening: "0", side: "Dr", kind: "system" }));

/* ---------- State ---------- */

type BatchRow = { medId: string; batch: string; expiry: string; qty: string; free: string; ptr: string; mrp: string };
type Movement = { date: string; doc: string; medId: string; batch: string; qtyIn: number; qtyOut: number; loc?: string };
type Stock = { medId: string; batch: string; expiry: string; mrp: string; qty: number };
type CartLine = { medId: string; batch: string; qty: string; disc: string };

type Sale = { inv: InvoiceOut; payment: string; customer?: Customer };

const STEPS = [
  { key: "start", label: "Start" },
  { key: "vendor", label: "Vendor" },
  { key: "customer", label: "Customer" },
  { key: "ledger", label: "Ledger" },
  { key: "product", label: "Product" },
  { key: "purchase", label: "Purchase" },
  { key: "pos", label: "POS" },
  { key: "wholesale", label: "Wholesale invoice" },
  { key: "result", label: "What happened" },
] as const;

const partyOf = (p: { name: string; state: string; gstin?: string; dl?: string; phone?: string; address?: string }): Party => {
  const s = STATES.find((x) => x.code === p.state) ?? STATES[0];
  return { name: p.name, address: p.address || "—", state: s.name, stateCode: s.code, gstin: p.gstin || undefined, dl: p.dl || undefined, phone: p.phone ? `+91 ${p.phone}` : undefined };
};

export function ErpWalkthrough() {
  const [step, setStep] = useState(0);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [userLedgers, setUserLedgers] = useState<Ledger[]>([]);
  const [purchase, setPurchase] = useState<InvoiceOut | null>(null);
  const [stock, setStock] = useState<Stock[]>([]);
  const [moves, setMoves] = useState<Movement[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [wsale, setWsale] = useState<WholesaleResult | null>(null);
  const [meds, setMeds] = useState<Med[]>(MEDS);

  const reset = () => {
    setStep(0);
    setVendor(null);
    setCustomer(null);
    setUserLedgers([]);
    setPurchase(null);
    setStock([]);
    setMoves([]);
    setSales([]);
    setWsale(null);
    setMeds(MEDS);
  };

  const done = [true, !!vendor, !!customer, userLedgers.length > 0, meds.length > MEDS.length, !!purchase, sales.length > 0, !!wsale, sales.length > 0];
  const go = (i: number) => setStep(Math.max(0, Math.min(STEPS.length - 1, i)));

  const ledgers: Ledger[] = [
    ...SYSTEM_LEDGERS,
    ...(vendor ? [{ name: vendor.name, group: "Sundry Creditors", opening: vendor.opening || "0", side: "Cr" as const, kind: "party" as const }] : []),
    ...(customer ? [{ name: customer.name, group: "Sundry Debtors", opening: "0", side: "Dr" as const, kind: "party" as const }] : []),
    ...userLedgers,
  ];

  return (
    <div className="space-y-4 print:hidden">
      {/* Stepper */}
      <ol className="flex flex-wrap gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s.key}>
            <button
              onClick={() => go(i)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-[12.5px] font-medium transition-colors",
                i === step ? "bg-ink text-paper" : "bg-raised text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover",
              )}
            >
              <span className={cn("flex size-4 items-center justify-center rounded-pill text-[10.5px]", i === step ? "bg-paper/20" : "bg-sunken")}>
                {done[i] && i > 0 ? <Check className="size-3" /> : i + 1}
              </span>
              {s.label}
            </button>
          </li>
        ))}
        <li className="ml-auto">
          <button onClick={reset} className="inline-flex h-8 items-center gap-1.5 rounded-ctl px-3 text-[12.5px] text-ink-3 hover:bg-hover hover:text-ink">
            <RotateCcw className="size-3.5" /> Reset demo
          </button>
        </li>
      </ol>

      {step === 0 && <StartStep onNext={() => go(1)} />}
      {step === 1 && <PartyStep key="supplier" role="supplier" saved={vendor} onSave={(v) => setVendor(v as Vendor)} onBack={() => go(0)} onNext={() => go(2)} />}
      {step === 2 && <PartyStep key="customer" role="customer" saved={customer} onSave={(c) => setCustomer(c as Customer)} onBack={() => go(1)} onNext={() => go(3)} />}
      {step === 3 && <LedgerStep ledgers={ledgers} onAdd={(l) => setUserLedgers((x) => [...x, l])} onRemove={(n) => setUserLedgers((x) => x.filter((l) => l.name !== n))} onBack={() => go(2)} onNext={() => go(4)} />}
      {step === 4 && <ProductStep meds={meds} vendorName={vendor?.name} onSave={(x) => setMeds([...MEDS, x])} onBack={() => go(3)} onNext={() => go(5)} />}
      {step === 5 && (
        <PurchaseStep
          meds={meds}
          vendor={vendor}
          posted={purchase}
          onGoVendor={() => go(1)}
          onPost={(inv, rows, docNo) => {
            setPurchase(inv);
            setStock(rows.map((r) => ({ medId: r.medId, batch: r.batch, expiry: r.expiry, mrp: r.mrp, qty: Number(r.qty) + Number(r.free || "0") })));
            setMoves(rows.map((r) => ({ date: TODAY, doc: docNo, medId: r.medId, batch: r.batch, qtyIn: Number(r.qty) + Number(r.free || "0"), qtyOut: 0 })));
          }}
          onBack={() => go(4)}
          onNext={() => go(6)}
        />
      )}
      {step === 6 && (
        <PosStep
          meds={meds}
          stock={stock}
          customer={customer}
          billNo={`AM/26-27/${String(124 + sales.length).padStart(6, "0")}`}
          lastSale={sales[sales.length - 1]}
          onGoPurchase={() => go(5)}
          onSave={(sale, lines) => {
            setSales((s) => [...s, sale]);
            setStock((st) => st.map((b) => ({ ...b, qty: b.qty - lines.filter((l) => l.medId === b.medId && l.batch === b.batch).reduce((a, l) => a + Number(l.qty), 0) })));
            setMoves((mv) => [...mv, ...lines.map((l) => ({ date: TODAY, doc: sale.inv.number, medId: l.medId, batch: l.batch, qtyIn: 0, qtyOut: Number(l.qty) }))]);
          }}
          onBack={() => go(5)}
          onNext={() => go(7)}
        />
      )}
      {step === 7 && (
        <WholesaleStep
          meds={meds}
          stock={stock}
          customer={customer}
          posted={wsale}
          onGoPurchase={() => go(5)}
          onPost={(r) => {
            // A re-post replaces the earlier demo invoice: undo its stock effect first.
            const undo = wsale?.moves ?? [];
            const delta = (mv: { medId: string; batch: string; qtyIn: number; qtyOut: number; loc: string }, k: 1 | -1) => (b: Stock) =>
              b.medId === mv.medId && b.batch === mv.batch && !mv.loc.startsWith("Dump") ? { ...b, qty: b.qty + k * (mv.qtyIn - mv.qtyOut) } : b;
            setStock((st) => {
              let next = st;
              for (const mv of undo) next = next.map(delta(mv, -1));
              for (const mv of r.moves) next = next.map(delta(mv, 1));
              return next;
            });
            setMoves((mv) => [...mv.filter((x) => !x.doc.startsWith("WS/") && !x.doc.startsWith("CN/")), ...r.moves.map((x) => ({ date: TODAY, doc: x.loc.startsWith("Dump") ? r.creditNotes[r.creditNotes.length - 1] : x.qtyIn ? r.creditNotes[0] : r.number, ...x }))]);
            setWsale(r);
          }}
          onBack={() => go(6)}
          onNext={() => go(8)}
        />
      )}
      {step === 8 && <ResultStep meds={meds} vendor={vendor} customer={customer} purchase={purchase} sales={sales} wsale={wsale} stock={stock} moves={moves} onBack={() => go(7)} onGoPos={() => go(6)} />}
    </div>
  );
}

/* ---------- Step 0: start ---------- */

function StartStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Screen route="/onboarding" title="Already done before day one: company set-up">
        <div className="grid gap-3 text-[13px] sm:grid-cols-2">
          <div className="rounded-tile bg-side px-3.5 py-3">
            <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-4">Company and branch</p>
            <p className="font-semibold text-ink">{SHOP.name}</p>
            <p className="text-ink-3">{SHOP.address}</p>
            <p className="font-mono text-[12px] text-ink-2">GSTIN {SHOP.gstin}</p>
            <p className="font-mono text-[12px] text-ink-2">DL {SHOP.dl}</p>
          </div>
          <div className="rounded-tile bg-side px-3.5 py-3">
            <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-4">Created automatically</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink-2 marker:text-ink-4">
              <li>Financial year 2026-27, number series per branch (AM/26-27/…)</li>
              <li>Default ledger groups and {SYSTEM_LEDGERS.length}+ system ledgers (Cash, Sales, GST…)</li>
              <li>Users and roles (owner, pharmacist, billing operator)</li>
              <li>License activated, so the Retail modules are switched on</li>
            </ul>
          </div>
        </div>
      </Screen>
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          ["1 · Masters", "Vendor, customer, ledger: who we buy from, who we sell to, where money is recorded."],
          ["2 · Stock in", "A purchase from the vendor creates batches (batch no., expiry, MRP) and stock."],
          ["3 · Sell and see", "POS bill → stock goes down, GST is posted, ledgers update. All in one transaction."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-tile bg-raised px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--line)]">
            <p className="text-[13px] font-semibold text-ink">{t}</p>
            <p className="text-[12.5px] text-ink-3">{d}</p>
          </div>
        ))}
      </div>
      <NextBar onNext={onNext} nextLabel="Add the vendor" canNext note="We can't buy medicine until the supplier exists. So the first master is the vendor." />
    </div>
  );
}

/* ---------- Step 3: ledger ---------- */

const LEDGER_GUIDE: Guide = {
  name: { label: "Ledger name", what: "An account that carries a balance, e.g. Shop Rent, Electricity, HDFC Current A/c.", rule: "Unique within the company. System ledgers can be renamed, never deleted.", why: "Every voucher line posts to a ledger; reports (P&L, balance sheet) add them up." },
  group: { label: "Under group", what: "Where the ledger sits in the tree. The group decides its nature.", rule: "A ledger takes the nature of its group: Asset, Liability, Equity, Income or Expense.", why: "Rent under Indirect Expenses shows in P&L. Put it under an asset group and the balance sheet is wrong." },
  opening: { label: "Opening balance", what: "Balance on the books start date.", rule: "Amount ≥ 0 with Dr or Cr. Total Dr must equal total Cr before books open.", why: "Carries over the shop's position from the old software or the paper books." },
  side: { label: "Dr / Cr", what: "Which side the opening sits on.", rule: "Assets and expenses are usually Dr; liabilities, capital and income usually Cr.", why: "Wrong side doubles the error in the trial balance." },
};

function LedgerStep({ ledgers, onAdd, onRemove, onBack, onNext }: { ledgers: Ledger[]; onAdd: (l: Ledger) => void; onRemove: (name: string) => void; onBack: () => void; onNext: () => void }) {
  const [l, setL] = useState<Ledger>({ name: "Shop Rent", group: "Indirect Expenses", opening: "0", side: "Dr", kind: "user" });
  const [active, setActive] = useState("name");
  const [tried, setTried] = useState(false);
  const exists = ledgers.some((x) => x.name.toLowerCase() === l.name.trim().toLowerCase());
  const errs = {
    name: !l.name.trim() ? "Name is required." : exists ? "A ledger with this name already exists." : undefined,
    opening: !RX.amount.test(l.opening || "0") ? "Amount like 1500.00" : undefined,
  };
  const ok = !errs.name && !errs.opening;
  const nature = (g: string) => GROUPS.find((x) => x.name === g)?.nature ?? "Asset";
  const userCount = ledgers.filter((x) => x.kind === "user").length;

  const dr = add(...ledgers.filter((x) => x.side === "Dr").map((x) => m(x.opening || "0")));
  const cr = add(...ledgers.filter((x) => x.side === "Cr").map((x) => m(x.opening || "0")));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <Screen route="/finance/accounts" title="Chart of accounts" actions={<Kbd>G L</Kbd>}>
            <div className="space-y-2">
              {GROUPS.map((g) => {
                const ls = ledgers.filter((x) => x.group === g.name);
                return (
                  <div key={g.name} className="rounded-ctl bg-side px-3 py-2">
                    <p className="flex flex-wrap items-baseline gap-2 text-[12.5px] font-semibold text-ink">
                      {g.name}
                      <span className="text-[11px] font-normal text-ink-4">{g.nature}</span>
                    </p>
                    {ls.length > 0 && (
                      <ul className="mt-1 flex flex-wrap gap-1">
                        {ls.map((x) => (
                          <li
                            key={x.name}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[11.5px]",
                              x.kind === "system" && "bg-raised text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]",
                              x.kind === "party" && "at-green tint",
                              x.kind === "user" && "at-violet tint",
                            )}
                          >
                            {x.name}
                            {x.opening !== "0" && m(x.opening) !== 0n && <span className="font-mono opacity-80">· {fmt(m(x.opening))} {x.side}</span>}
                            {x.kind === "user" && (
                              <button onClick={() => onRemove(x.name)} aria-label={`Remove ${x.name}`} className="opacity-70 hover:opacity-100">
                                <X className="size-3" />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 flex flex-wrap gap-3 text-[11.5px] text-ink-3">
              <span className="inline-flex items-center gap-1"><span className="size-2.5 rounded-xs bg-raised shadow-[inset_0_0_0_1px_var(--line-2)]" /> System (seeded, can't delete)</span>
              <span className="at-green inline-flex items-center gap-1"><span className="tint size-2.5 rounded-xs" /> Party (auto from vendor / customer)</span>
              <span className="at-violet inline-flex items-center gap-1"><span className="tint size-2.5 rounded-xs" /> Yours</span>
            </p>
          </Screen>

          <Screen route="/finance/accounts/new" title="New ledger" actions={<Kbd>N L</Kbd>}>
            <div className="grid gap-3 sm:grid-cols-2">
              <F k="name" label="Ledger name" value={l.name} onChange={(x) => setL((p) => ({ ...p, name: x }))} setActive={setActive} error={tried ? errs.name : undefined} required />
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <F k="opening" label="Opening balance (₹)" value={l.opening} onChange={(x) => setL((p) => ({ ...p, opening: x }))} setActive={setActive} error={tried ? errs.opening : undefined} mono />
                </div>
                <Chips k="side" label="Side" value={l.side} onChange={(x) => setL((p) => ({ ...p, side: x }))} setActive={setActive} options={[{ v: "Dr", l: "Dr" }, { v: "Cr", l: "Cr" }]} />
              </div>
              <div className="sm:col-span-2">
                <Chips k="group" label={`Under group → nature: ${nature(l.group)}`} value={l.group} onChange={(x) => setL((p) => ({ ...p, group: x }))} setActive={setActive} options={GROUPS.filter((g) => !["Sundry Creditors", "Sundry Debtors", "Duties & Taxes", "Input Tax Credit"].includes(g.name)).map((g) => ({ v: g.name, l: g.name }))} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <SaveButton
                onClick={() => {
                  setTried(true);
                  if (ok) {
                    onAdd({ ...l, name: l.name.trim(), opening: l.opening || "0" });
                    setL({ name: "Electricity", group: "Indirect Expenses", opening: "0", side: "Dr", kind: "user" });
                    setTried(false);
                  }
                }}
              />
              <span className="text-[12px] text-ink-4">Party and GST groups are hidden here: those ledgers are made by the system.</span>
            </div>
          </Screen>
        </div>
        <div className="space-y-3">
          <FieldGuide guide={LEDGER_GUIDE} active={active} onPick={setActive} />
          <div className="rounded-tile bg-raised px-3.5 py-3 text-[12.5px] shadow-[inset_0_0_0_1px_var(--line)]">
            <p className="mb-1 font-semibold text-ink">Opening balance check</p>
            <p className="font-mono text-ink-2">Dr {fmt(dr)} · Cr {fmt(cr)}</p>
            <p className={cn("mt-1", dr === cr ? "text-success" : "text-ink-3")}>
              {dr === cr ? "Balanced: books can open." : `Difference ${fmt(dr > cr ? dr - cr : cr - dr)}. MENO won't open the books until Dr = Cr; usually the owner's capital, cash and stock openings close the gap.`}
            </p>
          </div>
        </div>
      </div>
      <NextBar onBack={onBack} onNext={onNext} canNext={userCount > 0} nextLabel="Add a product" note={userCount > 0 ? "Last master: add a product (medicine) so it can be bought and sold." : "Add at least one ledger of your own (Shop Rent is pre-filled), then continue."} />
    </div>
  );
}

/* ---------- Step 4: purchase ---------- */

const PURCHASE_GUIDE: Guide = {
  supplier: { label: "Supplier", what: "Picked from the vendor master (F3). Snapshotted onto the bill.", rule: "Must be active with a valid drug licence.", why: "Decides GST type (same state → CGST + SGST) and whose ledger gets the credit." },
  billNo: { label: "Supplier bill no.", what: "The number printed on the supplier's paper or PDF bill.", rule: "Unique per supplier + financial year: the same bill can't be entered twice.", why: "Stops double entry of one bill, and is matched with the supplier's GSTR-1." },
  batch: { label: "Batch no.", what: "Manufacturer's batch, printed on the strip.", rule: "Required. Same item + batch with a different MRP or expiry is a different batch row.", why: "Every sale, return and recall is traced to the batch. Drug recalls are by batch." },
  expiry: { label: "Expiry", what: "Batch expiry month.", rule: "MM/YYYY, after today. Near-expiry stock warns at purchase.", why: "FEFO picks the earliest expiry first at the counter; expiry reports and returns depend on it." },
  qty: { label: "Qty / Free", what: "Packs billed, plus free packs from a scheme (10 + 1).", rule: "Whole packs > 0. Free quantity is stock in but not charged.", why: "Free goods lower the real cost per pack (landed cost) and must enter stock." },
  ptr: { label: "PTR / rate", what: "Price to retailer per pack, before GST.", rule: "Amount > 0, less than MRP.", why: "Becomes the batch cost: drives margin, stock value and profit reports." },
  mrp: { label: "MRP", what: "Maximum retail price per pack, printed on the box.", rule: "Required per batch; we never sell above it.", why: "The counter bills at MRP (GST included). A new MRP means a new batch row." },
};

type PRow = BatchRow;
const DEFAULT_ROWS: PRow[] = [
  { medId: "m1", batch: "PC24A7", expiry: "08/2027", qty: "10", free: "1", ptr: "24.00", mrp: "33.60" },
  { medId: "m2", batch: "AX1123", expiry: "03/2027", qty: "5", free: "0", ptr: "84.30", mrp: "118.00" },
  { medId: "m3", batch: "DL5520", expiry: "06/2028", qty: "4", free: "0", ptr: "172.00", mrp: "249.00" },
];

function PurchaseStep({
  meds,
  vendor,
  posted,
  onGoVendor,
  onPost,
  onBack,
  onNext,
}: {
  meds: Med[];
  vendor: Vendor | null;
  posted: InvoiceOut | null;
  onGoVendor: () => void;
  onPost: (inv: InvoiceOut, rows: PRow[], docNo: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const med = (id: string) => meds.find((x) => x.id === id)!;
  const extra = meds.filter((x) => !DEFAULT_ROWS.some((r) => r.medId === x.id));
  const [rows, setRows] = useState<PRow[]>([
    ...DEFAULT_ROWS,
    ...extra.map((x) => ({ medId: x.id, batch: "CT2611", expiry: "10/2028", qty: x.reorder || "10", free: "0", ptr: x.ptr ?? "", mrp: x.mrp ?? "" })),
  ]);
  const [billNo, setBillNo] = useState("KPD/26-27/004410");
  const [active, setActive] = useState("supplier");
  const [tried, setTried] = useState(false);
  const setRow = (i: number, k: keyof PRow, x: string) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: x } : row)));

  const rowErr = (r: PRow): string | undefined => {
    if (!r.batch.trim()) return "Batch no. is required.";
    const e = expiryError(r.expiry);
    if (e) return e;
    if (!/^\d{1,5}$/.test(r.qty) || Number(r.qty) < 1) return "Qty must be a whole number ≥ 1.";
    if (r.free && !/^\d{1,5}$/.test(r.free)) return "Free qty must be a whole number.";
    if (!RX.amount.test(r.ptr) || !RX.amount.test(r.mrp)) return "PTR and MRP as amounts like 24.00";
    if (m(r.ptr) <= 0n || m(r.ptr) >= m(r.mrp)) return "PTR must be above 0 and below MRP.";
    return undefined;
  };
  const errors = rows.map(rowErr);
  const ok = !!vendor && !!billNo.trim() && errors.every((e) => !e);

  const preview = useMemo(() => {
    if (!vendor || errors.some(Boolean)) return null;
    return calcInvoice({
      kind: "Purchase invoice",
      number: billNo || "—",
      date: TODAY,
      mode: "EXCLUSIVE",
      seller: partyOf(vendor),
      buyer: SHOP,
      lines: rows.map((r) => {
        const x = med(r.medId);
        return { item: x.name, pack: x.pack, hsn: x.hsn, batch: r.batch, expiry: r.expiry, qty: r.qty, free: r.free && r.free !== "0" ? r.free : undefined, rate: r.ptr, mrp: r.mrp, gstPct: x.gstPct };
      }),
    });
  }, [vendor, rows, billNo, errors]);

  if (!vendor)
    return (
      <div className={cn(box, "space-y-2 text-[13.5px]")}>
        <p className="font-semibold text-ink">No supplier yet</p>
        <p className="text-ink-2">A purchase needs a supplier from the vendor master. That is why masters come first.</p>
        <button onClick={onGoVendor} className="inline-flex h-9 items-center gap-1.5 rounded-ctl bg-ink px-3.5 text-[13px] font-medium text-paper">
          <ArrowLeft className="size-4" /> Add the vendor
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Screen route="/purchase/new" title="Purchase entry (stock in)" actions={<Kbd>G P</Kbd>}>
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <button onFocus={() => setActive("supplier")} onClick={() => setActive("supplier")} className="rounded-ctl bg-side px-3 py-2 text-left">
              <span className="block text-[12px] font-medium text-ink-3">Supplier <Kbd>F3</Kbd></span>
              <span className="block text-[13.5px] font-semibold text-ink">{vendor.name}</span>
              <span className="block font-mono text-[11.5px] text-ink-3">{vendor.gstin} · {vendor.creditDays} days credit</span>
            </button>
            <F k="billNo" label="Supplier bill no." value={billNo} onChange={setBillNo} setActive={setActive} error={tried && !billNo.trim() ? "Required." : undefined} mono required />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[12.5px]">
              <thead>
                <tr className="text-left text-[11.5px] text-ink-3">
                  <th className="px-1 py-1 font-medium">Item</th>
                  <th className="px-1 py-1 font-medium">Batch</th>
                  <th className="px-1 py-1 font-medium">Expiry</th>
                  <th className="px-1 py-1 font-medium">Qty</th>
                  <th className="px-1 py-1 font-medium">Free</th>
                  <th className="px-1 py-1 font-medium">PTR</th>
                  <th className="px-1 py-1 font-medium">MRP</th>
                  <th className="px-1 py-1 font-medium">GST%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const x = med(r.medId);
                  return (
                    <tr key={r.medId} className="align-top">
                      <td className="px-1 py-1">
                        <p className="font-medium text-ink">{x.name}</p>
                        <p className="text-[11px] text-ink-4">
                          {x.pack} · HSN {x.hsn}
                          {x.schedule !== "OTC" && ` · Sch. ${x.schedule}`}
                        </p>
                        {tried && errors[i] && <p className="text-[11px] text-critical">{errors[i]}</p>}
                      </td>
                      {(["batch", "expiry", "qty", "free", "ptr", "mrp"] as const).map((k) => (
                        <td key={k} className="px-1 py-1">
                          <input
                            value={r[k]}
                            onFocus={() => setActive(k === "free" ? "qty" : k)}
                            onChange={(e) => setRow(i, k, k === "batch" ? e.target.value.toUpperCase() : e.target.value)}
                            className={cn(cellInput, k === "batch" ? "w-24" : k === "expiry" ? "w-20" : "w-16")}
                            aria-label={`${x.name} ${k}`}
                          />
                        </td>
                      ))}
                      <td className="px-1 py-1 font-mono text-[12px] text-ink-3">{x.gstPct}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11.5px] text-ink-4">GST% comes from the item's HSN for the bill date (illustrative here). The item master was set up earlier with name, salt, pack, HSN, schedule and barcode.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SaveButton
              label={posted ? "Post again (replaces demo purchase)" : "Save & post"}
              kbd="F10"
              onClick={() => {
                setTried(true);
                if (ok && preview) onPost(preview, rows, `PUR/26-27/000001`);
              }}
            />
            {preview && <span className="font-mono text-[13px] text-ink">Bill total ₹{fmt(preview.grandTotal)}</span>}
          </div>
        </Screen>
        <FieldGuide guide={PURCHASE_GUIDE} active={active} onPick={setActive} />
      </div>
      {posted && (
        <SavedNote>
          Posted <b className="text-ink">PUR/26-27/000001</b> against supplier bill {posted.number}. In <b className="text-ink">one database transaction</b> MENO created {rows.length} batches, inserted {rows.length} stock-in movements, posted the purchase voucher (Purchase + Input GST Dr, {vendor.name} Cr) and wrote the audit entry. A posted purchase is never edited: mistakes are fixed with a purchase return / debit note.
        </SavedNote>
      )}
      {preview && <InvoiceView inv={posted ?? preview} />}
      <NextBar onBack={onBack} onNext={onNext} canNext={!!posted} nextLabel="Open the POS" note={posted ? "Stock is on the shelf. Sell it at the counter." : "Press Save & post to bring the stock in."} />
    </div>
  );
}

/* ---------- Step 5: POS ---------- */

const POS_GUIDE: Guide = {
  search: { label: "Item search  F2", what: "Type a name, salt or scan a barcode. Enter adds the first match.", rule: "Only items with saleable stock. Search by salt shows substitutes.", why: "Barcode-first billing: most bills are done without touching the mouse." },
  batch: { label: "Batch (FEFO)", what: "MENO picks the batch that expires first (First Expiry, First Out). The pharmacist can override.", rule: "Expired batches can't be sold. Qty can't exceed batch stock (negative-stock policy = Block).", why: "Sells old stock before it expires, so less goes to expiry loss." },
  qty: { label: "Qty", what: "Packs sold. Loose sale (tablets from a strip) uses the unit conversion.", rule: "Whole number ≥ 1, up to the batch stock.", why: "Every unit sold is an inventory movement against that batch." },
  disc: { label: "Disc %", what: "Line discount on MRP.", rule: "Up to the role's limit (e.g. billing operator 10%); above that needs approval.", why: "Discount limits stop margin leakage at the counter." },
  customer: { label: "Customer  F3", what: "Walk-in by default, or find by phone.", rule: "Credit sale needs a registered customer within the credit limit.", why: "Links the bill to their history, refills and outstanding." },
  doctor: { label: "Doctor / Rx  F4", what: "Doctor name, registration and prescription no.", rule: "Mandatory when the bill has Schedule H / H1 / X items. The bill can't be saved without it.", why: "Legal requirement for prescription drugs; goes into the Schedule H register." },
  payment: { label: "Payment  F9", what: "Cash, UPI, card or credit. MENO also supports splitting one bill across modes.", rule: "Credit only for a registered customer, within their limit.", why: "Decides which ledger gets the debit: Cash, Card/UPI Clearing or the customer." },
  save: { label: "Save & print  F10", what: "Posts the bill and prints it.", rule: "Idempotent: pressing F10 twice never creates two bills. Works offline on the desktop app and syncs later.", why: "Stock, GST and accounts are updated in one transaction, or not at all." },
};

const PAYMENTS = ["Cash", "UPI", "Card", "Credit"] as const;
type Pay = (typeof PAYMENTS)[number];

function PosStep({
  meds,
  stock,
  customer,
  billNo,
  lastSale,
  onGoPurchase,
  onSave,
  onBack,
  onNext,
}: {
  meds: Med[];
  stock: Stock[];
  customer: Customer | null;
  billNo: string;
  lastSale?: Sale;
  onGoPurchase: () => void;
  onSave: (s: Sale, lines: CartLine[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const med = (id: string) => meds.find((x) => x.id === id)!;
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [who, setWho] = useState<"walkin" | "saved">("walkin");
  const [doctor, setDoctor] = useState("");
  const [rx, setRx] = useState("");
  const [pay, setPay] = useState<Pay>("UPI");
  const [active, setActive] = useState("search");
  const [error, setError] = useState<string>();
  const [showBill, setShowBill] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const custRef = useRef<HTMLButtonElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const payRef = useRef<HTMLButtonElement>(null);

  const available = stock.filter((b) => b.qty > 0);
  const query = q.trim().toLowerCase();
  const matches = query
    ? available.filter((b) => {
        const x = med(b.medId);
        return x.name.toLowerCase().includes(query) || x.salt.toLowerCase().includes(query) || x.barcode.includes(query);
      })
    : available;

  const addItem = (b: Stock) => {
    setError(undefined);
    setShowBill(false);
    setCart((c) => (c.some((l) => l.medId === b.medId && l.batch === b.batch) ? c.map((l) => (l.medId === b.medId && l.batch === b.batch ? { ...l, qty: String(Number(l.qty) + 1) } : l)) : [...c, { medId: b.medId, batch: b.batch, qty: "1", disc: "0" }]));
    setQ("");
    searchRef.current?.focus();
  };

  const needsRx = cart.some((l) => med(l.medId).schedule !== "OTC");
  const buyer: Party = who === "saved" && customer ? partyOf(customer) : WALK_IN;

  const lineErr = (l: CartLine): string | undefined => {
    const b = stock.find((s) => s.medId === l.medId && s.batch === l.batch);
    if (!/^\d{1,4}$/.test(l.qty) || Number(l.qty) < 1) return "Qty ≥ 1";
    if (b && Number(l.qty) > b.qty) return `Only ${b.qty} in stock`;
    if (!/^\d{1,2}(\.\d{1,2})?$/.test(l.disc || "0")) return "Disc % like 5";
    // Lower of the item's max discount (PRC-12) and the role cap wins.
    const cap = Math.min(Number(ROLE_DISC_CAP), Number(med(l.medId).maxDisc));
    if (Number(l.disc) > cap) return `Above ${cap}% needs approval`;
    return undefined;
  };

  const bill = useMemo(() => {
    if (!cart.length || cart.some(lineErr)) return null;
    return calcInvoice({
      kind: "Tax invoice",
      number: billNo,
      date: TODAY,
      mode: "MRP_INCLUSIVE",
      seller: SHOP,
      buyer,
      payment: pay,
      doctor: needsRx && doctor ? `${doctor}${rx ? `, Rx ${rx}` : ""}` : undefined,
      lines: cart.map((l) => {
        const x = med(l.medId);
        const b = stock.find((s) => s.medId === l.medId && s.batch === l.batch)!;
        return { item: x.schedule !== "OTC" ? `${x.name} (Sch. ${x.schedule})` : x.name, pack: x.pack, hsn: x.hsn, batch: b.batch, expiry: b.expiry, qty: l.qty, rate: b.mrp, mrp: b.mrp, discPct: l.disc || "0", gstPct: x.gstPct };
      }),
    });
  }, [cart, billNo, buyer.name, pay, doctor, rx, needsRx, stock]);

  const save = () => {
    if (!cart.length) return setError("Add at least one item (F2).");
    const bad = cart.find(lineErr);
    if (bad) return setError(`${med(bad.medId).name}: ${lineErr(bad)}`);
    if (needsRx && !doctor.trim()) {
      docRef.current?.focus();
      return setError("Schedule H item on the bill: enter the doctor and prescription (F4) before saving.");
    }
    if (pay === "Credit" && who !== "saved") return setError("Credit needs a registered customer (F3).");
    if (pay === "Credit" && customer && bill && bill.grandTotal > m(customer.creditLimit || "0")) return setError(`Credit limit ₹${fmt(m(customer.creditLimit || "0"))} would be crossed. MENO asks the owner to approve.`);
    if (!bill) return;
    onSave({ inv: bill, payment: pay, customer: who === "saved" && customer ? customer : undefined }, cart);
    setCart([]);
    setDoctor("");
    setRx("");
    setError(undefined);
    setShowBill(true);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, () => void> = {
      F2: () => searchRef.current?.focus(),
      F3: () => custRef.current?.focus(),
      F4: () => docRef.current?.focus(),
      F9: () => payRef.current?.focus(),
      F10: save,
    };
    if (map[e.key]) {
      e.preventDefault();
      map[e.key]();
    }
  };

  if (!stock.length)
    return (
      <div className={cn(box, "space-y-2 text-[13.5px]")}>
        <p className="font-semibold text-ink">Nothing to sell yet</p>
        <p className="text-ink-2">The POS only shows batches with stock. Post the purchase first.</p>
        <button onClick={onGoPurchase} className="inline-flex h-9 items-center gap-1.5 rounded-ctl bg-ink px-3.5 text-[13px] font-medium text-paper">
          <ArrowLeft className="size-4" /> Enter the purchase
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div onKeyDown={onKey}>
          <Screen route="/pos" title={`Counter billing · ${billNo}`} actions={<span className="text-[11.5px] text-ink-4">Click inside, then use F2 F3 F4 F9 F10</span>}>
            {/* Search */}
            <div className="relative">
              <ScanBarcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
              <input
                ref={searchRef}
                value={q}
                onFocus={() => setActive("search")}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matches[0]) {
                    e.preventDefault();
                    addItem(matches[0]);
                  }
                }}
                placeholder="F2 · name, salt or barcode (try “para”, “amox” or 8900000000035)"
                className={cn(inputCls, "h-10 pl-9")}
                aria-label="Item search"
              />
            </div>
            <ul className="mt-1.5 space-y-1">
              {matches.map((b) => {
                const x = med(b.medId);
                return (
                  <li key={b.medId + b.batch}>
                    <button onClick={() => addItem(b)} onFocus={() => setActive("batch")} className="flex w-full flex-wrap items-center gap-x-3 gap-y-0.5 rounded-ctl bg-side px-3 py-1.5 text-left text-[12.5px] hover:bg-hover">
                      <Plus className="size-3.5 text-ink-4" />
                      <span className="font-medium text-ink">{x.name}</span>
                      <span className="text-ink-4">{x.salt}</span>
                      {x.schedule !== "OTC" && <span className="at-red tint rounded-xs px-1 text-[10.5px] font-medium">Sch. {x.schedule}</span>}
                      <span className="ml-auto font-mono text-[11.5px] text-ink-3">
                        {b.batch} · exp {b.expiry} · stock {b.qty} · MRP {b.mrp}
                      </span>
                    </button>
                  </li>
                );
              })}
              {!matches.length && <li className="px-3 py-1.5 text-[12.5px] text-ink-4">No item with stock matches “{q}”.</li>}
            </ul>

            {/* Cart */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11.5px] text-ink-3">
                    <th className="px-1 py-1 font-medium">Item · pack · mfr · HSN</th>
                    <th className="px-1 py-1 font-medium">Batch · Exp</th>
                    <th className="px-1 py-1 font-medium">Qty</th>
                    <th className="px-1 py-1 text-right font-medium">MRP</th>
                    <th className="px-1 py-1 font-medium">Disc%</th>
                    <th className="px-1 py-1 text-right font-medium">Disc ₹</th>
                    <th className="px-1 py-1 text-right font-medium">Taxable</th>
                    <th className="px-1 py-1 text-right font-medium">GST</th>
                    <th className="px-1 py-1 text-right font-medium">Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {cart.map((l, i) => {
                    const x = med(l.medId);
                    const out = bill?.lines[i];
                    const err = lineErr(l);
                    return (
                      <tr key={l.medId + l.batch} className="border-b border-line align-top">
                        <td className="px-1 py-1.5">
                          <p className="font-medium text-ink">
                            {x.name}
                            {x.schedule !== "OTC" && <span className="at-red tint ml-1 rounded-xs px-1 text-[10px] font-medium">Sch. {x.schedule}</span>}
                          </p>
                          <p className="text-[11px] text-ink-4">
                            {x.pack} · {x.mfr} · HSN {x.hsn}
                          </p>
                          {err && <p className="text-[11px] text-critical">{err}</p>}
                        </td>
                        <td className="px-1 py-1.5 font-mono text-[11.5px] text-ink-3">
                          {l.batch} · {stock.find((s) => s.medId === l.medId && s.batch === l.batch)?.expiry}
                        </td>
                        <td className="px-1 py-1">
                          <input value={l.qty} onFocus={() => setActive("qty")} onChange={(e) => setCart((c) => c.map((y, j) => (j === i ? { ...y, qty: e.target.value } : y)))} className={cn(cellInput, "w-14")} aria-label={`${x.name} quantity`} />
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono text-ink-2">{stock.find((b) => b.medId === l.medId && b.batch === l.batch)?.mrp}</td>
                        <td className="px-1 py-1">
                          <input value={l.disc} onFocus={() => setActive("disc")} onChange={(e) => setCart((c) => c.map((y, j) => (j === i ? { ...y, disc: e.target.value } : y)))} className={cn(cellInput, "w-14")} aria-label={`${x.name} discount`} />
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono text-ink">{out ? fmt(out.disc) : "—"}</td>
                        <td className="px-1 py-1.5 text-right font-mono text-ink">{out ? fmt(out.taxable) : "—"}</td>
                        <td className="px-1 py-1.5 text-right font-mono text-ink">
                          {out ? fmt(out.gst) : "—"}
                          <span className="block text-[10.5px] text-ink-4">{x.gstPct}%</span>
                        </td>
                        <td className="px-1 py-1.5 text-right font-mono text-ink">{out ? fmt(out.total) : "—"}</td>
                        <td className="px-1 py-1 text-right">
                          <button onClick={() => setCart((c) => c.filter((_, j) => j !== i))} aria-label={`Remove ${x.name}`} className="rounded-ctl p-1 text-ink-4 hover:bg-hover hover:text-ink">
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!cart.length && (
                    <tr>
                      <td colSpan={10} className="px-1 py-3 text-center text-[12.5px] text-ink-4">
                        Bill is empty. Search and press Enter to add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Customer, doctor, payment */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-[12px] font-medium text-ink-3">
                  Customer <Kbd>F3</Kbd>
                </span>
                <div className="flex flex-wrap gap-1">
                  <button ref={custRef} onFocus={() => setActive("customer")} onClick={() => setWho("walkin")} className={cn("h-8 rounded-ctl px-2.5 text-[12.5px]", who === "walkin" ? "bg-ink text-paper" : "bg-raised text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)]")}>
                    Walk-in
                  </button>
                  <button
                    onFocus={() => setActive("customer")}
                    onClick={() => customer && setWho("saved")}
                    disabled={!customer}
                    className={cn("h-8 rounded-ctl px-2.5 text-[12.5px] disabled:opacity-40", who === "saved" ? "bg-ink text-paper" : "bg-raised text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)]")}
                  >
                    {customer ? `${customer.name} · ${customer.phone}` : "No saved customer"}
                  </button>
                </div>
              </div>
              <div>
                <span className="mb-1 block text-[12px] font-medium text-ink-3">
                  Payment <Kbd>F9</Kbd>
                </span>
                <div className="flex flex-wrap gap-1">
                  {PAYMENTS.map((p, i) => (
                    <button
                      key={p}
                      ref={i === 0 ? payRef : undefined}
                      onFocus={() => setActive("payment")}
                      onClick={() => setPay(p)}
                      className={cn("h-8 rounded-ctl px-2.5 text-[12.5px]", pay === p ? "bg-ink text-paper" : "bg-raised text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)]")}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className={cn("grid gap-2 sm:col-span-2 sm:grid-cols-2", !needsRx && "opacity-50")}>
                <label className="block">
                  <span className="mb-1 block text-[12px] font-medium text-ink-3">
                    Doctor <Kbd>F4</Kbd> {needsRx && <span className="text-critical">* Schedule H on bill</span>}
                  </span>
                  <input ref={docRef} value={doctor} onFocus={() => setActive("doctor")} onChange={(e) => setDoctor(e.target.value)} placeholder="Dr. R. Kumar (demo), Reg. DEMO-1234" className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[12px] font-medium text-ink-3">Prescription no.</span>
                  <input value={rx} onFocus={() => setActive("doctor")} onChange={(e) => setRx(e.target.value)} placeholder="RX-0001" className={cn(inputCls, "font-mono")} />
                </label>
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
              <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 font-mono text-[12.5px] tabular-nums">
                <dt className="font-sans text-ink-3">Taxable</dt>
                <dd className="text-right text-ink">{bill ? fmt(bill.taxable) : "0.00"}</dd>
                <dt className="font-sans text-ink-3">{buyer.stateCode === SHOP.stateCode ? "CGST + SGST" : "IGST"}</dt>
                <dd className="text-right text-ink">{bill ? fmt(bill.gst) : "0.00"}</dd>
                <dt className="font-sans text-ink-3">Round off</dt>
                <dd className="text-right text-ink">{bill ? fmt(bill.roundOff) : "0.00"}</dd>
              </dl>
              <div className="text-right">
                <p className="text-[11.5px] text-ink-4">To pay ({pay})</p>
                <p className="font-mono text-[24px] font-semibold tabular-nums text-ink">₹{bill ? fmt(bill.grandTotal) : "0.00"}</p>
              </div>
            </div>
            {error && <p className="mt-2 text-[12.5px] text-critical">{error}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <SaveButton label="Save & print" kbd="F10" onClick={save} />
              <span className="text-[12px] text-ink-4">Try: add Amoxa without a doctor, sell more than the stock, or Credit with a walk-in.</span>
            </div>
          </Screen>
        </div>
        <FieldGuide guide={POS_GUIDE} active={active} onPick={setActive} />
      </div>
      {lastSale && showBill && (
        <>
          <SavedNote>
            Bill <b className="text-ink">{lastSale.inv.number}</b> saved for ₹{fmt(lastSale.inv.grandTotal)} ({lastSale.payment}). Stock went down for each batch, Output GST was posted, and{" "}
            {lastSale.payment === "Credit" ? `${lastSale.customer?.name}'s ledger now shows what they owe.` : lastSale.payment === "Cash" ? "the Cash ledger went up." : "Card / UPI Clearing holds it until the bank settles."}
          </SavedNote>
          <InvoiceView inv={lastSale.inv} />
        </>
      )}
      <NextBar onBack={onBack} onNext={onNext} canNext={!!lastSale} nextLabel="Wholesale invoice" note={lastSale ? "Now bill a retailer on credit: a wholesale tax invoice with free goods, returns, replacement and freight. Or bill again here." : "Make one bill (Save & print, F10) to continue."} />
    </div>
  );
}

/* ---------- Step 6: results ---------- */

function ResultStep({
  meds,
  vendor,
  customer,
  purchase,
  sales,
  wsale,
  stock,
  moves,
  onBack,
  onGoPos,
}: {
  meds: Med[];
  vendor: Vendor | null;
  customer: Customer | null;
  purchase: InvoiceOut | null;
  sales: Sale[];
  wsale: WholesaleResult | null;
  stock: Stock[];
  moves: Movement[];
  onBack: () => void;
  onGoPos: () => void;
}) {
  const med = (id: string) => meds.find((x) => x.id === id)!;
  if (!purchase || !sales.length || !vendor)
    return (
      <div className={cn(box, "space-y-2 text-[13.5px]")}>
        <p className="font-semibold text-ink">Finish the flow first</p>
        <p className="text-ink-2">Add a vendor, post the purchase and make at least one POS bill. Then this page shows what MENO recorded.</p>
        <button onClick={onGoPos} className="inline-flex h-9 items-center gap-1.5 rounded-ctl bg-ink px-3.5 text-[13px] font-medium text-paper">
          <ArrowLeft className="size-4" /> Go to POS
        </button>
      </div>
    );

  const debitLedger = (s: Sale) => (s.payment === "Credit" ? s.customer?.name ?? "Customer" : s.payment === "Cash" ? "Cash" : "Card / UPI Clearing");
  const total = (f: (s: Sale) => Money) => add(...sales.map(f));
  const creditSales = sales.filter((s) => s.payment === "Credit");

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-4">
        {[
          ["Sales today", `₹${fmt(total((s) => s.inv.grandTotal))}`, `${sales.length} bill${sales.length > 1 ? "s" : ""}`],
          ["Output GST", `₹${fmt(total((s) => s.inv.gst))}`, "goes to GSTR-1 / 3B"],
          ["Input GST", `₹${fmt(purchase.gst)}`, "credit we can claim"],
          ["We owe the vendor", `₹${fmt(add(m(vendor.opening || "0"), purchase.grandTotal))}`, `due in ${vendor.creditDays} days`],
        ].map(([t, v, s]) => (
          <div key={t} className="rounded-tile bg-raised px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--line)]">
            <p className="text-[11.5px] text-ink-4">{t}</p>
            <p className="font-mono text-[18px] font-semibold tabular-nums text-ink">{v}</p>
            <p className="text-[11.5px] text-ink-3">{s}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <p className="text-[13px] font-semibold text-ink">Stock ledger (inventory_movement rows, never an UPDATE)</p>
        <Table
          compact
          head={["Date", "Document", "Item", "Batch", "In", "Out", "Location"]}
          mono={[1, 3, 4, 5]}
          rows={moves.map((mv) => [mv.date, mv.doc, med(mv.medId).name, mv.batch, mv.qtyIn || "", mv.qtyOut || "", mv.loc ?? "Saleable"])}
        />
        <Table
          compact
          head={["Item", "Batch", "Expiry", "MRP", "Stock now (derived)"]}
          mono={[1, 2, 3, 4]}
          rows={stock.map((b) => [med(b.medId).name, b.batch, b.expiry, b.mrp, String(b.qty)])}
        />
      </div>

      <VoucherView title={`Purchase voucher · PUR/26-27/000001`} lines={purchaseVoucher(purchase, vendor.name)} />
      {sales.map((s) => (
        <VoucherView key={s.inv.number} title={`Sales voucher · ${s.inv.number} (${s.payment})`} lines={salesVoucher(s.inv, debitLedger(s))} />
      ))}

      <LedgerView
        title={`Supplier ledger · ${vendor.name} (Sundry Creditors)`}
        opening={m(vendor.opening || "0")}
        creditNormal
        entries={[{ date: TODAY, particulars: `Purchase, bill ${purchase.number}`, type: "PUR", no: "000001", cr: purchase.grandTotal }]}
      />
      {customer && (
        <LedgerView
          title={`Customer ledger · ${customer.name} (Sundry Debtors)`}
          opening={0n}
          entries={creditSales.map((s) => ({ date: TODAY, particulars: "Sales on credit", type: "INV", no: s.inv.number.split("/").pop() ?? "", dr: s.inv.grandTotal }))}
        />
      )}
      {wsale && (
        <>
          <VoucherView title={`Wholesale invoice ${wsale.number}${wsale.creditNotes.length ? ` + credit note${wsale.creditNotes.length > 1 ? "s" : ""} ${wsale.creditNotes.join(", ")}` : ""}`} lines={wsale.voucher} />
          <LedgerView title={`Retailer ledger · ${wsale.buyer.name} (Sundry Debtors)`} opening={0n} entries={wsale.ledger.map((e) => ({ date: TODAY, ...e }))} />
        </>
      )}
      {customer && !creditSales.length && wsale?.buyer.name !== customer.name && <p className="text-[12.5px] text-ink-3">No credit bill yet, so {customer.name}&apos;s ledger has no entries. Go back to POS, pick the customer and pay by Credit to see it fill.</p>}

      <NextBar
        onBack={onBack}
        onNext={onGoPos}
        canNext
        nextLabel="Make another bill"
        note="Tomorrow's work builds on these records: receive payment from the customer (receipt voucher), pay the vendor, returns as credit notes, and GSTR-1 from the posted bills."
      />
    </div>
  );
}
