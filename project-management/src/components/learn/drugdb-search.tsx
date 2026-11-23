"use client";

import { Loader2, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/* Live DrugDB typeahead for the Day 19 lesson. Calls the Hub proxy (/api/learn/drugdb), never DrugDB directly. */

type Hit = {
  product_id: string;
  name: string;
  composition?: string;
  dosage_form?: string;
  manufacturer?: string;
  packaging?: string;
  mrp?: number;
  rx_required?: boolean;
};
type SearchOut = { total?: number; results?: Hit[]; fuzzy?: boolean; searched_as?: string; unit_ignored?: boolean; ignored?: string[] };
type Product = Hit & { pack_type?: string; quantity?: string; status?: string; country_of_origin?: string; primary_use?: string[] };

const DEBOUNCE_MS = 200; // DrugDB suggests waiting 150–250 ms after the user pauses
const rupees = (n?: number) => (typeof n === "number" ? `₹${n.toFixed(2)}` : "");

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Couldn’t search DrugDB.");
  return data;
}

export function DrugDbSearch() {
  const listId = useId();
  const [q, setQ] = useState("");
  const [out, setOut] = useState<SearchOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [picked, setPicked] = useState<Product | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const ctl = useRef<AbortController | null>(null);
  // Picking a result writes its name into the box; that must not start another (quota-counted) search.
  const skipNext = useRef(false);

  // Search after a pause; cancel the previous request so an older answer never overwrites a newer one.
  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const term = q.trim();
    ctl.current?.abort();
    if (term.length < 2) {
      setOut(null);
      setLoading(false);
      setError("");
      return;
    }
    const c = new AbortController();
    ctl.current = c;
    const t = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getJson<SearchOut>(`/api/learn/drugdb?q=${encodeURIComponent(term)}`, c.signal);
        setOut(data);
        setActive(data.results?.length ? 0 : -1);
        setOpen(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError((e as Error).message);
          setOut(null);
        }
      } finally {
        if (!c.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [q]);

  async function pick(hit: Hit) {
    setOpen(false);
    if (q !== hit.name) skipNext.current = true; // same text → no effect run → nothing to skip
    setQ(hit.name);
    setPicked(hit);
    setDetailLoading(true);
    try {
      const p = await getJson<Product>(`/api/learn/drugdb?id=${encodeURIComponent(hit.product_id)}`, new AbortController().signal);
      setPicked({ ...hit, ...p });
    } catch {
      /* keep the search row; details are a bonus */
    } finally {
      setDetailLoading(false);
    }
  }

  const results = out?.results ?? [];
  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open && results[active]) {
      e.preventDefault();
      void pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const notes = [
    out?.fuzzy && "No exact match: these are typo matches.",
    out?.searched_as && `Searched as “${out.searched_as}”.`,
    out?.unit_ignored && "The unit you typed was ignored (the names give only the number).",
    out?.ignored?.length && `Ignored: ${out.ignored.join(", ")} (not confirmed for these products).`,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-3 rounded-tile bg-side p-4 print:hidden">
      <div className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
          <input
            role="combobox"
            aria-expanded={open && results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
            aria-label="Search DrugDB"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPicked(null);
            }}
            onKeyDown={onKey}
            onFocus={() => results.length && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder="Type a medicine: dolo 650, crocin, pan 40, paracetmol…"
            className="h-10 w-full rounded-ctl bg-raised pl-8 pr-9 text-[13.5px] shadow-[inset_0_0_0_1px_var(--line-2)] outline-none focus:shadow-[inset_0_0_0_1px_var(--line-3)]"
          />
          {loading && <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-ink-4" />}
        </div>

        {open && out && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-[340px] w-full overflow-y-auto rounded-tile bg-raised py-1 shadow-pop"
          >
            {results.length === 0 && <li className="px-3 py-2 text-[13px] text-ink-3">No medicine found. In MENO: quick-create by hand.</li>}
            {results.map((r, i) => (
              <li
                key={r.product_id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  void pick(r);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn("cursor-pointer px-3 py-2", i === active && "bg-hover")}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[13.5px] font-medium text-ink">{r.name}</span>
                  <span className="shrink-0 font-mono text-[12px] text-ink-3">{rupees(r.mrp)}</span>
                </div>
                <div className="truncate text-[12px] text-ink-3">
                  {[r.composition, r.packaging, r.manufacturer].filter(Boolean).join(" · ")}
                </div>
              </li>
            ))}
            {notes.map((n) => (
              <li key={n} className="tint at-amber mx-2 my-1 rounded-ctl px-2 py-1 text-[11.5px]">
                {n}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="font-mono text-[11.5px] text-ink-3">
        {q.trim().length >= 2 ? `GET https://drugdb.in/v1/search?q=${q.trim()}&limit=8` : "↑ ↓ to move, Enter to pick, Esc to close"}
        {out?.total !== undefined && q.trim().length >= 2 ? ` · ${out.total.toLocaleString("en-IN")} found` : ""}
      </p>
      {error && <p className="text-[13px] text-critical">{error}</p>}

      {picked && (
        <div className="rounded-tile bg-raised p-3 shadow-[inset_0_0_0_1px_var(--line)]">
          <p className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-ink">
            New medicine: auto-fill preview
            {detailLoading && <Loader2 className="size-3.5 animate-spin text-ink-4" />}
          </p>
          <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
            {fields(picked).map((f) => (
              <label key={f.label} className="block">
                <span className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
                  {f.label}
                  <span className={cn("tint rounded-pill px-1.5 text-[10.5px] font-semibold", f.value ? "at-green" : "at-amber")}>{f.value ? "auto-filled" : "you fill"}</span>
                </span>
                <input readOnly value={f.value} placeholder="—" className="h-9 w-full rounded-ctl bg-paper px-2.5 text-[13px] text-ink shadow-[inset_0_0_0_1px_var(--line-2)] outline-none" />
                {f.hint && <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-4">{f.hint}</span>}
              </label>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-ink-4">source: drugdb {picked.product_id}</p>
        </div>
      )}
      <p className="text-[11.5px] leading-relaxed text-ink-3">Data from DrugDB (drugdb.in) by HealthPilot. Reference for staff; the pharmacist checks every field.</p>
    </div>
  );
}

function fields(p: Product): { label: string; value: string; hint?: string }[] {
  const pack = p.pack_type && p.quantity ? `${p.pack_type} of ${p.quantity}` : (p.packaging ?? "");
  return [
    { label: "Medicine name", value: p.name ?? "" },
    { label: "Composition (salt + strength)", value: p.composition ?? "" },
    { label: "Manufacturer", value: p.manufacturer ?? "" },
    { label: "Dosage form", value: p.dosage_form ?? "" },
    { label: "Pack", value: pack, hint: p.packaging ? `As listed: ${p.packaging}` : undefined },
    { label: "Rx required", value: p.rx_required === undefined ? "" : p.rx_required ? "Yes" : "No", hint: "The pharmacist confirms; the schedule is separate." },
    { label: "MRP (hint only)", value: rupees(p.mrp), hint: "Not saved on the item: MRP belongs to the batch, from purchase entry." },
    { label: "Barcode", value: "", hint: "DrugDB has no barcodes: scan the pack (CAT-04)." },
    { label: "HSN code", value: "", hint: "From our HSN master." },
    { label: "GST rate", value: "", hint: "Follows the HSN; never typed." },
    { label: "Schedule (OTC / H / H1 / X)", value: "", hint: "Set by the pharmacist." },
  ];
}
