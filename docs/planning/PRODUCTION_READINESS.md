# Production readiness: from P0 to live

> When every task in MENO Hub is **Done**, MENO is in production with paying pilot customers. Each phase board in the Hub covers four kinds of work:
> 1. member plan items (`docs/team/members/*/PHASE_PLAN.md`)
> 2. product features (`docs/product/FEATURES.md`, each a full slice from story to QA)
> 3. cross-cutting work (this file, critical test scenarios, compliance checks, runbooks)
> 4. a **phase gate** task
>
> Format for the Hub importer: `## P<n>` headings, then `- [ ] [owner] task title`. The owner is a team member's first name in lower case; several owners are separated by `+`.

## P0
- [x] [nitheesh] Create the GitHub repo `meno`, push the foundation (folders + docs) through a PR into `develop`
- [x] [nitheesh] Hold the architecture review meeting and accept or change each ADR (`docs/decisions/`)
- [x] [nitheesh] Decide ADR-0009 (Problem Details vs response envelope) and mark it Accepted
- [x] [jeeva] Replace placeholder GitHub handles in `.github/CODEOWNERS` and turn on branch protection
- [x] [prakalya] List every ⚠ VERIFY rule from CALCULATIONS.md and COMPLIANCE.md with who will confirm it and by when

## P1
- [ ] [jeeva] Create `.env` files for local/staging from `infrastructure/env/*.example`; store secrets in GitHub Environments
- [ ] [nitheesh+kamesh] Cross-tenant test base class in place and used by every endpoint test
- [ ] [meyyarivu] Design-check script (`scripts/design/check-design.mjs`) running in pre-commit, Claude hook and CI
- [ ] [ashok] Defect workflow live (labels, severity S1–S4, triage every morning)
- [ ] [jeeva] Staging reachable over HTTPS with a real domain and TLS certificate

## P2
- [ ] [kamesh] Synthetic seed data for staging (items, parties, batches) that never uses real customer data
- [ ] [jeeva] Daily database backup to Blob Storage with a tested restore script
- [ ] [jeeva] Grafana dashboards + Loki logs + Sentry for API and web
- [ ] [prakalya] Collect real (anonymised) distributor purchase files and sample bills for testing

## P3
- [ ] [nitheesh+ashok] Calculation parity CI job: Java and TypeScript must pass every test vector
- [ ] [jeeva] Production VM and database provisioned (private, not public yet)
- [ ] [kamesh] Nightly stock reconciliation job with alert on drift
- [ ] [nitheesh] Choose the GST e-invoice provider (GSP/IRP) with a cost comparison and sandbox access

## P4
- [ ] [jeeva] Windows installer for the desktop app with code signing and an auto-update channel
- [ ] [ashok] Performance baseline with k6: item search p95 < 150 ms, invoice post p95 < 500 ms
- [ ] [meyyarivu] Print templates checked on real thermal (58/80 mm) and A4/A5 printers
- [ ] [prakalya] Retail UAT with a real pharmacist, signed off
- [ ] [nitheesh] Choose the WhatsApp Business and SMS (DLT) providers

## P5
- [ ] [ashok] OWASP ZAP scan + permission matrix tests + cross-tenant fuzzing: no High/Critical findings open
- [ ] [nitheesh] External or peer penetration test of auth, tenancy, file upload and sync; fix all High/Critical
- [ ] [jeeva] Production hardening: firewall, SSH keys only, fail2ban, TLS A+, Nginx rate limits, security headers
- [ ] [jeeva] Monthly restore drill done and timed (RTO ≤ 4 h); result in `docs/runbooks/restore-drill-log.md`
- [ ] [jeeva] Alerts tested end to end: API down, 5xx rate, DB storage, backup failed, cert expiry, device not syncing
- [ ] [ashok] 3-day offline billing test on the desktop app: 500 bills, reconnect, zero duplicates
- [ ] [nitheesh] Privacy notice and terms of service reviewed (DPDP Act)
- [ ] [prakalya] Pilot customer agreements, onboarding checklist and data-migration templates ready
- [ ] [nitheesh] Production go/no-go review: QA report, security report, restore drill, UAT, all S1/S2 closed
- [ ] [jeeva] Production go-live: deploy `v1.0.0`, smoke test, monitoring on, rollback plan rehearsed

## P6
- [ ] [nitheesh] Onboard pilot pharmacy 1 (retail): data migration, training, first live bill
- [ ] [nitheesh] Onboard pilot pharmacy 2 (retail)
- [ ] [nitheesh] Onboard pilot distributor (wholesale) with e-invoice live
- [ ] [nitheesh] Support rota and incident process during the pilot (response times agreed)
- [ ] [ashok] Weekly pilot regression run and release report
- [ ] [jeeva] Monthly cost and uptime report; scale plan if the pilot grows
- [ ] [prakalya] Validate GSTR-1/3B exports with each pilot's accountant
- [ ] [nitheesh] Four weeks of pilot with zero data-integrity incidents: declare MENO production-ready (v1.1)

## P7
- [ ] [nitheesh] Mobile app ADR (Expo, shared packages) and field-sales module design
- [ ] [nitheesh] Pricing and plans for public launch; subscription billing live
- [ ] [nitheesh] Public launch checklist: marketing site, support channel, status page
