package com.setupsworks.meno.modules.identity.service;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * ONBOARDING.md step 2: email link valid 24 h (opens the web app's /verify page); 6-digit mobile OTP valid 5 min,
 * 3 tries, resend after 30 s.
 */
@ConfigurationProperties("meno.identity.verification")
public record VerificationProperties(
        @DefaultValue("24h") Duration emailTtl,
        @DefaultValue("60s") Duration resendCooldown,
        /* Base of the link in the email; the token is appended. */
        @DefaultValue("http://localhost:3000/verify/?token=") String emailLinkBase,
        @DefaultValue("5m") Duration smsTtl,
        @DefaultValue("30s") Duration smsResendCooldown,
        @DefaultValue("3") int smsMaxAttempts) {
}
