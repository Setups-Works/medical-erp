package com.setupsworks.meno.modules.auth.web;

import com.setupsworks.meno.modules.auth.service.AuthService;
import com.setupsworks.meno.modules.identity.api.InvitationAcceptance;
import com.setupsworks.meno.modules.identity.api.InvitationAcceptance.InvitationPreview;
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
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Accept invitation (PLT-06, /invite?token=…): public, because the invitee has no account yet. Joining signs the
 * person in exactly like login (access token in the body, refresh token in the meno_refresh cookie). Rate-limited per
 * IP (meno.rate-limit.rules.invitation-*).
 */
@RestController
@Validated
@RequestMapping(path = "/api/v1/invitations/{token}", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Invitations", description = "Open a staff invitation link and join the business.")
class InvitationController {

    private static final String PROBLEM = "application/problem+json";

    private final InvitationAcceptance invitations;
    private final AuthService authService;
    private final SessionResponses responses;

    InvitationController(InvitationAcceptance invitations, AuthService authService, SessionResponses responses) {
        this.invitations = invitations;
        this.authService = authService;
        this.responses = responses;
    }

    @Operation(summary = "Who invited you, to which business, with which role")
    @SecurityRequirements
    @ApiResponse(responseCode = "200", description = "Invitation")
    @ApiResponse(responseCode = "410", description = "IDENTITY_INVITATION_INVALID (unknown, expired, used or revoked: "
            + "one answer, so tokens can't be probed)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping
    InvitationPreview getInvitation(@PathVariable String token) {
        return TenantContext.callAsSystem(() -> invitations.preview(token));
    }

    @Operation(summary = "Join: create your account from the invitation and sign in",
            description = "Sets meno_refresh like login. The role and branches come from the invitation.")
    @SecurityRequirements
    @ApiResponse(responseCode = "200", description = "Joined and signed in (same body as login)")
    @ApiResponse(responseCode = "400", description = "Field errors, IDENTITY_PASSWORD_TOO_SHORT",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "409", description = "IDENTITY_EMAIL_TAKEN, IDENTITY_MOBILE_TAKEN, "
            + "IDENTITY_INVITATION_EMAIL_REQUIRED, IDENTITY_INVITATION_BRANCH_GONE",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "410", description = "IDENTITY_INVITATION_INVALID",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/accept")
    // No @Size on the token: an over-long one must get the same 410 as any other bad link (checked in identity).
    ResponseEntity<SessionResponses.TokenResponse> acceptInvitation(@PathVariable String token,
            @Valid @RequestBody AcceptInvitationRequest request, HttpServletRequest http) {
        // Before any tenant is known: the token decides which business (RLS bypass, TenantContext).
        var account = TenantContext.callAsSystem(() -> invitations.accept(token,
                new InvitationAcceptance.Accept(request.fullName(), request.mobile(), request.password())));
        var result = TenantContext.callAsSystem(
                () -> authService.startSession(account, SessionResponses.clientInfo(http)));
        return responses.withRefreshCookie(result, HttpStatus.OK);
    }

    /** Same field rules as sign-up (VALIDATION_AND_BUSINESS_RULES.md: names, phone). */
    record AcceptInvitationRequest(
            @NotBlank @Size(max = 100) @Pattern(regexp = "[^\\p{Cntrl}]*") String fullName,
            @NotBlank @Pattern(regexp = "[6-9][0-9]{9}", message = "must be 10 digits starting with 6-9") String mobile,
            @NotBlank @Size(max = 128) String password) {
    }
}
