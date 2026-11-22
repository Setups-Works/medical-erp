"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/*
 * Teaching-only: shows which medicine-form fields can be auto-filled from openFDA's NDC (product) directory.
 * The Hub calls openFDA from the browser; in MENO every external call goes through meno-api.
 */
const ENDPOINT = "https://api.fda.gov/drug/ndc.json";

/* Demo copy of the INN → US name map. In MENO this is a configuration table, never code. */
const INN_TO_US: Record<string, string> = {
  paracetamol: "acetaminophen",
  salbutamol: "albuterol",
  adrenaline: "epinephrine",
  frusemide: "furosemide",
  glibenclamide: "glyburide",
  lignocaine: "lidocaine",
};

type Mode = "brand" | "salt" | "barcode";
type Product = {
  product_ndc?: string;
  brand_name?: string;
  brand_name_base?: string;
  generic_name?: string;
  labeler_name?: string;
  dosage_form?: string;
  route?: string[];
  product_type?: string;
  active_ingredients?: { name?: string; strength?: string }[];
  packaging?: { package_ndc?: string; description?: string }[];
  openfda?: { upc?: string[]; manufacturer_name?: string[] };
};

function buildSearch(mode: Mode, q: string): { search: string; note?: string } | null {
  if (mode === "barcode") {
    const d = q.replace(/\s/g, "");
    if (!/^\d{8,14}$/.test(d)) return null;
    // openFDA keeps 12-digit UPC-A with a leading 0, so try both forms.
    return { search: d.length === 12 ? `openfda.upc:${d}+openfda.upc:0${d}` : `openfda.upc:${d}` };
  }
  const t = q.trim().replace(/"/g, "").toLowerCase();
  if (t.length < 2 || t.length > 80) return null;
  if (mode === "brand") return { search: `brand_name:${encodeURIComponent(`"${t}"`)}` };
  const us = INN_TO_US[t];
  return { search: `generic_name:${encodeURIComponent(`"${us ?? t}"`)}`, note: us ? `Indian name “${t}” searched as US name “${us}”.` : undefined };
}

const title = (s?: string) => (s ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "");
/** "500 mg/1" → "500 mg"; "1000 mg/30mL" stays as is. */
const strength = (s?: string) => (s ? s.replace(/\/1$/, "").trim() : "");
/** "TABLET, FILM COATED" → "Tablet" (MENO's dosage-form list is coarser; the raw value is kept as a hint). */
const dosageForm = (s?: string) => title(s?.split(",")[0]);
/** "1 BOTTLE … / 100 TABLET, COATED in 1 BOTTLE" → "100 tablet / bottle". */
function pack(desc?: string) {
  if (!desc) return "";
  const inner = desc.split("/").pop()?.trim() ?? desc;
  const m = inner.match(/^(\d+(?:\.\d+)?)\s+([A-Z ,]+?)\s+in\s+1\s+([A-Z ,]+?)(?:\s*\(|$)/i);
  return m ? `${m[1]} ${title(m[2].split(",")[0])} / ${title(m[3].split(",")[0])}` : inner;
}

type Field = { label: string; value: string; filled: boolean; hint?: string };

function toFields(p: Product): Field[] {
  const salts = (p.active_ingredients ?? []).map((a) => `${title(a.name)} ${strength(a.strength)}`.trim()).join(" + ");
  const packs = (p.packaging ?? []).map((x) => pack(x.description)).filter(Boolean);
  const auto = (label: string, value: string, hint?: string): Field => ({ label, value, filled: Boolean(value), hint });
  const user = (label: string, hint: string): Field => ({ label, value: "", filled: false, hint });
  return [
    auto("Medicine name", p.brand_name ?? ""),
    auto("Brand", p.brand_name_base ?? p.brand_name ?? ""),
    auto("Generic name", title(p.generic_name)),
    auto("Composition (salt + strength)", salts),
    auto("Manufacturer", p.labeler_name ?? p.openfda?.manufacturer_name?.[0] ?? ""),
    auto("Dosage form", dosageForm(p.dosage_form), p.dosage_form),
    auto("Route", title(p.route?.[0])),
    auto("Pack", packs[0] ?? "", packs.length > 1 ? `Other packs: ${packs.slice(1).join(" · ")}. Check against the Indian pack (strip of 10 / 15).` : "Check against the Indian pack (strip of 10 / 15)."),
    auto("Barcode", p.openfda?.upc?.[0] ?? "", "US UPC; Indian packs carry 890… EAN-13."),
    user("HSN code", "Indian tax data: the user picks it (HSN master)."),
    user("GST rate", "Comes from the HSN master, never typed and never from openFDA."),
    user("Schedule (OTC / H / H1 / X)", "Indian law: the pharmacist sets it. A US prescription drug is not the same as Schedule H."),
    user("Rack location, reorder level", "Branch settings."),
  ];
}

export function OpenFdaPlayground() {
  const [mode, setMode] = useState<Mode>("brand");
  const [q, setQ] = useState("tylenol");
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; total?: number; results?: Product[]; message?: string; note?: string; url?: string }>({ status: "idle" });
  const [picked, setPicked] = useState<Product | null>(null);
  const abort = useRef<AbortController | null>(null);

  async function run() {
    const built = buildSearch(mode, q);
    if (!built) {
      setState({ status: "error", message: mode === "barcode" ? "Enter 8–14 digits." : "Enter 2–80 characters." });
      return;
    }
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    const url = `${ENDPOINT}?search=${built.search}&limit=5`;
    setState({ status: "loading", url, note: built.note });
    setPicked(null);
    try {
      const res = await fetch(url, { signal: ctl.signal });
      const body = (await res.json()) as { meta?: { results?: { total?: number } }; results?: Product[]; error?: { code?: string } };
      if (res.status === 404 || body.error?.code === "NOT_FOUND") setState({ status: "done", total: 0, results: [], url, note: built.note });
      else if (res.status === 429) setState({ status: "error", message: "openFDA rate limit reached. Try again in a minute.", url });
      else if (!res.ok) setState({ status: "error", message: `openFDA answered HTTP ${res.status}.`, url });
      else {
        const results = body.results ?? [];
        setState({ status: "done", total: body.meta?.results?.total ?? 0, results, url, note: built.note });
        if (results.length === 1) setPicked(results[0]);
      }
    } catch (e) {
      if ((e as { name?: string }).name !== "AbortError") setState({ status: "error", message: "Couldn’t reach openFDA.", url });
    }
  }

  const tab = (m: Mode, label: string, sample: string) => (
    <button
      onClick={() => {
        setMode(m);
        setQ(sample);
      }}
      className={cn("h-8 rounded-pill px-3 text-[12.5px] shadow-[inset_0_0_0_1px_var(--line-2)]", mode === m ? "bg-ink text-paper" : "text-ink-2 hover:bg-hover")}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3 rounded-tile bg-side p-4 print:hidden">
      <div className="flex flex-wrap gap-1.5">
        {tab("brand", "Brand name", "tylenol")}
        {tab("salt", "Salt / generic", "paracetamol")}
        {tab("barcode", "Barcode", "0070038610953")}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          inputMode={mode === "barcode" ? "numeric" : "text"}
          aria-label="Search openFDA products"
          className="h-9 min-w-0 flex-1 rounded-ctl bg-raised px-2.5 font-mono text-[13px] shadow-[inset_0_0_0_1px_var(--line-2)] outline-none focus:shadow-[inset_0_0_0_1px_var(--line-3)]"
        />
        <button type="submit" className="h-9 shrink-0 rounded-ctl bg-ink px-4 text-[13px] font-medium text-paper disabled:opacity-60" disabled={state.status === "loading"}>
          {state.status === "loading" ? "Searching…" : "Search"}
        </button>
      </form>

      {state.url && <p className="break-all font-mono text-[11.5px] text-ink-3">GET {decodeURIComponent(state.url)}</p>}
      {state.note && <p className="text-[12.5px] text-ink-2">{state.note}</p>}
      {state.status === "error" && <p className="text-[13px] text-critical">{state.message}</p>}
      {state.status === "done" && (
        <p className="text-[13px] text-ink-2">
          {state.total ? `${state.total.toLocaleString("en-IN")} products match${state.results && state.results.length > 1 ? ". Pick one to fill the form." : "."}` : "No matches (HTTP 404, NOT_FOUND): MENO would open quick-create."}
        </p>
      )}

      {!picked && state.results && state.results.length > 1 && (
        <div className="space-y-1.5">
          {state.results.map((p, i) => (
            <button
              key={p.product_ndc ?? i}
              onClick={() => setPicked(p)}
              className="block w-full rounded-tile bg-raised px-3 py-2 text-left shadow-[inset_0_0_0_1px_var(--line)] hover:bg-hover"
            >
              <span className="text-[13.5px] font-semibold text-ink">{p.brand_name ?? "—"}</span>
              <span className="block text-[12px] text-ink-3">
                {(p.active_ingredients ?? []).map((a) => `${title(a.name)} ${strength(a.strength)}`).join(" + ")} · {dosageForm(p.dosage_form)} · {p.labeler_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {picked && (
        <div className="rounded-tile bg-raised p-3 shadow-[inset_0_0_0_1px_var(--line)]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[14px] font-semibold text-ink">New medicine: auto-fill preview</p>
            {state.results && state.results.length > 1 && (
              <button onClick={() => setPicked(null)} className="text-[12.5px] text-ink-3 underline underline-offset-2 hover:text-ink">
                Back to results
              </button>
            )}
          </div>
          <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
            {toFields(picked).map((f) => (
              <label key={f.label} className="block">
                <span className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
                  {f.label}
                  <span className={cn("tint rounded-pill px-1.5 text-[10.5px] font-semibold", f.filled ? "at-green" : "at-amber")}>{f.filled ? "auto-filled" : "you fill"}</span>
                </span>
                <input
                  readOnly
                  value={f.value}
                  placeholder={f.filled ? "" : "—"}
                  className="h-9 w-full rounded-ctl bg-paper px-2.5 text-[13px] text-ink shadow-[inset_0_0_0_1px_var(--line-2)] outline-none"
                />
                {f.hint && <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-4">{f.hint}</span>}
              </label>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-ink-4">source: openFDA NDC {picked.product_ndc ?? "—"}</p>
        </div>
      )}

      <p className="text-[11.5px] leading-relaxed text-ink-3">
        Data provided by the U.S. Food and Drug Administration (open.fda.gov). US products only: for Indian packs MENO fills this form from the Indian medicine database (CAT-10 / INT-11).
      </p>
    </div>
  );
}
