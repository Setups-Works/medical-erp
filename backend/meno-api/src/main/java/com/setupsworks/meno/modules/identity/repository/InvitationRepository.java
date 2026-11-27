package com.setupsworks.meno.modules.identity.repository;

import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.identity.domain.Invitation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/** Every query names the tenant explicitly; RLS is the safety net (MULTI_TENANCY.md). */
public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    Page<Invitation> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    Optional<Invitation> findByIdAndTenantId(UUID id, UUID tenantId);

    /** The invitee's link, before any tenant is known (runs with the RLS bypass; the hash is unique). */
    Optional<Invitation> findByTokenHash(String tokenHash);

    boolean existsByTenantIdAndEmailAndStatus(UUID tenantId, String email, Invitation.Status status);

    boolean existsByTenantIdAndMobileAndStatus(UUID tenantId, String mobile, Invitation.Status status);
}
