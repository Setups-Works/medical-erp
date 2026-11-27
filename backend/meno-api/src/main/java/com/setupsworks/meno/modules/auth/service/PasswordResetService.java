package com.setupsworks.meno.modules.auth.service;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.common.crypto.OneTimeTokens;
import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.auth.domain.PasswordReset;
import com.setupsworks.meno.modules.auth.repository.PasswordResetRepository;
import com.setupsworks.meno.modules.auth.repository.RefreshTokenRepository;
import com.setupsworks.meno.modules.identity.api.PasswordAccounts;
import com.setupsworks.meno.modules.identity.api.PasswordAccounts.ResetTarget;
import com.setupsworks.meno.modules.notification.api.EmailSender;
import com.setupsworks.meno.modules.notification.api.EmailSender.OutgoingEmail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Forgot / reset password (AUT-01, PAGES.md /forgot-password and /reset-password). The forgot answer is the same
 * whether or not the email exists, and the email is sent off the request thread after commit, so neither the
 * answer nor its timing reveals an account (auth module rule 2).
 */
@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final PasswordAccounts accounts;
    private final PasswordResetRepository resets;
    private final RefreshTokenRepository refreshTokens;
    private final EmailSender emailSender;
    private final PasswordResetProperties properties;
    private final Clock clock;

    PasswordResetService(PasswordAccounts accounts, PasswordResetRepository resets,
            RefreshTokenRepository refreshTokens, EmailSender emailSender, PasswordResetProperties properties,
            Clock clock) {
        this.accounts = accounts;
        this.resets = resets;
        this.refreshTokens = refreshTokens;
        this.emailSender = emailSender;
        this.properties = properties;
        this.clock = clock;
    }

    /** Always returns normally (the controller answers 202). */
    @Transactional
    public void forgot(String email, String clientIp) {
        ResetTarget target = accounts.findForReset(email).orElse(null);
        if (target == null) {
            return;
        }
        Instant now = clock.instant();
        boolean tooSoon = resets.findFirstByUserIdOrderByCreatedAtDesc(target.userId())
                .map(last -> last.getCreatedAt().plus(properties.cooldown()).isAfter(now))
                .orElse(false);
        if (tooSoon) {
            return;
        }
        // Only the newest link works.
        resets.findByUserIdAndUsedAtIsNull(target.userId()).forEach(r -> r.markUsed(now));
        String token = OneTimeTokens.newToken();
        resets.save(new PasswordReset(target.tenantId(), target.userId(), OneTimeTokens.sha256Hex(token),
                now.plus(properties.ttl()), clientIp, now));
        OutgoingEmail mail = new OutgoingEmail(target.email(), "Reset your MENO password", """
                Hello %s,

                Someone asked to reset the password of your MENO account. To choose a new password, open:

                %s%s

                The link works once and only for %d minutes. If you did not ask for this, ignore this email:
                your password stays the same.
                """.formatted(target.fullName(), properties.linkBase(), token, properties.ttl().toMinutes()));
        afterCommitInBackground(() -> emailSender.send(mail));
        log.info("Password reset link issued for user {}", target.userId());
    }

    /** New password from a valid link; every session of the user is ended. */
    @Transactional
    public void reset(String token, String newPassword) {
        Instant now = clock.instant();
        PasswordReset reset = resets.findByTokenHash(OneTimeTokens.sha256Hex(token))
                .filter(r -> r.isUsable(now))
                .orElseThrow(() -> new MenoException(HttpStatus.GONE, "AUTH_RESET_TOKEN_INVALID",
                        "This reset link has expired or was already used. Ask for a new one."));
        // Throws IDENTITY_PASSWORD_TOO_SHORT before anything changes, so the link still works for a retry.
        accounts.changePassword(reset.getUserId(), newPassword);
        reset.markUsed(now);
        int revoked = refreshTokens.revokeAllForUser(reset.getUserId(), now);
        log.info("Password reset for user {}; {} session(s) ended", reset.getUserId(), revoked);
    }

    private static void afterCommitInBackground(Runnable action) {
        Runnable async = () -> Thread.ofVirtual().name("password-reset-mail").start(action);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    async.run();
                }
            });
        } else {
            async.run();
        }
    }
}
