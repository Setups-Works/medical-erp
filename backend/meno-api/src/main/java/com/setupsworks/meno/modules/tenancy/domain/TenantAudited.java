package com.setupsworks.meno.modules.tenancy.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;

/** tenant_id + audit columns + optimistic lock (DATA_MODEL.md §1) for mutable tenant rows. */
@MappedSuperclass
public abstract class TenantAudited {

    @Column(name = "tenant_id", nullable = false, updatable = false)
    protected UUID tenantId;

    @Column(name = "created_at", nullable = false, updatable = false)
    protected Instant createdAt;

    @Column(name = "created_by", updatable = false)
    protected UUID createdBy;

    @Column(name = "updated_at", nullable = false)
    protected Instant updatedAt;

    @Column(name = "updated_by")
    protected UUID updatedBy;

    @Version
    protected long version;

    protected void created(UUID tenantId, UUID by, Instant now) {
        this.tenantId = tenantId;
        this.createdAt = now;
        this.createdBy = by;
        this.updatedAt = now;
        this.updatedBy = by;
    }

    public void touched(UUID by, Instant now) {
        this.updatedAt = now;
        this.updatedBy = by;
    }

    public UUID getTenantId() {
        return tenantId;
    }
}
