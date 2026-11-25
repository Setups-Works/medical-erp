"use client";

import { ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import { cn } from "@/lib/cn";

/*
 * Shared pieces for the Day 21 ERP walkthrough. Option lists below are demo copies of what MENO reads from
 * configuration tables and the API (AGENTS.md rule 13); names, GSTINs and licence numbers are made up.
 */

export const TODAY = "24-11-2026";

export const STATES = [
  { code: "33", name: "Tamil Nadu" },
  { code: "29", name: "Karnataka" },
  { code: "32", name: "Kerala" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "27", name: "Maharashtra" },
];

/** Demo copy of the PIN directory (PLT-22). */
export const PINS: Record<string, { state: string; district: string; city: string }> = {
  "600001": { state: "33", district: "Chennai", city: "Chennai" },
  "600003": { state: "33", district: "Chennai", city: "Chennai" },
  "560001": { state: "29", district: "Bengaluru Urban", city: "Bengaluru" },
  "682001": { state: "32", district: "Ernakulam", city: "Kochi" },
  "400001": { state: "27", district: "Mumbai", city: "Mumbai" },
};

/** Demo copy of the IFSC directory (PLT-22). Codes are fictitious. */
export const IFSCS: Record<string, { bank: string; branch: string }> = {
  DEMO0000001: { bank: "Demo Bank", branch: "Chennai Main" },
  DEMO0000002: { bank: "Demo Bank", branch: "Bengaluru MG Road" },
  TEST0001234: { bank: "Test Co-operative Bank", branch: "Kochi" },
};

/** Demo copy of what a GSTIN verification service returns (PTY-15). */
export const GSTIN_DIRECTORY: Record<string, { legal: string; line1: string; pin: string; status: "Active" | "Cancelled" | "Suspended"; type: string }> = {
  "33BBBBB1111B1Z2": { legal: "Kaveri Pharma Distributors", line1: "4 Market Street", pin: "600003", status: "Active", type: "Regular" },
  "29CCCCC2222C1Z9": { legal: "Sri Balaji Medicals", line1: "88 MG Road", pin: "560001", status: "Active", type: "Regular" },
  "33DDDDD3333D1Z1": { legal: "Old Town Pharma", line1: "9 Bazaar Road", pin: "600001", status: "Cancelled", type: "Regular" },
};

/** Every GST state code (first two characters of a GSTIN). Demo copy; MENO reads the state master. */
export const GST_STATES: Record<string, string> = {
  "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh", "05": "Uttarakhand",
  "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim",
  "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura", "17": "Meghalaya",
  "18": "Assam", "19": "West Bengal", "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh",
  "24": "Gujarat", "26": "Dadra and Nagar Haveli and Daman and Diu", "27": "Maharashtra", "29": "Karnataka",
  "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
  "35": "Andaman and Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh",
  "97": "Other Territory",
};
export const stateName = (code: string) => STATES.find((s) => s.code === code)?.name ?? GST_STATES[code] ?? "";

/** The PAN's 4th letter says who holds it. */
export const PAN_HOLDER: Record<string, string> = {
  C: "Company", P: "Individual (person)", F: "Firm / LLP", H: "Hindu Undivided Family", A: "Association of Persons",
  T: "Trust", B: "Body of Individuals", L: "Local authority", J: "Artificial juridical person", G: "Government",
};

const B36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/** GSTIN check character (15th): weights 1,2,1,2… over the first 14 characters in base 36. */
export function gstinCheckChar(g: string) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const p = B36.indexOf(g[i]) * (i % 2 ? 2 : 1);
    sum += Math.floor(p / 36) + (p % 36);
  }
  return B36[(36 - (sum % 36)) % 36];
}

/** The four free checks done before spending an API call on a GSTIN. */
export function gstinChecks(raw: string) {
  const g = raw.trim().toUpperCase();
  const fmtOk = RX.gstin.test(g);
  return [
    { label: "15 characters in the GSTIN pattern", ok: fmtOk },
    { label: g.length >= 2 ? `State code ${g.slice(0, 2)}: ${GST_STATES[g.slice(0, 2)] ?? "unknown"}` : "Known state code", ok: !!GST_STATES[g.slice(0, 2)] },
    { label: "Characters 3–12 are a PAN", ok: /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(g.slice(2, 12)) },
    { label: fmtOk ? `Check character must be ${gstinCheckChar(g)}` : "Check character (15th) is right", ok: fmtOk && gstinCheckChar(g) === g[14] },
  ];
}

