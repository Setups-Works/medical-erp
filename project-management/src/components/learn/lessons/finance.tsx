"use client";

import { CUSTOMER_LEDGER, PURCHASE_BILL, RETAIL_BILL, RETAILER_KA, SUPPLIER_LEDGER, WHOLESALE_BILL, WHOLESALER } from "@/lib/learn/examples";
import { purchaseVoucher, salesVoucher } from "@/lib/learn/invoice";
import { add, fmt, sub } from "@/lib/learn/money";
import { B, C, Callout, Flow, LedgerView, List, Quiz, Section, Sub, Table, VoucherView } from "../kit";

export function Accounting() {
  // Trial balance of the shop after the purchase and the retail bill, ignoring opening balances.
  const pv = purchaseVoucher(PURCHASE_BILL, "Kaveri Pharma (supplier)");
  const sv = salesVoucher(RETAIL_BILL, "Card / UPI Clearing");
  const pay = [
    { ledger: "Kaveri Pharma (supplier)", dr: SUPPLIER_LEDGER.entries[1].dr },
    { ledger: "Bank Account", cr: SUPPLIER_LEDGER.entries[1].dr },
  ];
  const tb = new Map<string, bigint>();
  for (const l of [...pv, ...sv, ...pay]) tb.set(l.ledger, add(tb.get(l.ledger) ?? 0n, l.dr ?? 0n, -(l.cr ?? 0n)));
  const tbRows = [...tb.entries()].filter(([, v]) => v !== 0n);
  const dr = add(...tbRows.map(([, v]) => (v > 0n ? v : 0n)));
  const cr = add(...tbRows.map(([, v]) => (v < 0n ? -v : 0n)));
  return (
    <>
      <Section title="Double entry without jargon">
        <p>
          Every transaction touches <B>at least two accounts</B>, and the amounts on the left (<B>debit</B>) always equal the amounts on the right (<B>credit</B>). A sale of ₹100 cash: cash goes up (debit Cash 100) and sales go
          up (credit Sales 100).
        </p>
        <Table
          head={["Account nature", "Increases with", "Examples"]}
          rows={[
            ["Asset", "Debit", "Cash, bank, stock, customers (debtors), input GST"],
            ["Expense", "Debit", "Purchase, rent, salary, expiry loss"],
            ["Liability", "Credit", "Suppliers (creditors), output GST payable, loans"],
            ["Income", "Credit", "Sales, scheme income, discount received"],
            ["Equity", "Credit", "Owner's capital"],
          ]}
        />
        <Callout tone="teach">Memory trick: Debit what comes in or what you spend on; credit what goes out or where it came from.</Callout>
      </Section>

      <Section title="MENO posts vouchers for you">
        <Flow
          steps={[
            { title: "Document posted", sub: "invoice, purchase, return, receipt", tone: "blue" },
            { title: "Event", sub: "InvoicePosted, PurchasePosted…", tone: "violet" },
            { title: "Posting rule", sub: "system codes → ledgers", tone: "amber" },
            { title: "Voucher", sub: "debit = credit, or nothing", tone: "green" },
            { title: "Ledgers & reports", sub: "day book, trial balance", tone: "slate" },
          ]}
        />
        <p>
          Posting finds ledgers by <B>system code</B> (<C>SALES</C>, <C>OUTPUT_CGST</C>, <C>ROUND_OFF</C>…), never by name, because names are editable. If a ledger is missing the posting fails with{" "}
          <C>ACCOUNTING_LEDGER_MISSING</C>; a voucher is never half-posted.
        </p>
      </Section>

      <Section title="The pharmacy chart of accounts (short version)">
        <Table
          head={["Group", "Nature", "Default ledgers"]}
          rows={[
            ["Cash-in-hand / Bank Accounts", "Asset", "Cash, Petty Cash, Bank Account, Card / UPI Clearing"],
            ["Sundry Debtors", "Asset", "One ledger per customer (automatic)"],
            ["Stock-in-hand", "Asset", "Closing Stock (value from the inventory ledger)"],
            ["Input Tax Credit", "Asset", "Input CGST / SGST / IGST / Cess"],
            ["Sundry Creditors", "Liability", "One ledger per supplier (automatic)"],
            ["Duties & Taxes", "Liability", "Output CGST / SGST / IGST / Cess, TDS/TCS payable"],
            ["Sales Accounts", "Income", "Sales, Sales Return"],
            ["Purchase Accounts", "Expense", "Purchase, Purchase Return"],
            ["Direct / Indirect", "Income / Expense", "Scheme income, discount, round off, expiry loss, rent, salary…"],
          ]}
        />
        <Callout tone="verify">The default chart (CHART_OF_ACCOUNTS.md) must be reviewed by a CA before P5.</Callout>
      </Section>

      <Section title="Vouchers for our example bills">
        <VoucherView title={`Retail sale ${RETAIL_BILL.number} (UPI)`} lines={sv} />
        <VoucherView title={`Purchase ${PURCHASE_BILL.number} (credit)`} lines={pv} />
        <VoucherView title="Payment to supplier (NEFT)" lines={pay} />
        <VoucherView title={`Wholesaler's books: credit sale ${WHOLESALE_BILL.number}`} lines={salesVoucher(WHOLESALE_BILL, RETAILER_KA.name)} />
      </Section>

      <Section title="Party ledgers">
        <Sub>Customer ledger in the wholesaler&apos;s books (Sundry Debtors)</Sub>
        <LedgerView title={`${RETAILER_KA.name}: what they owe ${WHOLESALER.name}`} opening={CUSTOMER_LEDGER.opening} entries={CUSTOMER_LEDGER.entries} />
        <p>
          Dr balance = the customer owes us. The receipt of ₹12,500 is allocated to the oldest bills first (FIFO) or manually (ACC-01); the outstanding and ageing report groups what is left by how overdue it is.
        </p>
        <Sub>Supplier ledger in the shop&apos;s books (Sundry Creditors)</Sub>
        <LedgerView title={`${WHOLESALER.name}: what Aruna Medicals owes`} opening={SUPPLIER_LEDGER.opening} entries={SUPPLIER_LEDGER.entries} />
        <p>
          Cr balance = we owe the supplier. After paying ₹{fmt(SUPPLIER_LEDGER.entries[1].dr ?? 0n)}, ₹{fmt(sub(PURCHASE_BILL.grandTotal, SUPPLIER_LEDGER.entries[1].dr ?? 0n))} is still payable.
        </p>
      </Section>

      <Section title="Trial balance from these vouchers">
        <Table
          head={["Ledger", "Debit (₹)", "Credit (₹)"]}
          mono={[1, 2]}
          rows={[...tbRows.map(([k, v]) => [k, v > 0n ? fmt(v) : "", v < 0n ? fmt(-v) : ""]), [<B key="t">Total</B>, fmt(dr), fmt(cr)]]}
        />
        <p>
          This covers only the purchase, the retail bill and the supplier payment, with no opening balances. That is why Bank Account shows a credit: in real books the opening bank balance would be a debit that covers it.
        </p>
        <Callout tone="ok">Total debit = total credit = ₹{fmt(dr)}. If a trial balance doesn&apos;t tally, a voucher is broken, which MENO prevents with a deferred database check on every voucher.</Callout>
      </Section>

      <Section title="From ledgers to the books">
        <Table
          head={["Report", "Answers", "Feature"]}
          rows={[
            ["Cash book / bank book / day book", "What moved today", "ACC-06"],
            ["Outstanding & ageing", "Who owes us, whom we owe, how late", "ACC-09"],
            ["Trial balance", "Do all ledgers balance?", "ACC-08"],
            ["Profit & loss", "Did we make money? (sales − cost of goods − expenses)", "ACC-08"],
            ["Balance sheet", "What we own and owe on a date", "ACC-08"],
            ["Tally export", "Hand the books to the CA", "ACC-10"],
          ]}
        />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "Credit sale of ₹5,023 to a retailer. Which ledger is debited?", a: "The retailer's own ledger (Sundry Debtors)." },
            { q: "Why is Input GST an asset?", a: "It is tax we paid that we can set off against GST we collect, so it's money due back to us." },
            { q: "Can a user rename the 'Sales' ledger?", a: "Yes, system ledgers can be renamed but not deleted or moved; posting uses the system code." },
          ]}
        />
      </Section>
    </>
  );
}

