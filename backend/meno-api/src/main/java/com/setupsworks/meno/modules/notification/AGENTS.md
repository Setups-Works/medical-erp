# Module `notification` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P4–P5 · **Features:** NTF-01…05

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
