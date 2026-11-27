/**
 * MSW handlers. `builtHandlers` imitate meno-api as built on feature/7-tenancy-onboarding (same paths, codes and
 * rules, so screens behave the same against the real API). `proposedHandlers` serve the endpoints that only exist
 * in contracts/openapi/proposed/auth.yaml. Mode "missing" uses only the proposed ones.
 */
import { http, HttpResponse, type HttpResponseResolver } from "msw";
import { checkGstin, financialYearEnd } from "@meno/validation";
import { db, newId, type MockInvitation, type MockTenant, type MockUser } from "./db";
import {
  ALL_ROLES,
  BUSINESS_TYPE_LICENCES,
  FY_START_MONTH,
  GO_LIVE_MAX_DAYS_AHEAD,
  GSTIN_REQUIRED,
  INVITABLE_ROLES,
  INVITATION_VALID_DAYS,
  LISTS,
  MIN_PASSWORD_LENGTH,
  MOCK_INVITE_TOKEN,
  MOCK_OTP,
  MOCK_RESET_TOKEN,
  PERMISSION_MODULES,
  ROLE_DESCRIPTIONS,
  ROLE_PERMISSIONS,
  SETTINGS,
  START_OPTIONS,
  STATES,
  STEPS,
  TERMS_VERSION,
} from "./seed";

const API = "*/api/v1";

function problem(status: number, code: string, detail: string, extra: Record<string, unknown> = {}) {
  return HttpResponse.json(
    { type: `https://meno.app/problems/${code.toLowerCase().replace(/_/g, "-")}`, title: "Error", status, detail, code, ...extra },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
}

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, days: number) => new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10);

function tokens(u: MockUser) {
  return { accessToken: `mock.${u.id}`, tokenType: "Bearer", expiresIn: 900, user: { id: u.id, tenantId: u.tenantId, email: u.email, fullName: u.fullName, roles: u.roles } };
}

function signIn(u: MockUser, status = 200) {
  db.get().sessionUserId = u.id;
  db.save();
  return HttpResponse.json(tokens(u), { status });
}

/** The signed-in user from the bearer token, like Spring's resource server. */
function auth(request: Request): { user: MockUser; tenant: MockTenant } | Response {
  const header = request.headers.get("Authorization") ?? "";
  const id = header.startsWith("Bearer mock.") ? header.slice("Bearer mock.".length) : null;
  const user = db.get().users.find((u) => u.id === id);
  if (!user) return new HttpResponse(null, { status: 401 });
  return { user, tenant: db.get().tenants[user.tenantId]! };
}

function withAuth<P extends Record<string, string> = Record<string, string>>(
  fn: (ctx: { user: MockUser; tenant: MockTenant; request: Request; params: P }) => Response | Promise<Response>,
): HttpResponseResolver {
  return (async ({ request, params }: { request: Request; params: P }) => {
    const a = auth(request);
    if (a instanceof Response) return a;
    return fn({ ...a, request, params });
  }) as unknown as HttpResponseResolver;
}

function editable(t: MockTenant) {
  return t.live ? problem(409, "TENANCY_ALREADY_LIVE", "Set-up is finished. Change these details in Settings.") : null;
}

function mark(t: MockTenant, step: string, status: "DONE" | "SKIPPED" = "DONE") {
  t.progress[step] = status;
  db.save();
}

function checklist(t: MockTenant) {
  const steps = STEPS.map((s) => ({ ...s, status: !s.available ? "NOT_AVAILABLE" : (t.progress[s.code] ?? "TODO") }));
  const next = t.live ? null : (steps.find((s) => s.available && s.status === "TODO")?.code ?? "GO_LIVE");
  return { steps, nextStep: next, live: t.live, goLiveDate: t.goLiveDate };
}

function requiredLicences(t: MockTenant) {
  return t.business?.businessType ? (BUSINESS_TYPE_LICENCES[t.business.businessType] ?? []) : [];
}

function readiness(t: MockTenant, owner: MockUser | undefined) {
  const checks = STEPS.filter((s) => s.required && s.available).map((s) => ({ code: `STEP_${s.code}`, passed: Boolean(t.progress[s.code]), message: `Complete ${s.route}` }));
  const now = today();
  const licencesValid = Boolean(t.company) && requiredLicences(t).every((k) => (t.licences[k]?.validTo ?? "") > now);
  checks.push({ code: "LICENCES_VALID", passed: licencesValid, message: "Required drug licences must be valid today." });
  checks.push({ code: "OWNER_EMAIL_VERIFIED", passed: Boolean(owner?.emailVerified), message: "Confirm the owner's email with the link we sent (or ask for a new one)." });
  return {
    ready: checks.every((c) => c.passed),
    checks,
    earliestDate: t.books?.booksStartDate ?? now,
    latestDate: addDays(now, GO_LIVE_MAX_DAYS_AHEAD),
    live: t.live,
    goLiveDate: t.goLiveDate,
  };
}

const owner = (t: MockTenant) => db.get().users.find((u) => u.tenantId === t.id && u.roles.includes("OWNER"));
const stepOrder = (message: string) => problem(409, "TENANCY_STEP_ORDER", message);
const invalid = (code: string, message: string) => problem(400, code, message);
type Json = Record<string, unknown>;
const body = async (request: Request) => (await request.json()) as Json;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

// ---------------------------------------------------------------- team (identity TeamController, AUT-09)
const roleLabel = (code: string) => INVITABLE_ROLES.find((r) => r.code === code)?.label ?? code;
const teamBranches = (t: MockTenant) =>
  [...t.branches].sort((a, b) => Number(b.headOffice) - Number(a.headOffice)).map((b) => ({ id: b.id, name: b.details.name ?? "", code: b.details.code ?? "", headOffice: b.headOffice }));
