package com.setupsworks.meno.modules.identity.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class SmsVerificationTest {

    private static final Instant NOW = Instant.parse("2026-11-27T10:00:00Z");

    @Test
    void sameCodeForTwoUsersGivesDifferentHashesAndOnlyTheRightCodeMatches() {
        Verification a = Verification.sms(UUID.randomUUID(), UUID.randomUUID(), "123456", NOW.plusSeconds(300), NOW);
        Verification b = Verification.sms(UUID.randomUUID(), UUID.randomUUID(), "123456", NOW.plusSeconds(300), NOW);

        assertThat(a.matchesCode("123456")).isTrue();
        assertThat(a.matchesCode("123457")).isFalse();
        assertThat(b.matchesCode("123456")).isTrue();
        Object hashA = ReflectionTestUtils.getField(a, "tokenHash");
        assertThat(hashA).isNotEqualTo(ReflectionTestUtils.getField(b, "tokenHash")).isNotEqualTo("123456");
    }

    @Test
    void expiresAfterItsValidityAndCountsWrongTries() {
        Verification v = Verification.sms(UUID.randomUUID(), UUID.randomUUID(), "654321", NOW.plus(Duration.ofMinutes(5)), NOW);

        assertThat(v.isExpired(NOW.plus(Duration.ofMinutes(4)))).isFalse();
        assertThat(v.isExpired(NOW.plus(Duration.ofMinutes(5)))).isTrue();
        assertThat(v.recordWrongAttempt()).isEqualTo(1);
        assertThat(v.recordWrongAttempt()).isEqualTo(2);
        assertThat(v.getAttempts()).isEqualTo(2);
    }
}
