package com.setupsworks.meno.modules.identity.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.identity.domain.AppUser;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    /** Login lookup across tenants (one email = one user). Needs an RLS exemption when RLS lands (#7). */
    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Login by mobile (E.164); unique like email (ux_app_user_mobile). Same RLS exemption as findByEmail. */
    Optional<AppUser> findByMobile(String mobile);

    boolean existsByMobile(String mobile);

    List<AppUser> findByTenantId(UUID tenantId);
}
