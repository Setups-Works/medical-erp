package com.setupsworks.meno.modules.auth.web;

import com.setupsworks.meno.modules.identity.api.EmailVerification;
import com.setupsworks.meno.security.TenantContext;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Email verification for the /verify page (AUT-04, ONBOARDING.md step 2). */
@RestController
@RequestMapping(path = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Verification", description = "Confirm the owner's email with the one-time link.")
class VerificationController {

    private static final String PROBLEM = "application/problem+json";

    private final EmailVerification verification;

    VerificationController(EmailVerification verification) {
        this.verification = verification;
    }

    @Operation(summary = "Confirm an email with the token from the link",
            description = "Works without signing in (the link may be opened on another device). Single use, 24 h.")
    @SecurityRequirements
    @ApiResponse(responseCode = "204", description = "Email confirmed")
    @ApiResponse(responseCode = "400", description = "IDENTITY_VERIFICATION_INVALID, IDENTITY_VERIFICATION_EXPIRED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/verify-email")
    ResponseEntity<Void> verify(@Valid @RequestBody VerifyRequest request) {
        // The token identifies the user; there is no tenant in context yet.
        TenantContext.runAsSystem(() -> verification.verify(request.token()));
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Send a new verification link", description = "Older links stop working.")
    @ApiResponse(responseCode = "202", description = "Sent")
    @ApiResponse(responseCode = "409", description = "IDENTITY_ALREADY_VERIFIED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "429", description = "IDENTITY_VERIFICATION_TOO_SOON",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/verify-email/resend")
    ResponseEntity<Void> resend() {
        verification.resend(TenantContext.userId().orElseThrow());
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @Operation(summary = "Verification status of the signed-in user")
    @ApiResponse(responseCode = "200", description = "Status")
    @GetMapping("/verification")
    EmailVerification.Status status() {
        return verification.status(TenantContext.userId().orElseThrow());
    }

    record VerifyRequest(@NotBlank @Size(max = 100) String token) {
    }
}
