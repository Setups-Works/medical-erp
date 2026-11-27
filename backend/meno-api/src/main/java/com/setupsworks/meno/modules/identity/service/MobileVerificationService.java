package com.setupsworks.meno.modules.identity.service;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.identity.api.MobileVerification;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.domain.Verification;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.identity.repository.VerificationRepository;
import com.setupsworks.meno.modules.notification.api.SmsSender;
import com.setupsworks.meno.modules.notification.api.SmsSender.OutgoingSms;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
class MobileVerificationService implements MobileVerification {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final VerificationRepository verifications;
    private final AppUserRepository users;
    private final SmsSender smsSender;
    private final VerificationProperties properties;
    private final Clock clock;

    MobileVerificationService(VerificationRepository verifications, AppUserRepository users, SmsSender smsSender,
            VerificationProperties properties, Clock clock) {
        this.verifications = verifications;
        this.users = users;
        this.smsSender = smsSender;
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void send(UUID userId) {
        AppUser user = user(userId);
        if (user.isMobileVerified()) {
            throw alreadyVerified();
        }
        if (!smsSender.enabled()) {
            throw new MenoException(HttpStatus.SERVICE_UNAVAILABLE, "NOTIFICATION_CHANNEL_DISABLED",
                    "SMS verification isn't switched on yet. You can continue; we'll ask later.");
        }
        Instant now = clock.instant();
        verifications.findFirstByUserIdAndChannelOrderByCreatedAtDesc(userId, Verification.Channel.SMS)
                .filter(last -> last.getCreatedAt().plus(properties.smsResendCooldown()).isAfter(now))
                .ifPresent(last -> {
                    throw new MenoException(HttpStatus.TOO_MANY_REQUESTS, "IDENTITY_VERIFICATION_TOO_SOON",
                            "We just sent a code. Please wait %d seconds before asking again."
                                    .formatted(properties.smsResendCooldown().toSeconds()));
                });
        // Only the newest code works.
        verifications.findByUserIdAndChannelAndConsumedAtIsNullOrderByCreatedAtDesc(userId, Verification.Channel.SMS)
                .forEach(v -> v.consume(now));
        String code = "%06d".formatted(RANDOM.nextInt(1_000_000));
        verifications.save(Verification.sms(user.getTenantId(), userId, code, now.plus(properties.smsTtl()), now));
        OutgoingSms sms = new OutgoingSms(user.getMobile(), "%s is your MENO verification code. It works for %d minutes. Do not share it."
                .formatted(code, properties.smsTtl().toMinutes()));
        afterCommit(() -> smsSender.send(sms));
    }

    @Override
    // Wrong tries must be saved even though the request fails.
    @Transactional(noRollbackFor = MenoException.class)
    public void verify(UUID userId, String code) {
        AppUser user = user(userId);
        if (user.isMobileVerified()) {
            throw alreadyVerified();
        }
        Instant now = clock.instant();
        Verification current = verifications
                .findFirstByUserIdAndChannelAndConsumedAtIsNullOrderByCreatedAtDesc(userId, Verification.Channel.SMS)
                .orElseThrow(() -> new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_VERIFICATION_INVALID",
                        "Ask for a code first.").setProperty("attemptsLeft", 0));
        if (current.isExpired(now)) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_VERIFICATION_EXPIRED",
                    "This code has expired. Ask for a new one.");
        }
        int max = properties.smsMaxAttempts();
        if (current.getAttempts() >= max) {
            throw locked();
        }
        if (!current.matchesCode(code)) {
            int left = max - current.recordWrongAttempt();
            if (left <= 0) {
                current.consume(now);
                throw locked();
            }
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_VERIFICATION_INVALID",
                    "That code isn't right. Check the SMS and try again.").setProperty("attemptsLeft", left);
        }
        current.consume(now);
        user.markMobileVerified(now);
    }

    private AppUser user(UUID userId) {
        return users.findById(userId).orElseThrow(() -> new MenoException(HttpStatus.NOT_FOUND,
                "IDENTITY_USER_NOT_FOUND", "User not found."));
    }

    private static MenoException alreadyVerified() {
        return new MenoException(HttpStatus.CONFLICT, "IDENTITY_ALREADY_VERIFIED", "Your mobile is already verified.");
    }

    private static MenoException locked() {
        return new MenoException(HttpStatus.LOCKED, "IDENTITY_VERIFICATION_LOCKED",
                "Too many wrong codes. Ask for a new code.");
    }

    private static void afterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }
}
