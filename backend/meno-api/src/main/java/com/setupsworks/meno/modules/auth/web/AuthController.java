package com.setupsworks.meno.modules.auth.web;

import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.modules.auth.service.AuthService;
import com.setupsworks.meno.security.JwtTokenService;
import com.setupsworks.meno.security.PermissionChecker;
import com.setupsworks.meno.security.TenantContext;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
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
@RequestMapping(path = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Auth", description = "Sign in, refresh, sign out. Errors are Problem Details with a `code`.")
class AuthController {

    private static final String PROBLEM = "application/problem+json";

    static final String REFRESH_COOKIE = SessionResponses.REFRESH_COOKIE;

    private final AuthService authService;
    private final SessionResponses responses;
    private final PermissionChecker permissions;

    AuthController(AuthService authService, SessionResponses responses, PermissionChecker permissions) {
        this.authService = authService;
        this.responses = responses;
        this.permissions = permissions;
    }

    @Operation(summary = "Sign in with email or mobile and password",
            description = "identifier is the email or the Indian mobile (10 digits, +91 optional). Returns a short-lived "
                    + "access token in the body and sets the meno_refresh HttpOnly cookie.")
    @SecurityRequirements
    @ApiResponse(responseCode = "200", description = "Signed in")
    @ApiResponse(responseCode = "400", description = "Invalid request body",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "401", description = "AUTH_INVALID_CREDENTIALS (same for unknown email or mobile)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "403", description = "AUTH_ACCOUNT_DISABLED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "423", description = "AUTH_LOCKED after too many wrong passwords",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/login")
    ResponseEntity<SessionResponses.TokenResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        // Login finds the user by email or mobile before the tenant is known (RLS bypass, TenantContext).
        return responses.withRefreshCookie(TenantContext.callAsSystem(
                () -> authService.login(request.identifier(), request.password(), SessionResponses.clientInfo(http))),
                HttpStatus.OK);
    }

    @Operation(summary = "Get a new access token",
            description = "Uses the meno_refresh cookie, rotates it and returns a new access token.")
    @SecurityRequirements
    @ApiResponse(responseCode = "200", description = "New tokens issued")
    @ApiResponse(responseCode = "401",
            description = "AUTH_REFRESH_INVALID, or AUTH_REFRESH_REUSED (whole session revoked)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/refresh")
    ResponseEntity<SessionResponses.TokenResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken, HttpServletRequest http) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw AuthService.invalidRefresh();
        }
        return responses.withRefreshCookie(TenantContext.callAsSystem(
                () -> authService.refresh(refreshToken, SessionResponses.clientInfo(http))), HttpStatus.OK);
    }

    @Operation(summary = "Sign out", description = "Revokes the session behind the meno_refresh cookie and clears it.")
    @SecurityRequirements
    @ApiResponse(responseCode = "204", description = "Signed out (also when already signed out)")
    @PostMapping("/logout")
    ResponseEntity<Void> logout(@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        TenantContext.runAsSystem(() -> authService.logout(refreshToken));
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, responses.clearedRefreshCookie().toString())
                .build();
    }

    @Operation(summary = "Sign out of all devices",
            description = "Revokes every session of the signed-in user (all browsers and devices) and clears the "
                    + "meno_refresh cookie. Access tokens already issued stop working when they expire (15 min).")
    @ApiResponse(responseCode = "204", description = "Signed out everywhere")
    @ApiResponse(responseCode = "401", description = "Missing, expired or invalid access token")
    @PostMapping("/logout-all")
    ResponseEntity<Void> logoutAll() {
        authService.logoutAll(TenantContext.userId().orElseThrow());
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, responses.clearedRefreshCookie().toString())
                .build();
    }

    @Operation(summary = "Who am I", description = "User, tenant and roles from the access token, and the "
            + "permissions those roles carry (the UI shows only what the person may do; the API still checks).")
    @ApiResponse(responseCode = "200", description = "Current user")
    @ApiResponse(responseCode = "401", description = "Missing, expired or invalid access token")
    @GetMapping("/me")
    MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        return new MeResponse(
                UUID.fromString(jwt.getSubject()),
                UUID.fromString(jwt.getClaimAsString(JwtTokenService.CLAIM_TENANT)),
                jwt.getClaimAsString(JwtTokenService.CLAIM_EMAIL),
                jwt.getClaimAsStringList(JwtTokenService.CLAIM_ROLES),
                permissions.currentPermissions());
    }

    /** identifier: email or Indian mobile. Its format is checked in identity, where a bad one looks like a wrong password. */
    record LoginRequest(
            @NotBlank @Size(max = 254) @Schema(example = "owner@example.com or 9876543210") String identifier,
            @NotBlank @Size(max = 128) String password) {
    }


    record MeResponse(UUID userId, UUID tenantId, String email, List<String> roles, List<String> permissions) {
    }
}
