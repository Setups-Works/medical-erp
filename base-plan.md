# MENO — Enterprise Pharmacy ERP
## Product Architecture, Engineering Team & Implementation Plan

**Project:** MENO  
**Organization:** Setups Works  
**Product Category:** Pharmacy Management & Billing ERP  
**Business Model:** Multi-tenant SaaS  
**Product Strategy:** Unified Retail + Wholesale Platform  
**Development Team:** 6 Members  
**Backend:** Java + Spring Boot  
**Frontend:** Next.js + TypeScript  
**Architecture:** Modular Monolith + API-First Architecture

---

# 1. Product Vision

MENO is an enterprise-grade Pharmacy Management and Billing ERP designed for:

- Retail medical shops
- Wholesale medicine distributors
- Pharmaceutical suppliers
- Multi-branch pharmacies
- Pharmacy chains

The objective is to create one unified platform with Retail and Wholesale editions, sharing common business modules, inventory, financial management, reporting, and administration.

### Core product principles

1. Enterprise-grade security.
2. Reliable billing and financial calculations.
3. Batch-wise medicine inventory.
4. Multi-company and multi-branch support.
5. Scalable multi-tenant architecture.
6. Offline-capable billing with reliable synchronization.
7. Accurate financial and stock records.
8. Maintainable and well-documented code.
9. Automated testing and deployment.
10. Simple and professional user experience.

# 2. Team Organization

## Team members and responsibilities

| Member | Designation | Primary Responsibility |
|---|---|---|
| Nitheesh | Tech Lead & Full-stack Engineer | Architecture, product development, technical decisions |
| Prakalya | Business Analyst & Product Operations | Business requirements, workflows, documentation |
| Kamesh | Backend Engineer | Spring Boot, APIs, database and business logic |
| Meyyarivu | Frontend Engineer | Next.js, UI, frontend architecture |
| Ashok | QA Engineer | Manual testing, automation and release validation |
| Jeeva | DevOps Engineer | Infrastructure, CI/CD, deployment and monitoring |

All members are initially beginners/freshers. Responsibilities are ownership areas, with mentoring and cross-training encouraged.

## 2.1 Nitheesh — Tech Lead & Full-stack Engineer

Responsibilities:

- Define the overall product vision.
- Own the technical architecture.
- Define engineering standards.
- Coordinate frontend and backend development.
- Review critical pull requests.
- Approve major technical decisions.
- Manage product roadmap and sprint priorities.
- Handle full-stack development and integration.
- Coordinate production releases.

## 2.2 Prakalya — Business Analyst & Product Operations

Responsibilities:

- Research retail and wholesale pharmacy operations.
- Understand existing billing software.
- Document business workflows.
- Prepare Business Requirement Documents (BRDs).
- Prepare Functional Requirement Specifications (FRS).
- Create user stories and acceptance criteria.
- Maintain product backlog.
- Validate implemented business workflows.
- Collect and organize customer feedback.

## 2.3 Kamesh — Backend Engineer

Responsibilities:

- Develop Spring Boot backend services.
- Design REST APIs.
- Design PostgreSQL database schemas.
- Implement authentication and authorization.
- Develop business logic.
- Implement inventory and transaction management.
- Implement purchase, sales and return workflows.
- Write unit and integration tests.
- Maintain API documentation.

## 2.4 Meyyarivu — Frontend Engineer

Responsibilities:

- Develop Next.js application.
- Implement responsive UI.
- Build reusable components.
- Integrate backend APIs.
- Develop billing and inventory screens.
- Implement frontend validation.
- Manage frontend state.
- Maintain design consistency.
- Write frontend tests.

## 2.5 Ashok — QA Engineer

Responsibilities:

- Prepare test strategies and test plans.
- Create detailed test cases.
- Test all business workflows.
- Validate billing calculations.
- Validate stock movements.
- Perform API testing.
- Perform regression testing.
- Develop automated test cases.
- Maintain defect reports.
- Provide release QA recommendations.

