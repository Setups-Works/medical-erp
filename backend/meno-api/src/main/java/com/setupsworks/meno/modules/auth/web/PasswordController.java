package com.setupsworks.meno.modules.auth.web;

import com.setupsworks.meno.modules.auth.service.PasswordResetService;
import com.setupsworks.meno.security.TenantContext;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Forgot / reset password (AUT-01). Contract: contracts/openapi/proposed/auth.yaml, used by the web screens. */
@RestController
@RequestMapping(path = "/api/v1/auth/password", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Password", description = "Forgot and reset password with a single-use emailed link.")
class PasswordController {

    private static final String PROBLEM = "application/problem+json";

    private final PasswordResetService passwordReset;

    PasswordController(PasswordResetService passwordReset) {
        this.passwordReset = passwordReset;
    }

    @Operation(summary = "Email a single-use reset link (AUT-01)",
            description = "Always 202, so it never reveals whether the email exists.")
    @SecurityRequirements
    @ApiResponse(responseCode = "202", description = "Accepted")
    @ApiResponse(responseCode = "429", description = "COMMON_RATE_LIMITED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/forgot")
    ResponseEntity<Void> forgot(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest http) {
        // Looks the user up by email before any tenant is known (RLS bypass, TenantContext).
        TenantContext.runAsSystem(() -> passwordReset.forgot(request.email(), SessionResponses.clientInfo(http).ip()));
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @Operation(summary = "Set a new password with the token from the email link",
            description = "Revokes all sessions. The minimum length comes from GET /auth/signup/options.")
    @SecurityRequirements
    @ApiResponse(responseCode = "204", description = "Password changed")
    @ApiResponse(responseCode = "400", description = "IDENTITY_PASSWORD_TOO_SHORT",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "410", description = "AUTH_RESET_TOKEN_INVALID (expired or already used)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/reset")
    ResponseEntity<Void> reset(@Valid @RequestBody ResetPasswordRequest request) {
        TenantContext.runAsSystem(() -> passwordReset.reset(request.token(), request.password()));
        return ResponseEntity.noContent().build();
    }

    record ForgotPasswordRequest(@NotBlank @Email @Size(max = 254) String email) {
    }

    record ResetPasswordRequest(@NotBlank @Size(max = 100) String token, @NotBlank @Size(max = 128) String password) {
    }
}
