package com.setupsworks.meno.modules.identity.service;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** ONBOARDING.md step 2: email link valid 24 h. The link opens the web app's /verify page. */
@ConfigurationProperties("meno.identity.verification")
public record VerificationProperties(
        @DefaultValue("24h") Duration emailTtl,
        @DefaultValue("60s") Duration resendCooldown,
        /* Base of the link in the email; the token is appended. */
        @DefaultValue("http://localhost:3000/verify?token=") String emailLinkBase) {
}
