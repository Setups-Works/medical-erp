package com.setupsworks.meno.modules.tenancy.repository;

import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.Company;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findFirstByTenantIdAndPrimaryTrue(UUID tenantId);
}
