# ADR-0005: Azure VM + Docker Compose + managed PostgreSQL

- Status: Accepted · Date: 2026-11-21 · Until the pilot the API runs on App Service instead: [ADR-0018](0018-azure-app-service.md)

## Context
Hosting must fit Azure for Students credit, be operable by a fresher DevOps engineer, and match local development.

## Decision
Ubuntu VM(s) running Docker Compose (nginx, meno-api, redis, monitoring). PostgreSQL on Azure Database for PostgreSQL Flexible Server (B1ms). Files and backups on Azure Blob. Images on GHCR. Infra described with Bicep in `infrastructure/azure`.

## Consequences
+ Same compose locally and in cloud; cheapest viable option; managed DB backups/PITR.
− Single VM = single point of failure (documented recovery, RTO 4 h). Revisit Azure Container Apps or AKS when paying customers need higher availability.
