/**
 * Mock backend state for MSW, kept in sessionStorage so a reload resumes where you were (like the real API).
 * Only fake data: never put real customer or patient details here (AGENTS.md §9).
 */
type Licence = { number: string; validTo?: string };

export type MockTenant = {
  id: string;
  name: string;
  stateCode: string;
  business?: Record<string, string>;
  company?: Record<string, string | undefined>;
  licences: Record<string, Licence>;
  pharmacist?: { pharmacistName: string; pharmacistRegNo: string; pharmacistCouncilState: string };
  branches: { id: string; headOffice: boolean; details: Record<string, string | undefined> }[];
  books?: { financialYearStart: string; financialYearEnd: string; booksStartDate: string; label: string };
  settings: Record<string, string>;
  progress: Record<string, "DONE" | "SKIPPED">;
  live: boolean;
  goLiveDate?: string;
};

export type MockUser = {
  id: string;
  tenantId: string;
  email: string;
  password: string;
  fullName: string;
  mobile: string;
  roles: string[];
  emailVerified: boolean;
  mobileVerified: boolean;
};

type State = {
  users: MockUser[];
  tenants: Record<string, MockTenant>;
  /** Stands in for the HttpOnly meno_refresh cookie. */
  sessionUserId: string | null;
  idempotency: Record<string, string>;
  usedInvites: string[];
};

const KEY = "meno.mock-db.v1";

function empty(): State {
  return { users: [], tenants: {}, sessionUserId: null, idempotency: {}, usedInvites: [] };
}

function load(): State {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as State) : empty();
  } catch {
    return empty();
  }
}

let state: State | null = null;

export const db = {
  get(): State {
    state ??= load();
    return state;
  },
  save() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(db.get()));
    } catch {
      /* storage full or blocked: the mock keeps working in memory */
    }
  },
  reset() {
    state = empty();
    db.save();
  },
};

export const newId = () => crypto.randomUUID();
