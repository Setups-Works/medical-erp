package com.setupsworks.meno.modules.auth.web;

import com.setupsworks.meno.modules.identity.api.EmailVerification;
import com.setupsworks.meno.modules.identity.api.MobileVerification;
import com.setupsworks.meno.security.TenantContext;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

/** Email link and mobile OTP for the /verify page (AUT-04, ONBOARDING.md step 2). */
@RestController
@RequestMapping(path = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Verification", description = "Confirm the owner's email (one-time link) and mobile (SMS code).")
class VerificationController {

    private static final String PROBLEM = "application/problem+json";

    private final EmailVerification verification;
    private final MobileVerification mobile;

    VerificationController(EmailVerification verification, MobileVerification mobile) {
        this.verification = verification;
        this.mobile = mobile;
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

    @Operation(summary = "Send the 6-digit SMS code",
            description = "To the mobile the user signed up with. Works for 5 minutes; resend after 30 s; older codes stop working.")
    @ApiResponse(responseCode = "202", description = "Sent")
    @ApiResponse(responseCode = "409", description = "IDENTITY_ALREADY_VERIFIED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "429", description = "IDENTITY_VERIFICATION_TOO_SOON",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "503", description = "NOTIFICATION_CHANNEL_DISABLED (no SMS provider configured)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/verify-mobile/send")
    ResponseEntity<Void> sendMobileOtp() {
        mobile.send(TenantContext.userId().orElseThrow());
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @Operation(summary = "Confirm the SMS code", description = "3 tries per code; then ask for a new code.")
    @ApiResponse(responseCode = "204", description = "Mobile verified")
    @ApiResponse(responseCode = "400",
            description = "IDENTITY_VERIFICATION_INVALID (property attemptsLeft), IDENTITY_VERIFICATION_EXPIRED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "409", description = "IDENTITY_ALREADY_VERIFIED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "423", description = "IDENTITY_VERIFICATION_LOCKED after 3 wrong codes; send a new code",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/verify-mobile")
    ResponseEntity<Void> verifyMobile(@Valid @RequestBody VerifyMobileRequest request) {
        mobile.verify(TenantContext.userId().orElseThrow(), request.code());
        return ResponseEntity.noContent().build();
    }

    record VerifyMobileRequest(@NotBlank @Pattern(regexp = "^[0-9]{6}$", message = "Enter the 6-digit code.") String code) {
    }

    record VerifyRequest(@NotBlank @Size(max = 100) String token) {
    }
}
