# Module `notification` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P4–P5 · **Features:** NTF-01…05

## Built so far (26-11-2026)
- `api/EmailSender` + `SmtpEmailSender` (spring-boot-starter-mail, `spring.mail.*` from `MENO_MAIL_*`, sender `MENO_MAIL_FROM`). No host → logged (recipient domain + subject only), not sent. Used by identity for verification links, sent after commit.
- `api/SmsSender` + `ConfiguredSmsSender` (`meno.sms.provider` from `MENO_SMS_PROVIDER`): `none` (default; `enabled()` false, callers answer NOTIFICATION_CHANNEL_DISABLED) or `log` (application-local.yml only: prints the message, which holds the OTP). A real provider (DLT templates) comes with INT-02. Used by identity for the mobile OTP, sent after commit.
- Deviation from the plan below: identity depends on `notification::api` (not the other way) for one-time links, so raw tokens never sit in `event_publication`. Template-based notifications (rule 1) keep the event route.

## Purpose
In-app, email, WhatsApp, SMS notifications and alert rules.

## Owns tables
notification, notification_template, channel_config, alert_rule

## Public API (`notification.api`)
Notifier.send(NotificationRequest)

## Events published
—

## Allowed dependencies
tenancy::api, identity::api

## Error codes
NOTIFICATION_CHANNEL_DISABLED

## Module rules
1. Listens to events (InvoicePosted, StockLow, BatchExpiring, PaymentOverdue).
2. Sending is async and retried; failures never roll back business transactions.
3. Templates per tenant; WhatsApp/SMS use pre-approved templates only.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
