package com.setupsworks.meno.modules.platform.service;

import java.time.Clock;

import com.setupsworks.meno.modules.platform.domain.PlatformUser;
import com.setupsworks.meno.modules.platform.repository.PlatformUserRepository;
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
 * Creates the first platform staff member, with every platform permission, from MENO_PLATFORM_BOOTSTRAP_* when no
 * staff exist (ADR-0020). Does nothing afterwards, so the password env var can be removed after the first start.
 */
@Component
class PlatformBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PlatformBootstrap.class);

    private final PlatformUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final PlatformProperties properties;
    private final Clock clock;
    private final TransactionTemplate tx;

    PlatformBootstrap(PlatformUserRepository users, PasswordEncoder passwordEncoder, PlatformProperties properties,
            Clock clock, PlatformTransactionManager transactionManager) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
        this.clock = clock;
        this.tx = new TransactionTemplate(transactionManager);
    }

    @Override
    public void run(ApplicationArguments args) {
        // Start-up has no signed-in user; platform_user is only visible to the platform realm or the system bypass.
        TenantContext.runAsSystem(() -> tx.executeWithoutResult(status -> bootstrap()));
    }

    private void bootstrap() {
        if (users.count() > 0) {
            return;
        }
        PlatformProperties.Bootstrap b = properties.bootstrap();
        if (b == null || !b.isConfigured()) {
            log.info("No platform staff yet. Set MENO_PLATFORM_BOOTSTRAP_EMAIL and MENO_PLATFORM_BOOTSTRAP_PASSWORD "
                    + "to create the first MENO admin.");
            return;
        }
        if (b.password().length() < properties.minPasswordLength()) {
            throw new IllegalStateException("MENO_PLATFORM_BOOTSTRAP_PASSWORD must be at least "
                    + properties.minPasswordLength() + " characters");
        }
        PlatformUser admin = users.save(new PlatformUser(b.email(), passwordEncoder.encode(b.password()),
                b.fullName(), clock.instant()));
        users.flush();
        users.grantAll(admin.getId());
        log.info("Created the first platform admin {}", admin.getId());
    }
}