## 2.6 Jeeva — DevOps Engineer

Responsibilities:

- Set up development, staging and production environments.
- Configure Docker.
- Configure CI/CD pipelines.
- Manage deployment infrastructure.
- Configure database backups.
- Set up application monitoring.
- Configure centralized logging.
- Implement infrastructure security.
- Manage secrets and environment variables.
- Prepare disaster recovery procedures.
- Maintain deployment documentation.

---

# 3. Technology Stack

## 3.1 Frontend

| Technology | Purpose |
|---|---|
| Next.js | Web application |
| React | UI development |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Reusable components |
| TanStack Query | Server-state management |
| React Hook Form | Form management |
| Zod | Frontend validation |
| Playwright | End-to-end testing |
| Vitest | Unit testing |

## 3.2 Backend

| Technology | Purpose |
|---|---|
| Java 21 LTS | Backend language |
| Spring Boot 4.x | Backend framework |
| Spring Web | REST APIs |
| Spring Security | Authentication and authorization |
| Spring Data JPA | Database operations |
| Hibernate | ORM |
| PostgreSQL | Primary database |
| Flyway | Database migrations |
| Redis | Caching and distributed coordination |
| Spring Boot Actuator | Application health |
| Springdoc OpenAPI | API documentation |
| JUnit 5 | Unit testing |
| Mockito | Mock testing |
| Testcontainers | Integration testing |

Use a compatible, supported Spring Boot release and pin the exact version after dependency compatibility testing.

## 3.3 Desktop and Offline Support

| Technology | Purpose |
|---|---|
| Tauri | Desktop application |
| SQLite | Local offline storage |
| Next.js | Shared frontend |
| Spring Boot | Central backend |
| Synchronization engine | Offline-to-cloud synchronization |

Offline billing should be implemented as a carefully designed capability, not assumed to work automatically through SQLite.

## 3.4 DevOps and Infrastructure

| Technology | Purpose |
|---|---|
| GitHub | Source control |
| GitHub Actions | CI/CD |
| Docker | Containerization |
| Docker Compose | Local development |
| Nginx | Reverse proxy |
| Linux | Server infrastructure |
| Grafana | Dashboards |
| Prometheus | Metrics |
| OpenTelemetry | Observability |
| Sentry | Error tracking |
| S3-compatible storage | File storage |

---

# 4. System Architecture

MENO will initially follow a **Modular Monolith Architecture**.

The backend will be one Spring Boot application, with clearly separated business modules.

Avoid starting with microservices. A modular monolith is more practical for a six-member team and allows future service extraction when justified.

## 4.1 High-Level Architecture

```text
                   MENO PHARMACY ERP
                           |
             +-------------+-------------+
             |                           |
       RETAIL EDITION              WHOLESALE EDITION
             |                           |
             +-------------+-------------+
                           |
                 SHARED BUSINESS MODULES
                           |
       +---------------------------------------+
       | Company & Branch Management           |
       | Medicine Master                      |
       | Supplier & Customer Management       |
       | Purchase Management                  |
       | Inventory & Batch Management         |
       | Sales & Billing                      |
       | Returns & Adjustments                |
       | Financial Management                 |
       | GST & Tax Management                 |
       | Reports & Analytics                  |
       | User & Permission Management         |
       | Audit Management                     |
       +---------------------------------------+
                           |
                    REST API LAYER
                           |
                  SPRING BOOT BACKEND
                           |
       +---------------------------------------+
       | Authentication & Authorization        |
       | Business Logic                        |
       | Validation                            |
       | Transaction Management                |
       | Tenant Isolation                      |
       +---------------------------------------+
                           |
                    DATA LAYER
                           |
       +---------------------------------------+
       | PostgreSQL                            |
       | Redis                                 |
       | Object Storage                        |
       | SQLite (Offline Desktop)              |
       +---------------------------------------+
                           |
                    INFRASTRUCTURE
                           |
       +---------------------------------------+
       | Docker                                |
       | GitHub Actions                        |
       | Linux Server                          |
       | Monitoring & Logging                  |
       | Backup & Disaster Recovery            |
       +---------------------------------------+
```

