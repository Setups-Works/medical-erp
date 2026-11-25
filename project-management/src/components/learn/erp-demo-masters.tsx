"use client";

import { Check, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { fmt, m } from "@/lib/learn/money";
import { Kbd } from "../ui";
import {
  AddButton,
  Card,
  Chips,
  F,
  FieldGuide,
  GSTIN_DIRECTORY,
  type GstPortal,
  type Guide,
  HSNS,
  IFSCS,
  type Med,
  MultiChips,
  NextBar,
  PAN_HOLDER,
  PINS,
  RX,
  STATES,
  SaveButton,
  SavedNote,
  Screen,
  SectionLabel,
  Tabs,
  Toggle,
  expiryError,
  fetchGstPortal,
  gstinChecks,
  stateName,
  gstinError,
  pctError,
} from "./erp-demo-kit";

/*
 * Tabbed master forms for the walkthrough, following docs/product/MASTER_FIELDS.md
 * (supplier and customer: Books · Licences · Bank · Income tax · GST · Others (+ Patient); product: Details · Pharmacy · Pricing & tax · Stock & warehouse).
 */

/* ---------- Projections used by the rest of the flow ---------- */

export type Vendor = { name: string; gstin: string; state: string; dl: string; dlExpiry: string; phone: string; address: string; creditDays: string; opening: string; msme: string };
export type Customer = { kind: "retail" | "retailer"; name: string; phone: string; gstin: string; state: string; dl: string; creditLimit: string; creditDays: string; address: string };

/* ---------- Party form ---------- */

type Contact = { type: string; person: string; designation: string; email: string; mobile: string; office: string };
type Address = { type: string; name: string; line1: string; line2: string; pin: string };
type BankAc = { type: string; ifsc: string; holder: string; acc: string; acc2: string; upi: string };

type PartyForm = {
  gstin: string;
  gstStatus: string;
  /** Legal name from the GST portal (live fetch only). */
  legal: string;
  name: string;
  printName: string;
  code: string;
  kind: string;
  group: string;
  contacts: Contact[];
  addresses: Address[];
  dlForm: string;
  dl: string;
  dlExpiry: string;
  fssai: string;
  bankOn: boolean;
  banks: BankAc[];
  remind: boolean;
  remindAt: string[];
  channels: string[];
  pan: string;
  related: boolean;
  msme: string;
  udyam: string;
  tds: boolean;
  gstType: string;
  rateMode: string;
  both: boolean;
  transporter: string;
  disc: string;
  cashDisc: string;
  specialDisc: string;
  agent: string;
  agentComm: string;
  creditLimit: string;
  creditDays: string;
  interest: string;
  interestBasis: string;
  opening: string;
  active: boolean;
  dob: string;
  gender: string;
  allergies: string;
  conditions: string;
};

const blankContact = (type = "Primary"): Contact => ({ type, person: "", designation: "", email: "", mobile: "", office: "" });
const blankAddress = (type = "Billing"): Address => ({ type, name: "", line1: "", line2: "", pin: "" });
const blankBank = (type = "Primary"): BankAc => ({ type, ifsc: "", holder: "", acc: "", acc2: "", upi: "" });

const base: Omit<PartyForm, "name" | "kind" | "contacts" | "addresses"> = {
  gstin: "",
  gstStatus: "",
  legal: "",
  printName: "",
  code: "",
  group: "",
  dlForm: "20B / 21B",
  dl: "",
  dlExpiry: "",
  fssai: "",
  bankOn: false,
  banks: [blankBank()],
  remind: true,
  remindAt: ["7 days before due", "On due date"],
  channels: ["WhatsApp"],
  pan: "",
  related: false,
  msme: "Not applicable",
  udyam: "",
  tds: false,
  gstType: "Regular",
  rateMode: "Exclusive of GST",
  both: false,
  transporter: "",
  disc: "",
  cashDisc: "",
  specialDisc: "",
  agent: "",
  agentComm: "",
  creditLimit: "0",
  creditDays: "30",
  interest: "",
  interestBasis: "Simple, 365-day year",
  opening: "0",
  active: true,
  dob: "",
  gender: "",
  allergies: "",
  conditions: "",
};

const SUPPLIER_DEFAULT: PartyForm = {
  ...base,
  gstin: "33BBBBB1111B1Z2",
  name: "Kaveri Pharma Distributors",
  kind: "Distributor",
  group: "Pharma distributors",
  contacts: [{ type: "Primary", person: "R. Senthil (demo)", designation: "Sales manager", email: "orders@kaveri.example", mobile: "9000000002", office: "" }],
  addresses: [{ type: "Billing", name: "Head office", line1: "4 Market Street", line2: "", pin: "600003" }],
  dl: "20B-DEMO-0002 / 21B-DEMO-0002",
  dlExpiry: "03/2029",
  bankOn: true,
  banks: [{ type: "Primary", ifsc: "DEMO0000001", holder: "Kaveri Pharma Distributors", acc: "000123456789", acc2: "000123456789", upi: "" }],
  pan: "BBBBB1111B",
  msme: "Small",
  udyam: "UDYAM-TN-02-0001234",
  creditDays: "15",
  opening: "2500.00",
  disc: "2",
  transporter: "Own vehicle",
};

const RETAIL_DEFAULT: PartyForm = {
  ...base,
  name: "Meena Raghavan",
  kind: "Retail (person)",
  group: "Individuals",
  gstType: "Unregistered (consumer)",
  rateMode: "Inclusive of GST",
  contacts: [{ ...blankContact(), person: "Meena Raghavan", mobile: "9000000010" }],
  addresses: [{ type: "Billing", name: "Home", line1: "21 Lake View Road", line2: "", pin: "600001" }],
  creditLimit: "2000.00",
  remind: true,
  dob: "12/03/1968",
  gender: "Female",
  allergies: "Penicillin",
  conditions: "Type 2 diabetes",
};

const RETAILER_DEFAULT: PartyForm = {
  ...base,
  gstin: "29CCCCC2222C1Z9",
  name: "Sri Balaji Medicals",
  kind: "Retailer (pharmacy)",
  group: "Retailers A",
  contacts: [{ ...blankContact(), person: "K. Ramesh (demo)", designation: "Proprietor", mobile: "9000000003" }],
  addresses: [{ type: "Billing", name: "Shop", line1: "88 MG Road", line2: "", pin: "560001" }],
  dlForm: "20 / 21",
  dl: "20-DEMO-0003 / 21-DEMO-0003",
  dlExpiry: "06/2028",
  pan: "CCCCC2222C",
  creditLimit: "50000.00",
  creditDays: "30",
  interest: "18",
};

/** Empty forms for the live GSTIN lesson: everything comes from Fetch or the user. */
const LIVE_SUPPLIER: PartyForm = { ...base, name: "", kind: "Distributor", group: "", contacts: [blankContact()], addresses: [blankAddress()], remind: false };
const liveCustomer = (kind: string): PartyForm => ({
  ...base,
  name: "",
  kind,
  group: "",
  contacts: [blankContact()],
  addresses: [blankAddress()],
  remind: false,
  ...(kind === "Retail (person)" ? { gstType: "Unregistered (consumer)", rateMode: "Inclusive of GST" } : { dlForm: "20 / 21" }),
});

type PinDir = typeof PINS;

const PERSON = "Retail (person)";
const needsLicence = (role: "supplier" | "customer", kind: string) => role === "supplier" || ["Retailer (pharmacy)", "Hospital", "Clinic"].includes(kind);
const gstinRequired = (t: string) => ["Regular", "Composition", "SEZ"].includes(t);

const partyGuide = (role: "supplier" | "customer"): Guide => {
  const who = role === "supplier" ? "supplier" : "customer";
  return {
    gstin: { tab: "Books", label: "GSTIN + Fetch", what: `The ${who}'s 15-character GST number. Fetch verifies it and fills name, address, state and GST status.`, rule: "Pattern, check digit, and the first 2 digits must equal the billing state. Required for Regular / Composition / SEZ.", why: "A wrong GSTIN breaks GSTR matching and input tax credit. A cancelled GSTIN is a red flag." },
    name: { tab: "Books", label: "Name", what: `Legal or trade name of the ${who}.`, rule: "1–200 characters; duplicates checked case-insensitively.", why: "Two records for one party split the outstanding." },
    printName: { tab: "Books", label: "Print name", what: "Name printed on documents if different (short name, trade name).", rule: "Optional; defaults to the name.", why: "Thermal bills have narrow paper." },
    code: { tab: "Books", label: "Code", what: "Short code for fast search.", rule: "Auto from the number series when blank; unique.", why: "Counter staff type codes, not long names." },
    kind: { tab: "Books", label: role === "supplier" ? "Vendor type" : "Customer type", what: role === "supplier" ? "Manufacturer, distributor, stockist, C&F agent…" : "Person, retailer (pharmacy), hospital, clinic, institution, doctor.", rule: "Options from the API. Type decides which tabs and fields are required.", why: role === "supplier" ? "Reports and default terms per type." : "A retailer needs GSTIN and drug licence; a person needs only a phone." },
    group: { tab: "Books", label: "Group", what: "Party group with default price list, discount and credit terms.", rule: "Options from the party group master.", why: "Set terms once for 200 retailers, not 200 times." },
    contact: { tab: "Books", label: "Contacts", what: "People to call: primary, accounts, orders, sales rep.", rule: "At least one, exactly one primary. Mobile 10 digits starting 6–9; email valid.", why: "Orders go to purchasing, reminders to accounts." },
    address: { tab: "Books", label: "Addresses", what: "Billing, shipping and godown addresses.", rule: "One billing address required. PIN (6 digits) fills state, district and city from the PIN directory.", why: "Billing state = place of supply = CGST+SGST or IGST." },
    dl: { tab: "Licences", label: "Drug licence", what: "Licence form and number (20/21 retail, 20B/21B wholesale), with expiry.", rule: "Required for pharma suppliers and pharmacy customers; expiry after today. Reminders 30/15/7 days.", why: "Buying from or selling to an unlicensed party is not allowed; expired licence blocks documents ⚠." },
    fssai: { tab: "Licences", label: "FSSAI licence", what: "Food licence for nutraceuticals and baby food.", rule: "14 digits; only when the party deals in food items.", why: "Needed for food-category products." },
    bankOn: { tab: "Bank", label: "Bank accounts", what: "Accounts for payments and refunds.", rule: "IFSC `XXXX0XXXXXX` fills bank and branch; account no. 9–18 digits typed twice; stored encrypted, shown as last 4. Changes need approval.", why: "Fake bank-detail changes are a common fraud: maker-checker stops it." },
    remind: { tab: "Bank", label: "Payment reminders", what: role === "supplier" ? "Reminders for us before supplier bills fall due." : "Reminders to the customer before and on the due date.", rule: "Due date = bill date + credit days. Channels from notification settings.", why: "Fewer overdue payables and receivables." },
    pan: { tab: "Income tax", label: "PAN", what: "Income-tax PAN.", rule: "10 characters; must equal GSTIN characters 3–12. Required when TDS/TCS applies.", why: "TDS returns are filed against the PAN." },
    related: { tab: "Income tax", label: "Related party", what: "Owner's relative or group company.", rule: "Yes / No.", why: "Related-party transactions are reported in the audit." },
    msme: { tab: "Income tax", label: "MSME (Udyam)", what: "Micro, small or medium enterprise registration.", rule: "Udyam no. `UDYAM-XX-00-0000000` when registered. Micro/small suppliers must be paid within the agreed days, at most the statutory limit ⚠ CA to confirm.", why: "Late MSME payments can carry interest and tax disallowance ⚠." },
    tds: { tab: "Income tax", label: "TDS / TCS", what: "Whether tax is deducted or collected on this party's transactions.", rule: "Section, rate and threshold come from the TDS section master, effective-dated ⚠ CA.", why: "Computed automatically on vouchers instead of by hand." },
    gstType: { tab: "GST", label: "GST registration type", what: "Regular, composition, unregistered, SEZ or overseas.", rule: "Decides if GSTIN is required and if input credit is allowed.", why: "Composition / unregistered suppliers give no input tax credit." },
    rateMode: { tab: "GST", label: "Rates on bills", what: "Whether this party's rates usually include GST.", rule: "Default for new documents; can be changed per bill.", why: "Wrong mode inflates or shrinks every line." },
    both: { tab: "Others", label: "Also a " + (role === "supplier" ? "customer" : "supplier"), what: "Same party used for sales and purchases.", rule: "One ledger; outstanding nets off ⚠ CA.", why: "No duplicate party for a distributor you also sell to." },
    transporter: { tab: "Others", label: "Transporter", what: "Default transporter and mode.", rule: "From the transporter master.", why: "Pre-fills GRN, delivery and e-way bill." },
    disc: { tab: "Others", label: "Default discounts", what: "Discount %, cash discount %, special discount %.", rule: "0–100 each; copied to new documents; order of application per PRC-05 ⚠.", why: "Agreed terms are applied every time without typing." },
    agent: { tab: "Others", label: "Agent / salesman", what: "Agent or salesman and commission %.", rule: "From the agent / salesman master; 0–100%.", why: "Commission reports." },
    credit: { tab: "Others", label: "Credit limit / days", what: "How much and how long credit is given (or taken).", rule: "Limit ≥ 0 (0 = cash only); days 0–365. Crossing the limit needs approval.", why: "Stops bad debt at the counter." },
    interest: { tab: "Others", label: "Interest on overdue", what: "Interest % and basis for late payment.", rule: "0–100% per year; basis from a list.", why: "Interest report and optional interest debit note." },
    opening: { tab: "Others", label: "Opening balance", what: "Balance on the day you start with MENO.", rule: role === "supplier" ? "Amount, Cr (we owe them)." : "Amount, Dr (they owe us).", why: "Ledger and outstanding start right." },
    active: { tab: "Others", label: "Active", what: "Inactive parties can't be picked on new documents.", rule: "Deactivate, never delete, once used.", why: "Posted documents keep their history." },
    patient: { tab: "Patient", label: "Patient profile", what: "Date of birth, gender, allergies, chronic conditions.", rule: "Health data: only roles with permission see it; never logged; consent recorded ⚠.", why: "Pharmacist sees allergy warnings; refill reminders for chronic medicines." },
  };
};

type Errs = Record<string, string | undefined>;

function validateParty(p: PartyForm, role: "supplier" | "customer", pins: PinDir = PINS): { errs: Errs; tabOf: Record<string, string>; warn: string[] } {
  const e: Errs = {};
  const tabOf: Record<string, string> = {};
  const set = (k: string, tab: string, msg?: string) => {
    if (msg) {
      e[k] = msg;
      tabOf[k] = tab;
    }
  };
  const billing = p.addresses.find((a) => a.type === "Billing");
  const state = billing ? pins[billing.pin]?.state ?? "" : "";
  set("name", "Books", p.name.trim() ? undefined : "Name is required.");
  set("gstin", "Books", gstinError(p.gstin, state, gstinRequired(p.gstType)));
  set("gstinStatus", "Books", p.gstStatus === "Cancelled" ? "This GSTIN is cancelled: you can't save it on an active party." : undefined);
  p.contacts.forEach((c, i) => {
    set(`c${i}.person`, "Books", c.person.trim() ? undefined : "Contact person is required.");
    set(`c${i}.mobile`, "Books", RX.phone.test(c.mobile) ? undefined : "10 digits starting 6–9.");
    set(`c${i}.email`, "Books", c.email && !RX.email.test(c.email) ? "Enter a valid email." : undefined);
  });
  set("contacts", "Books", p.contacts.filter((c) => c.type === "Primary").length === 1 ? undefined : "Exactly one contact must be Primary.");
  set("addresses", "Books", billing ? undefined : "Add a billing address.");
  p.addresses.forEach((a, i) => {
    set(`a${i}.line1`, "Books", a.line1.trim() ? undefined : "Address line 1 is required.");
    set(`a${i}.pin`, "Books", !RX.pin.test(a.pin) ? "6 digits, not starting with 0." : pins[a.pin] ? undefined : "Not in the demo PIN list: try 600001, 600003, 560001, 682001, 400001, or Fetch a GSTIN to add its PIN.");
  });
  if (needsLicence(role, p.kind)) {
    set("dl", "Licences", p.dl.trim().length >= 3 ? undefined : "Drug licence number is required.");
    set("dlExpiry", "Licences", expiryError(p.dlExpiry, "Licence expiry"));
  }
  set("fssai", "Licences", p.fssai && !RX.fssai.test(p.fssai) ? "14 digits." : undefined);
  if (p.bankOn)
    p.banks.forEach((b, i) => {
      set(`b${i}.ifsc`, "Bank", !RX.ifsc.test(b.ifsc) ? "IFSC: 4 letters, 0, 6 letters/digits." : IFSCS[b.ifsc] ? undefined : "Not in the demo IFSC list: try DEMO0000001.");
      set(`b${i}.acc`, "Bank", RX.account.test(b.acc) ? undefined : "9–18 digits.");
      set(`b${i}.acc2`, "Bank", b.acc2 === b.acc ? undefined : "Account numbers don't match.");
      set(`b${i}.upi`, "Bank", b.upi && !RX.upi.test(b.upi) ? "UPI ID like name@bank." : undefined);
    });
  set("remind", "Bank", p.remind && (!p.remindAt.length || !p.channels.length) ? "Pick at least one schedule and one channel, or turn reminders off." : undefined);
  set("pan", "Income tax", p.pan && !RX.pan.test(p.pan) ? "PAN: 5 letters, 4 digits, 1 letter." : p.pan && p.gstin && RX.gstin.test(p.gstin) && p.gstin.slice(2, 12) !== p.pan ? "PAN must equal GSTIN characters 3–12." : p.tds && !p.pan ? "PAN is required when TDS/TCS applies." : undefined);
  set("udyam", "Income tax", p.msme !== "Not applicable" && !RX.udyam.test(p.udyam) ? "Udyam no. like UDYAM-TN-02-0001234." : undefined);
  for (const [k, label] of [["disc", "Discount"], ["cashDisc", "Cash discount"], ["specialDisc", "Special discount"], ["agentComm", "Commission"], ["interest", "Interest"]] as const) set(k, "Others", pctError(p[k], label));
  set("creditLimit", "Others", RX.amount.test(p.creditLimit || "0") ? undefined : "Amount like 5000.00");
  set("creditDays", "Others", /^\d{1,3}$/.test(p.creditDays) && Number(p.creditDays) <= 365 ? undefined : "0 to 365 days.");
  set("opening", "Others", RX.amount.test(p.opening || "0") ? undefined : "Amount like 2500.00");
  const warn: string[] = [];
  // ⚠ The MSME payment limit is a statutory value to confirm with the CA; MENO reads it from settings, the demo shows 45.
  if (role === "supplier" && ["Micro", "Small"].includes(p.msme) && Number(p.creditDays) > 45) warn.push("MSME supplier with credit days above the payment limit in settings (45 in the demo ⚠).");
  if (p.gstStatus === "Suspended") warn.push("GSTIN is suspended: purchases will warn until it is active again.");
  return { errs: e, tabOf, warn };
}

export function PartyStep({
  role,
  saved: savedProp,
  onSave,
  onBack,
  onNext,
  live,
}: {
  role: "supplier" | "customer";
  saved?: Vendor | Customer | null;
  onSave?: (v: Vendor | Customer) => void;
  onBack?: () => void;
  onNext?: () => void;
  /** Day 22: start empty and let Fetch call the real GST verify service (via /api/learn/gst). */
  live?: boolean;
}) {
  const [p, setP] = useState<PartyForm>(live ? (role === "supplier" ? LIVE_SUPPLIER : liveCustomer("Retailer (pharmacy)")) : role === "supplier" ? SUPPLIER_DEFAULT : RETAIL_DEFAULT);
  const [ownSaved, setOwnSaved] = useState<Vendor | Customer | null>(null);
  const saved = savedProp !== undefined ? savedProp : ownSaved;
  // PIN directory: the demo list plus any PIN a live fetch brought back.
  const [pins, setPins] = useState<PinDir>(PINS);
  const [portal, setPortal] = useState<GstPortal | null>(null);
  const [fromGst, setFromGst] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [tab, setTab] = useState("Books");
  const [active, setActive] = useState("gstin");
  const [tried, setTried] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<string>();
  const guide = partyGuide(role);
  const set = <K extends keyof PartyForm>(k: K) => (v: PartyForm[K]) => setP((x) => ({ ...x, [k]: v }));
  const person = role === "customer" && p.kind === PERSON;
  const tabs = ["Books", ...(needsLicence(role, p.kind) ? ["Licences"] : []), "Bank", "Income tax", "GST", ...(person ? ["Patient"] : []), "Others"];
  const { errs, tabOf, warn } = validateParty(p, role, pins);
  const ok = Object.values(errs).every((x) => !x);
  const show = (k: string) => (tried ? errs[k] : undefined);
  const tabErrors = tried ? Object.fromEntries(Object.entries(tabOf).map(([, t]) => [t, true])) : {};
  const billing = p.addresses.find((a) => a.type === "Billing");
  const state = billing ? pins[billing.pin]?.state : undefined;
  const gst = (k: string) => (live && fromGst.has(k) ? "From GST portal" : undefined);

  const upd = <T,>(list: T[], i: number, patch: Partial<T>) => list.map((x, j) => (j === i ? { ...x, ...patch } : x));

  const fetchLive = async () => {
    setActive("gstin");
    setPortal(null);
    if (!gstinChecks(p.gstin).every((c) => c.ok)) return setFetchMsg("Fix the GSTIN first: the checks below must all pass. No API call was made.");
    setLoading(true);
    setFetchMsg(undefined);
    try {
      const d = await fetchGstPortal(p.gstin);
      const a = d.structured_address ?? {};
      const code = d.gstin.slice(0, 2);
      const pin = a.pincode ?? "";
      if (RX.pin.test(pin)) setPins((x) => ({ ...x, [pin]: { state: code, district: a.city ?? "", city: a.city ?? "" } }));
      const regType = /composition/i.test(d.dty ?? "") ? "Composition" : /sez/i.test(d.dty ?? "") ? "SEZ" : "Regular";
      const status = /^active$/i.test(d.sts ?? "") ? "Active" : /cancel/i.test(d.sts ?? "") ? "Cancelled" : /suspend/i.test(d.sts ?? "") ? "Suspended" : (d.sts ?? "");
      setP((x) => ({
        ...x,
        name: d.tradeNam || d.lgnm || x.name,
        printName: d.tradeNam || d.lgnm || x.printName,
        legal: d.lgnm ?? "",
        gstStatus: status,
        gstType: regType,
        pan: d.gstin.slice(2, 12),
        // A GST-registered customer is a business, not a walk-in person.
        ...(role === "customer" && x.kind === PERSON ? { kind: "Retailer (pharmacy)", rateMode: "Exclusive of GST", dlForm: "20 / 21" } : {}),
        addresses: [{ ...(x.addresses[0] ?? blankAddress()), type: "Billing", name: x.addresses[0]?.name || "Principal place of business", line1: a.address_line1 ?? "", line2: a.address_line2 ?? "", pin }, ...x.addresses.slice(1)],
      }));
      setFromGst(new Set(["name", "printName", "legal", "gstStatus", "gstType", "pan", "address"]));
      setPortal(d);
      setFetchMsg(`Fetched from the GST portal: ${d.lgnm ?? d.gstin} · ${status || "status unknown"}.`);
    } catch (e) {
      setFetchMsg(e instanceof Error ? e.message : "Couldn’t fetch the GSTIN.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGstin = () => {
    if (live) return void fetchLive();
    setActive("gstin");
    const hit = GSTIN_DIRECTORY[p.gstin];
    if (!RX.gstin.test(p.gstin)) return setFetchMsg("Enter a valid 15-character GSTIN first.");
    if (!hit) return setFetchMsg("Not in the demo directory. Try 33BBBBB1111B1Z2, 29CCCCC2222C1Z9 or 33DDDDD3333D1Z1 (cancelled).");
    setP((x) => ({
      ...x,
      name: hit.legal,
      gstStatus: hit.status,
      gstType: hit.type,
      pan: x.gstin.slice(2, 12),
      addresses: [{ ...(x.addresses[0] ?? blankAddress()), type: "Billing", line1: hit.line1, pin: hit.pin }, ...x.addresses.slice(1)],
    }));
    setFetchMsg(`Fetched: ${hit.legal} · ${hit.status}. Name, PAN, GST type and billing address filled.`);
  };

  const save = () => {
    setTried(true);
    if (!ok) {
      const first = Object.keys(tabOf)[0];
      if (first) setTab(tabOf[first]);
      return;
    }
    const b = billing!;
    const pin = pins[b.pin];
    const address = `${b.line1}${b.line2 ? `, ${b.line2}` : ""}, ${pin.city} ${b.pin}`;
    const phone = p.contacts.find((c) => c.type === "Primary")!.mobile;
    const done = (v: Vendor | Customer) => (onSave ? onSave(v) : setOwnSaved(v));
    if (role === "supplier") done({ name: p.name.trim(), gstin: p.gstin, state: pin.state, dl: p.dl, dlExpiry: p.dlExpiry, phone, address, creditDays: p.creditDays, opening: p.opening || "0", msme: p.msme });
    else done({ kind: p.kind === PERSON ? "retail" : "retailer", name: p.name.trim(), phone, gstin: p.gstin, state: pin.state, dl: p.dl, creditLimit: p.creditLimit || "0", creditDays: p.creditDays, address });
  };

  const route = role === "supplier" ? "/masters/suppliers/new" : "/masters/customers/new";
  const title = role === "supplier" ? "New supplier" : "New customer";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Screen route={route} title={title} actions={<Kbd>{role === "supplier" ? "N V" : "N C"}</Kbd>}>
          <Tabs tabs={tabs} active={tab} onChange={setTab} errors={tabErrors} />

          {tab === "Books" && (
            <div className="space-y-3">
              {role === "customer" && (
                <Chips
                  k="kind"
                  label="Customer type"
                  value={p.kind}
                  setActive={setActive}
                  onChange={(k) => {
                    if (live) {
                      // Keep what Fetch filled; only the type (and the fields it drives) changes.
                      setP((x) => (portal ? { ...x, kind: k } : liveCustomer(k)));
                    } else {
                      setP(k === PERSON ? RETAIL_DEFAULT : { ...RETAILER_DEFAULT, kind: k });
                      setFetchMsg(undefined);
                    }
                    setTried(false);
                  }}
                  options={[PERSON, "Retailer (pharmacy)", "Hospital", "Clinic", "Institution"].map((v) => ({ v, l: v }))}
                />
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <F
                  k="gstin"
                  label={gstinRequired(p.gstType) ? "GSTIN" : "GSTIN (optional)"}
                  value={p.gstin}
                  onChange={(v) => {
                    set("gstin")(v.slice(0, 15));
                    set("gstStatus")("");
                    if (live) setFetchMsg(undefined);
                  }}
                  setActive={setActive}
                  error={show("gstin") ?? show("gstinStatus")}
                  mono
                  upper
                  required={gstinRequired(p.gstType)}
                  hint={fetchMsg ?? (p.gstStatus ? `Status: ${p.gstStatus}` : "Fetch fills the rest")}
                  placeholder={live ? "33AAJCN0778N1ZZ" : undefined}
                  action={
                    <button onClick={fetchGstin} disabled={loading} aria-label="Fetch GSTIN details" className="inline-flex h-9 shrink-0 items-center gap-1 rounded-ctl px-2.5 text-[12px] text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover disabled:opacity-50">
                      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />} Fetch
                    </button>
                  }
                />
                <F k="name" label={role === "supplier" ? "Vendor name" : "Customer name"} value={p.name} onChange={set("name")} setActive={setActive} error={show("name")} required hint={gst("name")} />
                <F k="printName" label="Print name" value={p.printName} onChange={set("printName")} setActive={setActive} placeholder={p.name || "Defaults to name"} hint={gst("printName")} />
                <F k="code" label="Code" value={p.code} onChange={set("code")} setActive={setActive} placeholder="Auto: V-0001" mono />
                {role === "supplier" ? (
                  <Chips k="kind" label="Vendor type" value={p.kind} onChange={set("kind")} setActive={setActive} options={["Manufacturer", "Distributor", "Stockist", "C&F agent"].map((v) => ({ v, l: v }))} />
                ) : (
                  <span />
                )}
                <F k="group" label="Group" value={p.group} onChange={set("group")} setActive={setActive} hint="Picked from the party group master" />
              </div>
              {live && p.gstin && (
                <ul className="grid gap-0.5 sm:grid-cols-2" aria-label="GSTIN checks before Fetch">
                  {gstinChecks(p.gstin).map((c) => (
                    <li key={c.label} className={c.ok ? "flex items-center gap-1.5 text-[12px] text-ink-2" : "flex items-center gap-1.5 text-[12px] text-critical"}>
                      {c.ok ? <Check className="size-3.5" /> : <X className="size-3.5" />} {c.label}
                    </li>
                  ))}
                </ul>
              )}
              {live && p.legal && <F k="name" label="Legal name (GST, read-only)" value={p.legal} readOnly setActive={setActive} hint={gst("legal")} />}

              <SectionLabel action={<AddButton onClick={() => set("contacts")([...p.contacts, blankContact("Accounts")])}>Add contact</AddButton>}>Contacts</SectionLabel>
              {show("contacts") && <p className="text-[11.5px] text-critical">{show("contacts")}</p>}
              <div className="space-y-2">
                {p.contacts.map((c, i) => (
                  <Card key={i} title={`Contact ${i + 1}`} onRemove={p.contacts.length > 1 ? () => set("contacts")(p.contacts.filter((_, j) => j !== i)) : undefined}>
                    <Chips k="contact" label="Type" value={c.type} onChange={(v) => set("contacts")(upd(p.contacts, i, { type: v }))} setActive={setActive} options={["Primary", "Accounts", "Orders", "Sales rep"].map((v) => ({ v, l: v }))} />
                    <F k="contact" label="Contact person" value={c.person} onChange={(v) => set("contacts")(upd(p.contacts, i, { person: v }))} setActive={setActive} error={show(`c${i}.person`)} required />
                    <F k="contact" label="Designation" value={c.designation} onChange={(v) => set("contacts")(upd(p.contacts, i, { designation: v }))} setActive={setActive} />
                    <F k="contact" label="Mobile" value={c.mobile} onChange={(v) => set("contacts")(upd(p.contacts, i, { mobile: v }))} setActive={setActive} error={show(`c${i}.mobile`)} mono required />
                    <F k="contact" label="Email" value={c.email} onChange={(v) => set("contacts")(upd(p.contacts, i, { email: v }))} setActive={setActive} error={show(`c${i}.email`)} />
                    <F k="contact" label="Office no." value={c.office} onChange={(v) => set("contacts")(upd(p.contacts, i, { office: v }))} setActive={setActive} mono />
                  </Card>
                ))}
              </div>

              <SectionLabel action={<AddButton onClick={() => set("addresses")([...p.addresses, blankAddress("Shipping")])}>Add address</AddButton>}>Addresses</SectionLabel>
              {show("addresses") && <p className="text-[11.5px] text-critical">{show("addresses")}</p>}
              <div className="space-y-2">
                {p.addresses.map((a, i) => {
                  const pin = pins[a.pin];
                  const fromPortal = i === 0 ? gst("address") : undefined;
                  return (
                    <Card key={i} title={`Address ${i + 1}`} onRemove={p.addresses.length > 1 ? () => set("addresses")(p.addresses.filter((_, j) => j !== i)) : undefined}>
                      <Chips k="address" label="Type" value={a.type} onChange={(v) => set("addresses")(upd(p.addresses, i, { type: v }))} setActive={setActive} options={["Billing", "Shipping", "Godown"].map((v) => ({ v, l: v }))} />
                      <F k="address" label="Address name" value={a.name} onChange={(v) => set("addresses")(upd(p.addresses, i, { name: v }))} setActive={setActive} />
                      <F k="address" label="Line 1" value={a.line1} onChange={(v) => set("addresses")(upd(p.addresses, i, { line1: v }))} setActive={setActive} error={show(`a${i}.line1`)} required hint={fromPortal} />
                      <F k="address" label="Line 2 (optional)" value={a.line2} onChange={(v) => set("addresses")(upd(p.addresses, i, { line2: v }))} setActive={setActive} hint={fromPortal} />
                      <F k="address" label="PIN code" value={a.pin} onChange={(v) => set("addresses")(upd(p.addresses, i, { pin: v }))} setActive={setActive} error={show(`a${i}.pin`)} mono required hint={fromPortal} />
                      <F k="address" label="State" value={pin ? `${stateName(pin.state)} (${pin.state})` : ""} readOnly setActive={setActive} placeholder="Auto from PIN" />
                      <F k="address" label="District" value={pin?.district ?? ""} readOnly setActive={setActive} placeholder="Auto from PIN" />
                      <F k="address" label="City" value={pin?.city ?? ""} readOnly setActive={setActive} placeholder="Auto from PIN" />
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "Licences" && (
            <div className="grid gap-3 sm:grid-cols-3">
              <Chips k="dl" label="Licence form" value={p.dlForm} onChange={set("dlForm")} setActive={setActive} options={["20 / 21", "20B / 21B", "20C / 21C"].map((v) => ({ v, l: v }))} />
              <F k="dl" label="Drug licence nos." value={p.dl} onChange={set("dl")} setActive={setActive} error={show("dl")} mono required />
              <F k="dl" label="Valid to (MM/YYYY)" value={p.dlExpiry} onChange={set("dlExpiry")} setActive={setActive} error={show("dlExpiry")} mono required />
              <F k="fssai" label="FSSAI licence no." value={p.fssai} onChange={set("fssai")} setActive={setActive} error={show("fssai")} mono hint="Only for food / nutraceutical items" />
              <p className="text-[12px] text-ink-4 sm:col-span-2">In MENO each licence is a row with a scan upload, and MENO reminds 30, 15 and 7 days before expiry.</p>
            </div>
          )}

          {tab === "Bank" && (
            <div className="space-y-3">
              <Toggle k="bankOn" label={`Add ${role === "supplier" ? "vendor" : "customer"} bank account?`} hint={role === "supplier" ? "Recommended" : "Optional (refunds)"} value={p.bankOn} onChange={set("bankOn")} setActive={setActive} />
              {p.bankOn && (
                <>
                  <SectionLabel action={<AddButton onClick={() => set("banks")([...p.banks, blankBank("Other")])}>Add bank</AddButton>}>Bank details</SectionLabel>
                  {p.banks.map((b, i) => {
                    const hit = IFSCS[b.ifsc];
                    return (
                      <Card key={i} title={`Bank ${i + 1}`} onRemove={p.banks.length > 1 ? () => set("banks")(p.banks.filter((_, j) => j !== i)) : undefined}>
                        <F k="bankOn" label="IFSC" value={b.ifsc} onChange={(v) => set("banks")(upd(p.banks, i, { ifsc: v }))} setActive={setActive} error={show(`b${i}.ifsc`)} mono upper required hint={hit ? `${hit.bank}, ${hit.branch}` : undefined} />
                        <F k="bankOn" label="Account holder" value={b.holder} onChange={(v) => set("banks")(upd(p.banks, i, { holder: v }))} setActive={setActive} />
                        <F k="bankOn" label="UPI ID" value={b.upi} onChange={(v) => set("banks")(upd(p.banks, i, { upi: v }))} setActive={setActive} error={show(`b${i}.upi`)} mono />
                        <F k="bankOn" label="Account no." value={b.acc} onChange={(v) => set("banks")(upd(p.banks, i, { acc: v }))} setActive={setActive} error={show(`b${i}.acc`)} mono required />
                        <F k="bankOn" label="Confirm account no." value={b.acc2} onChange={(v) => set("banks")(upd(p.banks, i, { acc2: v }))} setActive={setActive} error={show(`b${i}.acc2`)} mono required />
                        <F k="bankOn" label="Bank / branch" value={hit ? `${hit.bank} · ${hit.branch}` : ""} readOnly setActive={setActive} placeholder="Auto from IFSC" />
                      </Card>
                    );
                  })}
                </>
              )}
              <Toggle k="remind" label="Enable payment reminders?" value={p.remind} onChange={set("remind")} setActive={setActive} hint="Due date = bill date + credit days" />
              {p.remind && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <MultiChips k="remind" label="Reminder schedule" value={p.remindAt} onChange={set("remindAt")} setActive={setActive} options={["7 days before due", "On due date", "7 days after due"]} />
                  <MultiChips k="remind" label="Channels" value={p.channels} onChange={set("channels")} setActive={setActive} options={["Email", "WhatsApp", "SMS"]} />
                  {show("remind") && <p className="text-[11.5px] text-critical sm:col-span-2">{show("remind")}</p>}
                </div>
              )}
            </div>
          )}

          {tab === "Income tax" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <F k="pan" label="PAN" value={p.pan} onChange={set("pan")} setActive={setActive} error={show("pan")} mono upper hint={live && p.pan.length === 10 ? `${gst("pan") ? "GSTIN characters 3–12 · " : ""}4th letter ${p.pan[3]} = ${PAN_HOLDER[p.pan[3]] ?? "unknown"}${portal?.ctb ? ` (portal: ${portal.ctb})` : ""}` : undefined} />
              <Toggle k="related" label="Is related party?" value={p.related} onChange={set("related")} setActive={setActive} />
              <Chips k="msme" label={`Is ${role === "supplier" ? "vendor" : "customer"} MSME registered?`} value={p.msme} onChange={set("msme")} setActive={setActive} options={["Not applicable", "Micro", "Small", "Medium"].map((v) => ({ v, l: v }))} />
              {p.msme !== "Not applicable" ? <F k="msme" label="Udyam registration no." value={p.udyam} onChange={set("udyam")} setActive={setActive} error={show("udyam")} mono upper required /> : <span />}
              <Toggle k="tds" label={role === "supplier" ? "TDS applicable (e.g. 194Q)?" : "TCS applicable?"} value={p.tds} onChange={set("tds")} setActive={setActive} hint="Section and rate from the TDS master ⚠" />
            </div>
          )}

          {tab === "GST" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Chips k="gstType" label="GST registration type" value={p.gstType} onChange={set("gstType")} setActive={setActive} options={["Regular", "Composition", "Unregistered (consumer)", "SEZ", "Overseas"].map((v) => ({ v, l: v }))} />
              </div>
              <Chips k="rateMode" label="Rates on their bills" value={p.rateMode} onChange={set("rateMode")} setActive={setActive} options={["Exclusive of GST", "Inclusive of GST"].map((v) => ({ v, l: v }))} />
              <F k="gstType" label="GST status" value={p.gstStatus || (p.gstin ? "Not fetched" : "Unregistered")} readOnly setActive={setActive} />
              <F k="gstType" label="Place of supply (our shop is in Tamil Nadu, 33)" value={state ? `${stateName(state)} (${state}) → ${state === "33" ? "CGST + SGST" : "IGST"}` : "Add a billing PIN"} readOnly setActive={setActive} />
              {live && portal && (
                <div className="rounded-tile bg-side p-3 sm:col-span-2">
                  <p className="mb-2 text-[12px] font-semibold text-ink-2">From the GST portal (read-only, kept with the party for audit)</p>
                  <dl className="grid gap-x-4 gap-y-1.5 text-[12.5px] sm:grid-cols-2">
                    {[
                      ["Registration type", portal.dty],
                      ["GST status", portal.sts],
                      ["Registration date", portal.rgdt?.replaceAll("/", "-")],
                      ["Cancelled on", portal.cxdt?.replaceAll("/", "-") || "—"],
                      ["Constitution of business", portal.ctb],
                      ["E-invoice enabled", portal.einvoiceStatus],
                      ["Nature of business", portal.nba?.join(", ")],
                      ["Principal address", portal.principal_address],
                      ["State jurisdiction", portal.stj],
                      ["Centre jurisdiction", portal.ctj],
                    ].map(([k, v]) => (
                      <div key={k} className="min-w-0">
                        <dt className="text-[11.5px] text-ink-4">{k}</dt>
                        <dd className="break-words text-ink-2">{v || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                  <button onClick={() => setShowJson((x) => !x)} className="mt-2 text-[12px] text-ink-3 underline hover:text-ink">
                    {showJson ? "Hide" : "Show"} the raw response
                  </button>
                  {showJson && <pre className="mt-2 max-h-72 overflow-auto rounded-tile bg-sunken p-3 font-mono text-[11.5px] leading-relaxed text-ink">{JSON.stringify(portal, null, 2)}</pre>}
                </div>
              )}
              {["Composition", "Unregistered (consumer)"].includes(p.gstType) && role === "supplier" && <p className="text-[12px] text-ink-3">No input tax credit on this supplier&apos;s bills.</p>}
            </div>
          )}

          {tab === "Patient" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <F k="patient" label="Date of birth" value={p.dob} onChange={set("dob")} setActive={setActive} mono placeholder="DD/MM/YYYY" />
              <Chips k="patient" label="Gender" value={p.gender} onChange={set("gender")} setActive={setActive} options={["Female", "Male", "Other"].map((v) => ({ v, l: v }))} />
              <F k="patient" label="Allergies" value={p.allergies} onChange={set("allergies")} setActive={setActive} hint="Shown as a warning at POS" />
              <F k="patient" label="Chronic conditions" value={p.conditions} onChange={set("conditions")} setActive={setActive} hint="Drives refill reminders" />
            </div>
          )}

          {tab === "Others" && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle k="both" label={`Also used as ${role === "supplier" ? "customer" : "supplier"}`} value={p.both} onChange={set("both")} setActive={setActive} />
                <Toggle k="active" label="Active" value={p.active} onChange={set("active")} setActive={setActive} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <F k="transporter" label="Transporter" value={p.transporter} onChange={set("transporter")} setActive={setActive} hint="From the transporter master" />
                <F k="disc" label="Discount %" value={p.disc} onChange={set("disc")} setActive={setActive} error={show("disc")} mono />
                <F k="disc" label="Cash discount %" value={p.cashDisc} onChange={set("cashDisc")} setActive={setActive} error={show("cashDisc")} mono />
                <F k="disc" label="Special discount %" value={p.specialDisc} onChange={set("specialDisc")} setActive={setActive} error={show("specialDisc")} mono />
                <F k="agent" label={role === "supplier" ? "Agent" : "Salesman"} value={p.agent} onChange={set("agent")} setActive={setActive} />
                <F k="agent" label="Commission %" value={p.agentComm} onChange={set("agentComm")} setActive={setActive} error={show("agentComm")} mono />
                <F k="credit" label="Credit limit (₹)" value={p.creditLimit} onChange={set("creditLimit")} setActive={setActive} error={show("creditLimit")} mono />
                <F k="credit" label="Credit days" value={p.creditDays} onChange={set("creditDays")} setActive={setActive} error={show("creditDays")} mono />
                <F k="interest" label="Interest on overdue %" value={p.interest} onChange={set("interest")} setActive={setActive} error={show("interest")} mono />
                <Chips k="interest" label="Interest basis" value={p.interestBasis} onChange={set("interestBasis")} setActive={setActive} options={["Simple, 365-day year", "Simple, 360-day year", "Compound monthly"].map((v) => ({ v, l: v }))} />
                <F k="opening" label={`Opening balance (₹, ${role === "supplier" ? "Cr" : "Dr"})`} value={p.opening} onChange={set("opening")} setActive={setActive} error={show("opening")} mono />
              </div>
            </div>
          )}

          {warn.length > 0 && (
            <div className="at-amber tint mt-3 rounded-ctl px-3 py-2 text-[12px]">
              {warn.map((w) => (
                <p key={w}>⚠ {w}</p>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SaveButton label={role === "supplier" ? "Save vendor" : "Save customer"} onClick={save} />
            {tried && !ok && <span className="text-[12.5px] text-critical">Fix the fields on the tabs marked with a red dot. The server checks them again.</span>}
          </div>
        </Screen>
        <FieldGuide guide={guide} active={active} onPick={setActive} tab={tab} />
      </div>
      {saved && (
        <SavedNote>
          <b className="text-ink">{saved.name}</b> is saved with its contacts, addresses{role === "supplier" ? ", licence, bank account and MSME details" : ""}. A ledger was created under <b className="text-ink">{role === "supplier" ? "Sundry Creditors" : "Sundry Debtors"}</b>. Every field is audited.{" "}
          {saved.state === "33" ? "Same state as our shop: CGST + SGST." : "Different state from our shop: IGST."}
        </SavedNote>
      )}
      {onNext && <NextBar
        onBack={onBack}
        onNext={onNext}
        canNext={!!saved}
        nextLabel={role === "supplier" ? "Add a customer" : "Open the ledgers"}
        note={
          saved
            ? role === "supplier"
              ? "Now the people we sell to: add a customer."
              : "See where money is recorded: the chart of accounts."
            : "Walk every tab, then Save. Try Fetch with a cancelled GSTIN, a wrong PIN or mismatched account numbers."
        }
      />}
    </div>
  );
}

/* ---------- Product form ---------- */

type ProductForm = {
  code: string;
  name: string;
  printName: string;
  dept: string;
  brand: string;
  mfr: string;
  category: string;
  nature: string;
  uom: string;
  shelfLife: string;
  barcode: string;
  barcodeOn: boolean;
  batchOn: boolean;
  active: boolean;
  remarks: string;
  salt: string;
  form: string;
  pack: string;
  schedule: string;
  storage: string;
  rack: string;
  hsn: string;
  mrp: string;
  discReceived: string;
  salesPrice: string;
  discAllowed: string;
  maxDisc: string;
  minMarkup: string;
  maxMarkup: string;
  commission: string;
  minQty: string;
  maxQty: string;
  reorderQty: string;
  leadTime: string;
  inWh: string;
  outWh: string;
  vendor: string;
};

const PRODUCT_DEFAULT: ProductForm = {
  code: "",
  name: "Cetirest 10 Tablet",
  printName: "Cetirest 10",
  dept: "Pharma",
  brand: "Cetirest",
  mfr: "Demo Pharma Ltd.",
  category: "Anti-allergic",
  nature: "Finished goods",
  uom: "Strip of 10 tablets",
  shelfLife: "24",
  barcode: "8900000000042",
  barcodeOn: true,
  batchOn: true,
  active: true,
  remarks: "",
  salt: "Cetirizine 10 mg",
  form: "Tablet",
  pack: "1×10",
  schedule: "OTC",
  storage: "Below 25 °C",
  rack: "R2-S4",
  hsn: "3004",
  mrp: "22.00",
  discReceived: "20",
  salesPrice: "22.00",
  discAllowed: "5",
  maxDisc: "8",
  minMarkup: "10",
  maxMarkup: "40",
  commission: "1",
  minQty: "10",
  maxQty: "60",
  reorderQty: "30",
  leadTime: "2",
  inWh: "Main store",
  outWh: "Counter shelf",
  vendor: "",
};

const PRODUCT_GUIDE: Guide = {
  code: { tab: "Details", label: "Product code", what: "Short code for search.", rule: "Auto from the series if blank; unique.", why: "Fast lookup at the counter." },
  name: { tab: "Details", label: "Product name", what: "Brand name with strength and form.", rule: "1–200 characters; duplicates checked.", why: "What the pharmacist searches and the bill prints." },
  printName: { tab: "Details", label: "Print name", what: "Short name for thermal bills.", rule: "Defaults to the product name.", why: "Narrow paper." },
  dept: { tab: "Details", label: "Department", what: "Pharma, OTC, surgical, FMCG, cosmetics, Ayurveda.", rule: "From the API. Pharma items are always batch- and expiry-tracked.", why: "Non-pharma items have their own GST and rules." },
  brand: { tab: "Details", label: "Brand / manufacturer", what: "Brand and the company that makes or markets it.", rule: "From the brand and manufacturer masters.", why: "Company-wise discounts, returns and reports." },
  category: { tab: "Details", label: "Category / therapeutic class", what: "Two-level tree, e.g. Anti-allergic → Antihistamine.", rule: "From the category master.", why: "Category reports and discount rules." },
  nature: { tab: "Details", label: "Nature of product", what: "Finished goods, consumable, service or asset.", rule: "Services keep no stock.", why: "Decides stock and accounting treatment." },
  uom: { tab: "Details", label: "Unit and conversion", what: "Pack and loose unit, e.g. strip of 10 tablets.", rule: "From the unit master; conversion > 0.", why: "Loose sale of tablets from a strip." },
  shelfLife: { tab: "Details", label: "Shelf life", what: "Typical life from manufacture, in months.", rule: "Whole number; batch expiry is entered at purchase.", why: "Flags an expiry that looks wrong." },
  barcode: { tab: "Details", label: "Barcode", what: "EAN-8 / UPC-12 / EAN-13 on the pack.", rule: "8, 12 or 13 digits; unique per tenant.", why: "Barcode-first billing." },
  batchOn: { tab: "Details", label: "Batch / active", what: "Batch tracking and active status.", rule: "Always on for pharma; inactive items can't be billed.", why: "Recalls and expiry are by batch." },
  salt: { tab: "Pharmacy", label: "Composition", what: "Salts and strength.", rule: "From the salt master; required for pharma.", why: "Substitutes and search by salt." },
  form: { tab: "Pharmacy", label: "Dosage form / pack", what: "Tablet, syrup… and pack like 1×10.", rule: "From the API.", why: "Printed on the bill; pack drives quantity." },
  schedule: { tab: "Pharmacy", label: "Schedule", what: "OTC, H, H1, X, G or NDPS.", rule: "From the schedule master; H/H1/X need a prescription at POS.", why: "Legal requirement." },
  storage: { tab: "Pharmacy", label: "Storage", what: "Below 25 °C, 2–8 °C (cold chain)…", rule: "From the API.", why: "Cold-chain items are checked at GRN." },
  rack: { tab: "Pharmacy", label: "Rack location", what: "Where it sits in this branch.", rule: "Per branch.", why: "Find it in seconds." },
  hsn: { tab: "Pricing & tax", label: "HSN → GST %", what: "Tax code; the GST rate comes from it.", rule: "4/6/8 digits; must exist in the HSN table for the date. GST % is never typed.", why: "One wrong rate = wrong tax on every bill." },
  mrp: { tab: "Pricing & tax", label: "MRP", what: "Default MRP for new batches.", rule: "> 0; each batch keeps its own MRP from purchase.", why: "We never sell above MRP." },
  discReceived: { tab: "Pricing & tax", label: "Discount received %", what: "Usual margin the supplier gives off MRP.", rule: "0–100. Suggested purchase rate = MRP ex-GST × (1 − discount) ⚠ trade convention; the supplier's bill wins.", why: "Pre-fills purchase entry and checks it." },
  salesPrice: { tab: "Pricing & tax", label: "Sales price", what: "Default selling price.", rule: "≤ MRP (hard rule).", why: "Counter price when no discount." },
  maxDisc: { tab: "Pricing & tax", label: "Discount allowed / max discount", what: "Default and maximum discount for this item.", rule: "Allowed ≤ max ≤ 100. At POS the lower of item max and role cap wins.", why: "Stops margin leakage on low-margin items." },
  markup: { tab: "Pricing & tax", label: "Min / max mark-up", what: "Margin band over cost.", rule: "Min ≤ max. Warn below cost + min mark-up; block below cost ⚠ policy.", why: "Protects profit on every line." },
  commission: { tab: "Pricing & tax", label: "Product commission", what: "Incentive per item for salesmen.", rule: "0–100%.", why: "Commission reports." },
  stock: { tab: "Stock & warehouse", label: "Min / max / reorder", what: "Stock levels per branch.", rule: "Min ≤ reorder ≤ max.", why: "Low-stock alerts and purchase suggestions." },
  leadTime: { tab: "Stock & warehouse", label: "Lead time", what: "Days the supplier takes to deliver.", rule: "0–365.", why: "Reorder before you run out." },
  warehouse: { tab: "Stock & warehouse", label: "Default warehouses", what: "Where purchases land and sales are taken from.", rule: "Only when multi-warehouse is on.", why: "Right shelf, fewer transfers." },
  vendor: { tab: "Stock & warehouse", label: "Preferred vendor", what: "First choice for orders.", rule: "From the supplier master, ranked.", why: "Purchase orders pre-fill the vendor." },
};

const PRODUCT_TABS = ["Details", "Pharmacy", "Pricing & tax", "Stock & warehouse"];

export function ProductStep({
  meds,
  vendorName,
  onSave,
  onBack,
  onNext,
}: {
  meds: Med[];
  vendorName?: string;
  onSave: (m: Med) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const saved = meds.find((x) => x.id === "p1");
  const [p, setP] = useState<ProductForm>({ ...PRODUCT_DEFAULT, vendor: vendorName ?? "" });
  const [tab, setTab] = useState("Details");
  const [active, setActive] = useState("name");
  const [tried, setTried] = useState(false);
  const set = <K extends keyof ProductForm>(k: K) => (v: ProductForm[K]) => setP((x) => ({ ...x, [k]: v }));
  const pharma = p.dept === "Pharma";
  const hsn = HSNS.find((h) => h.code === p.hsn);

  // Suggested purchase rate (ex-GST) and margin: derived, never typed.
  const amt = (v: string) => (RX.amount.test(v) ? m(v) : 0n);
  const mrp = amt(p.mrp);
  const gst = m(hsn?.gst ?? "0");
  // Money is scaled ×10 000, so 100 % = 1 000 000.
  const exGst = mrp ? (mrp * 1000000n) / (1000000n + gst) : 0n;
  const ptr = RX.pct.test(p.discReceived) ? (exGst * (10000n - m(p.discReceived) / 100n)) / 10000n : exGst;
  const salesEx = amt(p.salesPrice) ? (amt(p.salesPrice) * 1000000n) / (1000000n + gst) : 0n;
  const markup = ptr ? Number(((salesEx - ptr) * 10000n) / ptr) / 100 : 0;

  const e: Record<string, string | undefined> = {};
  const tabOf: Record<string, string> = {};
  const err = (k: string, t: string, msg?: string) => {
    if (msg) {
      e[k] = msg;
      tabOf[k] = t;
    }
  };
  err("name", "Details", p.name.trim() ? undefined : "Product name is required.");
  err("barcode", "Details", p.barcodeOn && !RX.barcode.test(p.barcode) ? "8, 12 or 13 digits." : meds.some((x) => x.barcode === p.barcode && x.id !== "p1") ? "Barcode already used by another item." : undefined);
  err("shelfLife", "Details", p.shelfLife && !/^\d{1,3}$/.test(p.shelfLife) ? "Months, whole number." : undefined);
  err("salt", "Pharmacy", pharma && !p.salt.trim() ? "Composition is required for pharma items." : undefined);
  err("hsn", "Pricing & tax", hsn ? undefined : "Pick an HSN code.");
  err("mrp", "Pricing & tax", mrp > 0n ? undefined : "MRP must be above 0.");
  err("salesPrice", "Pricing & tax", !RX.amount.test(p.salesPrice) ? "Amount like 22.00" : amt(p.salesPrice) > mrp ? "Sales price can't be above MRP." : undefined);
  for (const [k, label] of [["discReceived", "Discount received"], ["discAllowed", "Discount allowed"], ["maxDisc", "Maximum discount"], ["minMarkup", "Min mark-up"], ["maxMarkup", "Max mark-up"], ["commission", "Commission"]] as const) err(k, "Pricing & tax", pctError(p[k], label));
  if (!e.discAllowed && !e.maxDisc && Number(p.discAllowed) > Number(p.maxDisc)) err("maxDisc", "Pricing & tax", "Maximum discount must be ≥ discount allowed.");
  if (!e.minMarkup && !e.maxMarkup && Number(p.minMarkup) > Number(p.maxMarkup)) err("maxMarkup", "Pricing & tax", "Max mark-up must be ≥ min mark-up.");
  const q = (v: string) => (/^\d{1,6}$/.test(v) ? Number(v) : NaN);
  if ([p.minQty, p.reorderQty, p.maxQty].some((v) => Number.isNaN(q(v)))) err("stock", "Stock & warehouse", "Whole numbers.");
  else if (!(q(p.minQty) <= q(p.reorderQty) && q(p.reorderQty) <= q(p.maxQty))) err("stock", "Stock & warehouse", "Need min ≤ reorder ≤ max.");
  err("leadTime", "Stock & warehouse", /^\d{1,3}$/.test(p.leadTime) && Number(p.leadTime) <= 365 ? undefined : "0 to 365 days.");
  const ok = Object.values(e).every((x) => !x);
  const show = (k: string) => (tried ? e[k] : undefined);
  const tabErrors = tried ? Object.fromEntries(Object.values(tabOf).map((t) => [t, true])) : {};
  const markupWarn = !e.minMarkup && ptr > 0n && markup < Number(p.minMarkup || "0");

  const save = () => {
    setTried(true);
    if (!ok) return setTab(tabOf[Object.keys(tabOf)[0]]);
    onSave({
      id: "p1",
      name: p.name.trim(),
      pack: p.pack,
      hsn: p.hsn,
      gstPct: hsn!.gst,
      schedule: p.schedule,
      barcode: p.barcode,
      salt: p.salt,
      mfr: p.mfr,
      maxDisc: p.maxDisc || "0",
      mrp: p.mrp,
      ptr: fmt(ptr).replace(/,/g, ""),
      reorder: p.reorderQty,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Screen route="/masters/items/new" title="New product" actions={<Kbd>N M</Kbd>}>
          <Tabs tabs={PRODUCT_TABS} active={tab} onChange={setTab} errors={tabErrors} />
          {tab === "Details" && (
            <div className="grid gap-3 sm:grid-cols-3">
              <F k="code" label="Product code" value={p.code} onChange={set("code")} setActive={setActive} placeholder="Auto: P-0004" mono />
              <F k="name" label="Product name" value={p.name} onChange={set("name")} setActive={setActive} error={show("name")} required />
              <F k="printName" label="Print name" value={p.printName} onChange={set("printName")} setActive={setActive} />
              <div className="sm:col-span-3">
                <Chips k="dept" label="Department" value={p.dept} onChange={(v) => setP((x) => ({ ...x, dept: v, batchOn: v === "Pharma" ? true : x.batchOn }))} setActive={setActive} options={["Pharma", "OTC", "Surgical", "FMCG", "Cosmetics", "Ayurveda"].map((v) => ({ v, l: v }))} />
              </div>
              <F k="brand" label="Brand" value={p.brand} onChange={set("brand")} setActive={setActive} />
              <F k="brand" label="Manufacturer / marketer" value={p.mfr} onChange={set("mfr")} setActive={setActive} />
              <F k="category" label="Category / class" value={p.category} onChange={set("category")} setActive={setActive} />
              <F k="uom" label="Unit and conversion" value={p.uom} onChange={set("uom")} setActive={setActive} />
              <Chips k="nature" label="Nature of product" value={p.nature} onChange={set("nature")} setActive={setActive} options={["Finished goods", "Consumable", "Service"].map((v) => ({ v, l: v }))} />
              <F k="shelfLife" label="Shelf life (months)" value={p.shelfLife} onChange={set("shelfLife")} setActive={setActive} error={show("shelfLife")} mono />
              <F k="barcode" label="Barcode" value={p.barcode} onChange={set("barcode")} setActive={setActive} error={show("barcode")} mono />
              <F k="code" label="Remarks" value={p.remarks} onChange={set("remarks")} setActive={setActive} />
              <span />
              <Toggle k="barcode" label="Barcode" value={p.barcodeOn} onChange={set("barcodeOn")} setActive={setActive} />
              <Toggle k="batchOn" label="Batch enabled" value={p.batchOn} onChange={set("batchOn")} setActive={setActive} disabled={pharma} hint={pharma ? "Always on for pharma" : undefined} />
              <Toggle k="batchOn" label="Active" value={p.active} onChange={set("active")} setActive={setActive} />
            </div>
          )}
          {tab === "Pharmacy" && (
            <div className="grid gap-3 sm:grid-cols-3">
              <F k="salt" label="Composition (salt + strength)" value={p.salt} onChange={set("salt")} setActive={setActive} error={show("salt")} required={pharma} />
              <F k="form" label="Dosage form" value={p.form} onChange={set("form")} setActive={setActive} />
              <F k="form" label="Pack" value={p.pack} onChange={set("pack")} setActive={setActive} mono />
              <div className="sm:col-span-3">
                <Chips k="schedule" label="Schedule" value={p.schedule} onChange={set("schedule")} setActive={setActive} options={["OTC", "H", "H1", "X", "G"].map((v) => ({ v, l: v }))} />
              </div>
              <Chips k="storage" label="Storage" value={p.storage} onChange={set("storage")} setActive={setActive} options={["Below 25 °C", "2–8 °C (cold chain)", "Below 30 °C"].map((v) => ({ v, l: v }))} />
              <F k="rack" label="Rack location (this branch)" value={p.rack} onChange={set("rack")} setActive={setActive} mono />
              <p className="text-[12px] text-ink-4">{p.schedule === "OTC" ? "No prescription needed at POS." : `Schedule ${p.schedule}: POS asks for doctor and prescription (F4).`}</p>
            </div>
          )}
          {tab === "Pricing & tax" && (
            <div className="space-y-3">
              <Chips k="hsn" label="HSN code → GST % (illustrative)" value={p.hsn} onChange={set("hsn")} setActive={setActive} options={HSNS.map((h) => ({ v: h.code, l: `${h.label} → ${h.gst}%` }))} />
              {show("hsn") && <p className="text-[11.5px] text-critical">{show("hsn")}</p>}
              <div className="grid gap-3 sm:grid-cols-4">
                <F k="mrp" label="MRP (₹)" value={p.mrp} onChange={set("mrp")} setActive={setActive} error={show("mrp")} mono required />
                <F k="discReceived" label="Discount received %" value={p.discReceived} onChange={set("discReceived")} setActive={setActive} error={show("discReceived")} mono />
                <F k="discReceived" label="Purchase rate (ex-GST)" value={fmt(ptr)} readOnly setActive={setActive} mono hint="Auto: MRP ÷ (1 + GST) × (1 − disc.)" />
                <F k="discReceived" label="Landing cost" value={fmt(ptr)} readOnly setActive={setActive} mono hint="+ freight share − free goods" />
                <F k="salesPrice" label="Sales price (₹, incl. GST)" value={p.salesPrice} onChange={set("salesPrice")} setActive={setActive} error={show("salesPrice")} mono />
                <F k="maxDisc" label="Discount allowed %" value={p.discAllowed} onChange={set("discAllowed")} setActive={setActive} error={show("discAllowed")} mono />
                <F k="maxDisc" label="Maximum discount %" value={p.maxDisc} onChange={set("maxDisc")} setActive={setActive} error={show("maxDisc")} mono />
                <F k="commission" label="Product commission %" value={p.commission} onChange={set("commission")} setActive={setActive} error={show("commission")} mono />
                <F k="markup" label="Min mark-up %" value={p.minMarkup} onChange={set("minMarkup")} setActive={setActive} error={show("minMarkup")} mono />
                <F k="markup" label="Max mark-up %" value={p.maxMarkup} onChange={set("maxMarkup")} setActive={setActive} error={show("maxMarkup")} mono />
                <F k="markup" label="Mark-up at sales price" value={`${markup.toFixed(2)} %`} readOnly setActive={setActive} mono />
              </div>
              {markupWarn && <p className="at-amber tint rounded-ctl px-3 py-2 text-[12px]">⚠ Mark-up at the sales price is below the minimum: MENO warns at billing.</p>}
            </div>
          )}
          {tab === "Stock & warehouse" && (
            <div className="grid gap-3 sm:grid-cols-4">
              <F k="stock" label="Minimum stock" value={p.minQty} onChange={set("minQty")} setActive={setActive} error={show("stock")} mono />
              <F k="stock" label="Reorder quantity" value={p.reorderQty} onChange={set("reorderQty")} setActive={setActive} mono />
              <F k="stock" label="Maximum stock" value={p.maxQty} onChange={set("maxQty")} setActive={setActive} mono />
              <F k="leadTime" label="Lead time (days)" value={p.leadTime} onChange={set("leadTime")} setActive={setActive} error={show("leadTime")} mono />
              <F k="warehouse" label="In warehouse (purchase, sales return)" value={p.inWh} onChange={set("inWh")} setActive={setActive} />
              <F k="warehouse" label="Out warehouse (sale, purchase return)" value={p.outWh} onChange={set("outWh")} setActive={setActive} />
              <F k="vendor" label="Preferred vendor" value={p.vendor} onChange={set("vendor")} setActive={setActive} placeholder="Save a vendor first" />
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SaveButton label="Save product" onClick={save} />
            {tried && !ok && <span className="text-[12.5px] text-critical">Fix the fields on the tabs marked with a red dot.</span>}
          </div>
          <p className="mt-3 text-[12px] text-ink-4">The other three demo medicines are already in the master. Batch, expiry and the batch MRP are not here: they come from the purchase entry.</p>
        </Screen>
        <FieldGuide guide={PRODUCT_GUIDE} active={active} onPick={setActive} tab={tab} />
      </div>
      {saved && (
        <SavedNote>
          <b className="text-ink">{saved.name}</b> is in the master (HSN {saved.hsn}, GST {saved.gstPct}%, schedule {saved.schedule}). It has no stock yet: the purchase brings its first batch.
        </SavedNote>
      )}
      <NextBar onBack={onBack} onNext={onNext} canNext={!!saved} nextLabel="Buy stock" note={saved ? "Enter a purchase bill from the vendor, including the new product." : "Walk the four tabs and save the product. Try a sales price above MRP or max discount below the allowed discount."} />
    </div>
  );
}
