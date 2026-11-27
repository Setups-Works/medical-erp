package com.setupsworks.meno.modules.identity.api;

import java.util.UUID;

/**
 * Mobile OTP for the signed-in user (AUT-04, ONBOARDING.md step 2): 6 digits, 5 min, 3 tries, resend after 30 s.
 * Status is read through {@link EmailVerification#status(UUID)}.
 */
public interface MobileVerification {

    /**
     * Sends a new code by SMS; older codes stop working. IDENTITY_ALREADY_VERIFIED (409),
     * IDENTITY_VERIFICATION_TOO_SOON (429), NOTIFICATION_CHANNEL_DISABLED (503, no SMS provider configured).
     */
    void send(UUID userId);

    /**
     * Confirms the code. IDENTITY_VERIFICATION_INVALID (400, property attemptsLeft), IDENTITY_VERIFICATION_EXPIRED
     * (400), IDENTITY_VERIFICATION_LOCKED (423, after the last wrong try), IDENTITY_ALREADY_VERIFIED (409).
     */
    void verify(UUID userId, String code);
}