## 4.2 Architecture Principles

- Separate business modules.
- Define clear module boundaries.
- Avoid direct access to another module's internal repositories.
- Use service interfaces for module communication.
- Use database transactions for financial and stock operations.
- Implement tenant isolation at the backend.
- Maintain audit history.
- Version APIs.
- Use database migrations.
- Implement structured logging.
- Keep business rules independent of controllers.

---

# 5. Recommended Repository Structure

Repository name: `meno`

Use a monorepo to manage frontend, backend, desktop, infrastructure and documentation together.

```text
meno/
│
├── apps/
│   │
│   ├── web/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── types/
│   │   │   └── styles/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── desktop/
│       ├── src/
│       ├── src-tauri/
│       ├── package.json
│       └── README.md
│
├── backend/
│   └── meno-api/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/setupsworks/meno/
│       │   │   │       │
│       │   │   │       ├── MenoApplication.java
│       │   │   │       │
│       │   │   │       ├── config/
│       │   │   │       ├── security/
│       │   │   │       ├── common/
│       │   │   │       ├── tenancy/
│       │   │   │       │
│       │   │   │       ├── modules/
│       │   │   │       │   ├── auth/
│       │   │   │       │   ├── company/
│       │   │   │       │   ├── branch/
│       │   │   │       │   ├── users/
│       │   │   │       │   ├── roles/
│       │   │   │       │   ├── medicine/
│       │   │   │       │   ├── categories/
│       │   │   │       │   ├── suppliers/
│       │   │   │       │   ├── customers/
│       │   │   │       │   ├── purchase/
│       │   │   │       │   ├── inventory/
│       │   │   │       │   ├── sales/
│       │   │   │       │   ├── billing/
│       │   │   │       │   ├── returns/
│       │   │   │       │   ├── pricing/
│       │   │   │       │   ├── payments/
│       │   │   │       │   ├── accounting/
│       │   │   │       │   ├── taxation/
│       │   │   │       │   ├── reports/
│       │   │   │       │   ├── notifications/
│       │   │   │       │   ├── audit/
│       │   │   │       │   └── subscription/
│       │   │   │       │
│       │   │   │       └── integrations/
│       │   │   │
│       │   │   └── resources/
│       │   │       ├── application.yml
│       │   │       ├── application-dev.yml
│       │   │       ├── application-test.yml
│       │   │       ├── application-prod.yml
│       │   │       └── db/migration/
│       │   │
│       │   └── test/
│       │       └── java/
│       │
│       ├── pom.xml
│       └── README.md
│
├── packages/
│   ├── shared-types/
│   ├── shared-validation/
│   └── shared-ui/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── ci-cd/
│   ├── monitoring/
│   ├── backup/
│   └── deployment/
│
├── docs/
│   ├── product/
│   ├── business-requirements/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── security/
│   ├── testing/
│   ├── deployment/
│   ├── workflows/
│   └── decisions/
│
├── scripts/
├── .github/
│   └── workflows/
│
├── .editorconfig
├── .gitignore
├── .dockerignore
├── docker-compose.yml
├── README.md
└── LICENSE
```

## 5.1 Backend Module Structure

Each backend business module should follow a consistent internal structure.

Example: Medicine module.

```text
medicine/
│
├── controller/
│   └── MedicineController.java
│
├── service/
│   ├── MedicineService.java
│   └── MedicineServiceImpl.java
│
├── repository/
│   └── MedicineRepository.java
│
├── entity/
│   └── Medicine.java
│
├── dto/
│   ├── request/
│   └── response/
│
├── mapper/
│   └── MedicineMapper.java
│
├── validation/
│
├── exception/
│
└── specification/
```

Apply the same convention to purchase, inventory, sales, billing and other modules.

Controllers should handle HTTP requests, services should own business operations, repositories should handle persistence, and DTOs should define API contracts.

---

# 6. Core Business Modules

