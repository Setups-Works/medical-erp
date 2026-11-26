package com.setupsworks.meno.modules.integrations.gst;

import java.time.Clock;

import com.setupsworks.meno.modules.integrations.api.GstinVerifier;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Picks the GST verification adapter from configuration (meno.integrations.gstin.provider). */
@Configuration(proxyBeanMethods = false)
class GstinVerifierConfig {

    @Bean
    GstinVerifier gstinVerifier(GstinProviderProperties properties, Clock clock) {
        return switch (properties.provider()) {
            case "gstverify" -> new GstVerifyAdapter(properties, clock);
            case "none" -> new NoGstinVerifier();
            default -> throw new IllegalStateException("Unknown MENO_GSTIN_PROVIDER: " + properties.provider()
                    + " (use none or gstverify)");
        };
    }

    /** No provider chosen yet: every lookup is "unavailable", so the form falls back to manual entry. */
    static final class NoGstinVerifier implements GstinVerifier {

        @Override
        public GstinDetails lookup(String gstin) {
            throw new GstinLookupException(Failure.UNAVAILABLE, "No GST verification provider configured");
        }

        @Override
        public String source() {
            return "none";
        }
    }
}
