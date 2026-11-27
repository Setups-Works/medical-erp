package com.setupsworks.meno.modules.identity.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.identity.domain.RoleDefinition;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * Roles a tenant can see: MENO's defaults (tenant_id null) plus its own. Every query names the tenant explicitly;
 * RLS is the safety net (MULTI_TENANCY.md).
 */
public interface RoleDefinitionRepository extends JpaRepository<RoleDefinition, String> {

    /** Defaults and the tenant's own roles that aren't archived, in display order. */
    @Query("""
            select r from RoleDefinition r
             where (r.tenantId is null or r.tenantId = :tenantId) and r.archivedAt is null
             order by r.sortOrder, lower(r.label)""")
    List<RoleDefinition> findVisible(UUID tenantId);

    /** Every role the tenant has ever seen, archived ones too: labels for history (old invitations). */
    @Query("""
            select r from RoleDefinition r where r.tenantId is null or r.tenantId = :tenantId
             order by r.sortOrder, lower(r.label)""")
    List<RoleDefinition> findAllForTenant(UUID tenantId);

    @Query("""
            select r from RoleDefinition r
             where r.code = :code and (r.tenantId is null or r.tenantId = :tenantId) and r.archivedAt is null""")
    Optional<RoleDefinition> findVisible(UUID tenantId, String code);

    /** Is the name taken by a default role or another of this tenant's live roles (case-insensitive)? */
    @Query("""
            select count(r) > 0 from RoleDefinition r
             where (r.tenantId is null or r.tenantId = :tenantId) and r.archivedAt is null
               and lower(r.label) = lower(:label) and r.code <> :exceptCode""")
    boolean labelTaken(UUID tenantId, String label, String exceptCode);
}
