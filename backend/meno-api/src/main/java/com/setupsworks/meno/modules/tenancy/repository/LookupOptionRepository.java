package com.setupsworks.meno.modules.tenancy.repository;

import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.ReferenceData;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LookupOptionRepository
        extends JpaRepository<ReferenceData.LookupOption, ReferenceData.OptionKey> {
    List<ReferenceData.LookupOption> findByActiveTrueOrderByListCodeAscSortOrderAsc();

    boolean existsByListCodeAndCodeAndActiveTrue(String listCode, String code);
}