## 6.1 Company & Branch Management

- Company registration.
- Multiple branches.
- Branch-specific configuration.
- Business information.
- GST registration details.
- Subscription plans.
- Tenant-level settings.

## 6.2 Medicine Master

- Medicine name.
- Generic name.
- Brand name.
- Manufacturer.
- Composition.
- HSN code.
- GST rate.
- Schedule classification.
- Dosage form.
- Unit of measurement.
- Barcode.
- Prescription classification.
- Minimum stock settings.

## 6.3 Supplier Management

- Supplier information.
- GST details.
- Contact information.
- Purchase history.
- Payment history.
- Outstanding balances.
- Credit terms.

## 6.4 Customer Management

- Customer information.
- Contact details.
- Purchase history.
- Credit limits.
- Outstanding payments.
- Customer ledger.

## 6.5 Purchase Management

- Purchase orders.
- Purchase invoices.
- Supplier invoices.
- Purchase returns.
- Purchase discounts.
- Tax calculations.
- Batch creation.
- Purchase payment tracking.

## 6.6 Inventory Management

- Batch-wise stock.
- Batch number.
- Manufacturing date.
- Expiry date.
- Purchase price.
- Selling price.
- MRP.
- Stock adjustment.
- Stock transfers.
- Expiry alerts.
- Low-stock alerts.
- Stock reconciliation.

## 6.7 Retail Billing

- Fast POS billing.
- Barcode scanning.
- Medicine search.
- Batch selection.
- Discounts.
- GST calculation.
- Multiple payment methods.
- Credit sales.
- Sales returns.
- Invoice printing.
- Daily sales reports.

## 6.8 Wholesale Management

- Bulk orders.
- Distributor pricing.
- Retailer management.
- Multiple pricing levels.
- Credit management.
- Outstanding payments.
- Bulk invoices.
- Sales returns.
- Stock transfers.

## 6.9 Financial Management

- Cash management.
- Payment collection.
- Supplier payments.
- Customer receipts.
- Expenses.
- Ledgers.
- Outstanding balances.
- Profit and loss reports.
- Financial reconciliation.

## 6.10 Reports & Analytics

- Daily sales.
- Monthly sales.
- Purchase reports.
- Inventory valuation.
- Expiry reports.
- Low-stock reports.
- Profit reports.
- Customer outstanding.
- Supplier outstanding.
- Branch-wise performance.

---

# 7. Enterprise Database Design

Use PostgreSQL as the primary database.

Important design rules:

1. Every tenant-owned business record must have a tenant identifier.
2. Branch-level records must be associated with the correct branch.
3. Use foreign keys and database constraints.
4. Use indexes for frequent lookup operations.
5. Use decimal types for financial amounts.
6. Use appropriate date and timestamp types.
7. Use database migrations through Flyway.
8. Maintain transaction consistency.
9. Avoid unnecessary duplicate data.
10. Use soft deletion only where business and legal requirements permit it.

## Important database entities

```text
Tenant
 ├── Company
 ├── Branch
 ├── User
 ├── Role
 ├── Permission
 ├── Medicine
 ├── Supplier
 ├── Customer
 ├── Purchase
 │    └── PurchaseItem
 ├── Batch
 ├── InventoryMovement
 ├── Sales
 │    └── SalesItem
 ├── Invoice
 ├── Payment
 ├── PurchaseReturn
 ├── SalesReturn
 ├── Ledger
 └── AuditLog
```

### Inventory architecture

Do not maintain stock only as a manually editable quantity.

Use an inventory movement ledger:

- Purchase receipt increases stock.
- Sales reduce stock.
- Purchase returns reduce stock.
- Sales returns increase stock after validation.
- Stock adjustments record authorized changes.
- Transfers record movement between branches.

Maintain a current stock balance for performance, but reconcile it against the movement ledger.

### Financial architecture

- Use immutable posted transactions.
- Maintain proper debit and credit entries.
- Store transaction snapshots.
- Use controlled reversals and adjustments.
- Never silently modify historical invoices.
- Reconcile payment records and outstanding balances.

