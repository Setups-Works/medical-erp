/**
 * MSW handlers for the MENO staff realm (ADR-0020) and /platform/reference-data (PLT-22). Local dev and e2e only.
 * Same paths, codes and rules as meno-api's platform module; the CSV check is simplified (header + row count).
 * Fake staff account: admin@meno.test / platform-pass-12.
 */
import { http, HttpResponse } from "msw";

const API = "*/api/v1";
const KEY = "meno.mock-platform.v1";
const STAFF = { id: "0192f3a4-0000-7000-8000-000000000001", email: "admin@meno.test", fullName: "MENO Admin", password: "platform-pass-12", permissions: ["platform.reference.manage", "platform.reference.view"] };

type Dataset = {
  code: string; name: string; description: string; sourceName: string; sourceUrl?: string; licence: string; attribution?: string;
  refreshMonths: number; ownerModule: string; phase: string; loadable: boolean; rowCount: number; sourceDate?: string; loadedAt?: string; loadedByName?: string; onlineLookup?: string;
};
type Load = {
  id: string; datasetCode: string; status: "LOADED" | "REJECTED"; fileName: string; fileSha256: string; fileBytes: number; sourceDate: string;
  rowsRead: number; rowsLoaded: number; rowsSkipped: number; reasonCode?: string; replacedAnyway: boolean; loadedByName: string;
  startedAt: string; finishedAt: string; problems: { line: number; reason: string }[]; skippedByReason: Record<string, number>;
};
type State = { datasets: Dataset[]; loads: Load[]; sessions: string[] };

const SEED: Dataset[] = [
  { code: "PINCODE", name: "PIN codes", description: "PIN code to state, district and post-office localities. Fills addresses.", sourceName: "India Post, All India Pincode Directory (data.gov.in)", sourceUrl: "https://data.gov.in/catalog/all-india-pincode-directory", licence: "Government Open Data License – India", attribution: "Contains data from India Post, published on data.gov.in under GODL-India.", refreshMonths: 12, ownerModule: "platform", phase: "P2", loadable: true, rowCount: 0, onlineLookup: "postalpincode" },
  { code: "IFSC", name: "IFSC codes", description: "IFSC to bank, branch and address. Fills bank account details.", sourceName: "Reserve Bank of India, NEFT / RTGS bank branch lists", sourceUrl: "https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=2009", licence: "RBI public list; redistribution terms to confirm (R-30)", attribution: "Bank branch data from the Reserve Bank of India.", refreshMonths: 1, ownerModule: "platform", phase: "P2", loadable: true, rowCount: 0 },
  { code: "HSN", name: "HSN codes and GST rates", description: "HSN / SAC codes with their GST rates, effective-dated.", sourceName: "CBIC GST rate notifications", licence: "Government notification (public)", refreshMonths: 3, ownerModule: "taxation", phase: "P3", loadable: false, rowCount: 0 },
  { code: "CEILING_PRICE", name: "Ceiling prices", description: "NPPA / DPCO ceiling prices for scheduled formulations.", sourceName: "NPPA price notifications", licence: "Government notification (public)", refreshMonths: 1, ownerModule: "compliance", phase: "P4", loadable: false, rowCount: 0 },
  { code: "BANNED_DRUG", name: "Banned drugs", description: "Banned fixed-dose combinations and recalls (section 26A).", sourceName: "CDSCO banned FDC list and e-Gazette notifications", licence: "Government notification (public)", refreshMonths: 1, ownerModule: "compliance", phase: "P4", loadable: false, rowCount: 0 },
];
const REQUIRED: Record<string, string[][]> = {
  PINCODE: [["pincode", "pin"], ["district", "districtname"], ["statename", "state"]],
  IFSC: [["ifsc", "ifsccode"], ["bank", "bankname"], ["branch", "branchname"]],
};

function load(): State {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    // Private mode / blocked storage: start fresh.
  }
  return { datasets: structuredClone(SEED), loads: [], sessions: [] };
}
function save(s: State) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Not persisted; fine for a mock.
  }
}
function problem(status: number, code: string, detail: string, extra: Record<string, unknown> = {}) {
  return HttpResponse.json({ title: "Error", status, detail, code, ...extra }, { status, headers: { "Content-Type": "application/problem+json" } });
}
const staffToken = (request: Request) => {
  const t = (request.headers.get("Authorization") ?? "").replace(/^Bearer /, "");
  return t.startsWith("mock-platform.") && load().sessions.includes(t) ? t : null;
};
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const addMonths = (iso: string, m: number) => {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + m);
  return d.toISOString().slice(0, 10);
};
const view = (d: Dataset) => {
  const dueOn = d.loadedAt ? addMonths(d.loadedAt, d.refreshMonths) : undefined;
  const status = !d.loadable ? "LATER" : !d.loadedAt ? "NOT_LOADED" : today() < dueOn! ? "CURRENT" : "DUE";
  return { ...d, status, dueOn };
};
const key = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

