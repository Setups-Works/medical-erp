"use client";

import { MOVEMENTS, PURCHASE_BILL, RETAIL_BILL, RETAIL_RETURN, WHOLESALE_BILL, WHOLESALE_RETURN } from "@/lib/learn/examples";
import { purchaseVoucher, salesVoucher } from "@/lib/learn/invoice";
import { add, div, fmt, m } from "@/lib/learn/money";
import { B, C, Callout, Flow, InvoiceView, LineSteps, List, Quiz, Section, Sub, Table, VoucherView } from "../kit";

export function Purchase() {
  const para = PURCHASE_BILL.lines[0];
  const units = add(m(para.qty), m(para.free ?? "0"));
  const landed = div(para.taxable, units);
  return (
    <>
      <Section title="The purchase flow">
        <Flow
          steps={[
            { title: "Reorder suggestion", sub: "min/max, sales speed", tone: "slate" },
            { title: "Purchase order", sub: "email / WhatsApp PO", tone: "slate" },
            { title: "Supplier invoice arrives", sub: "with the goods", tone: "blue" },
            { title: "Enter or import", sub: "keyboard grid or distributor CSV", tone: "blue" },
            { title: "GRN check", sub: "short / excess / damaged", tone: "amber" },
            { title: "Post", sub: "batches + stock + supplier ledger", tone: "green" },
          ]}
        />
      </Section>

      <Section title="The supplier's bill we enter">
        <InvoiceView inv={PURCHASE_BILL} />
        <p>
          Note line 1: <B>30 billed + 3 free</B> (scheme 10+1) and a 5% trade discount. GST is charged only on what we pay for. Line 2 shows the odd-paisa split (CGST {fmt(PURCHASE_BILL.lines[1].cgst)}, SGST{" "}
          {fmt(PURCHASE_BILL.lines[1].sgst)}).
        </p>
      </Section>

      <Section title="Line 1 step by step">
        <LineSteps line={para} mode="EXCLUSIVE" intraState />
        <Sub>Landed cost per strip</Sub>
        <p>
          Free strips make every strip cheaper. Taxable value {fmt(para.taxable)} ÷ ({para.qty} + {para.free}) strips = <B>₹{fmt(landed, 4)} per strip</B>, not the ₹{para.rate} on the bill. Stock valuation and profit reports use
          this landed cost. GST is left out because we claim it back as input tax credit.
        </p>
        <Callout tone="verify">Whether landed cost includes freight and other charges (PUR-06) and how free goods are valued follows CALCULATIONS.md §5 and the tenant&apos;s valuation setting.</Callout>
      </Section>

      <Section title="What posting the purchase does (one transaction)">
        <Table
          head={["Effect", "Detail"]}
          rows={[
            ["Batches", "Creates or finds batch PC24A7 (expiry 08/2027, MRP 33.60, cost) for this branch"],
            ["Stock", `inventory_movement +${units / 10000n} strips for PC24A7, +10 for AX1123, +6 for DL5520`],
            ["Accounts", "PurchasePosted event → voucher below (supplier ledger credited)"],
            ["Audit", "Who posted, when, the full document snapshot"],
          ]}
        />
        <VoucherView title="Purchase voucher (auto-posted)" lines={purchaseVoucher(PURCHASE_BILL, `${PURCHASE_BILL.seller.name} (supplier)`)} />
      </Section>

      <Section title="Checks during purchase entry">
        <List
          items={[
            "Duplicate supplier invoice number in the same financial year is blocked (PUR-05).",
            "Expiry must be after the manufacturing date; already-expired stock is blocked unless it's an expiry-return document; near-expiry warns.",
            "Purchase rate ≤ MRP.",
            "Rate jump vs last purchase raises an alert (PUR-09).",
            "Distributor CSV import remembers supplier item code → our item (PUR-04).",
            "After posting, no edits: cancel with a reversal (PUR-08).",
          ]}
        />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "Why is the landed cost lower than the bill rate?", a: "The 3 free strips and the trade discount are spread over all 33 strips." },
            { q: "The supplier's bill had a wrong batch number and it's posted. Fix?", a: "Reverse the purchase (or purchase return) and enter it again correctly." },
            { q: "Which ledger is credited when we post a purchase on credit?", a: "The supplier's ledger (under Sundry Creditors)." },
          ]}
        />
      </Section>
    </>
  );
}

