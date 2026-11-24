# Runbook: security incident

Owner: Jeeva (on call) · Decision maker: Nitheesh · Related: [THREAT_MODEL.md](../security/THREAT_MODEL.md), [SECURITY.md](../security/SECURITY.md).

## Severity

| Sev | Examples | First response |
|---|---|---|
| S1 | Cross-tenant data access, auth bypass, leaked secret in use, chain break on posted records, ransomware | Immediately, any hour |
| S2 | Account takeover of one tenant, malware upload caught late, mass export by a leaving employee | Within 1 h |
| S3 | Blocked brute force, vulnerability report without exploitation | Next business day |

## Steps

1. **Open** an incident note in `docs/runbooks/incidents/<date>-<slug>.md` from incident-template.md; record times in IST.
2. **Contain**: revoke tokens / sessions / devices for affected users; rotate exposed secrets (key-rotation.md); block IPs at the WAF; disable the affected integration; put the tenant read-only if data integrity is in doubt.
3. **Preserve evidence**: snapshot logs, audit log export, DB snapshot; do not modify affected rows.
4. **Assess**: which tenants, which data classes (SECURITY.md data classification), time window, root cause.
5. **Notify** ⚠ confirm exact windows with the lawyer before the pilot:
   - CERT-In: within the window in the current CERT-In directions (2022 directions: 6 hours of noticing) for reportable incident types.
   - Affected tenants (data fiduciaries): as fast as possible with facts known, then updates.
   - Data Protection Board / data principals: per DPDP Act and Rules timelines (tenant is the fiduciary; MENO supports them as processor).
6. **Eradicate and recover**: patch, redeploy from a clean build, restore if needed (restore-database.md), verify record chains.
7. **Post-mortem** within 5 business days: timeline, root cause, what detected it, fixes with owners as Hub tasks.
