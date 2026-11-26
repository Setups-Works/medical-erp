package com.setupsworks.meno.modules.identity.repository;

import java.util.UUID;

import com.setupsworks.meno.modules.identity.domain.Consent;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsentRepository extends JpaRepository<Consent, UUID> {

    long countByUserId(UUID userId);
}
