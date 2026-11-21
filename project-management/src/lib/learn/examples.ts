import { calcInvoice, type InvoiceIn, type LedgerEntry, type Party } from "./invoice";
import { m } from "./money";

/*
 * Demo business used by every lesson. All names, GSTINs and licence numbers are made up
 * (AGENTS.md §9: never real customer data). GST rates here are illustrative: MENO reads the real rate
 * from `hsn_tax` for the document date and never hard-codes it.
 */

export const SHOP: Party = {
  name: "Aruna Medicals (demo)",
  address: "12 Gandhi Road, Chennai 600001",
  state: "Tamil Nadu",
  stateCode: "33",
  gstin: "33AAAAA0000A1Z5",
  dl: "20-DEMO-0001 / 21-DEMO-0001",
  dlForms: "Form 20 / 21 (retail)",
  phone: "+91 90000 00001",
};

export const WHOLESALER: Party = {
  name: "Kaveri Pharma Distributors (demo)",
  address: "4 Market Street, Chennai 600003",
  state: "Tamil Nadu",
  stateCode: "33",
  gstin: "33BBBBB1111B1Z2",
  dl: "20B-DEMO-0002 / 21B-DEMO-0002",
  dlForms: "Form 20B / 21B (wholesale)",
  phone: "+91 90000 00002",
};

export const RETAILER_KA: Party = {
  name: "Sri Balaji Medicals (demo)",
  address: "88 MG Road, Bengaluru 560001",
  state: "Karnataka",
  stateCode: "29",
  gstin: "29CCCCC2222C1Z9",
  dl: "20-DEMO-0003 / 21-DEMO-0003",
  dlForms: "Form 20 / 21 (retail)",
  phone: "+91 90000 00003",
};

export const WALK_IN: Party = { name: "Cash customer (walk-in)", address: "—", state: "Tamil Nadu", stateCode: "33" };

/** Retail counter bill: MRP-inclusive, intra-state (CGST + SGST). */
export const RETAIL_BILL = calcInvoice({
  kind: "Tax invoice",
  number: "AM/26-27/000123",
  date: "21-11-2026",
  mode: "MRP_INCLUSIVE",
  seller: SHOP,
  buyer: WALK_IN,
  payment: "UPI",
  doctor: "Dr. R. Kumar (demo), Reg. DEMO-1234",
  lines: [
    { item: "Paracip 650 Tablet", pack: "1×15", hsn: "3004", batch: "PC24A7", expiry: "08/2027", qty: "2", rate: "33.60", mrp: "33.60", discPct: "10", gstPct: "5" },
    { item: "Amoxa 500 Capsule (Sch. H)", pack: "1×10", hsn: "3004", batch: "AX1123", expiry: "03/2027", qty: "1", rate: "118.00", mrp: "118.00", discPct: "10", gstPct: "5" },
    { item: "Coughsoft Syrup", pack: "100 ml", hsn: "3004", batch: "CS0981", expiry: "11/2027", qty: "1", rate: "95.00", mrp: "95.00", discPct: "0", gstPct: "5" },
    { item: "Dermacalm Lotion", pack: "100 ml", hsn: "3304", batch: "DL5520", expiry: "06/2028", qty: "1", rate: "249.00", mrp: "249.00", discPct: "0", gstPct: "18" },
  ],
  notes: ["Schedule H drug sold on prescription of the doctor named above.", "Goods once sold are taken back only as per store policy."],
});

/** The worked example from CALCULATIONS.md (test-vector shape). */
export const DOC_VECTOR = calcInvoice({
  kind: "Tax invoice",
  number: "vector",
  date: "—",
  mode: "MRP_INCLUSIVE",
  seller: SHOP,
  buyer: WALK_IN,
  lines: [{ item: "Any item", hsn: "3004", qty: "2", rate: "112.00", discPct: "10", gstPct: "12" }],
});

/** Wholesale invoice: PTR (GST-exclusive), trade discount, free quantity, inter-state → IGST. */
export const WHOLESALE_BILL = calcInvoice({
  kind: "Tax invoice",
  number: "KPD/26-27/004512",
  date: "21-11-2026",
  mode: "EXCLUSIVE",
  seller: WHOLESALER,
  buyer: RETAILER_KA,
  payment: "Credit · 30 days",
  lines: [
    { item: "Paracip 650 Tablet", pack: "1×15", hsn: "3004", batch: "PC25B2", expiry: "01/2028", qty: "50", free: "5", rate: "24.00", mrp: "33.60", discPct: "2", gstPct: "5" },
    { item: "Amoxa 500 Capsule", pack: "1×10", hsn: "3004", batch: "AX1123", expiry: "03/2027", qty: "20", rate: "84.30", mrp: "118.00", discPct: "0", gstPct: "5" },
    { item: "Dermacalm Lotion", pack: "100 ml", hsn: "3304", batch: "DL5520", expiry: "06/2028", qty: "12", rate: "150.00", mrp: "249.00", discPct: "5", gstPct: "18" },
  ],
  notes: ["Scheme: Paracip 10+1 (5 strips free on 50).", "Payment due in 30 days. Interest as per terms."],
});

