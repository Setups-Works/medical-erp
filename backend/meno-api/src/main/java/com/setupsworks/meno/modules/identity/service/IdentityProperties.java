package com.setupsworks.meno.modules.identity.service;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Lockout policy (SECURITY.md: 10 failures → 15 min) and the first-owner bootstrap.
 * Lockout moves to tenant settings with the settings framework.
 */
@ConfigurationProperties("meno.identity")
public record IdentityProperties(
        @DefaultValue("10") int maxFailedAttempts,
        @DefaultValue("15m") Duration lockDuration,
        /* SECURITY.md: minimum 10 characters. */
        @DefaultValue("10") int minPasswordLength,
        @DefaultValue Bootstrap bootstrap) {

    /** First owner account, created only when the user table is empty. */
    public record Bootstrap(String tenantName, @DefaultValue("Owner") String fullName, String email, String password) {

        boolean isConfigured() {
            return hasText(tenantName) && hasText(email) && hasText(password);
        }

        private static boolean hasText(String s) {
            return s != null && !s.isBlank();
        }
    }
}
