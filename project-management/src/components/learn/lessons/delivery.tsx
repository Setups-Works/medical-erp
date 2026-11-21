"use client";

import { B, C, Callout, Flow, List, Quiz, Section, Sub, Table } from "../kit";

export function OfflineSync() {
  return (
    <>
      <Section title="Why offline">
        <p>
          A counter with a queue cannot stop when the internet drops. The <B>desktop app</B> keeps billing for up to 3 days without internet and sends the bills to the server safely when it reconnects. The browser version is
          online-only.
        </p>
        <Table
          head={["Works offline (desktop)", "Online only"]}
          rows={[
            ["Retail POS invoice (cash, UPI, card recorded, credit to a known customer)", "Purchases, GRN, imports"],
            ["Held bills", "Stock transfers, adjustments, counts"],
            ["Sales return against a bill from the same device", "Accounting and most reports"],
            ["Item / batch / customer search, price lookup", "Master edits, user admin, e-invoice"],
            ["Day-end summary for the device", "Wholesale credit bills (only if the tenant allows, with a cap)"],
          ]}
        />
      </Section>

      <Section title="What's on the counter PC">
        <Table
          head={["Store", "Holds", "Direction"]}
          rows={[
            ["Reference snapshot", "Items, this branch's batches and stock, prices, schemes, tax rates, customers, doctors, settings", "Server → device (read-only)"],
            ["Outbox", "Invoices, returns, payments, held bills, each with a UUIDv7 and a local number", "Device → server"],
            ["Local stock ledger", "Offline sales subtracted from snapshot stock", "On device"],
          ]}
        />
        <p>
          SQLite is encrypted (SQLCipher, key in the OS keychain). It is a <B>cache + outbox</B>; PostgreSQL stays the system of record.
        </p>
      </Section>

      <Section title="Numbers that never collide">
        <p>
          Each registered device gets its <B>own number series block</B>, for example <C>TBM-D2/24-25/00001…</C>. Two counters billing offline at the same time can never produce the same invoice number, and every offline bill is
          legally numbered the moment it is printed.
        </p>
      </Section>

      <Section title="The sync loop (every 30 s and on reconnect)">
        <Flow
          steps={[
            { title: "1. Push", sub: "POST /sync/push: docs in local order", tone: "blue" },
            { title: "2. Idempotency check", sub: "by document UUID", tone: "violet" },
            { title: "3. Re-price & post", sub: "server recomputes totals, consumes stock", tone: "green" },
            { title: "4. Reply", sub: "accepted or conflict", tone: "amber" },
            { title: "5. Pull", sub: "GET /sync/pull?cursor=… changed reference data", tone: "slate" },
          ]}
        />
        <List
          ordered
          items={[
            <><B>Push before pull.</B> One transaction per document, so one bad bill doesn&apos;t block the rest.</>,
            <><B>Idempotent by document UUID.</B> Retries forever with backoff; duplicates are impossible.</>,
            <><B>The server is the authority for totals.</B> If they differ by more than ₹0.01 the bill is still accepted (the customer paid) and a <C>TOTAL_MISMATCH</C> conflict is raised: it means the TypeScript and Java maths disagree.</>,
            <><B>Never silently overwrite.</B> Conflicts go to the manager&apos;s Sync issues screen.</>,
          ]}
        />
      </Section>

      <Section title="Conflicts and what happens">
        <Table
          head={["Conflict", "Policy"]}
          rows={[
            ["Another counter sold the same batch → stock negative", "Accept (goods already left), NEGATIVE_STOCK for the manager"],
            ["Batch expired between snapshot and sale", "Blocked locally; if it reaches the server: accept + EXPIRED_BATCH_SOLD alert"],
            ["Price changed on the server", "Accept the device price, log STALE_PRICE"],
            ["Customer credit limit exceeded", "Accept, flag CREDIT_LIMIT"],
            ["Item blocked on the server (e.g. banned)", "Accept, flag BLOCKED_ITEM (high severity)"],
          ]}
        />
      </Section>

      <Section title="Security on the device">
        <List
          items={[
            "A Branch Manager registers the device; a revoked device is rejected and wipes its local data.",
            "Offline login only if the user logged in online on this device within N days (default 3), with a PIN hash, never the password.",
            "Status bar: Online · synced 12s ago / Offline · 37 bills waiting / Sync issue: 2 conflicts.",
          ]}
        />
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "The same offline bill is pushed twice after a network blip. Result?", a: "Accepted once; the second push returns the same result (idempotent by UUID)." },
            { q: "Can a cashier edit a medicine's MRP while offline?", a: "No. Reference data is read-only on the device." },
            { q: "What does TOTAL_MISMATCH tell the team?", a: "packages/billing-engine and the Java engine disagree: a parity bug to fix with test vectors." },
          ]}
        />
      </Section>
    </>
  );
}

