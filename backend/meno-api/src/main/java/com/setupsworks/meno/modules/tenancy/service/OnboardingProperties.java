package com.setupsworks.meno.modules.tenancy.service;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** ONBOARDING.md step 7 (April–March default) and step 14 (go-live ≤ today + 7). From configuration, not code. */
@ConfigurationProperties("meno.onboarding")
public record OnboardingProperties(
        @DefaultValue("4") int financialYearStartMonth,
        @DefaultValue("7") int goLiveMaxDaysAhead) {
}
