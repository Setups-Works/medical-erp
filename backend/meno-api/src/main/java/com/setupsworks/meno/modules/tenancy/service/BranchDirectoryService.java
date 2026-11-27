package com.setupsworks.meno.modules.tenancy.service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.api.BranchDirectory;
import com.setupsworks.meno.modules.tenancy.domain.Branch;
import com.setupsworks.meno.modules.tenancy.repository.BranchRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class BranchDirectoryService implements BranchDirectory {

    private final BranchRepository branches;

    BranchDirectoryService(BranchRepository branches) {
        this.branches = branches;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BranchSummary> branches(UUID tenantId) {
        // Repository already orders by creation; a stable sort keeps that order behind the head office.
        return branches.findByTenantIdOrderByCreatedAtAsc(tenantId).stream()
                .sorted(Comparator.comparing((Branch b) -> !b.isHeadOffice()))
                .map(b -> new BranchSummary(b.getId(), b.details().name(), b.getCode(), b.isHeadOffice()))
                .toList();
    }
}