---

# 8. Multi-Tenant Architecture

MENO will support multiple independent pharmacy businesses.

Example:

```text
MENO PLATFORM
│
├── Tenant A - ABC Medicals
│   ├── Chennai Branch
│   └── Tambaram Branch
│
├── Tenant B - XYZ Pharmacy
│   ├── Main Branch
│   └── Secondary Branch
│
└── Tenant C - Wholesale Distributor
    ├── Warehouse
    └── Distribution Branch
```

Each tenant must access only its authorized data.

### Recommended initial approach

Use a shared PostgreSQL database with tenant identifiers and strict tenant-scoped access.

Implement:

- Tenant context resolution.
- Backend tenant authorization.
- Tenant-aware repository queries.
- Database constraints.
- PostgreSQL Row-Level Security where appropriate.
- Cross-tenant access tests.
- Tenant-aware background jobs.

Never trust a tenant ID supplied by the frontend without verifying the authenticated user's membership and permissions.

---

# 9. Offline Architecture

Offline support is important for pharmacy counter billing.

Recommended design:

```text
             DESKTOP APPLICATION
                     |
                  TAURI
                     |
             NEXT.JS FRONTEND
                     |
                LOCAL API
                     |
                  SQLITE
                     |
             SYNC ENGINE
                     |
              INTERNET AVAILABLE
                     |
               SPRING BOOT
                     |
                POSTGRESQL
```

Offline design requirements:

- Local transaction IDs.
- Idempotent synchronization.
- Sync queues.
- Conflict detection.
- Retry mechanisms.
- Sync status tracking.
- Server acknowledgement.
- Local data encryption.
- Device registration.
- Audit records.

Define clear conflict policies for inventory and financial records.

Never allow offline and online transactions to silently overwrite each other.

---

# 10. API Development Standards

Use versioned REST APIs.

Base URL:

```text
/api/v1/
```

Example endpoints:

```text
/api/v1/auth
/api/v1/companies
/api/v1/branches
/api/v1/medicines
/api/v1/suppliers
/api/v1/customers
/api/v1/purchases
/api/v1/inventory
/api/v1/sales
/api/v1/billing
/api/v1/payments
/api/v1/reports
/api/v1/users
```

### API standards

- Consistent request and response DTOs.
- Request validation.
- Standardized error responses.
- Pagination.
- Filtering and sorting.
- API versioning.
- Authentication.
- Authorization.
- Idempotency for critical operations.
- OpenAPI documentation.
- Rate limiting.
- Structured logging.

Example response:

```json
{
  "success": true,
  "message": "Medicine created successfully",
  "data": {
    "id": "MED-0001",
    "name": "Example Medicine"
  },
  "timestamp": "2026-11-20T10:30:00Z"
}
```

---

# 11. Security Requirements

Security must be included from the beginning.

- Spring Security.
- Secure authentication.
- Role-based access control.
- Tenant isolation.
- Password hashing using a strong adaptive algorithm.
- HTTPS.
- Secure session/token management.
- Refresh-token rotation where applicable.
- Input validation.
- SQL injection prevention.
- Audit logging.
- Rate limiting.
- Secrets management.
- Database access restrictions.
- Encrypted backups.
- Dependency vulnerability scanning.
- Regular security testing.

Important roles may include:

- Super Admin.
- Company Admin.
- Branch Manager.
- Pharmacist.
- Billing Operator.
- Inventory Manager.
- Accountant.
- Auditor.

Permissions should be configurable rather than hardcoded to screen names.

---

# 12. DevOps & Deployment Strategy

Jeeva owns infrastructure and release automation.

## Environments

```text
LOCAL DEVELOPMENT
       |
       v
DEVELOPMENT
       |
       v
STAGING
       |
       v
PRODUCTION
```

## CI/CD pipeline

