# Module `taxation` — AGENTS.md

**Owner:** Kamesh · **QA:** Ashok · **Phase:** P3, P5–P6 · **Features:** GST-01…08

## Purpose
GST calculation, HSN rates, e-invoice/e-way bill via GSP, GSTR exports.

## Owns tables
tax_rate, hsn_tax, einvoice_request, gstr_export

## Public API (`taxation.api`)
GstCalculator.calculate(TaxRequest), EInvoiceService

## Events published
—

## Allowed dependencies
—

## Error codes
TAX_RATE_NOT_FOUND, TAX_EINVOICE_FAILED

## Module rules
1. Must pass contracts/test-vectors/gst.
2. Calculator is pure (no DB) — rates passed in.
3. GSP adapter in integrations/gst behind an interface; sandbox in staging.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
