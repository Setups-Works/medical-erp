package com.setupsworks.meno.modules.identity.domain;

import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.Immutable;

/** A notice a user accepted, with its version and time. Append-only: never updated or deleted. */
@Entity
@Immutable
@Table(name = "consent")
public class Consent {

    public enum Kind { TERMS_AND_PRIVACY }

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Kind kind;

    @Column(nullable = false)
    private String version;

    @Column(name = "accepted_at", nullable = false)
    private Instant acceptedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by")
    private UUID createdBy;

    protected Consent() {
    }

    public Consent(UUID tenantId, UUID userId, Kind kind, String version, Instant now) {
        this.id = Uuids.v7();
        this.tenantId = tenantId;
        this.userId = userId;
        this.kind = kind;
        this.version = version;
        this.acceptedAt = now;
        this.createdAt = now;
        this.createdBy = userId;
    }
}
