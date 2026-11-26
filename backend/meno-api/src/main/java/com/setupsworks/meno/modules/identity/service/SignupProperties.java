package com.setupsworks.meno.modules.identity.service;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Sign-up settings (env names in infrastructure/env/*.example). The start options and terms version are
 * configuration, not code; the terms text and its version are confirmed under Hub #868 (consent rule) ⚠.
 */
@ConfigurationProperties("meno.signup")
public record SignupProperties(
        /* false closes public sign-up (POST answers IDENTITY_SIGNUP_CLOSED); options still load. */
        @DefaultValue("true") boolean enabled,
        @DefaultValue({"TRIAL", "DEMO", "LICENSE_KEY"}) List<String> startOptions,
        /* Version of the terms + privacy (DPDP) notice the screen shows; stored with each acceptance. */
        @DefaultValue("draft-2026-11") String termsVersion) {
}
