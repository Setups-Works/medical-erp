package com.setupsworks.meno.modules.identity.api;

import java.time.Instant;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

/**
 * The invitee's side of a staff invitation (PLT-06, /invite?token=…): see who invited you, then join with your own
 * password. Called before any tenant is known (wrap in {@code TenantContext.callAsSystem}). Unknown, expired, used and
 * revoked links all answer 410 IDENTITY_INVITATION_INVALID, so a token can't be probed.
 */
public interface InvitationAcceptance {

    InvitationPreview preview(String token);

    /** Creates the user from the invitation (its role and branches) and returns the account to sign in. */
    LoginAccount accept(String token, Accept command);

    /** {@code contactMasked}: where the link was sent, partly hidden (a•••@shop.in, +91 98•••••210). */
    record InvitationPreview(
            @Schema(requiredMode = RequiredMode.REQUIRED) String businessName,
            @Schema(requiredMode = RequiredMode.REQUIRED) String roleName,
            List<String> branchNames,
            @Schema(requiredMode = RequiredMode.REQUIRED) String invitedByName,
            @Schema(requiredMode = RequiredMode.REQUIRED) String contactMasked,
            @Schema(requiredMode = RequiredMode.REQUIRED) Instant expiresAt,
            @Schema(requiredMode = RequiredMode.REQUIRED) int minPasswordLength) {
    }

    /** {@code mobile}: the 10 digits (stored +91…). */
    record Accept(String fullName, String mobile, String password) {
    }
}
