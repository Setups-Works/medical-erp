# Module `fieldsales` — AGENTS.md

**Owner:** Nitheesh · **QA:** Ashok · **Phase:** P7 · **Features:** MOB-02…04

## Purpose
Routes, beats, salesmen, visits, collections for wholesale field app.

## Owns tables
route, beat, salesman, visit, collection

## Public API (`fieldsales.api`)
—

## Events published
—

## Allowed dependencies
sales::api, party::api, payment::api

## Error codes
—

## Module rules
1. Do not implement before the P7 ADR is accepted.

Also follow `backend/meno-api/AGENTS.md` (module template) and root `AGENTS.md` §4. Update this file when you add tables, events or error codes.