function invitationView(t: MockTenant, i: MockInvitation) {
  const status = i.status === "PENDING" && Date.parse(i.expiresAt) <= Date.now() ? "EXPIRED" : i.status;
  const branches = teamBranches(t).filter((b) => i.branchIds.includes(b.id));
  return { id: i.id, fullName: i.fullName, email: i.email, mobile: i.mobile, roleCode: i.roleCode, roleLabel: roleLabel(i.roleCode), branches, status, sentAt: i.sentAt, expiresAt: i.expiresAt, sendCount: i.sendCount };
}
const expiry = () => new Date(Date.now() + INVITATION_VALID_DAYS * 86_400_000).toISOString();
function pendingInvitation(t: MockTenant, id: string) {
  const i = (t.invitations ?? []).find((x) => x.id === id);
  if (!i) return problem(404, "IDENTITY_INVITATION_NOT_FOUND", "Invitation not found.");
  if (i.status !== "PENDING") return problem(409, "IDENTITY_INVITATION_NOT_PENDING", "This invitation was already accepted or revoked.");
  return i;
}

const teamHandlers = [
  http.get(`${API}/team/options`, withAuth(({ tenant }) => HttpResponse.json({ roles: INVITABLE_ROLES, branches: teamBranches(tenant), smsAvailable: false, invitationValidDays: INVITATION_VALID_DAYS }))),
  http.get(
    `${API}/team/invitations`,
    withAuth(({ tenant }) => {
      const items = [...(tenant.invitations ?? [])].reverse().map((i) => invitationView(tenant, i));
      return HttpResponse.json({ items, page: 0, size: 50, totalItems: items.length, totalPages: items.length ? 1 : 0 });
    }),
  ),
  http.post(
    `${API}/team/invitations`,
    withAuth(async ({ tenant, user, request }) => {
      const b = await body(request);
      const email = str(b.email)?.toLowerCase();
      const mobile = str(b.mobile) ? `+91${str(b.mobile)}` : undefined;
      const branchIds = Array.isArray(b.branchIds) ? (b.branchIds as string[]) : [];
      if (!email && !mobile) return invalid("IDENTITY_INVITATION_CONTACT_REQUIRED", "Enter an email address or a mobile number.");
      if (!email) return problem(503, "NOTIFICATION_CHANNEL_DISABLED", "SMS isn't set up yet. Add an email address to send the invitation.");
      if (!INVITABLE_ROLES.some((r) => r.code === b.roleCode)) return invalid("IDENTITY_ROLE_INVALID", "Choose a role from the list.");
      if (!branchIds.length || !branchIds.every((id) => tenant.branches.some((x) => x.id === id))) return invalid("IDENTITY_INVITATION_BRANCH_INVALID", "Choose at least one of your branches.");
      if (db.get().users.some((u) => u.tenantId === user.tenantId && u.email === email)) return problem(409, "IDENTITY_EMAIL_TAKEN", "Someone on your team already uses this email.");
      const list = (tenant.invitations ??= []);
      if (list.some((i) => i.status === "PENDING" && ((email && i.email === email) || (mobile && i.mobile === mobile))))
        return problem(409, "IDENTITY_INVITATION_PENDING", "This person already has an open invitation. Resend it instead.");
      const row: MockInvitation = { id: newId(), fullName: String(b.fullName).trim(), email, mobile, roleCode: String(b.roleCode), branchIds, status: "PENDING", sentAt: new Date().toISOString(), expiresAt: expiry(), sendCount: 1 };
      list.push(row);
      if (!tenant.live) mark(tenant, "TEAM");
      db.save();
      return HttpResponse.json(invitationView(tenant, row), { status: 201 });
    }),
  ),
  http.post(
    `${API}/team/invitations/:id/resend`,
    withAuth<{ id: string }>(({ tenant, params }) => {
      const i = pendingInvitation(tenant, params.id);
      if (i instanceof Response) return i;
      Object.assign(i, { sentAt: new Date().toISOString(), expiresAt: expiry(), sendCount: i.sendCount + 1 });
      db.save();
      return HttpResponse.json(invitationView(tenant, i));
    }),
  ),
  http.post(
    `${API}/team/invitations/:id/revoke`,
    withAuth<{ id: string }>(({ tenant, params }) => {
      const i = pendingInvitation(tenant, params.id);
      if (i instanceof Response) return i;
      i.status = "REVOKED";
      db.save();
      return HttpResponse.json(invitationView(tenant, i));
    }),
  ),
];

// ---------------------------------------------------------------- users (identity UserAdminController, PLT-06)
/** Defaults plus the tenant's own live roles (role table, V202611271600). */
const tenantRoles = (t: MockTenant) => [
  ...ALL_ROLES.map((r) => ({ ...r, custom: false, locked: r.code === "OWNER", description: ROLE_DESCRIPTIONS[r.code], version: 0 })),
  ...(t.customRoles ?? []).filter((r) => !r.archived).map((r) => ({ ...r, assignable: true, allBranches: false, custom: true, locked: false })),
];
const effectivePerms = (t: MockTenant, role: string) => t.rolePermissions?.[role]?.codes ?? ROLE_PERMISSIONS[role] ?? [];
const permissionsOf = (u: MockUser) => {
  const t = db.get().tenants[u.tenantId];
  return [...new Set(u.roles.flatMap((r) => (t ? effectivePerms(t, r) : (ROLE_PERMISSIONS[r] ?? []))))].sort();
};
const coversAll = (roles: string[]) => roles.some((c) => ALL_ROLES.find((r) => r.code === c)?.allBranches);
const denied = () => problem(403, "COMMON_PERMISSION_DENIED", "You don't have permission to do this.");
function staffView(t: MockTenant, u: MockUser, me: MockUser) {
  const all = coversAll(u.roles);
  return {
    id: u.id, fullName: u.fullName, email: u.email, mobile: u.mobile ? `+91${u.mobile}` : undefined, status: u.disabled ? "DISABLED" : "ACTIVE",
    roles: tenantRoles(t).filter((r) => u.roles.includes(r.code)).map((r) => ({ code: r.code, label: r.label })),
    branches: all ? [] : teamBranches(t).filter((b) => (u.branchIds ?? []).includes(b.id)), allBranches: all,
    lastLoginAt: undefined, createdAt: u.createdAt ?? new Date().toISOString(), you: u.id === me.id, version: u.version ?? 0,
  };
}
function staffOf(t: MockTenant, id: string) {
  return db.get().users.find((u) => u.tenantId === t.id && u.id === id) ?? problem(404, "IDENTITY_USER_NOT_FOUND", "User not found.");
}

