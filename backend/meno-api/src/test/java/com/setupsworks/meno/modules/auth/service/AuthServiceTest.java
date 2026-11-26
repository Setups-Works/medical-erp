package com.setupsworks.meno.modules.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.gen.ECKeyGenerator;
import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.auth.domain.RefreshToken;
import com.setupsworks.meno.modules.auth.repository.RefreshTokenRepository;
import com.setupsworks.meno.modules.identity.api.CredentialCheck;
import com.setupsworks.meno.modules.identity.api.LoginAccount;
import com.setupsworks.meno.security.JwtProperties;
import com.setupsworks.meno.security.JwtTokenService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

class AuthServiceTest {

    private static final Instant NOW = Instant.parse("2026-11-26T10:00:00Z");

    private final Clock clock = Clock.fixed(NOW, ZoneOffset.UTC);
    private final CredentialCheck credentials = mock(CredentialCheck.class);
    private final RefreshTokenRepository refreshTokens = mock(RefreshTokenRepository.class);
    private final AuthService.ClientInfo client = new AuthService.ClientInfo("127.0.0.1", "junit");
    private final LoginAccount account = new LoginAccount(UUID.randomUUID(), UUID.randomUUID(),
            "owner@test.local", "Owner", Set.of("OWNER"));

    private AuthService service;

    @BeforeEach
    void setUp() throws Exception {
        var key = new ECKeyGenerator(Curve.P_256).keyID("test").generate();
        var jwtProps = new JwtProperties("meno", "test", Duration.ofMinutes(15), null, null, true);
        var jwt = new JwtTokenService(new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key))), jwtProps, clock);
        service = new AuthService(credentials, refreshTokens, jwt, new AuthProperties(Duration.ofDays(30), false),
                clock);

        when(credentials.check("owner@test.local", "right-pass")).thenReturn(new CredentialCheck.Result.Ok(account));
        when(credentials.findSignInAllowed(account.userId())).thenReturn(Optional.of(account));
        when(refreshTokens.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void loginIssuesAccessAndRefreshTokens() {
        var result = service.login("owner@test.local", "right-pass", client);

        assertThat(result.accessToken().value()).isNotBlank();
        assertThat(result.accessToken().expiresInSeconds()).isEqualTo(900);
        assertThat(result.refreshToken()).hasSizeGreaterThan(40);
        assertThat(result.refreshExpiresAt()).isEqualTo(NOW.plus(Duration.ofDays(30)));
    }

    @Test
    void credentialOutcomesMapToStableErrorCodes() {
        when(credentials.check(anyString(), anyString())).thenReturn(new CredentialCheck.Result.InvalidCredentials());
        assertError(() -> service.login("a@b.c", "x", client), HttpStatus.UNAUTHORIZED, "AUTH_INVALID_CREDENTIALS");

        when(credentials.check(anyString(), anyString())).thenReturn(new CredentialCheck.Result.Locked());
        assertError(() -> service.login("a@b.c", "x", client), HttpStatus.LOCKED, "AUTH_LOCKED");

        when(credentials.check(anyString(), anyString())).thenReturn(new CredentialCheck.Result.Disabled());
        assertError(() -> service.login("a@b.c", "x", client), HttpStatus.FORBIDDEN, "AUTH_ACCOUNT_DISABLED");
    }

    @Test
    void refreshRotatesTheToken() {
        var login = service.login("owner@test.local", "right-pass", client);
        RefreshToken stored = storedToken(login);

        var refreshed = service.refresh(login.refreshToken(), client);

        assertThat(refreshed.refreshToken()).isNotEqualTo(login.refreshToken());
        assertThat(stored.isRevoked()).isTrue();
        verify(refreshTokens, never()).revokeFamily(any(), any());
    }

    @Test
    void reusingARotatedTokenRevokesTheWholeFamily() {
        var login = service.login("owner@test.local", "right-pass", client);
        RefreshToken stored = storedToken(login);
        stored.rotateTo(UUID.randomUUID(), NOW);

        assertError(() -> service.refresh(login.refreshToken(), client), HttpStatus.UNAUTHORIZED,
                "AUTH_REFRESH_REUSED");
        verify(refreshTokens).revokeFamily(stored.getFamilyId(), NOW);
    }

    @Test
    void refreshForADisabledUserRevokesTheFamily() {
        var login = service.login("owner@test.local", "right-pass", client);
        RefreshToken stored = storedToken(login);
        when(credentials.findSignInAllowed(account.userId())).thenReturn(Optional.empty());

        assertError(() -> service.refresh(login.refreshToken(), client), HttpStatus.UNAUTHORIZED,
                "AUTH_REFRESH_INVALID");
        verify(refreshTokens).revokeFamily(stored.getFamilyId(), NOW);
    }

    private RefreshToken storedToken(AuthService.AuthResult login) {
        String hash = AuthService.hash(login.refreshToken());
        RefreshToken token = new RefreshToken(account.userId(), account.tenantId(), hash, UUID.randomUUID(),
                NOW.plus(Duration.ofDays(30)), NOW, null, null);
        when(refreshTokens.findByTokenHash(hash)).thenReturn(Optional.of(token));
        return token;
    }

    private static void assertError(Runnable call, HttpStatus status, String code) {
        assertThatThrownBy(call::run).isInstanceOfSatisfying(MenoException.class, e -> {
            assertThat(e.status()).isEqualTo(status);
            assertThat(e.code()).isEqualTo(code);
        });
    }
}
