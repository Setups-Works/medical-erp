package com.setupsworks.meno.modules.auth.web;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.setupsworks.meno.modules.auth.service.AuthService;
import com.setupsworks.meno.modules.auth.service.AuthService.AuthResult;
import com.setupsworks.meno.modules.auth.service.AuthService.ClientInfo;
import com.setupsworks.meno.security.JwtTokenService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
class AuthController {

    static final String REFRESH_COOKIE = "meno_refresh";
    private static final String COOKIE_PATH = "/api/v1/auth";
    private static final int MAX_USER_AGENT = 255;

    private final AuthService authService;

    AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        return withRefreshCookie(authService.login(request.email(), request.password(), clientInfo(http)));
    }

    @PostMapping("/refresh")
    ResponseEntity<TokenResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken, HttpServletRequest http) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw AuthService.invalidRefresh();
        }
        return withRefreshCookie(authService.refresh(refreshToken, clientInfo(http)));
    }

    @PostMapping("/logout")
    ResponseEntity<Void> logout(@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshCookie("", Duration.ZERO).toString())
                .build();
    }

    @GetMapping("/me")
    MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        return new MeResponse(
                UUID.fromString(jwt.getSubject()),
                UUID.fromString(jwt.getClaimAsString(JwtTokenService.CLAIM_TENANT)),
                jwt.getClaimAsString(JwtTokenService.CLAIM_EMAIL),
                jwt.getClaimAsStringList(JwtTokenService.CLAIM_ROLES));
    }

    private ResponseEntity<TokenResponse> withRefreshCookie(AuthResult result) {
        var account = result.account();
        TokenResponse body = new TokenResponse(result.accessToken().value(), "Bearer",
                result.accessToken().expiresInSeconds(),
                new UserView(account.userId(), account.tenantId(), account.email(), account.fullName(),
                        account.roles()));
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        refreshCookie(result.refreshToken(), authService.refreshTokenTtl()).toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(body);
    }

    private ResponseCookie refreshCookie(String value, Duration maxAge) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(authService.refreshCookieSecure())
                .sameSite("Strict")
                .path(COOKIE_PATH)
                .maxAge(maxAge)
                .build();
    }

    private static ClientInfo clientInfo(HttpServletRequest http) {
        String userAgent = http.getHeader(HttpHeaders.USER_AGENT);
        if (userAgent != null && userAgent.length() > MAX_USER_AGENT) {
            userAgent = userAgent.substring(0, MAX_USER_AGENT);
        }
        return new ClientInfo(http.getRemoteAddr(), userAgent);
    }

    record LoginRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 128) String password) {
    }

    record UserView(UUID id, UUID tenantId, String email, String fullName, Set<String> roles) {
    }

    record TokenResponse(String accessToken, String tokenType, long expiresIn, UserView user) {
    }

    record MeResponse(UUID userId, UUID tenantId, String email, List<String> roles) {
    }
}
