"use client";

import { DrugDbSearch } from "../drugdb-search";
import { B, C, Callout, Flow, List, Quiz, Section, Sub, Table } from "../kit";

/** Day 19: two candidate Indian medicine data sources (DrugDB API, Kaggle A–Z dataset), compared for MENO. Facts checked 22 Nov 2026. */
export function IndianMedicineData() {
  return (
    <>
      <Section title="Why this lesson">
        <p>
          The medicine create form (CAT-23) and the unknown-barcode lookup (CAT-22) need <B>Indian</B> product data: Dolo 650, strip of 15, Micro Labs. openFDA can&apos;t give that (Day 18). This lesson looks at two candidates so we can discuss them as a team before Nitheesh decides the source (P2, recorded as an ADR).
        </p>
        <Table
          head={["", "DrugDB API", "Kaggle A–Z Medicine Dataset"]}
          rows={[
            ["What it is", "A live search API run by HealthPilot (drugdb.in)", "A one-time CSV download (32 MB)"],
            ["Size", "3.9 lakh+ prescription medicines, 3.4 lakh+ OTC, 18,000+ compositions (their figures)", "2,53,973 rows, 9 columns"],
            ["Fresh?", "Live; manufacturers can maintain their own products", "Snapshot from November 2022, not updated since"],
            ["Barcode", "No barcode field; a barcode search returns nothing", "No"],
            ["HSN / GST / schedule", "No (only rx_required)", "No"],
            ["Cost", "Free 30-day trial: 1,000 requests, 30 a minute. Production needs a paid plan", "Free"],
            ["Licence", "Terms of use: show results inside your product; no copying or bulk storing", "CC BY-SA 4.0: credit + share-alike"],
          ]}
        />
      </Section>

      <Section title="Option 1: DrugDB API">
        <Sub>How to call it</Sub>
        <List
          items={[
            <>Base URL <C>https://drugdb.in/v1</C>. Send the key in the <C>X-Api-Key</C> header. It lives in meno-api&apos;s secrets, never in the web or desktop app.</>,
            <><C>GET /v1/search?q=dolo 650&amp;limit=10</C>: typo-tolerant name search. Each result has a stable <C>product_id</C> starting with <C>DDID</C>.</>,
            <><C>GET /v1/products/{"{product_id}"}</C>: full details. Cacheable for 1 hour with an ETag (send <C>If-None-Match</C>, get 304 if unchanged).</>,
            <><C>POST /v1/interactions</C>: drug interaction check (advisory). <C>POST /v1/submissions</C> (post back a missing product) and <C>POST /v1/dosing</C> are marked &quot;coming soon&quot;.</>,
            <>Over a limit: <B>429</B> with <C>Retry-After</C> (<C>quota_exceeded</C> or <C>rate_limited</C>). An ended trial or plan: <B>403</B>.</>,
            <>Served from Azure South India, so calls from our Azure India VM are fast.</>,
          ]}
        />
        <Sub>A real search result (Dolo 650, checked live)</Sub>
        <pre className="avoid-break overflow-x-auto rounded-tile bg-sunken p-3 font-mono text-[12px] leading-relaxed text-ink">{`GET https://drugdb.in/v1/search?q=dolo%20650&limit=2
{
  "query": "dolo 650", "total": 2,
  "results": [
    { "product_id": "DDID9KTH4EA3", "kind": "drug", "name": "Dolo 650 Tablet",
      "composition": "Paracetamol (650mg)", "dosage_form": "Tablet",
      "manufacturer": "Micro Labs Ltd", "packaging": "strip of 15 tablets", "mrp": 32.28 },
    { "product_id": "DDIDQ1HE5BXJ", "name": "Dolo 650 Tablet",
      "composition": "Paracetamol (650mg)", "dosage_form": "Tablet",
      "manufacturer": "Micro Labs Ltd", "packaging": "strip of 10 tablets", "mrp": 22.84 }
  ]
}`}</pre>
        <Sub>Try it: search as you type</Sub>
        <p>
          The same search MENO&apos;s medicine form would use. Type a few letters; after a short pause the dropdown shows DrugDB matches (use ↑ ↓ and Enter). Pick one to see which form fields it fills. The Hub calls DrugDB from its server (<C>/api/learn/drugdb</C>), because DrugDB doesn&apos;t allow calls straight from a browser page (no CORS) and because a key must never reach the browser.
        </p>
        <DrugDbSearch />
        <p>
          Product details add <C>pack_type</C> (&quot;Strip&quot;), <C>quantity</C> (&quot;15&quot;), <C>status</C> (&quot;active&quot;), <C>primary_use</C>, <C>country_of_origin</C> and a <C>details</C> block (uses, side effects, interactions, storage, how to use). Note the <B>two packs</B> of the same medicine: the user must pick the right one.
        </p>
        <Callout tone="rule" title="What the terms say (read 22 Nov 2026)">
          <List
            items={[
              <>The <B>free trial is for evaluation</B>, with a request limit and an end date. <B>Production use needs a plan agreed with them.</B></>,
              <>We may <B>show results to our users</B> as part of our service.</>,
              <>We may <B>not</B> copy the catalogue or a large part of it, build a competing database, resell it, or <B>store it beyond what our service needs</B>. Saving the one product a pharmacy creates is fine; bulk-downloading the catalogue into MENO is not.</>,
              <>Without a key, calls count as a website visitor (400 searches a day). Using that from our server to avoid paying would break their fair-use terms.</>,
            ]}
          />
        </Callout>
      </Section>

      <Section title="Option 2: Kaggle A–Z Medicine Dataset of India">
        <Table
          head={["Column", "Example", "Maps to MENO"]}
          mono={[0, 1]}
          rows={[
            ["id", "1", "— (our own id is a UUIDv7)"],
            ["name", "Augmentin 625 Duo Tablet", "item.name"],
            ["price(₹)", "223.42", "Not on the item (MRP belongs to the batch); and it is from 2022"],
            ["Is_discontinued", "FALSE", "Skip discontinued rows (7,905 of them)"],
            ["manufacturer_name", "Glaxo SmithKline Pharmaceuticals Ltd", "manufacturer master"],
            ["type", "allopathy", "Always allopathy: no use"],
            ["pack_size_label", "strip of 10 tablets", "Parse into pack + loose unit + dosage form"],
            ["short_composition1", "Amoxycillin (500mg)", "composition (salt + strength)"],
            ["short_composition2", "Clavulanic Acid (125mg)", "composition; only 2 salts max, so 3+ salt combos are cut off"],
          ]}
        />
        <Callout tone="verify" title="Licence: CC BY-SA 4.0">
          Free to use commercially, but we must <B>credit the source</B> and share anything we build from it under the <B>same licence</B>. If we seed our medicine master from it, that master may have to be CC BY-SA too. The page also doesn&apos;t say where the data was collected; if it came from another company&apos;s website, the uploader may not have had the right to licence it. Ask before we ship it.
        </Callout>
      </Section>

      <Section title="What each fills on the medicine form">
        <Table
          head={["Item field", "DrugDB", "Kaggle dataset", "Nobody: user / masters"]}
          rows={[
            ["Name", "✅ name", "✅ name", ""],
            ["Salts + strength", "✅ composition", "✅ up to 2 salts", ""],
            ["Manufacturer", "✅ manufacturer", "✅ manufacturer_name", ""],
            ["Dosage form", "✅ dosage_form", "🟡 parse from pack label", ""],
            ["Pack, loose unit", "✅ pack_type + quantity", "🟡 parse from pack label", ""],
            ["Rx required", "🟡 rx_required (search, when present)", "❌", "Pharmacist confirms"],
            ["Barcode (890…)", "❌", "❌", "Scanned by the pharmacy (CAT-04)"],
            ["HSN, GST rate", "❌", "❌", "HSN master"],
            ["Schedule H / H1 / X", "❌", "❌", "Pharmacist"],
            ["MRP", "Shown as a hint only", "2022 price: don't use", "Purchase entry (batch)"],
          ]}
        />
        <Callout tone="note" title="Barcodes come from us">
          Neither source has barcodes. Every time a pharmacy scans an unknown pack and saves it, MENO learns that barcode → product link. Shared across tenants (barcode → product only, no tenant data), it grows with every customer. That design needs the tech lead&apos;s sign-off because it crosses tenants.
        </Callout>
      </Section>

      <Section title="How it would fit in MENO">
        <Flow
          steps={[
            { title: "Item form: type 'dolo 650'", sub: "or scan an unknown pack", tone: "slate" },
            { title: "meno-api", sub: "INT-11 adapter, key in secrets", tone: "blue" },
            { title: "DrugDB search", sub: "or our seeded copy", tone: "violet" },
            { title: "User picks the pack", sub: "strip of 15 vs 10", tone: "amber" },
            { title: "Form pre-filled", sub: "user adds HSN, GST, schedule", tone: "green" },
          ]}
        />
        <List
          items={[
            <>Store <C>source</C> (<C>drugdb</C> / <C>kaggle-az</C>) and the source id (<C>DDID…</C>) on the item, so we can refresh it or answer &quot;where did this come from?&quot;.</>,
            <>Never in the POS hot path: counter search reads only our own catalogue (&lt; 150 ms, works offline).</>,
            <>If the source is down or out of quota, the form still works: the user types it by hand.</>,
          ]}
        />
      </Section>

      <Section title="For the team discussion">
        <List
          ordered
          items={[
            <>Is DrugDB&apos;s paid plan affordable per tenant or per month? Jeeva gets a quote.</>,
            <>Does &quot;store only what your service needs&quot; allow keeping every product our pharmacies create? Confirm in writing with DrugDB.</>,
            <>Is the Kaggle data safe to use given CC BY-SA share-alike and its unknown origin? If not, use it only for tests and demos.</>,
            <>How good is each on real bills? Prakalya&apos;s check: 100 items from a pharmacy&apos;s bills, count the hits.</>,
            <>Do we also want GS1 India (DataKart) for barcodes, or start with the shared barcode list?</>,
          ]}
        />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "Can we use the DrugDB free trial in production for the pilot?", a: "No. The trial is for evaluation; production needs a paid plan." },
            { q: "Can we download all of DrugDB into our database once and stop calling it?", a: "No. Their terms forbid copying the catalogue or storing more than the service needs." },
            { q: "The Kaggle dataset says Augmentin 625 Duo costs ₹223.42. Do we put that on the item?", a: "No. MRP lives on the batch (from purchase entry), and that price is from 2022." },
            { q: "Which source gives the HSN code and Schedule H flag?", a: "Neither. HSN comes from our HSN master; the schedule is set by the pharmacist." },
            { q: "Where does the DrugDB API key live?", a: "In meno-api's secrets. The web and desktop apps never call DrugDB directly." },
          ]}
        />
      </Section>

      <p className="pt-4 text-[12px] text-ink-3">
        Sources: drugdb.in/developers and drugdb.in/terms (terms dated 14 Nov 2026), live API calls, and the Kaggle dataset page (licence CC BY-SA 4.0, prices as of Nov 2022). All checked 22 Nov 2026. Terms and prices can change: re-check before deciding.
      </p>
    </>
  );
}