export function HowWeWork() {
  return (
    <>
      <Section title="Where the truth lives">
        <Table
          head={["Question", "Source"]}
          rows={[
            ["What to build, who owns it", "GitHub Issues / this Hub's tasks"],
            ["How to build it", "docs/"],
            ["What exists today", "The code"],
            ["What is done", "docs/planning/CURRENT_STATE.md"],
          ]}
        />
        <p>If they disagree, say so in the PR instead of guessing.</p>
      </Section>

      <Section title="From task to production">
        <Flow
          steps={[
            { title: "Pick a task", sub: "Hub board / My tasks", tone: "slate" },
            { title: "Read", sub: "issue, docs, folder AGENTS.md", tone: "blue" },
            { title: "Branch", sub: "feature/<issue>-name from develop", tone: "blue" },
            { title: "Build + test", sub: "small Conventional Commits", tone: "green" },
            { title: "Checks", sub: "mvnw verify · pnpm typecheck test check:design", tone: "amber" },
            { title: "PR → develop", sub: "CODEOWNERS review, green CI", tone: "violet" },
            { title: "Release", sub: "develop → main, staging, QA sign-off", tone: "slate" },
          ]}
        />
        <Callout tone="rule">Never commit to main or develop, never merge your own PR, never add AI attribution lines. Never edit an applied migration or the test vectors without the issue saying so.</Callout>
      </Section>

      <Section title="Build one feature end to end (example: GST on a sales line)">
        <List
          ordered
          items={[
            <>Business rule confirmed in docs (CALCULATIONS.md) and user story with acceptance criteria.</>,
            <>Test vectors added to <C>contracts/test-vectors/gst/</C> first.</>,
            <>Java: <C>taxation</C> <C>GstCalculator</C> with unit tests passing the vectors.</>,
            <>TypeScript: <C>packages/billing-engine</C> passing the same vectors.</>,
            <>API: endpoint + Bean Validation + Problem Details; OpenAPI exported; <C>packages/api-client</C> regenerated.</>,
            <>Screen in <C>apps/web</C> using <C>packages/ui</C>, Zod form, TanStack Query hook, keyboard-operable, light + dark.</>,
            <>Integration test with Testcontainers including the cross-tenant 404 test; scenario test from TEST_STRATEGY.md.</>,
            <>Docs updated (DATA_MODEL, CURRENT_STATE, folder AGENTS.md), PR with Closes #n.</>,
          ]}
        />
      </Section>

      <Section title="Working with AI agents">
        <List
          items={[
            "Agents follow the same AGENTS.md contract as people; role agents live in .claude/agents/.",
            <>Agents can work a Hub task by number with <C>npm run agent-task</C> (start, tick, comment, review).</>,
            "The developer who opens the PR is the author and reviews AI-written code line by line.",
            "Never put real customer, patient or prescription data in prompts, fixtures or screenshots.",
          ]}
        />
      </Section>

      <Section title="Using this Hub every day">
        <Table
          head={["Page", "Use it to"]}
          rows={[
            ["My tasks", "See your next tasks in order"],
            ["Boards", "Move tasks across columns per phase; badges show the feature and pages a task builds"],
            ["Features / Pages", "Find any feature ID or screen with its status and owners"],
            ["Product map", "See the sidebar and capability coverage"],
            ["Learn", "These lessons; Download PDF for handouts"],
          ]}
        />
        <Sub>Daily rhythm</Sub>
        <p>Stand-up → pick the top task → small commits → PR the same day where possible → update the task and tick its checklist.</p>
      </Section>

      <Section title="Check yourself">
        <Quiz
          items={[
            { q: "You need a new endpoint. What must the PR include besides code?", a: "OpenAPI update + regenerated api-client, integration test with cross-tenant 404, audit for writes, docs updates." },
            { q: "Your tax maths changes. What do you change first?", a: "The test vectors in contracts/test-vectors/, then Java and TypeScript." },
          ]}
        />
      </Section>
    </>
  );
}
