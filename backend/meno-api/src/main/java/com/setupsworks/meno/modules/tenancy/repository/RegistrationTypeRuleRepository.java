package com.setupsworks.meno.modules.tenancy.repository;

import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.ReferenceData;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistrationTypeRuleRepository extends JpaRepository<ReferenceData.RegistrationTypeRule, String> {
}
