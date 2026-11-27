package com.setupsworks.meno.modules.auth.service;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** AUT-01: link valid 30 min; at most one email per user per cooldown (extra requests are silently ignored). */
@ConfigurationProperties("meno.auth.password-reset")
public record PasswordResetProperties(
        @DefaultValue("30m") Duration ttl,
        @DefaultValue("60s") Duration cooldown,
        /* Base of the link in the email (web app /reset-password page); the token is appended. */
        @DefaultValue("http://localhost:3000/reset-password/?token=") String linkBase) {
}
