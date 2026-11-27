package com.setupsworks.meno.modules.tenancy.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.api.NewTenant;
import com.setupsworks.meno.modules.tenancy.api.StateView;
import com.setupsworks.meno.modules.tenancy.api.TenantFacade;
import com.setupsworks.meno.modules.tenancy.domain.State;
import com.setupsworks.meno.modules.tenancy.domain.Tenant;
import com.setupsworks.meno.modules.tenancy.repository.StateRepository;
import com.setupsworks.meno.modules.tenancy.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class TenantService implements TenantFacade {

    private static final int MAX_CODE_BASE = 40;

    private final TenantRepository tenants;
    private final StateRepository states;
    private final Clock clock;

    TenantService(TenantRepository tenants, StateRepository states, Clock clock) {
        this.tenants = tenants;
        this.states = states;
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

    @Override
    @Transactional
    public UUID createTenant(NewTenant request) {
        Tenant tenant = new Tenant(request.name(), uniqueCodeFor(request.name()), clock.instant());
        tenant.recordSignup(request.stateCode(), request.startOption(), request.partnerCode(), request.signupKey());
        return tenants.save(tenant).getId();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> findBySignupKey(UUID signupKey) {
        return tenants.findBySignupKey(signupKey).map(Tenant::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StateView> activeStates() {
        LocalDate today = LocalDate.now(clock);
        return states.findAllByOrderBySortOrderAsc().stream()
                .filter(s -> s.isActiveOn(today))
                .map(s -> new StateView(s.getCode(), s.getName(), s.getKind()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isActiveState(String code) {
        return code != null && states.findById(code).map(s -> s.isActiveOn(LocalDate.now(clock))).orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<String> displayName(UUID tenantId) {
        return tenants.findById(tenantId).map(Tenant::getName);
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
