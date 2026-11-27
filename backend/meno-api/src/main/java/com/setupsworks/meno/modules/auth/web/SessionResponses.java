package com.setupsworks.meno.modules.auth.web;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

import com.setupsworks.meno.modules.auth.service.AuthService;
import com.setupsworks.meno.modules.auth.service.AuthService.AuthResult;
import com.setupsworks.meno.modules.auth.service.AuthService.ClientInfo;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/** One place that turns a new session into the HTTP response (body + refresh cookie) for login, refresh and sign-up. */
@Component
class SessionResponses {

    static final String REFRESH_COOKIE = "meno_refresh";
    private static final String COOKIE_PATH = "/api/v1/auth";
    private static final int MAX_USER_AGENT = 255;

    private final AuthService authService;

    SessionResponses(AuthService authService) {
        this.authService = authService;
    }

    ResponseEntity<TokenResponse> withRefreshCookie(AuthResult result, HttpStatus status) {
        var account = result.account();
        TokenResponse body = new TokenResponse(result.accessToken().value(), "Bearer",
                result.accessToken().expiresInSeconds(),
                new UserView(account.userId(), account.tenantId(), account.email(), account.fullName(),
                        account.roles()));
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE,
                        refreshCookie(result.refreshToken(), authService.refreshTokenTtl()).toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(body);
    }

    ResponseCookie clearedRefreshCookie() {
        return refreshCookie("", Duration.ZERO);
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

    static ClientInfo clientInfo(HttpServletRequest http) {
        String userAgent = http.getHeader(HttpHeaders.USER_AGENT);
        if (userAgent != null && userAgent.length() > MAX_USER_AGENT) {
            userAgent = userAgent.substring(0, MAX_USER_AGENT);
        }
        return new ClientInfo(http.getRemoteAddr(), userAgent);
    }

    record UserView(UUID id, UUID tenantId, String email, String fullName, Set<String> roles) {
    }

    record TokenResponse(String accessToken, String tokenType, long expiresIn, UserView user) {
    }
}
