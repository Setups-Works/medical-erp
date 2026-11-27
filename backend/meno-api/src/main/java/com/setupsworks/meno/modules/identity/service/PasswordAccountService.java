package com.setupsworks.meno.modules.identity.service;

import java.time.Clock;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.identity.api.PasswordAccounts;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class PasswordAccountService implements PasswordAccounts {

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final IdentityProperties properties;
    private final Clock clock;

    PasswordAccountService(AppUserRepository users, PasswordEncoder passwordEncoder, IdentityProperties properties,
            Clock clock) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ResetTarget> findForReset(String email) {
        return users.findByEmail(AppUser.normalizeEmail(email))
                .filter(AppUser::isActive)
                .map(u -> new ResetTarget(u.getId(), u.getTenantId(), u.getEmail(), u.getFullName()));
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, String rawPassword) {
        if (rawPassword == null || rawPassword.length() < properties.minPasswordLength()) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_PASSWORD_TOO_SHORT",
                    "Use at least " + properties.minPasswordLength() + " characters for the password.");
        }
        AppUser user = users.findById(userId).orElseThrow(() -> new MenoException(HttpStatus.NOT_FOUND,
                "IDENTITY_USER_NOT_FOUND", "User not found."));
        user.changePassword(passwordEncoder.encode(rawPassword), clock.instant());
    }
}
