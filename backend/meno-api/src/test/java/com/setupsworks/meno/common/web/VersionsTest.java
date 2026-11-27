package com.setupsworks.meno.common.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.setupsworks.meno.common.error.MenoException;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class VersionsTest {

    @Test
    void etagQuotesTheVersion() {
        assertThat(Versions.etag(3)).isEqualTo("\"3\"");
    }

    @ParameterizedTest
    @ValueSource(strings = { "\"3\"", "W/\"3\"", "3", " \"3\" " })
    void readsStrongWeakAndBareTags(String header) {
        assertThat(Versions.fromIfMatch(header)).isEqualTo(3);
    }

    @Test
    void missingIsPreconditionRequiredAndGarbageIsBadRequest() {
        assertThatThrownBy(() -> Versions.fromIfMatch(null)).isInstanceOf(MenoException.class)
                .extracting(e -> ((MenoException) e).code()).isEqualTo("COMMON_PRECONDITION_REQUIRED");
        assertThatThrownBy(() -> Versions.fromIfMatch("*")).isInstanceOf(MenoException.class)
                .extracting(e -> ((MenoException) e).code()).isEqualTo("COMMON_IF_MATCH_INVALID");
    }
}