/** Purchase invoice the shop enters from its supplier: intra-state, scheme + trade discount. */
export const PURCHASE_BILL = calcInvoice({
  kind: "Purchase invoice",
  number: "KPD/26-27/004377",
  date: "18-11-2026",
  mode: "EXCLUSIVE",
  seller: WHOLESALER,
  buyer: SHOP,
  payment: "Credit · 15 days",
  lines: [
    { item: "Paracip 650 Tablet", pack: "1×15", hsn: "3004", batch: "PC24A7", expiry: "08/2027", qty: "30", free: "3", rate: "24.00", mrp: "33.60", discPct: "5", gstPct: "5" },
    { item: "Amoxa 500 Capsule", pack: "1×10", hsn: "3004", batch: "AX1123", expiry: "03/2027", qty: "10", rate: "84.30", mrp: "118.00", discPct: "0", gstPct: "5" },
    { item: "Dermacalm Lotion", pack: "100 ml", hsn: "3304", batch: "DL5520", expiry: "06/2028", qty: "6", rate: "150.00", mrp: "249.00", discPct: "0", gstPct: "18" },
  ],
});

/** Retail return: the customer brings back one strip of Paracip → credit note (same price terms as the bill). */
export const RETAIL_RETURN = calcInvoice({
  kind: "Credit note",
  number: "AM-CN/26-27/000007",
  date: "22-11-2026",
  mode: "MRP_INCLUSIVE",
  seller: SHOP,
  buyer: WALK_IN,
  payment: "Cash refund",
  lines: [{ item: "Paracip 650 Tablet", pack: "1×15", hsn: "3004", batch: "PC24A7", expiry: "08/2027", qty: "1", rate: "33.60", mrp: "33.60", discPct: "10", gstPct: "5" }],
  notes: ["Against invoice AM/26-27/000123 dated 21-11-2026."],
});

/** Wholesale expiry/breakage return from the Karnataka retailer → credit note at the billed PTR. */
export const WHOLESALE_RETURN = calcInvoice({
  kind: "Credit note",
  number: "KPD-CN/26-27/000311",
  date: "05-12-2026",
  mode: "EXCLUSIVE",
  seller: WHOLESALER,
  buyer: RETAILER_KA,
  lines: [{ item: "Amoxa 500 Capsule", pack: "1×10", hsn: "3004", batch: "AX1123", expiry: "03/2027", qty: "2", rate: "84.30", mrp: "118.00", discPct: "0", gstPct: "5" }],
  notes: ["Breakage in transit, against KPD/26-27/004512."],
});

/** Sri Balaji Medicals' account in the wholesaler's books (Sundry Debtors). */
export const CUSTOMER_LEDGER: { opening: bigint; entries: LedgerEntry[] } = {
  opening: m("12500.00"),
  entries: [
    { date: "21-11-2026", particulars: "Sales", type: "Sales", no: WHOLESALE_BILL.number, dr: WHOLESALE_BILL.grandTotal },
    { date: "25-11-2026", particulars: "Bank (NEFT)", type: "Receipt", no: "RCPT/26-27/000210", cr: m("12500.00") },
    { date: "05-12-2026", particulars: "Sales Return", type: "Credit note", no: WHOLESALE_RETURN.number, cr: WHOLESALE_RETURN.grandTotal },
    { date: "15-12-2026", particulars: "Bank (UPI)", type: "Receipt", no: "RCPT/26-27/000245", cr: m("2000.00") },
  ],
};

/** Kaveri Pharma's account in Aruna Medicals' books (Sundry Creditors): credit = we owe. */
export const SUPPLIER_LEDGER: { opening: bigint; entries: LedgerEntry[] } = {
  opening: m("0"),
  entries: [
    { date: "18-11-2026", particulars: "Purchase", type: "Purchase", no: PURCHASE_BILL.number, cr: PURCHASE_BILL.grandTotal },
    { date: "30-11-2026", particulars: "Bank (NEFT)", type: "Payment", no: "PAY/26-27/000031", dr: m("2000.00") },
  ],
};

