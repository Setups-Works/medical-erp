package com.setupsworks.meno.common.persistence;

import java.security.SecureRandom;
import java.time.Clock;
import java.util.UUID;

/**
 * UUIDv7 (RFC 9562): 48-bit Unix-millisecond timestamp + random bits. Time-ordered, so B-tree
 * indexes stay compact, and safe to generate offline on the desktop app (DATA_MODEL.md §1).
 */
public final class Uuids {

    private static final SecureRandom RANDOM = new SecureRandom();

    private Uuids() {
    }

    public static UUID v7() {
        return v7(Clock.systemUTC().millis());
    }

    static UUID v7(long epochMillis) {
        byte[] bytes = new byte[16];
        RANDOM.nextBytes(bytes);
        for (int i = 0; i < 6; i++) {
            bytes[i] = (byte) (epochMillis >>> (40 - 8 * i));
        }
        bytes[6] = (byte) ((bytes[6] & 0x0F) | 0x70); // version 7
        bytes[8] = (byte) ((bytes[8] & 0x3F) | 0x80); // IETF variant
        long msb = 0;
        long lsb = 0;
        for (int i = 0; i < 8; i++) {
            msb = (msb << 8) | (bytes[i] & 0xFF);
            lsb = (lsb << 8) | (bytes[i + 8] & 0xFF);
        }
        return new UUID(msb, lsb);
    }
}
