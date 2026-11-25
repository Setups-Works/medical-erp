# Runbooks

Owner: Jeeva. Step-by-step procedures anyone on call can follow. Written during P1–P5.

| Runbook | When |
|---|---|
| deploy.md | Normal staging/prod deploy |
| rollback.md | Smoke test failed / bad release |
| restore-database.md | Data loss / corruption / restore drill |
| rotate-secrets.md | Scheduled or after exposure |
| api-down.md | Alert: API down |
| disk-full.md | Alert: storage > 80 % |
| revoke-device.md | Lost/stolen counter PC |
| incident-template.md | Any incident postmortem |
| security-incident.md | Suspected breach, account takeover, data leak: severity, containment, CERT-In and customer notification windows ⚠ |
| chain-break.md | Record verifier reports a broken hash chain (ADR-0016) |
| insider-fraud.md | Fraud alert from SEC-05: preserve evidence, suspend user, review with owner |
| key-rotation.md | Yearly or after exposure: JWT, licence, HMAC pepper, device and data keys |
| ransomware.md | Encrypted or deleted servers / backups: isolate, restore from immutable copy |
| vulnerability-report.md | External report via security.txt: triage, fix SLA, credit the reporter |
