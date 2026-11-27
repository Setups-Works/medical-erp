package com.setupsworks.meno.modules.tenancy.api;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** What other modules may ask the tenancy module. Company, branch and settings come in P2. */
public interface TenantFacade {

    /** False for unknown and suspended tenants. */
    boolean isActive(UUID tenantId);

    /** Creates an ACTIVE tenant with a unique URL-safe code derived from the name. Returns its id. */
    UUID createTenant(String name);

    /** Sign-up variant: also records state, start option, partner code and the idempotency key. */
    UUID createTenant(NewTenant tenant);

    /** The tenant an earlier sign-up with this Idempotency-Key created, if any. */
    Optional<UUID> findBySignupKey(UUID signupKey);

    /** States and union territories in force today, in GST code order. */
    List<StateView> activeStates();

    /** True when {@code code} is a GST state code in force today. */
    boolean isActiveState(String code);

    /** The business name shown to people (e.g. in a staff invitation), if the tenant exists. */
    Optional<String> displayName(UUID tenantId);
}
