package com.setupsworks.meno.modules.tenancy.repository;

import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.ReferenceData;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OnboardingStepRepository extends JpaRepository<ReferenceData.OnboardingStep, String> {
    List<ReferenceData.OnboardingStep> findAllByOrderBySortOrderAsc();
}
