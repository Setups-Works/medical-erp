package com.setupsworks.meno.modules.tenancy.repository;

import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.Tenant;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    boolean existsByCode(String code);

    Optional<Tenant> findBySignupKey(UUID signupKey);
}