const userHandlers = [
  http.get(`${API}/admin/users/options`, withAuth(({ tenant }) => HttpResponse.json({ roles: tenantRoles(tenant).map(({ code, label, assignable, allBranches }) => ({ code, label, assignable, allBranches })), branches: teamBranches(tenant) }))),
  http.get(
    `${API}/admin/users`,
    withAuth(({ tenant, user, request }) => {
      if (!permissionsOf(user).includes("identity.user.view")) return denied();
      const url = new URL(request.url);
      const q = (url.searchParams.get("q") ?? "").toLowerCase();
      const status = url.searchParams.get("status") ?? "ACTIVE";
      const items = db.get().users
        .filter((u) => u.tenantId === tenant.id)
        .filter((u) => status === "ALL" || (status === "DISABLED") === Boolean(u.disabled))
        .filter((u) => !q || u.fullName.toLowerCase().includes(q) || u.email.includes(q) || u.mobile.includes(q))
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((u) => staffView(tenant, u, user));
      return HttpResponse.json({ items, page: 0, size: 200, totalItems: items.length, totalPages: items.length ? 1 : 0 });
    }),
  ),
  http.put(
    `${API}/admin/users/:id/access`,
    withAuth<{ id: string }>(async ({ tenant, user, params, request }) => {
      if (!permissionsOf(user).includes("identity.user.manage")) return denied();
      const u = staffOf(tenant, params.id);
      if (u instanceof Response) return u;
      const b = await body(request);
      if (b.version !== (u.version ?? 0)) return problem(409, "COMMON_VERSION_CONFLICT", "Someone else changed this just now. Reload to see the latest and try again.");
      const roles = Array.isArray(b.roleCodes) ? (b.roleCodes as string[]) : [];
      const touched = [...roles.filter((r) => !u.roles.includes(r)), ...u.roles.filter((r) => !roles.includes(r))];
      if (touched.some((c) => !tenantRoles(tenant).find((r) => r.code === c)?.assignable)) return invalid("IDENTITY_ROLE_INVALID", "Choose a role from the list.");
      if (!roles.length) return invalid("IDENTITY_ROLE_REQUIRED", "Choose at least one role.");
      const branchIds = coversAll(roles) ? [] : Array.isArray(b.branchIds) ? (b.branchIds as string[]) : [];
      if (!coversAll(roles) && (!branchIds.length || !branchIds.every((id) => tenant.branches.some((x) => x.id === id)))) return invalid("IDENTITY_USER_BRANCH_INVALID", "Choose at least one of your branches.");
      Object.assign(u, { roles, branchIds, version: (u.version ?? 0) + 1 });
      db.save();
      return HttpResponse.json(staffView(tenant, u, user));
    }),
  ),
  http.post(
    `${API}/admin/users/:id/:action`,
    withAuth<{ id: string; action: string }>(({ tenant, user, params }) => {
      if (!permissionsOf(user).includes("identity.user.manage")) return denied();
      const u = staffOf(tenant, params.id);
      if (u instanceof Response) return u;
      const deactivate = params.action === "deactivate";
      if (deactivate && u.id === user.id) return problem(409, "IDENTITY_CANNOT_DEACTIVATE_SELF", "You can't deactivate your own account.");
      if (deactivate === Boolean(u.disabled)) return problem(409, deactivate ? "IDENTITY_USER_ALREADY_INACTIVE" : "IDENTITY_USER_ALREADY_ACTIVE", deactivate ? "This account is already deactivated." : "This account is active.");
      Object.assign(u, { disabled: deactivate, version: (u.version ?? 0) + 1 });
      db.save();
      return HttpResponse.json(staffView(tenant, u, user));
    }),
  ),
];

// ---------------------------------------------------------------- roles (identity RoleAdminController, PLT-07)
const conflict = () => problem(409, "COMMON_VERSION_CONFLICT", "Someone else changed this just now. Reload to see the latest and try again.");
function holders(t: MockTenant, code: string) {
  const people = db.get().users.filter((u) => u.tenantId === t.id && u.roles.includes(code));
  return { activeUsers: people.filter((u) => !u.disabled).length, totalUsers: people.length };
}
function roleDetail(t: MockTenant, code: string) {
  const r = tenantRoles(t).find((x) => x.code === code);
  if (!r) return problem(404, "IDENTITY_ROLE_NOT_FOUND", "Role not found.");
  const own = t.rolePermissions?.[code];
  return {
    code: r.code, label: r.label, description: r.description, custom: r.custom, customised: !r.custom && Boolean(own), locked: r.locked, allBranches: r.allBranches,
    permissionCodes: [...effectivePerms(t, code)].sort(), ...holders(t, code), version: r.version, permissionsVersion: own?.version ?? 0,
  };
}
const canRoles = (u: MockUser, manage = false) => permissionsOf(u).includes(manage ? "identity.role.manage" : "identity.role.view");
const labelTaken = (t: MockTenant, label: string, except = "") => tenantRoles(t).some((r) => r.code !== except && r.label.toLowerCase() === label.trim().toLowerCase());

