package com.setupsworks.meno.modules.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.common.persistence.Uuids;
import com.setupsworks.meno.modules.auth.domain.RefreshToken;
import com.setupsworks.meno.modules.auth.repository.RefreshTokenRepository;
import com.setupsworks.meno.modules.identity.api.CredentialCheck;
import com.setupsworks.meno.modules.identity.api.LoginAccount;
import com.setupsworks.meno.security.JwtTokenService;
import com.setupsworks.meno.security.JwtTokenService.AccessToken;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Login, refresh-token rotation and logout. Failed logins and refresh-token reuse must be saved
 * even though the call ends in an error, hence {@code noRollbackFor = MenoException.class}.
 */
@Service
@Transactional(noRollbackFor = MenoException.class)
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CredentialCheck credentials;
    private final RefreshTokenRepository refreshTokens;
    private final JwtTokenService jwtTokenService;
    private final AuthProperties properties;
    private final Clock clock;

    public AuthService(CredentialCheck credentials, RefreshTokenRepository refreshTokens,
            JwtTokenService jwtTokenService, AuthProperties properties, Clock clock) {
        this.credentials = credentials;
        this.refreshTokens = refreshTokens;
        this.jwtTokenService = jwtTokenService;
        this.properties = properties;
        this.clock = clock;
    }

    public AuthResult login(String email, String password, ClientInfo client) {
        LoginAccount account = switch (credentials.check(email, password)) {
            case CredentialCheck.Result.Ok ok -> ok.account();
            case CredentialCheck.Result.InvalidCredentials ignored -> throw new MenoException(
                    HttpStatus.UNAUTHORIZED, "AUTH_INVALID_CREDENTIALS", "Email or password is wrong.");
            case CredentialCheck.Result.Locked ignored -> throw new MenoException(
                    HttpStatus.LOCKED, "AUTH_LOCKED", "Too many failed attempts. Try again later.");
            case CredentialCheck.Result.Disabled ignored -> throw new MenoException(
                    HttpStatus.FORBIDDEN, "AUTH_ACCOUNT_DISABLED", "This account is disabled.");
        };
        return issueTokens(account, Uuids.v7(), client, clock.instant());
    }

    /** Signs in an account that was just created and checked elsewhere (sign-up): new session family. */
    public AuthResult startSession(LoginAccount account, ClientInfo client) {
        return issueTokens(account, Uuids.v7(), client, clock.instant());
    }

    public AuthResult refresh(String rawRefreshToken, ClientInfo client) {
        Instant now = clock.instant();
        RefreshToken current = refreshTokens.findByTokenHash(hash(rawRefreshToken))
                .orElseThrow(AuthService::invalidRefresh);
        if (current.isRevoked()) {
            // A rotated token came back: assume it was stolen and end every session from that login.
            refreshTokens.revokeFamily(current.getFamilyId(), now);
            log.warn("Refresh token reuse detected for user {}; family {} revoked",
                    current.getUserId(), current.getFamilyId());
            throw new MenoException(HttpStatus.UNAUTHORIZED, "AUTH_REFRESH_REUSED",
                    "Session expired. Please sign in again.");
        }
        if (current.isExpired(now)) {
            throw invalidRefresh();
        }
        LoginAccount account = credentials.findSignInAllowed(current.getUserId()).orElse(null);
        if (account == null) {
            refreshTokens.revokeFamily(current.getFamilyId(), now);
            throw invalidRefresh();
        }
        AuthResult result = issueTokens(account, current.getFamilyId(), client, now);
        current.rotateTo(result.refreshTokenId(), now);
        return result;
    }

    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        refreshTokens.findByTokenHash(hash(rawRefreshToken))
                .ifPresent(token -> refreshTokens.revokeFamily(token.getFamilyId(), clock.instant()));
    }

    public Duration refreshTokenTtl() {
        return properties.refreshTokenTtl();
    }

    public boolean refreshCookieSecure() {
        return properties.refreshCookieSecure();
    }

    private AuthResult issueTokens(LoginAccount account, UUID familyId, ClientInfo client, Instant now) {
        List<String> roles = account.roles().stream().sorted().toList();
        AccessToken access = jwtTokenService.issue(account.userId(), account.tenantId(), account.email(), roles);

        String rawRefresh = newRawToken();
        Instant refreshExpiresAt = now.plus(properties.refreshTokenTtl());
        RefreshToken refresh = refreshTokens.save(new RefreshToken(account.userId(), account.tenantId(),
                hash(rawRefresh), familyId, refreshExpiresAt, now, client.ip(), client.userAgent()));

        return new AuthResult(access, rawRefresh, refresh.getId(), refreshExpiresAt, account);
    }

    private static String newRawToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public static MenoException invalidRefresh() {
        return new MenoException(HttpStatus.UNAUTHORIZED, "AUTH_REFRESH_INVALID",
                "Session expired. Please sign in again.");
    }

    public record ClientInfo(String ip, String userAgent) {
    }

    public record AuthResult(AccessToken accessToken, String refreshToken, UUID refreshTokenId,
            Instant refreshExpiresAt, LoginAccount account) {
    }
}
