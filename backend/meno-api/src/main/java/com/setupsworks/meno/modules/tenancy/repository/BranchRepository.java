package com.setupsworks.meno.modules.tenancy.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.Branch;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BranchRepository extends JpaRepository<Branch, UUID> {
    List<Branch> findByTenantIdOrderByCreatedAtAsc(UUID tenantId);

    Optional<Branch> findByIdAndTenantId(UUID id, UUID tenantId);

    boolean existsByTenantIdAndCode(UUID tenantId, String code);
}
