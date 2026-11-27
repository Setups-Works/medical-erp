package com.setupsworks.meno.modules.platform.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.modules.platform.service.PlatformAuthService;
import com.setupsworks.meno.security.PlatformAccess;
import com.setupsworks.meno.security.TenantContext;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/platform/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Platform", description = "MENO staff only (ADR-0020). Tenant tokens get 403 here.")
class PlatformAuthController {

    private static final String PROBLEM = "application/problem+json";

    private final PlatformAuthService auth;
    private final PlatformAccess access;

    PlatformAuthController(PlatformAuthService auth, PlatformAccess access) {
        this.auth = auth;
        this.access = access;
    }

    record PlatformLoginRequest(@NotBlank @Email @Size(max = 254) String email, @NotBlank @Size(max = 200) String password) {
    }

    record PlatformStaff(UUID id, String email, String fullName, List<String> permissions) {
    }

    record PlatformSession(String accessToken, String tokenType, long expiresIn, Instant expiresAt, PlatformStaff staff) {
    }

    @Operation(summary = "MENO staff sign-in",
            description = "Returns a platform access token (no refresh token: sign in again when it expires). "
                    + "Accepted only by /api/v1/platform/*.")
    @SecurityRequirements
    @ApiResponse(responseCode = "200", description = "Signed in")
    @ApiResponse(responseCode = "401", description = "PLATFORM_INVALID_CREDENTIALS",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "403", description = "PLATFORM_ACCOUNT_DISABLED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "423", description = "PLATFORM_LOCKED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/login")
    ResponseEntity<PlatformSession> platformLogin(@Valid @RequestBody PlatformLoginRequest request) {
        // Not signed in yet, and platform_user is visible only to the platform realm: look it up as system.
        PlatformAuthService.Session s = TenantContext.callAsSystem(() -> auth.login(request.email(), request.password()));
        return ResponseEntity.ok().header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(new PlatformSession(s.token().value(), "Bearer", s.token().expiresInSeconds(),
                        s.token().expiresAt(), view(s.staff())));
    }

    @Operation(summary = "The signed-in staff member and their permissions")
    @GetMapping("/me")
    PlatformStaff platformMe() {
        return view(auth.me(access.requireUserId(), access.currentPermissions()));
    }

    private static PlatformStaff view(PlatformAuthService.Staff s) {
        return new PlatformStaff(s.id(), s.email(), s.fullName(), s.permissions());
    }
}
