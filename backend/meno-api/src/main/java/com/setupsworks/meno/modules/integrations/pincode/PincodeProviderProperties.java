package com.setupsworks.meno.modules.integrations.pincode;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Online PIN code directory (ADR-0021). "postalpincode" (default) asks api.postalpincode.in for PINs missing from
 * MENO's own list; "none" uses the list only (tests, offline installs). No key: the service is free and keyless.
 */
@ConfigurationProperties("meno.integrations.pincode")
public record PincodeProviderProperties(
        @DefaultValue("postalpincode") String provider,
        @DefaultValue("https://api.postalpincode.in") String baseUrl,
        @DefaultValue("5s") Duration timeout) {
}
