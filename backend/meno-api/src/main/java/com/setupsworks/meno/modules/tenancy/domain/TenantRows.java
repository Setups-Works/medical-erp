package com.setupsworks.meno.modules.tenancy.domain;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/** Small per-tenant key rows: settings and onboarding progress (composite keys, RLS on tenant_id). */
public final class TenantRows {

    private TenantRows() {
    }

    public record TenantKey(UUID tenantId, String key) implements Serializable {
    }

    @Entity
    @IdClass(TenantKey.class)
    @Table(name = "tenant_setting")
    public static class TenantSetting {
        @Id
        @Column(name = "tenant_id")
        private UUID tenantId;
        @Id
        private String key;
        @Column(nullable = false)
        private String value;
        @Column(name = "updated_at", nullable = false)
        private Instant updatedAt;
        @Column(name = "updated_by")
        private UUID updatedBy;
        @Version
        private long version;

        protected TenantSetting() {
        }

        public TenantSetting(UUID tenantId, String key) {
            this.tenantId = tenantId;
            this.key = key;
        }

        public void set(String value, UUID by, Instant now) {
            this.value = value;
            this.updatedBy = by;
            this.updatedAt = now;
        }

        public String getKey() {
            return key;
        }

        public String getValue() {
            return value;
        }
    }

    public record ProgressKey(UUID tenantId, String step) implements Serializable {
    }

    @Entity
    @IdClass(ProgressKey.class)
    @Table(name = "onboarding_progress")
    public static class OnboardingProgress {
        @Id
        @Column(name = "tenant_id")
        private UUID tenantId;
        @Id
        private String step;
        @Column(nullable = false)
        private String status;
        @Column(name = "updated_at", nullable = false)
        private Instant updatedAt;
        @Column(name = "updated_by")
        private UUID updatedBy;
        @Version
        private long version;

        protected OnboardingProgress() {
        }

        public OnboardingProgress(UUID tenantId, String step) {
            this.tenantId = tenantId;
            this.step = step;
        }

        public void mark(String status, UUID by, Instant now) {
            this.status = status;
            this.updatedBy = by;
            this.updatedAt = now;
        }

        public String getStep() {
            return step;
        }

        public String getStatus() {
            return status;
        }
    }
}