```text
Developer Push
      |
      v
GitHub Pull Request
      |
      v
Code Review
      |
      v
Build & Static Analysis
      |
      v
Unit & Integration Tests
      |
      v
Security Scanning
      |
      v
Docker Image Build
      |
      v
Staging Deployment
      |
      v
QA Validation
      |
      v
Production Approval
      |
      v
Production Deployment
      |
      v
Monitoring & Alerts
```

## Infrastructure responsibilities

- Containerized deployments.
- Environment-specific configurations.
- Secure secrets storage.
- Automated database backups.
- Backup restoration testing.
- Centralized application logs.
- CPU, memory and database monitoring.
- Error alerts.
- Deployment rollback procedures.
- Disaster recovery documentation.

Do not expose production credentials in GitHub repositories.

---

# 13. Quality Assurance Strategy

Ashok owns QA planning and validation.

## Testing levels

| Testing type | Purpose |
|---|---|
| Unit testing | Individual business logic |
| Integration testing | Backend and database |
| API testing | Request and response validation |
| UI testing | Frontend workflows |
| E2E testing | Complete business workflows |
| Regression testing | Existing functionality |
| Performance testing | Load and response time |
| Security testing | Vulnerabilities and access control |
| Recovery testing | Backup restoration |

### Critical test scenarios

1. Purchase invoice creates correct stock.
2. Sales invoice reduces correct batch stock.
3. Expired batches cannot be sold.
4. Sales return updates stock correctly.
5. Purchase return updates supplier balances correctly.
6. Concurrent billing does not oversell inventory.
7. GST calculations are correct.
8. Customer outstanding is correct.
9. Users cannot access another tenant's data.
10. Branch transfers reconcile correctly.
11. Duplicate API requests do not create duplicate invoices.
12. Offline transactions synchronize without duplication.

---

# 14. GitHub Repository & Development Workflow

Repository:

```text
github.com/SetupsWorks/meno
```

Suggested branch strategy:

```text
main
develop
feature/*
bugfix/*
release/*
hotfix/*
```

### Branch rules

- No direct commits to main.
- Pull requests are mandatory.
- Code reviews are mandatory.
- Automated tests must pass.
- No secrets in source code.
- Database changes require migrations.
- Critical business logic requires tests.
- QA approval is required before release.

### Commit naming

```text
feat: add medicine master
fix: resolve stock calculation issue
test: add purchase workflow tests
refactor: improve inventory service
docs: update API documentation
chore: configure CI pipeline
```

### Issue management

Each task should include:

- Title.
- Description.
- Business requirement.
- Acceptance criteria.
- Assigned developer.
- Priority.
- Estimated effort.
- Testing requirements.
- Completion status.

Use GitHub Projects to manage the sprint backlog.

---

# 15. Development Workflow

Use two-week Agile sprints.

## Daily stand-up

Every member shares:

1. What was completed yesterday?
2. What will be completed today?
3. Are there any blockers?

## Weekly review

- Review pull requests.
- Review API integration.
- Review test reports.
- Discuss blockers.
- Check infrastructure health.

## Sprint review

- Demonstrate completed features.
- Validate business workflows.
- Review QA results.
- Discuss technical debt.
- Plan the next sprint.

---

# 16. Six-Month Development Roadmap

## Month 1 — Foundation

- Product research.
- Business requirements.
- Architecture.
- Database design.
- UI/UX system.
- Repository setup.
- Spring Boot foundation.
- Next.js foundation.
- CI/CD.
- Authentication and tenant foundation.

**Milestone:** Architecture and development foundation approved.

## Month 2 — Master Management

- Company management.
- Branch management.
- User management.
- Roles and permissions.
- Medicine master.
- Supplier master.
- Customer master.
- Categories and units.

**Milestone:** Master modules working.

## Month 3 — Purchase & Inventory

- Purchase orders.
- Purchase invoices.
- Batch management.
- Inventory movements.
- Expiry tracking.
- Stock adjustments.
- Purchase returns.
- Stock reports.

**Milestone:** Inventory workflow complete.

## Month 4 — Retail Billing

