package com.setupsworks.meno.modules.tenancy.repository;

import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.Company;
import com.setupsworks.meno.modules.tenancy.domain.FinancialYear;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialYearRepository extends JpaRepository<FinancialYear, UUID> {
    Optional<FinancialYear> findFirstByTenantIdAndCompanyIdOrderByStartDateDesc(UUID tenantId, UUID companyId);
}
