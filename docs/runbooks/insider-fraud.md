# Runbook: insider fraud alert

Owner: the tenant owner, supported by MENO support (with an owner-granted support session) · Related: THREAT_MODEL.md §4, SEC-05, RPT-18.

1. Open the alert: rule fired (voids, discounts, returns, write-offs, price edits, after-hours activity), user, branch, period.
2. Preserve: export the exception report and audit log for the period (export is watermarked and logged).
3. Check the chain verifier for the branch and period (records unaltered?).
4. If the pattern is real: suspend the user (sessions and counter PIN revoked), change shared cash-drawer or counter passwords, reconcile cash and stock (cycle count of the items involved).
5. Record the outcome on the alert (confirmed / false positive) so thresholds can be tuned in configuration.
6. Legal action is the owner's decision; MENO provides exports and the verification report.
