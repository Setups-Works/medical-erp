package com.setupsworks.meno.modules.auth.service;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties("meno.auth")
public record AuthProperties(
        @DefaultValue("30d") Duration refreshTokenTtl,
        /* false only for local http; staging and prod are https. */
        @DefaultValue("true") boolean refreshCookieSecure) {
}
