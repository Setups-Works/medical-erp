package com.setupsworks.meno.modules.identity.web;

import java.util.Set;
import java.util.UUID;

import com.setupsworks.meno.modules.identity.service.InvitationService;
import com.setupsworks.meno.modules.identity.service.InvitationService.TeamInvitationPage;
import com.setupsworks.meno.modules.identity.service.InvitationService.TeamInvitation;
import com.setupsworks.meno.modules.identity.service.InvitationService.NewInvitation;
import com.setupsworks.meno.modules.identity.service.InvitationService.TeamOptions;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Team: staff invitations (AUT-09 onboarding Team step; PLT-06 /admin/users later). Tenant from the token only.
 * Reads need {@code identity.invitation.view}, writes {@code identity.invitation.manage} (checked in the service).
 * The invitee's side (open / accept a link) is {@code /api/v1/invitations/{token}}, built with the /invite page.
 */
@RestController
@Validated
@RequestMapping(path = "/api/v1/team", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Team", description = "Invite staff with a role and branches; resend or revoke open invitations.")
class TeamController {

    private static final String NO_CONTROL = "[^\\p{Cntrl}]*";

    private final InvitationService invitations;

    TeamController(InvitationService invitations) {
        this.invitations = invitations;
    }

    @Operation(summary = "Roles that can be invited, the tenant's branches, and whether SMS delivery is set up")
    @GetMapping("/options")
    TeamOptions teamOptions() {
        return invitations.options();
    }

    @Operation(summary = "Invitations, newest first (page envelope)")
    @GetMapping("/invitations")
    TeamInvitationPage listInvitations(@RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "50") @Min(1) @Max(200) int size) {
        return invitations.list(page, size);
    }

    @Operation(summary = "Invite a person", description = "Email or mobile (or both), an invitable role and at least "
            + "one branch. The link is sent after the invitation is saved; it works for the configured number of days.")
    @ApiResponse(responseCode = "201", description = "Created and sent")
    @ApiResponse(responseCode = "400", description = "IDENTITY_INVITATION_CONTACT_REQUIRED, IDENTITY_ROLE_INVALID, "
            + "IDENTITY_INVITATION_BRANCH_INVALID, field errors")
    @ApiResponse(responseCode = "409", description = "IDENTITY_EMAIL_TAKEN, IDENTITY_MOBILE_TAKEN, "
            + "IDENTITY_INVITATION_PENDING")
    @ApiResponse(responseCode = "503", description = "NOTIFICATION_CHANNEL_DISABLED (mobile only, no SMS provider)")
    @PostMapping("/invitations")
    ResponseEntity<TeamInvitation> inviteStaff(@Valid @RequestBody TeamInvitationRequest r) {
        String mobile = r.mobile() == null || r.mobile().isBlank() ? null : "+91" + r.mobile();
        return ResponseEntity.status(HttpStatus.CREATED).body(invitations.invite(
                new NewInvitation(r.fullName(), r.email(), mobile, r.roleCode(), r.branchIds())));
    }

    @Operation(summary = "Send the invitation again with a new link (the old link stops working)")
    @ApiResponse(responseCode = "200", description = "Sent again")
    @ApiResponse(responseCode = "404", description = "IDENTITY_INVITATION_NOT_FOUND (also another tenant's id)")
    @ApiResponse(responseCode = "409", description = "IDENTITY_INVITATION_NOT_PENDING")
    @ApiResponse(responseCode = "429", description = "IDENTITY_INVITATION_TOO_SOON")
    @PostMapping("/invitations/{id}/resend")
    TeamInvitation resendInvitation(@PathVariable UUID id) {
        return invitations.resend(id);
    }

    @Operation(summary = "Revoke an open invitation (its link stops working; the record stays for audit)")
    @ApiResponse(responseCode = "200", description = "Revoked")
    @ApiResponse(responseCode = "404", description = "IDENTITY_INVITATION_NOT_FOUND (also another tenant's id)")
    @ApiResponse(responseCode = "409", description = "IDENTITY_INVITATION_NOT_PENDING")
    @PostMapping("/invitations/{id}/revoke")
    TeamInvitation revokeInvitation(@PathVariable UUID id) {
        return invitations.revoke(id);
    }

    /** {@code mobile}: the 10 digits (stored +91…), like the company phone. Email or mobile is checked in the service. */
    record TeamInvitationRequest(
            @NotBlank @Size(max = 100) @Pattern(regexp = NO_CONTROL) String fullName,
            @Email @Size(max = 254) String email,
            @Pattern(regexp = "|[6-9][0-9]{9}", message = "must be 10 digits starting with 6-9") String mobile,
            @NotBlank @Size(max = 50) String roleCode,
            @NotNull @NotEmpty @Size(max = 50) Set<@NotNull UUID> branchIds) {
    }
}
