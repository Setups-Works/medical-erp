package com.setupsworks.meno.modules.identity.api;

import java.util.List;
import java.util.UUID;

/**
 * Tenant sign-up (AUT-04, PLT-01): creates the tenant and its owner in one transaction.
 * Every option list comes from data or configuration, never from code (ADR-0014).
 */
public interface SignupFacade {

    /** What the sign-up screen needs: states, start options, current terms version, password minimum. */
    Options options();

    /**
     * Creates tenant + OWNER + consent, or returns the earlier result when {@code idempotencyKey} was used before
     * for the same email. Throws {@code MenoException} with IDENTITY_* / TENANCY_* / COMMON_* codes.
     */
    Outcome signUp(Command command, UUID idempotencyKey);

    record Command(String ownerName, String mobile, String email, String password, String businessName,
            String stateCode, String partnerCode, String startWith, String acceptedTermsVersion) {
    }

    record Options(boolean open, List<StateOption> states, List<String> startOptions, String termsVersion,
            int minPasswordLength) {
    }

    record StateOption(String code, String name, String kind) {
    }

    /** {@code replayed} is true when an earlier sign-up with the same Idempotency-Key was returned. */
    record Outcome(LoginAccount account, boolean replayed) {
    }
}