export const platformHandlers = [
  http.post(`${API}/platform/auth/login`, async ({ request }) => {
    const b = (await request.json()) as { email?: string; password?: string };
    if (String(b.email ?? "").trim().toLowerCase() !== STAFF.email || b.password !== STAFF.password)
      return problem(401, "PLATFORM_INVALID_CREDENTIALS", "Email or password is wrong.");
    const s = load();
    const accessToken = `mock-platform.${crypto.randomUUID()}`;
    s.sessions.push(accessToken);
    save(s);
    const { password: _p, ...staff } = STAFF;
    return HttpResponse.json({ accessToken, tokenType: "Bearer", expiresIn: 3600, expiresAt: new Date(Date.now() + 3_600_000).toISOString(), staff });
  }),
  http.get(`${API}/platform/auth/me`, ({ request }) => {
    if (!staffToken(request)) return new HttpResponse(null, { status: 401 });
    const { password: _p, ...staff } = STAFF;
    return HttpResponse.json(staff);
  }),
  http.get(`${API}/platform/reference-data`, ({ request }) => {
    if (!staffToken(request)) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({ items: load().datasets.map(view) });
  }),
  http.get(`${API}/platform/reference-data/:code/loads`, ({ request, params }) => {
    if (!staffToken(request)) return new HttpResponse(null, { status: 401 });
    const s = load();
    if (!s.datasets.some((d) => d.code === params.code)) return problem(404, "REFERENCE_DATASET_NOT_FOUND", "There is no such reference list.");
    return HttpResponse.json({ items: s.loads.filter((l) => l.datasetCode === params.code).slice(0, 20) });
  }),
  http.post(`${API}/platform/reference-data/:code/loads`, async ({ request, params }) => {
    if (!staffToken(request)) return new HttpResponse(null, { status: 401 });
    const s = load();
    const d = s.datasets.find((x) => x.code === params.code);
    if (!d) return problem(404, "REFERENCE_DATASET_NOT_FOUND", "There is no such reference list.");
    if (!d.loadable) return problem(409, "REFERENCE_DATASET_NOT_LOADABLE", `${d.name} is loaded by the ${d.ownerModule} module from ${d.phase}.`);
    const url = new URL(request.url);
    const sourceDate = url.searchParams.get("sourceDate") ?? "";
    const anyway = url.searchParams.get("replaceAnyway") === "true";
    if (sourceDate > today()) return problem(400, "REFERENCE_SOURCE_DATE_FUTURE", "The file's date can't be in the future.");
    const file = (await request.formData()).get("file");
    if (!(file instanceof File) || file.size === 0) return problem(400, "REFERENCE_FILE_EMPTY", "The file is empty.");
    const lines = (await file.text()).split(/\r?\n/).filter((l) => l.trim());
    const header = (lines[0] ?? "").split(",").map(key);
    const base = { id: crypto.randomUUID(), datasetCode: d.code, fileName: file.name, fileSha256: "0".repeat(64), fileBytes: file.size, sourceDate, rowsRead: Math.max(lines.length - 1, 0), replacedAnyway: anyway, loadedByName: STAFF.fullName, startedAt: new Date().toISOString(), finishedAt: new Date().toISOString(), problems: [], skippedByReason: {} };
    const reject = (status: number, code: string, detail: string, extra: Record<string, unknown> = {}) => {
      s.loads.unshift({ ...base, status: "REJECTED", rowsLoaded: 0, rowsSkipped: 0, reasonCode: code });
      save(s);
      return problem(status, code, detail, extra);
    };
    const missing = (REQUIRED[d.code] ?? []).filter((names) => !names.some((n) => header.includes(n))).map((n) => n[0]!);
    if (missing.length) return reject(400, "REFERENCE_FILE_COLUMNS_MISSING", `The file has no ${missing.join(", ")} column. Upload the CSV as the source publishes it.`, { missingColumns: missing });
    const rows = lines.length - 1;
    if (rows === 0) return reject(400, "REFERENCE_FILE_NO_ROWS", "No usable rows in the file.");
    if (!anyway && rows < d.rowCount * 0.5)
      return reject(409, "REFERENCE_LOAD_SHRINKS", `This file has ${rows} rows but the list has ${d.rowCount} today. Check it is the full file, or replace anyway.`, { rowsInFile: rows, rowsToday: d.rowCount });
    const loaded: Load = { ...base, status: "LOADED", rowsLoaded: rows, rowsSkipped: 0 };
    s.loads.unshift(loaded);
    Object.assign(d, { rowCount: rows, sourceDate, loadedAt: loaded.finishedAt, loadedByName: STAFF.fullName });
    save(s);
    return HttpResponse.json(loaded, { status: 201 });
  }),
];