export function GstCompliance() {
  return (
    <>
      <Section title="Statutory honesty">
        <Callout tone="rule">
          MENO <B>prepares, validates and exports</B> GST data. It never claims to file returns directly. A compliance workflow ships only after its rule is confirmed in <C>docs/compliance/COMPLIANCE.md</C>.
        </Callout>
      </Section>

      <Section title="GST returns in plain words">
        <Table
          head={["Return", "What it is", "MENO feature"]}
          rows={[
            ["GSTR-1", "Our outward supplies: every sale, B2B by party, B2C summary, credit/debit notes, HSN summary", "GST-03 export (portal JSON/Excel)"],
            ["GSTR-3B", "Monthly summary: output tax − input tax credit = tax to pay", "GST-04 summary"],
            ["GSTR-2B", "Auto-drafted statement of our purchases as our suppliers reported them", "GST-05 reconcile with our purchases"],
            ["E-invoice (IRN + QR)", "B2B invoice registered with the government portal above a turnover threshold", "WHS-06 ⚠ threshold"],
            ["E-way bill", "Document for moving goods above a value threshold", "WHS-07 ⚠ threshold"],
          ]}
        />
        <p>
          Using our examples: the shop&apos;s output GST on the retail bill and its input GST on the purchase both land in the 3B summary; the purchase should also appear in the shop&apos;s 2B once the wholesaler files its GSTR-1.
        </p>
      </Section>

      <Section title="Pharmacy compliance">
        <Table
          head={["Area", "What MENO supports", "Status"]}
          rows={[
            ["Drug licence", "Retail (20/21) and wholesale (20B/21B) numbers on bills; expiry alerts", "⚠ VERIFY print rules"],
            ["Schedule H", "Prescription required before posting", "⚠ VERIFY"],
            ["Schedule H1 register", "Auto entry per sale: patient, doctor, drug, qty, date; printable/exportable", "⚠ VERIFY fields & retention"],
            ["Schedule X / NDPS", "Stricter register, Rx copy retention (likely blocked in MVP)", "⚠ VERIFY"],
            ["Pharmacist on duty", "Name / registration no. on the bill", "⚠ VERIFY"],
            ["Banned / recalled drugs", "Block sale", "⚠ source & update process"],
            ["Privacy (DPDP Act)", "Minimise patient data, consent, deletion requests", "⚠ VERIFY with lawyer"],
          ]}
        />
        <Callout tone="note">MENO helps a licensed pharmacy keep records. It does not replace the pharmacist&apos;s legal responsibility.</Callout>
      </Section>

      <Section title="What a GST invoice must show">
        <List
          items={[
            "Seller GSTIN, invoice number (unique per financial year) and date",
            "Buyer GSTIN for B2B; place of supply",
            "HSN, taxable value, rate and tax split (CGST/SGST or IGST) per line, tax summary",
            "Grand total and amount in words; drug licence numbers for pharmacy bills",
          ]}
        />
        <Callout tone="verify">The exact mandatory fields and series length are on the COMPLIANCE.md checklist.</Callout>
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "Can our marketing say 'MENO files your GST returns'?", a: "No. MENO prepares and exports; filing is done on the portal (or via a GSP when that's built and confirmed)." },
            { q: "Which register is filled automatically when an H1 drug is sold?", a: "The Schedule H1 register." },
          ]}
        />
      </Section>
    </>
  );
}
