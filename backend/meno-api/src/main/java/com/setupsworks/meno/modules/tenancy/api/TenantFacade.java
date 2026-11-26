package com.setupsworks.meno.modules.tenancy.api;

import java.util.UUID;

/** What other modules may ask the tenancy module. Company, branch and settings come in P2. */
public interface TenantFacade {

    /** False for unknown and suspended tenants. */
    boolean isActive(UUID tenantId);

    /** Creates an ACTIVE tenant with a unique URL-safe code derived from the name. Returns its id. */
    UUID createTenant(String name);
}
