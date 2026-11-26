# MENO architecture

> Audience: every developer and every AI agent. Diagrams are Mermaid (GitHub renders them; agents can read them as text).
> Decisions behind this design are recorded in [`docs/decisions/`](../decisions/README.md).

## 1. Shape of the system in one sentence

A **single Spring Boot modular monolith** (`meno-api`) owns all business rules and data in PostgreSQL; a **Next.js SPA** (`apps/web`) is the UI in the browser; an **Electron desktop app** (`apps/desktop`) wraps the same UI and adds an **offline SQLite store + sync engine** for counter billing; everything runs in **Docker** on an **Azure VM** behind **Nginx**.

## 2. System context (C4 level 1)

```mermaid
flowchart LR
    owner([Pharmacy owner / admin])
    cashier([Billing operator / pharmacist])
    acct([Accountant / auditor])
    whs([Wholesale sales & dispatch])
    meno[[MENO Pharmacy ERP]]
    gst[(GST e-invoice / e-way bill IRP)]
    wa[(WhatsApp Business / SMS gateway)]
    mail[(Email - SMTP)]
    tally[(Tally - export files)]
    dist[(Distributor CSV / purchase files)]

    owner --> meno
    cashier --> meno
    acct --> meno
    whs --> meno
    meno --> gst
    meno --> wa
    meno --> mail
    meno --> tally
    dist --> meno
```

## 3. Containers (C4 level 2)

```mermaid
flowchart TB
    subgraph Client["Client devices"]
        browser["Browser<br/>apps/web (Next.js static SPA)"]
        subgraph desktop["Counter PC - apps/desktop (Electron)"]
            renderer["Renderer<br/>same web build"]
            main["Main process<br/>sync engine, printers, scanner, updater"]
            sqlite[("SQLite<br/>encrypted offline store")]
            renderer -- "IPC (preload bridge)" --> main
            main --> sqlite
        end
    end

    subgraph Azure["Azure VM - Docker Compose"]
        nginx["Nginx<br/>TLS, static web, /api proxy, rate limit"]
        api["meno-api<br/>Spring Boot modular monolith"]
        redis[("Redis<br/>cache, rate limits, locks")]
        obs["Prometheus · Grafana · Loki"]
    end

    pg[("Azure Database for PostgreSQL<br/>Flexible Server")]
    blob[("Azure Blob Storage<br/>invoices PDF, prescriptions, imports, backups")]
    sentry[("Sentry")]

    browser -- HTTPS --> nginx
    renderer -- "HTTPS when online" --> nginx
    main -- "HTTPS /api/v1/sync" --> nginx
    nginx --> api
    api --> pg
    api --> redis
    api --> blob
    api -. metrics/logs .-> obs
    api -. errors .-> sentry
    browser -. errors .-> sentry
```

Key points:

- **Nginx** serves the static web build and proxies `/api/*` to `meno-api` → same origin, so auth cookies stay `HttpOnly; Secure; SameSite=Strict`.
- **The desktop renderer is the web build.** When online it talks to the API like the browser. When offline, the data layer switches to the IPC bridge (`window.meno.local`) and the main process serves reads/writes from SQLite (see [OFFLINE_SYNC.md](OFFLINE_SYNC.md)).
- **No Next.js server.** The web app is exported static (`output: 'export'`). This keeps one backend, makes the desktop bundle trivial, and Nginx can serve it for free.

## 4. Backend components (C4 level 3)

```mermaid
flowchart TB
    subgraph platform["Platform modules"]
        auth[auth]
        tenancy[tenancy<br/>tenant · company · branch]
        identity[identity<br/>users · roles · permissions]
        subscription[subscription]
        audit[audit]
        notification[notification]
        files[files]
        sync[sync]
    end
    subgraph masters["Master data"]
        catalog[catalog<br/>medicines · manufacturers · HSN · units]
        party[party<br/>suppliers · customers · retailers]
        pricing[pricing<br/>price lists · schemes · discounts]
    end
    subgraph ops["Operations"]
        purchase[purchase]
        inventory[inventory<br/>batches · movements · transfers]
        sales[sales<br/>POS · wholesale orders · invoices]
        returns[returns<br/>sales · purchase · expiry/breakage]
        compliance[compliance<br/>Schedule H/H1/X · prescriptions]
    end
    subgraph fin["Finance"]
        payment[payment]
        accounting[accounting<br/>ledgers · vouchers]
        taxation[taxation<br/>GST · e-invoice · GSTR]
    end
    reporting[reporting]
    fieldsales["fieldsales (Phase 6)"]

    purchase --> catalog & party & pricing & taxation & inventory
    sales --> catalog & party & pricing & taxation & inventory & compliance
    returns --> sales & purchase & inventory & taxation
    purchase -. PurchasePosted .-> accounting
    sales -. InvoicePosted .-> accounting
    returns -. ReturnPosted .-> accounting
    payment -. PaymentRecorded .-> accounting
    sales -. InvoicePosted .-> notification
    inventory -. StockLow / BatchExpiring .-> notification
    reporting --> accounting & inventory & sales & purchase
```

