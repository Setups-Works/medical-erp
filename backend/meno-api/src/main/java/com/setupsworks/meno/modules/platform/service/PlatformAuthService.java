package com.setupsworks.meno.modules.platform.service;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.platform.domain.PlatformUser;
import com.setupsworks.meno.modules.platform.repository.PlatformUserRepository;
import com.setupsworks.meno.security.JwtTokenService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** MENO staff sign-in (ADR-0020): email + password, lockout after repeated failures, a short platform-only token. */
@Service
public class PlatformAuthService {

    private static final Logger log = LoggerFactory.getLogger(PlatformAuthService.class);

    public record Staff(UUID id, String email, String fullName, List<String> permissions) {
    }

    public record Session(JwtTokenService.AccessToken token, Staff staff) {
    }

    private final PlatformUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService tokens;
    private final PlatformProperties properties;
    private final Clock clock;
    /** Checked for unknown emails so the response time doesn't reveal which staff accounts exist. */
    private final String dummyHash;

    PlatformAuthService(PlatformUserRepository users, PasswordEncoder passwordEncoder, JwtTokenService tokens,
            PlatformProperties properties, Clock clock) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.tokens = tokens;
        this.properties = properties;
        this.clock = clock;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    /** Runs under the system bypass (the caller isn't signed in yet); see the controller. */
    @Transactional(noRollbackFor = MenoException.class)
    public Session login(String email, String password) {
        Instant now = clock.instant();
        PlatformUser user = users.findByEmail(PlatformUser.normalizeEmail(email)).orElse(null);
        if (user == null) {
            passwordEncoder.matches(password, dummyHash);
            throw invalid();
        }
        if (user.isLocked(now)) {
            throw new MenoException(HttpStatus.LOCKED, "PLATFORM_LOCKED",
                    "Too many wrong passwords. Try again later.");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            user.recordFailedLogin(now, properties.maxFailedAttempts(), properties.lockDuration());
            log.warn("Failed platform sign-in for staff {}", user.getId());
            throw invalid();
        }
        if (!user.isActive()) {
            throw new MenoException(HttpStatus.FORBIDDEN, "PLATFORM_ACCOUNT_DISABLED",
                    "This account is switched off.");
        }
        user.recordSuccessfulLogin(now);
        List<String> permissions = users.permissionsOf(user.getId());
        log.info("Platform sign-in by staff {}", user.getId());
        Staff staff = new Staff(user.getId(), user.getEmail(), user.getFullName(), permissions);
        return new Session(tokens.issuePlatform(user.getId(), user.getEmail(), permissions,
                properties.accessTokenTtl()), staff);
    }

    @Transactional(readOnly = true)
    public Staff me(UUID id, List<String> permissions) {
        PlatformUser user = users.findById(id).filter(PlatformUser::isActive)
                .orElseThrow(() -> new MenoException(HttpStatus.UNAUTHORIZED, "COMMON_UNAUTHENTICATED",
                        "Please sign in."));
        return new Staff(user.getId(), user.getEmail(), user.getFullName(), permissions);
    }

    private static MenoException invalid() {
        return new MenoException(HttpStatus.UNAUTHORIZED, "PLATFORM_INVALID_CREDENTIALS",
                "Email or password is wrong.");
    }
}
