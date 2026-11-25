"use client";

import { GstFetchDemo } from "../gst-fetch-demo";
import { B, C, Callout, Flow, List, Quiz, Section, Sub, Table } from "../kit";

/** Day 22: GSTIN fetch on supplier and customer forms (PTY-15), with a live candidate provider (INT-17). Checked live 25-11-2026. */
export function GstFetch() {
  return (
    <>
      <Section title="Why this lesson">
        <p>
          Typing a supplier&apos;s legal name, address and state by hand is slow and error-prone, and a wrong state code puts the wrong tax (CGST + SGST vs IGST) on every bill. <B>One GSTIN can fill about ten fields</B> and tell us whether the registration is still active. That is feature <B>PTY-15</B>. This lesson shows the GSTIN&apos;s structure, a real verify API we are evaluating (<B>INT-17</B>), and a live demo on the full supplier and customer forms.
        </p>
      </Section>

      <Section title="Read a GSTIN">
        <Table
          head={["Characters", "Example (33AAJCN0778N1ZZ)", "Meaning"]}
          mono={[1]}
          rows={[
            ["1–2", "33", "State code: 33 = Tamil Nadu. Must match the billing address state"],
            ["3–12", "AAJCN0778N", "The PAN. Its 4th letter is the holder type: C company, P person, F firm…"],
            ["13", "1", "Entity number: the 1st registration of this PAN in this state"],
            ["14", "Z", "Always Z (reserved)"],
            ["15", "Z", "Check character, computed from the first 14"],
          ]}
        />
        <Sub>The check character, in one line</Sub>
        <p>
          Read the first 14 characters as base-36 digits (0–9 then A–Z). Multiply them by 1, 2, 1, 2…, add the two base-36 digits of every product, and the check character is whatever brings the sum to a multiple of 36. A typo in any single character almost always breaks it, so we catch it <B>in the browser, for free</B>, before spending an API call.
        </p>
      </Section>

      <Section title="The service we are trying: GST verify API">
        <List
          items={[
            <><C>GET https://api.gstverify.dubey.app/api/v1/gst/details?gstin=33AAJCN0778N1ZZ&amp;full=false</C></>,
            <><C>full=false</C>: basic details, no key needed (that&apos;s what the demo uses). <C>full=true</C> answers <B>403</B> &quot;API key or sign in required&quot;.</>,
            <>A wrong <em>or</em> unknown GSTIN answers <B>400</B> <C>Invalid GSTIN / UID</C>. Timeouts and 5xx mean &quot;service down&quot;: the user types the details by hand.</>,
            <>No CORS headers, so a browser page can&apos;t call it. The Hub calls it from its server (<C>/api/learn/gst</C>); MENO will call it only from meno-api.</>,
          ]}
        />
        <pre className="avoid-break overflow-x-auto rounded-tile bg-sunken p-3 font-mono text-[12px] leading-relaxed text-ink">{`{ "success": true, "credits_used": 0.0,
  "data": {
    "gstin": "33AAJCN0778N1ZZ",
    "lgnm": "NATURESJOY HERBAL COSMETICS PRIVATE LIMITED",   ← legal name
    "tradeNam": "NATURESJOY HERBAL COSMETICS PRIVATE LIMITED", ← trade name
    "sts": "Active",            "rgdt": "12/12/2023",
    "ctb": "Private Limited Company",  "dty": "Regular",
    "stj": "State - Tamil Nadu,Division - KANCHEEPURAM,…",  "ctj": "State - CBIC,Zone - CHENNAI,…",
    "cxdt": "",  "einvoiceStatus": "No",
    "nba": ["Supplier of Services", "Retail Business", "Wholesale Business", "Factory / Manufacturing"],
    "structured_address": { "address_line1": "NO. 5, AGS COLONY",
      "address_line2": "THILAGAR NAGAR, ALWATHIRU NAGAR, Chennai",
      "city": "Chennai", "state": "Tamil Nadu", "pincode": "600087" } } }`}</pre>
        <Sub>What fills what</Sub>
        <Table
          head={["Response field", "MENO field (supplier / customer form)", "Tab"]}
          mono={[0]}
          rows={[
            ["tradeNam (else lgnm)", "Name, print name (editable)", "Books"],
            ["lgnm", "Legal name (read-only; GSTR-1 and e-invoices use it)", "Books"],
            ["structured_address.*", "Billing address: line 1, line 2, PIN; state from the PIN master", "Books"],
            ["gstin[0..2]", "State code → place of supply (CGST + SGST or IGST)", "GST"],
            ["dty", "GST registration type (Regular / Composition / SEZ)", "GST"],
            ["sts, cxdt", "GST status (Active / Cancelled / Suspended) and cancellation date", "GST"],
            ["gstin[2..12]", "PAN", "Income tax"],
            ["rgdt, ctb, nba, einvoiceStatus, stj, ctj", "Kept as read-only portal facts with the fetch date", "GST"],
            ["—", "Contacts, drug licences, bank, MSME, credit terms: not on the portal, the user adds them", "all"],
          ]}
        />
      </Section>

      <Section title="Try it: the full supplier and customer forms">
        <p>
          These are the same forms as Day 21, but empty and with a <B>real</B> Fetch. Type a GSTIN: the four checks under it run as you type. Press Fetch and watch Books, the address, Income tax and GST fill in, each marked <B>From GST portal</B>. Then walk the other tabs and Save: the form still checks everything (licence, contacts, PIN, PAN = GSTIN 3–12…).
        </p>
        <GstFetchDemo />
        <Callout tone="verify" title="Learning demo, not a provider decision">
          This service is an unofficial third-party API. Its terms, rate limits and uptime are not confirmed, and R-31 prefers one contract with the e-invoice GSP. Jeeva compares providers and Nitheesh decides (P2) before INT-17 is built. GSTINs are public business data, but never send a customer&apos;s personal details to such a service.
        </Callout>
      </Section>

      <Section title="How MENO builds it for real (P3)">
        <Flow
          steps={[
            { title: "Party form (web)", sub: "4 free checks; Fetch calls meno-api only", tone: "green" },
            { title: "GET /api/v1/parties/gstin/{gstin}", sub: "party module: permission check, tenant from token", tone: "blue" },
            { title: "GstinVerifier port", sub: "integrations: provider adapter (INT-17), key in Key Vault, 8 s timeout", tone: "violet" },
            { title: "Cache + audit", sub: "result kept with source and fetch date", tone: "amber" },
            { title: "Form filled", sub: "every value editable except legal name and status", tone: "green" },
          ]}
        />
        <List
          items={[
            <>The browser and the desktop app never call the provider: one place for the key, the cache and the audit trail.</>,
            <>Provider down or slow → a friendly &quot;Couldn&apos;t verify, enter the details by hand&quot;. Saving never depends on the provider.</>,
            <>Cancelled or suspended GSTIN → warning at purchase and sale (PTY-15). A cancelled GSTIN can&apos;t be saved on an active party.</>,
            <>Option lists (registration types, states) come from the API and reference data, never hard-coded in the screen.</>,
            <>Spec, field map and error codes: <C>docs/product/GSTIN_FETCH.md</C>.</>,
          ]}
        />
        <Table
          head={["Who", "Task"]}
          rows={[
            ["Jeeva (P2)", "Compare GSTIN verification providers, including this API"],
            ["Nitheesh (P2)", "Decide the provider, update R-31, record an ADR"],
            ["Nitheesh (P3)", "INT-17 GSTIN verification adapter in integrations"],
            ["Kamesh + Ashok (P3)", "PTY-15 endpoint in party + Fetch on the supplier and customer forms"],
            ["Prakalya (P3)", "QA of PTY-15 (she wrote the party stories)"],
          ]}
        />
      </Section>

      <Quiz
        items={[
          { q: "A GSTIN starts with 29 but the billing PIN is in Chennai. What happens?", a: "Save is blocked: the GSTIN's state code (29, Karnataka) must match the billing address state (33, Tamil Nadu)." },
          { q: "Why check the 15th character in the browser?", a: "It catches nearly every single-character typo for free, so we never spend an API call (or fill the wrong party) on a mistyped GSTIN." },
          { q: "The provider is down. Can the user still add the supplier?", a: "Yes. Fetch shows a friendly message and the user types the details by hand; saving never depends on the provider." },
          { q: "Where does the API key live?", a: "Only in meno-api's secrets (Key Vault). The web and desktop apps call meno-api, never the provider." },
          { q: "Which fields can Fetch never fill?", a: "Contacts, drug licences, bank accounts, MSME, credit terms and party type: the GST portal doesn't have them." },
        ]}
      />
    </>
  );
}
