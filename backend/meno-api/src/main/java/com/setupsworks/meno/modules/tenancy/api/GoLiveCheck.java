package com.setupsworks.meno.modules.tenancy.api;

import java.util.UUID;

/**
 * A go-live readiness check another module contributes (AUT-13), e.g. identity's "owner email verified".
 * Implementations live in the contributing module, so tenancy never depends on it (no module cycle).
 */
public interface GoLiveCheck {

    String code();

    /** True when this tenant passes. Called inside the tenant's context. */
    boolean passed(UUID tenantId);

    /** Shown when it fails, with what to do. */
    String failMessage();
}
