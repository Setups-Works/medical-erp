"use client";

import { DOC_VECTOR, PURCHASE_BILL, RETAIL_BILL, SCHEME_FREE_BILL, SCHEME_HALF_BILL, SCHEME_PCT_BILL, WHOLESALE_BILL } from "@/lib/learn/examples";
import { type InvoiceOut, landedCost } from "@/lib/learn/invoice";
import { div, fmt, m } from "@/lib/learn/money";
import { B, C, Callout, InvoiceView, LineSteps, Quiz, Section, Sub, Table } from "../kit";
import { GstPlayground } from "../playground";

export function GstCalculations() {
  const v = DOC_VECTOR;
  const amoxa = PURCHASE_BILL.lines[1];
  return (
    <>
      <Section title="GST in two minutes">
        <List3 />
        <Callout tone="verify">
          Rates in these lessons (5%, 12%, 18%) are <B>illustrative</B>. MENO never hard-codes a rate: it reads <C>hsn_tax</C> valid on the document date. Items marked ⚠ VERIFY in CALCULATIONS.md must be confirmed by a
          pharmacist / CA before they are built.
        </Callout>
      </Section>

      <Section title="The line calculation order">
        <pre className="avoid-break overflow-x-auto rounded-tile bg-sunken p-4 font-mono text-[12.5px] leading-relaxed text-ink">{`gross       = rate × billed_qty
scheme      = free qty (value 0)  or scheme discount %
trade_disc  = gross × td%
taxable     = gross − trade_disc − scheme_disc
cash_disc   = taxable × cd%            ⚠ before/after tax = tenant setting
gst         = taxable × gst_rate       → CGST+SGST (same state) or IGST
line_total  = taxable + gst`}</pre>
      </Section>

      <Section title="Example 1: GST-exclusive line (wholesale / purchase)">
        <p>
          Amoxa 500, 10 strips at ₹84.30, GST 5%, same state. Watch the <B>odd paisa</B>: GST is ₹{fmt(amoxa.gst)}, half is ₹21.075, so CGST gets ₹{fmt(amoxa.cgst)} and SGST ₹{fmt(amoxa.sgst)}.
        </p>
        <LineSteps line={amoxa} mode="EXCLUSIVE" intraState />
      </Section>

      <Section title="Example 2: MRP-inclusive line (retail)">
        <p>
          At the counter the price is the MRP, which already contains GST. We <B>back-calculate</B> the tax: taxable = amount ÷ (1 + rate). This is the test vector in CALCULATIONS.md: MRP ₹112, qty 2, 10% discount, 12% GST.
        </p>
        <LineSteps line={v.lines[0]} mode="MRP_INCLUSIVE" intraState />
        <Table
          head={["Expected (CALCULATIONS.md)", "Our result"]}
          mono={[0, 1]}
          rows={[
            ["taxable 180.0000", `taxable ${fmt(v.taxable, 4)}`],
            ["cgst 10.80 · sgst 10.80", `cgst ${fmt(v.cgst)} · sgst ${fmt(v.sgst)}`],
            ["total 201.60 · roundOff 0.40 · grandTotal 202.00", `total ${fmt(v.total)} · roundOff ${fmt(v.roundOff)} · grandTotal ${fmt(v.grandTotal)}`],
          ]}
        />
        <Callout tone="ok">Matches the vector exactly. That is the whole point of test vectors: Java, TypeScript and this lesson all give ₹202.00.</Callout>
      </Section>

      <Section title="Same state or not? (place of supply)">
        <Table
          head={["Seller", "Buyer / place of supply", "Tax"]}
          rows={[
            ["Tamil Nadu (33)", "Walk-in customer at the Chennai shop → branch state 33", "CGST + SGST"],
            ["Tamil Nadu (33)", "Retailer in Tamil Nadu (33)", "CGST + SGST"],
            ["Tamil Nadu (33)", "Retailer in Karnataka (29)", "IGST"],
          ]}
        />
      </Section>

      <Section title="Rounding rules">
        <Table
          head={["Rule", "Why"]}
          rows={[
            ["Keep every intermediate value at 4 decimals, HALF_UP", "No drift across many lines"],
            ["Round GST per line to 2 decimals", "That is what prints on the line"],
            ["CGST = half of the line GST rounded; odd paisa to CGST ⚠", "CGST + SGST must equal GST exactly"],
            ["Grand total rounded to the nearest rupee; difference is the round-off line (±0.50)", "Customers pay whole rupees (tenant setting)"],
            ["Never add up rounded display values; sum the stored values, then round once", "Otherwise totals don't match"],
          ]}
        />
        <Sub>Round-off in our example bills</Sub>
        <Table
          head={["Bill", "Total", "Round off", "Grand total"]}
          mono={[1, 2, 3]}
          rows={[RETAIL_BILL, WHOLESALE_BILL, PURCHASE_BILL].map((b) => [`${b.kind} ${b.number}`, fmt(b.total, 4), fmt(b.roundOff), fmt(b.grandTotal)])}
        />
      </Section>

      <Section title="Schemes: three types, three invoices">
        <Table
          head={["Type", "Example", "Effect"]}
          rows={[
            ["Free quantity", "10 + 1", "billed 10, free 1; stock +11; cost per unit = value ÷ 11"],
            ["Scheme discount %", "5% on 50+", "a % off the line when it reaches the slab, applied before trade discount ⚠"],
            ["Half scheme", "10 + ½ (pack-based)", "free goods in loose units (half a strip), needs unit conversion"],
          ]}
        />
        <p>
          All three bills below go from {SCHEME_FREE_BILL.seller.name} to {SCHEME_FREE_BILL.buyer.name}, both in Tamil Nadu, so GST is split into CGST + SGST. Compare them with the inter-state (IGST) bill on Day 11.
        </p>
        <Callout tone="verify">Scheme-before-trade-discount order and half-scheme handling are marked ⚠ VERIFY in CALCULATIONS.md. These examples follow the documented draft rule.</Callout>
      </Section>

      <SchemeExample
        title="Scheme 1: Free quantity (10 + 1)"
        inv={SCHEME_FREE_BILL}
        focus={0}
        intro={
          <>
            Buy 10 strips, get 1 free. The retailer orders 30 strips of Paracip and 20 bottles of Coughsoft, so they get <B>3 strips</B> and <B>2 bottles</B> free. The free goods are printed in the Free column but are{" "}
            <B>not charged</B>: taxable value and GST are on the billed quantity only.
          </>
        }
        stock="Stock leaves the wholesaler: Paracip −33 strips (30 + 3), Coughsoft −22 bottles (20 + 2). The retailer's purchase entry adds the same."
      />

      <SchemeExample
        title="Scheme 2: Scheme discount % (5% on 50+)"
        inv={SCHEME_PCT_BILL}
        focus={0}
        intro={
          <>
            Instead of free goods, the line gets a <B>% off when it reaches a slab</B>: 5% if the retailer buys 50 strips or more. Cetriz (60 strips) qualifies; Amoxa (20 strips) doesn&apos;t, so its Sch% is 0. Both lines also get
            the 2% trade discount, which is taken <B>after</B> the scheme discount.
          </>
        }
        stock="Stock leaves at billed quantity only (no free goods): Cetriz −60, Amoxa −20. The scheme lowers the value, not the quantity."
        extra={
          <Callout tone="note" title="Order matters">
            Scheme first, then TD: 1,110.00 − 55.50 = 1,054.50, then 2% TD = 21.09 → taxable 1,033.41. If TD were taken on the full gross (22.20) the taxable would be 1,032.30. That ₹1.11 difference is why the order is a
            tenant/supplier rule to confirm, never a guess.
          </Callout>
        }
      />

      <SchemeExample
        title="Scheme 3: Half scheme (10 + ½, pack-based)"
        inv={SCHEME_HALF_BILL}
        focus={0}
        intro={
          <>
            The free goods are <B>half a pack per 10 packs</B>. For Amoxa (strip of 10 capsules), 10 strips → ½ strip = <B>5 loose capsules</B> free. For Paracip, 20 strips → 2 halves = <B>1 whole strip</B> free. MENO
            stores loose free goods in the item&apos;s base unit using the unit conversion (strip → capsule) from the medicine master.
          </>
        }
        stock="Stock leaves the wholesaler: Amoxa −10 strips and −5 loose capsules (105 capsules), Paracip −21 strips. A half scheme only works for divisible packs: you can't give half a syrup bottle."
      />

      <Section title="Try it live">
        <p>Change the numbers and watch each step. Use it in class: give students a bill and let them check their hand calculation here.</p>
        <GstPlayground />
      </Section>

      <Section title="Where this maths lives in MENO">
        <Table
          head={["Where", "Implementation"]}
          mono={[1]}
          rows={[
            ["Server (the truth)", "modules/taxation GstCalculator, modules/pricing PricingEngine (Java, BigDecimal)"],
            ["Offline desktop + live preview", "packages/billing-engine (TypeScript, decimal.js)"],
            ["Contract both must pass", "contracts/test-vectors/{gst,pricing,schemes}/*.json"],
          ]}
        />
        <Callout tone="rule">Changing a tax or scheme rule = change the test vectors first, then both implementations. CI fails if Java and TypeScript disagree.</Callout>
      </Section>

      <Section title="Practice">
        <Quiz
          items={[
            { q: "Rate ₹150, qty 12, TD 5%, GST 18%, inter-state. Taxable and IGST?", a: "Gross 1,800.00 − TD 90.00 = taxable 1,710.00; IGST 18% = 307.80; line total 2,017.80." },
            { q: "MRP ₹249, qty 1, no discount, GST 18%, same state. Taxable and GST?", a: "Taxable 249 ÷ 1.18 = 211.0169 → GST = 249 − 211.0169 = 37.98 (rounded), taxable shown 211.02; CGST 18.99, SGST 18.99." },
            { q: "Line GST is ₹11.87. Split it.", a: "Half = 5.935 → CGST 5.94 (odd paisa), SGST 5.93." },
            { q: "Bill total ₹5,022.90. Grand total and round-off?", a: "₹5,023.00, round-off +0.10." },
          ]}
        />
      </Section>
    </>
  );
}

