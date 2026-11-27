package com.setupsworks.meno.modules.identity.domain;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.common.crypto.OneTimeTokens;
import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/**
 * A one-time email link or SMS code. Single use, time-limited; only a hash is stored. SMS codes are short
 * (6 digits), so their hash is salted with the row id and wrong tries are counted ({@link #attempts}).
 */
@Entity
@Table(name = "verification")
public class Verification {

    public enum Channel { EMAIL, SMS }

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Channel channel;

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(nullable = false)
    private int attempts;

    @Version
    private long version;

    protected Verification() {
    }

    public Verification(UUID tenantId, UUID userId, Channel channel, String tokenHash, Instant expiresAt,
            Instant now) {
        this.id = Uuids.v7();
        this.tenantId = tenantId;
        this.userId = userId;
        this.channel = channel;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.createdAt = now;
        this.createdBy = userId;
    }

    /** New SMS code for {@code userId}; the hash is salted with this row's id so equal codes never collide. */
    public static Verification sms(UUID tenantId, UUID userId, String code, Instant expiresAt, Instant now) {
        Verification v = new Verification(tenantId, userId, Channel.SMS, "pending", expiresAt, now);
        v.tokenHash = v.codeHash(code);
        return v;
    }

    /** Constant-time check of an SMS code. */
    public boolean matchesCode(String code) {
        return MessageDigest.isEqual(tokenHash.getBytes(StandardCharsets.UTF_8),
                codeHash(code).getBytes(StandardCharsets.UTF_8));
    }

    public int recordWrongAttempt() {
        return ++attempts;
    }

    public int getAttempts() {
        return attempts;
    }

    private String codeHash(String code) {
        return OneTimeTokens.sha256Hex(id + ":" + code);
    }

    public boolean isUsable(Instant now) {
        return consumedAt == null && expiresAt.isAfter(now);
    }

    public boolean isExpired(Instant now) {
        return !expiresAt.isAfter(now);
    }

    public void consume(Instant now) {
        consumedAt = now;
    }

    public UUID getUserId() {
        return userId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public boolean isConsumed() {
        return consumedAt != null;
    }
}