export function Inventory() {
  let bal = 0;
  const rows = MOVEMENTS.map((mv) => {
    bal += mv.qty;
    return [mv.date, mv.type, mv.doc, mv.qty > 0 ? `+${mv.qty}` : String(mv.qty), String(bal), mv.note];
  });
  return (
    <>
      <Section title="Stock = sum of movements">
        <p>
          Here is batch <C>PC24A7</C> of Paracip 650 at Aruna Medicals. Every change is a row. Nobody types the balance.
        </p>
        <Table head={["Date", "Type", "Document", "Qty", "Balance", "Note"]} mono={[1, 2, 3, 4]} rows={rows} />
        <p>
          <C>stock_balance</C> for this batch = <B>{bal} strips</B>. It is a cache for speed; a nightly job re-adds the movements and alerts if they differ (INV-12).
        </p>
      </Section>

      <Section title="FEFO at the counter">
        <Table
          head={["Batch", "Expiry", "In stock", "FEFO pick"]}
          mono={[0, 1, 2]}
          rows={[
            ["PC24A7", "08/2027", String(bal), "✓ suggested first"],
            ["PC25B2", "01/2028", "40", ""],
          ]}
        />
        <p>Overriding FEFO needs a permission and a reason, and it is recorded.</p>
      </Section>

      <Section title="Expiry control">
        <List
          items={[
            "Expired batch: cannot be sold (INV-04).",
            "Near expiry (30/60/90 days): dashboard with actions: return to supplier, discount, transfer (INV-05).",
            "Expired stock leaves through an expiry return to the supplier or a write-off adjustment, never by editing quantity.",
          ]}
        />
      </Section>

      <Section title="Other stock documents">
        <Table
          head={["Document", "Movement", "Example"]}
          rows={[
            ["Stock adjustment", "− or + with a reason code and approval", "1 strip damaged → −1, reason DAMAGE"],
            ["Stock transfer", "− at sender, in transit, + at receiver", "20 strips Chennai → Madurai branch"],
            ["Stock count", "Variance posted as movement", "System 31, counted 30 → −1"],
            ["Opening stock import", "+ per batch at go-live", "From the old software"],
          ]}
        />
        <Callout tone="rule">Concurrent sales can&apos;t oversell: the batch row is locked while it is consumed, and the database has <C>CHECK (qty &gt;= 0)</C> unless the tenant allows negative stock.</Callout>
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "A manager wants to 'fix' the stock of a batch from 31 to 30. How?", a: "Post a stock adjustment (−1 with a reason), which inserts a movement." },
            { q: "Where does the balance come from if the cache is wrong?", a: "The sum of inventory_movement rows; the nightly reconciliation flags the drift." },
          ]}
        />
      </Section>
    </>
  );
}