function List3() {
  return (
    <Table
      head={["Term", "Meaning"]}
      rows={[
        ["GST", "Tax on supply of goods, charged by the seller, paid to the government."],
        ["CGST + SGST", "Sale inside one state: half to the Centre, half to the State."],
        ["IGST", "Sale from one state to another: one tax to the Centre."],
        ["Taxable value", "The price after discounts, before GST."],
        ["Input tax credit (ITC)", "GST we paid on purchases, which we set off against GST we collect on sales."],
        ["HSN", "Product code that decides the GST rate (e.g. 3004 medicaments)."],
      ]}
    />
  );
}

/** One scheme type: the invoice, the maths of its key line, landed cost for every line, and the stock effect. */
function SchemeExample({ title, inv, focus, intro, stock, extra }: { title: string; inv: InvoiceOut; focus: number; intro: React.ReactNode; stock: string; extra?: React.ReactNode }) {
  const line = inv.lines[focus];
  return (
    <Section title={title}>
      <p>{intro}</p>
      <InvoiceView inv={inv} />
      <Sub>Line {focus + 1} step by step: {line.item}</Sub>
      <LineSteps line={line} mode={inv.mode} intraState={inv.intraState} />
      {extra}
      <Sub>Landed cost (what each unit really cost the retailer)</Sub>
      <Table
        compact
        head={["Item", "Taxable (₹)", "Units received", "Landed cost (₹)", "vs rate on bill"]}
        mono={[1, 2, 3, 4]}
        rows={inv.lines.map((l) => {
          const c = landedCost(l);
          const perRate = c.unit === "loose" ? `${l.rate} ÷ ${l.unitsPerPack} = ${fmt(div(m(l.rate), m(l.unitsPerPack ?? "1")), 4)} per loose unit` : `${l.rate} per pack`;
          return [l.item, fmt(l.taxable, 4), `${fmt(c.units, 0)} ${c.unit === "loose" ? "loose units" : "packs"}`, `${fmt(c.per, 4)} per ${c.unit === "loose" ? "loose unit" : "pack"}`, perRate];
        })}
      />
      <Callout tone="note" title="Stock effect">
        {stock}
      </Callout>
    </Section>
  );
}
