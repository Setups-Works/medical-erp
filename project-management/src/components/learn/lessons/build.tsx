"use client";

import { B, C, Callout, Flow, Layers, List, Quiz, Section, Sub, Table } from "../kit";

export function Architecture() {
  return (
    <>
      <Section title="The whole system in one sentence">
        <p>
          A <B>single Spring Boot backend</B> (<C>meno-api</C>) owns every business rule and all data in <B>PostgreSQL</B>. A <B>Next.js static web app</B> is the screen in the browser. An <B>Electron desktop app</B> wraps the
          same screens and adds an <B>offline SQLite store and sync engine</B> for the counter. Everything runs in <B>Docker</B> on an <B>Azure VM</B> behind <B>Nginx</B>.
        </p>
      </Section>

      <Section title="Containers: what runs where">
        <Layers
          layers={[
            {
              name: "Client devices",
              tone: "blue",
              items: [
                { title: "apps/web", sub: "Next.js static SPA in the browser" },
                { title: "apps/desktop", sub: "Electron: same web build + printers, scanner" },
                { title: "SQLite (desktop)", sub: "Encrypted offline store + outbox" },
              ],
            },
            {
              name: "Azure VM · Docker Compose",
              tone: "green",
              items: [
                { title: "Nginx", sub: "TLS, serves the web app, proxies /api" },
                { title: "meno-api", sub: "Spring Boot modular monolith" },
                { title: "Redis", sub: "Cache, rate limits, locks" },
                { title: "Prometheus · Grafana · Loki", sub: "Metrics and logs" },
              ],
            },
            {
              name: "Managed services",
              tone: "violet",
              items: [
                { title: "PostgreSQL 17", sub: "The only product database" },
                { title: "Blob storage", sub: "Invoice PDFs, prescriptions, imports, backups" },
                { title: "Sentry", sub: "Error tracking" },
              ],
            },
          ]}
        />
        <Callout tone="rule" title="One backend">
          Next.js has <B>no API routes, no server actions and no database access</B>. It only calls <C>/api/v1</C>. All maths, checks and data live in <C>meno-api</C>.
        </Callout>
      </Section>

      <Section title="Inside meno-api: modules">
        <Layers
          layers={[
            { name: "Platform", tone: "slate", items: ["auth", "tenancy", "identity", "subscription", "audit", "notification", "files", "sync"].map((t) => ({ title: t })) },
            { name: "Masters", tone: "blue", items: [{ title: "catalog", sub: "medicines, HSN, units" }, { title: "party", sub: "suppliers, customers" }, { title: "pricing", sub: "price lists, schemes" }] },
            {
              name: "Operations",
              tone: "green",
              items: [{ title: "purchase" }, { title: "inventory", sub: "batches, movements" }, { title: "sales", sub: "POS, wholesale" }, { title: "returns" }, { title: "compliance", sub: "Schedule H/H1/X" }],
            },
            { name: "Finance", tone: "violet", items: [{ title: "payment" }, { title: "accounting", sub: "ledgers, vouchers" }, { title: "taxation", sub: "GST, e-invoice" }] },
            { name: "Read side", tone: "amber", items: [{ title: "reporting", sub: "SQL views, never writes" }, { title: "fieldsales", sub: "Phase 6" }] },
          ]}
        />
        <Sub>Every module has the same six folders</Sub>
        <Table
          head={["Folder", "Holds", "Who may use it"]}
          mono={[0]}
          rows={[
            ["api/", "Facade interface, public DTOs, domain events", "Other modules"],
            ["web/", "Thin controller + request/response DTOs", "HTTP only"],
            ["service/", "Use cases, @Transactional", "This module"],
            ["domain/", "Entities, value objects, rules", "This module"],
            ["repository/", "Spring Data JPA", "This module"],
            ["mapper/", "MapStruct entity ↔ DTO", "This module"],
          ]}
        />
        <Callout tone="rule">A module may use another module <B>only through its api package</B>. Importing another module&apos;s domain or repository fails the build (<C>ArchitectureTest</C>, Spring Modulith).</Callout>
        <p>
          Two ways modules talk: a <B>synchronous facade call</B> when both writes must succeed together (sales → inventory in one transaction), and a <B>domain event</B> for side effects (sales publishes <C>InvoicePosted</C>,
          accounting listens and posts the voucher). Events are stored, so nothing is lost if the server crashes.
        </p>
      </Section>

      <Section title="Follow one counter sale">
        <Flow
          steps={[
            { title: "1. Scan barcode", sub: "POS screen", tone: "slate" },
            { title: "2. GET item + batches", sub: "FEFO order", tone: "blue" },
            { title: "3. POST invoice", sub: "with Idempotency-Key", tone: "blue" },
            { title: "4. Price + GST", sub: "pricing, taxation", tone: "violet" },
            { title: "5. Lock & consume batch", sub: "inventory, FOR UPDATE", tone: "green" },
            { title: "6. Save in 1 transaction", sub: "invoice + lines + movements + payment", tone: "green" },
            { title: "7. InvoicePosted event", sub: "→ accounting, notification", tone: "amber" },
            { title: "8. Print / WhatsApp", sub: "201 Created", tone: "slate" },
          ]}
        />
      </Section>

      <Section title="Where code lives in the repo">
        <Table
          head={["Folder", "What"]}
          mono={[0]}
          rows={[
            ["apps/web", "Back office + POS + wholesale screens"],
            ["apps/desktop", "Electron: offline SQLite, sync, printing, barcode"],
            ["backend/meno-api", "The Spring Boot modular monolith"],
            ["packages/ui", "Design system (shadcn, tokens)"],
            ["packages/api-client", "Generated from the OpenAPI spec, never hand-written"],
            ["packages/billing-engine", "Offline GST/pricing maths (TypeScript, decimal.js)"],
            ["contracts/", "OpenAPI spec, test vectors, sync protocol"],
            ["infrastructure/", "Docker, Nginx, Azure, monitoring"],
          ]}
        />
      </Section>

      <Section title="What we deliberately did not do">
        <List items={["No microservices, Kafka or Kubernetes: 6 people don't need them; Spring Modulith lets us split later.", "No schema-per-tenant: one shared schema with row-level security is simpler to migrate."]} />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "A developer wants to add a Next.js API route that reads stock. Allowed?", a: "No. Next.js is only a client of /api/v1; stock is read through meno-api." },
            { q: "sales needs to check stock. Can it call inventory's repository?", a: "No. It calls inventory's api facade (StockFacade)." },
            { q: "Why is the ledger voucher an event and not a direct call?", a: "It is a side effect; the event is persisted and retried, and the sale doesn't depend on accounting being up." },
          ]}
        />
      </Section>
    </>
  );
}

