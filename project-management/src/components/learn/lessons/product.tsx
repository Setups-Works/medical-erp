"use client";

import { div, m, rupees, sub } from "@/lib/learn/money";
import { B, C, Callout, Flow, List, Quiz, Section, Sub, Table } from "../kit";

export function WhatIsMeno() {
  return (
    <>
      <Section title="MENO in one sentence">
        <p>
          <B>MENO is one software that runs a medical shop or a medicine distributor end to end</B>: buying medicines, keeping batch-wise stock, billing at the counter or on credit, GST, accounts and reports, for many
          businesses (tenants) at once, and it keeps billing even when the internet is down.
        </p>
        <Callout tone="teach">Start the class by asking: &quot;What happens in a medical shop between the supplier&apos;s van arriving and a customer walking out with a strip of tablets?&quot; Write their answers on the board. Every answer is a MENO module.</Callout>
      </Section>

      <Section title="The problem we solve">
        <List
          items={[
            "Most shops use old single-PC software: no real multi-branch, weak expiry control, manual registers, painful GST returns.",
            "Owners can't see today's sales, cash or stock from outside the shop.",
            "Cloud tools stop when the internet drops. A counter with a queue cannot wait.",
          ]}
        />
      </Section>

      <Section title="Two editions, one codebase">
        <Table
          head={["", "Retail", "Wholesale"]}
          rows={[
            ["Who", "Medical shop (sells to patients)", "Distributor (sells to medical shops)"],
            ["Price used", "MRP (GST included)", "PTR (GST extra)"],
            ["How they bill", "Fast counter POS, cash / UPI / card", "Orders, credit bills, schemes, e-invoice, e-way bill"],
            ["Shared", "Masters, purchase, inventory, returns, GST, accounting, reports, admin", ""],
          ]}
        />
        <p>
          The edition is set per <B>company</B>. One tenant can own a retail company and a wholesale company. Menus and APIs switch on with <C>EditionGuard</C>.
        </p>
      </Section>

      <Section title="Who uses MENO all day">
        <Table
          head={["Role", "Lands on", "Does all day"]}
          rows={[
            ["Business Owner", "/dashboard", "Watches sales, margin, cash, stock, approvals across branches"],
            ["Branch Manager", "/dashboard", "Runs one or more branches: stock, approvals, staff"],
            ["Pharmacist", "/sales/pos", "Bills prescriptions, captures Rx for Schedule H/H1/X"],
            ["Billing Operator", "/sales/pos", "Fast counter billing and returns"],
            ["Inventory Manager", "/dashboard/inventory", "Purchases, GRN, expiry, transfers, reorders"],
            ["Accountant", "/dashboard/finance", "Ledgers, receipts, payments, GST"],
            ["Wholesale Manager", "/dashboard/wholesale", "Orders, schemes, credit, dispatch"],
            ["Sales Representative", "salesman orders", "Visits retailers, takes orders, collects money"],
            ["Auditor", "/reports", "Read-only: audit logs and registers"],
          ]}
        />
        <Callout tone="rule">Roles are only bundles of permissions stored in the database. Code checks a permission like <C>sales.invoice.create</C>, never a role name.</Callout>
      </Section>

      <Section title="What MENO promises">
        <List
          ordered
          items={[
            <><B>Money and stock are always right.</B> Data integrity beats speed.</>,
            <><B>The counter never stops.</B> Offline desktop billing with safe sync.</>,
            <><B>One tenant never sees another&apos;s data.</B></>,
            <><B>Fast at the counter</B> (a 5-line prescription billed in under 20 seconds), calm in the back office.</>,
            <><B>Compliance helpers, honestly.</B> MENO prepares GST and registers; it never claims to file for you.</>,
          ]}
        />
      </Section>

      <Section title="The road to the pilot">
        <Flow
          steps={[
            { title: "P0 Foundation", sub: "Docs, design, repo", tone: "slate" },
            { title: "P1 Platform", sub: "Login, tenants, roles, CI", tone: "blue" },
            { title: "P2 Masters", sub: "Items, parties, branches", tone: "blue" },
            { title: "P3 Purchase & stock", sub: "Batches correct", tone: "violet" },
            { title: "P4 Retail POS", sub: "Retail MVP", tone: "green" },
            { title: "P5 Wholesale, finance, offline", sub: "Pilot-ready", tone: "green" },
            { title: "P6 Pilot", sub: "3 shops live, GSTR", tone: "amber" },
            { title: "P7 Growth", sub: "Mobile, field sales", tone: "slate" },
          ]}
        />
        <p>A phase ends when its exit criteria are met, not when the calendar says so. Scope is cut, never quality.</p>
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "A distributor sells to 200 medical shops on 30-day credit. Which edition?", a: "Wholesale." },
            { q: "Can a pharmacist see purchase margins?", a: "No. Sensitive numbers are permission-gated in the API response, and the Pharmacist role doesn't have that permission by default." },
            { q: "Why does MENO need to work offline?", a: "A counter with a queue can't stop when the internet drops; bills are made on the desktop and synced later." },
          ]}
        />
      </Section>
    </>
  );
}

