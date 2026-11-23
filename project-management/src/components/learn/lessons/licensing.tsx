"use client";

import { LicenseKeyDemo, LicenseLifecycleDemo } from "../license-demos";
import { B, C, Callout, Flow, List, Quiz, Section, Sub, Table } from "../kit";

/** Day 20: how MENO is sold and switched on. Source of truth: docs/architecture/LICENSING.md + ADR-0015. */
export function Licensing() {
  return (
    <>
      <Section title="The problem">
        <p>
          A pharmacy buys MENO from us. We must switch MENO on <B>for that buyer only</B>, with the plan they paid for (Retail or Wholesale, how many users, branches and counter PCs) and <B>until the date they paid for</B>. When it ends, they should be reminded, get a grace period, and then be limited, <B>without ever losing a bill or their data</B>. And the counter PC must keep working offline.
        </p>
        <Flow
          steps={[
            { title: "Super admin", sub: "creates a license", tone: "violet" },
            { title: "License key", sub: "MENO-7K3QP-…", tone: "slate" },
            { title: "Buyer activates", sub: "onboarding / Settings", tone: "blue" },
            { title: "Signed certificate", sub: "plan, limits, dates", tone: "green" },
            { title: "Every action checked", sub: "EntitlementGuard", tone: "amber" },
          ]}
        />
      </Section>

      <Section title="Words to use">
        <Table
          head={["Word", "Meaning"]}
          rows={[
            [<B key="p">Plan</B>, "A package we define as data: edition, limits, features, duration, grace days, price. Example RETAIL_STD_1Y."],
            [<B key="l">License</B>, "One sale: buyer + plan + start and expiry dates. Lives in our database."],
            [<B key="k">License key</B>, "The code the buyer types. It only points to the license; it is not the license."],
            [<B key="a">Activation</B>, "Entering the key on a tenant: the license is bound to that tenant."],
            [<B key="c">Certificate</B>, "A short-lived signed token listing plan, limits and dates, for the offline desktop and the UI."],
            [<B key="e">Entitlement</B>, "What the tenant may do right now: license + today's date + current usage."],
          ]}
        />
      </Section>

      <Section title="The key">
        <p>
          <C>MENO-7K3QP-9XW2M-H4TZR-C8VNF</C>: 19 random characters (95 bits, from a secure random generator) plus 1 <B>check character</B>, in <B>Crockford Base32</B>: digits and letters without <C>I L O U</C>, so nobody confuses 1 with I or 0 with O. Input is forgiving: lower case, spaces, and I/L/O typed by mistake are all accepted.
        </p>
        <List
          items={[
            <><B>Check character (Luhn mod-32):</B> catches every single wrong character and almost every swap of two neighbours, <B>in the browser</B>, before any network call.</>,
            <><B>Stored hashed:</B> the database keeps <C>HMAC-SHA256(pepper, key)</C> and the last 4 characters. A database leak gives nobody a working key. The full key is shown <B>once</B>; a lost key is re-issued, not recovered.</>,
            <><B>Never logged:</B> logs and audit show <C>…8VNF</C> only.</>,
          ]}
        />
        <Sub>Try it</Sub>
        <LicenseKeyDemo />
      </Section>

      <Section title="The certificate: how the offline desktop knows the plan">
        <p>
          After activation, and on every login and sync, the server returns a <B>license certificate</B>: a JWS signed with <B>Ed25519</B>. Only the server has the private key; the web and desktop builds contain the public key, so the desktop can check it offline.
        </p>
        <pre className="avoid-break overflow-x-auto rounded-tile bg-sunken p-3 font-mono text-[12px] leading-relaxed text-ink">{`{
  "kid": "lic-2027-01",          // which signing key (rotation)
  "lic": "0193f1a2-…",           // license id
  "tid": "0193e7c0-…",           // tenant
  "plan": "RETAIL_STD_1Y", "edition": "RETAIL",
  "limits": { "users": 5, "branches": 1, "devices": 2, "invoicesPerMonth": null },
  "features": ["OFFLINE_BILLING", "WHATSAPP_SHARE"],
  "expires": "2028-03-31", "graceUntil": "2028-04-15",
  "exp": 1796004800              // the certificate itself lasts 7 days
}`}</pre>
        <List
          items={[
            <>Desktop offline checks: signature with a known <C>kid</C>, <C>tid</C> = this device&apos;s tenant, certificate not past <C>exp</C>, and the <B>clock check</B> (PC date not earlier than the last server time we saw).</>,
            <>Short life (7 days) means a revoked license stops a desktop that stays offline within a week.</>,
          ]}
        />
        <Callout tone="rule" title="The server never trusts the certificate">
          On the server, every protected action reads the license <B>from the database</B>. The certificate is only for the offline desktop and for showing plan and limits in the UI. A patched desktop can&apos;t give itself more: everything it does reaches the server through sync.
        </Callout>
      </Section>

      <Section title="Lifecycle: valid → expiring → grace → expired">
        <p>
          The database stores only <C>ISSUED</C>, <C>ACTIVE</C>, <C>SUSPENDED</C>, <C>REVOKED</C>. <B>Expiring, grace and expired are computed from the dates</B> every time, so no nightly job can forget to flip a status.
        </p>
        <LicenseLifecycleDemo />
        <Callout tone="rule" title="Data integrity beats licensing">
          Even after expiry, a pharmacy can always sign in, see and <B>export</B> its data, record money it receives, and <B>sync bills it already made offline</B>. We never delete or hide a tenant&apos;s data.
        </Callout>
        <Callout tone="verify">Grace length, what exactly restricted mode blocks, and whether the monthly invoice limit is soft (warning) or hard are business decisions. Nitheesh confirms them before LIC-06 is built.</Callout>
      </Section>

      <Section title="Enforcement in code">
        <p>
          One door: <C>subscription.api.EntitlementGuard</C>. Other modules call it through the api package (module rule); nobody reads license tables directly.
        </p>
        <Table
          head={["Call", "Used before", "Refusal code (RFC 9457)"]}
          mono={[0, 2]}
          rows={[
            ["requireEdition(WHOLESALE)", "Wholesale screens and endpoints", "license_edition"],
            ["requireFeature(\"OFFLINE_BILLING\")", "Registering a desktop for offline billing", "license_feature"],
            ["requireCapacity(USERS | BRANCHES | DEVICES)", "Inviting a user, adding a branch, activating a PC", "license_limit_reached"],
            ["requireWritable()", "Creating sales, purchases, other documents", "license_expired"],
          ]}
        />
        <p>The UI hides or disables what the plan doesn&apos;t include and says why (&quot;Your plan allows 2 counter PCs. Contact MENO to add more.&quot;), but the <B>server check is the rule</B>.</p>
      </Section>

      <Section title="Tables and endpoints">
        <Table
          head={["Table", "Holds"]}
          mono={[0]}
          rows={[
            ["plan", "Plan catalogue (data, effective-dated, never hard-coded)"],
            ["license", "One sale: key_hash, key_last4, plan, buyer, edition, limits + features (snapshotted from the plan), dates, status, tenant_id once activated"],
            ["license_event", "Insert-only history: issued, activated, extended, plan changed, suspended, revoked, key re-issued, transferred"],
            ["license_activation_attempt", "Every activation try, for rate limiting and abuse review"],
          ]}
        />
        <Callout tone="note" title="Snapshot, like an invoice">The plan&apos;s limits are copied onto the license when it is sold. Changing a plan later never changes licenses already sold.</Callout>
        <Table
          head={["Who", "Endpoint"]}
          mono={[1]}
          compact
          rows={[
            ["Super admin", "POST /api/v1/platform/licenses   (Idempotency-Key; returns the key once)"],
            ["Super admin", "GET /api/v1/platform/licenses?status=&expiringBefore=&q="],
            ["Super admin", "POST /platform/licenses/{id}/extend | change-plan | suspend | resume | revoke | reissue-key | transfer"],
            ["Business owner", "POST /api/v1/license/activate {key}   (5 tries / 15 min)"],
            ["Tenant users", "GET /api/v1/license   (plan, dates, state, limits with usage)"],
            ["Tenant apps", "GET /api/v1/license/certificate"],
          ]}
        />
        <p>Super-admin endpoints run under <C>/api/v1/platform/*</C> with the platform DB role, need 2FA, are checked by <B>permission</B> (<C>platform.license.*</C>), and every call is audited with a reason.</p>
      </Section>

      <Section title="Who builds what">
        <Table
          head={["Feature", "What", "Who", "Phase"]}
          rows={[
            ["LIC-01", "Plan catalogue", "Nitheesh", "P5"],
            ["LIC-02", "Issue a license key", "Nitheesh", "P5"],
            ["LIC-03", "Activate a key (onboarding, Settings)", "Nitheesh", "P5"],
            ["LIC-04", "Signed certificate (Ed25519, kid rotation)", "Nitheesh", "P5"],
            ["LIC-05", "EntitlementGuard + checks in every module", "Nitheesh (+ each module owner adds the call)", "P5"],
            ["LIC-06", "Expiry lifecycle, reminders, restricted mode", "Nitheesh", "P5"],
            ["LIC-07", "Desktop offline license", "Nitheesh + Meyyarivu (desktop) + Jeeva (build)", "P5"],
            ["LIC-08", "Super-admin license console", "Nitheesh", "P5"],
            ["LIC-09", "Tenant license page", "Nitheesh", "P5"],
            ["LIC-10 / 11", "Renew with a new key, license invoices", "Nitheesh", "P6"],
          ]}
        />
        <p>QA: Ashok. Design: <C>docs/architecture/LICENSING.md</C>, decision: <C>ADR-0015</C>.</p>
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "A buyer lost their key. Do we look it up and send it again?", a: "We can't: only its hash is stored. A super admin re-issues a new key; the old one stops working." },
            { q: "Where is the license status 'expired' stored?", a: "Nowhere. Expiring, grace and expired are computed from the dates every time." },
            { q: "A license expired yesterday after grace, and a counter PC has 37 offline bills from last week. Does sync accept them?", a: "Yes. Bills made before the grace end always sync; data integrity beats licensing." },
            { q: "The desktop says the plan allows 5 users. Does the server trust that when inviting a 6th?", a: "No. The server reads the license from the database; the certificate is only for offline use and display." },
            { q: "We raise the price and limits of RETAIL_STD_1Y. What happens to licenses sold last month?", a: "Nothing. Limits were snapshotted onto each license when it was sold." },
            { q: "Why is the certificate valid for only 7 days?", a: "So a suspended or revoked license stops an offline desktop within a week." },
          ]}
        />
      </Section>
    </>
  );
}
