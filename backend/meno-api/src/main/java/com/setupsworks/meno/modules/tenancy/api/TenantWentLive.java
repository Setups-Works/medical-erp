package com.setupsworks.meno.modules.tenancy.api;

import java.time.LocalDate;
import java.util.UUID;

/** Published when a tenant goes live (AUT-13); listeners start owner digests, lock openings, etc. */
public record TenantWentLive(UUID tenantId, LocalDate goLiveDate) {
}
