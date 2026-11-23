"use client";

import { B, C, Callout, Flow, List, Quiz, Section, Sub, Table } from "../kit";
import { OpenFdaPlayground } from "../openfda-playground";

/** Day 18: the openFDA drug label API and how MENO uses it for reference info and barcode lookup. */
export function DrugReference() {
  return (
    <>
      <Section title="What openFDA is">
        <p>
          <B>openFDA is the US Food and Drug Administration&apos;s free, public API.</B> Its <C>drug/label</C> endpoint holds the official package inserts (labels) of US prescription and OTC medicines: about 2.6 lakh labels, updated weekly. Each label has the sections a pharmacist reads (indications, dosage, warnings, interactions) plus a harmonised <C>openfda</C> block with names, codes and barcodes.
        </p>
        <Table
          head={["Fact", "Value"]}
          rows={[
            ["Endpoint", <C key="e">https://api.fda.gov/drug/label.json</C>],
            ["Cost", "Free. An API key is free too"],
            ["Licence", "Public domain (CC0). Credit is asked, not required: “Data provided by the U.S. Food and Drug Administration (open.fda.gov)”"],
            ["Coverage", "US labels only, 2009 to now, prescription + OTC"],
            ["Limits without key", "240 requests / minute, 1,000 / day per IP"],
            ["Limits with key", "240 requests / minute, 120,000 / day per key"],
          ]}
        />
        <Callout tone="rule" title="It is a reference, not a source of truth">
          Every response carries FDA&apos;s own disclaimer: don&apos;t rely on it for medical decisions and assume results are unvalidated. Labels are US labels and may differ from the Indian pack. MENO shows it as <B>reference information for staff</B>, always with that disclaimer, and never lets it block or change a bill.
        </Callout>
      </Section>

      <Section title="MENO is India-only: where openFDA fits">
        <p>
          openFDA is <B>US</B> data: US names, US products, US barcodes. An Indian counter scans Dolo, Crocin and Pan-D with <C>890…</C> barcodes, which openFDA does not have. So MENO splits the job in two:
        </p>
        <Table
          head={["Job", "Source", "Features", "Who", "Phase"]}
          rows={[
            ["Fill the product create form, look up an unknown barcode", <B key="i">Indian medicine database</B>, "CAT-10, INT-11, CAT-22, CAT-23", "Kamesh (catalog) · Ashok (screens) · Nitheesh + Jeeva (INT-11)", "P3–P4"],
            ["Show uses, dosage, warnings, interactions for a salt", "openFDA (reference only)", "INT-10, CAT-21", "Nitheesh + Jeeva · Kamesh + Ashok", "P6"],
          ]}
        />
        <Callout tone="verify" title="The Indian source is not chosen yet">
          Jeeva compares the options (GS1 India product data, licensed commercial drug databases, NPPA / CDSCO lists), Prakalya checks their hit rate against 100 items from real pharmacy bills, and Nitheesh decides and writes the ADR in P2.
        </Callout>
        <Callout tone="note" title="Why openFDA is still useful">
          A molecule is the same in every country. The uses, dose limits, warnings and interactions of paracetamol on a US label are useful reference for a pharmacist, as long as we search by <B>salt</B> and say &quot;US label: the Indian label may differ&quot;.
        </Callout>
      </Section>

      <Section title="How a request looks">
        <p>
          One URL, query parameters only. <C>search</C> is <C>field:term</C>; join conditions with <C>+AND+</C>; a <C>+</C> (or space) between terms means OR. Put phrases in quotes.
        </p>
        <Table
          head={["Parameter", "Meaning"]}
          mono={[0]}
          rows={[
            ["search", "What to match, e.g. openfda.brand_name:\"tylenol\""],
            ["limit", "Records per page (default 1, max 1000)"],
            ["skip", "Records to skip for paging (max 25,000)"],
            ["sort", "field:asc or field:desc, e.g. effective_time:desc"],
            ["count", "Return the top values of a field instead of records"],
            ["api_key", "Your key (the backend adds it; never in the browser)"],
          ]}
        />
        <Sub>Examples (all checked live)</Sub>
        <Table
          head={["Goal", "Query"]}
          mono={[1]}
          compact
          rows={[
            ["By brand", "search=openfda.brand_name:\"tylenol\"&limit=5"],
            ["By generic", "search=openfda.generic_name:\"acetaminophen\"&limit=5"],
            ["By salt, prescription only", "search=openfda.substance_name:\"metformin\"+AND+openfda.product_type:\"HUMAN PRESCRIPTION DRUG\""],
            ["By barcode (UPC / EAN)", "search=openfda.upc:0070038610953"],
            ["Both barcode forms at once", "search=openfda.upc:070038610953+openfda.upc:0070038610953"],
            ["Labels mentioning an interaction", "search=drug_interactions:\"warfarin\"&limit=5"],
          ]}
        />
      </Section>

      <Section title="What comes back">
        <p>
          Every reply has a <C>meta</C> block and a <C>results</C> array. When nothing matches, the API answers <B>HTTP 404</B> with <C>{"{ error: { code: \"NOT_FOUND\" } }"}</C>. That is a normal &quot;no result&quot;, not a failure.
        </p>
        <pre className="avoid-break overflow-x-auto rounded-tile bg-sunken p-3 font-mono text-[12px] leading-relaxed text-ink">{`{
  "meta": {
    "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. ...",
    "license": "https://open.fda.gov/license/",
    "last_updated": "2026-11-20",
    "results": { "skip": 0, "limit": 1, "total": 3516 }
  },
  "results": [{
    "set_id": "0005aafa-…", "version": "…", "effective_time": "2024…",
    "indications_and_usage": ["…"], "warnings": ["…"], "dosage_and_administration": ["…"],
    "openfda": {
      "brand_name": ["Pain Reliever Extra Strength"], "generic_name": ["ACETAMINOPHEN"],
      "substance_name": ["ACETAMINOPHEN"], "manufacturer_name": ["…"], "route": ["ORAL"],
      "product_type": ["HUMAN OTC DRUG"], "product_ndc": ["63941-519"],
      "package_ndc": ["63941-519-15"], "upc": ["0070038610953"], "rxcui": ["198440"]
    }
  }]
}`}</pre>
        <Sub>Fields MENO reads</Sub>
        <Table
          head={["Field", "Used for"]}
          mono={[0]}
          rows={[
            ["openfda.substance_name / generic_name", "Finding the label for a salt (after INN → US name mapping)"],
            ["openfda.brand_name, manufacturer_name, route", "Showing which US product the reference text came from"],
            ["openfda.upc", "Not used: Indian barcodes come from the Indian database"],
            ["indications_and_usage, dosage_and_administration", "Reference panel"],
            ["boxed_warning, warnings, contraindications, drug_interactions", "Reference panel, warnings first"],
            ["pregnancy, storage_and_handling", "Reference panel"],
            ["set_id, version, effective_time", "Cache key and “which label did this come from”"],
          ]}
        />
        <Callout tone="note">
          Almost every value is an <B>array</B>, even single names (<C>brand_name: [&quot;…&quot;]</C>). Label sections are arrays of long text blocks. The <C>openfda</C> block is missing on some labels, so code must treat every field as optional.
        </Callout>
      </Section>

      <Section title="Indian names vs US names">
        <p>
          openFDA uses US names. A search for <C>paracetamol</C> returns <B>no match</B>; <C>acetaminophen</C> returns 3,500+ labels. Indian brands (Dolo, Crocin, Calpol) are not US products, so a brand search seldom finds them. MENO therefore searches by <B>salt</B>, after translating Indian (INN) names into US names:
        </p>
        <Table
          head={["India (INN)", "US (openFDA)"]}
          mono={[0, 1]}
          rows={[
            ["paracetamol", "acetaminophen"],
            ["salbutamol", "albuterol"],
            ["adrenaline", "epinephrine"],
            ["frusemide", "furosemide"],
            ["glibenclamide", "glyburide"],
            ["lignocaine", "lidocaine"],
          ]}
        />
        <Callout tone="rule">This map is a <B>configuration table</B> the catalog module owns, not a list in code (no hard-coding, AGENTS.md rule 13). The pharmacist can add rows.</Callout>
      </Section>

      <Section title="Barcode lookup and product create: the Indian flow">
        <p>
          Indian packs carry EAN-13 barcodes starting with <C>890</C>. openFDA stores US UPCs (12 digits, kept as 13 with a leading 0), and only about <B>one label in ten</B> has one, so it is <B>not</B> in this flow at all:
        </p>
        <Flow
          steps={[
            { title: "Scan / search", sub: "counter, purchase, item form", tone: "slate" },
            { title: "Own barcodes", sub: "CAT-04, tenant catalogue", tone: "blue" },
            { title: "Indian medicine data", sub: "CAT-10 via INT-11", tone: "violet" },
            { title: "Draft item", sub: "pre-filled, user confirms", tone: "green" },
            { title: "Miss → quick-create", sub: "barcode already filled", tone: "amber" },
          ]}
        />
        <Table
          head={["Item field", "Pre-filled from the Indian database?"]}
          rows={[
            ["Name, brand, salts + strength, manufacturer, dosage form", "Yes, marked and editable"],
            ["Pack (strip of 10 / 15), loose unit, barcode", "Yes, user checks it"],
            ["HSN, GST rate, schedule (H / H1 / X), Rx required", "Suggested at most; the user (or the HSN / schedule masters) confirms. Save is blocked until they are set"],
            ["MRP, PTR, batch, expiry", "Never on the item: they come from purchase entry"],
          ]}
        />
        <Callout tone="rule" title="Not in the POS hot path">
          Counter search must answer in under 150 ms and work offline. It reads only our own catalogue. External sources are called only for an <B>unknown</B> barcode, item creation or the reference panel (F1), and the counter keeps billing if they are slow or down.
        </Callout>
      </Section>

      <Section title="How we build the adapter (INT-10)">
        <List
          ordered
          items={[
            <><B>Backend only.</B> The web and desktop apps call <C>/api/v1/drug-reference/…</C> on meno-api; meno-api calls openFDA. The browser never talks to openFDA and never sees the key.</>,
            <><B>Key in secrets</B> (<C>OPENFDA_API_KEY</C> in the env, never in git). Without a key, 1,000 calls a day is not enough for a busy tenant.</>,
            <><B>Cache</B> label results by <C>set_id</C> and searches by normalised query for 7 days (labels update weekly). The cache is shared by all tenants, because openFDA data is public and holds no tenant data.</>,
            <><B>Errors</B>: 404 NOT_FOUND → empty result. 429 → back off and show &quot;Reference temporarily unavailable&quot;. Timeouts (3 s) → same. Never a 500 to the user.</>,
            <><B>Nothing tenant- or patient-related goes out.</B> We send only a drug name or a barcode, never a customer, prescription or tenant id.</>,
            <><B>Show the disclaimer and the credit</B> on every screen that shows label text, plus &quot;US label: the Indian label may differ&quot;.</>,
          ]}
        />
        <Callout tone="verify">
          How drug information may be shown to staff (and whether any of it may reach patients) needs a pharmacist&apos;s review before CAT-21 ships. Check <C>docs/compliance/COMPLIANCE.md</C>.
        </Callout>
      </Section>

      <Section title="Try it">
        <p>
          A live search against openFDA&apos;s <B>NDC product directory</B> (<C>drug/ndc.json</C>), which has the structured product data a create form needs: salts with strength, dosage form, pack and manufacturer. Pick a result to see which fields of the medicine form would be <B>auto-filled</B> and which the user must fill. Try <C>tylenol</C> (brand), <C>paracetamol</C> (salt, mapped to acetaminophen), or barcode <C>0070038610953</C>. This page calls openFDA directly <B>only because it is a teaching tool</B>; in MENO the call goes through meno-api, and Indian packs are filled from the Indian medicine database the same way.
        </p>
        <OpenFdaPlayground />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "A pharmacist searches openFDA for “paracetamol” and gets nothing. Why, and what does MENO do?", a: "openFDA uses US names. MENO maps paracetamol → acetaminophen from its configuration table and searches by salt." },
            { q: "A counter scans an unknown Dolo 650 strip. Where does MENO look?", a: "Own barcodes first, then the Indian medicine database (CAT-10 / INT-11). Not openFDA: it has no Indian brands or 890… barcodes." },
            { q: "openFDA found a label for a salt. Can we take the GST rate and schedule from it?", a: "No. openFDA has no Indian HSN, GST or schedule, and it is reference only. The user (or our HSN / schedule masters) sets them." },
            { q: "openFDA answers HTTP 404. Is that an error to log in Sentry?", a: "No. 404 with NOT_FOUND means “no matches”: return an empty result." },
            { q: "Why doesn't POS search call openFDA?", a: "POS search must be < 150 ms and work offline; it reads only our own catalogue." },
            { q: "Where does the API key live?", a: "In meno-api's secrets (env), never in the web or desktop app and never in git." },
          ]}
        />
      </Section>
    </>
  );
}
