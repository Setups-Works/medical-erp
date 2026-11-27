package com.setupsworks.meno.modules.platform.repository;

import java.util.List;

import com.setupsworks.meno.modules.platform.domain.ReferenceDataset;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReferenceDatasetRepository extends JpaRepository<ReferenceDataset, String> {

    List<ReferenceDataset> findAllByOrderBySortOrder();
}