Solid arrow = synchronous call through the target's `api` facade. Dotted = domain event (Spring Modulith `@ApplicationModuleListener`, persisted in the event publication registry so nothing is lost on a crash). Every module also depends on `tenancy`, `identity` and `audit` (omitted for clarity). Full catalogue: [MODULES.md](MODULES.md).

### Layers inside a module

```mermaid
flowchart LR
    web["web/<br/>Controller + request/response DTO"] --> service["service/<br/>use cases, @Transactional"]
    service --> domain["domain/<br/>entities, value objects, rules"]
    service --> repository["repository/<br/>Spring Data JPA"]
    service --> other["other module's api/"]
    mapper["mapper/<br/>MapStruct"] -.- web
    api["api/<br/>facade interface, public DTOs, events"] --> service
```

## 5. Key flows

### 5.1 Retail counter sale (online)

```mermaid
sequenceDiagram
    autonumber
    actor C as Cashier
    participant W as POS screen
    participant A as meno-api (sales)
    participant I as inventory
    participant T as taxation/pricing
    participant DB as PostgreSQL
    C->>W: scan barcode / search
    W->>A: GET /catalog/items?barcode=… (+ batches FEFO)
    C->>W: qty, discount, customer, payment
    W->>A: POST /sales/invoices (Idempotency-Key)
    A->>T: price + scheme + GST lines
    A->>I: reserve & consume batches (SELECT … FOR UPDATE)
    A->>DB: invoice + lines + movements + payment (1 transaction)
    A-->>W: 201 invoice (number, totals)
    A--)A: event InvoicePosted → accounting, notification
    W->>C: print / WhatsApp share
```

### 5.2 Purchase entry → stock

Supplier invoice entered (or imported from distributor CSV) → lines matched to catalog items → batches created/updated (batch no, expiry, MRP, PTR, free qty) → `inventory_movement(+)` per batch → supplier ledger credited via `PurchasePosted` event.

### 5.3 Offline sale → sync

See [OFFLINE_SYNC.md](OFFLINE_SYNC.md) §4.

## 6. Deployment

```mermaid
flowchart LR
    dev[Developer PR] --> gha[GitHub Actions<br/>build · test · scan · image]
    gha --> ghcr[(GHCR images)]
    ghcr --> stg[Azure VM - staging<br/>docker compose]
    stg --> qa{QA sign-off}
    qa --> prod[Azure VM - production<br/>docker compose]
    prod --> mon[Grafana alerts · Sentry]
```

Details: [docs/deployment/AZURE_DEPLOYMENT.md](../deployment/AZURE_DEPLOYMENT.md).

**Until the pilot ([ADR-0017](../decisions/0017-azure-app-service-free-tier.md)):** GitHub Actions tests every PR, then deploys the jar to an Azure App Service: `develop` → staging, `main` → production, each followed by a smoke test. The VM + Docker Compose flow above is the target once we need Redis, nginx and monitoring on our own host. Setup: [AZURE_APP_SERVICE.md](../deployment/AZURE_APP_SERVICE.md).

## 7. Quality attributes and how we meet them

| Attribute | Target | Mechanism |
|---|---|---|
| Correct money | 0 rounding drift | `BigDecimal`, shared test vectors, immutable posted docs |
| Correct stock | no oversell, no negative stock (unless tenant allows) | movement ledger, row locks per batch, nightly reconciliation |
| Tenant isolation | 0 cross-tenant reads | token-derived tenant, Hibernate filter + PostgreSQL RLS, cross-tenant tests |
| POS speed | item search < 150 ms p95, invoice post < 500 ms p95 | indexes, Redis cache for catalog, keyboard-first UI |
| Offline | 3 days of counter billing without internet | SQLite, local numbering series, idempotent sync |
| Availability | 99.5 % (single VM, documented recovery) | health checks, restart policies, daily backups + restore drill |
| Auditability | every write traceable | audit module, posted-document snapshots |
| Maintainability | a fresher can add a module safely | module template, Spring Modulith tests, AGENTS.md per folder |

## 8. What we deliberately did not do (yet)

- Microservices, Kafka, Kubernetes — unnecessary for 6 people; Spring Modulith lets us extract later.
- Schema-per-tenant — shared schema + RLS is simpler to migrate; revisit for very large tenants.
- Native mobile — deferred to Phase 6 (ADR-0008).
