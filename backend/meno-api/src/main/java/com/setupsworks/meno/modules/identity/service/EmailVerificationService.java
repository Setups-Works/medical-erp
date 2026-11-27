package com.setupsworks.meno.modules.identity.service;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.common.crypto.OneTimeTokens;
import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.identity.api.EmailVerification;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.domain.Verification;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.identity.repository.VerificationRepository;
import com.setupsworks.meno.modules.notification.api.EmailSender;
import com.setupsworks.meno.modules.notification.api.EmailSender.OutgoingEmail;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
class EmailVerificationService implements EmailVerification {

    private final VerificationRepository verifications;
    private final AppUserRepository users;
    private final EmailSender emailSender;
    private final VerificationProperties properties;
    private final Clock clock;

    EmailVerificationService(VerificationRepository verifications, AppUserRepository users, EmailSender emailSender,
            VerificationProperties properties, Clock clock) {
        this.verifications = verifications;
        this.users = users;
        this.emailSender = emailSender;
        this.properties = properties;
        this.clock = clock;
    }

    /** New link for {@code user}; the email goes out only after the surrounding transaction commits. */
    void issue(AppUser user) {
        Instant now = clock.instant();
        String token = OneTimeTokens.newToken();
        verifications.save(new Verification(user.getTenantId(), user.getId(), Verification.Channel.EMAIL,
                OneTimeTokens.sha256Hex(token), now.plus(properties.emailTtl()), now));
        OutgoingEmail email = new OutgoingEmail(user.getEmail(), "Confirm your email for MENO", """
                Hello %s,

                Please confirm your email address for MENO by opening this link:

                %s%s

                The link works for %d hours. If you did not create a MENO account, ignore this email.
                """.formatted(user.getFullName(), properties.emailLinkBase(), token, properties.emailTtl().toHours()));
        afterCommit(() -> emailSender.send(email));
    }

    @Override
    @Transactional(noRollbackFor = MenoException.class)
    public void verify(String token) {
        Instant now = clock.instant();
        Verification verification = verifications.findByTokenHash(OneTimeTokens.sha256Hex(token))
                .filter(v -> !v.isConsumed())
                .orElseThrow(() -> new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_VERIFICATION_INVALID",
                        "This link is not valid. Ask for a new one."));
        if (verification.isExpired(now)) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_VERIFICATION_EXPIRED",
                    "This link has expired. Ask for a new one.");
        }
        verification.consume(now);
        users.findById(verification.getUserId()).ifPresent(u -> u.markEmailVerified(now));
    }

    @Override
    @Transactional
    public void resend(UUID userId) {
        AppUser user = users.findById(userId).orElseThrow(() -> new MenoException(HttpStatus.NOT_FOUND,
                "IDENTITY_USER_NOT_FOUND", "User not found."));
        if (user.isEmailVerified()) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_ALREADY_VERIFIED", "Your email is already confirmed.");
        }
        Instant now = clock.instant();
        verifications.findFirstByUserIdAndChannelOrderByCreatedAtDesc(userId, Verification.Channel.EMAIL)
                .filter(last -> last.getCreatedAt().plus(properties.resendCooldown()).isAfter(now))
                .ifPresent(last -> {
                    throw new MenoException(HttpStatus.TOO_MANY_REQUESTS, "IDENTITY_VERIFICATION_TOO_SOON",
                            "We just sent a link. Please wait a minute before asking again.");
                });
        // Only the newest link works.
        verifications.findByUserIdAndChannelAndConsumedAtIsNullOrderByCreatedAtDesc(userId, Verification.Channel.EMAIL)
                .forEach(v -> v.consume(now));
        issue(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Status status(UUID userId) {
        return users.findById(userId).map(u -> new Status(u.isEmailVerified(), u.isMobileVerified()))
                .orElseThrow(() -> new MenoException(HttpStatus.NOT_FOUND, "IDENTITY_USER_NOT_FOUND",
                        "User not found."));
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
