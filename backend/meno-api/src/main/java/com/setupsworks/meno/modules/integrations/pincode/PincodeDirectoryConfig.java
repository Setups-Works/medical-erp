package com.setupsworks.meno.modules.integrations.pincode;

import java.util.List;

import com.setupsworks.meno.modules.integrations.api.PincodeDirectory;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Picks the online PIN directory from configuration (meno.integrations.pincode.provider). */
@Configuration(proxyBeanMethods = false)
class PincodeDirectoryConfig {

    @Bean
    PincodeDirectory pincodeDirectory(PincodeProviderProperties properties) {
        return switch (properties.provider()) {
            case "postalpincode" -> new PostalPincodeAdapter(properties);
            case "none" -> new NoPincodeDirectory();
            default -> throw new IllegalStateException("Unknown MENO_PINCODE_PROVIDER: " + properties.provider()
                    + " (use postalpincode or none)");
        };
    }

    /** Online lookup switched off: every PIN outside MENO's own list is unknown, so the user types the details. */
    static final class NoPincodeDirectory implements PincodeDirectory {

        @Override
        public List<PostOffice> postOffices(String pincode) {
            return List.of();
        }

        @Override
        public String source() {
            return "none";
        }
    }
}
