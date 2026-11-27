package com.setupsworks.meno.modules.identity.repository;

import java.util.List;

import com.setupsworks.meno.modules.identity.domain.RoleDefinition;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleDefinitionRepository extends JpaRepository<RoleDefinition, String> {

    List<RoleDefinition> findByInvitableTrueOrderBySortOrderAsc();

    List<RoleDefinition> findAllByOrderBySortOrderAsc();
}
