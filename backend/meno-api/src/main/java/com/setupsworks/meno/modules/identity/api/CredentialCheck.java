package com.setupsworks.meno.modules.identity.api;

import java.util.Optional;
import java.util.UUID;

/** Password checks and lockout stay inside identity; auth only learns the outcome. */
public interface CredentialCheck {

    /** Checks email + password, counts failures and applies the lockout. */
    Result check(String email, String rawPassword);

    /** The account if it may still sign in (active, not locked, tenant active). Used on token refresh. */
    Optional<LoginAccount> findSignInAllowed(UUID userId);

    sealed interface Result {
        /** Unknown email and wrong password look the same, so callers can't reveal which emails exist. */
        record InvalidCredentials() implements Result { }

        record Locked() implements Result { }

        record Disabled() implements Result { }

        record Ok(LoginAccount account) implements Result { }
    }
}
