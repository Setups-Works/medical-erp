package com.setupsworks.meno.modules.tenancy.service;

import java.time.Clock;
import java.util.Locale;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.api.TenantFacade;
import com.setupsworks.meno.modules.tenancy.domain.Tenant;
import com.setupsworks.meno.modules.tenancy.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class TenantService implements TenantFacade {

    private static final int MAX_CODE_BASE = 40;

    private final TenantRepository tenants;
    private final Clock clock;

    TenantService(TenantRepository tenants, Clock clock) {
        this.tenants = tenants;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isActive(UUID tenantId) {
        return tenants.findById(tenantId).map(Tenant::isActive).orElse(false);
    }

    @Override
    @Transactional
    public UUID createTenant(String name) {
        return tenants.save(new Tenant(name, uniqueCodeFor(name), clock.instant())).getId();
    }

    /** "Sri Ram Medicals" → "sri-ram-medicals", then "-2", "-3"… if taken. */
    private String uniqueCodeFor(String name) {
        String base = name.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        if (base.isEmpty()) {
            base = "tenant";
        }
        if (base.length() > MAX_CODE_BASE) {
            base = base.substring(0, MAX_CODE_BASE);
        }
        String code = base;
        for (int i = 2; tenants.existsByCode(code); i++) {
            code = base + "-" + i;
        }
        return code;
    }
}