export function TenancySecurity() {
  return (
    <>
      <Section title="Tenant → company → branch → device">
        <Flow
          steps={[
            { title: "Tenant", sub: "the paying business", tone: "violet" },
            { title: "Company", sub: "legal entity, own GSTIN, edition", tone: "blue" },
            { title: "Branch", sub: "shop / warehouse, own stock & numbers", tone: "green" },
            { title: "Device", sub: "registered counter PC", tone: "slate" },
          ]}
        />
        <p>
          Example: <B>Aruna Group</B> (tenant) owns <B>Aruna Medicals</B> (retail company, GSTIN 33…) with two branches, and <B>Aruna Distributors</B> (wholesale company). Users work at one or more branches.
        </p>
      </Section>

      <Section title="Five layers of isolation">
        <Table
          head={["#", "Layer", "What it does"]}
          rows={[
            ["1", "Token", "JWT carries tenant (tid), user (uid) and allowed branches. Active branch sent as X-Branch-Id and checked against the token."],
            ["2", "Request context", "TenantContextFilter sets tenant/branch per request. Tenant never comes from the request body."],
            ["3", "Hibernate filter", "Every tenant entity adds tenant_id = :tid to every query automatically."],
            ["4", "PostgreSQL RLS", "Each transaction runs SET LOCAL app.tenant_id; the database itself refuses other tenants' rows."],
            ["5", "Tests", "Every endpoint has a cross-tenant test: tenant A asking for B's id gets 404."],
          ]}
        />
        <Callout tone="note" title="Why 404 and not 403?">403 tells an attacker &quot;this exists but you can't see it&quot;. 404 leaks nothing.</Callout>
      </Section>

      <Section title="Permissions, not role names">
        <Table
          head={["Wrong", "Right"]}
          mono={[0, 1]}
          rows={[[`if (role == "PHARMACIST")`, `permissionChecker.require("sales.invoice.create")`]]}
        />
        <p>
          Permissions look like <C>module.resource.action</C>. Roles are seeded bundles that each tenant can edit. Sensitive numbers (purchase rate, margin) are removed <B>in the API response</B>, not just hidden in the UI.
        </p>
      </Section>

      <Section title="Security basics everyone follows">
        <List
          items={[
            "Cookies are HttpOnly, Secure, SameSite=Strict; same origin through Nginx.",
            "Secrets never in git; only *.example env files are committed.",
            "Never log passwords, tokens, or patient/prescription details.",
            "Every write is audited: who, when, tenant, branch, before/after.",
            "Platform admins bypass RLS only on /api/v1/platform/*, every call audited, with the tenant's time-boxed consent for support.",
          ]}
        />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "A request body contains tenantId. Should the server use it?", a: "No. Tenant always comes from the authenticated token." },
            { q: "A developer forgets the tenant filter in a native SQL query. What still protects us?", a: "PostgreSQL Row-Level Security." },
            { q: "Which test must every new endpoint have?", a: "A cross-tenant test asserting 404 for another tenant's id." },
          ]}
        />
      </Section>
    </>
  );
}

