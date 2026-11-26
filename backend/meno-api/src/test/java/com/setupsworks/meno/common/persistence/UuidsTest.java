package com.setupsworks.meno.common.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

class UuidsTest {

    @Test
    void isVersion7WithTheIetfVariant() {
        UUID id = Uuids.v7();
        assertThat(id.version()).isEqualTo(7);
        assertThat(id.variant()).isEqualTo(2);
    }

    @Test
    void carriesTheTimestampSoIdsSortByTime() {
        long millis = 1_795_000_000_000L;
        UUID earlier = Uuids.v7(millis);
        UUID later = Uuids.v7(millis + 1);

        assertThat(earlier.getMostSignificantBits() >>> 16).isEqualTo(millis);
        assertThat(earlier.toString().compareTo(later.toString())).isNegative();
    }
}
