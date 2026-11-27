package com.setupsworks.meno.modules.integrations.gst;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * GST verification provider (GSTIN_FETCH.md). Provider NOT decided yet (R-31, Hub #999): default "none", so
 * lookups answer "unavailable" and users type details by hand. "gstverify" enables the candidate adapter.
 */
@ConfigurationProperties("meno.integrations.gstin")
public record GstinProviderProperties(
        @DefaultValue("none") String provider,
        @DefaultValue("https://api.gstverify.dubey.app") String baseUrl,
        /* Only if the chosen plan needs one; from Key Vault / app settings, never git. */
        String apiKey,
        @DefaultValue("8s") Duration timeout) {
}