export function PharmacyBasics() {
  const mrp = m("33.60");
  const ptr = m("24.00");
  const pts = m("21.50");
  const net = div(mrp, m("1.05"));
  return (
    <>
      <Section title="Read a medicine strip">
        <Table
          head={["On the strip", "Example", "MENO field"]}
          mono={[2]}
          rows={[
            ["Brand", "Paracip 650 (demo brand)", "brandName"],
            ["Generic / salt / composition", "Paracetamol 650 mg", "Composition"],
            ["Pack", "1×15 (strip of 15 tablets)", "packSize"],
            ["Batch no.", "PC24A7", "Batch.batchNo"],
            ["Mfg / Expiry", "09/2025 · 08/2027", "mfgDate · expiryDate"],
            ["MRP (incl. of all taxes)", "₹33.60 per strip", "mrp"],
            ["Manufacturer / marketer", "Demo Pharma Ltd.", "Manufacturer"],
            ["Schedule mark", "Rx / Schedule H (if any)", "Schedule"],
          ]}
        />
        <Callout tone="note" title="Batch is the unit of truth">
          Two strips of the same medicine can have different batch numbers, expiry dates and even MRPs. That is why MENO keeps stock <B>per batch per branch</B>, never just per item.
        </Callout>
      </Section>

      <Section title="Three prices: PTS → PTR → MRP">
        <Flow
          steps={[
            { title: "Manufacturer", sub: "sells at PTS", tone: "slate" },
            { title: "Wholesaler / stockist", sub: "buys at PTS, sells at PTR", tone: "blue" },
            { title: "Medical shop", sub: "buys at PTR, sells at ≤ MRP", tone: "green" },
            { title: "Patient", sub: "pays MRP or less", tone: "violet" },
          ]}
        />
        <Table
          head={["Price", "Meaning", "GST", "Example (per strip)"]}
          mono={[3]}
          rows={[
            ["PTS", "Price To Stockist", "Excluded", rupees(pts)],
            ["PTR", "Price To Retailer", "Excluded", rupees(ptr)],
            ["MRP", "Maximum Retail Price, printed", "Included", rupees(mrp)],
          ]}
        />
        <p>
          Shop margin on one strip sold at full MRP, with 5% GST (an illustrative rate): MRP {rupees(mrp)} already contains GST, so the shop&apos;s own sale value is {rupees(mrp)} ÷ 1.05 ={" "}
          <B>{rupees(net)}</B>. It bought the strip at PTR {rupees(ptr)} (its GST is claimed back as input credit). Margin = {rupees(net)} − {rupees(ptr)} = <B>{rupees(sub(net, ptr))}</B> per strip. Day 7 shows
          the exact rounding rules.
        </p>
        <Callout tone="rule">Never sell above MRP. Selling rate ≤ MRP and purchase rate ≤ MRP are hard rules.</Callout>
      </Section>

      <Section title="Expiry and FEFO">
        <List
          items={[
            <><B>Expired stock must never be sold.</B> MENO blocks it.</>,
            <><B>Near expiry</B> = expiring within N days (a tenant setting). Shown on dashboards so the shop can return it to the supplier, discount it or transfer it.</>,
            <><B>FEFO</B> = First Expiry, First Out. At the counter MENO suggests the batch that expires first.</>,
          ]}
        />
      </Section>

      <Section title="Schemes and discounts">
        <Table
          head={["Term", "Example", "Effect"]}
          rows={[
            ["Free quantity (scheme)", "10 + 1", "Pay for 10 strips, get 11. Stock +11. Cost per strip = value ÷ 11."],
            ["Trade discount (TD)", "5% on the line", "Reduces the taxable value before GST."],
            ["Cash discount (CD)", "2% for paying in 7 days", "Reward for prompt payment (⚠ before/after tax is a tenant setting)."],
          ]}
        />
      </Section>

      <Section title="Drug schedules (prescription rules)">
        <Table
          head={["Schedule", "What it means for billing"]}
          rows={[
            ["OTC", "No prescription needed."],
            ["H", "Prescription-only."],
            ["H1", "Stricter: the sale is recorded in the H1 register (patient, doctor, item, qty, date)."],
            ["X / NDPS", "Highly controlled: stricter records, prescription copy retained."],
          ]}
        />
        <Callout tone="verify">Exactly what each schedule requires lives in the <C>schedule_rule</C> table and needs pharmacist / legal confirmation (COMPLIANCE.md). Never hard-code it.</Callout>
      </Section>

      <Section title="The documents a shop lives on">
        <Flow
          steps={[
            { title: "Purchase order", sub: "we ask the supplier", tone: "slate" },
            { title: "Purchase invoice / GRN", sub: "goods arrive, stock +", tone: "blue" },
            { title: "Sales invoice", sub: "customer buys, stock −", tone: "green" },
            { title: "Returns", sub: "credit / debit notes", tone: "amber" },
            { title: "Receipts & payments", sub: "money in / out", tone: "violet" },
            { title: "Day close & GST", sub: "cash count, returns", tone: "slate" },
          ]}
        />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "A supplier gives '10+1' on 30 strips. How many strips enter stock?", a: "33 (30 billed + 3 free)." },
            { q: "Is PTR inclusive of GST?", a: "No. PTR and PTS exclude GST; MRP includes it." },
            { q: "Two batches: A expires 03/2027, B expires 08/2027. Which does FEFO pick?", a: "Batch A, it expires first." },
            { q: "Which schedule needs a register entry for every sale?", a: "Schedule H1 (and X/NDPS with stricter controls)." },
          ]}
        />
      </Section>
    </>
  );
}
