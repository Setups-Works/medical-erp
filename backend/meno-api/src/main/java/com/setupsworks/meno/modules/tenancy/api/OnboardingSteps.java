package com.setupsworks.meno.modules.tenancy.api;

import java.util.UUID;

/**
 * Lets a module that owns an onboarding step's data mark the step done (identity owns the Team step's
 * invitations). Tenancy keeps the checklist, so it never depends on that module.
 */
public interface OnboardingSteps {

    /** Marks {@code step} DONE in the caller's transaction. Does nothing once the tenant is live. */
    void markDone(UUID tenantId, String step);
}