const roleHandlers = [
  http.get(
    `${API}/admin/roles`,
    withAuth(({ tenant, user }) => {
      if (!canRoles(user)) return denied();
      return HttpResponse.json(
        tenantRoles(tenant).map((r) => ({ code: r.code, label: r.label, description: r.description, custom: r.custom, customised: !r.custom && Boolean(tenant.rolePermissions?.[r.code]), locked: r.locked, allBranches: r.allBranches, permissionCount: effectivePerms(tenant, r.code).length, ...holders(tenant, r.code) })),
      );
    }),
  ),
  http.get(
    `${API}/admin/permissions`,
    withAuth(({ tenant, user }) => {
      if (!canRoles(user)) return denied();
      const roles = tenantRoles(tenant);
      return HttpResponse.json({
        modules: PERMISSION_MODULES.map((m) => ({ code: m.code, label: m.label, permissions: m.permissions.map(([code, description]) => ({ code, description, roleCodes: roles.filter((r) => effectivePerms(tenant, r.code).includes(code)).map((r) => r.code) })) })),
        roles: roles.map((r) => ({ code: r.code, label: r.label, custom: r.custom, locked: r.locked })),
      });
    }),
  ),
  ...(["put", "delete"] as const).map((method) =>
    http[method](
      `${API}/admin/permissions/:permission/roles/:role`,
      withAuth<{ permission: string; role: string }>(({ tenant, user, params }) => {
        if (!canRoles(user, true)) return denied();
        const all: readonly (readonly [string, string])[] = PERMISSION_MODULES.flatMap((m): readonly (readonly [string, string])[] => m.permissions);
        const entry = all.find(([code]) => code === params.permission);
        if (!entry) return problem(404, "IDENTITY_PERMISSION_NOT_FOUND", "Permission not found.");
        const d = roleDetail(tenant, params.role);
        if (d instanceof Response) return d;
        if (d.locked) return problem(409, "IDENTITY_ROLE_LOCKED", `${d.label} always has every permission, so it can't be changed.`);
        const codes = new Set(effectivePerms(tenant, params.role));
        const changed = method === "put" ? !codes.has(params.permission) : codes.has(params.permission);
        if (changed) {
          if (method === "put") codes.add(params.permission);
          else codes.delete(params.permission);
          (tenant.rolePermissions ??= {})[params.role] = { codes: [...codes].sort(), version: d.permissionsVersion + 1 };
          db.save();
        }
        return HttpResponse.json({ code: entry[0], description: entry[1], roleCodes: tenantRoles(tenant).filter((r) => effectivePerms(tenant, r.code).includes(params.permission)).map((r) => r.code) });
      }),
    ),
  ),
  http.get(
    `${API}/admin/roles/:code`,
    withAuth<{ code: string }>(({ tenant, user, params }) => {
      if (!canRoles(user)) return denied();
      const d = roleDetail(tenant, params.code);
      return d instanceof Response ? d : HttpResponse.json(d);
    }),
  ),
  http.post(
    `${API}/admin/roles`,
    withAuth(async ({ tenant, user, request }) => {
      if (!canRoles(user, true)) return denied();
      const b = await body(request);
      const label = str(b.label);
      if (!label) return invalid("HTTP_400", "Enter a name for the role.");
      if (labelTaken(tenant, label)) return problem(409, "IDENTITY_ROLE_NAME_TAKEN", "A role with this name already exists.");
      if (str(b.copyFrom) && !tenantRoles(tenant).some((r) => r.code === b.copyFrom)) return problem(404, "IDENTITY_ROLE_NOT_FOUND", "Role not found.");
      const code = `CUSTOM_${newId().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
      (tenant.customRoles ??= []).push({ code, label, description: str(b.description), version: 0 });
      (tenant.rolePermissions ??= {})[code] = { codes: str(b.copyFrom) ? [...effectivePerms(tenant, String(b.copyFrom))] : [], version: 1 };
      db.save();
      return HttpResponse.json(roleDetail(tenant, code), { status: 201 });
    }),
  ),
  http.put(
    `${API}/admin/roles/:code`,
    withAuth<{ code: string }>(async ({ tenant, user, params, request }) => {
      if (!canRoles(user, true)) return denied();
      const role = (tenant.customRoles ?? []).find((r) => r.code === params.code && !r.archived);
      if (!role) return tenantRoles(tenant).some((r) => r.code === params.code) ? problem(409, "IDENTITY_ROLE_NOT_EDITABLE", "MENO's default roles keep their names. Create your own role to use another name.") : problem(404, "IDENTITY_ROLE_NOT_FOUND", "Role not found.");
      const b = await body(request);
      if (b.version !== role.version) return conflict();
      if (labelTaken(tenant, String(b.label ?? ""), role.code)) return problem(409, "IDENTITY_ROLE_NAME_TAKEN", "A role with this name already exists.");
      Object.assign(role, { label: String(b.label).trim(), description: str(b.description), version: role.version + 1 });
      db.save();
      return HttpResponse.json(roleDetail(tenant, role.code));
    }),
  ),
  http.put(
    `${API}/admin/roles/:code/permissions`,
    withAuth<{ code: string }>(async ({ tenant, user, params, request }) => {
      if (!canRoles(user, true)) return denied();
      const d = roleDetail(tenant, params.code);
      if (d instanceof Response) return d;
      if (d.locked) return problem(409, "IDENTITY_ROLE_LOCKED", `${d.label} always has every permission, so it can't be changed.`);
      const b = await body(request);
      if (b.permissionsVersion !== d.permissionsVersion) return conflict();
      (tenant.rolePermissions ??= {})[params.code] = { codes: Array.isArray(b.permissionCodes) ? (b.permissionCodes as string[]) : [], version: d.permissionsVersion + 1 };
      db.save();
      return HttpResponse.json(roleDetail(tenant, params.code));
    }),
  ),
  http.post(
    `${API}/admin/roles/:code/reset`,
    withAuth<{ code: string }>(({ tenant, user, params }) => {
      if (!canRoles(user, true)) return denied();
      const d = roleDetail(tenant, params.code);
      if (d instanceof Response) return d;
      if (d.custom) return problem(409, "IDENTITY_ROLE_NOT_EDITABLE", "Only MENO's default roles can be reset.");
      delete tenant.rolePermissions?.[params.code];
      db.save();
      return HttpResponse.json(roleDetail(tenant, params.code));
    }),
  ),
  http.delete(
    `${API}/admin/roles/:code`,
    withAuth<{ code: string }>(({ tenant, user, params }) => {
      if (!canRoles(user, true)) return denied();
      const role = (tenant.customRoles ?? []).find((r) => r.code === params.code && !r.archived);
      if (!role) return problem(409, "IDENTITY_ROLE_NOT_EDITABLE", "MENO's default roles can't be removed.");
      if (holders(tenant, role.code).activeUsers > 0) return problem(409, "IDENTITY_ROLE_IN_USE", "People still have this role or are invited with it. Give them another role first.");
      role.archived = true;
      db.save();
      return new HttpResponse(null, { status: 204 });
    }),
  ),
];

