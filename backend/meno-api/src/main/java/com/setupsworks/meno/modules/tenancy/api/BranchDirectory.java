package com.setupsworks.meno.modules.tenancy.api;

import java.util.List;
import java.util.UUID;

/** Read-only branch list for other modules (identity's Team step picks the branches a person works at). */
public interface BranchDirectory {

    /** The tenant's branches, head office first, then in the order they were added. */
    List<BranchSummary> branches(UUID tenantId);

    record BranchSummary(UUID id, String name, String code, boolean headOffice) {
    }
}
