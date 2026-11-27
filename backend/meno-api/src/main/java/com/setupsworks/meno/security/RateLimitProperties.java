package com.setupsworks.meno.security;

import java.time.Duration;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Per-client-IP limits for public, abuse-prone endpoints (SEC-10, ONBOARDING.md anti-abuse). App Service has no
 * nginx in front, so the API enforces them itself. Values come from configuration (application.yml / env).
 */
@ConfigurationProperties("meno.rate-limit")
public record RateLimitProperties(@DefaultValue("true") boolean enabled, Map<String, Rule> rules) {

    public RateLimitProperties {
        rules = rules == null ? Map.of() : Map.copyOf(rules);
    }

    /** {@code capacity} requests per {@code window} for {@code method path} (exact path, or {@code *} per segment). */
    public record Rule(String method, String path, int capacity, Duration window) {
    }
}
