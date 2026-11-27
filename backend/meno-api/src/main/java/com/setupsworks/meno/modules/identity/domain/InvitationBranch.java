package com.setupsworks.meno.modules.identity.domain;

import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** One row of invitation_branch. tenant_id is repeated so the row has its own RLS policy and tenant index. */
@Embeddable
public class InvitationBranch {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    protected InvitationBranch() {
    }

    InvitationBranch(UUID tenantId, UUID branchId) {
        this.tenantId = tenantId;
        this.branchId = branchId;
    }

    public UUID getBranchId() {
        return branchId;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof InvitationBranch other && Objects.equals(branchId, other.branchId)
                && Objects.equals(tenantId, other.tenantId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tenantId, branchId);
    }
}