/** Stock ledger of one batch at the shop: every change is a movement row. */
export const MOVEMENTS = [
  { date: "18-11-2026", type: "PURCHASE", doc: PURCHASE_BILL.number, qty: 33, note: "30 billed + 3 free" },
  { date: "21-11-2026", type: "SALE", doc: RETAIL_BILL.number, qty: -2, note: "Counter bill" },
  { date: "22-11-2026", type: "SALES_RETURN", doc: RETAIL_RETURN.number, qty: 1, note: "Customer returned 1 strip" },
  { date: "24-11-2026", type: "ADJUSTMENT", doc: "ADJ/26-27/000004", qty: -1, note: "Strip damaged (reason recorded)" },
];


/* ---------- The three scheme types, one wholesale invoice each (same state → CGST + SGST) ---------- */

export const RETAILER_TN: Party = {
  name: "Arogya Medicals (demo)",
  address: "21 East Masi Street, Madurai 625001",
  state: "Tamil Nadu",
  stateCode: "33",
  gstin: "33DDDDD3333D1Z4",
  dl: "20-DEMO-0004 / 21-DEMO-0004",
  dlForms: "Form 20 / 21 (retail)",
};

/** 1. Free quantity "10 + 1": pay for 10 packs, get 11. */
export const SCHEME_FREE_BILL = calcInvoice({
  kind: "Tax invoice",
  number: "KPD/26-27/004601",
  date: "23-11-2026",
  mode: "EXCLUSIVE",
  seller: WHOLESALER,
  buyer: RETAILER_TN,
  payment: "Credit · 30 days",
  lines: [
    { item: "Paracip 650 Tablet", pack: "1×15", hsn: "3004", batch: "PC25B2", expiry: "01/2028", qty: "30", free: "3", rate: "24.00", mrp: "33.60", discPct: "0", gstPct: "5" },
    { item: "Coughsoft Syrup", pack: "100 ml", hsn: "3004", batch: "CS0981", expiry: "11/2027", qty: "20", free: "2", rate: "68.00", mrp: "95.00", discPct: "0", gstPct: "5" },
  ],
  notes: ["Scheme 10 + 1 on both items: 3 strips and 2 bottles free.", "Free goods leave stock but carry no value on the bill."],
});

/** 2. Scheme discount "5 % on 50+": a % off when the line reaches 50 packs, before trade discount. */
export const SCHEME_PCT_BILL = calcInvoice({
  kind: "Tax invoice",
  number: "KPD/26-27/004602",
  date: "23-11-2026",
  mode: "EXCLUSIVE",
  seller: WHOLESALER,
  buyer: RETAILER_TN,
  payment: "Credit · 30 days",
  lines: [
    { item: "Cetriz 10 Tablet", pack: "1×10", hsn: "3004", batch: "CZ2210", expiry: "09/2027", qty: "60", rate: "18.50", mrp: "26.00", schemePct: "5", discPct: "2", gstPct: "5" },
    { item: "Amoxa 500 Capsule", pack: "1×10", hsn: "3004", batch: "AX1123", expiry: "03/2027", qty: "20", rate: "84.30", mrp: "118.00", schemePct: "0", discPct: "2", gstPct: "5" },
  ],
  notes: ["Scheme 5% on 50+ strips: Cetriz qualifies (60), Amoxa doesn't (20).", "Trade discount 2% on both, after the scheme discount."],
});

/** 3. Half scheme "10 + ½" (pack-based): free goods in loose units, e.g. half a strip of 10 = 5 capsules. */
export const SCHEME_HALF_BILL = calcInvoice({
  kind: "Tax invoice",
  number: "KPD/26-27/004603",
  date: "23-11-2026",
  mode: "EXCLUSIVE",
  seller: WHOLESALER,
  buyer: RETAILER_TN,
  payment: "Credit · 30 days",
  lines: [
    { item: "Amoxa 500 Capsule", pack: "1×10", hsn: "3004", batch: "AX1123", expiry: "03/2027", qty: "10", freeLoose: "5", unitsPerPack: "10", rate: "84.30", mrp: "118.00", discPct: "0", gstPct: "5" },
    { item: "Paracip 650 Tablet", pack: "1×15", hsn: "3004", batch: "PC25B2", expiry: "01/2028", qty: "20", free: "1", rate: "24.00", mrp: "33.60", discPct: "0", gstPct: "5" },
  ],
  notes: ["Scheme 10 + ½: Amoxa 10 strips → ½ strip (5 capsules) free; Paracip 20 strips → 1 strip free.", "Loose free units need the item's unit conversion (strip → capsule)."],
});