- POS.
- Barcode scanning.
- Sales invoices.
- Discounts.
- Tax calculations.
- Payment methods.
- Sales returns.
- Daily reports.

**Milestone:** Retail MVP.

## Month 5 — Wholesale Management

- Bulk orders.
- Distributor pricing.
- Credit management.
- Outstanding balances.
- Wholesale invoicing.
- Branch transfers.
- Wholesale reports.

**Milestone:** Wholesale MVP.

## Month 6 — Enterprise Readiness

- Offline synchronization.
- Security testing.
- Performance testing.
- Regression automation.
- Backup restoration.
- Monitoring.
- Production deployment.
- Pilot customer onboarding.

**Milestone:** Pilot-ready unified Pharmacy ERP.

This roadmap is a planning target, not a guarantee. Regulatory review, offline architecture and real pharmacy workflow validation may require additional time.

---

# 17. Compliance & Business Requirements

Before commercial launch, investigate and validate:

- Applicable Drugs and Cosmetics Act and Rules.
- Retail and wholesale drug licence requirements.
- Prescription handling.
- Schedule H, H1 and X recordkeeping requirements where applicable.
- Applicable GST invoicing and return requirements.
- State-specific requirements.
- Data protection and privacy obligations.
- Backup and data retention policies.
- Electronic invoice and accounting requirements where applicable.

MENO must not be treated as a replacement for the legal responsibilities of a licensed pharmacy.

Obtain appropriate legal and pharmacy-domain review before production use.

---

# 18. First 14-Day Execution Plan

| Timeline | Owner | Deliverable |
|---|---|---|
| Days 1–2 | All | Finalize product vision and workflows |
| Days 3–4 | Prakalya + Nitheesh | BRD, FRS and user stories |
| Days 5–6 | Kamesh + Nitheesh | Backend architecture and ER diagrams |
| Days 7–8 | Meyyarivu + Nitheesh | Design system and UI wireframes |
| Days 9–10 | Jeeva | GitHub, Docker and CI/CD setup |
| Days 11–12 | Ashok | QA strategy and test templates |
| Days 13–14 | All | Architecture review and sprint approval |

---

# 19. Engineering Principles

Every team member must follow these principles:

1. Understand requirements before coding.
2. Follow consistent coding standards.
3. Write readable and maintainable code.
4. Avoid unnecessary complexity.
5. Document important technical decisions.
6. Never hardcode credentials.
7. Write tests for critical functionality.
8. Use database migrations.
9. Maintain backward-compatible API changes where possible.
10. Review code before merging.
11. Never make unauthorized production changes.
12. Prioritize data integrity over development speed.

---

# 20. Long-Term Product Roadmap

After the first stable production release, consider:

- Multi-warehouse management.
- Advanced accounting.
- Pharmacy chain management.
- Mobile applications.
- Advanced analytics.
- Purchase order automation.
- Supplier integrations.
- WhatsApp notifications.
- AI-based sales forecasting.
- Expiry and stock optimization.
- Advanced offline capabilities.
- Third-party integrations.

These are future capabilities, not MVP commitments.

---

# 21. Final Team Ownership

| Area | Accountable Member |
|---|---|
| Product direction | Nitheesh |
| Technical architecture | Nitheesh |
| Business requirements | Prakalya |
| Backend engineering | Kamesh |
| Frontend engineering | Meyyarivu |
| QA and testing | Ashok |
| DevOps and infrastructure | Jeeva |
| Production release | Nitheesh |
| Business acceptance | Prakalya |
| QA release recommendation | Ashok |

# Final Vision

MENO is not intended to be just another medical billing application.

It is intended to become a complete Pharmacy ERP ecosystem supporting retail pharmacies, wholesale distributors and pharmacy chains.

The engineering team should build it with enterprise-level security, reliability, scalability, data integrity and maintainability from the beginning.

**Build carefully. Test thoroughly. Release responsibly. Scale sustainably.**

**MENO — Pharmacy Management, Simplified.**

**Developed by Setups Works.**