package com.setupsworks.meno.modules.tenancy.api;

import java.util.UUID;

/**
 * A tenant created by sign-up (AUT-04). {@code signupKey} is the client's Idempotency-Key, or null.
 * {@code stateCode} must be an active GST state code; the caller checks it with {@link TenantFacade#isActiveState}.
 */
public record NewTenant(String name, String stateCode, String startOption, String partnerCode, UUID signupKey) {
}
