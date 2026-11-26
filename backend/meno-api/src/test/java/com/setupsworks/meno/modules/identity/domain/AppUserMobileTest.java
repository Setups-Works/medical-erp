package com.setupsworks.meno.modules.identity.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

/** VALIDATION_AND_BUSINESS_RULES.md "Phone (India)": 10 digits starting 6-9, stored as +91… */
class AppUserMobileTest {

    @ParameterizedTest
    @ValueSource(strings = {"9876543210", "+919876543210", "919876543210", " 98765 43210 ", "98765-43210",
            "+91 98765 43210", "09876543210"})
    void commonFormsBecomeE164(String raw) {
        assertThat(AppUser.normalizeMobile(raw)).contains("+919876543210");
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "5876543210", "987654321", "98765432101", "+929876543210", "0098765 43210",
            "abcdefghij", "owner@test.local"})
    void anythingElseIsNotAMobile(String raw) {
        assertThat(AppUser.normalizeMobile(raw)).isEmpty();
    }
}
