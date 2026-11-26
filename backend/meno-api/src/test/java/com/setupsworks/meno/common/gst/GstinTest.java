package com.setupsworks.meno.common.gst;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** Synthetic GSTINs only (no real registrations in tests, AGENTS.md §9). */
class GstinTest {

    @Test
    void acceptsAValidCheckCharacter() {
        assertThat(Gstin.hasValidCheckCharacter("33ABCDE1234F1Z7")).isTrue();
        assertThat(Gstin.stateCode("33ABCDE1234F1Z7")).isEqualTo("33");
        assertThat(Gstin.pan("33ABCDE1234F1Z7")).isEqualTo("ABCDE1234F");
    }

    @Test
    void rejectsAWrongCheckCharacterOrFormat() {
        assertThat(Gstin.hasValidCheckCharacter("33ABCDE1234F1Z8")).isFalse();
        assertThat(Gstin.hasValidCheckCharacter("33ABCDE1234F1X7")).isFalse();
        assertThat(Gstin.hasValidCheckCharacter("33abcde1234f1z7")).isFalse();
        assertThat(Gstin.hasValidCheckCharacter(null)).isFalse();
    }

    @Test
    void checkCharacterFollowsTheDocumentedAlgorithm() {
        assertThat(Gstin.checkCharacter("33ABCDE1234F1Z")).isEqualTo('7');
    }
}
