package com.setupsworks.meno.modules.identity.service;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.setupsworks.meno.modules.identity.api.CredentialCheck;
import com.setupsworks.meno.modules.identity.api.LoginAccount;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.domain.Role;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.tenancy.api.TenantFacade;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class CredentialService implements CredentialCheck {

    private static final Logger log = LoggerFactory.getLogger(CredentialService.class);

    private final AppUserRepository users;
    private final TenantFacade tenants;
    private final PasswordEncoder passwordEncoder;
    private final IdentityProperties properties;
    private final Clock clock;
    /** Checked when the email is unknown so the response time does not reveal which emails exist. */
    private final String dummyHash;

    CredentialService(AppUserRepository users, TenantFacade tenants, PasswordEncoder passwordEncoder,
            IdentityProperties properties, Clock clock) {
        this.users = users;
        this.tenants = tenants;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
        this.clock = clock;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @Override
    @Transactional
    public Result check(String email, String rawPassword) {
        Instant now = clock.instant();
        AppUser user = users.findByEmail(AppUser.normalizeEmail(email)).orElse(null);
        if (user == null) {
            passwordEncoder.matches(rawPassword, dummyHash);
            return new Result.InvalidCredentials();
        }
        if (user.isLocked(now)) {
            return new Result.Locked();
        }
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            user.recordFailedLogin(now, properties.maxFailedAttempts(), properties.lockDuration());
            log.info("Failed login for user {}", user.getId());
            return new Result.InvalidCredentials();
        }
        if (!user.isActive() || !tenants.isActive(user.getTenantId())) {
            return new Result.Disabled();
        }
        user.recordSuccessfulLogin(now);
        return new Result.Ok(toAccount(user));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LoginAccount> findSignInAllowed(UUID userId) {
        Instant now = clock.instant();
        return users.findById(userId)
                .filter(u -> u.isActive() && !u.isLocked(now) && tenants.isActive(u.getTenantId()))
                .map(CredentialService::toAccount);
    }

    static LoginAccount toAccount(AppUser user) {
        return new LoginAccount(user.getId(), user.getTenantId(), user.getEmail(), user.getFullName(),
                user.getRoles().stream().map(Role::name).collect(Collectors.toSet()));
    }
}