/** Basic details from the public GST verify service (the Hub proxies it at /api/learn/gst). */
export type GstPortal = {
  gstin: string;
  lgnm?: string;
  tradeNam?: string;
  sts?: string;
  rgdt?: string;
  ctb?: string;
  dty?: string;
  stj?: string;
  ctj?: string;
  cxdt?: string;
  nba?: string[];
  einvoiceStatus?: string;
  principal_address?: string;
  structured_address?: { address_line1?: string; address_line2?: string; city?: string; state?: string; pincode?: string };
};

export async function fetchGstPortal(gstin: string): Promise<GstPortal> {
  const res = await fetch(`/api/learn/gst?gstin=${encodeURIComponent(gstin)}`);
  const json = (await res.json().catch(() => ({}))) as { data?: GstPortal; error?: string };
  if (!res.ok || !json.data) throw new Error(json.error ?? "Couldn’t fetch the GSTIN.");
  return json.data;
}

/** Demo HSN → GST rate (illustrative; MENO reads `hsn_tax` for the document date). */
export const HSNS = [
  { code: "3004", label: "3004 · Medicaments (dosage form)", gst: "5" },
  { code: "3304", label: "3304 · Skin-care preparations", gst: "18" },
  { code: "2106", label: "2106 · Food supplements", gst: "18" },
];

export type Med = {
  id: string;
  name: string;
  pack: string;
  hsn: string;
  gstPct: string;
  schedule: string;
  barcode: string;
  salt: string;
  /** Manufacturer / marketer short name, printed on bills. */
  mfr: string;
  /** Item discount cap %, combined with the role cap at POS (PRC-12). */
  maxDisc: string;
  mrp?: string;
  ptr?: string;
  reorder?: string;
};

export const MEDS: Med[] = [
  { id: "m1", name: "Paracip 650 Tablet", pack: "1×15", hsn: "3004", gstPct: "5", schedule: "OTC", barcode: "8900000000011", salt: "Paracetamol 650 mg", mfr: "Demo Pharma", maxDisc: "10" },
  { id: "m2", name: "Amoxa 500 Capsule", pack: "1×10", hsn: "3004", gstPct: "5", schedule: "H", barcode: "8900000000028", salt: "Amoxicillin 500 mg", mfr: "Sample Labs", maxDisc: "10" },
  { id: "m3", name: "Dermacalm Lotion", pack: "100 ml", hsn: "3304", gstPct: "18", schedule: "OTC", barcode: "8900000000035", salt: "Calamine", mfr: "Skin Demo Co.", maxDisc: "10" },
];

/** Counter role's discount cap in the demo (a role setting in MENO). */
export const ROLE_DISC_CAP = "10";

/* ---------- Validation (VALIDATION_AND_BUSINESS_RULES.md §4) ---------- */

