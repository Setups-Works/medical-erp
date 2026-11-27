package com.setupsworks.meno.modules.identity.api;

import java.util.UUID;

/** Email verification by one-time link (AUT-04). Mobile OTP joins when an SMS provider is chosen (INT-02). */
public interface EmailVerification {

    /** Marks the email verified. IDENTITY_VERIFICATION_INVALID / IDENTITY_VERIFICATION_EXPIRED (400). */
    void verify(String token);

    /** Sends a new link (older ones stop working). IDENTITY_ALREADY_VERIFIED (409), IDENTITY_VERIFICATION_TOO_SOON (429). */
    void resend(UUID userId);

    Status status(UUID userId);

    record Status(boolean emailVerified, boolean mobileVerified) {
    }
}
