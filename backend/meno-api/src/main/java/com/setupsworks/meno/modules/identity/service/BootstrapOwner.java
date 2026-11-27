package com.setupsworks.meno.modules.identity.service;

import java.time.Clock;
import java.util.EnumSet;
import java.util.UUID;

import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.domain.Role;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.tenancy.api.TenantFacade;
import com.setupsworks.meno.security.TenantContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;


/**
 * Creates the first tenant and its OWNER on an empty database, from MENO_BOOTSTRAP_* env vars.
 * Does nothing once any user exists, so the password env var can be removed after first start.
 * Replaced by the tenant sign-up flow (PLT-01) later in P1.
 */
@Component
class BootstrapOwner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BootstrapOwner.class);

    private final AppUserRepository users;
    private final TenantFacade tenants;
    private final PasswordEncoder passwordEncoder;
    private final IdentityProperties properties;
    private final Clock clock;
    private final TransactionTemplate tx;

    BootstrapOwner(AppUserRepository users, TenantFacade tenants, PasswordEncoder passwordEncoder,
            IdentityProperties properties, Clock clock, PlatformTransactionManager transactionManager) {
        this.tx = new TransactionTemplate(transactionManager);
        this.users = users;
        this.tenants = tenants;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    public void run(ApplicationArguments args) {
        // No tenant exists yet: counting users and creating the first tenant must see past RLS.
        TenantContext.runAsSystem(() -> tx.executeWithoutResult(status -> bootstrap()));
    }

    private void bootstrap() {
        if (users.count() > 0) {
            return;
        }
        IdentityProperties.Bootstrap bootstrap = properties.bootstrap();
        if (bootstrap == null || !bootstrap.isConfigured()) {
            log.warn("No users exist yet. Set MENO_BOOTSTRAP_TENANT, MENO_BOOTSTRAP_EMAIL and "
                    + "MENO_BOOTSTRAP_PASSWORD to create the first owner.");
            return;
        }
        if (bootstrap.password().length() < properties.minPasswordLength()) {
            throw new IllegalStateException("MENO_BOOTSTRAP_PASSWORD must be at least "
                    + properties.minPasswordLength() + " characters");
        }
        UUID tenantId = tenants.createTenant(bootstrap.tenantName());
        AppUser owner = users.save(new AppUser(tenantId, bootstrap.email(),
                passwordEncoder.encode(bootstrap.password()), bootstrap.fullName(),
                EnumSet.of(Role.OWNER), clock.instant()));
        log.info("Created the first tenant {} and owner user {}", tenantId, owner.getId());
    }
}
