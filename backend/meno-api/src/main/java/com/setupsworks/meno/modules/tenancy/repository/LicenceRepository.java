package com.setupsworks.meno.modules.tenancy.repository;

import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.Branch;
import com.setupsworks.meno.modules.tenancy.domain.Company;
import com.setupsworks.meno.modules.tenancy.domain.Licence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LicenceRepository extends JpaRepository<Licence, UUID> {
    List<Licence> findByTenantIdAndCompanyIdAndBranchIdIsNull(UUID tenantId, UUID companyId);
}