export const RX = {
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  phone: /^[6-9][0-9]{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  pin: /^[1-9][0-9]{5}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  account: /^[0-9]{9,18}$/,
  udyam: /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/,
  fssai: /^[0-9]{14}$/,
  upi: /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/,
  amount: /^\d{1,9}(\.\d{1,2})?$/,
  pct: /^\d{1,3}(\.\d{1,2})?$/,
  expiry: /^(0[1-9]|1[0-2])\/(20\d{2})$/,
  barcode: /^(\d{8}|\d{12}|\d{13})$/,
};

export const pctError = (v: string, label = "Percent") => (v && (!RX.pct.test(v) || Number(v) > 100) ? `${label}: 0 to 100.` : undefined);

export function gstinError(g: string, stateCode: string, required: boolean): string | undefined {
  if (!g) return required ? "GSTIN is required for this GST registration type." : undefined;
  if (!RX.gstin.test(g)) return "15 characters: 2-digit state code, 10-character PAN, entity no., Z, check character.";
  if (stateCode && g.slice(0, 2) !== stateCode) return `GSTIN starts with ${g.slice(0, 2)} but the billing address is in state ${stateCode}. They must match.`;
  return undefined;
}

/** Expiry must be after the demo date (11/2026). */
export function expiryError(e: string, label = "Expiry"): string | undefined {
  const x = RX.expiry.exec(e);
  if (!x) return `${label} as MM/YYYY.`;
  if (Number(x[2]) * 12 + Number(x[1]) <= 2026 * 12 + 11) return `${label} must be after 11/2026.`;
  return undefined;
}

/* ---------- Styles ---------- */

export const box = "rounded-tile bg-side p-4 print:hidden";
export const inputCls =
  "h-9 w-full rounded-ctl bg-raised px-3 text-[13.5px] text-ink placeholder:text-ink-4 shadow-[inset_0_0_0_1px_var(--line-2)] outline-none focus:shadow-[inset_0_0_0_1px_var(--line-3)] read-only:bg-side read-only:text-ink-3";
export const cellInput =
  "h-8 w-full min-w-0 rounded-ctl bg-raised px-2 font-mono text-[12.5px] text-ink shadow-[inset_0_0_0_1px_var(--line-2)] outline-none focus:shadow-[inset_0_0_0_1px_var(--line-3)]";

/* ---------- Field guide ---------- */

export type GuideEntry = { label: string; what: string; rule: string; why: string; tab?: string };
export type Guide = Record<string, GuideEntry>;

/** Right-hand panel: explains the focused field and lists the fields of the current tab. */
export function FieldGuide({ guide, active, onPick, tab }: { guide: Guide; active: string; onPick: (k: string) => void; tab?: string }) {
  const entries = Object.entries(guide).filter(([, v]) => !tab || !v.tab || v.tab === tab);
  const cur = guide[active];
  const onTab = cur && (!tab || !cur.tab || cur.tab === tab);
  const g = (onTab ? cur : entries[0]?.[1]) ?? Object.values(guide)[0];
  return (
    <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
      <div className="at-blue tint rounded-tile px-3.5 py-3 text-[13px] leading-relaxed">
        <p className="mb-1 flex items-center gap-1.5 font-semibold">
          <Info className="size-4" /> {g.label}
        </p>
        <p className="text-ink-2">{g.what}</p>
        <p className="mt-1.5 text-ink-2">
          <span className="font-medium text-ink">Rule: </span>
          {g.rule}
        </p>
        <p className="mt-1.5 text-ink-2">
          <span className="font-medium text-ink">Why it matters: </span>
          {g.why}
        </p>
      </div>
      <div>
        <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-wide text-ink-4">{tab ? `Fields on the ${tab} tab` : "Fields on this screen"}</p>
        <ul className="flex flex-wrap gap-1">
          {entries.map(([k, v]) => (
            <li key={k}>
              <button
                onClick={() => onPick(k)}
                className={cn("rounded-pill px-2 py-0.5 text-[11.5px]", k === active ? "bg-ink text-paper" : "bg-raised text-ink-3 shadow-[inset_0_0_0_1px_var(--line)] hover:text-ink")}
              >
                {v.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/* ---------- Inputs ---------- */

export function F({
  k,
  label,
  value,
  onChange,
  setActive,
  error,
  placeholder,
  mono,
  upper,
  required,
  hint,
  readOnly,
  action,
}: {
  k: string;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  setActive: (k: string) => void;
  error?: string;
  placeholder?: string;
  mono?: boolean;
  upper?: boolean;
  required?: boolean;
  hint?: string;
  readOnly?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 flex items-center gap-1 text-[12px] font-medium text-ink-3">
        {label}
        {required && <span className="text-critical">*</span>}
      </span>
      <span className="flex gap-1.5">
        <input
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onFocus={() => setActive(k)}
          onChange={(e) => onChange?.(upper ? e.target.value.toUpperCase().replace(/\s/g, "") : e.target.value)}
          className={cn(inputCls, mono && "font-mono tracking-wide", error && "shadow-[inset_0_0_0_1px_var(--critical)]")}
          aria-invalid={!!error}
        />
        {action}
      </span>
      {error ? <span className="mt-1 block text-[11.5px] text-critical">{error}</span> : hint && <span className="mt-1 block text-[11.5px] text-ink-4">{hint}</span>}
    </label>
  );
}

export function Chips<T extends string>({ k, label, options, value, onChange, setActive }: { k: string; label: string; options: { v: T; l: string }[]; value: T; onChange: (v: T) => void; setActive: (k: string) => void }) {
  return (
    <div className="min-w-0">
      <span className="mb-1 block text-[12px] font-medium text-ink-3">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            onFocus={() => setActive(k)}
            onClick={() => {
              setActive(k);
              onChange(o.v);
            }}
            className={cn("h-8 rounded-ctl px-2.5 text-[12.5px]", value === o.v ? "bg-ink text-paper" : "bg-raised text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover")}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Multi-select chips (reminder schedule, channels). */
export function MultiChips({ k, label, options, value, onChange, setActive }: { k: string; label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; setActive: (k: string) => void }) {
  return (
    <div className="min-w-0">
      <span className="mb-1 block text-[12px] font-medium text-ink-3">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onFocus={() => setActive(k)}
              onClick={() => {
                setActive(k);
                onChange(on ? value.filter((x) => x !== o) : [...value, o]);
              }}
              className={cn("inline-flex h-8 items-center gap-1 rounded-ctl px-2.5 text-[12.5px]", on ? "bg-ink text-paper" : "bg-raised text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover")}
            >
              {on && <Check className="size-3.5" />}
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Toggle({ k, label, value, onChange, setActive, disabled, hint }: { k: string; label: string; value: boolean; onChange: (v: boolean) => void; setActive: (k: string) => void; disabled?: boolean; hint?: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-ctl bg-side px-3 py-2">
      <span className="text-[12.5px] text-ink-2">
        {label}
        {hint && <span className="block text-[11px] text-ink-4">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={disabled}
        onFocus={() => setActive(k)}
        onClick={() => {
          setActive(k);
          onChange(!value);
        }}
        className={cn("relative h-5 w-9 shrink-0 rounded-pill transition-colors disabled:opacity-50", value ? "bg-ink" : "bg-line-3")}
      >
        <span className={cn("absolute top-0.5 size-4 rounded-pill bg-paper transition-[left]", value ? "left-[18px]" : "left-0.5")} />
      </button>
    </div>
  );
}

/** Tab strip; a red dot marks a tab with errors after a save attempt. */
export function Tabs({ tabs, active, onChange, errors }: { tabs: string[]; active: string; onChange: (t: string) => void; errors?: Record<string, boolean> }) {
  return (
    <div role="tablist" className="mb-4 flex flex-wrap gap-1 rounded-ctl bg-side p-1">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={t === active}
          onClick={() => onChange(t)}
          className={cn("relative h-8 flex-1 rounded-ctl px-3 text-[12.5px] font-medium", t === active ? "bg-raised text-ink shadow-[inset_0_0_0_1px_var(--line-2)]" : "text-ink-3 hover:text-ink")}
        >
          {t}
          {errors?.[t] && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-pill bg-critical" aria-label="has errors" />}
        </button>
      ))}
    </div>
  );
}

/** Repeatable card (contact, address, bank account). */
export function Card({ title, onRemove, children }: { title: string; onRemove?: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-tile bg-side p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-semibold text-ink-2">{title}</p>
        {onRemove && (
          <button onClick={onRemove} className="text-[11.5px] text-ink-4 hover:text-critical">
            Remove
          </button>
        )}
      </div>
      <div className="grid gap-2.5 sm:grid-cols-3">{children}</div>
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex h-8 items-center gap-1 rounded-ctl px-2.5 text-[12.5px] text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover">
      + {children}
    </button>
  );
}

export function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2 mt-4 flex items-center justify-between first:mt-0">
      <p className="text-[12.5px] font-semibold text-ink">{children}</p>
      {action}
    </div>
  );
}

/* ---------- Frame ---------- */

/** Mock app window: route + title, so people see where the screen lives in MENO. */
export function Screen({ route, title, children, actions }: { route: string; title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-tile bg-raised shadow-[inset_0_0_0_1px_var(--line-2)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-side px-3.5 py-2">
        <span className="flex gap-1">
          <span className="size-2 rounded-pill bg-line-3" />
          <span className="size-2 rounded-pill bg-line-3" />
          <span className="size-2 rounded-pill bg-line-3" />
        </span>
        <span className="font-mono text-[11.5px] text-ink-4">meno · {route}</span>
        <span className="flex-1" />
        {actions}
      </div>
      <div className="p-4">
        <p className="mb-3 font-display text-[16px] font-semibold text-ink">{title}</p>
        {children}
      </div>
    </div>
  );
}

export function NextBar({ onBack, onNext, nextLabel, canNext, note }: { onBack?: () => void; onNext?: () => void; nextLabel: string; canNext: boolean; note: React.ReactNode }) {
  return (
    <div className={cn(box, "flex flex-wrap items-center gap-3")}>
      <div className="min-w-[220px] flex-1 text-[13px] text-ink-2">
        <span className="font-semibold text-ink">Next step: </span>
        {note}
      </div>
      {onBack && (
        <button onClick={onBack} className="inline-flex h-9 items-center gap-1.5 rounded-ctl px-3 text-[13px] text-ink-2 hover:bg-hover">
          <ArrowLeft className="size-4" /> Back
        </button>
      )}
      {onNext && (
        <button onClick={onNext} disabled={!canNext} className="inline-flex h-9 items-center gap-1.5 rounded-ctl bg-ink px-3.5 text-[13px] font-medium text-paper disabled:opacity-40">
          {nextLabel} <ArrowRight className="size-4" />
        </button>
      )}
    </div>
  );
}

export function SavedNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="at-green tint rounded-tile px-3.5 py-2.5 text-[13px]">
      <p className="flex items-center gap-1.5 font-semibold">
        <Check className="size-4" /> Saved
      </p>
      <div className="mt-1 text-ink-2">{children}</div>
    </div>
  );
}

export function SaveButton({ onClick, label = "Save", kbd }: { onClick: () => void; label?: string; kbd?: string }) {
  return (
    <button onClick={onClick} className="inline-flex h-9 items-center gap-2 rounded-ctl bg-ink px-3.5 text-[13px] font-medium text-paper">
      {label} {kbd && <span className="rounded-xs bg-paper/20 px-1 font-mono text-[10.5px]">{kbd}</span>}
    </button>
  );
}
