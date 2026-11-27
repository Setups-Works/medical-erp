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

    java.util.Optional<AppUser> findByIdAndTenantId(UUID id, UUID tenantId);

    /**
     * Active users of the tenant who hold {@code permission} through any of their roles. Used to keep at least one
     * person who can manage users (module rule 2) before a deactivation or role change commits.
     */
    @org.springframework.data.jpa.repository.Query(nativeQuery = true, value = """
            select count(distinct u.id) from app_user u
              join user_role ur on ur.user_id = u.id
              join role_permission rp on rp.role = ur.role
             where u.tenant_id = :tenantId and u.status = 'ACTIVE' and rp.permission_code = :permission""")
    long countActiveWithPermission(UUID tenantId, String permission);
}
