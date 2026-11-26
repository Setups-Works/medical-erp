package com.setupsworks.meno.modules.tenancy.repository;

import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.Licence;
import com.setupsworks.meno.modules.tenancy.domain.ReferenceData;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessTypeLicenceRepository
        extends JpaRepository<ReferenceData.BusinessTypeLicence, ReferenceData.BusinessTypeLicenceKey> {
    List<ReferenceData.BusinessTypeLicence> findByBusinessType(String businessType);
}
