# ADR-0017: AI assistant on one shared LLM provider, behind meno-api tools

- Status: Proposed
- Date: 2026-11-25
- Deciders: Nitheesh (+ Jeeva for the provider comparison, Prakalya for the privacy review)

## Context
Owners and managers want plain-language answers over their own data ("what expires next month?"), first planned as PLT-21 and now as the AIA features in P7 ([AI_ASSISTANT.md](../architecture/AI_ASSISTANT.md)). MENO is multi-tenant (shared schema, RLS, ADR-0006), keeps money maths in one place (ADR-0011), allows only PostgreSQL as product database (ADR-0013) and must not send patient data to third parties without consent (DPDP). An LLM can be tricked by prompt injection, so it can't be trusted with tenant scope, SQL or arithmetic.

## Options considered
1. **One shared hosted LLM (Groq) called only by meno-api, through allowlisted typed tools.** Cheap, fast, one key, one place for guards. The model never sees the database; tenant scope stays in our code and RLS. Needs a provider contract and a privacy review.
2. **A separate model or fine-tune per tenant.** Much more cost and operations work, no isolation gain: isolation comes from what we send, not from the model.
3. **Let the model write SQL (text-to-SQL) against read replicas.** Flexible, but injection and data leaks are one bad prompt away; RLS alone would be the only guard; money figures could differ from the reports. Rejected.
4. **Self-hosted open model on our VM.** No third-party data transfer, but the student-plan VM can't run a useful model at counter speed. Revisit if privacy review blocks option 1.

## Decision
We will (Proposed, to be accepted in P7 after the provider comparison and privacy review):
- Use **one shared LLM provider for all tenants, Groq first**, behind an `LlmClient` port in `integrations`; meno-api is the only caller.
- Expose only **read-only, typed, permission-checked tools** (AI_ASSISTANT.md §6); tenant and branch come from `TenantContext`, never from the model.
- Compute every figure with MENO services; the model explains, it doesn't calculate.
- Send minimised, redacted data; no patient or personal data; party names only on owner opt-in.
- Keep optional document search (RAG) inside PostgreSQL with **pgvector** (no new database).
- Call the provider with Spring's `RestClient` unless a Spring AI release compatible with Spring Boot 4 and Groq is available and approved by the tech lead (rule 16) ⚠ decide at build time.

Still to fill in when accepting: chosen model ⚠, how long the LLM provider keeps data and whether it trains on it ⚠ (R-52), embedding option for RAG ⚠, quota numbers per plan ⚠.

## Consequences
- New `assistant` module and `LlmClient` adapter; MODULES.md and ARCHITECTURE.md updated.
- Sales, inventory and pricing expose small read-only query facades for the tools (Kamesh).
- The assistant depends on internet and on the provider; nothing else in MENO does. Desktop offline disables it.
- A provider outage or price change is handled by swapping the adapter; the tool layer and the UI don't change.
- New tests: cross-tenant via tools, RLS fail-closed, pool leak, injection, redaction (critical scenario #16).
- New compliance item: DPDP notice and consent for sending business data to an external AI (R-52).
