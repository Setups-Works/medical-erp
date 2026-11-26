package com.setupsworks.meno.modules.auth.domain;

import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/**
 * One refresh token. Only the SHA-256 hash is stored. Tokens from the same login share a
 * {@code familyId}; reusing a rotated token revokes the whole family.
 */
@Entity
@Table(name = "refresh_token")
public class RefreshToken {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "family_id", nullable = false)
    private UUID familyId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "replaced_by_id")
    private UUID replacedById;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by_ip")
    private String createdByIp;

    @Column(name = "user_agent")
    private String userAgent;

    @Version
    private long version;

    protected RefreshToken() {
    }

    public RefreshToken(UUID userId, UUID tenantId, String tokenHash, UUID familyId, Instant expiresAt,
            Instant now, String createdByIp, String userAgent) {
        this.id = Uuids.v7();
        this.userId = userId;
        this.tenantId = tenantId;
        this.tokenHash = tokenHash;
        this.familyId = familyId;
        this.expiresAt = expiresAt;
        this.createdAt = now;
        this.createdByIp = createdByIp;
        this.userAgent = userAgent;
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }

    public boolean isExpired(Instant now) {
        return !expiresAt.isAfter(now);
    }

    public void rotateTo(UUID nextId, Instant now) {
        if (revokedAt == null) {
            revokedAt = now;
        }
        replacedById = nextId;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getFamilyId() {
        return familyId;
    }
}