export function RetailBilling() {
  const inv = RETAIL_BILL;
  return (
    <>
      <Section title="The counter flow (keyboard only)">
        <Flow
          steps={[
            { title: "Scan / search", sub: "barcode, name, salt", tone: "slate" },
            { title: "Pick batch", sub: "FEFO default, expiry shown", tone: "blue" },
            { title: "Qty & discount", sub: "strip or loose tablets", tone: "blue" },
            { title: "Customer & doctor", sub: "Rx for Schedule H/H1/X", tone: "amber" },
            { title: "Payment", sub: "cash, UPI, card, credit, split", tone: "violet" },
            { title: "Post & print", sub: "thermal / A5, WhatsApp", tone: "green" },
          ]}
        />
        <p>
          Target: a 5-line prescription in under 20 seconds. F-keys for every action, no mouse needed, held bills for the next customer in the queue.
        </p>
      </Section>

      <Section title="A complete retail bill">
        <InvoiceView inv={inv} />
        <Callout tone="note">
          Prices are MRP (GST included), so the customer pays the MRP minus the discount; GST is worked out <B>inside</B> that amount. Two GST slabs appear in the tax summary.
        </Callout>
      </Section>

      <Section title="Every line, step by step">
        {inv.lines.map((l, i) => (
          <div key={i} className="space-y-1.5">
            <Sub>
              {i + 1}. {l.item}
            </Sub>
            <LineSteps line={l} mode={inv.mode} intraState={inv.intraState} />
          </div>
        ))}
        <p>
          Sum of line totals ₹{fmt(inv.total, 4)} → round to the rupee → <B>₹{fmt(inv.grandTotal)}</B> (round-off +{fmt(inv.roundOff)}).
        </p>
      </Section>

      <Section title="Checked before the bill can post">
        <Table
          head={["Check", "On this bill"]}
          rows={[
            ["Batch not expired, stock available", "All four batches valid"],
            ["Rate ≤ MRP", "MRP used"],
            ["Discount ≤ the user's limit", "10% (limit 10%) ✓, else manager approval"],
            ["Schedule H item needs prescription data", "Amoxa 500: doctor and Rx captured"],
            ["Banned / recalled item", "None"],
            ["Day not closed, period not locked", "Open"],
          ]}
        />
      </Section>

      <Section title="What posting the bill does">
        <Table
          head={["Effect", "Detail"]}
          rows={[
            ["Number", `${inv.number} from the branch's series for FY 26-27`],
            ["Stock", "Movement −2 PC24A7, −1 AX1123, −1 CS0981, −1 DL5520"],
            ["Payment", `UPI ₹${fmt(inv.grandTotal)}`],
            ["Compliance", "Prescription linked to the bill; H1 register entry if an H1 drug"],
            ["Accounts", "InvoicePosted event → voucher below"],
          ]}
        />
        <VoucherView title="Sales voucher (auto-posted)" lines={salesVoucher(inv, "Card / UPI Clearing")} />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "Why is the Dermacalm taxable value ₹211.02 and not ₹249?", a: "₹249 is MRP including 18% GST; 249 ÷ 1.18 = 211.0169, GST 37.98, taxable shown 211.02." },
            { q: "The customer pays ₹500 cash for this bill. Change?", a: `₹${fmt(m("500"))} is less than ₹${fmt(inv.grandTotal)}; the customer must pay ₹${fmt(inv.grandTotal)}. With ₹600 the change is ₹${fmt(m("600") - inv.grandTotal)}.` },
            { q: "Which ledger is debited for a UPI sale?", a: "Card / UPI Clearing, until the money reaches the bank." },
          ]}
        />
      </Section>
    </>
  );
}

export function WholesaleBilling() {
  const inv = WHOLESALE_BILL;
  return (
    <>
      <Section title="How wholesale differs from retail">
        <Table
          head={["", "Retail", "Wholesale"]}
          rows={[
            ["Rate", "MRP, GST inside", "PTR, GST added on top"],
            ["Customer", "Walk-in or patient", "Registered retailer with GSTIN and drug licence"],
            ["Payment", "Paid now", "Credit: limit + due days"],
            ["Extras", "Prescription, H1 register", "Schemes, price lists, e-invoice, e-way bill, dispatch"],
          ]}
        />
      </Section>

      <Section title="Order to cash">
        <Flow
          steps={[
            { title: "Sales order", sub: "phone / WhatsApp / salesman", tone: "slate" },
            { title: "Credit check", sub: "limit and overdue", tone: "amber" },
            { title: "Pick list", sub: "batches by FEFO", tone: "blue" },
            { title: "Tax invoice", sub: "A4, DL nos. of both parties", tone: "green" },
            { title: "e-invoice / e-way bill", sub: "if thresholds apply ⚠", tone: "violet" },
            { title: "Dispatch → receipt", sub: "collect on due date", tone: "slate" },
          ]}
        />
      </Section>

      <Section title="A wholesale invoice across states">
        <InvoiceView inv={inv} />
        <p>
          Seller in Tamil Nadu (33), buyer in Karnataka (29): the place of supply is another state, so the whole GST is <B>IGST</B>. Paracip has a 10+1 scheme (5 free on 50) and 2% trade discount.
        </p>
        <Table
          head={["What to look for", "Why"]}
          rows={[
            ["Drug licence numbers of both parties", "The wholesaler (Form 20B/21B) may sell only to a licensed retailer (Form 20/21); both numbers print on the bill (WHS-03, CMP-05). MENO blocks a B2B pharma bill if the buyer's licence is missing or expired ⚠"],
            ["Free column", "Free strips leave stock and are shown on the bill, but carry no value: taxable value and GST are on billed qty only"],
            ["MRP and PTR side by side", "The retailer sees its margin (MRP vs PTR) and checks the MRP printed on the strip"],
            ["TD%", "Trade discount, applied before GST"],
          ]}
        />
        <Callout tone="verify">Exactly which licence details must print, and blocking on expired licences, are on the COMPLIANCE.md checklist (Drugs and Cosmetics Rules).</Callout>
      </Section>

      <Section title="Lines step by step">
        {inv.lines.map((l, i) => (
          <div key={i} className="space-y-1.5">
            <Sub>
              {i + 1}. {l.item}
            </Sub>
            <LineSteps line={l} mode={inv.mode} intraState={inv.intraState} />
          </div>
        ))}
      </Section>

      <Section title="Credit control">
        <Table
          head={["Rule", "Example"]}
          rows={[
            ["Credit limit", "Limit ₹50,000; outstanding ₹12,500 + this bill ₹5,023 = ₹17,523 ✓"],
            ["Credit days", "Due 21-12-2026 (30 days)"],
            ["Over limit or overdue", "Blocked unless someone with parties.credit.approve approves (within their limit)"],
          ]}
        />
        <VoucherView title="Sales voucher (credit sale)" lines={salesVoucher(inv, `${inv.buyer.name} (customer)`)} />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "Same bill to a retailer in Madurai (Tamil Nadu). What changes?", a: "Place of supply is Tamil Nadu: CGST + SGST instead of IGST. Amounts stay the same." },
            { q: "How many Paracip strips leave stock?", a: "55 (50 billed + 5 free)." },
            { q: "Can MENO file the e-invoice for the user?", a: "MENO generates it through the GSP integration when configured; for returns it prepares and exports, never claims to file." },
          ]}
        />
      </Section>
    </>
  );
}

