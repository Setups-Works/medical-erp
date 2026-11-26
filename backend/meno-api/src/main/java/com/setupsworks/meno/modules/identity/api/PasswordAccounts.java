package com.setupsworks.meno.modules.identity.api;

import java.util.Optional;
import java.util.UUID;

/** What the password-reset flow (auth, AUT-01) may ask identity. The password hash never leaves identity. */
public interface PasswordAccounts {

    /** The active user signing in with {@code email}, if any. Disabled users get no reset link. */
    Optional<ResetTarget> findForReset(String email);

    /**
     * Sets a new password (policy from identity settings) and clears any login lockout.
     * Throws IDENTITY_PASSWORD_TOO_SHORT (400) before changing anything.
     */
    void changePassword(UUID userId, String rawPassword);

    record ResetTarget(UUID userId, UUID tenantId, String email, String fullName) {
    }
}
