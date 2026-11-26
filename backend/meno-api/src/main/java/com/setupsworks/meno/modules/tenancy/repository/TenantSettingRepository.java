package com.setupsworks.meno.modules.tenancy.repository;

import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.TenantRows;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantSettingRepository extends JpaRepository<TenantRows.TenantSetting, TenantRows.TenantKey> {
    List<TenantRows.TenantSetting> findByTenantId(UUID tenantId);
}
