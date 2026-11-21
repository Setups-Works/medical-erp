"use client";

import { RETAILER_KA, WHOLESALER } from "@/lib/learn/examples";
import { B, C, Callout, Flow, Quiz, Section, Sub, Table } from "../kit";

export function Masters() {
  return (
    <>
      <Section title="What a master is">
        <p>
          <B>Master data is the reference data every transaction reads.</B> A bill doesn&apos;t type the medicine name, GST rate or customer address. It picks them from masters and snapshots them. Bad masters = bad bills.
        </p>
        <Flow
          steps={[
            { title: "Medicine master", sub: "name, HSN, schedule, pack", tone: "blue" },
            { title: "Party master", sub: "supplier / customer", tone: "green" },
            { title: "Settings", sub: "tax rates, number series", tone: "slate" },
            { title: "→ Invoice", sub: "copies (snapshots) all of it", tone: "violet" },
          ]}
        />
      </Section>

      <Section title="The four master families">
        <Table
          head={["Family", "Masters", "Built by", "Phase"]}
          rows={[
            ["Inventory (product)", "Medicine, salt/generic, brand, manufacturer, category, schedule, unit & conversion, barcode, HSN → GST", "Kamesh (catalog) · Ashok (screens)", "P2"],
            ["Party", "Supplier, customer/retailer, customer group, doctor, salesman, supplier price list", "Kamesh (party) · Ashok", "P2–P6"],
            ["Accounts", "Ledger groups, ledgers (43 defaults), posting rules, TDS/TCS, fixed assets, loans", "Nitheesh (accounting)", "P5–P6"],
            ["Configuration", "Company, branches, number series, tax rates, payment modes, approvals, price lists, users & roles, printers", "Nitheesh / Kamesh / Meyyarivu", "P1–P5"],
          ]}
        />
        <Callout tone="rule">Every master is tenant-owned and audited. Once used on a document it is <B>deactivated, never deleted</B>. Option lists (states, units, schedules) always come from the API.</Callout>
      </Section>

      <Section title="Example: a medicine record">
        <Table
          head={["Field", "Value", "Rule"]}
          mono={[1]}
          rows={[
            ["Name / brand", "Paracip 650 Tablet", "1–200 chars, duplicate check ignores case"],
            ["Composition", "Paracetamol 650 mg", "From the salt master (enables substitutes)"],
            ["Manufacturer", "Demo Pharma Ltd.", "From the manufacturer master"],
            ["Dosage form", "Tablet", "From a list via the API"],
            ["Pack / units", "Box 10 strips → strip 15 tablets", "Unit conversion allows loose sale"],
            ["HSN", "3004", "4/6/8 digits, must exist in hsn_tax"],
            ["GST rate", "from HSN, e.g. 5%", "Never typed on the item; effective-dated"],
            ["Schedule", "OTC / H / H1 / X", "Drives prescription checks at the counter"],
            ["Reorder level", "20 strips (branch setting)", "Low-stock alerts, reorder suggestions"],
            ["Barcode", "8900000000000 (demo)", "Barcode-first billing"],
            ["Rack location", "R3-S2", "Find it fast at the counter"],
          ]}
        />
        <Callout tone="note">Batch, expiry, MRP and cost are <B>not</B> on the medicine master. They belong to the <B>batch</B>, created by purchase entry (Day 8).</Callout>
      </Section>

      <Section title="Example: party records">
        <Sub>Supplier</Sub>
        <Table
          head={["Field", "Value"]}
          mono={[1]}
          rows={[
            ["Name", WHOLESALER.name],
            ["GSTIN", `${WHOLESALER.gstin} (state code ${WHOLESALER.stateCode} = ${WHOLESALER.state})`],
            ["Drug licence", WHOLESALER.dl ?? ""],
            ["Credit terms", "15 days"],
            ["Ledger", "Created automatically under Sundry Creditors"],
          ]}
        />
        <Sub>Customer (retailer)</Sub>
        <Table
          head={["Field", "Value"]}
          mono={[1]}
          rows={[
            ["Name", RETAILER_KA.name],
            ["GSTIN", `${RETAILER_KA.gstin} (state ${RETAILER_KA.stateCode} = ${RETAILER_KA.state} → IGST from Tamil Nadu)`],
            ["Credit limit / days", "₹50,000 · 30 days"],
            ["Ledger", "Created automatically under Sundry Debtors"],
          ]}
        />
        <Callout tone="note" title="GSTIN tells you the state">
          The first 2 digits of a GSTIN are the state code. MENO checks the pattern, the check digit, and that the code matches the party&apos;s state. Characters 3–12 are the PAN.
        </Callout>
      </Section>

      <Section title="Configuration masters that change behaviour">
        <Table
          head={["Setting", "Example", "Changes"]}
          rows={[
            ["Number series", "AM/26-27/000123 per branch + FY (+ device)", "Bill numbers, offline numbering"],
            ["Tax rates / HSN", "3004 → 5% (illustrative), valid-from date set", "GST on every line"],
            ["Near-expiry days", "90", "Dashboards, warnings"],
            ["Discount limit per role", "Billing operator 10%", "Approval needed above it"],
            ["Negative stock policy", "Block", "Whether a sale may exceed stock"],
            ["Rounding", "Nearest rupee", "Round-off line"],
          ]}
        />
      </Section>

      <Section title="Keyboard shortcuts in masters">
        <p>
          <C>G M</C> medicines, <C>G C</C> customers, <C>G V</C> vendors, <C>G D</C> doctors, <C>G A</C> accounts, <C>G L</C> ledgers. <C>N M</C>, <C>N C</C>, <C>N V</C>, <C>N L</C> create new.
        </p>
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "Where is the expiry date stored: medicine master or batch?", a: "Batch." },
            { q: "A supplier was used on 40 bills. Can we delete it?", a: "No. Deactivate it; posted documents keep their snapshot." },
            { q: "GSTIN starts with 29. Our shop is in Tamil Nadu (33). CGST+SGST or IGST?", a: "IGST, it's an inter-state supply." },
          ]}
        />
      </Section>
    </>
  );
}
