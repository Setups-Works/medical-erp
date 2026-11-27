package com.setupsworks.meno.modules.identity.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A role as seeded data (ADR-0014): code, label, and whether the Team step offers it. Read-only here; per-tenant
 * roles and their permissions are edited by PLT-07. Code still never checks a role name, only permissions.
 */
@Entity
@Table(name = "role")
public class RoleDefinition {

    @Id
    private String code;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private boolean invitable;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /** Holders see every branch (ROLES_AND_DASHBOARDS.md: Business Owner); everyone else only their user_branch rows. */
    @Column(name = "all_branches", nullable = false)
    private boolean allBranches;

    protected RoleDefinition() {
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public boolean isInvitable() {
        return invitable;
    }

    public boolean isAllBranches() {
        return allBranches;
    }

    public int getSortOrder() {
        return sortOrder;
    }
}
