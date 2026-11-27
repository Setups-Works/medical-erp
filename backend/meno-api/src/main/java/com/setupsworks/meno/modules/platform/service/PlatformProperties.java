package com.setupsworks.meno.modules.platform.service;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Platform staff realm (ADR-0020) and reference data imports (PLT-22). Starting values, configuration so they change
 * without a release.
 *
 * @param accessTokenTtl   staff sessions have no refresh token; they sign in again after this
 * @param minRetainedRatio a new file with fewer rows than this share of the current list is refused unless the
 *                         admin ticks "Replace anyway" (protects lookups from a truncated download)
 */
@ConfigurationProperties("meno.platform")
public record PlatformProperties(
        @DefaultValue("1h") Duration accessTokenTtl,
        @DefaultValue("5") int maxFailedAttempts,
        @DefaultValue("30m") Duration lockDuration,
        @DefaultValue("12") int minPasswordLength,
        @DefaultValue("0.5") double minRetainedRatio,
        Bootstrap bootstrap) {

    /** First staff member on an empty platform_user table; remove the password env var after the first start. */
    public record Bootstrap(String email, @DefaultValue("MENO Admin") String fullName, String password) {

        boolean isConfigured() {
            return email != null && !email.isBlank() && password != null && !password.isBlank();
        }
    }
}