export function Returns() {
  return (
    <>
      <Section title="Never edit, always correct">
        <p>
          A posted bill is a legal record. When goods come back or a price was wrong, MENO creates a <B>new document</B> that points to the original. Stock and accounts are corrected by that document.
        </p>
        <Table
          head={["Situation", "Document", "Stock", "Accounts"]}
          rows={[
            ["Customer returns goods", "Sales return + credit note", "+ only if saleable", "Dr Sales Return, Output GST · Cr Customer / Cash"],
            ["We return goods to supplier", "Purchase return + debit note", "−", "Dr Supplier · Cr Purchase Return, Input GST"],
            ["Expired / broken stock to supplier", "Expiry / breakage claim", "−", "Claim tracked until the supplier's credit note arrives"],
            ["Retailer returns expired stock (wholesale)", "Sales return per policy", "+ to an expiry location", "Credit note to the retailer"],
          ]}
        />
      </Section>

      <Section title="Example: retail credit note">
        <p>The customer brings back 1 strip of Paracip from bill {RETAIL_BILL.number}. Same price terms as the original line (MRP, 10% discount).</p>
        <InvoiceView inv={RETAIL_RETURN} />
        <LineSteps line={RETAIL_RETURN.lines[0]} mode={RETAIL_RETURN.mode} intraState />
        <VoucherView
          title="Credit note voucher"
          lines={[
            { ledger: "Sales Return", dr: RETAIL_RETURN.taxable },
            { ledger: "Output CGST", dr: RETAIL_RETURN.cgst },
            { ledger: "Output SGST", dr: RETAIL_RETURN.sgst },
            { ledger: "Round Off", cr: -RETAIL_RETURN.roundOff, note: "Refund rounded down" },
            { ledger: "Cash", cr: RETAIL_RETURN.grandTotal, note: "Refund paid" },
          ]}
        />
      </Section>

      <Section title="Example: wholesale breakage credit note">
        <InvoiceView inv={WHOLESALE_RETURN} />
        <p>This credit reduces what Sri Balaji Medicals owes; you&apos;ll see it in their ledger on Day 13.</p>
      </Section>

      <Section title="Rules">
        <List
          items={[
            "Return against an invoice, batch-aware: you can only return what was sold, from that batch.",
            "Quantities are always positive; the document type decides the direction.",
            "Return reasons and approval limits per role (RET-06).",
            <>Stock comes back only if saleable; damaged goods go to a non-saleable location or adjustment.</>,
          ]}
        />
        <Callout tone="note">Posted bill + credit note = the true picture. Auditors can see both, which is exactly what they want.</Callout>
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "A customer was overcharged ₹10 on a posted bill. Edit the bill?", a: "No. Issue a credit note for ₹10 against it." },
            { q: "Which document do we send the supplier when we return goods?", a: "A debit note (with the purchase return)." },
            { q: `Why is the refund ₹${fmt(RETAIL_RETURN.grandTotal)} and not ₹30.24?`, a: "Round-off to the nearest rupee: 30.24 → 30.00 (−0.24)." },
          ]}
        />
      </Section>
    </>
  );
}

