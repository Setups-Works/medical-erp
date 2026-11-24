"use client";

import { ErpWalkthrough as Demo } from "../erp-demo";
import { B, Callout, Flow, List, Quiz, Section, Table } from "../kit";

export function ErpWalkthrough() {
  return (
    <>
      <Section title="The story of one day in MENO">
        <p>
          This lesson is a <B>live demo you click through in class</B>. It follows the order a new shop really works in: masters first (who we buy from, who we sell to, where money goes), then stock comes in, then the counter sells it, then we look at what MENO recorded.
        </p>
        <Flow
          steps={[
            { title: "Vendor", sub: "supplier + its ledger", tone: "green" },
            { title: "Customer", sub: "person or retailer", tone: "green" },
            { title: "Ledger", sub: "chart of accounts", tone: "violet" },
            { title: "Product", sub: "medicine master", tone: "violet" },
            { title: "Purchase", sub: "batches + stock in", tone: "blue" },
            { title: "POS bill", sub: "stock out + GST", tone: "amber" },
            { title: "Wholesale invoice", sub: "credit, returns, charges", tone: "amber" },
            { title: "Results", sub: "vouchers, ledgers, stock", tone: "slate" },
          ]}
        />
        <Callout tone="teach">
          Each master is a <B>tabbed form</B> (supplier and customer: Books · Licences · Bank · Income tax · GST · Others, plus Patient for a person; product: Details · Pharmacy · Pricing &amp; tax · Stock &amp; warehouse), following <B>docs/product/MASTER_FIELDS.md</B>. Click into a field and the <B>field guide</B> on the right explains what it is, the rule MENO checks, and why it matters. Each step ends with a <B>Next step</B> bar that says what comes next and why. Try the mistakes suggested on each screen: the errors are the best part of the demo.
        </Callout>
      </Section>

      <Section title="Live demo">
        <Demo />
        <p className="hidden print:block">The live demo runs in the Hub. Open this lesson on screen to click through it.</p>
      </Section>

      <Section title="Presenter script">
        <Table
          head={["Step", "Say", "Show (try this)"]}
          rows={[
            ["Start", "The company, branch, financial year, number series and default ledgers are set up once, before day one.", "Point at the auto-created ledgers: nobody types Sales or Output CGST."],
            ["Vendor", "Masters first: we can't buy from someone who isn't in the system. Walk all six tabs: identity, contacts and addresses, licences, bank, income tax (PAN, MSME, TDS), GST and terms.", "Fetch 33DDDDD3333D1Z1 (cancelled GSTIN). Change a PIN to 560001: the GSTIN state no longer matches. Mismatch the account numbers. Set credit days to 60 for an MSME supplier."],
            ["Customer", "A person needs a phone and gets a Patient tab; a retailer needs GSTIN, drug licence and credit terms.", "Switch to Retailer (pharmacy): the Licences tab appears, Patient disappears. Note the IGST message for Karnataka."],
            ["Ledger", "Every rupee is recorded in a ledger; the group decides if it hits P&L or the balance sheet.", "Add Shop Rent under Indirect Expenses. Show the opening balance check (Dr must equal Cr)."],
            ["Product", "The medicine master holds what never changes per batch: salt, schedule, HSN, price defaults, discount caps, stock levels.", "Put the sales price above MRP; set max discount below allowed discount. Watch the purchase rate and mark-up compute themselves."],
            ["Purchase", "Stock comes in by batch: batch no., expiry, PTR, MRP. One transaction does stock + accounts + audit.", "Type an expired date, or a PTR above MRP. Then post and show the purchase invoice."],
            ["POS", "Keyboard first: F2 search, F3 customer, F4 doctor, F9 payment, F10 save. FEFO picks the batch.", "Add Amoxa (Sch. H) and press F10 without a doctor. Sell more than the stock. Give Cetirest 9% discount: its item cap (8%) beats the role cap (10%). Try Credit for a walk-in."],
            ["Wholesale invoice", "A distributor's bill to a retailer on credit: dispatch details, free goods, returns and replacement on one printed document, freight and insurance, due date. Returns are separate credit notes underneath.", "Read the printed invoice top to bottom: DL nos., order / L.R. / cases, the four sections, tax summary, amount in words, terms, signatory. Sell more than the stock, clear a return reason, or put a rate above MRP."],
            ["Results", "Nothing was typed twice. Stock is a ledger of movements; every bill made a balanced voucher.", "Show stock in/out, the purchase and sales vouchers, and the supplier ledger."],
          ]}
        />
      </Section>

      <Section title="What each step creates behind the screen">
        <Table
          head={["Action", "Rows written (same transaction)", "Module"]}
          rows={[
            ["Save vendor", "party + contacts + addresses + licences + bank accounts (encrypted) + party ledger (Sundry Creditors) + audit", "party → accounting"],
            ["Save customer", "party + contacts + addresses (+ patient profile) + party ledger (Sundry Debtors) + audit", "party → accounting"],
            ["Save product", "item + composition + barcode + branch settings (min/max/reorder, rack) + audit", "catalog"],
            ["Save ledger", "ledger (+ opening balance) + audit", "accounting"],
            ["Post purchase", "purchase doc + lines, batch rows, inventory_movement (in), voucher (Purchase, Input GST, supplier), audit", "purchase → inventory, accounting"],
            ["Save POS bill", "sales invoice + lines (snapshot of prices, taxes, party), inventory_movement (out), voucher (Cash/UPI/customer, Sales, Output GST, round-off), audit", "sales → inventory, taxation, accounting"],
          ]}
        />
        <Callout tone="rule">
          Posted bills are never edited or deleted. A wrong purchase is fixed with a purchase return / debit note; a wrong sale with a sales return / credit note. Stock is never changed with an UPDATE, only by inserting movements.
        </Callout>
        <Callout tone="verify">The demo uses illustrative GST rates, a 10% counter discount limit and made-up licence numbers. In MENO these come from configuration and the API, and licence formats vary by state.</Callout>
      </Section>

      <Section title="After this day">
        <List
          items={[
            "Receive money from a credit customer → receipt voucher; their ledger goes down.",
            "Pay the vendor before the credit days end → payment voucher.",
            "Customer returns a strip → sales return + credit note, stock back only if saleable.",
            "End of month → GSTR-1 from posted sales, input credit matched against GSTR-2B.",
          ]}
        />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "Why must the vendor exist before the purchase entry?", a: "The purchase snapshots the supplier and credits the supplier's ledger, which is created with the vendor." },
            { q: "Do we create a ledger for each new customer by hand?", a: "No. Saving a supplier or customer creates its ledger automatically (Sundry Creditors / Sundry Debtors)." },
            { q: "Where do batch number, expiry and MRP come from?", a: "The purchase entry. They belong to the batch, not to the medicine master." },
            { q: "The bill has a Schedule H item and no doctor. What happens on F10?", a: "MENO blocks the save and focuses the doctor / prescription field." },
            { q: "A UPI bill of ₹500: which ledger is debited?", a: "Card / UPI Clearing, until the settlement reaches the bank." },
          ]}
        />
      </Section>
    </>
  );
}
