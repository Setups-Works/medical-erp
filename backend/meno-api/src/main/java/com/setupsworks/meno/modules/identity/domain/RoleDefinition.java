package com.setupsworks.meno.modules.identity.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/**
 * A role as data (ADR-0014). {@code tenantId} null = one of MENO's default roles, shared by every tenant; otherwise
 * the tenant's own role (PLT-07). Code never checks a role name, only permissions (role_permission / role_override).
 */
@Entity
@Table(name = "role")
public class RoleDefinition {

    /** Custom roles sort after the defaults; among themselves by label. */
    public static final int CUSTOM_SORT_ORDER = 1000;

    @Id
    private String code;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(nullable = false)
    private String label;

    @Column
    private String description;

    /** Offered on the Team step and assignable on /admin/users. Custom roles always are. */
    @Column(nullable = false)
    private boolean invitable;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /** Holders see every branch (ROLES_AND_DASHBOARDS.md: Business Owner); everyone else only their user_branch rows. */
    @Column(name = "all_branches", nullable = false)
    private boolean allBranches;

    /** Permissions can't be changed (the Business Owner always has all of them). */
    @Column(nullable = false)
    private boolean locked;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Version
    private long version;

    protected RoleDefinition() {
    }

    /** A tenant's own role. Branch-scoped and editable by definition (ck_role_custom_not_locked). */
    public static RoleDefinition custom(String code, UUID tenantId, String label, String description, UUID by,
            Instant now) {
        RoleDefinition r = new RoleDefinition();
        r.code = code;
        r.tenantId = tenantId;
        r.label = label;
        r.description = description;
        r.invitable = true;
        r.sortOrder = CUSTOM_SORT_ORDER;
        r.createdAt = now;
        r.createdBy = by;
        r.updatedAt = now;
        r.updatedBy = by;
        return r;
    }

    public void rename(String newLabel, String newDescription, UUID by, Instant now) {
        label = newLabel;
        description = newDescription;
        updatedBy = by;
        updatedAt = now;
    }

    /** Hidden from lists and pickers; people and invitations that carried it keep their history. */
    public void archive(UUID by, Instant now) {
        archivedAt = now;
        updatedBy = by;
        updatedAt = now;
    }

    public boolean isCustom() {
        return tenantId != null;
    }

    public boolean isArchived() {
        return archivedAt != null;
    }

    public String getCode() {
        return code;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public boolean isInvitable() {
        return invitable;
    }

    public boolean isAllBranches() {
        return allBranches;
    }

    public boolean isLocked() {
        return locked;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public long getVersion() {
        return version;
    }
}
