package com.setupsworks.meno.modules.identity.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/**
 * A staff invitation (AUT-09, PLT-06): who, how to reach them, which role and branches. Only the SHA-256 of the
 * link token is kept. "Expired" is derived (PENDING past {@code expiresAt}), so a resend revives it.
 */
@Entity
@Table(name = "invitation")
public class Invitation {

    public enum Status { PENDING, ACCEPTED, REVOKED }

    /** What the Team screen shows: PENDING splits into PENDING and EXPIRED. */
    public enum DisplayStatus { PENDING, EXPIRED, ACCEPTED, REVOKED }

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column
    private String email;

    /** E.164 (+91…). */
    @Column
    private String mobile;

    @Column(name = "role_code", nullable = false)
    private String roleCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "token_hash", nullable = false, columnDefinition = "bpchar(64)")
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    @Column(name = "send_count", nullable = false)
    private int sendCount;

    @Column(name = "accepted_user_id")
    private UUID acceptedUserId;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "created_by", updatable = false)
    private UUID createdBy;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Version
    private long version;

    /** Branches the person will work at; each row repeats tenant_id for RLS. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "invitation_branch", joinColumns = @JoinColumn(name = "invitation_id"))
    private Set<InvitationBranch> branches = new LinkedHashSet<>();

    protected Invitation() {
    }

    public Invitation(UUID tenantId, String fullName, String email, String mobileE164, String roleCode,
            Set<UUID> branchIds, String tokenHash, Duration ttl, UUID by, Instant now) {
        this.id = Uuids.v7();
        this.tenantId = tenantId;
        this.fullName = fullName;
        this.email = AppUser.normalizeEmail(email);
        this.mobile = mobileE164;
        this.roleCode = roleCode;
        this.status = Status.PENDING;
        this.tokenHash = tokenHash;
        this.sentAt = now;
        this.expiresAt = now.plus(ttl);
        this.sendCount = 1;
        branchIds.forEach(b -> branches.add(new InvitationBranch(tenantId, b)));
        this.createdAt = now;
        this.createdBy = by;
        this.updatedAt = now;
        this.updatedBy = by;
    }

    public boolean isPending() {
        return status == Status.PENDING;
    }

    public DisplayStatus displayStatus(Instant now) {
        return switch (status) {
            case ACCEPTED -> DisplayStatus.ACCEPTED;
            case REVOKED -> DisplayStatus.REVOKED;
            case PENDING -> expiresAt.isAfter(now) ? DisplayStatus.PENDING : DisplayStatus.EXPIRED;
        };
    }

    /** New link: the old token stops working and the expiry restarts. Only for PENDING (checked by the service). */
    public void resend(String newTokenHash, Duration ttl, UUID by, Instant now) {
        requirePending();
        tokenHash = newTokenHash;
        sentAt = now;
        expiresAt = now.plus(ttl);
        sendCount++;
        touched(by, now);
    }

    public void revoke(UUID by, Instant now) {
        requirePending();
        status = Status.REVOKED;
        revokedAt = now;
        touched(by, now);
    }

    /** The person opened the link and joined as {@code userId}; the link can't be used again. */
    public void accept(UUID userId, Instant now) {
        requirePending();
        status = Status.ACCEPTED;
        acceptedUserId = userId;
        acceptedAt = now;
        touched(userId, now);
    }

    public boolean isUsable(Instant now) {
        return status == Status.PENDING && expiresAt.isAfter(now);
    }

    private void requirePending() {
        if (status != Status.PENDING) {
            throw new IllegalStateException("Invitation " + id + " is " + status);
        }
    }

    private void touched(UUID by, Instant now) {
        updatedAt = now;
        updatedBy = by;
    }

    public UUID getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getMobile() {
        return mobile;
    }

    public String getRoleCode() {
        return roleCode;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public int getSendCount() {
        return sendCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public Set<UUID> getBranchIds() {
        Set<UUID> ids = new LinkedHashSet<>();
        branches.forEach(b -> ids.add(b.getBranchId()));
        return ids;
    }
}