export const builtHandlers = [
  // ---------------------------------------------------------------- auth
  http.post(`${API}/auth/login`, async ({ request }) => {
    const b = await body(request);
    // Same matching as meno-api: email (lower-cased) or the 10 mobile digits in any common form.
    const id = String(b.identifier ?? "").trim().toLowerCase();
    const digits = id.replace(/[\s-]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, "");
    const user = db.get().users.find((u) => (id.includes("@") ? u.email === id : u.mobile === digits) && u.password === b.password && !u.disabled);
    return user ? signIn(user) : problem(401, "AUTH_INVALID_CREDENTIALS", "Email, mobile or password is wrong.");
  }),
  http.post(`${API}/auth/refresh`, () => {
    const user = db.get().users.find((u) => u.id === db.get().sessionUserId);
    return user ? signIn(user) : problem(401, "AUTH_REFRESH_INVALID", "Session expired. Please sign in again.");
  }),
  http.post(`${API}/auth/logout`, () => {
    db.get().sessionUserId = null;
    db.save();
    return new HttpResponse(null, { status: 204 });
  }),
  // The mock keeps one session per tab, so "all devices" ends just that one.
  http.post(
    `${API}/auth/logout-all`,
    withAuth(() => {
      db.get().sessionUserId = null;
      db.save();
      return new HttpResponse(null, { status: 204 });
    }),
  ),
  http.get(
    `${API}/auth/me`,
    withAuth(({ user }) => HttpResponse.json({ userId: user.id, tenantId: user.tenantId, email: user.email, roles: user.roles, permissions: permissionsOf(user) })),
  ),
  http.get(`${API}/auth/signup/options`, () =>
    HttpResponse.json({ open: true, states: STATES, startOptions: START_OPTIONS, termsVersion: TERMS_VERSION, minPasswordLength: MIN_PASSWORD_LENGTH }),
  ),
  http.post(`${API}/auth/signup`, async ({ request }) => {
    const b = await body(request);
    const key = request.headers.get("Idempotency-Key");
    const s = db.get();
    if (key && s.idempotency[key]) {
      const replay = s.users.find((u) => u.id === s.idempotency[key]);
      if (replay) return signIn(replay, 200);
    }
    if (str(b.website)) return invalid("IDENTITY_SIGNUP_REJECTED", "We couldn't create the account. Please try again.");
    if (String(b.password ?? "").length < MIN_PASSWORD_LENGTH) return invalid("IDENTITY_PASSWORD_TOO_SHORT", `Use at least ${MIN_PASSWORD_LENGTH} characters.`);
    if (!START_OPTIONS.includes(String(b.startWith))) return invalid("IDENTITY_START_OPTION_INVALID", "Choose how you want to start.");
    if (b.acceptedTermsVersion !== TERMS_VERSION) return invalid("IDENTITY_TERMS_NOT_ACCEPTED", "Accept the current terms and privacy notice.");
    if (!STATES.some((st) => st.code === b.stateCode)) return invalid("TENANCY_STATE_UNKNOWN", "Choose your state.");
    const email = String(b.email).trim().toLowerCase();
    if (s.users.some((u) => u.email === email)) return problem(409, "IDENTITY_EMAIL_TAKEN", "This email already has a MENO account. Sign in instead.");
    if (s.users.some((u) => u.mobile === String(b.mobile))) return problem(409, "IDENTITY_MOBILE_TAKEN", "An account with this mobile number already exists. Sign in instead.");
    const tenantId = newId();
    s.tenants[tenantId] = { id: tenantId, name: String(b.businessName), stateCode: String(b.stateCode), licences: {}, branches: [], settings: {}, progress: {}, live: false };
    const user: MockUser = { id: newId(), tenantId, email, password: String(b.password), fullName: String(b.ownerName), mobile: String(b.mobile), roles: ["OWNER"], emailVerified: false, mobileVerified: false };
    s.users.push(user);
    if (key) s.idempotency[key] = user.id;
    return signIn(user, 201);
  }),
  http.get(`${API}/auth/verification`, withAuth(({ user }) => HttpResponse.json({ emailVerified: user.emailVerified, mobileVerified: user.mobileVerified }))),
  http.post(`${API}/auth/verify-email`, async ({ request }) => {
    const token = String((await body(request)).token ?? "");
    const user = db.get().users.find((u) => `mock-${u.id}` === token);
    if (!user) return invalid("IDENTITY_VERIFICATION_INVALID", "This link isn't valid. Ask for a new one.");
    user.emailVerified = true;
    db.save();
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(
    `${API}/auth/verify-email/resend`,
    withAuth(({ user }) => (user.emailVerified ? problem(409, "IDENTITY_ALREADY_VERIFIED", "Your email is already confirmed.") : new HttpResponse(null, { status: 202 }))),
  ),

  // password reset (AUT-01, PR #55)
  http.post(`${API}/auth/password/forgot`, () => new HttpResponse(null, { status: 202 })),
  http.post(`${API}/auth/password/reset`, async ({ request }) => {
    const b = await body(request);
    if (b.token !== MOCK_RESET_TOKEN) return problem(410, "AUTH_RESET_TOKEN_INVALID", "This reset link has expired or was already used. Ask for a new one.");
    if (String(b.password ?? "").length < MIN_PASSWORD_LENGTH) return invalid("IDENTITY_PASSWORD_TOO_SHORT", `Use at least ${MIN_PASSWORD_LENGTH} characters.`);
    return new HttpResponse(null, { status: 204 });
  }),

  // ---------------------------------------------------------------- GSTIN (PTY-15)
  http.get(
    `${API}/gstin-verifications/:gstin`,
    withAuth<{ gstin: string }>(({ params }) => {
      const g = params.gstin.toUpperCase();
      const failed = checkGstin(g);
      if (failed) return problem(422, "PARTY_GSTIN_INVALID", "Check the GSTIN: it doesn't pass the format check.", { failedCheck: failed });
      if (!STATES.some((s) => s.code === g.slice(0, 2))) return problem(422, "PARTY_GSTIN_INVALID", "Check the GSTIN: the state code is unknown.", { failedCheck: "STATE" });
      return HttpResponse.json({
        gstin: g,
        legalName: "Demo Pharma Private Limited",
        tradeName: "Demo Medicals",
        status: "ACTIVE",
        registrationType: "REGULAR",
        registeredOn: "2023-12-12",
        constitution: "Private Limited Company",
        natureOfBusiness: ["Retail Business"],
        eInvoiceEnabled: false,
        stateCode: g.slice(0, 2),
        pan: g.slice(2, 12),
        address: { line1: "12 Demo Street", line2: "Demo Nagar", city: "Demo City", pin: "600001" },
        source: "mock",
        fetchedAt: new Date().toISOString(),
      });
    }),
  ),

  // ---------------------------------------------------------------- onboarding
  http.get(`${API}/onboarding`, withAuth(({ tenant }) => HttpResponse.json(checklist(tenant)))),
  http.get(
    `${API}/onboarding/options`,
    withAuth(() => HttpResponse.json({ lists: LISTS, settings: SETTINGS, states: STATES.map(({ code, name }) => ({ code, name })), financialYearStartMonth: FY_START_MONTH })),
  ),
  http.post(
    `${API}/onboarding/steps/:step/skip`,
    withAuth<{ step: string }>(({ tenant, params }) => {
      const blocked = editable(tenant);
      if (blocked) return blocked;
      const def = STEPS.find((s) => s.code === params.step);
      if (!def) return problem(404, "TENANCY_STEP_UNKNOWN", "Unknown onboarding step.");
      if (def.required) return problem(409, "TENANCY_STEP_REQUIRED", "This step can't be skipped.");
      mark(tenant, def.code, "SKIPPED");
      return HttpResponse.json(checklist(tenant));
    }),
  ),
  http.get(`${API}/onboarding/business`, withAuth(({ tenant }) => HttpResponse.json(tenant.business ?? {}))),
  http.put(
    `${API}/onboarding/business`,
    withAuth(async ({ tenant, request }) => {
      const blocked = editable(tenant);
      if (blocked) return blocked;
      const b = await body(request);
      const pairs: [string, keyof typeof LISTS][] = [["businessType", "business_type"], ["branchCount", "branch_count"], ["catalogueSize", "catalogue_size"], ["currentSoftware", "current_software"], ["language", "language"]];
      for (const [field, listCode] of pairs) if (!LISTS[listCode].some((o) => o.code === b[field])) return invalid("TENANCY_OPTION_INVALID", `Choose a valid option for ${field}.`);
      tenant.business = Object.fromEntries(pairs.map(([f]) => [f, String(b[f])]));
      mark(tenant, "BUSINESS");
      return HttpResponse.json(tenant.business);
    }),
  ),
  http.get(`${API}/onboarding/company`, withAuth(({ tenant }) => (tenant.company ? HttpResponse.json(tenant.company) : new HttpResponse(null, { status: 204 })))),
  http.put(
    `${API}/onboarding/company`,
    withAuth(async ({ tenant, request }) => {
      const blocked = editable(tenant);
      if (blocked) return blocked;
      const b = await body(request);
      const gstin = str(b.gstin)?.toUpperCase();
      const reg = String(b.registrationType ?? "");
      if (!STATES.some((s) => s.code === b.stateCode)) return invalid("TENANCY_STATE_UNKNOWN", "Choose your state.");
      if (!(reg in GSTIN_REQUIRED)) return invalid("TENANCY_OPTION_INVALID", "Choose the GST registration type.");
      if (GSTIN_REQUIRED[reg] && !gstin) return invalid("TENANCY_GSTIN_REQUIRED", "Enter the GSTIN for a registered business.");
      if (!GSTIN_REQUIRED[reg] && gstin) return invalid("TENANCY_GSTIN_NOT_ALLOWED", "Remove the GSTIN or choose a registered type.");
      if (gstin) {
        if (checkGstin(gstin)) return invalid("TENANCY_GSTIN_INVALID", "This GSTIN is not valid. Check it on the GST certificate.");
        if (gstin.slice(0, 2) !== b.stateCode) return invalid("TENANCY_GSTIN_STATE_MISMATCH", "The state must match the GSTIN (first two digits).");
        if (gstin.slice(2, 12) !== b.pan) return invalid("TENANCY_PAN_GSTIN_MISMATCH", "PAN must match characters 3–12 of the GSTIN.");
      }
      const keys = ["registrationType", "legalName", "tradeName", "pan", "addressLine1", "addressLine2", "pin", "city", "district", "stateCode", "email"];
      tenant.company = { ...Object.fromEntries(keys.map((k) => [k, str(b[k])])), gstin, phone: str(b.phone) ? `+91${String(b.phone)}` : undefined };
      mark(tenant, "COMPANY");
      return HttpResponse.json(tenant.company);
    }),
  ),
  http.get(
    `${API}/onboarding/licences`,
    withAuth(({ tenant }) => HttpResponse.json({ licences: tenant.licences, ...(tenant.pharmacist ?? {}), required: requiredLicences(tenant) })),
  ),
  http.put(
    `${API}/onboarding/licences`,
    withAuth(async ({ tenant, request }) => {
      const blocked = editable(tenant);
      if (blocked) return blocked;
      if (!tenant.company) return stepOrder("Complete the company & GST step first.");
      if (!tenant.business) return stepOrder("Complete the business profile first.");
      const b = await body(request);
      const map: Record<string, string> = { DRUG_RETAIL: "drugRetail", DRUG_WHOLESALE: "drugWholesale", FSSAI: "fssai", NARCOTIC: "narcotic" };
      const labels: Record<string, string> = { DRUG_RETAIL: "retail drug licence", DRUG_WHOLESALE: "wholesale drug licence", FSSAI: "FSSAI licence", NARCOTIC: "narcotic licence" };
      const licences: Record<string, { number: string; validTo?: string }> = {};
      for (const [kind, field] of Object.entries(map)) {
        const l = b[field] as { number?: string; validTo?: string } | undefined;
        if (l?.number) licences[kind] = { number: l.number, validTo: l.validTo };
      }
      for (const kind of requiredLicences(tenant)) if (!licences[kind]) return invalid("TENANCY_LICENCE_REQUIRED", `Enter the ${labels[kind]} for this business type.`);
      for (const [kind, l] of Object.entries(licences)) {
        if (kind.startsWith("DRUG") && !l.validTo) return invalid("TENANCY_LICENCE_EXPIRY_REQUIRED", `Enter the expiry date of the ${labels[kind]}.`);
        if (l.validTo && l.validTo <= today()) return invalid("TENANCY_LICENCE_EXPIRED", `The ${labels[kind]} has expired. Renew it first.`);
        if (kind === "FSSAI" && !/^[0-9]{14}$/.test(l.number)) return invalid("TENANCY_FSSAI_INVALID", "FSSAI licence numbers have 14 digits.");
      }
      tenant.licences = licences;
      tenant.pharmacist = { pharmacistName: String(b.pharmacistName), pharmacistRegNo: String(b.pharmacistRegNo), pharmacistCouncilState: String(b.pharmacistCouncilState) };
      mark(tenant, "LICENCES");
      return HttpResponse.json({ licences, ...tenant.pharmacist, required: requiredLicences(tenant) });
    }),
  ),
  http.get(
    `${API}/onboarding/branches`,
    withAuth(({ tenant }) => {
      const c = tenant.company;
      const suggestion =
        tenant.branches.length === 0 && c
          ? { name: c.tradeName ?? c.legalName, code: "HO", addressLine1: c.addressLine1, addressLine2: c.addressLine2, pin: c.pin, city: c.city, district: c.district, stateCode: c.stateCode }
          : undefined;
      return HttpResponse.json({ branches: tenant.branches, suggestion });
    }),
  ),
  http.post(
    `${API}/onboarding/branches`,
    withAuth(async ({ tenant, request }) => {
      const blocked = editable(tenant);
      if (blocked) return blocked;
      if (!tenant.company) return stepOrder("Complete the company & GST step first.");
      const b = await body(request);
      if (b.stateCode !== tenant.company.stateCode) return invalid("TENANCY_BRANCH_STATE_MISMATCH", "A branch must be in the company's state.");
      if (tenant.branches.some((x) => x.details.code === b.code)) return problem(409, "TENANCY_BRANCH_CODE_TAKEN", "This branch code is in use.");
      const row = { id: newId(), headOffice: tenant.branches.length === 0, details: Object.fromEntries(Object.entries(b).map(([k, v]) => [k, str(v)])) };
      tenant.branches.push(row);
      mark(tenant, "BRANCHES");
      return HttpResponse.json(row, { status: 201 });
    }),
  ),
  http.put(
    `${API}/onboarding/branches/:id`,
    withAuth<{ id: string }>(async ({ tenant, request, params }) => {
      const blocked = editable(tenant);
      if (blocked) return blocked;
      const row = tenant.branches.find((x) => x.id === params.id);
      if (!row) return problem(404, "TENANCY_BRANCH_NOT_FOUND", "Branch not found.");
      const b = await body(request);
      if (b.stateCode !== tenant.company?.stateCode) return invalid("TENANCY_BRANCH_STATE_MISMATCH", "A branch must be in the company's state.");
      if (tenant.branches.some((x) => x.id !== row.id && x.details.code === b.code)) return problem(409, "TENANCY_BRANCH_CODE_TAKEN", "This branch code is in use.");
      row.details = Object.fromEntries(Object.entries(b).map(([k, v]) => [k, str(v)]));
      db.save();
      return HttpResponse.json(row);
    }),
  ),
  http.get(`${API}/onboarding/books`, withAuth(({ tenant }) => (tenant.books ? HttpResponse.json(tenant.books) : new HttpResponse(null, { status: 204 })))),
  http.put(
    `${API}/onboarding/books`,
    withAuth(async ({ tenant, request }) => {
      const blocked = editable(tenant);
      if (blocked) return blocked;
      if (!tenant.company) return stepOrder("Complete the company & GST step first.");
      const b = await body(request);
      const start = String(b.financialYearStart);
      const booksStart = String(b.booksStartDate);
      if (!start.endsWith("-01") || Number(start.slice(5, 7)) !== FY_START_MONTH) return invalid("TENANCY_FY_START_INVALID", "The financial year starts on 1 April.");
      const end = financialYearEnd(start);
      if (booksStart < start || booksStart > end) return invalid("TENANCY_BOOKS_START_OUTSIDE_FY", "The books start date must be inside the financial year.");
      tenant.books = { financialYearStart: start, financialYearEnd: end, booksStartDate: booksStart, label: `FY ${start.slice(0, 4)}-${end.slice(2, 4)}` };
      mark(tenant, "BOOKS");
      return HttpResponse.json(tenant.books);
    }),
  ),
  http.get(
    `${API}/onboarding/configuration`,
    withAuth(({ tenant }) => HttpResponse.json(Object.fromEntries(SETTINGS.map((d) => [d.key, tenant.settings[d.key] ?? d.defaultValue])))),
  ),
  http.put(
    `${API}/onboarding/configuration`,
    withAuth(async ({ tenant, request }) => {
      const blocked = editable(tenant);
      if (blocked) return blocked;
      const settings = ((await body(request)).settings ?? {}) as Record<string, string>;
      for (const [k, v] of Object.entries(settings)) {
        const d = SETTINGS.find((x) => x.key === k);
        if (!d) return invalid("TENANCY_SETTING_UNKNOWN", `Unknown setting ${k}.`);
        const ok =
          d.type === "BOOLEAN" ? v === "true" || v === "false"
          : d.type === "INTEGER" ? /^\d+$/.test(v) && Number(v) >= (d.min ?? 0) && Number(v) <= (d.max ?? Infinity)
          : d.type === "LIST" ? (LISTS[d.listCode as keyof typeof LISTS] ?? []).some((o) => o.code === v)
          : true;
        if (!ok) return invalid("TENANCY_SETTING_INVALID", `Invalid value for ${k}.`);
      }
      tenant.settings = { ...tenant.settings, ...settings };
      mark(tenant, "CONFIGURATION");
      return HttpResponse.json(Object.fromEntries(SETTINGS.map((d) => [d.key, tenant.settings[d.key] ?? d.defaultValue])));
    }),
  ),
  http.get(`${API}/onboarding/go-live`, withAuth(({ tenant }) => HttpResponse.json(readiness(tenant, owner(tenant))))),
  http.post(
    `${API}/onboarding/go-live`,
    withAuth(async ({ tenant, request }) => {
      const blocked = editable(tenant);
      if (blocked) return blocked;
      const r = readiness(tenant, owner(tenant));
      if (!r.ready) return problem(409, "TENANCY_NOT_READY", "Some set-up steps are not finished yet.");
      const date = String((await body(request)).goLiveDate);
      if (date < r.earliestDate || date > r.latestDate) return invalid("TENANCY_GO_LIVE_DATE_INVALID", `Pick a go-live date between ${r.earliestDate} and ${r.latestDate}.`);
      tenant.live = true;
      tenant.goLiveDate = date;
      db.save();
      return HttpResponse.json(readiness(tenant, owner(tenant)));
    }),
  ),
  // Mobile OTP (meno-api VerificationController); local code is MOCK_OTP.
  http.post(`${API}/auth/verify-mobile/send`, () => new HttpResponse(null, { status: 202 })),
  http.post(`${API}/auth/verify-mobile`, async ({ request }) => {
    const code = String((await body(request)).code ?? "");
    if (code !== MOCK_OTP) return problem(400, "IDENTITY_VERIFICATION_INVALID", "That code isn't right. Check the SMS and try again.", { attemptsLeft: 2 });
    const user = auth(request);
    if (!(user instanceof Response)) {
      user.user.mobileVerified = true;
      db.save();
    }
    return new HttpResponse(null, { status: 204 });
  }),
  ...teamHandlers,
  ...userHandlers,
  ...roleHandlers,
];

export const proposedHandlers = [
  http.get(`${API}/invitations/:token`, ({ params }) =>
    params.token === MOCK_INVITE_TOKEN && !db.get().usedInvites.includes(String(params.token))
      ? HttpResponse.json({
          businessName: "Demo Medicals",
          roleName: "Billing operator",
          branchNames: ["Head office"],
          invitedByName: "Demo Owner",
          contactMasked: "+91 98•••••210",
          expiresAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
          minPasswordLength: MIN_PASSWORD_LENGTH,
        })
      : problem(410, "IDENTITY_INVITATION_INVALID", "This invitation has expired or was already used. Ask the owner to send a new one."),
  ),
  http.post(`${API}/invitations/:token/accept`, async ({ params, request }) => {
    const s = db.get();
    if (params.token !== MOCK_INVITE_TOKEN || s.usedInvites.includes(String(params.token)))
      return problem(410, "IDENTITY_INVITATION_INVALID", "This invitation has expired or was already used. Ask the owner to send a new one.");
    const b = await body(request);
    let tenantId = Object.keys(s.tenants)[0];
    if (!tenantId) {
      tenantId = newId();
      s.tenants[tenantId] = { id: tenantId, name: "Demo Medicals", stateCode: "33", licences: {}, branches: [], settings: {}, progress: {}, live: false };
    }
    const user: MockUser = { id: newId(), tenantId, email: `staff-${s.users.length + 1}@example.test`, password: String(b.password), fullName: String(b.fullName), mobile: String(b.mobile), roles: ["BILLING_OPERATOR"], emailVerified: true, mobileVerified: false };
    s.users.push(user);
    s.usedInvites.push(String(params.token));
    return signIn(user);
  }),
];
