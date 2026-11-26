package com.setupsworks.meno.modules.auth.domain;

import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/** One reset link: single use, short-lived, only its hash stored (AUT-01). */
@Entity
@Table(name = "password_reset")
public class PasswordReset {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "requested_ip")
    private String requestedIp;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Version
    private long version;

    protected PasswordReset() {
    }

    public PasswordReset(UUID tenantId, UUID userId, String tokenHash, Instant expiresAt, String requestedIp,
            Instant now) {
        this.id = Uuids.v7();
        this.tenantId = tenantId;
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.requestedIp = requestedIp;
        this.createdAt = now;
    }

    public boolean isUsable(Instant now) {
        return usedAt == null && expiresAt.isAfter(now);
    }

    public void markUsed(Instant now) {
        usedAt = now;
    }

    public UUID getUserId() {
        return userId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
