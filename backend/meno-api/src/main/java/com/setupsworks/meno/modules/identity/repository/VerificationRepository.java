package com.setupsworks.meno.modules.identity.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.identity.domain.Verification;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationRepository extends JpaRepository<Verification, UUID> {

    Optional<Verification> findByTokenHash(String tokenHash);

    List<Verification> findByUserIdAndChannelAndConsumedAtIsNullOrderByCreatedAtDesc(UUID userId,
            Verification.Channel channel);

    Optional<Verification> findFirstByUserIdAndChannelAndConsumedAtIsNullOrderByCreatedAtDesc(UUID userId,
            Verification.Channel channel);

    Optional<Verification> findFirstByUserIdAndChannelOrderByCreatedAtDesc(UUID userId, Verification.Channel channel);
}
