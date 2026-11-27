package com.setupsworks.meno.modules.auth.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.auth.domain.PasswordReset;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, UUID> {

    Optional<PasswordReset> findByTokenHash(String tokenHash);

    List<PasswordReset> findByUserIdAndUsedAtIsNull(UUID userId);

    Optional<PasswordReset> findFirstByUserIdOrderByCreatedAtDesc(UUID userId);
}
