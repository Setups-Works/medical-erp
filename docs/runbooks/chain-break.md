# Runbook: record chain break (ADR-0016)

Severity S1 until proven otherwise. Owner: Nitheesh + Jeeva.

1. Freeze: put the affected tenant + branch series read-only for posting (counter keeps billing offline; sync queues).
2. Identify the first broken link: verifier output gives series, record number and expected vs actual hash.
3. Compare the row with the audit log, the daily anchor and the latest immutable backup to find what changed, when and by which DB role.
4. Restore the correct row from backup or reconstruct from the audit log; re-run the verifier until the chain is whole.
5. Rotate DB credentials if a person or process changed data outside the application; follow security-incident.md.
6. Tell the tenant what happened and give them the verification report.