export function DataRules() {
  return (
    <>
      <Section title="1. Stock is a ledger">
        <p>
          Stock changes <B>only</B> by inserting <C>inventory_movement</C> rows in the same transaction as the business document. <C>stock_balance</C> is a cache derived from the movements and reconciled every night.
        </p>
        <Table head={["Never", "Always"]} mono={[0, 1]} rows={[["UPDATE stock SET qty = qty - 2", "INSERT inventory_movement (batch, -2, SALE, invoice_id)"]]} />
        <Callout tone="note">Like a bank passbook: you never rub out the balance, you add a line. The balance is the sum of the lines.</Callout>
      </Section>

      <Section title="2. Posted documents never change">
        <p>
          A posted invoice, purchase or voucher is <B>never edited or deleted</B>. A mistake is corrected with a <B>credit note, debit note or reversal</B>. Prices, taxes and party details are <B>snapshotted</B> onto the document,
          so changing the master later never changes an old bill.
        </p>
        <Flow
          steps={[
            { title: "DRAFT", sub: "editable", tone: "slate" },
            { title: "POSTED", sub: "stock + ledger effects, immutable", tone: "green" },
            { title: "REVERSED", sub: "by an opposite document", tone: "amber" },
          ]}
        />
      </Section>

      <Section title="3. Money is exact">
        <List
          items={[
            <>Java <C>BigDecimal</C>, SQL <C>numeric(18,4)</C>, TypeScript <C>decimal.js</C>. Never double, float or JS number for money.</>,
            "Store 4 decimals, show 2, round HALF_UP, round the invoice once at the end.",
            <>The same maths runs in Java and TypeScript; both must pass every case in <C>contracts/test-vectors/</C>.</>,
          ]}
        />
        <Callout tone="rule" title="Why not JavaScript numbers?">
          In JavaScript <C>0.1 + 0.2</C> is <C>0.30000000000000004</C>. On thousands of bills those tiny errors become wrong GST returns.
        </Callout>
      </Section>

      <Section title="4. Idempotency: retries are safe">
        <p>
          Every create/post endpoint for money or stock accepts an <C>Idempotency-Key</C>. If the network drops and the counter retries, the server returns the <B>original</B> invoice instead of creating a second one. Offline
          bills carry a client-generated UUID for the same reason.
        </p>
      </Section>

      <Section title="5. Validate in four layers">
        <Table
          head={["Layer", "Where", "Example"]}
          rows={[
            ["1 UI", "Zod schema in the form", "GSTIN must be 15 characters"],
            ["2 API", "Bean Validation on the request record", "@Gstin, @NotNull, @Size"],
            ["3 Domain", "Business rules that need state", "Batch expired → INVENTORY_BATCH_EXPIRED"],
            ["4 Database", "Constraints, RLS, triggers", "CHECK (qty >= 0), unique supplier invoice no."],
          ]}
        />
        <p>The UI is never the only check: it can be bypassed. Errors come back as Problem Details with all field errors at once and a stable code the UI turns into friendly text.</p>
      </Section>

      <Section title="6. Never hard-code business values">
        <Table
          head={["Never in code", "Comes from"]}
          rows={[
            ["GST rates, HSN → rate", "tax_rate, hsn_tax (effective-dated)"],
            ["States, units, payment modes", "Lookup tables via the API"],
            ["Near-expiry days, discount limits", "tenant_setting, approval_rule"],
            ["Invoice number format", "number_series per branch + FY + device"],
            ["Drug schedule rules", "schedule_rule"],
          ]}
        />
        <Callout tone="note">A document uses the rate valid <B>on the document date</B> and stores it on the document.</Callout>
      </Section>

      <Section title="Every table looks like this">
        <Table
          head={["Column", "Why"]}
          mono={[0]}
          rows={[
            ["id uuid (v7)", "Time-ordered, safe to generate offline"],
            ["tenant_id uuid not null", "Isolation + RLS; indexes start with it"],
            ["branch_id", "For branch-owned rows"],
            ["created_at/by, updated_at/by", "Audit"],
            ["version", "Optimistic locking"],
          ]}
        />
        <p>Human numbers like <C>INV/24-25/000123</C> are separate from the id, per branch and financial year. New schema = a new Flyway migration; an applied migration is never edited.</p>
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "A bill was posted with the wrong quantity. Fix it how?", a: "Reverse or correct it with a credit note (and a new bill if needed). Never edit the posted bill." },
            { q: "Where does the 5% GST on a medicine come from?", a: "From the hsn_tax configuration valid on the document date, then snapshotted onto the bill." },
            { q: "The counter's POST timed out and it retries with the same Idempotency-Key. What happens?", a: "The server returns the original invoice; no duplicate." },
          ]}
        />
      </Section>
    </>
  );
}
